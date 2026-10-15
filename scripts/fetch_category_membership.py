"""Record product IDs returned by each public category filter.

The product list's categories field omits some assignments. The category
filter is the source used for the inventory's product-to-category map.
"""

import json
import time
import urllib.request
from pathlib import Path

BASE = "https://suzukipartsusa.com"
UA = "SuzukiPartsUSA-catalog-audit/1.0 (local redesign inventory)"
ROOT = Path(__file__).resolve().parents[1] / "catalog"
OUT = ROOT / "category-products.json"
PAUSE = 0.3


def fetch(path: str):
    request = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        headers = {key.lower(): value for key, value in response.headers.items()}
        return json.loads(response.read().decode("utf-8")), headers


def main() -> None:
    categories = json.loads((ROOT / "categories.json").read_text(encoding="utf-8"))
    membership = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    for category in categories:
        key = str(category["id"])
        if key in membership:
            print("skip", category["slug"])
            continue
        ids = []
        page = 1
        while True:
            data, headers = fetch(
                f"/wp-json/wc/store/v1/products?category={category['id']}&per_page=100&page={page}"
            )
            ids.extend(item["id"] for item in data)
            total_pages = int(headers.get("x-wp-totalpages") or 1)
            if page >= total_pages or not data:
                break
            page += 1
            time.sleep(PAUSE)
        membership[key] = ids
        OUT.write_text(json.dumps(membership), encoding="utf-8")
        print(category["slug"], len(ids), "reported", category.get("count"))
        time.sleep(PAUSE)
    print("categories mapped", len(membership))


if __name__ == "__main__":
    main()
