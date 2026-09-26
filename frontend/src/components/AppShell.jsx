import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, Sprout, ScanLine, CloudSun, TrendingUp, Landmark, BookOpen, Brain, Bell, Settings, Menu, X, PanelLeftClose, PanelLeftOpen, Search, LogOut, Sun, Moon, ChevronDown, MapPin, Calendar, Droplet, FlaskConical, Calculator, RotateCcw, Wallet, Satellite, Tractor, HeartPulse, QrCode, Thermometer, Leaf, Shield, Award, Radio } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../utils/offlineSync';

const primaryLinks = [
  ['/dashboard','Dashboard',LayoutDashboard], ['/chat','AI Assistant',Bot], ['/crop-tool','Crop Recommendation',Sprout],
  ['/disease','Disease Diagnosis',ScanLine], ['/dashboard#weather','Weather',CloudSun], ['/dashboard#market','Mandi Prices',TrendingUp],
  ['/knowledge?tab=schemes','Government Schemes',Landmark], ['/knowledge?tab=articles','Knowledge Hub',BookOpen], ['/xai','XAI Analytics',Brain], ['/alerts','Alerts',Bell],
];
const toolLinks = [
  ['/calendar','Crop Calendar',Calendar], ['/irrigation','Irrigation',Droplet], ['/fertilizer','Fertilizer Planner',FlaskConical],
  ['/profitability','Profitability',Calculator], ['/rotation','Crop Rotation',RotateCcw], ['/ledger','Farm Ledger',Wallet],
  ['/satellite','Satellite NDVI',Satellite], ['/hire','Equipment Hire',Tractor], ['/soil-health','Soil Health',Sprout],
  ['/tank-mix','Tank Mix Safety',FlaskConical], ['/traceability','Farm Traceability',QrCode], ['/gdd-radar','Pest Radar',Thermometer],
  ['/yield-predictor','Yield Predictor',TrendingUp], ['/mandi-forecast','Market Forecast',TrendingUp], ['/livestock','Livestock',HeartPulse],
  ['/organic-farming','Organic Farming',Leaf], ['/solar-pump','Solar Pump',Sun], ['/crop-insurance','Crop Insurance',Shield],
  ['/carbon-credits','Carbon Credits',Award], ['/iot','IoT Telemetry',Radio],
];

