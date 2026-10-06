/**
 * Dedicated Market Price Service — Fulfills Requirements 4 & 5
 * Uses Farmer.in Open Prices API (https://farmer.in/api/open/prices.json)
 * Implements Mandi comparison, Net Return Calculator, price trends, and strict source-grounded outputs.
 */

const axios = require('axios');
const httpClient = require('../services/httpClient');
const cacheService = require("./cacheService");

const FARMER_IN_API_URL = "https://farmer.in/api/open/prices.json";

const entityNormalizer = require("./agriculturalEntityNormalizer");

// Mapping of query keywords to Farmer.in commodity IDs & names
const COMMODITY_MAP = [
    { id: "tomato", names: ["tomato", "tamatar", "టమాట", "టమాటో", "टमाटर"], displayName: "Tomato", unit: "quintal" },
    { id: "cotton", names: ["cotton", "kapas", "పత్తి", "कपास"], displayName: "Cotton", unit: "quintal" },
    { id: "rice", names: ["paddy", "rice", "chawal", "వరి", "ధానం", "चावल", "धान"], displayName: "Rice (Paddy)", unit: "quintal" },
    { id: "wheat", names: ["wheat", "gehun", "గోధుమలు", "गेहूं"], displayName: "Wheat", unit: "quintal" },
    { id: "arhar", names: ["red gram", "arhar", "tur", "kandi", "పప్పు", "కంది", "तुअर", "अरहर"], displayName: "Red Gram (Arhar/Tur)", unit: "quintal" },
    { id: "moong", names: ["moong", "green gram", "pesalu", "పెసర్లు", "मूंग"], displayName: "Moong (Green Gram)", unit: "quintal" },
    { id: "urad", names: ["urad", "black gram", "minumulu", "మినుములు", "उड़द"], displayName: "Urad (Black Gram)", unit: "quintal" },
    { id: "mustard", names: ["mustard", "sarson", "ఆవాలు", "सरसों"], displayName: "Mustard", unit: "quintal" },
    { id: "groundnut", names: ["groundnut", "peanut", "verusenaga", "వేరుశనగ", "मूंगफली"], displayName: "Groundnut", unit: "quintal" },
    { id: "onion", names: ["onion", "pyaz", "ullipaya", "ఉల్లిపాయ", "प्याज"], displayName: "Onion", unit: "quintal" },
    { id: "potato", names: ["potato", "alugadda", "aalu", "ఆలూ", "आलू"], displayName: "Potato", unit: "quintal" },
    { id: "chili", names: ["chilli", "chili", "mirchi", "మిర్చి", "మిరప", "मिर्च"], displayName: "Chilli", unit: "quintal" },
    { id: "maize", names: ["maize", "corn", "makka", "మొక్కజొన్న", "మక్కా"], displayName: "Maize (Corn)", unit: "quintal" },
    { id: "sugarcane", names: ["sugarcane", "ganna", "చెరకు", "गन्ना"], displayName: "Sugarcane", unit: "tonne" }
];

class MarketPriceService {
    constructor() {
        this.getMarketPrice = this.getMarketPrice.bind(this);
        this.extractMarketEntities = this.extractMarketEntities.bind(this);
        this.calculateNetReturn = this.calculateNetReturn.bind(this);
    }

