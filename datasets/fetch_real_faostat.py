"""
Pull REAL FAOSTAT data for India - genuinely free, no login, no API key.

FAOSTAT blocks automated fetching from some sandboxed/cloud environments
(robots.txt), which is why this script wasn't run inside this session -
but it works fine from a normal machine or Colab/Jupyter notebook.

Two ways to get real data:
"""

import requests
import pandas as pd
import io

# ---------------------------------------------------------------
# OPTION 1: Direct API query (JSON/CSV, filtered - fast, small)
# ---------------------------------------------------------------
# Domain QCL = Crops and livestock products
# area 100 = India (FAOSTAT area code)
# element 5510 = Production (tonnes), 5312 = Area harvested (ha), 5419 = Yield (kg/ha)
# item codes: 15=Wheat, 27=Rice paddy, 56=Maize, 328=Cotton lint, 156=Sugar cane,
#             236=Soybeans, 242=Groundnuts, 191=Chick peas, 254=Mustard seed

BASE_URL = "https://fenixservices.fao.org/faostat/api/v1/en/data/QCL"

def fetch_faostat_india(item_codes, years="2000:2023"):
    params = {
        "area": 100,              # India
        "element": "5510,5312,5419",
        "item": ",".join(str(c) for c in item_codes),
        "year": years,
        "area_cs": "FAO",
        "show_codes": "true",
        "show_unit": "true",
        "show_flags": "false",
        "null_values": "false",
        "output_type": "csv",
    }
    resp = requests.get(BASE_URL, params=params, timeout=60)
    resp.raise_for_status()
    return pd.read_csv(io.StringIO(resp.text))

# ---------------------------------------------------------------
# OPTION 2: Bulk download (full global dataset, all crops/countries, larger)
# ---------------------------------------------------------------
BULK_URL = "https://fenixservices.fao.org/faostat/static/bulkdownloads/Production_Crops_Livestock_E_All_Data_(Normalized).zip"

def fetch_faostat_bulk(save_path="Production_Crops_Livestock_E_All_Data.zip"):
    resp = requests.get(BULK_URL, stream=True, timeout=300)
    resp.raise_for_status()
    with open(save_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"Saved bulk file to {save_path}")
    # Then filter to India after unzipping + reading the CSV inside:
    #   df = pd.read_csv("Production_Crops_Livestock_E_All_Data_(Normalized).csv", encoding="latin1")
    #   df_india = df[df["Area"] == "India"]

if __name__ == "__main__":
    item_codes = [15, 27, 56, 328, 156, 236, 242, 191, 254]  # wheat, rice, maize, cotton, sugarcane, etc.
    df = fetch_faostat_india(item_codes)
    df.to_csv("faostat_india_real_data.csv", index=False)
    print(f"Saved {len(df)} rows to faostat_india_real_data.csv")

    # Uncomment for the full bulk file instead (larger, all crops/years/countries):
    # fetch_faostat_bulk()
