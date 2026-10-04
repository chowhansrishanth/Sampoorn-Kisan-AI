import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, Sprout, ScanLine, CloudSun, TrendingUp, Landmark, BookOpen, Brain, Bell, Settings, Menu, X, PanelLeftClose, PanelLeftOpen, Search, LogOut, Sun, Moon, ChevronDown, MapPin, Calendar, Droplet, FlaskConical, Calculator, RotateCcw, Wallet, Satellite, Tractor, HeartPulse, QrCode, Thermometer, Leaf, Shield, Award, Radio } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../utils/offlineSync';

const primaryLinks = [
  ['/dashboard', 'Dashboard', LayoutDashboard, 'nav_dashboard'],
  ['/chat', 'AI Assistant', Bot, 'nav_ai_assistant'],
  ['/crop-tool', 'Crop Recommendation', Sprout, 'nav_crop_tool'],
  ['/disease', 'Disease Diagnosis', ScanLine, 'nav_disease'],
  ['/weather', 'Weather', CloudSun, 'nav_weather'],
  ['/mandi', 'Mandi Prices', TrendingUp, 'nav_mandi'],
  ['/schemes', 'Government Schemes', Landmark, 'nav_schemes'],
  ['/knowledge', 'Knowledge Hub', BookOpen, 'nav_knowledge'],
  ['/xai', 'XAI Analytics', Brain, 'nav_xai'],
  ['/alerts', 'Alerts', Bell, 'nav_alerts'],
];

const toolLinks = [
  ['/calendar', 'Crop Calendar', Calendar, 'tool_calendar'],
  ['/irrigation', 'Irrigation', Droplet, 'tool_irrigation'],
  ['/fertilizer', 'Fertilizer Planner', FlaskConical, 'tool_fertilizer'],
  ['/profitability', 'Profitability', Calculator, 'tool_profitability'],
  ['/rotation', 'Crop Rotation', RotateCcw, 'tool_rotation'],
  ['/ledger', 'Farm Ledger', Wallet, 'tool_ledger'],
  ['/satellite', 'Satellite NDVI', Satellite, 'tool_satellite'],
  ['/hire', 'Equipment Hire', Tractor, 'tool_hire'],
  ['/soil-health', 'Soil Health', Sprout, 'tool_soil_health'],
  ['/tank-mix', 'Tank Mix Safety', FlaskConical, 'tool_tank_mix'],
  ['/traceability', 'Farm Traceability', QrCode, 'tool_traceability'],
  ['/gdd-radar', 'Pest Radar', Thermometer, 'tool_gdd_radar'],
  ['/yield-predictor', 'Yield Predictor', TrendingUp, 'tool_yield_predictor'],
  ['/mandi-forecast', 'Market Forecast', TrendingUp, 'tool_mandi_forecast'],
  ['/livestock', 'Livestock', HeartPulse, 'tool_livestock'],
  ['/organic-farming', 'Organic Farming', Leaf, 'tool_organic'],
  ['/solar-pump', 'Solar Pump', Sun, 'tool_solar_pump'],
  ['/crop-insurance', 'Crop Insurance', Shield, 'tool_insurance'],
  ['/carbon-credits', 'Carbon Credits', Award, 'tool_carbon'],
  ['/iot', 'IoT Telemetry', Radio, 'tool_iot'],
];

