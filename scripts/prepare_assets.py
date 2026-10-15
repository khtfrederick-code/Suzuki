"""Download store images and licensed vehicle photos, then write optimized WebP files."""

import json
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets"
UA = {
    "User-Agent": "Mozilla/5.0 (compatible; SuzukiPartsUSA-homepage/1.0; +https://suzukipartsusa.com/)"
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def save_webp(data: bytes, dest: Path, max_width: int, quality: int = 80) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(BytesIO(data)) as img:
        img = img.convert("RGB")
        if img.width > max_width:
            height = round(img.height * (max_width / img.width))
            img = img.resize((max_width, height), Image.Resampling.LANCZOS)
        img.save(dest, "WEBP", quality=quality, method=6)
    print(f"webp {dest.relative_to(ROOT)} {dest.stat().st_size}")


def download(
    url: str,
    dest: Path,
    max_width: int,
    fallbacks: list[str] | None = None,
    quality: int = 80,
) -> None:
    if dest.exists() and dest.stat().st_size > 1000:
        print("skip", dest.name)
        return
    candidates = [url, *(fallbacks or [])]
    last_error: Exception | None = None
    for candidate in candidates:
        try:
            save_webp(fetch(candidate), dest, max_width, quality)
            return
        except Exception as error:  # noqa: BLE001 - try the next known URL
            last_error = error
            print("retry", candidate, type(error).__name__, error)
    raise RuntimeError(f"Could not download {dest.name}: {last_error}")


def main() -> None:
    logo_dest = PUBLIC / "logo" / "suzuki-parts-usa-logo.png"
    logo_dest.parent.mkdir(parents=True, exist_ok=True)
    logo = fetch("https://suzukipartsusa.com/wp-content/uploads/2019/05/Suzuki-Parts-USA-logo.png")
    logo_dest.write_bytes(logo)
    print("logo", logo_dest.stat().st_size)

    with Image.open(BytesIO(logo)) as mark:
        icon = mark.crop((6, 8, 108, 112)).resize((64, 64), Image.Resampling.LANCZOS)
        icon.save(ROOT / "public" / "favicon.png")

    vehicles = {
        "vehicles/1991-suzuki-samurai.webp": (
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/1991_Suzuki_Samurai_1.3_%2852761700507%29.jpg/1920px-1991_Suzuki_Samurai_1.3_%2852761700507%29.jpg",
            1600,
        ),
    }
    for name, (url, width) in vehicles.items():
        download(url, PUBLIC / name, width, quality=78)

    about = PUBLIC / "photography" / "engine-valve-cover.webp"
    download(
        "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_4299_2.jpg",
        about,
        1400,
    )

    categories = {
        "categories/engine-parts.webp": "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_4299_2.jpg",
        "categories/brakes.webp": "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_5729.jpg",
        "categories/cooling-system.webp": "https://suzukipartsusa.com/wp-content/uploads/2018/01/IMG_0920.jpg",
        "categories/electrical.webp": "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_7763.jpg",
        "categories/exterior-parts.webp": "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_6029-Version-2.jpg",
        "categories/interior-parts.webp": "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_6258.jpg",
        "categories/transmission.webp": "https://suzukipartsusa.com/wp-content/uploads/2019/06/IMG_7505.jpg",
        "categories/shocks-springs.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/8/Suzuki-Samurai-Shocks-Front-Rear-LHRH-OEM-86-87-88-thru-95-ATLGA-292453443048-1024x796.jpg",
    }
    for name, url in categories.items():
        thumb = url.rsplit(".", 1)[0] + "-234x234.jpg"
        download(url, PUBLIC / name, 720, [thumb])

    products = {
        "products/wiper-motor-assembly-lhd.webp": "https://suzukipartsusa.com/wp-content/uploads/2025/01/1dd4c46f-a8da-43d4-aa2b-b0f42e873f92.jpeg",
        "products/oil-pan-plug-oem.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/3/Oil-Pan-Plug-OEM-SJ413-Suzuki-Samurai-86-95-ATLGA-302642153633-2.JPG",
        "products/lhd-combination-switch.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/0/LHD-Combination-Switch-Headlight-Wiper-Blinker-SJ413-Suzuki-Samurai-86-95-302610448880.JPG",
        "products/rear-floor-panel-oem.webp": "https://suzukipartsusa.com/wp-content/uploads/2020/12/Panel-Rear-Floor-Pan2.jpg",
        "products/front-bumper-light-kit-oem.webp": "https://suzukipartsusa.com/wp-content/uploads/2025/09/Front-Bumper-End-Caps-Turn-Lights-OEM-Suzuki-Samurai-86-95-ATLGA-292453430598.jpg",
        "products/carpet-felt-passenger-area.webp": "https://suzukipartsusa.com/wp-content/uploads/2018/02/s-l1600-3.jpg",
        "products/leaf-spring-set-front-rear.webp": "https://suzukipartsusa.com/wp-content/uploads/2018/02/IMG_1142.jpg",
        "products/windshield-glass-oem.webp": "https://suzukipartsusa.com/wp-content/uploads/2021/08/FRONT_WINDOW_GLASS.jpg",
        "products/steering-drag-link-lhd.webp": "https://suzukipartsusa.com/wp-content/uploads/2025/01/3775e885-99be-4d01-bcef-c0a83acace59.jpeg",
        "products/fuel-tank-carb-oem.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/4/Gas-Fuel-Tank-for-Carburetor-w-Sending-Unit-OEM-Suzuki-Samurai-86-90-302638773444.jpg",
        "products/brake-master-cylinder-rhd.webp": "https://suzukipartsusa.com/wp-content/uploads/2021/01/master-cylinder-1-scaled.jpg",
        "products/front-bumper-end-cap-set.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/0/Front-Bumper-Caps-Ends-Corners-Both-Sides-Suzuki-Samurai-86-95-292453430900.JPG",
        "products/liftgate-handle-grand-vitara.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/7/Outside-LIFTGATE-REAR-GATE-HANDLE-Black-for-Suzuki-Grand-Vitara-99-05-292449716377.JPG",
        "products/aluminum-valve-cover-kit.webp": "https://suzukipartsusa.com/wp-content/uploads/2020/12/16v-Aluminum-3.jpg",
        "products/passengers-seat.webp": "https://suzukipartsusa.com/wp-content/uploads/2024/11/Passenger-seat-2.jpg",
        "products/e-brake-cable-rhd.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/2/Emergency-Parking-Brake-Cable-1-RHD-SJ410-SJ413-Suzuki-Samurai-86-95-302622246752.JPG",
        "products/e-brake-lever-handle.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/0/HANDLE-for-E-Brake-Lever-EmergencyHand-Brake-SJ413-Suzuki-Samurai-86-95-302607895690.JPG",
    }
    fallback_thumbs = {
        "products/fuel-tank-carb-oem.webp": "https://suzukipartsusa.com/wp-content/uploads/imported/4/Gas-Fuel-Tank-for-Carburetor-w-Sending-Unit-OEM-Suzuki-Samurai-86-90-302638773444-234x235.jpg",
        "products/brake-master-cylinder-rhd.webp": "https://suzukipartsusa.com/wp-content/uploads/2021/01/master-cylinder-1-1920x1357.jpg",
    }
    for name, url in products.items():
        download(url, PUBLIC / name, 900, [fallback_thumbs[name]] if name in fallback_thumbs else None)

    credits = {
        "logo": {
            "source": "https://suzukipartsusa.com/wp-content/uploads/2019/05/Suzuki-Parts-USA-logo.png",
            "license": "Suzuki Parts USA store branding, downloaded from the live site for this storefront.",
        },
        "products": "Product and category photographs were downloaded from suzukipartsusa.com and depict that store's listed merchandise.",
        "vehicles": [
            {
                "file": "vehicles/1991-suzuki-samurai.webp",
                "title": "1991 Suzuki Samurai 1.3",
                "source": "https://commons.wikimedia.org/wiki/File:1991_Suzuki_Samurai_1.3_(52761700507).jpg",
                "license": "CC BY 2.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
            },
        ],
    }
    (PUBLIC / "credits.json").write_text(json.dumps(credits, indent=2), encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
