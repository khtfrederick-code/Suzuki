"""Download the public gallery photos and write src/data/gallery.json.

Uses the photos published at https://suzukipartsusa.com/gallery/.
Does not invent images.
"""

import html
import io
import json
import re
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public" / "assets" / "gallery"
DATA = ROOT / "src" / "data" / "gallery.json"
PAGE = "https://suzukipartsusa.com/gallery/"
MAX_EDGE = 1600
GENERIC_ALT = "Customer photo from the Suzuki Parts USA gallery"
FILEISH = re.compile(r"^(img|image|snapchat|suz\d|fa\d|f1b|eh1|a38a|[0-9])", re.I)


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "SuzukiPartsUSA-catalog-import/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def alt_text(title: str) -> str:
    cleaned = html.unescape(title).strip()
    if not cleaned or FILEISH.match(cleaned) or re.search(r"\d{6,}", cleaned):
        return GENERIC_ALT
    if " " in cleaned and re.search(r"[A-Za-z]{3,}", cleaned):
        return cleaned
    return GENERIC_ALT


def widest(tag: str) -> tuple[str, str]:
    srcset = re.search(r'srcset="([^"]+)"', tag)
    href = re.search(r'href="([^"]+)"', tag)
    title = re.search(r'title="([^"]*)"', tag)
    best = href.group(1) if href else ""
    width = 0
    if srcset:
        for part in srcset.group(1).split(","):
            bits = part.strip().split(" ")
            if len(bits) >= 2 and bits[1].endswith("w"):
                size = int(bits[1][:-1])
                if size > width:
                    width = size
                    best = bits[0]
    if not best:
        raise SystemExit(f"gallery item has no image: {tag[:180]}")
    return best, alt_text(title.group(1) if title else "")


def main() -> None:
    page = fetch(PAGE).decode("utf-8", "replace")
    items = re.findall(r'<li class="isotope-item">(.*?)</li>', page, flags=re.I | re.S)
    if len(items) != 24:
        raise SystemExit(f"expected 24 gallery photos, found {len(items)}")
    if "Send us an email with some of your best shots" not in html.unescape(page):
        raise SystemExit("gallery invitation text was not on the source page")

    DEST.mkdir(parents=True, exist_ok=True)
    photos = []
    for index, item in enumerate(items, start=1):
        url, alt = widest(item)
        raw = fetch(html.unescape(url))
        image = Image.open(io.BytesIO(raw))
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        filename = f"{index:02d}.webp"
        image.save(DEST / filename, "WEBP", quality=78, method=6)
        photos.append(
            {
                "src": f"/assets/gallery/{filename}",
                "width": image.width,
                "height": image.height,
                "alt": alt,
            }
        )
        print(index, image.width, image.height, alt)

    DATA.write_text(json.dumps({"photos": photos}, indent=2) + "\n", encoding="utf-8")
    print("wrote", DATA)


if __name__ == "__main__":
    main()
