"""
Pull REAL NASA POWER daily climate data (no API key needed, free public API).

NASA POWER covers: temperature, humidity, precipitation, solar radiation,
wind speed, surface pressure — daily, at any lat/long, back to 1981.

Docs: https://power.larc.nasa.gov/docs/services/api/
"""

import requests
import pandas as pd
import time

# Same 24 locations as the Soil Health Card sample dataset
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

# NASA POWER daily point parameters:
# T2M          = Temperature at 2m (C)
# T2M_MAX      = Max temperature at 2m (C)
# T2M_MIN      = Min temperature at 2m (C)
# RH2M         = Relative humidity at 2m (%)
# PRECTOTCORR  = Precipitation corrected (mm/day)
# ALLSKY_SFC_SW_DWN = Solar radiation, all-sky surface shortwave downward (MJ/m^2/day)
# WS2M         = Wind speed at 2m (m/s)
# PS           = Surface pressure (kPa)
PARAMS = "T2M,T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,WS2M,PS"

BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def fetch_location(state, district, lat, lon, start="20230101", end="20231231"):
    params = {
        "parameters": PARAMS,
        "community": "AG",          # Agroclimatology community
        "longitude": lon,
        "latitude": lat,
        "start": start,
        "end": end,
        "format": "JSON",
    }
    resp = requests.get(BASE_URL, params=params, timeout=60)
    resp.raise_for_status()
    data = resp.json()["properties"]["parameter"]

    dates = list(data["T2M"].keys())
    rows = []
    for d in dates:
        rows.append({
            "State": state,
            "District": district,
            "Latitude": lat,
            "Longitude": lon,
            "Date": pd.to_datetime(d, format="%Y%m%d").strftime("%Y-%m-%d"),
            "Temp_Mean_C": data["T2M"][d],
            "Temp_Max_C": data["T2M_MAX"][d],
            "Temp_Min_C": data["T2M_MIN"][d],
            "Humidity_percent": data["RH2M"][d],
            "Rainfall_mm": data["PRECTOTCORR"][d],
            "Solar_Radiation_MJ_per_m2_day": data["ALLSKY_SFC_SW_DWN"][d],
            "Wind_Speed_m_per_s": data["WS2M"][d],
            "Surface_Pressure_kPa": data["PS"][d],
        })
    return rows

if __name__ == "__main__":
    all_rows = []
    for state, district, lat, lon in locations:
        print(f"Fetching {district}, {state}...")
        try:
            all_rows.extend(fetch_location(state, district, lat, lon))
        except Exception as e:
            print(f"  failed: {e}")
        time.sleep(1)  # be polite to the API

    df = pd.DataFrame(all_rows)
    df.to_csv("nasa_power_real_data.csv", index=False)
    print(f"Saved {len(df)} rows to nasa_power_real_data.csv")
