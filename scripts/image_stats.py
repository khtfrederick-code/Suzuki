import json
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

products = [
    json.loads(line)
    for line in Path("catalog/products.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
counts = Counter(len(product["images"]) for product in products)
print("products", len(products))
print("image counts", dict(sorted(counts.items())))
print("image urls", sum(len(product["images"]) for product in products))
hosts = Counter(urlparse(image["src"]).netloc for product in products for image in product["images"])
print("hosts", hosts)
sample = next(product for product in products if product["images"])
print("sample", sample["id"], sample["images"][0]["src"][:180])
print("desc lengths", min(p["description_length"] for p in products), max(p["description_length"] for p in products))
