/**
 * Agricultural Entity Normalizer & Typo Correction Engine
 * 
 * Performs fuzzy string matching, Levenshtein edit-distance calculation, 
 * n-gram tokenization, multilingual alias mapping (English, Telugu, Hindi), 
 * and entity category classification for domain-driven conversational AI.
 */

// Comprehensive Agricultural Vocabulary & Entity Dictionary
const CROP_DICTIONARY = [
    {
        id: "chilli",
        canonical: "chilli",
        displayName: "Chilli",
        aliases: ["chilli", "chillies", "chili", "chilies", "chiili", "chil", "chilii", "mirchi", "mirapakaya", "mirpa", "మిర్చి", "మిరప", "மிளகாய்", "मिर्च", "लाल मिर्च", "हरी मिर्च", "red chilli", "green chilli"]
    },
    {
        id: "cotton",
        canonical: "cotton",
        displayName: "Cotton",
        aliases: ["cotton", "cottn", "cotten", "kapas", "kapaas", "patti", "పత్తి", "కపాస్", "कपास"]
    },
    {
        id: "rice",
        canonical: "rice",
        displayName: "Rice (Paddy)",
        aliases: ["rice", "paddy", "pady", "padi", "vari", "chawal", "chaval", "ధానం", "వరి", "चावल", "धान"]
    },
    {
        id: "tomato",
        canonical: "tomato",
        displayName: "Tomato",
        aliases: ["tomato", "tomatoes", "tomatoe", "tomat", "tamatar", "tamatr", "టమాట", "టమాటో", "टमाटर"]
    },
    {
        id: "potato",
        canonical: "potato",
        displayName: "Potato",
        aliases: ["potato", "potatoes", "potatoe", "potat", "aalu", "alugadda", "ఆలూ", "ఆలుగడ్డ", "आलू"]
    },
    {
        id: "onion",
        canonical: "onion",
        displayName: "Onion",
        aliases: ["onion", "onions", "onoin", "onionn", "pyaz", "pyaaz", "ullipaya", "ఉల్లిపాయ", "प्याज"]
    },
    {
        id: "red_gram",
        canonical: "red gram",
        displayName: "Red Gram (Arhar/Tur)",
        aliases: ["red gram", "redgram", "pigeon pea", "pigeonpea", "toor", "tur", "arhar", "kandi", "kandulu", "కంది", "కందులు", "तुअर", "अरहर"]
    },
    {
        id: "green_gram",
        canonical: "green gram",
        displayName: "Green Gram (Moong)",
        aliases: ["green gram", "greengram", "moong", "moong dal", "mung", "pesalu", "పెసర్లు", "मूंग"]
    },
    {
        id: "black_gram",
        canonical: "black gram",
        displayName: "Black Gram (Urad)",
        aliases: ["black gram", "blackgram", "urad", "urad dal", "minumulu", "మినుములు", "उड़द"]
    },
    {
        id: "chickpea",
        canonical: "chickpea",
        displayName: "Chickpea (Chana)",
        aliases: ["chickpea", "chick pea", "gram", "chana", "senagalu", "శెనగలు", "चना"]
    },
    {
        id: "groundnut",
        canonical: "groundnut",
        displayName: "Groundnut (Peanut)",
        aliases: ["groundnut", "peanut", "peanuts", "verusenaga", "వేరుశనగ", "मूंगफली"]
    },
    {
        id: "maize",
        canonical: "maize",
        displayName: "Maize (Corn)",
        aliases: ["maize", "corn", "makka", "makkajonna", "మొక్కజొన్న", "मक्का"]
    },
    {
        id: "turmeric",
        canonical: "turmeric",
        displayName: "Turmeric",
        aliases: ["turmeric", "haldi", "pasupu", "పసుపు", "हल्दी"]
    },
    {
        id: "wheat",
        canonical: "wheat",
        displayName: "Wheat",
        aliases: ["wheat", "gehun", "gehu", "godumalu", "గోధుమలు", "गेहूं"]
    },
    {
        id: "mustard",
        canonical: "mustard",
        displayName: "Mustard",
        aliases: ["mustard", "sarson", "aavalu", "ఆవాలు", "सरसों"]
    },
    {
        id: "sugarcane",
        canonical: "sugarcane",
        displayName: "Sugarcane",
        aliases: ["sugarcane", "ganna", "cheraku", "చెరకు", "गन्ना"]
    }
];

