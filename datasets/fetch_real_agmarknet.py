"""
Pull REAL AGMARKNET mandi price data via the data.gov.in API.

Unlike NASA POWER, this needs a free API key (no cost, instant signup):
  1. Register at https://data.gov.in (top-right "Login/Register")
  2. Go to https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
  3. Click "Data API" on that page - it shows the exact resource ID and a
     ready-made sample query for this specific dataset. Copy the resource ID
     into RESOURCE_ID below, and your key into API_KEY.

This dataset is refreshed daily and covers current/recent prices; for deep
historical archives you may need to page through multiple date-filtered
queries, since the live resource typically holds a rolling recent window.
"""

import requests
import pandas as pd

API_KEY = "PASTE_YOUR_DATA_GOV_IN_API_KEY_HERE"
RESOURCE_ID = "PASTE_RESOURCE_ID_FROM_DATA_API_PAGE_HERE"

BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

def fetch_prices(state=None, commodity=None, limit=1000, offset=0):
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }
    if state:
        params["filters[state.keyword]"] = state
    if commodity:
        params["filters[commodity]"] = commodity

    resp = requests.get(BASE_URL, params=params, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    return data.get("records", []), data.get("total", 0)

if __name__ == "__main__":
    all_records = []
    offset = 0
    limit = 1000

    while True:
        records, total = fetch_prices(limit=limit, offset=offset)
        if not records:
            break
        all_records.extend(records)
        print(f"Fetched {len(all_records)} / {total}")
        offset += limit
        if offset >= total:
            break

    df = pd.DataFrame(all_records)
    df.to_csv("agmarknet_real_data.csv", index=False)
    print(f"Saved {len(df)} rows to agmarknet_real_data.csv")
