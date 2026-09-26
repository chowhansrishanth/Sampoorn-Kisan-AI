/**
 * Intent Classification & Agricultural Entity Router Pipeline
 * 
 * Classifies farmer queries into canonical intent categories with confidence ratings,
 * integrates fuzzy entity normalizer for crop/soil/location extraction, and handles follow-up context.
 */

const entityNormalizer = require("./agriculturalEntityNormalizer");
const querySimilarityAssist = require("./querySimilarityAssist");

class IntentClassifier {

    /**
     * Main intent classification & entity extraction pipeline
     */
    classify(query = "", sessionContext = {}) {
        // Step 1: Perform reference resolution ("its", "it", "this crop", "my soil")
        const refRes = entityNormalizer.resolveReference(query, sessionContext);
        const effectiveQuery = refRes.rewrittenQuery;
        const lower = effectiveQuery.toLowerCase().trim();

        // Step 1B: Similarity Assist lookup for rare or misspelled patterns
        const similarPatterns = querySimilarityAssist.findSimilarPatterns(effectiveQuery, 1);
        const similarityHint = similarPatterns.length > 0 ? similarPatterns[0] : null;

        // Step 2: Extract Agricultural Entities via Normalizer
        const cropRes = entityNormalizer.normalizeCrop(effectiveQuery);
        const locRes = entityNormalizer.normalizeLocation(effectiveQuery);
        const soilRes = entityNormalizer.normalizeSoil(effectiveQuery);

        // Step 3: Pattern Matching Triggers (English, Telugu, Transliterated Telugu, Hindi)
        const isMarket = /(\bmsp\b|minimum support|sell|price|prices|prce|rate|rates|mandi|mrkt|market|cost|selling|bhav|selling for|how much is|mandi rate|benchmark|దర|ధరలు|మండి|భావం|ભાવ|मंडी|कितने का|कितना है)/i.test(lower);
        const isExplicitWeather = /(weather|wether|rain|rainy|rainfall|monsoon|cloud|cloudy|humidity|wind|temp|temperature|forecast|climate|hail|storm|varsham|varshalu|హవామాన్|వర్షం|మబ్బులు|मौसम|बारिश|हवामान)/i.test(lower);
        const isWeather = isExplicitWeather || (!isMarket && /(tmrw|tomorrow|today)/i.test(lower) && /(forecast|climate|sky|outside)/i.test(lower));
        const isDisease = /(disease|diseaes|blight|rot|rust|wilt|spot|yellowing|lesion|spots|bullseye|fungus|spray|pesticide|fungicide|purugu|tegulu|కీటకం|తెగులు|మచ్చలు|कीट|रोग)/i.test(lower);
        const isPest = /(pest|pests|insects|insect|caterpillar|worm|aphid|whitefly|borer|frass|chewed)/i.test(lower);
        const isFertilizer = /(fertilizer|fertilisers|npk|urea|dap|potash|zinc|manure|vermicompost|eruvulu|ఎరువులు|उर्वरक)/i.test(lower);
        const isSoil = /(soil|mitti|nelalu|nalla regadi|regur|ph|alluvial|clay|red soil|black soil|నేల|ఎర్ర నేలలు)/i.test(lower);
        const isCropRec = /(crop|recommend|suggest|which crop|what crop|grow|easier|easy|profit|season|kharif|rabi|zaid|variety|yield|panta|veyali|సాగు|పంట|ఏ పంట|ఫసల్|खेती)/i.test(lower);
        const isScheme = /(scheme|subsidy|pm-kisan|pm kisan|pmksy|kcc|loan|insurance|pmfby|bima|ప్రభుత్వ|పథకం|యोजना|सब्सिडी)/i.test(lower);
        const isIrrigation = /(water|irrigation|limited water|drip|borewell|canal|rainfed|నీరు|తక్కువ నీరు|पानी)/i.test(lower);
        const isYield = /(yield|production|output|harvest per acre|దిగుబడి|उत्पादन)/i.test(lower);
        const isProfit = /(profit|profitability|income|earnings|return|లాభం|मुनाफा)/i.test(lower);

        const detectedIntents = [];

        if (isMarket) detectedIntents.push("MARKET_PRICE");
        if (isWeather) detectedIntents.push("WEATHER");
        if (isDisease) detectedIntents.push("DISEASE");
        if (isPest) detectedIntents.push("PEST");
        if (isFertilizer) detectedIntents.push("FERTILIZER");
        if (isSoil) detectedIntents.push("SOIL");
        if (isCropRec) detectedIntents.push("CROP_RECOMMENDATION");
        if (isScheme) detectedIntents.push("GOVERNMENT_SCHEME");
        if (isIrrigation) detectedIntents.push("IRRIGATION");
        if (isYield) detectedIntents.push("YIELD_PREDICTION");
        if (isProfit) detectedIntents.push("PROFITABILITY");

        if (detectedIntents.length === 0) {
            if (cropRes.matched) detectedIntents.push("CROP_RECOMMENDATION");
            else if (sessionContext.lastIntent && (locRes.matched || lower.startsWith("what about") || lower.startsWith("how about"))) {
                detectedIntents.push(sessionContext.lastIntent === "market" ? "MARKET_PRICE" : sessionContext.lastIntent.toUpperCase());
            } else {
                detectedIntents.push("GENERAL_AGRICULTURE");
            }
        }

        let primaryIntent = detectedIntents[0];
        if (detectedIntents.includes("CROP_RECOMMENDATION") && !isFertilizer && detectedIntents.includes("SOIL") && !isMarket) {
            primaryIntent = "CROP_RECOMMENDATION";
        }

        let agent = "Sahayak Agricultural General Agent";
        if (primaryIntent === "MARKET_PRICE") agent = "Mandi Market & MSP Agent";
        else if (primaryIntent === "DISEASE" || primaryIntent === "PEST") agent = "Pest & Disease Diagnostic Agent";
        else if (primaryIntent === "WEATHER") agent = "Weather & Agromet Advisory Agent";
        else if (primaryIntent === "FERTILIZER" || primaryIntent === "SOIL") agent = "Soil & Crop Nutrition Agent";
        else if (primaryIntent === "GOVERNMENT_SCHEME") agent = "Government Schemes & Subsidy Agent";
        else if (primaryIntent === "CROP_RECOMMENDATION" || primaryIntent === "IRRIGATION") agent = "Crop Recommendation & Agronomy Agent";

        const commodity = cropRes.matched ? cropRes.canonical : (refRes.resolvedCommodity || sessionContext.lastCommodity || null);
        const locationState = locRes.matched ? locRes.state : (sessionContext.state || null);
        const locationDistrict = locRes.matched && locRes.type === "district" ? locRes.canonical : (sessionContext.district || null);
        const soilType = soilRes.matched ? soilRes.canonical : (refRes.resolvedSoil || sessionContext.soil_type || null);

        // Section 9: Structured Query Representation
        const structuredQuery = {
            intents: detectedIntents,
            primaryIntent,
            location: {
                state: locationState,
                district: locationDistrict
            },
            soil: soilType,
            waterAvailability: sessionContext.water_availability || (isIrrigation ? "limited" : null),
            timeContext: isWeather && (lower.includes("tomorrow") || lower.includes("tmrw")) ? "tomorrow" : "current",
            commodity,
            missingInformation: []
        };

        if (primaryIntent === "MARKET_PRICE" && !commodity) structuredQuery.missingInformation.push("commodity");
        if (primaryIntent === "MARKET_PRICE" && !locationState && !locationDistrict) structuredQuery.missingInformation.push("location");

        return {
            intent: primaryIntent,
            intents: detectedIntents,
            agent,
            confidence: cropRes.matched || locRes.matched ? 0.95 : 0.85,
            rawQuery: query,
            effectiveQuery,
            commodity,
            cropEntity: cropRes.matched ? cropRes : null,
            locationEntity: locRes.matched ? locRes : null,
            soilEntity: soilRes.matched ? soilRes : null,
            structuredQuery
        };
    }
}

module.exports = new IntentClassifier();
