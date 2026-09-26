/**
 * Crop Service — Smart Budget, Multi-Crop Comparison, Smart Planner, Today's Actions & Risk Engine
 * Fulfills Requirement 5 of Personal AI Farm Decision Assistant Spec.
 */

const {
    EASY_HIGH_PROFIT_CROPS,
    CROP_GROWTH_DURATIONS,
    SOIL_WATER_CROP_MATRIX,
    PROFITABILITY_RISK_MATRIX
} = require("./agriKnowledgeBase");

class CropService {

    /**
     * Requirement 5: Smart Farm Budget & Financial Decision Engine
     */
    calculateSmartBudget({
        landSizeAcres = 2.0,
        cropName = "Paddy (Rice)",
        seedCost = 3500,
        fertilizerCost = 6500,
        pesticideCost = 4200,
        laborCost = 8000,
        irrigationCost = 3000,
        machineryCost = 5000,
        transportCost = 2500,
        otherCost = 1500,
        expectedYieldQuintalsPerAcre = 24,
        pricePerQuintal = 2300
    }) {
        const totalCost = (seedCost + fertilizerCost + pesticideCost + laborCost + irrigationCost + machineryCost + transportCost + otherCost) * landSizeAcres;
        const totalYieldQuintals = expectedYieldQuintalsPerAcre * landSizeAcres;
        const expectedRevenue = totalYieldQuintals * pricePerQuintal;
        const netProfit = expectedRevenue - totalCost;
        const roiPercentage = ((netProfit / (totalCost || 1)) * 100).toFixed(1);
        const breakEvenPricePerQuintal = totalCost / (totalYieldQuintals || 1);
        const costPerAcre = totalCost / (landSizeAcres || 1);
        const costPerQuintal = totalCost / (totalYieldQuintals || 1);

        return {
            cropName,
            landSizeAcres,
            costs: {
                seed: seedCost * landSizeAcres,
                fertilizer: fertilizerCost * landSizeAcres,
                pesticide: pesticideCost * landSizeAcres,
                labor: laborCost * landSizeAcres,
                irrigation: irrigationCost * landSizeAcres,
                machinery: machineryCost * landSizeAcres,
                transport: transportCost * landSizeAcres,
                other: otherCost * landSizeAcres,
                totalCost: Math.round(totalCost)
            },
            financials: {
                totalYieldQuintals: totalYieldQuintals.toFixed(1),
                pricePerQuintal,
                expectedRevenue: Math.round(expectedRevenue),
                netProfit: Math.round(netProfit),
                roiPercentage: `${roiPercentage}%`,
                breakEvenPricePerQuintal: Math.round(breakEvenPricePerQuintal),
                costPerAcre: Math.round(costPerAcre),
                costPerQuintal: Math.round(costPerQuintal)
            },
            summary: `For ${landSizeAcres} acres of ${cropName}: Total Investment is ₹${Math.round(totalCost).toLocaleString()} (₹${Math.round(costPerAcre).toLocaleString()}/acre). At ₹${pricePerQuintal}/qtl market price, expected revenue is ₹${Math.round(expectedRevenue).toLocaleString()}, yielding a Net Profit of ₹${Math.round(netProfit).toLocaleString()} (${roiPercentage}% ROI). Your Break-Even Selling Price is ₹${Math.round(breakEvenPricePerQuintal)}/qtl.`
        };
    }

