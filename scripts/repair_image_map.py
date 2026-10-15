import json
from pathlib import Path

path = Path("catalog/image-map.jsonl")
raw = path.read_text(encoding="utf-8").splitlines()
good = []
bad = 0
for index, line in enumerate(raw, start=1):
    if not line.strip():
        continue
    try:
        good.append(json.loads(line))
    except json.JSONDecodeError:
        bad += 1
        print("bad line", index, "len", len(line), line[:120])
print("good", len(good), "bad", bad)
path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in good), encoding="utf-8")
print("rewrote", path)
