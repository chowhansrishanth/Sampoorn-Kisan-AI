-- Track location-based coordinates for accurate weather API queries
ALTER TABLE farm_profiles 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

-- Table to cache regional market prices (Market Agent integration)
CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    crop VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    modal_price_per_quintal NUMERIC(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store historical weather logs per farm
CREATE TABLE IF NOT EXISTS farm_weather_logs (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farm_profiles(id) ON DELETE CASCADE,
    temperature NUMERIC(4,1),
    humidity NUMERIC(4,1),
    rainfall_mm NUMERIC(6,2),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);