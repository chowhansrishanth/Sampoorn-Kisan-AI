import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../api/client";
import { BookOpen, TrendingUp, Leaf, CheckCircle2, DollarSign, FileText, Landmark, Percent, ExternalLink, ShieldCheck, Filter, Search, AlertTriangle, Inbox } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

const OFFICIAL_GOVT_SCHEMES = [
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC) Scheme",
    agency: "Reserve Bank of India & NABARD",
    category: "Low-Interest Credit & Capital Loan",
    categoryKey: "loan",
    provides: "Concessional short-term crop loans up to ₹3.00 Lakhs at 4.0% p.a. effective interest rate.",
    interestRate: "4.0% p.a. effective (7% base - 3% prompt repayment subvention)",
    loanLimit: "Up to ₹3.00 Lakhs collateral-free",
    subsidy: "3% Interest Subvention for timely repayment",
    purpose: "Short-term credit for crop cultivation, post-harvest expenses, machinery maintenance, and dairy/poultry operations.",
    eligibility: [
      "Individual owner-cultivator farmers",
      "Tenant farmers, oral lessees & sharecroppers",
      "Self Help Groups (SHGs) or Joint Liability Groups (JLGs)"
    ],
    documents: [
      "Aadhaar Card & Passport Photograph",
      "Land Record Certificate (7/12 extract / Khatauni / Pahani / Lease agreement)",
      "Bank Account Passbook with Aadhaar linkage"
    ],
    process: "Fill the 1-page KCC application form at any Public Sector Bank, RRB, or apply online at pmkisan.gov.in.",
    officialSource: "https://pmkisan.gov.in/KCC.aspx",
    lastVerifiedDate: "13 Aug 2026",
    verificationNotice: "⚠️ Verify interest subvention rates and local bank documentation requirements before applying."
  },
  {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana (PMKSY - Micro Irrigation)",
    agency: "Department of Agriculture & Farmers Welfare",
    category: "Equipment & Irrigation Subsidy",
    categoryKey: "irrigation",
    provides: "55% to 90% direct financial subsidy on installation of Drip & Sprinkler irrigation systems.",
    interestRate: "N/A (Direct Capital Grant)",
    loanLimit: "Up to 80%-90% cost coverage with state top-ups",
    subsidy: "55% for Small/Marginal Farmers; 45% for General Farmers",
    purpose: "Financial assistance for installing micro-irrigation systems (Drip Lines, Sprinklers, Rain Guns) to optimize water efficiency.",
    eligibility: [
      "Farmers owning land or having land lease for minimum 7 years",
      "Members of Water User Associations, SHGs, and Farmer Producer Organizations (FPOs)",
      "Priority given to Small and Marginal Farmers"
    ],
    documents: [
      "Application Form for Micro-Irrigation",
      "Land Ownership Document (Khasra/Khatauni/Pahani)",
      "Empaneled Drip Equipment Dealer Quotation",
      "Bank Account Passbook Copy"
    ],
    process: "Submit land records and drip quotation to your District Horticulture Officer or State DBT Portal.",
    officialSource: "https://pmksy.gov.in",
    lastVerifiedDate: "13 Aug 2026",
    verificationNotice: "⚠️ Subsidy rates vary slightly by state top-up funding. Confirm quota at District Horticulture Office."
  },
  {
    id: "pmkisan",
    name: "PM-Kisan Samman Nidhi (PM-KISAN)",
    agency: "Ministry of Agriculture & Farmers Welfare",
    category: "Direct Cash Income Support",
    categoryKey: "cash",
    provides: "₹6,000 direct cash support per year deposited in 3 equal installments of ₹2,000 into farmer bank accounts.",
    interestRate: "N/A (100% Direct Cash Transfer)",
    loanLimit: "₹6,000 per year per eligible family",
    subsidy: "100% Direct Benefit Transfer (DBT)",
    purpose: "Direct income support to supplement landholding farmers' financial needs for procuring agricultural inputs.",
    eligibility: [
      "All small and marginal landholding farmer families with cultivable land in their names",
      "Subject to institutional exclusion criteria (high-income taxpayers)"
    ],
    documents: [
      "Aadhaar Card (Mandatory)",
      "Land Revenue Record / RoR Copy",
      "Aadhaar-seeded Bank Account Details"
    ],
    process: "Self-register on pmkisan.gov.in using Aadhaar or complete e-KYC at nearest CSC center.",
    officialSource: "https://pmkisan.gov.in",
    lastVerifiedDate: "13 Aug 2026",
    verificationNotice: "⚠️ Ensure e-KYC and NPCI bank account seeding are active on pmkisan.gov.in portal."
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    agency: "Empaneled Agriculture Insurance Companies",
    category: "Crop Loss Insurance",
    categoryKey: "insurance",
    provides: "Comprehensive crop insurance protection against natural drought, flood, pests, and localized yield loss.",
    interestRate: "N/A (Risk Insurance Cover)",
    loanLimit: "100% Sum Insured based on District Scale of Finance",
    subsidy: "Government pays 90%+ of total premium cost",
    purpose: "Comprehensive crop loss protection against natural risks (droughts, floods, hail, localized inundation).",
    eligibility: [
      "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas",
      "Voluntary for non-loanee farmers; auto-enrolled for loanee farmers (can opt-out)"
    ],
    documents: [
      "Proposal Form for Insurance",
      "Sowing Certificate issued by Patwari / Village Revenue Officer",
      "Aadhaar Card and Bank Passbook"
    ],
    process: "Enroll online at pmfby.gov.in portal or via CSC center before seasonal cutoff date.",
    officialSource: "https://pmfby.gov.in",
    lastVerifiedDate: "13 Aug 2026",
    verificationNotice: "⚠️ Enrollment cutoff dates vary by state; verify deadline on pmfby.gov.in before sowing completes."
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    agency: "Ministry of Agriculture",
    category: "Farm Machinery Subsidy",
    categoryKey: "equipment",
    provides: "40% to 50% subsidy on purchase of Tractors, Power Tillers, Rotavators, Combine Harvesters, and Agri-Drones.",
    interestRate: "N/A (Equipment Capital Grant)",
    loanLimit: "Up to ₹5 Lakhs for individual equipment; ₹10 Lakhs for CHC",
    subsidy: "40% to 50% subsidy for individual farmers",
    purpose: "Promotes farm mechanization by providing subsidies on machinery and setting up Custom Hiring Centers.",
    eligibility: [
      "Small & Marginal Farmers, Women Farmers, SC/ST Farmers",
      "Registered Farmer Producer Organizations (FPOs) & Cooperatives"
    ],
    documents: [
      "Aadhaar Card & Photo",
      "Land Ownership Record Proof",
      "Bank Account Passbook",
      "Dealer Quotation / Proforma Invoice"
    ],
    process: "Register on agrimachinery.nic.in portal and upload proforma invoice from an empaneled machinery dealer.",
    officialSource: "https://agrimachinery.nic.in",
    lastVerifiedDate: "13 Aug 2026",
    verificationNotice: "⚠️ Verify dealer empanelement status on agrimachinery.nic.in before making advance payments."
  }
];