const LOCATION_DICTIONARY = [
    { canonical: "Telangana", type: "state", aliases: ["telangana", "ts", "telangna", "తెలంగాణ", "तेलंगाना"] },
    { canonical: "Andhra Pradesh", type: "state", aliases: ["andhra pradesh", "andhra", "ap", "ఆంధ్రప్రదేశ్", "आंध्र प्रदेश"] },
    { canonical: "Punjab", type: "state", aliases: ["punjab", "punjab", "పంజాబ్", "पंजाब"] },
    { canonical: "Haryana", type: "state", aliases: ["haryana", "హర్యానా", "हरियाणा"] },
    { canonical: "Maharashtra", type: "state", aliases: ["maharashtra", "mh", "మహారాష్ట్ర", "महाराष्ट्र"] },
    { canonical: "Karnataka", type: "state", aliases: ["karnataka", "ka", "కర్ణాటక", "कर्नाटक"] },
    { canonical: "Tamil Nadu", type: "state", aliases: ["tamil nadu", "tn", "తమిళనాడు", "तमिलनाडु"] },
    { canonical: "Uttar Pradesh", type: "state", aliases: ["uttar pradesh", "up", "उत्तर प्रदेश"] },
    { canonical: "Bihar", type: "state", aliases: ["bihar", "బీహార్", "बिहार"] },
    { canonical: "Rajasthan", type: "state", aliases: ["rajasthan", "రాజస్థాన్", "राजस्थान"] },
    { canonical: "Madhya Pradesh", type: "state", aliases: ["madhya pradesh", "mp", "మధ్యప్రదేశ్", "मध्य प्रदेश"] },
    { canonical: "Gujarat", type: "state", aliases: ["gujarat", "గుజరాత్", "गुजरात"] },
    
    // Key Mandis / Districts
    { canonical: "Warangal", type: "district", state: "Telangana", aliases: ["warangal", "warangal mandi", "ఓరుగల్లు", "వరంగల్", "वारंगल"] },
    { canonical: "Hyderabad", type: "district", state: "Telangana", aliases: ["hyderabad", "hyd", "హైదరాబాద్", "हैदराबाद"] },
    { canonical: "Khammam", type: "district", state: "Telangana", aliases: ["khammam", "ఖమ్మం", "खम्मम"] },
    { canonical: "Karimnagar", type: "district", state: "Telangana", aliases: ["karimnagar", "కరీంనగర్", "करीमनगर"] },
    { canonical: "Nalgonda", type: "district", state: "Telangana", aliases: ["nalgonda", "నల్గొండ", "नलगोंडा"] },
    { canonical: "Nizamabad", type: "district", state: "Telangana", aliases: ["nizamabad", "నిజామాబాద్", "निज़ामाबाद"] },
    { canonical: "Guntur", type: "district", state: "Andhra Pradesh", aliases: ["guntur", "గుంటూరు", "गुंटूर"] },
    { canonical: "Kurnool", type: "district", state: "Andhra Pradesh", aliases: ["kurnool", "కర్నూలు", "कुर्नूल"] },
    { canonical: "Ludhiana", type: "district", state: "Punjab", aliases: ["ludhiana", "लुधियाना"] },
    { canonical: "Nashik", type: "district", state: "Maharashtra", aliases: ["nashik", "nasik", "नासिक"] },
    { canonical: "Pune", type: "district", state: "Maharashtra", aliases: ["pune", "पुणे"] }
];