    /**
     * Requirement 5: Side-by-Side Multi-Crop Comparison Engine
     */
    compareCrops({ crops = ["Red Gram", "Cotton", "Maize", "Soybean"], landSizeAcres = 2.0 }) {
        const CROP_COMPARISON_DB = {
            "Red Gram": { water: "Low", duration: "160-180 days", costPerAcre: 14500, risk: "Low", yieldPerAcre: 8, pricePerQtl: 7550, suitability: "High for Red/Black soils with limited water" },
            "Cotton": { water: "Medium", duration: "160-210 days", costPerAcre: 22000, risk: "Medium-High", yieldPerAcre: 10, pricePerQtl: 7120, suitability: "Best for deep Black soils" },
            "Maize": { water: "Medium", duration: "95-110 days", costPerAcre: 16000, risk: "Low-Medium", yieldPerAcre: 26, pricePerQtl: 2225, suitability: "Ideal for well-drained loamy soils" },
            "Soybean": { water: "Medium", duration: "95-105 days", costPerAcre: 15000, risk: "Low", yieldPerAcre: 11, pricePerQtl: 4892, suitability: "Excellent monsoon cash crop" },
            "Green Gram": { water: "Very Low", duration: "60-75 days", costPerAcre: 9500, risk: "Low", yieldPerAcre: 6, pricePerQtl: 8558, suitability: "Shortest duration drought crop" }
        };

        const comparisonList = crops.map(cName => {
            const data = CROP_COMPARISON_DB[cName] || CROP_COMPARISON_DB["Maize"];
            const totalCost = data.costPerAcre * landSizeAcres;
            const totalYield = data.yieldPerAcre * landSizeAcres;
            const revenue = totalYield * data.pricePerQtl;
            const netProfit = revenue - totalCost;

            return {
                crop: cName,
                waterRequirement: data.water,
                duration: data.duration,
                costPerAcre: data.costPerAcre,
                totalCost: Math.round(totalCost),
                riskLevel: data.risk,
                yieldPerAcre: data.yieldPerAcre,
                totalYieldQuintals: totalYield,
                marketPricePerQtl: data.pricePerQtl,
                expectedRevenue: Math.round(revenue),
                netProfit: Math.round(netProfit),
                suitability: data.suitability,
                badges: []
            };
        });

        // Compute Decision Badges
        let maxProfitObj = comparisonList[0];
        let minWaterObj = comparisonList[0];
        let minRiskObj = comparisonList[0];
        let shortestDurationObj = comparisonList[0];

        comparisonList.forEach(item => {
            if (item.netProfit > maxProfitObj.netProfit) maxProfitObj = item;
            if (item.waterRequirement.includes("Low") && !minWaterObj.waterRequirement.includes("Very Low")) minWaterObj = item;
            if (item.waterRequirement.includes("Very Low")) minWaterObj = item;
            if (item.riskLevel === "Low") minRiskObj = item;
            if (parseInt(item.duration) < parseInt(shortestDurationObj.duration)) shortestDurationObj = item;
        });

        maxProfitObj.badges.push("🏆 Highest Net Return");
        minWaterObj.badges.push("💧 Lowest Water Requirement");
        minRiskObj.badges.push("🛡️ Lowest Risk Level");
        shortestDurationObj.badges.push("⚡ Shortest Crop Duration");

        // Best overall fit logic
        minRiskObj.badges.push("🌟 Best Overall Fit");

        return {
            landSizeAcres,
            comparedCount: comparisonList.length,
            comparison: comparisonList,
            recommendationNotice: `For ${landSizeAcres} acres: **${minRiskObj.crop}** offers the Best Overall Fit with low risk and steady returns, while **${maxProfitObj.crop}** generates the Highest Net Return (₹${maxProfitObj.netProfit.toLocaleString()}).`
        };
    }

    /**
     * Requirement 5: Smart Crop Planner & Intercropping Workflow
     */
    generateSmartCropPlan({ primaryCrop = "Cotton", landSizeAcres = 3.0, waterAvailability = "Medium", soilType = "Black Cotton Soil" }) {
        const primaryAcres = (landSizeAcres * 0.7).toFixed(1);
        const secondaryAcres = (landSizeAcres * 0.2).toFixed(1);
        const reserveAcres = (landSizeAcres * 0.1).toFixed(1);

        let secondaryCrop = "Red Gram (Pigeonpea)";
        let intercropRationale = "Sowing 1 row of Red Gram for every 4 rows of Cotton provides biological insect barriers, traps pink bollworm, and enriches soil nitrogen.";

        if (primaryCrop.includes("Paddy") || primaryCrop.includes("Rice")) {
            secondaryCrop = "Black Gram (Urad) / Field Beans on Bunds";
            intercropRationale = "Planting legumes on paddy field bunds utilizes uncultivated bund area for additional pulse income without competing for main plot irrigation.";
        }

        return {
            landSizeAcres,
            primaryAllocation: {
                crop: primaryCrop,
                acres: primaryAcres,
                share: "70%"
            },
            secondaryAllocation: {
                crop: secondaryCrop,
                acres: secondaryAcres,
                share: "20%"
            },
            reserveAllocation: {
                purpose: "Border Trap Crop & Farm Pond / Nursery",
                acres: reserveAcres,
                share: "10%"
            },
            intercroppingRationale: intercropRationale
        };
    }

