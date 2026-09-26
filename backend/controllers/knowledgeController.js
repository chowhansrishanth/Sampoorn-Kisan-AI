exports.getKnowledgeBase = (req, res) => {
  const knowledge = [
    {
      title: "Smart Crop Rotation Strategies",
      category: "Agronomy",
      content: "Rotating legumes with cereals can boost soil nitrogen by 30%. For regional soils, rotating Wheat -> Mung Bean -> Rice is highly recommended to break pest cycles."
    },
    {
      title: "Identifying Early Blight in Tomatoes",
      category: "Disease Management",
      content: "Look for brown, concentric rings on lower leaves. Treat immediately with copper-based fungicides if humidity remains above 80% for consecutive days."
    },
    {
      title: "Government Subsidy for Drip Irrigation",
      category: "Schemes",
      content: "The PMKSY scheme provides up to 55% subsidy for small and marginal farmers installing micro-irrigation systems to conserve water."
    },
    {
      title: "Optimizing Fertilizer Usage (NPK)",
      category: "Soil Health",
      content: "Applying fertilizer based on exact soil test values reduces costs by 20% and prevents groundwater pollution. Avoid broadcast urea application."
    }
  ];
  res.json(knowledge);
};

exports.getHistoricalYield = (req, res) => {
  const yieldHistory = []; // No owner-specific harvest observations are connected.
  res.json(yieldHistory);
};
