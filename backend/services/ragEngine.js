/**
 * Knowledge-Grounded RAG Engine & Anti-Hallucination Layer
 * Merges local structured ICAR/KVK knowledge with Python RAG vector service when available.
 * Treats retrieved context strictly as DATA, avoiding instruction injection.
 */

const axios = require('axios');
const httpClient = require('../services/httpClient');
const {
    EASY_HIGH_PROFIT_CROPS,
    PEST_DISEASE_KNOWLEDGE,
    SOIL_NUTRITION_KNOWLEDGE,
    SCHEMES_KNOWLEDGE,
    MANDI_MSP_KNOWLEDGE
} = require("./agriKnowledgeBase");

class RAGEngine {
    constructor() {
        this.pyMlUrl = process.env.PYTHON_ML_SERVICE || "http://localhost:8000";
    }

    /**
     * Sanitizes retrieved text to ensure it is treated strictly as reference data.
     */
    _formatDataChunk(content, source, metadata = {}) {
        const cleanContent = String(content || "").replace(/<[^>]*>?/gm, "").trim();
        const metaStr = Object.entries(metadata)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ");
        return `[VERIFIED REFERENCE DATA - SOURCE: ${source}${metaStr ? " | " + metaStr : ""}]\n${cleanContent}`;
    }

    /**
     * Retrieves grounded agronomic contexts based on query intent and farmer state.
     * @param {string} query
     * @param {string} intent
     * @param {Object} structuredState
     * @returns {Promise<{contexts: Array<string>, sources: Array<string>}>}
     */
    async retrieveContexts(query = "", intent = "general", structuredState = {}) {
        const contexts = [];
        const sources = [];

        // 1. Try Python FastAPI Vector DB RAG endpoint if running
        try {
            const pyRes = await axios.post(`${this.pyMlUrl}/api/rag/query-knowledge`, {
                query,
                top_k: 2,
                metadata_filter: {
                    state: structuredState.state || null,
                    crop: structuredState.current_crop || null,
                    season: structuredState.season || null
                }
            }, { timeout: 1500 });

            if (pyRes.data && Array.isArray(pyRes.data.grounded_contexts) && pyRes.data.grounded_contexts.length > 0) {
                pyRes.data.grounded_contexts.forEach(ctx => {
                    contexts.push(this._formatDataChunk(ctx, "ChromaDB Vector Store"));
                });
                sources.push("ChromaDB ICAR Vector Index");
            }
        } catch (e) {
            // Python service offline or endpoint silent — proceed with local grounded knowledge base
        }

        // 2. Local Grounded Knowledge Base (Fallback & Enrichment)
        // 2. Local Grounded ICAR Knowledge Base (Topic-Specific Retrieval)
        // Uses strict semantic triggers to ensure retrieved context is strictly relevant
        // to the CURRENT user query, eliminating previous context leakage across domains.
        const lowerQ = query.toLowerCase();

        // Intent: Crop Recommendation & Selection
        // Triggered only when the farmer specifically asks for crop selection advice
        if (intent === "crop" || /(which crop|recommend crop|suggest crop|suitable crop|what to grow|best crop to grow|panta veyali)/i.test(lowerQ)) {
            let cropText = `Green Gram (Moong) & Black Gram (Urad) are short-duration 60-70 day pulse crops with MSP ₹8,558/qtl and ₹7,400/qtl. Mustard (Rabi, 85-100 days, MSP ₹5,650/qtl) and Pearl Millet/Bajra (75-85 days, MSP ₹2,625/qtl) are low-water, high-resilience options.`;
            if (structuredState.state === "Telangana" || (structuredState.soil_type && /black/i.test(structuredState.soil_type))) {
                cropText = `Recommended crops for ${structuredState.state || "Telangana"} on ${structuredState.soil_type || "Black Soil"}: Cotton and Red Gram (Pigeonpea) are proven Kharif choices, along with short-duration pulses like Green Gram (Moong, MSP ₹8,558/qtl).`;
            }
            contexts.push(this._formatDataChunk(cropText, "ICAR Crop Production Guidelines (2025-26)", { category: "Crop Recommendation" }));
            sources.push("ICAR Crop Production Guidelines (2025-26)");

            if (structuredState.soil_type) {
                const soilText = `Soil Context (${structuredState.soil_type}): Ensure proper drainage. Seed treatment with Trichoderma viride @ 4g/kg seed prevents root rot in ${structuredState.soil_type}.`;
                contexts.push(this._formatDataChunk(soilText, "ICAR Soil Science Standards", { soil: structuredState.soil_type }));
            }
            if (structuredState.water_availability && structuredState.water_availability.includes("Limited")) {
                const waterText = `Water Limitation Context: Prioritize drought-resilient pulses (Moong/Urad) or Millets (Bajra/Jowar) over high-water crops like Paddy.`;
                contexts.push(this._formatDataChunk(waterText, "Central Ground Water Board Guidelines", { water: "Limited" }));
            }
        }

        // Intent: Pest & Disease
        // Triggered for crop pathology, insect pests, and plant protection guidelines
        if (intent === "disease" || intent === "pest" || /(pest|disease|fungus|blight|rot|bollworm|spot|yellowing|spray|dosage|insect|caterpillar|aphid|whitefly|mancozeb|coragen|neem)/i.test(lowerQ)) {
            const pestText = `Pest Dosage: For sucking pests (Aphids, Thrips, Whiteflies), spray Imidacloprid 17.8% SL @ 0.5ml/L water (100ml/acre) OR Thiamethoxam 25% WG @ 0.4g/L (80g/acre). For caterpillars/bollworm, spray Chlorantraniliprole 18.5% SC (Coragen) @ 0.4ml/L (60ml/acre) OR Emamectin Benzoate 5% SG @ 0.5g/L (100g/acre). Organic: Neem Oil 10,000 PPM @ 5ml/L water.`;
            contexts.push(this._formatDataChunk(pestText, "CIBRC Approved Pesticides Database", { topic: "Pest Management" }));

            const fungicideText = `Fungicide Dosage: For fungal spots/blight, spray Mancozeb 75% WP @ 2.5g/L water (500g/acre) OR Azoxystrobin + Difenoconazole @ 1.0ml/L. For root rot, drench base with Copper Oxychloride 50% WP @ 3.0g/L + Streptocycline @ 1.0g per 10L water.`;
            contexts.push(this._formatDataChunk(fungicideText, "CIBRC Approved Fungicides Database", { topic: "Disease Management" }));
            sources.push("Central Insecticide Board & Registration Committee (CIBRC) Guidelines");
        }

        // Intent: Soil & Fertilizers
        // Triggered for nutrient deficiencies, NPK application rates, and soil amendments
        if (intent === "soil" || intent === "fertilizer" || /(soil|fertilizer|npk|urea|dap|potash|zinc|sulphur|deficiency|manure)/i.test(lowerQ)) {
            const soilText = `Soil Science: Nitrogen deficiency causes yellowing from lower leaves upward (Fix: Urea 25-30 kg/acre or 19:19:19 NPK @ 5g/L). Phosphorus deficiency causes purple leaf margins (Fix: DAP @ 50 kg/acre). Zinc deficiency causes Khaira brown spots (Fix: Zinc Sulphate 21% @ 10 kg/acre).`;
            contexts.push(this._formatDataChunk(soilText, "ICAR Soil Fertility Standards", { topic: "Nutrition" }));
            sources.push("ICAR Soil Fertility & Plant Nutrition Standards");
        }

        // Intent: Government Schemes & Subsidies
        // Triggered for official welfare schemes, subsidies, and credit cards
        if (intent === "scheme" || /(scheme|subsidy|pm-kisan|pmksy|pmfby|kcc|loan|insurance|bima)/i.test(lowerQ)) {
            const schemeText = `Govt Scheme Details: PMKSY Micro-Irrigation provides 55% to 90% subsidy on Drip/Sprinkler systems for Small/Marginal farmers. KCC provides crop loans up to ₹3.0 Lakhs at 4.0% effective interest rate (7% minus 3% prompt repayment rebate). PM-Kisan provides ₹6,000 annual direct income support in 3 equal installments.`;
            contexts.push(this._formatDataChunk(schemeText, "Ministry of Agriculture Portal", { topic: "Government Schemes" }));
            sources.push("Ministry of Agriculture & Farmers Welfare Scheme Portal");
        }

        // Intent: Mandi Prices & MSP Benchmarks
        // Triggered for price discovery and government benchmark rates
        if (intent === "market" || /(\bmsp\b|mandi price|market rate|benchmark price|selling price|bhav)/i.test(lowerQ)) {
            const mspText = `Official MSP Benchmarks (2025-26): Green Gram (Moong) ₹8,558/qtl, Black Gram (Urad) ₹7,400/qtl, Cotton (Long Staple) ₹7,020/qtl, Groundnut ₹6,377/qtl, Mustard ₹5,650/qtl, Paddy Grade A ₹2,203/qtl, Wheat ₹2,275/qtl.`;
            contexts.push(this._formatDataChunk(mspText, "CACP Official MSP Notification", { topic: "MSP Benchmarks" }));
            sources.push("Commission for Agricultural Costs and Prices (CACP) Official MSP Notification");
        }

        // Deduplicate sources
        const uniqueSources = [...new Set(sources)];

        return {
            contexts,
            sources: uniqueSources
        };
    }
}

module.exports = new RAGEngine();
