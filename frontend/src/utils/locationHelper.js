import axios from "axios";

const API_BASE = "/api/location";

/**
 * Triggers browser GPS detection, validates coordinates,
 * and requests reverse geocoding via backend OpenStreetMap proxy.
 * 
 * @returns {Promise<Object>} Structured location result
 */
export async function detectGPSLocation() {
    if (!navigator.geolocation) {
        return {
            success: false,
            error: "📍 Geolocation is not supported by your browser."
        };
    }

    return new Promise((resolve) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                // Accuracy Check
                let accuracyWarning = null;
                if (accuracy && accuracy > 5000) {
                    accuracyWarning = `GPS accuracy is low (±${(accuracy / 1000).toFixed(1)} km). Please move outdoors or enable precise location.`;
                }

                try {
                    const res = await axios.get(`${API_BASE}/reverse-geocode`, {
                        params: { lat: latitude, lon: longitude, accuracy }
                    });

                    if (res.data && res.data.success) {
                        resolve({
                            ...res.data,
                            accuracyWarning
                        });
                    } else {
                        resolve({
                            success: false,
                            error: res.data?.error || "📍 GPS coordinates were detected, but the area name could not be determined. Please select your location manually."
                        });
                    }
                } catch (err) {
                    console.warn("Backend reverse-geocode call error:", err.message);

                    // Client-side Direct Fallback to OpenStreetMap Nominatim if backend is unreachable
                    try {
                        const directRes = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                            { timeout: 5000 }
                        );
                        const addr = directRes.data?.address;

                        if (addr) {
                            const isIndia = (addr.country_code && addr.country_code.toLowerCase() === "in") || (addr.country && addr.country.toLowerCase().includes("india"));
                            if (!isIndia) {
                                resolve({
                                    success: false,
                                    isIndia: false,
                                    error: "📍 Please select a location in India."
                                });
                                return;
                            }

                            const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.locality || addr.town || null;
                            const district = addr.district || addr.state_district || addr.county || addr.city || "District";
                            const state = addr.state || "India";

                            const parts = [];
                            if (village) parts.push(village);
                            if (district && district !== village) parts.push(district);
                            if (state) parts.push(state);
                            parts.push("India");

                            const formattedAddress = parts.join(", ");

                            resolve({
                                success: true,
                                isIndia: true,
                                latitude,
                                longitude,
                                accuracy,
                                village,
                                locality: village || district,
                                district,
                                state,
                                country: "India",
                                formattedAddress,
                                accuracyWarning
                            });
                            return;
                        }
                    } catch (directErr) {
                        console.warn("Direct Nominatim fallback error:", directErr.message);
                    }

                    resolve({
                        success: false,
                        error: "📍 GPS coordinates were detected, but the area name could not be determined. Please select your location manually."
                    });
                }
            },
            (error) => {
                const getUserMsg = () => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            return "📍 Location permission was denied. Please allow location access in your browser settings.";
                        case error.POSITION_UNAVAILABLE:
                            return "📍 Unable to determine your location. Please check GPS/location services.";
                        case error.TIMEOUT:
                            return "📍 GPS detection timed out. Please try again.";
                        default:
                            return "📍 Unable to determine your location. Please check GPS/location services.";
                    }
                };
                resolve({
                    success: false,
                    error: getUserMsg()
                });
            },
            options
        );
    });
}

/**
 * Sends manual location string to backend for structured parsing.
 * 
 * @param {string} locationStr 
 * @returns {Promise<Object>} Structured location object
 */
export async function parseManualLocation(locationStr) {
    if (!locationStr || !locationStr.trim()) {
        return {
            success: false,
            error: "📍 Location string cannot be empty."
        };
    }

    try {
        const res = await axios.post(`${API_BASE}/parse-manual`, { location: locationStr });
        return res.data;
    } catch {
        const cleaned = locationStr.trim();
        const hasIndia = /India$/i.test(cleaned);
        const formattedAddress = hasIndia ? cleaned : `${cleaned}, India`;
        const segments = cleaned.split(",").map(s => s.trim());

        return {
            success: true,
            isIndia: true,
            latitude: null,
            longitude: null,
            accuracy: null,
            village: segments[0] || null,
            locality: segments[0] || null,
            district: segments.length > 1 ? segments[segments.length - 2] : segments[0],
            state: segments.length > 1 ? segments[segments.length - 1].replace(/India/i, "").trim() : "India",
            country: "India",
            formattedAddress
        };
    }
}
