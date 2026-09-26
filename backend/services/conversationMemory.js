/**
 * Structured Conversation Memory & Entity Extractor Module
 * Maintains short-term message history and long-term extracted agricultural state.
 * Supports per-user session isolation with MongoDB persistence + local fallback.
 */

const fs = require("fs");
const path = require("path");
const Conversation = require("../models/Conversation");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../data");
const MEMORY_FILE = path.join(DATA_DIR, "session_memory.json");

class ConversationMemoryManager {
    constructor() {
        this.sessions = new Map(); // sessionId -> { shortTerm: [], structured: {} }
        this._loadFromDisk();
    }

    _loadFromDisk() {
        try {
            if (fs.existsSync(MEMORY_FILE)) {
                const raw = fs.readFileSync(MEMORY_FILE, "utf8");
                const data = JSON.parse(raw);
                if (typeof data === "object" && data !== null) {
                    Object.keys(data).forEach(id => {
                        this.sessions.set(id, data[id]);
                    });
                }
            }
        } catch (e) {
            console.warn("[ConversationMemory] Failed to load session memory from disk:", e.message);
        }
    }

    _saveToDisk() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            const obj = {};
            this.sessions.forEach((val, key) => {
                obj[key] = val;
            });
            const tempPath = path.join(DATA_DIR, `conversation_memory.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
            fs.writeFileSync(tempPath, JSON.stringify(obj, null, 2), "utf8");
            try {
                fs.renameSync(tempPath, MEMORY_FILE);
            } catch (_) {
                fs.copyFileSync(tempPath, MEMORY_FILE);
                try { fs.unlinkSync(tempPath); } catch (e) { void e; }
            }
        } catch (e) {
            console.warn("[ConversationMemory] Failed to save session memory to disk:", e.message);
        }
    }

    /**
     * Persists session to MongoDB asynchronously if database is connected.
     */
    async _syncToDb(sessionId, data) {
        try {
            if (Conversation.db && Conversation.db.readyState === 1) {
                await Conversation.findOneAndUpdate(
                    { sessionId },
                    {
                        sessionId,
                        userId: data.userId || null,
                        shortTerm: data.shortTerm,
                        structured: data.structured,
                        updatedAt: new Date()
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (err) {
            // DB write warning non-blocking
        }
    }

    /**
     * Gets or initializes session memory for a specific unique session.
     * @param {string} sessionId
     * @returns {{ shortTerm: Array, structured: Object }}
     */
    getSession(sessionId = "default_session") {
        const id = (sessionId && String(sessionId).trim()) ? String(sessionId).trim() : "session_" + Date.now();
        
        if (!this.sessions.has(id)) {
            this.sessions.set(id, {
                sessionId: id,
                shortTerm: [],
                structured: {
                    location: null,
                    state: null,
                    district: null,
                    soil_type: null,
                    water_availability: null,
                    irrigation_method: null,
                    season: null,
                    current_crop: null,
                    previous_crop: null,
                    land_size: null,
                    budget_level: null,
                    farming_objective: null,
                    preferred_language: "EN",
                    crops: [],
                    lastRecommendedCrop: null,
                    lastCommodity: null,
                    lastIntent: null,
                    last_updated: new Date().toISOString()
                }
            });
        }
        return this.sessions.get(id);
    }

    /**
     * Alias method for processing user turn and extracting structured state.
     */
    processUserTurn(sessionId = "default_session", messageText = "") {
        return this.addMessage(sessionId, messageText, "user");
    }

    /**
     * Analyzes incoming message text and updates structured state.
     * @param {string} sessionId
     * @param {string} messageText
     * @param {string} sender - "user" | "bot"
     * @param {Array} history - optional client history payload
     * @param {string} agent - agent name tag
     */
    addMessage(sessionId = "default_session", messageText = "", sender = "user", history = [], agent = "Sahayak AI") {
        const session = this.getSession(sessionId);

        // Sync client-provided history if internal shortTerm is empty
        if (session.shortTerm.length === 0 && Array.isArray(history) && history.length > 0) {
            session.shortTerm = history.map(m => ({
                sender: m.sender || (m.role === 'user' ? 'user' : 'bot'),
                text: m.text || m.content || "",
                agent: m.agent || "Sahayak AI",
                timestamp: new Date().toISOString()
            }));
            
            history.forEach(h => {
                if (h.sender === "user" || h.role === "user") {
                    this._extractAndStoreEntities(session.structured, h.text || h.content || "");
                }
            });
        }

        const cleanText = (messageText || "").trim();
        if (cleanText) {
            session.shortTerm.push({
                sender,
                text: cleanText,
                agent,
                timestamp: new Date().toISOString()
            });

            // Keep sliding window of last 12 messages in short-term memory
            if (session.shortTerm.length > 12) {
                session.shortTerm = session.shortTerm.slice(-12);
            }

            if (sender === "user") {
                this._extractAndStoreEntities(session.structured, cleanText);
            }
        }

        session.structured.last_updated = new Date().toISOString();
        this._saveToDisk();
        this._syncToDb(sessionId, session);
        return session;
    }

    /**
     * Helper to process user turn and return updated structured memory state directly.
     */
    processUserTurn(sessionId = "default_session", messageText = "") {
        const session = this.addMessage(sessionId, messageText, "user");
        return session.structured;
    }

    /**
     * Gets formatted short-term conversation history text.
     */
    getFormattedHistory(sessionId = "default_session", limit = 6) {
        const session = this.getSession(sessionId);
        const recent = session.shortTerm.slice(-limit);
        return recent.length > 0
            ? recent.map(m => `${m.sender === "user" ? "Farmer" : (m.agent || "Sahayak AI")}: ${m.text}`).join("\n")
            : "No previous conversation history.";
    }

    /**
     * Updates structured location memory directly from location object or client payload.
     */
    updateLocationState(sessionId = "default_session", locationObj = {}) {
        const session = this.getSession(sessionId);
        if (locationObj && typeof locationObj === "object") {
            if (locationObj.formattedAddress) session.structured.location = locationObj.formattedAddress;
            if (locationObj.state) session.structured.state = locationObj.state;
            if (locationObj.district) session.structured.district = locationObj.district;
            if (locationObj.village) session.structured.village = locationObj.village;
            if (locationObj.latitude !== undefined) session.structured.latitude = locationObj.latitude;
            if (locationObj.longitude !== undefined) session.structured.longitude = locationObj.longitude;
            if (locationObj.accuracy !== undefined) session.structured.accuracy = locationObj.accuracy;
            session.structured.last_updated = new Date().toISOString();
            this._saveToDisk();
            this._syncToDb(sessionId, session);
        }
        return session.structured;
    }

    /**
     * Robust Entity Extractor for agricultural attributes.
     */
    _extractAndStoreEntities(structured, text) {
        const lower = text.toLowerCase();

        // 1. LOCATION (Indian States & UTs)
        const stateMatches = {
            telangana: "Telangana",
            "andhra pradesh": "Andhra Pradesh",
            andhra: "Andhra Pradesh",
            ap: "Andhra Pradesh",
            punjab: "Punjab",
            haryana: "Haryana",
            maharashtra: "Maharashtra",
            karnataka: "Karnataka",
            "tamil nadu": "Tamil Nadu",
            tn: "Tamil Nadu",
            "uttar pradesh": "Uttar Pradesh",
            up: "Uttar Pradesh",
            bihar: "Bihar",
            rajasthan: "Rajasthan",
            "madhya pradesh": "Madhya Pradesh",
            mp: "Madhya Pradesh",
            gujarat: "Gujarat",
            odisha: "Odisha",
            "west bengal": "West Bengal",
            wb: "West Bengal",
            kerala: "Kerala",
            assam: "Assam",
            "himachal pradesh": "Himachal Pradesh",
            hp: "Himachal Pradesh",
            uttarakhand: "Uttarakhand",
            "jammu & kashmir": "Jammu & Kashmir",
            jharkhand: "Jharkhand",
            chhattisgarh: "Chhattisgarh",
            goa: "Goa",
            delhi: "Delhi"
        };

        for (const [key, val] of Object.entries(stateMatches)) {
            const regex = new RegExp(`\\b${key}\\b`, "i");
            if (regex.test(lower)) {
                structured.state = val;
                structured.location = structured.district ? `${structured.district}, ${val}` : val;
                break;
            }
        }

        // Districts (Common agricultural districts)
        const districtMatches = ["warangal", "khammam", "karimnagar", "nalgonda", "nizamabad", "guntur", "kurnool", "ludhiana", "bhatinda", "nashik", "pune", "mandya", "bellary", "kolar", "madanapalle"];
        for (const dist of districtMatches) {
            if (lower.includes(dist)) {
                structured.district = dist.charAt(0).toUpperCase() + dist.slice(1);
                if (structured.state) {
                    structured.location = `${structured.district}, ${structured.state}`;
                } else {
                    structured.location = structured.district;
                }
                break;
            }
        }

        // 2. SOIL TYPE
        if (/(black soil|black cotton soil|nalla regadi|kali mitti|regur)/i.test(lower)) {
            structured.soil_type = "Black Soil";
        } else if (/(red soil|erra nelalu|lal mitti|red loamy)/i.test(lower)) {
            structured.soil_type = "Red Soil";
        } else if (/(sandy loam|sandy soil|balu mitti|isuka nelalu)/i.test(lower)) {
            structured.soil_type = "Sandy Loam Soil";
        } else if (/(alluvial soil|gangetic soil)/i.test(lower)) {
            structured.soil_type = "Alluvial Soil";
        } else if (/(clay soil|bodi nelalu|chikkani mitti)/i.test(lower)) {
            structured.soil_type = "Clay Soil";
        }

        // 3. WATER AVAILABILITY / IRRIGATION METHOD
        if (/(limited water|water is limited|water limited|low water|water shortage|drought|less water|water crisis|నీరు తక్కువ|कम पानी|पानी की कमी)/i.test(lower)) {
            structured.water_availability = "Limited / Low Water";
        } else if (/(rainfed|dependent on rain|monsoon dependent|వర్షాధార)/i.test(lower)) {
            structured.water_availability = "Rainfed (Monsoon Dependent)";
            structured.irrigation_method = "Rainfed";
        } else if (/(drip|drip irrigation|డ్రిప్)/i.test(lower)) {
            structured.irrigation_method = "Drip Irrigation";
            if (!structured.water_availability) structured.water_availability = "Moderate (Drip Managed)";
        } else if (/(borewell|tubewell|well water|బోరు)/i.test(lower)) {
            structured.irrigation_method = "Borewell / Tubewell";
            if (!structured.water_availability) structured.water_availability = "Adequate Groundwater";
        } else if (/(canal|river|abundant water|కలవ)/i.test(lower)) {
            structured.irrigation_method = "Canal Irrigation";
            structured.water_availability = "Abundant Water";
        }

        // 4. SEASON
        if (/(kharif|monsoon season|rainy season|వానాకాలం|खरीफ)/i.test(lower)) {
            structured.season = "Kharif (Monsoon)";
        } else if (/(rabi|winter season|చలికాలం|रबी)/i.test(lower)) {
            structured.season = "Rabi (Winter)";
        } else if (/(zaid|summer season|ఎండాకాలం|जायद)/i.test(lower)) {
            structured.season = "Zaid (Summer)";
        }

        // 5. CROPS
        const cropMap = {
            cotton: "Cotton",
            paddy: "Paddy / Rice",
            rice: "Paddy / Rice",
            wheat: "Wheat",
            maize: "Maize / Corn",
            corn: "Maize / Corn",
            "red gram": "Red Gram (Pigeonpea)",
            tur: "Red Gram (Pigeonpea)",
            kandi: "Red Gram (Pigeonpea)",
            moong: "Green Gram (Moong)",
            "green gram": "Green Gram (Moong)",
            pesalu: "Green Gram (Moong)",
            urad: "Black Gram (Urad)",
            "black gram": "Black Gram (Urad)",
            minumulu: "Black Gram (Urad)",
            groundnut: "Groundnut (Peanut)",
            peanut: "Groundnut (Peanut)",
            mustard: "Mustard",
            sarson: "Mustard",
            chilli: "Chilli",
            mirchi: "Chilli",
            tomato: "Tomato",
            potato: "Potato"
        };

        const entityNormalizer = require("./agriculturalEntityNormalizer");
        const cropRes = entityNormalizer.normalizeCrop(text);
        if (cropRes.matched) {
            structured.current_crop = cropRes.displayName;
            structured.lastCommodity = cropRes.canonical;
        }

        const locRes = entityNormalizer.normalizeLocation(text);
        if (locRes.matched) {
            if (locRes.state) structured.state = locRes.state;
            if (locRes.type === "district") structured.district = locRes.canonical;
            structured.location = structured.district && structured.state ? `${structured.district}, ${structured.state}` : (structured.district || structured.state);
        }

        // 6. LAND SIZE
        const landMatch = lower.match(/(\d+(?:\.\d+)?)\s*(acre|acres|hectare|hectares|guntas|bigha)/i);
        if (landMatch) {
            structured.land_size = `${landMatch[1]} ${landMatch[2]}`;
        }

        // 7. PREFERRED LANGUAGE
        if (/[\u0C00-\u0C7F]/.test(text)) structured.preferred_language = "TE";
        else if (/[\u0900-\u097F]/.test(text)) structured.preferred_language = "HI";
        else if (structured.preferred_language === undefined) structured.preferred_language = "EN";
    }

    /**
     * Builds consolidated prompt context string incorporating structured state and short-term memory.
     * @param {string} sessionId
     * @returns {{ structuredSummary: string, shortTermHistory: string, structuredState: Object }}
     */
    composeContext(sessionId = "default_session") {
        const session = this.getSession(sessionId);
        const s = session.structured;

        const stateItems = [];
        if (s.location) stateItems.push(`Location: ${s.location}`);
        if (s.soil_type) stateItems.push(`Soil Type: ${s.soil_type}`);
        if (s.water_availability) stateItems.push(`Water Availability: ${s.water_availability}`);
        if (s.irrigation_method) stateItems.push(`Irrigation Method: ${s.irrigation_method}`);
        if (s.season) stateItems.push(`Farming Season: ${s.season}`);
        if (s.current_crop) stateItems.push(`Target Crop: ${s.current_crop}`);
        if (s.land_size) stateItems.push(`Farm Size: ${s.land_size}`);
        if (Array.isArray(s.crops) && s.crops.length) {
            const cropText = s.crops.map(c => typeof c === 'string' ? c : [c.name || c.crop, c.growthStage || c.stage].filter(Boolean).join(' — ')).filter(Boolean).join(', ');
            if (cropText) stateItems.push(`Registered Crops: ${cropText}`);
        }
        if (s.growth_stage) stateItems.push(`Crop Growth Stage: ${s.growth_stage}`);

        const structuredSummary = stateItems.length > 0
            ? `📌 KNOWN FARMER CONTEXT:\n` + stateItems.map(item => `  - ${item}`).join("\n") +
              `\n⚠️ CRITICAL MANDATE: DO NOT re-ask the farmer for any of the above information! Use these known parameters directly in your answer.`
            : `📌 KNOWN FARMER CONTEXT: No prior details registered yet.`;

        const recent = session.shortTerm.slice(-6);
        const shortTermHistory = recent.length > 0
            ? recent.map(m => `${m.sender === "user" ? "Farmer" : (m.agent || "Sahayak AI")}: ${m.text}`).join("\n")
            : "No previous conversation history.";

        return {
            structuredSummary,
            shortTermHistory,
            structuredState: s
        };
    }

    /**
     * Directly syncs a structured farm profile object into session memory.
     */
    syncFarmProfileState(sessionId = "default_session", farmProfile = {}) {
        const session = this.getSession(sessionId);
        const s = session.structured;

        if (farmProfile.location?.formattedAddress) s.location = farmProfile.location.formattedAddress;
        if (farmProfile.location?.state) s.state = farmProfile.location.state;
        if (farmProfile.location?.district) s.district = farmProfile.location.district;
        if (farmProfile.land?.sizeAcres) s.land_size = `${farmProfile.land.sizeAcres} Acres`;
        if (farmProfile.soilType) s.soil_type = farmProfile.soilType;
        if (Array.isArray(farmProfile.irrigation)) s.irrigation_method = farmProfile.irrigation.join(", ");
        if (farmProfile.season) s.season = farmProfile.season;
        if (farmProfile.primaryCrop) s.current_crop = farmProfile.primaryCrop;
        if (Array.isArray(farmProfile.crops)) {
            s.crops = farmProfile.crops;
        }
        if (farmProfile.growthStage || farmProfile.cropStage) s.growth_stage = farmProfile.growthStage || farmProfile.cropStage;
        if (farmProfile.farmingMethod) s.farming_objective = farmProfile.farmingMethod;

        s.last_updated = new Date().toISOString();
        this._saveToDisk();
        this._syncToDb(sessionId, session);
        return s;
    }

    /**
     * Resets conversation memory for a session.
     */
    resetSession(sessionId = "default_session") {
        this.sessions.delete(sessionId);
        this._saveToDisk();
    }
}

module.exports = new ConversationMemoryManager();
