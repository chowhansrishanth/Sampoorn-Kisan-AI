/**
 * Deterministic Profitability Engine
 * Fulfills Requirement 21: Financial analysis via code calculation.
 * Computes: Revenue = Yield * Price, Gross Margin = Revenue - Input Costs.
 */

class ProfitabilityEngine {
    calculateProfitability({ cropName, landSizeAcres, expectedYieldQuintalsPerAcre, expectedPricePerQuintal, customInputCosts }) {
        if (typeof cropName !== 'string' || !cropName.trim() || cropName.length > 100 || !Number.isFinite(Number(landSizeAcres)) || Number(landSizeAcres) <= 0 || !Number.isFinite(Number(expectedYieldQuintalsPerAcre)) || Number(expectedYieldQuintalsPerAcre) < 0 || !Number.isFinite(Number(expectedPricePerQuintal)) || Number(expectedPricePerQuintal) < 0) {
            throw new Error('Crop, positive farm area, expected yield, and selling price are required.');
        }
        const supplied = [landSizeAcres, expectedYieldQuintalsPerAcre, expectedPricePerQuintal];
        if (supplied.some(value => typeof value !== 'number' || !Number.isFinite(value) || value > 1e9)) throw new Error('Numeric assumptions within supported limits are required.');
        const acres = Number(landSizeAcres);
        const yieldPerAcre = Number(expectedYieldQuintalsPerAcre);
        const pricePerQtl = Number(expectedPricePerQuintal);
        if (!customInputCosts || Object.values(customInputCosts).some(value => !Number.isFinite(Number(value)) || Number(value) < 0)) throw new Error('All cultivation cost inputs are required and must be non-negative.');

        const totalYieldQuintals = yieldPerAcre * acres;
        const estimatedGrossRevenue = totalYieldQuintals * pricePerQtl;

        const rawCosts = customInputCosts;
        const required = ['seed','fertilizer','irrigation','labor','transport','miscellaneous'];
        required.push(Object.hasOwn(rawCosts, 'pesticides') ? 'pesticides' : 'pesticide');
        required.push(Object.hasOwn(rawCosts, 'machinery') ? 'machinery' : 'land_prep_harvest');
        if (Array.isArray(rawCosts) || required.some(key => typeof rawCosts[key] !== 'number' || !Number.isFinite(rawCosts[key]) || rawCosts[key] < 0 || rawCosts[key] > 1e9)) throw new Error('Enter every cost, including an explicit zero when not applicable.');
        const costsPerAcre = { seed: Number(rawCosts.seed || 0), fertilizer: Number(rawCosts.fertilizer || 0), pesticides: Number(rawCosts.pesticides || rawCosts.pesticide || 0), irrigation: Number(rawCosts.irrigation || 0), labor: Number(rawCosts.labor || 0), land_prep_harvest: Number(rawCosts.land_prep_harvest || rawCosts.machinery || 0), transport: Number(rawCosts.transport || 0), miscellaneous: Number(rawCosts.miscellaneous || 0) };
        const costPerAcreTotal = Object.values(costsPerAcre).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        const totalInputCosts = costPerAcreTotal * acres;

        const estimatedGrossMargin = estimatedGrossRevenue - totalInputCosts;
        const netProfitPerAcre = estimatedGrossMargin / acres;
        const roiPercentage = totalInputCosts > 0 ? ((estimatedGrossMargin / totalInputCosts) * 100).toFixed(1) : null;
        const breakEvenPrice = totalYieldQuintals > 0 ? totalInputCosts / totalYieldQuintals : null;

        return {
            cropName,
            landSizeAcres: acres,
            yieldPerAcreQuintals: yieldPerAcre,
            totalYieldQuintals,
            pricePerQuintal: pricePerQtl,
            estimatedGrossRevenue: Math.round(estimatedGrossRevenue),
            costsBreakdown: costsPerAcre,
            totalCostPerAcre: Math.round(costPerAcreTotal),
            totalInputCosts: Math.round(totalInputCosts),
            estimatedGrossMargin: Math.round(estimatedGrossMargin),
            netProfitPerAcre: Math.round(netProfitPerAcre),
            roiPercentage: roiPercentage === null ? null : `${roiPercentage}%`,
            breakEvenPricePerQuintal: breakEvenPrice === null ? null : Number(breakEvenPrice.toFixed(2)),
            provenance: { costs: 'USER_PROVIDED', yield: 'USER_PROVIDED', price: 'USER_PROVIDED', calculations: 'CALCULATED' },
            formattedMarkdown: this._formatMarkdownReport({
                cropName,
                acres,
                yieldPerAcre,
                totalYieldQuintals,
                pricePerQtl,
                estimatedGrossRevenue,
                costsPerAcre,
                costPerAcreTotal,
                totalInputCosts,
                estimatedGrossMargin,
                netProfitPerAcre,
                roiPercentage
            })
        };
    }

