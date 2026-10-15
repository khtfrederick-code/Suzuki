"""Probe public Suzuki Parts USA catalog endpoints. Read-only."""

import json
import urllib.error
import urllib.request

BASE = "https://suzukipartsusa.com"
UA = "SuzukiPartsUSA-catalog-audit/1.0 (local redesign inventory; contact support@suzukipartsusa.com)"


def fetch(path: str):
    request = urllib.request.Request(
        BASE + path,
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        body = response.read()
        headers = {key.lower(): value for key, value in response.headers.items()}
        return response.status, headers, body


def summarize(path: str):
    print("\n==", path)
    try:
        status, headers, body = fetch(path)
    except urllib.error.HTTPError as error:
        print("HTTP", error.code, error.reason)
        text = error.read(400).decode("utf-8", "replace")
        print(text[:400])
        return
    except Exception as error:
        print(type(error).__name__, error)
        return
    interesting = {
        key: headers.get(key)
        for key in ("x-wp-total", "x-wp-totalpages", "content-type", "link")
        if headers.get(key)
    }
    print("status", status, "bytes", len(body), interesting)
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        print(body[:200])
        return
    if isinstance(data, dict):
        print("keys", list(data)[:30])
        namespaces = data.get("namespaces")
        if namespaces:
            print("namespaces", namespaces)
        routes = data.get("routes")
        if isinstance(routes, dict):
            matches = [route for route in routes if "product" in route or "wc/" in route]
            print("product routes", len(matches))
            for route in matches[:40]:
                print(" ", route)
    elif isinstance(data, list):
        print("list", len(data))
        if data and isinstance(data[0], dict):
            print("item keys", list(data[0])[:25])
            print("first", {key: data[0].get(key) for key in ("id", "name", "slug", "count", "parent") if key in data[0]})


if __name__ == "__main__":
    summarize("/wp-json/")
    summarize("/wp-json/wc/store/v1/products?per_page=1")
    summarize("/wp-json/wc/store/v1/products/categories?per_page=100")
