"""Build a resumable inventory of the public Suzuki Parts USA catalog.

Uses the public WooCommerce Store API only. Does not download images.
"""

import html
import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://suzukipartsusa.com"
UA = "SuzukiPartsUSA-catalog-audit/1.0 (local redesign inventory)"
ROOT = Path(__file__).resolve().parents[1] / "catalog"
STATE_PATH = ROOT / "audit-state.json"
PRODUCTS_PATH = ROOT / "products.jsonl"
CATEGORIES_PATH = ROOT / "categories.json"
SUMMARY_PATH = ROOT / "reconciliation.json"
PER_PAGE = 100
PAUSE_SECONDS = 0.35
MAX_ATTEMPTS = 4


def fetch_json(path: str):
    request = urllib.request.Request(
        BASE + path,
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                headers = {key.lower(): value for key, value in response.headers.items()}
                data = json.loads(response.read().decode("utf-8"))
                return data, headers
        except urllib.error.HTTPError as error:
            last_error = f"HTTP {error.code} {error.reason}"
            if error.code not in (429, 500, 502, 503, 504):
                raise
        except Exception as error:
            last_error = f"{type(error).__name__}: {error}"
        time.sleep(PAUSE_SECONDS * attempt * 2)
    raise RuntimeError(f"Failed {path}: {last_error}")


def text_of(value: str) -> str:
    cleaned = html.unescape(value or "")
    cleaned = cleaned.replace("\xa0", " ")
    return " ".join(cleaned.split())


def slim_product(product: dict) -> dict:
    prices = product.get("prices") or {}
    images = product.get("images") or []
    categories = product.get("categories") or []
    attributes = product.get("attributes") or []
    variations = product.get("variations") or []
    description = text_of(product.get("description") or "")
    short = text_of(product.get("short_description") or "")
    return {
        "id": product.get("id"),
        "name": text_of(product.get("name") or ""),
        "slug": product.get("slug"),
        "sku": product.get("sku") or "",
        "type": product.get("type"),
        "parent": product.get("parent") or 0,
        "permalink": product.get("permalink"),
        "on_sale": bool(product.get("on_sale")),
        "currency": prices.get("currency_code") or prices.get("currency_symbol") or "",
        "currency_minor_unit": prices.get("currency_minor_unit"),
        "price": prices.get("price") or "",
        "regular_price": prices.get("regular_price") or "",
        "sale_price": prices.get("sale_price") or "",
        "price_range": prices.get("price_range") or None,
        "is_in_stock": product.get("is_in_stock"),
        "is_purchasable": product.get("is_purchasable"),
        "has_options": bool(product.get("has_options")),
        "variation_count": len(variations),
        "variation_ids": [item.get("id") for item in variations if isinstance(item, dict)],
        "attributes": [
            {
                "name": text_of(item.get("name") or ""),
                "terms": [text_of(term.get("name") or "") for term in item.get("terms") or []],
            }
            for item in attributes
            if isinstance(item, dict)
        ],
        "categories": [
            {"id": item.get("id"), "name": text_of(item.get("name") or ""), "slug": item.get("slug")}
            for item in categories
            if isinstance(item, dict)
        ],
        "tags": [text_of(item.get("name") or "") for item in product.get("tags") or [] if isinstance(item, dict)],
        "image_count": len(images),
        "images": [
            {"src": item.get("src"), "thumbnail": item.get("thumbnail"), "alt": text_of(item.get("alt") or "")}
            for item in images
            if isinstance(item, dict) and item.get("src")
        ],
        "has_description": bool(description),
        "description_length": len(description),
        "short_description": short,
        "average_rating": product.get("average_rating"),
        "review_count": product.get("review_count"),
    }


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"completed_pages": [], "failures": []}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def existing_ids() -> set[int]:
    found = set()
    if not PRODUCTS_PATH.exists():
        return found
    for line in PRODUCTS_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        found.add(json.loads(line)["id"])
    return found