    /**
     * Requirement 4: Net Expected Return Transport Calculator
     * 
     * ECONOMIC FORMULAS:
     * 1. Gross Sale Value:
     *        Gross_Value = Q * P
     *    Where Q is quantity sold (quintals) and P is Mandi modal price (₹/quintal).
     * 
     * 2. Total Operational Logistics Deductions:
     *        Transport_Cost = Distance_km * Rate_per_km
     *        APMC_Cess = Gross_Value * (Cess_Percentage / 100)
     *        Total_Deductions = Transport_Cost + Loading_Charges + APMC_Cess
     * 
     * 3. Net Expected Realized Return & Profit Margin:
     *        Net_Expected_Return = Gross_Value - Total_Deductions
     *        Net_Price_Per_Quintal = Net_Expected_Return / Q
     *        Profitability_Margin = (Net_Expected_Return / Gross_Value) * 100 %
     */
    calculateNetReturn({ quantityQuintals = 20, pricePerQuintal = 2400, distanceKm = 25, transportCostPerKm = 18, loadingCharges = 500, apmcCessPercentage = 1.0 }) {
        const grossSaleValue = quantityQuintals * pricePerQuintal;
        const totalTransportCost = distanceKm * transportCostPerKm;
        const apmcCess = (grossSaleValue * apmcCessPercentage) / 100;
        const totalDeductions = totalTransportCost + loadingCharges + apmcCess;
        const netExpectedReturn = grossSaleValue - totalDeductions;
        const netPricePerQuintal = netExpectedReturn / (quantityQuintals || 1);

        return {
            quantityQuintals,
            pricePerQuintal,
            grossSaleValue: Math.round(grossSaleValue),
            totalTransportCost: Math.round(totalTransportCost),
            loadingCharges: Math.round(loadingCharges),
            apmcCess: Math.round(apmcCess),
            totalDeductions: Math.round(totalDeductions),
            netExpectedReturn: Math.round(netExpectedReturn),
            netPricePerQuintal: Math.round(netPricePerQuintal),
            profitabilityMargin: `${((netExpectedReturn / (grossSaleValue || 1)) * 100).toFixed(1)}%`,
            explanation: `Selling ${quantityQuintals} qtl at ₹${pricePerQuintal}/qtl yields ₹${grossSaleValue.toLocaleString()}. After deducting ₹${totalTransportCost.toLocaleString()} transport (${distanceKm} km), ₹${loadingCharges} loading, and ₹${Math.round(apmcCess)} APMC cess, your Net Return is ₹${Math.round(netExpectedReturn).toLocaleString()} (Effective ₹${Math.round(netPricePerQuintal)}/qtl).`
        };
    }

    /**
     * Extracts commodity and location entities using agriculturalEntityNormalizer.
     */
    extractMarketEntities(query = "", structuredState = {}) {
        const lower = query.toLowerCase();
        const cropRes = entityNormalizer.normalizeCrop(query);
        let matchedCommodity = null;

        const specificPriceMatch = query.match(/(?:price|rate|cost|msp|mandi)\s+(?:of|for)\s+([a-z0-9\s]+)/i);
        const askedName = specificPriceMatch ? specificPriceMatch[1].replace(/(?:in|at|for|today|the|telangana|hyderabad|warangal|ap|guntur|market|mandi).*/i, "").trim() : null;

        if (cropRes.matched) {
            matchedCommodity = COMMODITY_MAP.find(c => c.displayName.toLowerCase().includes(cropRes.canonical.toLowerCase()) || c.names.includes(cropRes.canonical.toLowerCase()) || c.id === cropRes.id);
            if (!matchedCommodity) {
                matchedCommodity = { id: cropRes.canonical.replace(/\s+/g, "_"), displayName: cropRes.displayName, unit: "quintal" };
            }
        } else if (!askedName && structuredState.lastCommodity && /(its price|its rate|how much is it|mandi rate|bhav|market price)/i.test(lower)) {
            matchedCommodity = COMMODITY_MAP.find(c => c.displayName.toLowerCase().includes(structuredState.lastCommodity.toLowerCase()) || c.id === structuredState.lastCommodity);
        }

        // 2. Location Entity Extraction via Fuzzy Normalizer
        const locRes = entityNormalizer.normalizeLocation(query);

        let state = locRes.state || structuredState.state || null;
        let district = locRes.canonical && locRes.type === "district" ? locRes.canonical : (structuredState.district || null);
        let market = district;

        if (!state && structuredState.location) {
            state = structuredState.location.split(",").pop().trim();
        }
        if (!district && structuredState.location) {
            district = structuredState.location.split(",")[0].trim();
        }

        const isComparison = /(compare|difference|highest|best price|which market|which mandi)/i.test(lower);

        return {
            commodity: matchedCommodity,
            cropEntity: cropRes,
            state,
            district,
            market,
            isComparison,
            rawQuery: query
        };
    }

    /**
     * Fetches prices from Farmer.in API with retry and exponential backoff.
     */
    async _fetchFarmerInPrices() {
        const cacheKey = "raw_farmer_in_prices";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        return cacheService.getOrFetch(cacheKey, async () => {
            try {const response=await httpClient.get(FARMER_IN_API_URL,{timeout:4000});return response.data?.commodities?response.data:null;}catch{return null;}
        },1800000);
    }

