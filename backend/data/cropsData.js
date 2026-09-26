/**
 * Centralized Agricultural Crop Database & Metadata (Backend CommonJS Version)
 */

const CROP_CATEGORIES = [
  { id: "all", label: "All Crops", icon: "🌾" },
  { id: "cereals", label: "Cereals & Millets", icon: "🌾" },
  { id: "pulses", label: "Pulses & Legumes", icon: "🫘" },
  { id: "oilseeds", label: "Oilseeds", icon: "🌻" },
  { id: "commercial", label: "Commercial Crops", icon: "🌿" },
  { id: "vegetables", label: "Vegetables", icon: "🍅" },
  { id: "fruits", label: "Fruits", icon: "🍌" },
  { id: "spices", label: "Spices & Condiments", icon: "🌶️" },
  { id: "plantation", label: "Plantation Crops", icon: "🥥" },
  { id: "flowers", label: "Flowers & Floriculture", icon: "🌸" },
  { id: "fodder", label: "Fodder Crops", icon: "🌱" },
  { id: "medicinal", label: "Medicinal & Aromatic", icon: "🌿" },
  { id: "mixed", label: "Mixed & Integrated", icon: "🐄" },
];

const GROWTH_STAGES = [
  "Planning & Selection",
  "Land Preparation",
  "Sowing / Transplanting",
  "Germination / Seedling",
  "Vegetative Growth",
  "Tillering / Branching",
  "Flowering / Booting",
  "Fruiting / Podding / Grain Formation",
  "Maturity & Ripening",
  "Harvesting",
  "Post-Harvest / Storage"
];