export default function AppShell({ user, onLogout, onUpdateUser, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isOnline, pendingCount } = useNetworkStatus();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const drawer = useRef(null);
  const menuButton = useRef(null);
  const main = useRef(null);
  const links = user?.role === 'admin' ? [...toolLinks, ['/admin', 'Administration', Shield, 'nav_admin'], ['/benchmark', 'Benchmarks', Brain, 'nav_benchmarks']] : toolLinks;
  const current = location.pathname + location.search + location.hash;
  const active = to => to === current || to === location.pathname || (to === '/dashboard' && location.pathname === '/' && !location.hash);
  const activeItem = [...primaryLinks, ...links].find(([to]) => active(to));
  const title = activeItem ? (activeItem[3] ? t(activeItem[3], activeItem[1]) : activeItem[1]) : t('farm_workspace', 'Farm workspace');

  useEffect(() => {
    if (drawerOpen) drawer.current?.showModal(); else if (drawer.current?.open) drawer.current.close();
  }, [drawerOpen]);
  useEffect(() => { main.current?.focus({ preventScroll: true }); }, [location.pathname]);
  const closeDrawer = () => { setDrawerOpen(false); menuButton.current?.focus(); };
  const openProfile = () => { closeDrawer(); setProfileOpen(true); };
  const search = e => {
    e.preventDefault();
    const q = query.trim().toLowerCase(); if (!q) return;
    const found = [...primaryLinks, ...links].find(([, label, , key]) => label.toLowerCase().includes(q) || (key && t(key, '').toLowerCase().includes(q)));
    navigate(found?.[0] || `/chat?query=${encodeURIComponent(query.trim())}`);
    setQuery(''); closeDrawer();
  };
  const renderLink = ([to, label, Icon, key]) => {
    const text = key ? t(key, label) : label;
    return (
      <Link key={to} to={to} className={`shell-nav-link ${active(to) ? 'is-active' : ''}`} aria-current={active(to) ? 'page' : undefined} title={text} onClick={closeDrawer}>
        <Icon size={20} aria-hidden="true" />
        <span className="shell-nav-label">{text}</span>
      </Link>
    );
  };
  const navigation = <>
    <Link className="shell-brand" to="/dashboard" onClick={closeDrawer}>
      <span className="shell-brand-icon"><Leaf size={23} /></span>
      <span className="shell-nav-label"><strong>{t('brand_title', 'Sampoorn Kisan')}</strong><small>{t('brand_sub', 'AI Agri Intelligence')}</small></span>
    </Link>
    <nav aria-label="Main navigation" className="shell-nav">
      {primaryLinks.map(renderLink)}
      <button className="shell-nav-link" title={t('settings', 'Settings')} onClick={openProfile}>
        <Settings size={20} />
        <span className="shell-nav-label">{t('settings', 'Settings')}</span>
      </button>
      <details className="shell-tools">
        <summary title={t('more_farm_tools', 'More farm tools')}>
          <Sprout size={20} />
          <span className="shell-nav-label">{t('more_farm_tools', 'More farm tools')}</span>
          <ChevronDown size={14} />
        </summary>
        {links.map(renderLink)}
      </details>
    </nav>
    <div className="shell-sidebar-bottom">
      <span className="shell-nav-label">{user?.location || 'Set your farm location'}</span>
      <button className="shell-nav-link" title={t('logout', 'Logout')} onClick={onLogout}>
        <LogOut size={20} />
        <span className="shell-nav-label">{t('logout', 'Logout')}</span>
      </button>
    </div>
  </>;
  return <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
    <a href="#workspace" className="skip-link">Skip to content</a>
    <aside className="shell-sidebar">{navigation}<button className="shell-collapse icon-button" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button></aside>
    <dialog ref={drawer} className="shell-drawer" aria-label="Navigation menu" onCancel={closeDrawer} onClose={() => setDrawerOpen(false)} onClick={e => { if (e.target === drawer.current) closeDrawer(); }}><button className="drawer-close icon-button" onClick={closeDrawer} aria-label="Close navigation"><X size={20} /></button>{navigation}</dialog>
    <div className="shell-workspace">
      <header className="shell-topbar">
        <button ref={menuButton} className="shell-menu icon-button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation" aria-expanded={drawerOpen}><Menu size={22} /></button>
        <div className="shell-context"><small>{t('farm_workspace', 'YOUR FARM WORKSPACE')}</small><strong>{title}</strong></div>
        <form className="shell-search" onSubmit={search} role="search"><Search size={18} /><input aria-label="Search tools or ask Sahayak" placeholder={t('search_tools_placeholder', 'Search tools or ask Sahayak…')} value={query} onChange={e => setQuery(e.target.value)} /><button type="submit" aria-label="Search" className="icon-button"><Bot size={18} /></button></form>
        <div className="shell-actions">
          <span className={`connection-status ${isOnline ? '' : 'is-offline'}`} title={isOnline ? 'Device is connected to the internet' : `${pendingCount} offline changes queued`}><span />{isOnline ? t('connection_connected', 'Connected') : t('connection_offline', 'Offline')}</span>
          <button className="icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          <select aria-label="Interface language" value={language} onChange={e => setLanguage(e.target.value)} className="shell-language fk-lang-select">
            {[
              ['EN', 'English'],
              ['HI', 'हिंदी (Hindi)'],
              ['TE', 'తెలుగు (Telugu)'],
              ['TA', 'தமிழ் (Tamil)'],
              ['KN', 'ಕನ್ನಡ (Kannada)'],
              ['MR', 'मराठी (Marathi)'],
              ['PA', 'ਪੰਜਾਬੀ (Punjabi)'],
              ['BN', 'বাংলা (Bengali)'],
              ['GU', 'ગુજરાતી (Gujarati)']
            ].map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <Link className="icon-button" to="/alerts" aria-label="View alerts"><Bell size={19} /></Link>
          <button className="shell-avatar" onClick={openProfile} aria-label="Open profile and settings" title={user?.name || 'Profile'}>{(user?.name || 'F').slice(0, 1).toUpperCase()}</button>
        </div>
      </header>
      {!isOnline && <div className="network-banner" role="status">You’re offline. Current data may be unavailable. Queued changes: {pendingCount}.</div>}
      <main ref={main} id="workspace" tabIndex={-1} className="main-content shell-content">{children}</main>
      <footer className="shell-footer"><span>{t('brand_footer', 'Sampoorn Kisan AI · Farm decision support')}</span><span><MapPin size={13} />{user?.location || 'Farm location not set'}</span></footer>
    </div>
    {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onUpdateUser={onUpdateUser} />}
  </div>;
}
