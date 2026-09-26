/**
 * Specialized Farm Location & GPS Reverse-Geocoding Service
 * Uses OpenStreetMap Nominatim API with BigDataCloud client fallback,
 * India-only validation, address hierarchy formatting, and structured location object creation.
 */

const axios = require('axios');
const cacheService = require("./cacheService");

class LocationService {
    constructor() {
        this.nominatimUrl = "https://nominatim.openstreetmap.org/reverse";
        this.bigDataCloudUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client";
        this.userAgent = "SampoornKisanAI/2.0 (contact@sampoornkisan.ai)";
    }

    /**
     * Performs reverse geocoding from latitude/longitude coordinates to a human-readable Indian location.
     * @param {number|string} lat 
     * @param {number|string} lon 
     * @param {number|string} accuracy 
     * @returns {Promise<Object>} Structured Farm Location Object
     */
    async reverseGeocode(lat, lon, accuracy = null) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const acc = accuracy !== null && accuracy !== undefined ? parseFloat(accuracy) : null;

        if (isNaN(latitude) || isNaN(longitude)) {
            return {
                success: false,
                error: "📍 Invalid coordinates provided. Please verify device GPS."
            };
        }

        // Validate coordinate bounds
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return {
                success: false,
                error: "📍 Coordinates are outside valid geographic range."
            };
        }

        // Check Cache (round to 3 decimals ~110m precision)
        const cacheKey = `geo:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
        const cachedLoc = cacheService.get(cacheKey);
        if (cachedLoc) {
            return { ...cachedLoc, accuracy: acc, isCached: true };
        }

        let addressDetails = null;

        // 1. Try OpenStreetMap Nominatim API
        try {
            const nomRes = await axios.get(this.nominatimUrl, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: "json",
                    addressdetails: 1,
                    "accept-language": "en"
                },
                headers: {
                    "User-Agent": this.userAgent
                },
                timeout: 4500
            });

            if (nomRes.data && nomRes.data.address) {
                addressDetails = this._parseNominatimAddress(nomRes.data.address);
            }
        } catch (err) {
            console.warn(`[LocationService] Nominatim lookup failed/timed out: ${err.message}. Trying secondary fallback...`);
        }

        // 2. Fallback to BigDataCloud Reverse Geocode if Nominatim failed
        if (!addressDetails) {
            try {
                const bdcRes = await axios.get(this.bigDataCloudUrl, {
                    params: {
                        latitude,
                        longitude,
                        localityLanguage: "en"
                    },
                    timeout: 4000
                });

                if (bdcRes.data) {
                    addressDetails = this._parseBigDataCloudAddress(bdcRes.data);
                }
            } catch (err) {
                console.warn(`[LocationService] BigDataCloud fallback failed: ${err.message}`);
            }
        }

        // 3. If reverse geocoding completely failed
        if (!addressDetails) {
            return {
                success: false,
                error: "📍 GPS coordinates were detected, but the area name could not be determined. Please select your location manually."
            };
        }

        // 4. Validate India country restriction
        const isIndia = this._checkIsIndia(addressDetails.countryCode, addressDetails.country);
        if (!isIndia) {
            return {
                success: false,
                isIndia: false,
                error: "📍 Please select a location in India."
            };
        }

        // 5. Construct Preferred Human-Readable Location Hierarchy:
        // Village/Locality → Mandal/Tehsil → District → State → India
        const parts = [];
        if (addressDetails.village) parts.push(addressDetails.village);
        else if (addressDetails.locality) parts.push(addressDetails.locality);

        if (addressDetails.district && addressDetails.district !== addressDetails.village && addressDetails.district !== addressDetails.locality) {
            parts.push(addressDetails.district);
        }

        if (addressDetails.state) parts.push(addressDetails.state);
        parts.push("India");

        // Format clean string, e.g. "Kukatpally, Hyderabad, Telangana, India"
        const formattedAddress = parts.join(", ");

        const resultObj = {
            success: true,
            isIndia: true,
            latitude,
            longitude,
            accuracy: acc,
            village: addressDetails.village || null,
            locality: addressDetails.locality || addressDetails.village || addressDetails.district || null,
            mandal: addressDetails.mandal || null,
            district: addressDetails.district || "District",
            state: addressDetails.state || "India",
            country: "India",
            postcode: addressDetails.postcode || null,
            formattedAddress
        };

        // Cache for 24 hours (86400000 ms)
        cacheService.set(cacheKey, resultObj, 86400000);

        return resultObj;
    }

    /**
     * Parses manual location entry into structured format.
     * @param {string} locationInput 
     * @returns {Object} Structured Location Object
     */
    parseManualLocation(locationInput = "") {
        const cleaned = (locationInput || "").trim();
        if (!cleaned) {
            return {
                success: false,
                error: "📍 Location string cannot be empty."
            };
        }

        const segments = cleaned.split(",").map(s => s.trim()).filter(Boolean);
        let state = "India";
        let district = cleaned;
        let locality = null;

        if (segments.length >= 3) {
            locality = segments[0];
            district = segments[1];
            state = segments[2].replace(/India/i, "").trim() || segments[2];
        } else if (segments.length === 2) {
            district = segments[0];
            state = segments[1].replace(/India/i, "").trim() || segments[1];
        }

        // Guarantee "India" suffix
        const hasIndia = /India$/i.test(cleaned);
        const formattedAddress = hasIndia ? cleaned : `${cleaned}, India`;

        return {
            success: true,
            isIndia: true,
            latitude: null,
            longitude: null,
            accuracy: null,
            village: locality,
            locality: locality || district,
            mandal: null,
            district: district.replace(/District$/i, "").trim(),
            state: state.trim() || "India",
            country: "India",
            postcode: null,
            formattedAddress
        };
    }

    /**
     * Parses Nominatim address structure.
     */
    _parseNominatimAddress(addr) {
        const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city_district || null;
        const locality = addr.locality || addr.city || addr.town || village || null;
        const mandal = addr.subdistrict || addr.tehsil || addr.taluk || addr.mandal || addr.county || null;
        const district = addr.district || addr.state_district || addr.county || addr.city || addr.town || "District";
        const state = addr.state || "India";
        const country = addr.country || "India";
        const countryCode = addr.country_code || "in";
        const postcode = addr.postcode || null;

        return { village, locality, mandal, district, state, country, countryCode, postcode };
    }

    /**
     * Parses BigDataCloud fallback address structure.
     */
    _parseBigDataCloudAddress(data) {
        const locality = data.locality || data.city || null;
        const district = data.principalSubdivision ? (data.localityInfo?.administrative?.find(a => a.order === 6)?.name || data.principalSubdivision) : "District";
        const state = data.principalSubdivision || "India";
        const country = data.countryName || "India";
        const countryCode = data.countryCode ? data.countryCode.toLowerCase() : "in";
        const postcode = data.postcode || null;

        return { village: locality, locality, mandal: null, district, state, country, countryCode, postcode };
    }

    /**
     * Verifies whether coordinates fall inside India.
     */
    _checkIsIndia(countryCode, countryName) {
        if (countryCode && countryCode.toLowerCase() === "in") return true;
        if (countryName && countryName.toLowerCase().includes("india")) return true;
        return false;
    }
}

module.exports = new LocationService();
