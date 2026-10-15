"""Compare store category filters with the indexed product list."""

import json
import time
import urllib.request
from pathlib import Path

BASE = "https://suzukipartsusa.com"
UA = "SuzukiPartsUSA-catalog-audit/1.0 (local redesign inventory)"
ROOT = Path(__file__).resolve().parents[1] / "catalog"


def fetch(path: str):
    request = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        headers = {key.lower(): value for key, value in response.headers.items()}
        return json.loads(response.read().decode("utf-8")), headers


def category_ids(category_id: int) -> list[int]:
    found = []
    page = 1
    while True:
        data, headers = fetch(
            f"/wp-json/wc/store/v1/products?category={category_id}&per_page=100&page={page}"
        )
        found.extend(item["id"] for item in data)
        total_pages = int(headers.get("x-wp-totalpages") or 1)
        total = headers.get("x-wp-total")
        print(category_id, "page", page, "total", total, "got", len(data))
        if page >= total_pages or not data:
            break
        page += 1
        time.sleep(0.3)
    return found


indexed = [
    json.loads(line)
    for line in (ROOT / "products.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
indexed_ids = {product["id"] for product in indexed}

data, _headers = fetch("/wp-json/wc/store/v1/products?category=2999&per_page=100")
indexed_by_id = {product["id"]: product for product in indexed}
print("other suzuki parts membership")
for product in data:
    stored = [item["slug"] for item in indexed_by_id[product["id"]]["categories"]]
    live = [item["slug"] for item in product.get("categories") or []]
    print(product["id"], product["name"][:60])
    print("  stored", stored)
    print("  live  ", live)