const SOIL_DICTIONARY = [
    { canonical: "Black Soil", aliases: ["black soil", "black", "black cotton", "nalla regadi", "regur", "నల్ల రేగడి", "काळी माती"] },
    { canonical: "Red Soil", aliases: ["red soil", "red", "erra nelalu", "lal mitti", "ఎర్ర నేలలు", "लाल मिट्टी"] },
    { canonical: "Alluvial Soil", aliases: ["alluvial soil", "alluvial", "voddu nelalu", "जलोढ़"] },
    { canonical: "Clay Soil", aliases: ["clay soil", "clay", "bodi nelalu", "chikkani mitti", "चिकनी मिट्टी"] }
];

class AgriculturalEntityNormalizer {

    /**
     * Compute Levenshtein distance between two strings
     */
    levenshteinDistance(a = "", b = "") {
        const matrix = [];
        const lenA = a.length;
        const lenB = b.length;

        for (let i = 0; i <= lenB; i++) matrix[i] = [i];
        for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

        for (let i = 1; i <= lenB; i++) {
            for (let j = 1; j <= lenA; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    );
                }
            }
        }
        return matrix[lenB][lenA];
    }

    /**
     * Calculate normalized similarity ratio (0.0 to 1.0)
     */
    calculateSimilarity(str1 = "", str2 = "") {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        if (s1 === s2) return 1.0;

        const maxLen = Math.max(s1.length, s2.length);
        if (maxLen === 0) return 1.0;

        const dist = this.levenshteinDistance(s1, s2);
        return 1.0 - (dist / maxLen);
    }

    /**
     * Normalize Crop Entity from natural language text with fuzzy typo tolerance
     */
    normalizeCrop(query = "") {
        const lower = query.toLowerCase().trim();
        const tokens = lower.split(/[\s,?.!/\\-]+/).filter(t => t.length >= 2);

        // 1. Direct Phrase / Word Match with word boundaries
        for (const item of CROP_DICTIONARY) {
            for (const alias of item.aliases) {
                const escaped = alias.replace(/[-[\]{}()*+? me:?\\^$|#\s]/g, '\\$&');
                // Use word boundary for ascii, direct includes for unicode (Telugu/Hindi)
                const isUnicode = /[\u0C00-\u0C7F\u0900-\u097F]/.test(alias);
                const regex = isUnicode ? new RegExp(escaped, "i") : new RegExp(`\\b${escaped}\\b`, "i");
                if (regex.test(lower)) {
                    return {
                        matched: true,
                        id: item.id,
                        canonical: item.canonical,
                        displayName: item.displayName,
                        matchedAlias: alias,
                        confidence: 0.98,
                        method: "exact_phrase"
                    };
                }
            }
        }

        // 2. Token-level Fuzzy Match
        const STOP_WORDS = new Set(["what", "which", "where", "when", "how", "who", "why", "tell", "show", "give", "price", "prices", "market", "mandi", "rate", "rates", "cost", "today"]);
        let bestMatch = null;
        let highestConfidence = 0;

        for (const token of tokens) {
            if (STOP_WORDS.has(token.toLowerCase())) continue;
            for (const item of CROP_DICTIONARY) {
                for (const alias of item.aliases) {
                    const aliasLower = alias.toLowerCase();
                    // Skip multi-word alias comparison against single token unless token is long
                    if (aliasLower.includes(" ") && !token.includes(" ")) continue;

                    const maxAllowedDist = token.length <= 4 ? 1 : 2;
                    const dist = this.levenshteinDistance(token, aliasLower);

                    if (dist <= maxAllowedDist) {
                        const sim = 1.0 - (dist / Math.max(token.length, aliasLower.length));
                        if (sim > highestConfidence && sim >= 0.70) {
                            highestConfidence = sim;
                            bestMatch = {
                                matched: true,
                                id: item.id,
                                canonical: item.canonical,
                                displayName: item.displayName,
                                matchedAlias: alias,
                                matchedToken: token,
                                confidence: Math.round(sim * 100) / 100,
                                method: "fuzzy_typo"
                            };
                        }
                    }
                }
            }
        }

        if (bestMatch && bestMatch.confidence >= 0.70) {
            return bestMatch;
        }

        return { matched: false, canonical: null, confidence: 0 };
    }

    /**
     * Normalize Location Entity (State, District, Mandi)
     */
    normalizeLocation(query = "") {
        const lower = query.toLowerCase().trim();

        // 1. Direct match with word boundaries
        for (const item of LOCATION_DICTIONARY) {
            for (const alias of item.aliases) {
                const escaped = alias.replace(/[-[\]{}()*+? me:?\\^$|#\s]/g, '\\$&');
                const isUnicode = /[\u0C00-\u0C7F\u0900-\u097F]/.test(alias);
                const regex = isUnicode ? new RegExp(escaped, "i") : new RegExp(`\\b${escaped}\\b`, "i");
                if (regex.test(lower)) {
                    return {
                        matched: true,
                        canonical: item.canonical,
                        type: item.type,
                        state: item.state || (item.type === "state" ? item.canonical : null),
                        confidence: 0.95
                    };
                }
            }
        }

        // 2. Fuzzy match for location typos
        const tokens = lower.split(/[\s,?.!/\\-]+/).filter(t => t.length >= 4);
        for (const token of tokens) {
            for (const item of LOCATION_DICTIONARY) {
                for (const alias of item.aliases) {
                    if (this.levenshteinDistance(token, alias.toLowerCase()) <= 1) {
                        return {
                            matched: true,
                            canonical: item.canonical,
                            type: item.type,
                            state: item.state || (item.type === "state" ? item.canonical : null),
                            confidence: 0.85,
                            method: "fuzzy"
                        };
                    }
                }
            }
        }

        return { matched: false, canonical: null, state: null };
    }

    /**
     * Normalize Soil Entity
     */
    normalizeSoil(query = "") {
        const lower = query.toLowerCase().trim();
        for (const item of SOIL_DICTIONARY) {
            for (const alias of item.aliases) {
                const escaped = alias.replace(/[-[\]{}()*+? me:?\\^$|#\s]/g, '\\$&');
                const isUnicode = /[\u0C00-\u0C7F\u0900-\u097F]/.test(alias);
                const regex = isUnicode ? new RegExp(escaped, "i") : new RegExp(`\\b${escaped}\\b`, "i");
                if (regex.test(lower)) {
                    return { matched: true, canonical: item.canonical, confidence: 0.95 };
                }
            }
        }
        return { matched: false, canonical: null };
    }

    /**
     * Anaphora & Reference Resolution Engine (Section 12)
     * Resolves pronouns ("it", "its", "this", "that", "the crop", "my soil", "the price")
     * using active session context.
     */
    resolveReference(query = "", sessionContext = {}) {
        const lower = query.toLowerCase().trim();
        let resolvedCommodity = sessionContext.lastRecommendedCrop || sessionContext.lastCommodity || sessionContext.current_crop || null;
        let resolvedLocation = sessionContext.location || sessionContext.state || sessionContext.district || null;
        let resolvedSoil = sessionContext.soil_type || sessionContext.soil || null;

        let rewrittenQuery = query;

        // Pronoun / Reference substitution for crops ("its price", "grow it", "how much is it")
        if (resolvedCommodity && (/\b(it|its|this|that|the crop|this crop|my crop|the commodity)\b/i.test(lower))) {
            rewrittenQuery = rewrittenQuery.replace(/\b(it|its|this|that|the crop|this crop|my crop|the commodity)\b/gi, resolvedCommodity);
        }

        // Reference substitution for soil
        if (resolvedSoil && (/\b(my soil|the soil|this soil)\b/i.test(lower))) {
            rewrittenQuery = rewrittenQuery.replace(/\b(my soil|the soil|this soil)\b/gi, resolvedSoil);
        }

        return {
            originalQuery: query,
            rewrittenQuery,
            resolvedCommodity,
            resolvedLocation,
            resolvedSoil
        };
    }
}

module.exports = new AgriculturalEntityNormalizer();