def fetch_categories() -> list[dict]:
    categories = []
    page = 1
    while True:
        data, headers = fetch_json(f"/wp-json/wc/store/v1/products/categories?per_page=100&page={page}")
        if not data:
            break
        categories.extend(data)
        total_pages = int(headers.get("x-wp-totalpages") or 1)
        print(f"categories page {page}/{total_pages}: {len(data)}")
        if page >= total_pages:
            break
        page += 1
        time.sleep(PAUSE_SECONDS)
    return categories


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    retrieved_at = datetime.now(timezone.utc).isoformat()
    categories = fetch_categories()
    CATEGORIES_PATH.write_text(json.dumps(categories, indent=2), encoding="utf-8")

    probe, probe_headers = fetch_json("/wp-json/wc/store/v1/products?per_page=1")
    total = int(probe_headers.get("x-wp-total") or 0)
    total_pages = int(probe_headers.get("x-wp-totalpages") or 0)
    if PER_PAGE != 1:
        total_pages = (total + PER_PAGE - 1) // PER_PAGE
    print(f"products reported: {total}, pages at {PER_PAGE}: {total_pages}")

    state = load_state()
    seen = existing_ids()
    with PRODUCTS_PATH.open("a", encoding="utf-8") as handle:
        for page in range(1, total_pages + 1):
            if page in state["completed_pages"]:
                print(f"skip page {page}")
                continue
            try:
                data, _headers = fetch_json(
                    f"/wp-json/wc/store/v1/products?per_page={PER_PAGE}&page={page}"
                )
            except Exception as error:
                failure = {"page": page, "error": str(error), "at": retrieved_at}
                state["failures"].append(failure)
                save_state(state)
                print("FAILED", failure)
                continue
            added = 0
            for product in data:
                slim = slim_product(product)
                if slim["id"] in seen:
                    continue
                seen.add(slim["id"])
                handle.write(json.dumps(slim, ensure_ascii=False) + "\n")
                added += 1
            handle.flush()
            state["completed_pages"].append(page)
            state["reported_total"] = total
            state["retrieved_at"] = retrieved_at
            save_state(state)
            print(f"page {page}/{total_pages}: received {len(data)}, new {added}, unique {len(seen)}")
            time.sleep(PAUSE_SECONDS)

    products = [json.loads(line) for line in PRODUCTS_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]
    by_parent = {}
    for category in categories:
        by_parent.setdefault(category.get("parent") or 0, []).append(category["id"])
    top_level = [category for category in categories if not category.get("parent")]
    missing_images = [item["id"] for item in products if not item["images"]]
    missing_prices = [item["id"] for item in products if not item["price"]]
    missing_descriptions = [item["id"] for item in products if not item["has_description"]]
    missing_sku = [item["id"] for item in products if not item["sku"]]
    variable = [item["id"] for item in products if item["has_options"] or item["variation_count"]]
    category_counts = {category["id"]: 0 for category in categories}
    for product in products:
        for category in product["categories"]:
            category_counts[category["id"]] = category_counts.get(category["id"], 0) + 1
    count_mismatches = []
    for category in categories:
        assigned = category_counts.get(category["id"], 0)
        reported = category.get("count") or 0
        if assigned != reported:
            count_mismatches.append(
                {
                    "id": category["id"],
                    "name": text_of(category.get("name") or ""),
                    "slug": category.get("slug"),
                    "reported_count": reported,
                    "products_assigned": assigned,
                }
            )
    summary = {
        "retrieved_at": retrieved_at,
        "source": BASE,
        "endpoint": "/wp-json/wc/store/v1/products",
        "products_reported_by_store": total,
        "unique_products_indexed": len(products),
        "product_pages_completed": sorted(state["completed_pages"]),
        "product_page_failures": state["failures"],
        "categories_discovered": len(categories),
        "top_level_categories": len(top_level),
        "child_categories": len(categories) - len(top_level),
        "products_missing_images": len(missing_images),
        "products_missing_prices": len(missing_prices),
        "products_missing_descriptions": len(missing_descriptions),
        "products_missing_sku": len(missing_sku),
        "products_with_options_or_variations": len(variable),
        "category_count_mismatches": count_mismatches,
        "top_level": [
            {
                "id": category["id"],
                "name": text_of(category.get("name") or ""),
                "slug": category.get("slug"),
                "count": category.get("count"),
                "child_ids": by_parent.get(category["id"], []),
            }
            for category in sorted(top_level, key=lambda item: text_of(item.get("name") or "").lower())
        ],
    }
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({key: summary[key] for key in summary if key != "top_level" and key != "category_count_mismatches"}, indent=2))
    print("mismatches", len(count_mismatches))


if __name__ == "__main__":
    main()