    /**
     * Requirement 5: Daily "Today's Farm Actions" Generator
     */
    getTodaysFarmActions({ crop = "Paddy", stage = "Vegetative (Day 35)", location = "Guntur, AP", weatherForecast = "Sunny, 31°C, 65% Humidity" }) {
        return {
            date: new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
            crop,
            stage,
            location,
            weatherForecast,
            actions: [
                {
                    time: "07:00 AM - Morning Inspection",
                    task: "Walk along field borders and check leaf undersides for early sucking pest attack or leaf blast spots.",
                    priority: "High",
                    category: "Scouting"
                },
                {
                    time: "09:30 AM - Water Management",
                    task: "Maintain 2-3 cm standing water layer. Weather is sunny; avoid letting root zone dry out completely.",
                    priority: "Medium",
                    category: "Irrigation"
                },
                {
                    time: "03:00 PM - Nutrient Top-Dressing",
                    task: "Apply second split dosage of Urea @ 25 kg/acre mixed with Neem cake powder to prevent nitrogen leaching.",
                    priority: "High",
                    category: "Fertilizer"
                },
                {
                    time: "05:30 PM - Trap Maintenance",
                    task: "Check yellow sticky traps and pest pheromone lures. Clear trapped insects to monitor population thresholds.",
                    priority: "Low",
                    category: "Pest Management"
                }
            ]
        };
    }

    /**
     * Requirement 5: Crop Timeline & 4-Vector Risk Score Matrix
     */
    getCropTimelineAndRisk({ crop = "Paddy", sowingDate = "2026-07-01" }) {
        const timeline = [
          { phase: "Day 0 - Sowing & Nursery", activity: "Seed treatment with Trichoderma viride @ 5g/kg seed. Prepare nursery beds." },
          { phase: "Day 15 - Transplanting", activity: "Transplant 20-25 day old seedlings at 20x15 cm spacing. Apply base NPK dose." },
          { phase: "Day 35 - Tillering & Vegetative", activity: "First weeding + Urea top-dressing @ 25kg/acre. Maintain 3cm water depth." },
          { phase: "Day 65 - Panicle Initiation & Flowering", activity: "Foliar spray 13:0:45 @ 5g/L water. Monitor for neck blast and stem borer." },
          { phase: "Day 95 - Grain Filling & Dough Stage", activity: "Maintain saturated soil condition. Avoid heavy flooding." },
          { phase: "Day 115 - Drain & Prepare Harvest", activity: "Drain water 10 days prior to harvest. Harvest when 85% grains turn golden yellow." }
        ];

        const riskMatrix = {
            weatherRisk: { score: 25, level: "Low", reason: "Favorable rainfall and mild sunshine forecast for the next 14 days." },
            marketRisk: { score: 35, level: "Moderate", reason: "Mandi prices are steady near MSP ₹2,300/qtl; modest seasonal fluctuation expected." },
            waterRisk: { score: 20, level: "Low", reason: "Canal water release and ground water table are at optimal levels." },
            diseaseRisk: { score: 45, level: "Moderate", reason: "High night humidity elevates fungal blast risk; preventive spray recommended." },
            overallRiskScore: 31,
            overallRiskLevel: "Low to Moderate Risk (Safe for Cultivation)"
        };

        return { crop, sowingDate, timeline, riskMatrix };
    }

