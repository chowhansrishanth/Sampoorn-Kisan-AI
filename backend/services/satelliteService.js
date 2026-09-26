'use strict';
/**
 * Satellite Multispectral NDVI Crop Health Engine
 * Generates Sentinel-2 / Landsat multispectral reflectance simulations (NIR & Red bands),
 * spatial crop vigor heatmaps, moisture stress zones, and targeted agronomic interventions.
 */

function generateNdviGrid(crop = 'Cotton', stage = 'vegetative', lat = 17.38, lon = 78.48) {
  const baseVigor = stage === 'flowering' ? 0.78 : stage === 'vegetative' ? 0.68 : 0.45;
  const gridSize = 6; // 6x6 spatial resolution grid representing a 2.5 acre farm plot
  const grid = [];
  const cells = [];

  let stressedCount = 0;
  let healthyCount = 0;
  let vigorousCount = 0;

  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      // Simulate realistic field variance with a stress patch in the top-right
      const isStressSpot = r <= 2 && c >= 3;
      const noise = (Math.sin(r * 1.5 + lat) + Math.cos(c * 1.8 + lon)) * 0.08;
      let ndvi = isStressSpot ? baseVigor - 0.28 + noise * 0.5 : baseVigor + noise;
      ndvi = Number(Math.max(0.12, Math.min(0.88, ndvi)).toFixed(2));

      let status = 'normal';
      let statusColor = '#22c55e'; // Green
      if (ndvi >= 0.72) {
        status = 'dense_vigor';
        statusColor = '#15803d'; // Emerald
        vigorousCount++;
      } else if (ndvi >= 0.52) {
        status = 'healthy';
        statusColor = '#22c55e';
        healthyCount++;
      } else if (ndvi >= 0.38) {
        status = 'moderate_stress';
        statusColor = '#eab308'; // Amber
        stressedCount++;
      } else {
        status = 'severe_stress';
        statusColor = '#ef4444'; // Red
        stressedCount++;
      }

      const cell = {
        row: r,
        col: c,
        ndvi,
        status,
        statusColor,
        estimatedBiomassKgM2: Number((ndvi * 3.2).toFixed(2)),
      };
      row.push(cell);
      cells.push(cell);
    }
    grid.push(row);
  }

  const allValues = cells.map((c) => c.ndvi);
  const avgNdvi = Number((allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2));
  const minNdvi = Math.min(...allValues);
  const maxNdvi = Math.max(...allValues);

  return {
    coordinates: { lat, lon },
    satellitePlatform: 'Sentinel-2 Multispectral MSI (10m Resolution)',
    lastPassTimestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    crop,
    stage,
    metrics: {
      averageNdvi: avgNdvi,
      minNdvi,
      maxNdvi,
      healthyVigorAreaPercent: Math.round(((healthyCount + vigorousCount) / cells.length) * 100),
      stressedAreaPercent: Math.round((stressedCount / cells.length) * 100),
    },
    stressDiagnosis: {
      hasCriticalStressPatch: stressedCount > 4,
      criticalQuadrant: 'North-East Sector (Plot Grid R0-2 / C3-5)',
      anomalyFactor: '-28% below plot mean',
      probableCauses: [
        'Localized drip lateral clogging / uneven irrigation coverage',
        'Subsurface nematode or Fusarium root rot focal point',
        'Shallow calcareous hardpan restricting root expansion',
      ],
      recommendedAction: 'Inspect North-East plot drippers and scout for yellowing foliage. Apply Trichoderma bio-agent drench if wilting is visible.',
    },
    grid,
  };
}

module.exports = { generateNdviGrid };
