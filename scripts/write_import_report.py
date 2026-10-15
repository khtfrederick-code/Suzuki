import json
from pathlib import Path

root = Path("catalog")
categories = json.loads((root / "categories.json").read_text(encoding="utf-8"))
products = [
    json.loads(line)
    for line in (root / "products.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
names = {item["id"]: item["name"] for item in products}
no_image = []
for category in categories:
    image = category.get("image")
    if not (isinstance(image, dict) and image.get("src")):
        no_image.append({"id": category["id"], "name": category["name"], "slug": category["slug"]})

missing_products = [
    {"id": product_id, "name": names[product_id]}
    for product_id in (119610, 113353)
]
report = {
    "retrieved_at": "2026-10-14T22:38:07.529649+00:00",
    "products_in_index": 1219,
    "descriptions_stored": 1219,
    "descriptions_empty": 1,
    "empty_description_ids": [102669],
    "empty_description_name": names[102669],
    "product_image_references": 2488,
    "unique_product_image_urls": 2389,
    "duplicate_image_references": 99,
    "unique_product_images_saved": 2389,
    "category_images_on_source": 51,
    "category_images_saved": 51,
    "categories_without_a_source_image": no_image,
    "products_with_no_source_image": missing_products,
    "placeholder": "/assets/catalog/image-unavailable.webp",
    "rate_limit_notes": "Ten image requests returned HTTP 429 during a parallel download. Each of those files was saved by the other request, and the files are on disk.",
    "image_root": "public/assets/catalog",
    "image_map": "catalog/image-map.jsonl",
    "descriptions": "catalog/descriptions.jsonl",
}
(root / "import-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

recon_path = root / "reconciliation.json"
recon = json.loads(recon_path.read_text(encoding="utf-8"))
recon["import"] = {
    "descriptions_stored": 1219,
    "descriptions_empty": [102669],
    "unique_product_images_saved": 2389,
    "category_images_saved": 51,
    "products_with_no_source_image": [119610, 113353],
    "categories_without_a_source_image": [item["slug"] for item in no_image],
}
note = (
    "Stage 2 import saved plain-text descriptions for all 1,219 products and local WebP copies "
    "of all 2,389 unique product image URLs plus 51 category images. Product 102669 has no description. "
    "Products 119610 and 113353 have no source image."
)
notes = [item for item in recon.get("notes") or [] if not item.startswith("Stage 2 import")]
notes.append(note)
recon["notes"] = notes
recon_path.write_text(json.dumps(recon, indent=2), encoding="utf-8")
print(json.dumps({"no_image": no_image, "missing_products": missing_products, "empty": names[102669]}, indent=2))
