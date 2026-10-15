import json
from pathlib import Path

ROOT = Path(r"c:\Users\Taylor\Desktop\Suzuki")
PUBLIC = ROOT / "public"
products = json.loads((ROOT / "src/data/catalog/products.json").read_text(encoding="utf-8"))
categories = json.loads((ROOT / "src/data/catalog/categories.json").read_text(encoding="utf-8"))
product_rows = products["products"]
category_rows = categories["categories"]

print("products", len(product_rows), "categories", len(category_rows))
slugs = [item["slug"] for item in product_rows]
print("duplicate product slugs", len(slugs) - len(set(slugs)))
cat_slugs = [item["slug"] for item in category_rows]
print("duplicate category slugs", len(cat_slugs) - len(set(cat_slugs)))

missing_images = []
for product in product_rows:
    for image in product["images"]:
        if not (PUBLIC / image.lstrip("/")).exists():
            missing_images.append((product["id"], image))
print("missing product image files", len(missing_images))
for row in missing_images[:12]:
    print(" ", row)

missing_cat_images = []
for category in category_rows:
    image = category.get("image")
    if image and not (PUBLIC / image.lstrip("/")).exists():
        missing_cat_images.append((category["slug"], image))
print("missing category image files", len(missing_cat_images))

ids = {item["id"] for item in product_rows}
orphan = []
for category in category_rows:
    for product_id in category["productIds"]:
        if product_id not in ids:
            orphan.append((category["slug"], product_id))
print("category ids missing from products", len(orphan))

desc_dir = PUBLIC / "catalog" / "descriptions"
missing_desc = [item["id"] for item in product_rows if not (desc_dir / f"{item['id']}.json").exists()]
print("missing description files", len(missing_desc))

page_size = 24
pages = (len(product_rows) + page_size - 1) // page_size
print("shop pages", pages, "last page count", len(product_rows) - (pages - 1) * page_size)

priced = sum(1 for item in product_rows if item["price"] is None)
print("null prices", priced)
print("on sale", sum(1 for item in product_rows if item["onSale"]))
print("no source image placeholder", sum(1 for item in product_rows if item["images"] == ["/assets/catalog/image-unavailable.webp"]))
