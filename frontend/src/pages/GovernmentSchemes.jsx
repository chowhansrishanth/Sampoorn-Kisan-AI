import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  Landmark,
  Percent,
  DollarSign,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldCheck,
  Filter,
  Search,
  AlertTriangle,
  Inbox,
  Sun,
  Shield,
  Tractor,
  Droplets,
  Coins,
  BookOpen,
  ArrowRight
} from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

// ============================================================================
// OFFICIAL CENTRAL & STATE GOVERNMENT AGRICULTURAL SCHEMES & SUBSIDIES
// ============================================================================
const OFFICIAL_GOVT_SCHEMES = [
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC) Scheme",
    agency: "Reserve Bank of India & NABARD",
    category: "Low-Interest Credit & Capital Loan",
    categoryKey: "loan",
    icon: Coins,
    provides: "Concessional short-term crop loans up to ₹3.00 Lakhs at 4.0% p.a. effective interest rate.",
    interestRate: "4.0% p.a. effective (7% base - 3% prompt repayment subvention)",
    loanLimit: "Up to ₹3.00 Lakhs collateral-free",
    subsidy: "3% Interest Subvention for timely repayment",
    purpose: "Short-term credit for crop cultivation, seeds, fertilizers, post-harvest expenses, machinery maintenance, and dairy/poultry operations.",
    eligibility: [
      "Individual owner-cultivator farmers",
      "Tenant farmers, oral lessees & sharecroppers",
      "Self Help Groups (SHGs) or Joint Liability Groups (JLGs)",
      "Dairy and animal husbandry farmers"
    ],
    documents: [
      "Aadhaar Card & Passport Photograph",
      "Land Record Certificate (7/12 extract / Khatauni / Pahani / Patta copy)",
      "Bank Account Passbook with Aadhaar linkage",
      "No Dues Certificate (NDC) or self-declaration for loans up to ₹1.60 Lakhs"
    ],
    process: "Fill the simplified 1-page KCC application form at any Public Sector Bank, Regional Rural Bank (RRB), or apply online via pmkisan.gov.in / CSC Centers.",
    officialSource: "https://pmkisan.gov.in/KCC.aspx",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ Verify interest subvention rates and local bank documentation requirements before applying."
  },
  {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)",
    agency: "Department of Agriculture & Farmers Welfare",
    category: "Equipment & Irrigation Subsidy",
    categoryKey: "irrigation",
    icon: Droplets,
    provides: "55% to 90% direct financial capital subsidy on installation of precision Drip & Sprinkler micro-irrigation systems.",
    interestRate: "N/A (Direct Capital Grant)",
    loanLimit: "Up to 80%-90% cost coverage with state top-ups",
    subsidy: "55% for Small/Marginal Farmers; 45% for General Farmers (Up to 90% in Telangana / AP / Maharashtra)",
    purpose: "Financial assistance for installing micro-irrigation systems (Drip Lines, Inline Emitters, Overhead Sprinklers, Rain Guns) to maximize water-use efficiency.",
    eligibility: [
      "Farmers owning cultivable land or holding verified long-term lease (minimum 7 years)",
      "Members of Water User Associations, SHGs, and Farmer Producer Organizations (FPOs)",
      "Priority given to Small and Marginal Farmers"
    ],
    documents: [
      "Application Form for Micro-Irrigation (State DBT Portal)",
      "Land Ownership Document (Khasra / Khatauni / Pahani / 7/12 extract)",
      "Empaneled Drip Equipment Dealer Quotation & Field Map",
      "Electricity Bill / Water Source Proof (Borewell or Well)",
      "Bank Account Passbook Copy linked to Aadhaar"
    ],
    process: "Submit land records and drip system dealer quotation online at your State Horticulture DBT Portal (e.g., TSMIP in Telangana, APMIP in Andhra Pradesh) or District Horticulture Office.",
    officialSource: "https://pmksy.gov.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ State top-up subsidies vary. Ensure equipment is purchased only from government-empaneled manufacturers for subsidy clearance."
  },
  {
    id: "pmkisan",
    name: "PM-Kisan Samman Nidhi (PM-KISAN)",
    agency: "Ministry of Agriculture & Farmers Welfare",
    category: "Direct Cash Income Support",
    categoryKey: "cash",
    icon: DollarSign,
    provides: "₹6,000 direct cash support per year deposited in 3 equal installments of ₹2,000 directly into farmer bank accounts.",
    interestRate: "N/A (100% Direct Cash Transfer)",
    loanLimit: "₹6,000 per year per eligible farm family",
    subsidy: "100% Direct Benefit Transfer (DBT)",
    purpose: "Direct income support to supplement landholding farmers' financial needs for procuring quality agricultural inputs like seeds, fertilizers, and fuel.",
    eligibility: [
      "All small and marginal landholding farmer families with cultivable land parcels in their names",
      "Aadhaar-seeded bank account with active e-KYC",
      "Exclusion criteria: Institutional landholders, constitutional post holders, and income-tax payers"
    ],
    documents: [
      "Aadhaar Card (Mandatory for e-KYC)",
      "Land Revenue Record / RoR / Khatauni copy",
      "NPCI / Aadhaar-seeded Bank Account Passbook",
      "Active Mobile Number linked to Aadhaar"
    ],
    process: "Self-register on pmkisan.gov.in under 'Farmers Corner' using Aadhaar, or complete biometric e-KYC at your nearest Common Service Center (CSC).",
    officialSource: "https://pmkisan.gov.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ Ensure your bank account has active NPCI Aadhaar seeding (DBT enabled) to receive automated installments without delay."
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    agency: "Empaneled Agriculture Insurance Companies & MoAFW",
    category: "Crop Loss Insurance",
    categoryKey: "insurance",
    icon: Shield,
    provides: "Comprehensive crop loss insurance cover against non-preventable natural risks (drought, flood, unseasonal rain, hailstorm, and pest epidemics).",
    interestRate: "N/A (Risk Insurance Cover)",
    loanLimit: "100% Sum Insured based on District Scale of Finance",
    subsidy: "Government pays 85% to 95% of total premium cost. Farmers pay only 1.5% to 2.0% of Sum Insured.",
    purpose: "Financial security for farmers against total or partial yield loss due to adverse weather events, post-harvest losses, and localized calamities.",
    eligibility: [
      "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas",
      "Voluntary for non-loanee farmers; auto-enrolled for loanee farmers (with opt-out option)"
    ],
    documents: [
      "Insurance Proposal Form",
      "Sowing Certificate / Crop Declaration issued by Village Revenue Officer / Patwari",
      "Land Record Certificate (Pahani / 7-12 / Khatauni)",
      "Aadhaar Card and Bank Account Details"
    ],
    process: "Enroll online at pmfby.gov.in portal, through bank branches, or via CSC centers before the seasonal cutoff deadline (Kharif: July 31; Rabi: Dec 31).",
    officialSource: "https://pmfby.gov.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ For localized hailstorm or waterlogging losses, farmers must report claims within 72 hours via the Crop Insurance App or Kisan Helpline (1800-180-1551)."
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    agency: "Department of Agriculture & Farmers Welfare",
    category: "Farm Machinery & Drones Subsidy",
    categoryKey: "equipment",
    icon: Tractor,
    provides: "40% to 50% capital subsidy on purchase of Tractors, Power Tillers, Rotavators, Combine Harvesters, and Kisan Drones.",
    interestRate: "N/A (Equipment Capital Grant)",
    loanLimit: "Up to ₹5.00 Lakhs for individual machines; up to ₹10.00 Lakhs for Custom Hiring Centers (CHC)",
    subsidy: "50% for SC/ST/Small/Marginal/Women farmers; 40% for General farmers",
    purpose: "Promotes modern farm mechanization, reduces labor drudgery, and supports establishing village Custom Hiring Centers.",
    eligibility: [
      "Small & Marginal Farmers, Women Farmers, and SC/ST Farmers",
      "Registered Farmer Producer Organizations (FPOs), Cooperatives, and SHGs",
      "Applicant must not have availed machinery subsidy in the previous 5 years"
    ],
    documents: [
      "Aadhaar Card and Passport Photograph",
      "Land Ownership Record Proof (Pahani / 7-12 extract)",
      "Bank Account Passbook Copy",
      "Proforma Invoice from an empaneled agricultural equipment manufacturer/dealer"
    ],
    process: "Register on agrimachinery.nic.in portal, choose empaneled dealer, upload proforma invoice, and submit application for District Agriculture Officer lottery/approval.",
    officialSource: "https://agrimachinery.nic.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ Always confirm that your equipment dealer is actively empaneled on the central agrimachinery.nic.in portal before issuing booking advances."
  },
  {
    id: "pmkusum",
    name: "PM-KUSUM Scheme (Solar Agricultural Pumps)",
    agency: "Ministry of New and Renewable Energy (MNRE)",
    category: "Solar Irrigation Subsidy",
    categoryKey: "solar",
    icon: Sun,
    provides: "60% to 90% subsidy on installation of Standalone Off-Grid Solar Water Pumps (3HP to 7.5HP) and solarization of existing grid pumps.",
    interestRate: "N/A (Capital Subsidy + 30% Bank Loan)",
    loanLimit: "Up to ₹3.50 Lakhs capital grant depending on pump capacity (3HP - 7.5HP)",
    subsidy: "30% Central Govt + 30% State Govt Subsidy (Farmer pays only 10% cash, remaining 30% bank loan)",
    purpose: "Provides reliable daytime irrigation power to farmers without electricity grid connections, eliminating expensive diesel pumping costs.",
    eligibility: [
      "Individual farmers having cultivable land with borewell/open well but lacking 3-phase grid power",
      "Water User Associations, Farmer Producer Organizations (FPOs), and Panchayats"
    ],
    documents: [
      "Aadhaar Card and Land Record (Pahani / Khatauni)",
      "Water Source Verification Certificate from local revenue authority",
      "Bank Account Passbook Copy",
      "NOC from state power distribution company (DISCOM)"
    ],
    process: "Apply online at your State Nodal Renewable Energy Agency portal (e.g., TSREDCO in Telangana, NREDCAP in AP, MEDA in Maharashtra) under PM-KUSUM Component-B.",
    officialSource: "https://pmkusum.mnre.gov.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ Beware of fraudulent fake websites. Always verify application status on official state renewable energy portals (e.g. mnre.gov.in)."
  },
  {
    id: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)",
    agency: "Ministry of Agriculture & Farmers Welfare",
    category: "Organic Farming Financial Assistance",
    categoryKey: "organic",
    icon: CheckCircle2,
    provides: "₹50,000 per hectare financial assistance for 3 years to adopt chemical-free natural and organic farming clusters.",
    interestRate: "N/A (Organic Transition Assistance)",
    loanLimit: "₹50,000 per hectare (up to 2 hectares per farmer in 20-hectare clusters)",
    subsidy: "₹31,000 DBT directly to farmer for organic bio-fertilizers, seeds & certification",
    purpose: "Encourages chemical-free natural farming, bio-fertilizer production (Jeevamrut, Vermicompost), Participatory Guarantee System (PGS-India) certification, and organic branding.",
    eligibility: [
      "Groups of 20 or more farmers forming a contiguous 20-hectare (50 acre) organic farming cluster",
      "Commitment to eliminate chemical synthetic fertilizers and pesticides for 3 consecutive years"
    ],
    documents: [
      "Aadhaar Card and Land Records of all cluster members",
      "Cluster Formation Resolution & Bank Account of the Farmer Group",
      "PGS-India farmer pledge certificate"
    ],
    process: "Form a farmer cluster of 20+ members and register through your local Block Agriculture Officer (BAO) or District Agriculture Officer.",
    officialSource: "https://pgsindia-ncof.gov.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ Cluster members receive PGS-India Green certification in Year 1 and PGS-India Organic certification after 3 years of chemical-free compliance."
  },
  {
    id: "shc",
    name: "Soil Health Card (SHC) Scheme",
    agency: "Department of Agriculture & Farmers Welfare",
    category: "Soil Testing & Nutrient Subsidy",
    categoryKey: "soil",
    icon: FileText,
    provides: "100% free comprehensive soil testing and customized NPK & micronutrient dosage recommendations every 2 years.",
    interestRate: "N/A (100% Free Govt Service)",
    loanLimit: "100% Free Soil Testing Report for all 12 critical chemical parameters",
    subsidy: "100% Government Funded",
    purpose: "Assesses field soil fertility across 12 parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) to prevent excessive fertilizer wastage and soil degradation.",
    eligibility: [
      "All farmers across all states and Union Territories in India",
      "Applicable for both irrigated and rainfed holdings"
    ],
    documents: [
      "Aadhaar Card",
      "Field Survey Number / Khasra Number",
      "Crop Sowing History"
    ],
    process: "Collect soil samples using standard V-shape auger method and deposit with Village Agriculture Assistant or nearest Krishi Vigyan Kendra (KVK) Soil Testing Lab.",
    officialSource: "https://soilhealth.dac.gov.in",
    lastVerifiedDate: "15 Sep 2026",
    verificationNotice: "⚠️ Download your digital Soil Health Card anytime from soilhealth.dac.gov.in using your Aadhaar or Mobile Number."
  }
];