const CROPS_DATABASE = [
  // CEREALS & MILLETS
  { id: "rice", name: "Rice / Paddy", icon: "🌾", category: "cereals", aliases: ["paddy", "dhan", "chawal", "vari", "bhat"], season: ["Kharif", "Rabi"], waterReq: "High" },
  { id: "wheat", name: "Wheat", icon: "🌾", category: "cereals", aliases: ["gehun", "godumalu", "gothumai", "kanak"], season: ["Rabi"], waterReq: "Medium" },
  { id: "maize", name: "Maize / Corn", icon: "🌽", category: "cereals", aliases: ["corn", "bhutta", "makka", "jonnalu", "makkei"], season: ["Kharif", "Rabi", "Zaid"], waterReq: "Medium" },
  { id: "jowar", name: "Sorghum / Jowar", icon: "🌱", category: "cereals", aliases: ["jowar", "jonnalu", "cholam", "jola"], season: ["Kharif", "Rabi"], waterReq: "Low" },
  { id: "bajra", name: "Pearl Millet / Bajra", icon: "🌱", category: "cereals", aliases: ["bajra", "sajjalu", "kambu", "bajri"], season: ["Kharif", "Zaid"], waterReq: "Low" },
  { id: "ragi", name: "Finger Millet / Ragi", icon: "🌱", category: "cereals", aliases: ["ragi", "taidalu", "kezhvaragu", "nachni"], season: ["Kharif"], waterReq: "Low" },

  // PULSES & LEGUMES
  { id: "red_gram", name: "Red Gram / Pigeon Pea", icon: "🫘", category: "pulses", aliases: ["tur", "arhar", "kandulu", "thovarai", "togari"], season: ["Kharif"], waterReq: "Low" },
  { id: "green_gram", name: "Green Gram / Moong", icon: "🫘", category: "pulses", aliases: ["moong", "mung", "pesalu", "paasi paruppu", "hesaru"], season: ["Kharif", "Zaid"], waterReq: "Low" },
  { id: "black_gram", name: "Black Gram / Urad", icon: "🫘", category: "pulses", aliases: ["urad", "minumulu", "ulundu", "uddu"], season: ["Kharif", "Rabi"], waterReq: "Low" },
  { id: "bengal_gram", name: "Bengal Gram / Chickpea", icon: "🫘", category: "pulses", aliases: ["chana", "chana dal", "senagalu", "konda kadalai", "kadle"], season: ["Rabi"], waterReq: "Low" },
  { id: "groundnut", name: "Groundnut / Peanut", icon: "🫘", category: "pulses", aliases: ["peanut", "moongphali", "verusenaga", "nila kadalai", "shenga"], season: ["Kharif", "Rabi"], waterReq: "Medium" },
  { id: "soybean", name: "Soybean", icon: "🫘", category: "pulses", aliases: ["soya", "soyabean", "soyamint"], season: ["Kharif"], waterReq: "Medium" },
  { id: "cowpea", name: "Cowpea / Lobia", icon: "🫘", category: "pulses", aliases: ["lobia", "alasandalu", "karamani"], season: ["Kharif", "Zaid"], waterReq: "Low" },

  // COMMERCIAL CROPS
  { id: "cotton", name: "Cotton", icon: "🌿", category: "commercial", aliases: ["kapas", "patti", "pamban", "kapus"], season: ["Kharif"], waterReq: "Medium" },
  { id: "sugarcane", name: "Sugarcane", icon: "🌿", category: "commercial", aliases: ["ganna", "cheruku", "karumbu", "kabbu"], season: ["Perennial"], waterReq: "High" },
  { id: "tobacco", name: "Tobacco", icon: "🌿", category: "commercial", aliases: ["tumbaku", "pogaku", "pukayila"], season: ["Rabi"], waterReq: "Medium" },
  { id: "jute", name: "Jute", icon: "🌿", category: "commercial", aliases: ["pat", "patsan", "narasa"], season: ["Kharif"], waterReq: "High" },

  // VEGETABLES
  { id: "chilli", name: "Green & Red Chilli", icon: "🌶️", category: "vegetables", aliases: ["mirchi", "mirapakaya", "milagai", "menasinakai"], season: ["Kharif", "Rabi"], waterReq: "Medium" },
  { id: "tomato", name: "Tomato", icon: "🍅", category: "vegetables", aliases: ["tamatar", "thakkali", "tamata"], season: ["Kharif", "Rabi", "Zaid"], waterReq: "Medium" },
  { id: "potato", name: "Potato", icon: "🥔", category: "vegetables", aliases: ["aloo", "bangaladumpa", "urulaikizhangu", "alugadde"], season: ["Rabi"], waterReq: "Medium" },
  { id: "onion", name: "Onion", icon: "🧅", category: "vegetables", aliases: ["pyaz", "kanda", "ulli", "ullipaya", "vengayam"], season: ["Kharif", "Rabi"], waterReq: "Medium" },
  { id: "okra", name: "Okra / Bhendi / Ladyfinger", icon: "🌱", category: "vegetables", aliases: ["bhindi", "bhendi", "bendakaya", "vendakkai"], season: ["Kharif", "Zaid"], waterReq: "Medium" },
  { id: "brinjal", name: "Brinjal / Eggplant", icon: "🍆", category: "vegetables", aliases: ["baingan", "vankaya", "kathirikai", "badanekai"], season: ["Kharif", "Rabi", "Zaid"], waterReq: "Medium" },
  { id: "cauliflower", name: "Cauliflower", icon: "🥦", category: "vegetables", aliases: ["gobi", "phool gobi", "cauliflower"], season: ["Rabi"], waterReq: "Medium" },
  { id: "cabbage", name: "Cabbage", icon: "🥦", category: "vegetables", aliases: ["patta gobi", "cabbage", "muttaikose"], season: ["Rabi"], waterReq: "Medium" },
  { id: "capsicum", name: "Capsicum / Bell Pepper", icon: "🌶️", category: "vegetables", aliases: ["capsicum", "shimla mirch"], season: ["Kharif", "Rabi"], waterReq: "Medium" },
  { id: "carrot", name: "Carrot", icon: "🥕", category: "vegetables", aliases: ["gajar", "gajjara", "carrot"], season: ["Rabi"], waterReq: "Medium" },
  { id: "cucumber", name: "Cucumber", icon: "🥒", category: "vegetables", aliases: ["kheera", "dosakaya", "vellarikkai"], season: ["Zaid", "Kharif"], waterReq: "Medium" },
  { id: "leafy_veg", name: "Leafy Vegetables (Spinach/Fenugreek)", icon: "🥬", category: "vegetables", aliases: ["palak", "methi", "thotakura", "greens"], season: ["Kharif", "Rabi", "Zaid"], waterReq: "Medium" },

  // FRUITS
  { id: "banana", name: "Banana", icon: "🍌", category: "fruits", aliases: ["kela", "arati", "vazhai", "bale"], season: ["Perennial"], waterReq: "High" },
  { id: "mango", name: "Mango", icon: "🥭", category: "fruits", aliases: ["aam", "mamidi", "mambazham", "mavu"], season: ["Perennial"], waterReq: "Medium" },
  { id: "orange", name: "Orange / Citrus", icon: "🍊", category: "fruits", aliases: ["santra", "battayi", "mosambi", "citrus"], season: ["Perennial"], waterReq: "Medium" },
  { id: "lemon", name: "Lemon / Lime", icon: "🍋", category: "fruits", aliases: ["nimbu", "nimmakaya", "elumichai"], season: ["Perennial"], waterReq: "Medium" },
  { id: "watermelon", name: "Watermelon", icon: "🍉", category: "fruits", aliases: ["tarbooz", "puchakaya", "thaarpoosai"], season: ["Zaid"], waterReq: "Medium" },
  { id: "grapes", name: "Grapes", icon: "🍇", category: "fruits", aliases: ["angoor", "draksha"], season: ["Perennial"], waterReq: "High" },
  { id: "guava", name: "Guava", icon: "🍎", category: "fruits", aliases: ["amrood", "jama", "koyya"], season: ["Perennial"], waterReq: "Medium" },
  { id: "papaya", name: "Papaya", icon: "🍍", category: "fruits", aliases: ["papita", "boppayi", "pappali"], season: ["Perennial"], waterReq: "High" },
  { id: "coconut", name: "Coconut", icon: "🥥", category: "fruits", aliases: ["nariyal", "kobbari", "thengai", "tengu"], season: ["Perennial"], waterReq: "High" },

  // SPICES & CONDIMENTS
  { id: "turmeric", name: "Turmeric", icon: "🌶️", category: "spices", aliases: ["haldi", "pasupu", "manjal"], season: ["Kharif"], waterReq: "High" },
  { id: "ginger", name: "Ginger", icon: "🌶️", category: "spices", aliases: ["adrak", "allam", "inji"], season: ["Kharif"], waterReq: "High" },
  { id: "garlic", name: "Garlic", icon: "🧄", category: "spices", aliases: ["lahsun", "vellulli", "poondu"], season: ["Rabi"], waterReq: "Medium" },

  // FLOWERS & MEDICINAL
  { id: "flowers", name: "Flowers (Marigold/Rose/Jasmine)", icon: "🌸", category: "flowers", aliases: ["genda", "gulabi", "malle", "pucchei"], season: ["Year-round"], waterReq: "Medium" },
  { id: "medicinal", name: "Medicinal / Aromatic (Ashwagandha/Lemongrass)", icon: "🌿", category: "medicinal", aliases: ["ashwagandha", "lemongrass", "aloe vera"], season: ["Perennial"], waterReq: "Low" },

  // FODDER & MIXED
  { id: "fodder", name: "Fodder Crops (Napier Grass/Lucerne)", icon: "🌱", category: "fodder", aliases: ["napier", "lucerne", "chara", "grass"], season: ["Year-round"], waterReq: "Medium" },
  { id: "mixed_farming", name: "Mixed Farming (Multi-Crop)", icon: "🌾", category: "mixed", aliases: ["mixed", "poly culture", "multi crop"], season: ["Year-round"], waterReq: "Medium" },
  { id: "crop_livestock", name: "Crop + Livestock Farming", icon: "🐄", category: "mixed", aliases: ["dairy", "cattle", "poultry", "livestock"], season: ["Year-round"], waterReq: "Medium" },
  { id: "integrated_farming", name: "Integrated Farming System (IFS)", icon: "🐔", category: "mixed", aliases: ["ifs", "integrated", "agroforestry"], season: ["Year-round"], waterReq: "Medium" }
];

function searchCrops(query = "", category = "all") {
  const cleanQ = (query || "").toLowerCase().trim();
  
  return CROPS_DATABASE.filter(crop => {
    const matchesCategory = category === "all" || crop.category === category;
    if (!matchesCategory) return false;

    if (!cleanQ) return true;

    const nameMatch = crop.name.toLowerCase().includes(cleanQ);
    const catMatch = crop.category.toLowerCase().includes(cleanQ);
    const aliasMatch = Array.isArray(crop.aliases) && crop.aliases.some(a => a.toLowerCase().includes(cleanQ));

    return nameMatch || catMatch || aliasMatch;
  });
}

function convertToAcres(val, unit = "Acres") {
  const num = parseFloat(val) || 0;
  switch ((unit || "").toLowerCase()) {
    case "hectares":
    case "ha":
      return Math.round(num * 2.47105 * 100) / 100;
    case "cents":
      return Math.round(num * 0.01 * 100) / 100;
    case "guntas":
      return Math.round(num * 0.025 * 100) / 100;
    case "acres":
    default:
      return num;
  }
}

module.exports = {
  CROP_CATEGORIES,
  GROWTH_STAGES,
  CROPS_DATABASE,
  searchCrops,
  convertToAcres
};
