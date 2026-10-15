import json
from pathlib import Path

rows = [
    json.loads(line)
    for line in Path("catalog/image-map.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]
by_source = {}
for row in rows:
    source = row.get("source") or ""
    if not source:
        continue
    by_source.setdefault(source, []).append(row)

failed_sources = []
for source, entries in by_source.items():
    if entries[-1].get("status") != "failed":
        continue
    oks = [entry for entry in entries if entry.get("status") == "ok" and Path(entry["file"]).exists()]
    failed_sources.append((source, bool(oks), entries[-1].get("error"), entries[-1].get("product_id")))

print("sources whose last attempt failed", len(failed_sources))
print("of those, an earlier file exists", sum(1 for _s, ok, _e, _i in failed_sources if ok))
for source, ok, error, product_id in failed_sources:
    if not ok:
        print("STILL MISSING", product_id, error, source[:120])