export default function GovernmentSchemes() {
  const { language, t } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState(OFFICIAL_GOVT_SCHEMES[0]);

  // Filter & Search State
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterState, setFilterState] = useState("Telangana");
  const [filterIrrigation, setFilterIrrigation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchemes = OFFICIAL_GOVT_SCHEMES.filter((s) => {
    if (filterCategory !== "all" && s.categoryKey !== filterCategory) return false;
    if (filterIrrigation === "drip" && !["pmksy", "pmkusum"].includes(s.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.provides.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.agency.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="page-container schemes-page page-enter">
      {/* PAGE HEADER: DEDICATED GOVERNMENT SCHEMES PORTAL */}
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ background: "rgba(40, 116, 240, 0.12)", color: "#2874f0", padding: "8px", borderRadius: "8px" }}>
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: "23.5px" }}>
              🏛️ {t("nav_schemes", "Central & State Government Agricultural Schemes & Subsidies")}
            </h1>
            <p className="page-subtitle" style={{ margin: "2px 0 0" }}>
              {t("knowledge_hub_sub", "Verified government subsidies, 4% Kisan Credit Cards (KCC), PM-Kisan income support, PMKSY micro-irrigation grants, and PMFBY crop insurance.")}
            </p>
          </div>
        </div>
      </div>

      {/* CROSS-NAVIGATION BANNER TO KNOWLEDGE HUB */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(22, 163, 74, 0.08)",
          border: "1px solid rgba(22, 163, 74, 0.25)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BookOpen size={22} color="#16a34a" />
          <div>
            <strong style={{ fontSize: "14px", color: "var(--fk-text)", display: "block" }}>
              Need Field Agronomy Guides, Jeevamrut Recipes, or Pest Management Protocols?
            </strong>
            <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub)" }}>
              Explore practical ICAR crop production manuals, organic fertilizers, and drip maintenance in the Farmer Knowledge Hub.
            </span>
          </div>
        </div>
        <Link
          to="/knowledge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#16a34a",
            color: "#ffffff",
            padding: "7px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "700",
            textDecoration: "none",
            transition: "all 0.2s ease"
          }}
        >
          Open Knowledge Hub <ArrowRight size={14} />
        </Link>
      </div>

      {/* SEARCH & PARAMETER FILTER BAR */}
      <div
        className="glass-card"
        style={{
          background: "var(--fk-card)",
          border: "1px solid var(--fk-border)",
          borderRadius: "10px",
          padding: "18px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={18} color="var(--fk-blue)" />
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
              Filter Government Schemes for Your Farm
            </h3>
          </div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "3px 10px", borderRadius: "12px" }}>
            ⚡ Official Central & State Guidelines
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
          {/* STATE / REGION */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>
              State / Region
            </label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: "1px solid var(--fk-border)",
                background: "var(--fk-bg)",
                color: "var(--fk-text)",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Bihar">Bihar</option>
              <option value="All India">All India (Central Schemes)</option>
            </select>
          </div>

          {/* SCHEME CATEGORY */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>
              Scheme Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: "1px solid var(--fk-border)",
                background: "var(--fk-bg)",
                color: "var(--fk-text)",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              <option value="all">All Categories ({OFFICIAL_GOVT_SCHEMES.length} Schemes)</option>
              <option value="loan">Low Interest Bank Loans (4% KCC)</option>
              <option value="irrigation">Equipment & Drip Subsidies (PMKSY)</option>
              <option value="cash">Direct Cash Income (PM-Kisan)</option>
              <option value="insurance">Crop Loss Insurance (PMFBY)</option>
              <option value="equipment">Farm Machinery & Drones (SMAM)</option>
              <option value="solar">Solar Agriculture Pumps (PM-KUSUM)</option>
              <option value="organic">Organic Farming Aid (PKVY)</option>
              <option value="soil">Soil Testing & Health Card (SHC)</option>
            </select>
          </div>

          {/* WATER / IRRIGATION TYPE */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>
              Water / Irrigation Type
            </label>
            <select
              value={filterIrrigation}
              onChange={(e) => setFilterIrrigation(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: "1px solid var(--fk-border)",
                background: "var(--fk-bg)",
                color: "var(--fk-text)",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              <option value="all">Any Irrigation System</option>
              <option value="drip">Drip & Solar Micro-Irrigation</option>
              <option value="canal">Canal & Surface Water</option>
            </select>
          </div>

          {/* SEARCH BY KEYWORD */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>
              Search by Keyword
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KCC, Drip, Solar, PM-Kisan..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  borderRadius: "6px",
                  border: "1px solid var(--fk-border)",
                  background: "var(--fk-bg)",
                  color: "var(--fk-text)",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              />
              <Search size={14} color="var(--fk-text-sub)" style={{ position: "absolute", left: "10px", top: "11px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* SCHEMES MASTER-DETAIL VIEW */}
      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* LEFT COLUMN: MATCHING SCHEMES LIST */}
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "10px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Landmark size={20} color="#2563eb" />
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                Matching Government Schemes
              </h3>
            </div>
            <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", fontWeight: "bold" }}>
              {filteredSchemes.length} Available
            </span>
          </div>

          {filteredSchemes.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No Government Schemes Match"
              description="Try adjusting your keyword search or category filters to discover relevant agricultural subsidies."
              actionText="Reset All Filters"
              onAction={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterIrrigation("all");
              }}
            />
          ) : (
            filteredSchemes.map((scheme) => {
              const isSelected = selectedScheme?.id === scheme.id;
              const IconComp = scheme.icon || Landmark;
              return (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                    background: isSelected ? "rgba(37, 99, 235, 0.08)" : "var(--fk-bg)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        color: "#2563eb",
                        background: "rgba(37, 99, 235, 0.12)",
                        padding: "2px 8px",
                        borderRadius: "4px"
                      }}
                    >
                      {scheme.category}
                    </span>
                    <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#16a34a" }}>
                      Verified: {scheme.lastVerifiedDate}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                    <IconComp size={18} color="#2563eb" />
                    <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                      {scheme.name}
                    </h4>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "4px 0 0", lineHeight: "1.4" }}>
                    {scheme.provides}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: DETAILED SPECIFICATION CARD */}
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "10px",
            padding: "20px"
          }}
        >
          {selectedScheme && (
            <div>
              {/* SCHEME HEADER BANNER */}
              <div
                style={{
                  background: "rgba(37, 99, 235, 0.08)",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "8px",
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "28px",
                    flexShrink: 0
                  }}
                >
                  🏛️
                </div>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", textTransform: "uppercase" }}>
                    {selectedScheme.category}
                  </span>
                  <h2 style={{ fontSize: "19.5px", fontWeight: "800", color: "var(--fk-text)", margin: "2px 0 4px" }}>
                    {selectedScheme.name}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0 }}>
                    Governing Authority: <strong>{selectedScheme.agency}</strong>
                  </p>
                </div>
              </div>

              {/* VERIFICATION & ANTI-HALLUCINATION DISCLAIMER */}
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{selectedScheme.verificationNotice}</span>
              </div>

              {/* FINANCIAL LIMITS & RATES GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ background: "var(--fk-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Percent size={14} color="#2563eb" /> Interest Rate / Subvention
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
                    {selectedScheme.interestRate}
                  </div>
                </div>

                <div style={{ background: "var(--fk-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <DollarSign size={14} color="#16a34a" /> Grant / Loan Limit
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>
                    {selectedScheme.loanLimit}
                  </div>
                </div>
              </div>

              {/* WHAT IT PROVIDES */}
              <div style={{ marginBottom: "14px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "4px" }}>
                  Scheme Benefits & Financial Assistance
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", lineHeight: "1.5", margin: 0 }}>
                  {selectedScheme.provides}
                </p>
              </div>

              {/* ELIGIBILITY REQUIREMENTS */}
              <div style={{ marginBottom: "14px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={15} color="#16a34a" /> Eligibility Criteria
                </h4>
                <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13.5px", color: "var(--fk-text-sub)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {selectedScheme.eligibility.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* REQUIRED DOCUMENTS CHECKLIST */}
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={15} color="#2563eb" /> Mandatory Documents Checklist
                </h4>
                <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13.5px", color: "var(--fk-text-sub)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {selectedScheme.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              {/* APPLICATION PROCESS STEPS */}
              <div style={{ background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.25)", padding: "14px", borderRadius: "6px", marginBottom: "16px" }}>
                <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a", margin: "0 0 4px" }}>
                  How to Apply (Step-by-Step)
                </h5>
                <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: 0, lineHeight: "1.4" }}>
                  {selectedScheme.process}
                </p>
              </div>

              {/* OFFICIAL PORTAL LINK & AUDIT BADGE */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--fk-bg)", padding: "12px 14px", borderRadius: "6px", border: "1px solid var(--fk-border)", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", display: "block" }}>
                    Official Government Portal
                  </span>
                  <a
                    href={selectedScheme.officialSource}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "13.5px", fontWeight: "bold", color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {selectedScheme.officialSource} <ExternalLink size={12} />
                  </a>
                </div>
                <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                  <ShieldCheck size={14} /> Verified Reference ({selectedScheme.lastVerifiedDate})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