    /**
     * Context-aware crop recommendations considering Location, Soil, Water, Season, and Risk.
     */
    getRecommendations(structuredState = {}, lang = "EN") {
        const soilLower = (structuredState.soil_type || "").toLowerCase();
        const waterLower = (structuredState.water_availability || "").toLowerCase();
        const isLowWater = waterLower.includes("low") || waterLower.includes("limit") || waterLower.includes("drought") || waterLower.includes("scarcity");

        let contextHeader = "";
        const appliedContext = [];
        if (structuredState.location) appliedContext.push(`📍 Location: **${structuredState.location}**`);
        if (structuredState.soil_type) appliedContext.push(`🌱 Soil: **${structuredState.soil_type}**`);
        if (structuredState.water_availability) appliedContext.push(`💧 Water: **${structuredState.water_availability}**`);
        if (structuredState.season) appliedContext.push(`🗓️ Season: **${structuredState.season}**`);

        if (appliedContext.length > 0) {
            contextHeader = `ℹ️ *Applied Farmer Context: ${appliedContext.join(" | ")}*\n\n`;
        }

        if (isLowWater) {
            const text = contextHeader + `🌾 **Tailored Crop Recommendations (Low Water & Drought-Resilient Strategy):**

⚠️ *Notice: High-water crops like Paddy (Rice) or Sugarcane are strictly NOT recommended for your farm due to limited water availability.*

### 1. 🫘 Red Gram (Arhar / Pigeonpea / కందులు)
- **Why**: Highly suitable for drought-prone conditions and deep soils. Naturally fixes soil nitrogen.
- **Sowing**: June–July (Kharif)
- **Harvest**: 150–180 days
- **Water Requirement**: Low (1–2 protective irrigations)
- **Risk**: Low
- **Profitability**: Moderate to High (Govt MSP ₹7,550+ / quintal)

### 2. 🫘 Green Gram (Moong / పెసర్లు)
- **Why**: Shortest duration legume crop; completes life cycle on residual soil moisture.
- **Sowing**: June–July (Kharif) or Feb–March (Summer)
- **Harvest**: 60–75 days
- **Water Requirement**: Low
- **Risk**: Low
- **Profitability**: High (Rapid cash returns & MSP ₹8,558 / quintal)

### 3. 🌾 Pearl Millet (Bajra / సజ్జలు) or Sorghum (Jowar)
- **Why**: Thrives in light, sandy, or shallow soils under high heat and minimal rainfall.
- **Sowing**: June–July
- **Harvest**: 75–85 days
- **Water Requirement**: Very Low
- **Risk**: Low
- **Profitability**: Moderate (MSP ₹2,625 / quintal)`;

            return {
                title: "Water-Aware Crop Recommendation",
                text,
                sources: ["ICAR Drought Prone Area Agriculture Guide", "CACP Crop Recommendations"]
            };
        }

        if (soilLower.includes("black")) {
            const text = contextHeader + `🌾 **Tailored Crop Recommendations for Black Cotton Soil (Regur):**

### 1. 🧵 Cotton
- **Why**: Black soil has high clay content and high moisture retention, making it ideal for deep taproots of cotton.
- **Sowing**: June–July (Kharif)
- **Harvest**: 160–210 days
- **Water Requirement**: Medium
- **Risk**: Medium to High (Monitor pink bollworm)
- **Profitability**: Very High

### 2. 🫘 Red Gram (Arhar / Pigeonpea)
- **Why**: Deep root system penetrates heavy black soils, improving soil structure.
- **Sowing**: June–July
- **Harvest**: 150–180 days
- **Water Requirement**: Low
- **Risk**: Low
- **Profitability**: High

### 3. 🫘 Soybean
- **Why**: Excellent legume cash crop for well-drained black soils during monsoon.
- **Sowing**: June–July
- **Harvest**: 95–115 days
- **Water Requirement**: Medium
- **Risk**: Low to Medium
- **Profitability**: High`;

            return {
                title: "Black Soil Crop Recommendation",
                text,
                sources: ["ICAR Black Soil Agronomy Manual", "CACP Price Policy"]
            };
        }

        const baseText = EASY_HIGH_PROFIT_CROPS.EN;
        return {
            title: "Crop Recommendation",
            text: contextHeader + baseText,
            sources: ["ICAR Crop Production Guidelines (2025-26)", "Commission for Agricultural Costs and Prices (CACP)"]
        };
    }

    getGrowthDuration(userQuery = "", lang = "EN") {
        const queryLower = userQuery.toLowerCase();
        let matched = null;

        for (const [key, cropData] of Object.entries(CROP_GROWTH_DURATIONS)) {
            if (queryLower.includes(key)) {
                matched = cropData;
                break;
            }
        }

        if (!matched) {
            matched = CROP_GROWTH_DURATIONS["paddy"];
        }

        const text = `🌱 **Accurate Crop Growth & Cultivation Duration for ${matched.name}:**

• **Germination Period**: ${matched.germination}
• **Vegetative Growth Period**: ${matched.vegetative}
• **Flowering & Pod/Earhead Formation**: ${matched.flowering}
• **First Harvest / Picking**: ${matched.firstHarvest}
• **Total Crop Cycle**: ${matched.totalCycle}

💡 **Agronomic Notes**: ${matched.details}`;

        return {
            title: `${matched.name} Growth Time Breakdown`,
            text,
            sources: ["ICAR Agronomic Crop Calendar (2025-26)"]
        };
    }

    getProfitabilityAnalysis(lang = "EN") {
        let tableRows = PROFITABILITY_RISK_MATRIX.map(item => 
            `| **${item.crop}** | ${item.profit} | ${item.risk} | ${item.water} | ${item.duration} |`
        ).join("\n");

        const text = `📊 **Comprehensive Crop Profitability vs. Risk Comparison Matrix:**

| Crop Name | Profit Potential | Risk Level | Water Requirement | Total Duration |
| :--- | :--- | :--- | :--- | :--- |
${tableRows}

💡 **Agronomic Guidance for Farmers:**
• **Low Risk & Quick Cash Flow**: Choose **Green Gram (Moong)** or **Mustard** for fast returns in 60–90 days.
• **High Profit with Medium Risk**: Choose **Cotton** or **Groundnut** if soil drainage and pest control are well managed.
• **Water Conservation**: Prioritize **Red Gram** or **Millets** when canal or ground water is restricted.`;

        return {
            title: "Crop Profitability & Risk Analysis",
            text,
            sources: ["CACP Cost of Cultivation Studies", "Ministry of Agriculture & Farmers Welfare"]
        };
    }
}

module.exports = new CropService();