    sensitivity(input, priceDelta = 0.15, yieldDelta = 0.15) {
        if ([priceDelta,yieldDelta].some(value => !Number.isFinite(value) || value < 0 || value > 1)) throw new Error('Scenario changes must be between zero and one.');
        const base = this.calculateProfitability(input);
        return { low: this.calculateProfitability({ ...input, expectedPricePerQuintal: input.expectedPricePerQuintal * (1 - priceDelta), expectedYieldQuintalsPerAcre: input.expectedYieldQuintalsPerAcre * (1 - yieldDelta) }), expected: base, high: this.calculateProfitability({ ...input, expectedPricePerQuintal: input.expectedPricePerQuintal * (1 + priceDelta), expectedYieldQuintalsPerAcre: input.expectedYieldQuintalsPerAcre * (1 + yieldDelta) }) };
    }

    compare(inputs = []) { return inputs.map(input => this.calculateProfitability(input)).sort((a, b) => b.estimatedGrossMargin - a.estimatedGrossMargin); }

    _formatMarkdownReport(data) {
        return `💰 **Deterministic Profitability & Financial Margin Analysis (${data.cropName} — ${data.acres} Acres)**

### 📊 Revenue Estimates:
- **Expected Yield**: ${data.yieldPerAcre} qtl/acre (${data.totalYieldQuintals} qtl total across ${data.acres} acres)
- **Expected Market Price**: ₹${data.pricePerQtl.toLocaleString("en-IN")}/quintal
- **Gross Estimated Revenue**: **₹${Math.round(data.estimatedGrossRevenue).toLocaleString("en-IN")}**

### 💸 Input Cost Breakdown (Per Acre):
- **Seed & Sowing**: ₹${data.costsPerAcre.seed.toLocaleString("en-IN")}
- **Fertilizer & NPK**: ₹${data.costsPerAcre.fertilizer.toLocaleString("en-IN")}
- **Pesticides & Bio-agents**: ₹${data.costsPerAcre.pesticides.toLocaleString("en-IN")}
- **Irrigation & Power**: ₹${data.costsPerAcre.irrigation.toLocaleString("en-IN")}
- **Labor & Weeding**: ₹${data.costsPerAcre.labor.toLocaleString("en-IN")}
- **Land Preparation & Harvest**: ₹${data.costsPerAcre.land_prep_harvest.toLocaleString("en-IN")}
- **Total Input Cost / Acre**: ₹${Math.round(data.costPerAcreTotal).toLocaleString("en-IN")}
- **Total Input Cost (${data.acres} Acres)**: **₹${Math.round(data.totalInputCosts).toLocaleString("en-IN")}**

### 📈 Net Expected Financial Margin:
- **Estimated Gross Margin**: **₹${Math.round(data.estimatedGrossMargin).toLocaleString("en-IN")}**
- **Net Margin / Acre**: **₹${Math.round(data.netProfitPerAcre).toLocaleString("en-IN")}/acre**
- **Estimated Return on Investment (ROI)**: **${data.roiPercentage}**

*Note: Calculations are deterministic projections based on normal seasonal weather and the farmer-entered assumptions; these are not guaranteed income.*`;
    }
}

module.exports = new ProfitabilityEngine();