export default function KnowledgeHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'articles' ? 'agronomy' : 'schemes';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedScheme, setSelectedScheme] = useState(OFFICIAL_GOVT_SCHEMES[0]);
  const [articles, setArticles] = useState([]);
  const [yieldHistory, setYieldHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const selectTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'agronomy' ? { tab: 'articles' } : {});
  };

  // Search Filter State
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterState, setFilterState] = useState("Telangana");
  const [filterIrrigation, setFilterIrrigation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const fetchKnowledge = async () => {
      try {
        const [artRes, yieldRes] = await Promise.all([
          axios.get("/api/knowledge/articles", { signal: controller.signal }),
          axios.get("/api/knowledge/yield-history", { signal: controller.signal })
        ]);
        if (!isSubscribed) return;
        setArticles(Array.isArray(artRes.data) ? artRes.data : []);
        setYieldHistory(Array.isArray(yieldRes.data) ? yieldRes.data : []);
      } catch (e) {
        if (axios.isCancel(e) || e.name === "CanceledError" || e.name === "AbortError") return;
        setLoadError("Knowledge data could not be loaded. Please try again.");
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };
    fetchKnowledge();
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, []);

  const filteredSchemes = OFFICIAL_GOVT_SCHEMES.filter(s => {
    if (filterCategory !== "all" && s.categoryKey !== filterCategory) return false;
    if (filterIrrigation === "drip" && s.id !== "pmksy") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.provides.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-container knowledge-page page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">🏛️ Intelligent Government Scheme Finder & Agronomy Hub</h1>
          <p className="page-subtitle">Browse government-scheme reference information. Confirm current eligibility, rates, deadlines, and state availability with the linked official portal before applying.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`secondary-btn ${activeTab === 'schemes' ? 'active' : ''}`}
            onClick={() => selectTab('schemes')}
            style={{ fontWeight: 'bold' }}
          >
            🏛️ Intelligent Scheme Finder
          </button>
          <button
            className={`secondary-btn ${activeTab === 'agronomy' ? 'active' : ''}`}
            onClick={() => selectTab('agronomy')}
            style={{ fontWeight: 'bold' }}
          >
            🌱 Agronomy & Yield History
          </button>
        </div>
      </div>

      {activeTab === 'schemes' ? (
        <div>
          {/* SEARCH & PARAMETER FILTER BAR */}
          <div className="glass-card" style={{ marginBottom: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Filter size={18} color="var(--fk-blue)" />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>
                Intelligent Scheme Filter (Match Farm Parameters)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  State / Region
                </label>
                <select
                  value={filterState}
                  onChange={e => setFilterState(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
                >
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Bihar">Bihar</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Scheme Category
                </label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
                >
                  <option value="all">All Categories</option>
                  <option value="loan">Low Interest Bank Loans (KCC)</option>
                  <option value="irrigation">Equipment & Drip Subsidy (PMKSY)</option>
                  <option value="cash">Direct Cash Income (PM-Kisan)</option>
                  <option value="insurance">Crop Loss Insurance (PMFBY)</option>
                  <option value="equipment">Farm Machinery Grant (SMAM)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Water / Irrigation Type
                </label>
                <select
                  value={filterIrrigation}
                  onChange={e => setFilterIrrigation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
                >
                  <option value="all">Any Irrigation System</option>
                  <option value="drip">Drip / Sprinkler Micro-Irrigation</option>
                  <option value="canal">Canal / Borewell Surface</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Search by Keyword
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search KCC, Drip, PM-Kisan..."
                    style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
                  />
                  <Search size={14} color="var(--fk-text-sub)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2-col">
            {/* SCHEMES LIST */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Landmark size={20} color="#2874f0" />
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>Matching Government Schemes</h3>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--fk-text-sub)', fontWeight: 'bold' }}>{filteredSchemes.length} Found</span>
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
                filteredSchemes.map(scheme => {
                  const isSelected = selectedScheme?.id === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '6px',
                        border: `1px solid ${isSelected ? '#2874f0' : 'var(--fk-border)'}`,
                        background: isSelected ? 'rgba(40, 116, 240, 0.12)' : 'var(--fk-card)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#2874f0', background: 'rgba(40, 116, 240, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                          {scheme.category}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#388e3c' }}>
                          Reference date: {scheme.lastVerifiedDate} — confirm current terms
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--fk-text)', margin: '4px 0' }}>{scheme.name}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>{scheme.provides}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* SCHEME DETAILED SPEC CARD */}
            <div className="glass-card">
              {selectedScheme && (
                <div>
                  <div style={{ background: 'rgba(40, 116, 240, 0.1)', border: '1px solid var(--fk-border)', borderRadius: '6px', padding: '18px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', flexShrink: 0 }}>
                      🏛️
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#2874f0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {selectedScheme.category}
                      </span>
                      <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--fk-text)', margin: '4px 0' }}>{selectedScheme.name}</h2>
                      <p style={{ fontSize: '12px', color: 'var(--fk-text-sub)', margin: 0 }}>Authority: <strong>{selectedScheme.agency}</strong></p>
                    </div>
                  </div>

                  {/* Verification & Anti-Hallucination Disclaimer Banner */}
                  <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>{selectedScheme.verificationNotice}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ background: 'var(--fk-bg)', padding: '12px', borderRadius: '4px', border: '1px solid var(--fk-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Percent size={14} color="#2874f0" /> Rates / Subvention
                      </span>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#2874f0', marginTop: '4px' }}>{selectedScheme.interestRate}</div>
                    </div>
                    <div style={{ background: 'var(--fk-bg)', padding: '12px', borderRadius: '4px', border: '1px solid var(--fk-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={14} color="#388e3c" /> Grant / Loan Limit
                      </span>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#388e3c', marginTop: '4px' }}>{selectedScheme.loanLimit}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text)', marginBottom: '6px' }}>What it Provides</h4>
                    <p style={{ fontSize: '13px', color: 'var(--fk-text-sub)', lineHeight: '1.5', margin: 0 }}>{selectedScheme.provides}</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#388e3c" /> Eligibility Requirements
                    </h4>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--fk-text-sub)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedScheme.eligibility.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} color="#2874f0" /> Required Documents Checklist
                    </h4>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--fk-text-sub)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedScheme.documents.map((doc, idx) => <li key={idx}>{doc}</li>)}
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(56, 142, 60, 0.1)', border: '1px solid rgba(56, 142, 60, 0.3)', padding: '14px', borderRadius: '6px', marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#388e3c', margin: '0 0 4px' }}>Application Process Steps</h5>
                    <p style={{ fontSize: '12px', color: 'var(--fk-text)', margin: 0, lineHeight: '1.4' }}>{selectedScheme.process}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--fk-bg)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', display: 'block' }}>Official Government Portal</span>
                      <a href={selectedScheme.officialSource} target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 'bold', color: '#2874f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {selectedScheme.officialSource} <ExternalLink size={12} />
                      </a>
                    </div>
                    <span style={{ fontSize: '11px', color: '#388e3c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} /> Reference date: {selectedScheme.lastVerifiedDate} — confirm current terms
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AGRONOMY & HISTORICAL YIELD TAB */
        <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#2874f0" />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--fk-text)' }}>Agronomy Best Practices</h3>
              </div>
            </div>

            {loadError ? (
              <EmptyState icon={AlertTriangle} title="Knowledge data is unavailable" description={loadError} />
            ) : loading ? (
              <p style={{ color: 'var(--fk-text-sub)' }}>Loading articles...</p>
            ) : articles.length === 0 ? (
              <EmptyState icon={Inbox} title="No agronomy articles available" description="The knowledge service did not return any articles." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {articles.map((article, idx) => (
                  <div key={idx} style={{ padding: '14px', background: 'var(--fk-bg)', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Leaf size={14} color="#388e3c" />
                      <span style={{ fontSize: '11px', color: '#388e3c', fontWeight: '800', textTransform: 'uppercase' }}>{article.category}</span>
                    </div>
                    <h4 style={{ fontSize: '15px', color: 'var(--fk-text)', fontWeight: '800', marginBottom: '6px' }}>{article.title}</h4>
                    <p style={{ color: 'var(--fk-text-sub)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{article.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#388e3c" />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--fk-text)' }}>Historical Yield Benchmarks (Wheat & Rice)</h3>
              </div>
            </div>

            {yieldHistory.length === 0 ? (
              <EmptyState icon={Inbox} title="No harvest history recorded" description="Add verified harvest observations to see your farm-specific yield benchmarks here." />
            ) : <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--fk-bg)', borderBottom: '1px solid var(--fk-border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Year</th>
                  <th style={{ padding: '10px' }}>AI Target</th>
                  <th style={{ padding: '10px' }}>Actual Harvest</th>
                  <th style={{ padding: '10px' }}>Variance</th>
                </tr>
              </thead>
              <tbody>
                {yieldHistory.map((yr, idx) => {
                  const variance = (yr.actual - yr.expected).toFixed(1);
                  const isPos = variance >= 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--fk-border)' }}>
                      <td style={{ padding: '10px', fontWeight: '700' }}>{yr.year}</td>
                      <td style={{ padding: '10px' }}>{yr.expected} t/ha</td>
                      <td style={{ padding: '10px' }}>{yr.actual} t/ha</td>
                      <td style={{ padding: '10px', fontWeight: '700', color: isPos ? '#388e3c' : '#d32f2f' }}>
                        {isPos ? '+' : ''}{variance} t/ha
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>}
          </div>
        </div>
      )}
    </div>
  );
}