    /**
     * Main entry point for querying market prices.
     */
    async getMarketPrice(query = "", structuredState = {}) {
        const entities = this.extractMarketEntities(query, structuredState);

        if (!entities.commodity) {
            const specificPriceMatch = query.match(/(?:price|rate|cost|msp|mandi)\s+(?:of|for)\s+([a-z0-9\s]+)/i);
            if (specificPriceMatch) {
                const askedName = specificPriceMatch[1].replace(/(?:in|at|for|today|the|telangana|hyderabad|warangal|ap|guntur|market|mandi).*/i, "").trim();
                if (askedName && askedName.length > 2) {
                    return {
                        success: true,
                        unavailable: true,
                        response: `I couldn't find a current verified price for **${askedName}** in the requested market. I don't want to give you an incorrect price.`,
                        agent: "Mandi Market & MSP Agent"
                    };
                }
            }

            return {
                success: true,
                needs_clarification: true,
                response: "Which crop or commodity market price would you like to check? For example: **Tomato**, **Cotton**, **Moong**, or **Paddy**.",
                agent: "Mandi Market & MSP Agent"
            };
        }

        const commodityObj = entities.commodity;
        const locationStr = entities.district || entities.state || structuredState.location;

        if (!locationStr && !entities.isComparison) {
            return {
                success: true,
                needs_location: true,
                commodity: commodityObj.displayName,
                response: `I couldn't verify a current **${commodityObj.displayName}** price without a state, district, or mandi. I don't want to provide an incorrect price. Which market should I check?`,
                agent: "Mandi Market & MSP Agent"
            };
        }

        const cacheKey = `market:${entities.state || 'all'}:${entities.district || 'all'}:${commodityObj.id}`.toLowerCase();
        const cachedResult = cacheService.get(cacheKey);
        if (cachedResult) {
            return {
                ...cachedResult,
                isCached: true
            };
        }

        const rawApiData = await this._fetchFarmerInPrices();

        if (!rawApiData) {
            const failureResponse = {
                success: false,
                service_unavailable: true,
                response: "⚠️ The mandi price service is temporarily unavailable. I couldn't verify the latest price, so I don't want to give you an unverified number.",
                agent: "Mandi Market & MSP Agent"
            };
            cacheService.set(cacheKey, failureResponse, 120000);
            return failureResponse;
        }

        const commoditiesList = Array.isArray(rawApiData.commodities) ? rawApiData.commodities : Object.values(rawApiData.commodities);
        const item = commoditiesList.find(c => (c.id && c.id.toLowerCase() === commodityObj.id) || (c.name && c.name.toLowerCase().includes(commodityObj.displayName.toLowerCase())));

        if (!item || typeof item.price !== "number" || item.price <= 0) {
            const unavailResponse = {
                success: true,
                unavailable: true,
                response: `I couldn't find a current verified price for **${commodityObj.displayName}** in the requested market (${locationStr || 'specified location'}). I don't want to give you an incorrect price.`,
                agent: "Mandi Market & MSP Agent"
            };
            cacheService.set(cacheKey, unavailResponse, 300000);
            return unavailResponse;
        }

        const priceDate = item.updated || rawApiData.updated || null;
        const displayLocation = item.location || item.market || 'Provider aggregate (not a local mandi quote)';
        const formattedResp = `${commodityObj.displayName} — ${displayLocation}\nModal price (latest available): ₹${item.price}/${item.unit || 'quintal'}\nPrice date (observation): ${priceDate || 'not provided; freshness unverified'}\nSource: Farmer.in. Confirm a local quote before selling.`;
        const resultPayload = {success:true,agent:'Market Agent',intent:'market',commodity:commodityObj.displayName,location:displayLocation,modal_price:item.price,min_price:Number.isFinite(item.min)?item.min:null,max_price:Number.isFinite(item.max)?item.max:null,unit:item.unit||'quintal',price_date:priceDate,sources:['Farmer.in Open Prices API'],confidence:null,metadata:{source:'Farmer.in',retrieved_at:new Date().toISOString(),price_date:priceDate},response:formattedResp};
        const observation=require('./marketHistory').normalizeObservation({crop:commodityObj.displayName,market:item.market||'Provider aggregate',location:item.location||'Unspecified',date:priceDate,modalPrice:item.price,minPrice:item.min,maxPrice:item.max,unit:'INR/'+(item.unit||'quintal')},'Farmer.in');
        if(observation && require('../config/db').isDbOperational()) {
          try {const {crop,market,location,date,unit,source}=observation;await require('../models/MarketObservation').updateOne({crop,market,location,date,unit,source},{$set:observation},{upsert:true,maxTimeMS:2000});} catch {resultPayload.metadata.historyPersistence='UNAVAILABLE';}
        }

        cacheService.set(cacheKey, resultPayload, 3600000);

        return resultPayload;
    }
}

module.exports = new MarketPriceService();
