"""
Pull REAL Sentinel-2 vegetation/water indices via Google Earth Engine (GEE).

GEE is free for research/nonprofit/education use (sign up: https://earthengine.google.com).
It's by far the least painful way to get Sentinel-2 indices - raw Sentinel-2 downloads
require you to do atmospheric correction and cloud masking yourself; GEE has this built in
via the pre-corrected 'COPERNICUS/S2_SR_HARMONIZED' collection.

Setup:
  pip install earthengine-api
  earthengine authenticate      # one-time browser login
"""

import ee
import pandas as pd

ee.Initialize(project="YOUR_GCP_PROJECT_ID")  # free GCP project, required by GEE now

# Same 24 locations used across your SHC / NASA POWER / AGMARKNET / IMD datasets
locations = [
    ("Punjab", "Ludhiana", 30.90, 75.85),
    ("Punjab", "Amritsar", 31.83, 74.75),
    ("Haryana", "Karnal", 29.85, 76.98),
    ("Uttar Pradesh", "Meerut", 29.15, 77.61),
    ("Uttar Pradesh", "Kanpur Dehat", 26.43, 79.98),
    ("Madhya Pradesh", "Indore", 22.85, 75.55),
    ("Madhya Pradesh", "Bhopal", 23.63, 77.44),
    ("Maharashtra", "Nashik", 20.08, 74.11),
    ("Maharashtra", "Pune", 18.15, 74.58),
    ("Karnataka", "Belagavi", 16.73, 75.07),
    ("Karnataka", "Mysuru", 12.12, 76.68),
    ("Andhra Pradesh", "Guntur", 16.24, 80.64),
    ("Telangana", "Nalgonda", 16.87, 79.57),
    ("Tamil Nadu", "Thanjavur", 10.96, 79.38),
    ("Tamil Nadu", "Coimbatore", 10.66, 77.01),
    ("Rajasthan", "Sriganganagar", 29.71, 73.98),
    ("Rajasthan", "Kota", 24.64, 75.94),
    ("Bihar", "Patna", 25.35, 85.03),
    ("Bihar", "Muzaffarpur", 26.20, 85.42),
    ("Gujarat", "Rajkot", 21.96, 70.80),
    ("Gujarat", "Anand", 22.47, 72.79),
    ("West Bengal", "Bardhaman", 23.23, 88.37),
    ("Odisha", "Cuttack", 20.52, 85.68),
    ("Chhattisgarh", "Raipur", 21.19, 81.97),
]

def add_indices(image):
    nir = image.select("B8")
    red = image.select("B4")
    blue = image.select("B2")
    green = image.select("B3")
    swir1 = image.select("B11")

    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    ndwi = image.normalizedDifference(["B3", "B8"]).rename("NDWI")  # McFeeters NDWI (surface water)
    # NDMI (a common Sentinel-2 soil/vegetation moisture proxy - closer to "Soil Moisture Index"
    # than true NDWI, since true soil moisture needs radar/SAR, not optical bands)
    ndmi = image.normalizedDifference(["B8", "B11"]).rename("Soil_Moisture_Index")

    evi = image.expression(
        "2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))",
        {"NIR": nir, "RED": red, "BLUE": blue}
    ).rename("EVI")

    L = 0.5
    savi = image.expression(
        "((NIR - RED) / (NIR + RED + L)) * (1 + L)",
        {"NIR": nir, "RED": red, "L": L}
    ).rename("SAVI")

    return image.addBands([ndvi, evi, ndwi, savi, ndmi])

def fetch_point_timeseries(lat, lon, start="2023-06-01", end="2023-11-30"):
    point = ee.Geometry.Point([lon, lat])
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(point)
        .filterDate(start, end)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .map(add_indices)
    )

    def extract(image):
        values = image.select(["NDVI", "EVI", "NDWI", "SAVI", "Soil_Moisture_Index"]) \
            .reduceRegion(ee.Reducer.mean(), point, 10)
        return ee.Feature(None, values.set("date", image.date().format("YYYY-MM-dd")))

    features = collection.map(extract).getInfo()["features"]
    return [f["properties"] for f in features]

if __name__ == "__main__":
    all_rows = []
    for state, district, lat, lon in locations:
        print(f"Fetching {district}, {state}...")
        try:
            rows = fetch_point_timeseries(lat, lon)
            for r in rows:
                r["State"] = state
                r["District"] = district
                r["Latitude"] = lat
                r["Longitude"] = lon
            all_rows.extend(rows)
        except Exception as e:
            print(f"  failed: {e}")

    df = pd.DataFrame(all_rows)
    df.to_csv("sentinel2_real_data.csv", index=False)
    print(f"Saved {len(df)} rows to sentinel2_real_data.csv")
