"""Explain category-count gaps and write a nested category tree."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "catalog"
categories = json.loads((ROOT / "categories.json").read_text(encoding="utf-8"))
products = [
    json.loads(line)
    for line in (ROOT / "products.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]

by_id = {category["id"]: category for category in categories}
children = {}
for category in categories:
    children.setdefault(category.get("parent") or 0, []).append(category["id"])

direct = {}
for product in products:
    for category in product["categories"]:
        direct[category["id"]] = direct.get(category["id"], 0) + 1


def descendant_ids(category_id: int) -> set[int]:
    found = set()
    stack = list(children.get(category_id, []))
    while stack:
        current = stack.pop()
        if current in found:
            continue
        found.add(current)
        stack.extend(children.get(current, []))
    return found


print("products", len(products))
print("multi-category", sum(1 for product in products if len(product["categories"]) > 1))
print("uncategorized", sum(1 for product in products if not product["categories"]))
print("types", sorted({product["type"] for product in products}))
slugs = [product["slug"] for product in products]
print("duplicate product slugs", len(slugs) - len(set(slugs)))
cat_slugs = [category["slug"] for category in categories]
print("duplicate category slugs", len(cat_slugs) - len(set(cat_slugs)))
print("missing images:")
for product in products:
    if not product["images"]:
        print(" ", product["id"], product["name"], product["slug"])
print("missing descriptions:")
for product in products:
    if not product["has_description"]:
        print(" ", product["id"], product["name"])

print("\nparent rollups")
for category in categories:
    if category.get("parent"):
        continue
    kids = descendant_ids(category["id"])
    rolled = direct.get(category["id"], 0)
    seen_products = set()
    for product in products:
        ids = {item["id"] for item in product["categories"]}
        if category["id"] in ids or ids & kids:
            seen_products.add(product["id"])
    reported = category.get("count") or 0
    if reported != len(seen_products):
        print(
            f"  {category['name']}: reported {reported}, direct {direct.get(category['id'], 0)}, "
            f"with descendants {len(seen_products)}, children {len(kids)}"
        )


def node(category_id: int) -> dict:
    category = by_id[category_id]
    return {
        "id": category["id"],
        "name": category["name"].replace("&#8211;", "-").replace("&amp;", "&"),
        "slug": category["slug"],
        "parent": category.get("parent") or 0,
        "source_url": category.get("permalink"),
        "route": f"/shop/{category['slug']}",
        "description": (category.get("description") or "").strip(),
        "image": (category.get("image") or {}).get("src") if isinstance(category.get("image"), dict) else None,
        "reported_count": category.get("count") or 0,
        "direct_product_count": direct.get(category["id"], 0),
        "children": [node(child_id) for child_id in children.get(category_id, [])],
    }


tree = [node(category_id) for category_id in children.get(0, [])]
tree.sort(key=lambda item: item["name"].lower())
(ROOT / "category-tree.json").write_text(json.dumps(tree, indent=2), encoding="utf-8")
print("wrote category-tree.json", len(tree))