export default function AppShell({ user, onLogout, onUpdateUser, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { isOnline, pendingCount } = useNetworkStatus();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const drawer = useRef(null);
  const menuButton = useRef(null);
  const main = useRef(null);
  const links = user?.role === 'admin' ? [...toolLinks, ['/admin','Administration',Shield], ['/benchmark','Benchmarks',Brain]] : toolLinks;
  const current = location.pathname + location.search + location.hash;
  const active = to => to === current || (to === '/dashboard' && location.pathname === '/' && !location.hash);
  const title = [...primaryLinks, ...links].find(([to])=>active(to))?.[1] || 'Farm workspace';

  useEffect(()=>{
    if(drawerOpen) drawer.current?.showModal(); else if(drawer.current?.open) drawer.current.close();
  },[drawerOpen]);
  useEffect(()=>{ main.current?.focus({preventScroll:true}); },[location.pathname]);
  const closeDrawer = () => { setDrawerOpen(false); menuButton.current?.focus(); };
  const openProfile = () => { closeDrawer(); setProfileOpen(true); };
  const search = e => {
    e.preventDefault();
    const q=query.trim().toLowerCase(); if(!q)return;
    const found=[...primaryLinks,...links].find(([,label])=>label.toLowerCase().includes(q));
    navigate(found?.[0] || `/chat?query=${encodeURIComponent(query.trim())}`);
    setQuery(''); closeDrawer();
  };
  const renderLink = ([to,label,Icon]) => <Link key={to} to={to} className={`shell-nav-link ${active(to)?'is-active':''}`} aria-current={active(to)?'page':undefined} title={label} onClick={closeDrawer}><Icon size={20} aria-hidden="true"/><span className="shell-nav-label">{label}</span></Link>;
  const navigation = <>
    <Link className="shell-brand" to="/dashboard" onClick={closeDrawer}><span className="shell-brand-icon"><Leaf size={23}/></span><span className="shell-nav-label"><strong>Sampoorn Kisan</strong><small>AI Agri Intelligence</small></span></Link>
    <nav aria-label="Main navigation" className="shell-nav">{primaryLinks.map(renderLink)}
      <button className="shell-nav-link" title="Settings" onClick={openProfile}><Settings size={20}/><span className="shell-nav-label">Settings</span></button>
      <details className="shell-tools"><summary title="More farm tools"><Sprout size={20}/><span className="shell-nav-label">More farm tools</span><ChevronDown size={14}/></summary>{links.map(renderLink)}</details>
    </nav>
    <div className="shell-sidebar-bottom"><span className="shell-nav-label">{user?.location || 'Set your farm location'}</span><button className="shell-nav-link" title="Logout" onClick={onLogout}><LogOut size={20}/><span className="shell-nav-label">Logout</span></button></div>
  </>;
  return <div className={`app-shell ${collapsed?'is-collapsed':''}`}>
    <a href="#workspace" className="skip-link">Skip to content</a>
    <aside className="shell-sidebar">{navigation}<button className="shell-collapse icon-button" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} title={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}</button></aside>
    <dialog ref={drawer} className="shell-drawer" aria-label="Navigation menu" onCancel={closeDrawer} onClose={()=>setDrawerOpen(false)} onClick={e=>{if(e.target===drawer.current)closeDrawer();}}><button className="drawer-close icon-button" onClick={closeDrawer} aria-label="Close navigation"><X size={20}/></button>{navigation}</dialog>
    <div className="shell-workspace">
      <header className="shell-topbar">
        <button ref={menuButton} className="shell-menu icon-button" onClick={()=>setDrawerOpen(true)} aria-label="Open navigation" aria-expanded={drawerOpen}><Menu size={22}/></button>
        <div className="shell-context"><small>YOUR FARM WORKSPACE</small><strong>{title}</strong></div>
        <form className="shell-search" onSubmit={search} role="search"><Search size={18}/><input aria-label="Search tools or ask Sahayak" placeholder="Search tools or ask Sahayak…" value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit" aria-label="Search" className="icon-button"><Bot size={18}/></button></form>
        <div className="shell-actions">
          <span className={`connection-status ${isOnline?'':'is-offline'}`} title={isOnline?'Device is connected to the internet':`${pendingCount} offline changes queued`}><span/>{isOnline?'Connected':'Offline'}</span>
          <button className="icon-button" onClick={toggleTheme} aria-label={theme==='dark'?'Use light theme':'Use dark theme'}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button>
          <select aria-label="Interface language" value={language} onChange={e=>setLanguage(e.target.value)} className="shell-language">{[['EN','English'],['TE','తెలుగు'],['HI','हिंदी'],['TA','தமிழ்'],['KN','ಕನ್ನಡ'],['MR','मराठी'],['PA','ਪੰਜਾਬੀ']].map(([code,name])=><option key={code} value={code}>{name}</option>)}</select>
          <Link className="icon-button" to="/alerts" aria-label="View alerts"><Bell size={19}/></Link>
          <button className="shell-avatar" onClick={openProfile} aria-label="Open profile and settings" title={user?.name || 'Profile'}>{(user?.name || 'F').slice(0,1).toUpperCase()}</button>
        </div>
      </header>
      {!isOnline && <div className="network-banner" role="status">You’re offline. Current data may be unavailable. Queued changes: {pendingCount}.</div>}
      <main ref={main} id="workspace" tabIndex={-1} className="main-content shell-content">{children}</main>
      <footer className="shell-footer"><span>Sampoorn Kisan AI · Farm decision support</span><span><MapPin size={13}/>{user?.location || 'Farm location not set'}</span></footer>
    </div>
    {profileOpen && <ProfileModal user={user} onClose={()=>setProfileOpen(false)} onUpdateUser={onUpdateUser}/>}
  </div>;
}
