"""Build the typed catalog JSON used by the shop pages.

Reads the Stage 2 inventory. Does not fetch the network.
"""

import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog"
OUT = ROOT / "src" / "data" / "catalog"
PUBLIC_TEXT = ROOT / "public" / "catalog" / "descriptions"
PLACEHOLDER = "/assets/catalog/image-unavailable.webp"
TAG = re.compile(r"<[^>]+>")


def plain(value: str) -> str:
    text = html.unescape(TAG.sub(" ", value or ""))
    return " ".join(text.split())


def money(raw: str, minor: int):
    if raw is None or raw == "":
        return None
    return int(raw) / (10 ** minor)


def main() -> None:
    products = [
        json.loads(line)
        for line in (CATALOG / "products.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    descriptions = {
        item["id"]: item
        for item in (
            json.loads(line)
            for line in (CATALOG / "descriptions.jsonl").read_text(encoding="utf-8").splitlines()
            if line.strip()
        )
    }
    categories = json.loads((CATALOG / "categories.json").read_text(encoding="utf-8"))
    membership = json.loads((CATALOG / "category-products.json").read_text(encoding="utf-8"))
    image_rows = [
        json.loads(line)
        for line in (CATALOG / "image-map.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    product_images: dict[int, dict[int, str]] = {}
    category_images: dict[str, str] = {}
    for row in image_rows:
        if row.get("status") != "ok" or not row.get("public_path"):
            continue
        if row.get("kind") == "product" and row.get("product_id") is not None:
            product_images.setdefault(int(row["product_id"]), {})[int(row.get("index") or 0)] = row["public_path"]
        elif row.get("kind") == "category" and row.get("slug"):
            category_images[row["slug"]] = row["public_path"]

    categories_by_product: dict[int, list[int]] = {}
    for category_id, product_ids in membership.items():
        for product_id in product_ids:
            categories_by_product.setdefault(int(product_id), []).append(int(category_id))

    imported_at = datetime.now(timezone.utc).isoformat()
    catalog_products = []
    PUBLIC_TEXT.mkdir(parents=True, exist_ok=True)
    for product in products:
        minor = int(product.get("currency_minor_unit") or 2)
        price = money(product.get("price") or "", minor)
        regular = money(product.get("regular_price") or "", minor)
        on_sale = bool(product.get("on_sale")) and price is not None and regular is not None and regular > price
        images = [product_images.get(product["id"], {}).get(index) for index in sorted(product_images.get(product["id"], {}))]
        images = [path for path in images if path]
        if not images:
            images = [PLACEHOLDER]
        description = (descriptions.get(product["id"]) or {}).get("description") or ""
        short = (descriptions.get(product["id"]) or {}).get("short_description") or ""
        search = " ".join(part for part in (product["name"], product.get("sku") or "", short, description[:500]) if part)
        catalog_products.append(
            {
                "id": product["id"],
                "slug": product["slug"],
                "name": product["name"],
                "sku": product.get("sku") or "",
                "price": price,
                "regularPrice": regular if on_sale else None,
                "onSale": on_sale,
                "inStock": bool(product.get("is_in_stock")),
                "images": images,
                "categoryIds": sorted(set(categories_by_product.get(product["id"], []))),
                "search": " ".join(search.lower().split()),
            }
        )
        (PUBLIC_TEXT / f"{product['id']}.json").write_text(
            json.dumps({"description": description, "shortDescription": short}, ensure_ascii=False),
            encoding="utf-8",
        )

    catalog_categories = []
    for category in categories:
        slug = category["slug"]
        catalog_categories.append(
            {
                "id": category["id"],
                "name": plain(category.get("name") or ""),
                "slug": slug,
                "parentId": category.get("parent") or 0,
                "description": plain(category.get("description") or ""),
                "image": category_images.get(slug),
                "productIds": membership.get(str(category["id"]), []),
            }
        )

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "products.json").write_text(
        json.dumps({"importedAt": imported_at, "products": catalog_products}, ensure_ascii=False),
        encoding="utf-8",
    )
    (OUT / "categories.json").write_text(
        json.dumps({"importedAt": imported_at, "categories": catalog_categories}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"products {len(catalog_products)} categories {len(catalog_categories)}")


if __name__ == "__main__":
    main()
