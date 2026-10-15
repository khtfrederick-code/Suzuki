"""Download catalog copy and product images from the public Store API.

Resumable. Skips files already recorded as successful. Does not invent
missing images or descriptions.
"""

import html
import json
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path

from PIL import Image

BASE = "https://suzukipartsusa.com"
UA = "SuzukiPartsUSA-catalog-import/1.0 (local redesign; product images)"
ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog"
PUBLIC = ROOT / "public" / "assets" / "catalog"
PRODUCTS_PATH = CATALOG / "products.jsonl"
CATEGORIES_PATH = CATALOG / "categories.json"
DESCRIPTIONS_PATH = CATALOG / "descriptions.jsonl"
IMAGE_MAP_PATH = CATALOG / "image-map.jsonl"
REPORT_PATH = CATALOG / "import-report.json"
PLACEHOLDER = PUBLIC / "image-unavailable.webp"
MAX_EDGE = 1400
WORKERS = 4
PAUSE_SECONDS = 0.2
MAX_ATTEMPTS = 4
write_lock = threading.Lock()
rate_lock = threading.Lock()
next_request_at = 0.0


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.skip = True
        if tag in {"p", "br", "li", "div", "h1", "h2", "h3", "h4", "tr"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"script", "style"}:
            self.skip = False
        if tag in {"p", "li", "div", "h1", "h2", "h3", "h4", "tr"}:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_to_text(value: str) -> str:
    parser = TextExtractor()
    parser.feed(html.unescape(value or ""))
    lines = [" ".join(part.split()) for part in "".join(parser.parts).splitlines()]
    return "\n".join(line for line in lines if line).strip()


def fetch_bytes(url: str) -> bytes:
    global next_request_at
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    last_error = "unknown error"
    for attempt in range(1, MAX_ATTEMPTS + 1):
        with rate_lock:
            wait = next_request_at - time.monotonic()
            next_request_at = max(next_request_at, time.monotonic()) + PAUSE_SECONDS
        if wait > 0:
            time.sleep(wait)
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            last_error = f"HTTP {error.code} {error.reason}"
            if error.code not in {429, 500, 502, 503, 504}:
                break
        except Exception as error:
            last_error = f"{type(error).__name__}: {error}"
        time.sleep(PAUSE_SECONDS * attempt * 2)
    raise RuntimeError(last_error)


def fetch_json(path: str):
    body = fetch_bytes(BASE + path)
    return json.loads(body.decode("utf-8"))


def append_jsonl(path: Path, record: dict) -> None:
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with write_lock:
        with path.open("a", encoding="utf-8") as handle:
            handle.write(line)


