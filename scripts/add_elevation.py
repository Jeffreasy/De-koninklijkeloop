"""
Enrich route JSON files with elevation data from Open-Meteo API.

Usage: python scripts/add_elevation.py

Reads each route JSON from public/data/routes/, fetches elevation from
Open-Meteo (free, no API key, Copernicus DEM 90m), and writes back
enriched { lat, lng, ele } format.
"""

import json
import os
import urllib.request
import urllib.parse
import time

ROUTES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data", "routes")
BATCH_SIZE = 100  # Open-Meteo accepts up to 100 coords per request


def fetch_elevations(coords: list[dict]) -> list[float]:
    """Fetch elevation for a batch of coordinates from Open-Meteo."""
    lats = ",".join(f"{c['lat']:.6f}" for c in coords)
    lngs = ",".join(f"{c['lng']:.6f}" for c in coords)

    url = f"https://api.open-meteo.com/v1/elevation?latitude={lats}&longitude={lngs}"
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "DeKoninklijkeLoop-ElevationScript/1.0")

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())

    return data["elevation"]


def process_route(filepath: str) -> None:
    """Process a single route JSON file."""
    filename = os.path.basename(filepath)
    print(f"  Processing {filename}...")

    with open(filepath, "r", encoding="utf-8") as f:
        points = json.load(f)

    all_elevations: list[float] = []

    for i in range(0, len(points), BATCH_SIZE):
        batch = points[i : i + BATCH_SIZE]
        elevations = fetch_elevations(batch)
        all_elevations.extend(elevations)
        if i + BATCH_SIZE < len(points):
            time.sleep(1)  # Rate limit courtesy

    enriched = []
    for point, ele in zip(points, all_elevations):
        enriched.append({"lat": point["lat"], "lng": point["lng"], "ele": round(ele, 1)})

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=4)

    min_ele = min(e["ele"] for e in enriched)
    max_ele = max(e["ele"] for e in enriched)
    print(f"    ✓ {len(enriched)} points, elevation {min_ele}m – {max_ele}m")


def main():
    print("Enriching route JSON files with elevation data (Open-Meteo API)\n")

    route_files = sorted(
        f for f in os.listdir(ROUTES_DIR) if f.endswith(".json")
    )

    if not route_files:
        print("No route JSON files found!")
        return

    for filename in route_files:
        filepath = os.path.join(ROUTES_DIR, filename)
        process_route(filepath)
        time.sleep(0.5)  # Be polite between routes

    print("\n✅ All routes enriched with elevation data!")


if __name__ == "__main__":
    main()
