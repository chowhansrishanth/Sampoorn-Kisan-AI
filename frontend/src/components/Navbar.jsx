import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageCircle, ShieldCheck, Brain, Wheat, User, Globe, LogIn, LogOut, BookOpen, Landmark, Settings, Search, MapPin, Sun, Moon, Menu, X, Sprout, Calendar, Bell, Shield, Droplet, RotateCcw, FileText, Satellite, Truck, HeartPulse, Activity, TrendingUp, QrCode, Clock, FlaskConical, Leaf, SunMedium, Umbrella, Award } from "lucide-react";
import ProfileModal from "./ProfileModal";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useNetworkStatus } from "../utils/offlineSync";

const LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "HI", name: "हिंदी (Hindi)" },
  { code: "TE", name: "తెలుగు (Telugu)" },
  { code: "TA", name: "தமிழ் (Tamil)" },
  { code: "KN", name: "ಕನ್ನಡ (Kannada)" },
  { code: "MR", name: "मराठी (Marathi)" },
  { code: "PA", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "BN", name: "বাংলা (Bengali)" },
  { code: "GU", name: "ગુજરાતી (Gujarati)" }
];

export default function Navbar({ onOpenAuth, user, onLogout, onUpdateUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOnline, pendingCount } = useNetworkStatus();

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path ? "fk-category-item active" : "fk-category-item";
  const isDrawerActive = (path) => location.pathname === path ? "fk-drawer-item active" : "fk-drawer-item";

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    if (query.includes("disease") || query.includes("leaf") || query.includes("diagnosis")) {
      navigate("/disease");
    } else if (query.includes("forecast") || query.includes("arbitrage") || query.includes("future price") || query.includes("best day")) {
      navigate("/mandi-forecast");
    } else if (query.includes("organic") || query.includes("jeevamrutha") || query.includes("zbnf") || query.includes("bio-input") || query.includes("biofertilizer")) {
      navigate("/organic-farming");
    } else if (query.includes("solar") || query.includes("pump") || query.includes("kusum") || query.includes("pm-kusum") || query.includes("borewell")) {
      navigate("/solar-pump");
    } else if (query.includes("insurance") || query.includes("pmfby") || query.includes("claim") || query.includes("crop loss") || query.includes("premium")) {
      navigate("/crop-insurance");
    } else if (query.includes("carbon") || query.includes("credit") || query.includes("regenerative") || query.includes("verra") || query.includes("soc")) {
      navigate("/carbon-credits");
    } else if (query.includes("hire") || query.includes("tractor") || query.includes("machine") || query.includes("drone") || query.includes("harvester")) {
      navigate("/hire");
    } else if (query.includes("soil health") || query.includes("shc") || query.includes("nutrient") || query.includes("deficiency")) {
      navigate("/soil-health");
    } else if (query.includes("tank") || query.includes("mix") || query.includes("chemical") || query.includes("pesticide")) {
      navigate("/tank-mix");
    } else if (query.includes("trace") || query.includes("qr") || query.includes("passport") || query.includes("batch")) {
      navigate("/traceability");
    } else if (query.includes("gdd") || query.includes("degree day") || query.includes("phenology") || query.includes("thermal")) {
      navigate("/gdd-radar");
    } else if (query.includes("livestock") || query.includes("cattle") || query.includes("cow") || query.includes("buffalo") || query.includes("dairy") || query.includes("mastitis") || query.includes("fmd")) {
      navigate("/livestock");
    } else if (query.includes("weather") || query.includes("rain") || query.includes("temperature") || query.includes("forecast")) {
      navigate("/weather");
    } else if (query.includes("mandi") || query.includes("price") || query.includes("market") || query.includes("rate") || query.includes("apmc")) {
      navigate("/mandi");
    } else if (query.includes("dashboard")) {
      navigate("/dashboard");
    } else if (query.includes("chat") || query.includes("sahayak") || query.includes("help") || query.includes("ask")) {
      navigate("/chat");
    } else if (query.includes("xai") || query.includes("explain") || query.includes("shap")) {
      navigate("/xai");
    } else if (query.includes("yield") || query.includes("production")) {
      navigate("/yield-predictor");
    } else if (query.includes("crop") || query.includes("budget")) {
      navigate("/crop-tool");
    } else {
      navigate("/knowledge");
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <header style={{ width: '100%' }}>
      {/* Primary Top Header */}
      <div className="fk-top-header glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="fk-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="fk-brand-logo">
            <div className="fk-brand-name">
              <Sprout size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
              <span style={{ color: '#ffffff', fontWeight: 800 }}>Sampoorn</span>
              <span style={{ color: '#facc15', fontWeight: 800, marginLeft: '3px' }}>Kisan AI</span>
            </div>
            <div className="fk-plus-tag fk-tag-desktop">
              <span>Agriculture Decision Support</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                <span className="dg-live-dot"></span> LIVE
              </span>
            </div>
          </Link>
        </div>

        {/* Central Search Bar */}
        <form className="fk-search-container" onSubmit={handleSearch}>
          <div className="fk-search-box">
            <input 
              type="text" 
              className="fk-search-input" 
              placeholder={t('search_placeholder', 'Search crop recommendations, mandi rates, soil health, loans, weather...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search agricultural tools and prices"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 6px', display: 'flex', alignItems: 'center' }}
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
            <button type="submit" className="fk-search-btn" title="Search">
              <Search size={17} />
            </button>
          </div>
        </form>

        {/* Header Right Actions */}
        <div className="fk-header-actions">
          {/* Live Network Status Chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.18)',
              border: `1px solid ${isOnline ? 'rgba(34, 197, 94, 0.35)' : 'rgba(234, 179, 8, 0.45)'}`,
              color: isOnline ? '#4ade80' : '#facc15'
            }}
            title={isOnline ? 'Connected to field server' : `${pendingCount} offline items queued in IndexedDB`}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? '#22c55e' : '#facc15', display: 'inline-block' }}></span>
            <span className="fk-btn-text-desktop">{isOnline ? 'Online' : `Offline (${pendingCount})`}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="fk-theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light Dark Theme"
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: '#facc15' }} /> : <Moon size={15} />}
            <span className="fk-btn-text-desktop">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <div className="fk-lang-wrapper">
            <Globe size={15} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="fk-lang-select"
              aria-label="Select Language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ background: '#0f172a', color: '#ffffff' }}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                className="fk-user-pill" 
                onClick={() => setIsProfileOpen(true)} 
                title={`${getGreeting()}, ${user.name || 'Farmer'}! Click to manage farm profile`}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsProfileOpen(true); }}
              >
                <User size={15} style={{ flexShrink: 0 }} />
                <span className="fk-user-pill-name">{user.name ? user.name.split(' ')[0] : 'Farmer'}</span>
                <span className="fk-user-pill-loc">
                  <MapPin size={10} /> {user.location ? user.location.split(',')[0] : 'India'}
                </span>
              </div>
              <button 
                onClick={() => setIsProfileOpen(true)} 
                className="fk-icon-action-btn"
                title="Change Location & Profile"
                aria-label="Settings"
              >
                <Settings size={17} />
              </button>
              <button 
                onClick={onLogout} 
                className="fk-icon-action-btn"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button className="fk-login-btn-header" onClick={onOpenAuth}>
              <LogIn size={15} style={{ marginRight: '4px' }} /> {t('login', 'Login')}
            </button>
          )}
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <nav className={`fk-category-strip ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
        <Link to="/crop-tool" className={isActive("/crop-tool")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Wheat size={20} />
          </div>
          <span>{t('smart_budget_crop', 'Crop Planner')}</span>
          <span className="fk-cat-badge free">SOIL & NPK</span>
        </Link>

        <Link to="/disease" className={isActive("/disease")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <ShieldCheck size={20} />
          </div>
          <span>{t('disease_diagnosis', 'Disease Diagnosis')}</span>
          <span className="fk-cat-badge free">GRAD-CAM</span>
        </Link>

        <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <LayoutDashboard size={20} />
          </div>
          <span>{t('mandi_weather', 'Mandi & Weather')}</span>
          <span className="fk-cat-badge">LIVE APMC</span>
        </Link>

        <Link to="/chat" className={isActive("/chat")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <MessageCircle size={20} />
          </div>
          <span>{t('sahayak_ai', 'Sahayak 24x7 AI')}</span>
        </Link>

        <Link to="/xai" className={isActive("/xai")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Brain size={20} />
          </div>
          <span>{t('xai_visualizer', 'Explainable AI')}</span>
        </Link>

        <Link to="/schemes" className={isActive("/schemes")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Landmark size={20} />
          </div>
          <span>{t('govt_schemes', 'Government Schemes & Subsidies')}</span>
        </Link>

        <Link to="/knowledge" className={isActive("/knowledge")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <BookOpen size={20} />
          </div>
          <span>{t('knowledge_hub', 'Knowledge Hub')}</span>
        </Link>

        <Link to="/benchmark" className={isActive("/benchmark")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Sprout size={20} />
          </div>
          <span>AI Benchmark</span>
          <span className="fk-cat-badge free">3,500 TESTS</span>
        </Link>

        <Link to="/calendar" className={isActive("/calendar")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Calendar size={20} />
          </div>
          <span>Crop Calendar</span>
          <span className="fk-cat-badge free">ICAR</span>
        </Link>

        <Link to="/alerts" className={isActive("/alerts")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Bell size={20} />
          </div>
          <span>Farmer Alerts</span>
        </Link>

        <Link to="/profitability" onClick={() => setMobileMenuOpen(false)}>Profitability</Link>
        <Link to="/fertilizer" onClick={() => setMobileMenuOpen(false)}>Fertilizer Planner</Link>
        <Link to="/irrigation" className={isActive("/irrigation")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Droplet size={20} />
          </div>
          <span>Smart Irrigation</span>
          <span className="fk-cat-badge free">FAO-56</span>
        </Link>

        <Link to="/rotation" className={isActive("/rotation")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <RotateCcw size={20} />
          </div>
          <span>Crop Rotation</span>
          <span className="fk-cat-badge">SOIL N</span>
        </Link>

        <Link to="/ledger" className={isActive("/ledger")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <FileText size={20} />
          </div>
          <span>Farm Ledger & KCC</span>
          <span className="fk-cat-badge free">LOAN</span>
        </Link>

        <Link to="/satellite" className={isActive("/satellite")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Satellite size={20} />
          </div>
          <span>Satellite NDVI</span>
          <span className="fk-cat-badge">10m RES</span>
        </Link>

        <Link to="/mandi-forecast" className={isActive("/mandi-forecast")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <TrendingUp size={20} />
          </div>
          <span>Mandi Forecast</span>
          <span className="fk-cat-badge free">7-DAY AI</span>
        </Link>

        <Link to="/hire" className={isActive("/hire")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Truck size={20} />
          </div>
          <span>Machinery Hub</span>
          <span className="fk-cat-badge">CHC</span>
        </Link>

        <Link to="/soil-health" className={isActive("/soil-health")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <FlaskConical size={20} />
          </div>
          <span>Soil Health</span>
          <span className="fk-cat-badge free">ICAR SHC</span>
        </Link>

        <Link to="/tank-mix" className={isActive("/tank-mix")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <ShieldCheck size={20} />
          </div>
          <span>Tank-Mix Safety</span>
          <span className="fk-cat-badge">CIBRC</span>
        </Link>

        <Link to="/traceability" className={isActive("/traceability")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <QrCode size={20} />
          </div>
          <span>QR Traceability</span>
          <span className="fk-cat-badge free">PASSPORT</span>
        </Link>

        <Link to="/gdd-radar" className={isActive("/gdd-radar")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Clock size={20} />
          </div>
          <span>GDD Radar</span>
          <span className="fk-cat-badge">THERMAL</span>
        </Link>

        <Link to="/yield-predictor" className={isActive("/yield-predictor")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Activity size={20} />
          </div>
          <span>Yield Predictor</span>
          <span className="fk-cat-badge free">AI YIELD</span>
        </Link>

        <Link to="/livestock" className={isActive("/livestock")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <HeartPulse size={20} />
          </div>
          <span>Livestock & Dairy</span>
          <span className="fk-cat-badge">IVRI</span>
        </Link>

        <Link to="/organic-farming" className={isActive("/organic-farming")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Leaf size={20} />
          </div>
          <span>Organic & ZBNF</span>
          <span className="fk-cat-badge free">ZBNF</span>
        </Link>

        <Link to="/solar-pump" className={isActive("/solar-pump")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <SunMedium size={20} />
          </div>
          <span>Solar Pump</span>
          <span className="fk-cat-badge">PM-KUSUM</span>
        </Link>

        <Link to="/crop-insurance" className={isActive("/crop-insurance")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Umbrella size={20} />
          </div>
          <span>Crop Insurance</span>
          <span className="fk-cat-badge free">PMFBY 72H</span>
        </Link>

        <Link to="/carbon-credits" className={isActive("/carbon-credits")} onClick={() => setMobileMenuOpen(false)}>
          <div className="fk-category-icon-box">
            <Award size={20} />
          </div>
          <span>Carbon Credits</span>
          <span className="fk-cat-badge">VERRA</span>
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className={isActive("/admin")} onClick={() => setMobileMenuOpen(false)}>
            <div className="fk-category-icon-box">
              <Shield size={20} />
            </div>
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fk-mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <aside className="fk-mobile-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
            <div className="fk-drawer-header">
              <div className="fk-brand-name">
                <Sprout size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                <span style={{ color: 'var(--fk-text)', fontWeight: 800 }}>Sampoorn Kisan AI</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="fk-drawer-close-btn"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="fk-drawer-user-card" onClick={() => { setIsProfileOpen(true); setMobileMenuOpen(false); }} tabIndex={0} role="button">
                <div className="fk-drawer-user-avatar">
                  <User size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--fk-text)' }}>{getGreeting()}, {user.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--fk-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {user.location || 'India'}
                  </div>
                </div>
                <Settings size={16} style={{ color: 'var(--fk-text-muted)' }} />
              </div>
            )}

            <div className="fk-drawer-links">
              <div className="fk-drawer-section-label">AI Decision Support Tools</div>
              <Link to="/crop-tool" className={isDrawerActive("/crop-tool")} onClick={() => setMobileMenuOpen(false)}>
                <Wheat size={18} style={{ color: '#10b981' }} />
                <span>{t('smart_budget_crop', 'Crop Planner & Soil NPK')}</span>
              </Link>
              <Link to="/disease" className={isDrawerActive("/disease")} onClick={() => setMobileMenuOpen(false)}>
                <ShieldCheck size={18} style={{ color: '#059669' }} />
                <span>{t('disease_diagnosis', 'Disease Diagnosis (Grad-CAM)')}</span>
              </Link>
              <Link to="/dashboard" className={isDrawerActive("/dashboard")} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={18} style={{ color: '#0284c7' }} />
                <span>{t('mandi_weather', 'Mandi Rates & Weather Radar')}</span>
              </Link>
              <Link to="/chat" className={isDrawerActive("/chat")} onClick={() => setMobileMenuOpen(false)}>
                <MessageCircle size={18} style={{ color: '#8b5cf6' }} />
                <span>{t('sahayak_ai', 'Sahayak 24x7 Multilingual AI')}</span>
              </Link>
              <Link to="/xai" className={isDrawerActive("/xai")} onClick={() => setMobileMenuOpen(false)}>
                <Brain size={18} style={{ color: '#ec4899' }} />
                <span>{t('xai_visualizer', 'Explainable AI (SHAP & LIME)')}</span>
              </Link>
              <Link to="/schemes" className={isDrawerActive("/schemes")} onClick={() => setMobileMenuOpen(false)}>
                <Landmark size={18} style={{ color: '#2563eb' }} />
                <span>{t('govt_schemes', 'Government Schemes & Subsidies')}</span>
              </Link>
              <Link to="/knowledge" className={isDrawerActive("/knowledge")} onClick={() => setMobileMenuOpen(false)}>
                <BookOpen size={18} style={{ color: '#16a34a' }} />
                <span>{t('knowledge_hub', 'Farmer Knowledge Hub')}</span>
              </Link>
              <Link to="/benchmark" className={isDrawerActive("/benchmark")} onClick={() => setMobileMenuOpen(false)}>
                <Sprout size={18} style={{ color: '#10b981' }} />
                <span>AI Accuracy Benchmark (3,500 Tests)</span>
              </Link>

              <div className="fk-drawer-section-label" style={{ marginTop: 12 }}>Phase 2 — New Features</div>
              <Link to="/calendar" className={isDrawerActive("/calendar")} onClick={() => setMobileMenuOpen(false)}>
                <Calendar size={18} style={{ color: '#22c55e' }} />
                <span>Crop Calendar (ICAR-Aligned)</span>
              </Link>
              <Link to="/alerts" className={isDrawerActive("/alerts")} onClick={() => setMobileMenuOpen(false)}>
                <Bell size={18} style={{ color: '#f59e0b' }} />
                <span>Farmer Alerts &amp; Notifications</span>
              </Link>
              <div className="fk-drawer-section-label" style={{ marginTop: 12 }}>New Agricultural Intelligence Modules</div>
              <Link to="/profitability" onClick={() => setMobileMenuOpen(false)}>Profitability</Link>
        <Link to="/fertilizer" onClick={() => setMobileMenuOpen(false)}>Fertilizer Planner</Link>
        <Link to="/irrigation" className={isDrawerActive("/irrigation")} onClick={() => setMobileMenuOpen(false)}>
                <Droplet size={18} style={{ color: '#2563eb' }} />
                <span>Smart Irrigation (FAO-56)</span>
              </Link>
              <Link to="/rotation" className={isDrawerActive("/rotation")} onClick={() => setMobileMenuOpen(false)}>
                <RotateCcw size={18} style={{ color: '#15803d' }} />
                <span>Crop Rotation &amp; Soil N</span>
              </Link>
              <Link to="/ledger" className={isDrawerActive("/ledger")} onClick={() => setMobileMenuOpen(false)}>
                <FileText size={18} style={{ color: '#d97706' }} />
                <span>Farm Ledger &amp; KCC Loan</span>
              </Link>
              <Link to="/satellite" className={isDrawerActive("/satellite")} onClick={() => setMobileMenuOpen(false)}>
                <Satellite size={18} style={{ color: '#9333ea' }} />
                <span>Satellite NDVI Heatmap</span>
              </Link>
              <Link to="/mandi-forecast" className={isDrawerActive("/mandi-forecast")} onClick={() => setMobileMenuOpen(false)}>
                <TrendingUp size={18} style={{ color: '#22c55e' }} />
                <span>Mandi Price Forecast &amp; Arbitrage</span>
              </Link>
              <Link to="/hire" className={isDrawerActive("/hire")} onClick={() => setMobileMenuOpen(false)}>
                <Truck size={18} style={{ color: '#f59e0b' }} />
                <span>CHC Machinery &amp; Drone Hub</span>
              </Link>
              <Link to="/soil-health" className={isDrawerActive("/soil-health")} onClick={() => setMobileMenuOpen(false)}>
                <FlaskConical size={18} style={{ color: '#10b981' }} />
                <span>Soil Health Card Analyzer</span>
              </Link>
              <Link to="/tank-mix" className={isDrawerActive("/tank-mix")} onClick={() => setMobileMenuOpen(false)}>
                <ShieldCheck size={18} style={{ color: '#3b82f6' }} />
                <span>Pesticide Tank-Mix Safety</span>
              </Link>
              <Link to="/traceability" className={isDrawerActive("/traceability")} onClick={() => setMobileMenuOpen(false)}>
                <QrCode size={18} style={{ color: '#6366f1' }} />
                <span>Farm QR Batch Traceability</span>
              </Link>
              <Link to="/gdd-radar" className={isDrawerActive("/gdd-radar")} onClick={() => setMobileMenuOpen(false)}>
                <Clock size={18} style={{ color: '#eab308' }} />
                <span>GDD Phenology Thermal Radar</span>
              </Link>
              <Link to="/yield-predictor" className={isDrawerActive("/yield-predictor")} onClick={() => setMobileMenuOpen(false)}>
                <Activity size={18} style={{ color: '#06b6d4' }} />
                <span>AI Crop Yield Forecaster</span>
              </Link>
              <Link to="/livestock" className={isDrawerActive("/livestock")} onClick={() => setMobileMenuOpen(false)}>
                <HeartPulse size={18} style={{ color: '#ef4444' }} />
                <span>Livestock &amp; Dairy Advisor</span>
              </Link>
              <Link to="/organic-farming" className={isDrawerActive("/organic-farming")} onClick={() => setMobileMenuOpen(false)}>
                <Leaf size={18} style={{ color: '#16a34a' }} />
                <span>Organic Farming &amp; Bio-Inputs</span>
              </Link>
              <Link to="/solar-pump" className={isDrawerActive("/solar-pump")} onClick={() => setMobileMenuOpen(false)}>
                <SunMedium size={18} style={{ color: '#f59e0b' }} />
                <span>Solar Pump &amp; PM-KUSUM</span>
              </Link>
              <Link to="/crop-insurance" className={isDrawerActive("/crop-insurance")} onClick={() => setMobileMenuOpen(false)}>
                <Umbrella size={18} style={{ color: '#0284c7' }} />
                <span>PMFBY Crop Insurance &amp; Claims</span>
              </Link>
              <Link to="/carbon-credits" className={isDrawerActive("/carbon-credits")} onClick={() => setMobileMenuOpen(false)}>
                <Award size={18} style={{ color: '#059669' }} />
                <span>Carbon Credits &amp; Regenerative Ag</span>
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" className={isDrawerActive("/admin")} onClick={() => setMobileMenuOpen(false)}>
                  <Shield size={18} style={{ color: '#7c3aed' }} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>

            <div className="fk-drawer-footer">
              <button 
                onClick={toggleTheme}
                className="fk-drawer-action-row"
              >
                {theme === 'dark' ? <Sun size={16} style={{ color: '#facc15' }} /> : <Moon size={16} />}
                <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
              </button>

              {user && (
                <button 
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="fk-drawer-action-row danger"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {isProfileOpen && (
        <ProfileModal 
          user={user} 
          onClose={() => setIsProfileOpen(false)} 
          onUpdateUser={(updatedUser) => onUpdateUser(updatedUser)} 
        />
      )}
    </header>
  );
}