def load_products() -> list[dict]:
    return [
        json.loads(line)
        for line in PRODUCTS_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def import_descriptions(products: list[dict]) -> dict:
    have = set()
    if DESCRIPTIONS_PATH.exists():
        for line in DESCRIPTIONS_PATH.read_text(encoding="utf-8").splitlines():
            if line.strip():
                have.add(json.loads(line)["id"])
    missing = [product["id"] for product in products if product["id"] not in have]
    pages = (len(products) + 99) // 100
    if missing:
        print(f"descriptions missing {len(missing)}; reading {pages} catalog pages", flush=True)
        for page in range(1, pages + 1):
            data = fetch_json(f"/wp-json/wc/store/v1/products?per_page=100&page={page}")
            for product in data:
                if product.get("id") in have:
                    continue
                record = {
                    "id": product.get("id"),
                    "description": html_to_text(product.get("description") or ""),
                    "short_description": html_to_text(product.get("short_description") or ""),
                    "retrieved_at": datetime.now(timezone.utc).isoformat(),
                }
                append_jsonl(DESCRIPTIONS_PATH, record)
                have.add(record["id"])
            print(f"descriptions page {page}/{pages}, stored {len(have)}", flush=True)
    stored = []
    if DESCRIPTIONS_PATH.exists():
        stored = [
            json.loads(line)
            for line in DESCRIPTIONS_PATH.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
    by_id = {item["id"]: item for item in stored}
    empty = [product_id for product_id, item in by_id.items() if not item["description"] and not item["short_description"]]
    return {
        "descriptions_stored": len(by_id),
        "descriptions_empty": len(empty),
        "empty_description_ids": empty,
    }


def completed_sources() -> set[str]:
    done = set()
    if not IMAGE_MAP_PATH.exists():
        return done
    for line in IMAGE_MAP_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if row.get("status") == "ok" and row.get("file") and Path(row["file"]).exists():
            done.add(row["source"])
    return done


def to_webp(raw: bytes, destination: Path) -> int:
    with Image.open(BytesIO(raw)) as image:
        image = image.convert("RGB")
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=78, method=6)
    return destination.stat().st_size


def ensure_placeholder() -> None:
    if PLACEHOLDER.exists():
        return
    PLACEHOLDER.parent.mkdir(parents=True, exist_ok=True)
    canvas = Image.new("RGB", (800, 600), "#f4f7fb")
    canvas.save(PLACEHOLDER, "WEBP", quality=70, method=4)


def download_one(job: dict) -> dict:
    destination = Path(job["file"])
    try:
        raw = fetch_bytes(job["source"])
        size = to_webp(raw, destination)
        return {**job, "status": "ok", "bytes": size, "error": ""}
    except Exception as error:
        return {**job, "status": "failed", "bytes": 0, "error": str(error)}


def product_jobs(products: list[dict], done: set[str]) -> list[dict]:
    jobs = []
    for product in products:
        slug = product["slug"] or str(product["id"])
        for index, image in enumerate(product["images"]):
            source = image.get("src")
            if not source or source in done:
                continue
            folder = PUBLIC / "products" / str(product["id"])[:3]
            filename = f"{product['id']}-{index}-{slug[:48]}.webp"
            path = folder / filename
            jobs.append(
                {
                    "kind": "product",
                    "product_id": product["id"],
                    "slug": slug,
                    "index": index,
                    "source": source,
                    "alt": image.get("alt") or "",
                    "file": str(path),
                    "public_path": "/" + path.relative_to(ROOT / "public").as_posix(),
                }
            )
    return jobs


def category_jobs(done: set[str]) -> list[dict]:
    categories = json.loads(CATEGORIES_PATH.read_text(encoding="utf-8"))
    jobs = []
    for category in categories:
        image = category.get("image")
        source = image.get("src") if isinstance(image, dict) else None
        if not source or source in done:
            continue
        path = PUBLIC / "categories" / f"{category['slug']}.webp"
        jobs.append(
            {
                "kind": "category",
                "product_id": None,
                "category_id": category["id"],
                "slug": category["slug"],
                "index": 0,
                "source": source,
                "alt": category.get("name") or "",
                "file": str(path),
                "public_path": "/" + path.relative_to(ROOT / "public").as_posix(),
            }
        )
    return jobs


def import_images(products: list[dict]) -> dict:
    ensure_placeholder()
    done = completed_sources()
    jobs = product_jobs(products, done) + category_jobs(done)
    print(f"images already stored {len(done)}; remaining {len(jobs)}", flush=True)
    ok = 0
    failed = 0
    failures = []
    if jobs:
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            futures = [pool.submit(download_one, job) for job in jobs]
            for finished, future in enumerate(as_completed(futures), start=1):
                result = future.result()
                result["retrieved_at"] = datetime.now(timezone.utc).isoformat()
                append_jsonl(IMAGE_MAP_PATH, result)
                if result["status"] == "ok":
                    ok += 1
                else:
                    failed += 1
                    failures.append(
                        {
                            "kind": result["kind"],
                            "id": result.get("product_id") or result.get("category_id"),
                            "source": result["source"],
                            "error": result["error"],
                        }
                    )
                if finished % 25 == 0 or finished == len(jobs):
                    print(f"images {finished}/{len(jobs)} ok {ok} failed {failed}", flush=True)
    recorded_missing = set()
    if IMAGE_MAP_PATH.exists():
        for line in IMAGE_MAP_PATH.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("status") == "missing-source":
                recorded_missing.add(row.get("product_id"))
    missing_source = []
    for product in products:
        if product["images"]:
            continue
        missing_source.append(product["id"])
        if product["id"] in recorded_missing:
            continue
        append_jsonl(
            IMAGE_MAP_PATH,
            {
                "kind": "product",
                "product_id": product["id"],
                "slug": product["slug"],
                "index": 0,
                "source": "",
                "alt": "",
                "file": str(PLACEHOLDER),
                "public_path": "/assets/catalog/image-unavailable.webp",
                "status": "missing-source",
                "bytes": 0,
                "error": "Store API returned no product image",
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    return {
        "images_downloaded_this_run": ok,
        "images_failed_this_run": failed,
        "failures": failures,
        "products_with_no_source_image": missing_source,
    }


def main() -> None:
    CATALOG.mkdir(parents=True, exist_ok=True)
    products = load_products()
    description_report = import_descriptions(products)
    image_report = import_images(products)
    done = completed_sources()
    report = {
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "products_in_index": len(products),
        "source_image_urls": sum(len(product["images"]) for product in products),
        "local_images_ok": len(done),
        **description_report,
        **image_report,
        "placeholder": "/assets/catalog/image-unavailable.webp",
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "failures"}, indent=2))


if __name__ == "__main__":
    main()
