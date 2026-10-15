import json
from pathlib import Path

products = [
    json.loads(line)
    for line in Path("catalog/products.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
categories = json.loads(Path("catalog/categories.json").read_text(encoding="utf-8"))
rows = [
    json.loads(line)
    for line in Path("catalog/image-map.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
latest = {}
for row in rows:
    latest[row.get("source") or f"missing:{row.get('product_id')}"] = row

product_sources = [image["src"] for product in products for image in product["images"] if image.get("src")]
unique_product_sources = set(product_sources)
category_sources = set()
for category in categories:
    image = category.get("image")
    if isinstance(image, dict) and image.get("src"):
        category_sources.add(image["src"])

ok_sources = {source for source, row in latest.items() if row.get("status") == "ok"}
failed = [row for row in latest.values() if row.get("status") == "failed"]
missing = [row for row in latest.values() if row.get("status") == "missing-source"]
missing_files = [row for row in latest.values() if row.get("status") == "ok" and not Path(row["file"]).exists()]
print("product image refs", len(product_sources))
print("unique product urls", len(unique_product_sources))
print("duplicate refs", len(product_sources) - len(unique_product_sources))
print("category urls", len(category_sources))
print("ok sources", len(ok_sources))
print("product urls not ok", len(unique_product_sources - ok_sources))
print("category urls not ok", len(category_sources - ok_sources))
print("latest failed", len(failed))
for row in failed:
    print(" FAIL", row.get("product_id") or row.get("category_id"), row.get("error"), row.get("source", "")[:100])
print("missing source products", [row.get("product_id") for row in missing])
print("ok rows whose file is gone", len(missing_files))

descriptions = [
    json.loads(line)
    for line in Path("catalog/descriptions.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
print("descriptions", len(descriptions), "unique", len({item["id"] for item in descriptions}))
print("sample", next(item["description"][:180] for item in descriptions if len(item["description"]) > 80))
