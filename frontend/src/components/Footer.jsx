import { useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, HelpCircle, PhoneCall, ShieldCheck, HeartHandshake } from "lucide-react";
import SupportModal from "./SupportModal";

export default function Footer() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-gradient)', display: 'grid', placeItems: 'center', color: '#ffffff', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)' }}>
              <Sprout size={22} />
            </div>
            <h2>Sampoorn Kisan AI</h2>
          </div>
          <p>
            India's premier Explainable & Federated AI framework for smart agriculture. Empowering farmers with real-time disease diagnosis, Mandi market pricing, and Sahayak AI guidance.
          </p>
          <div style={{ marginTop: '18px' }}>
            <button 
              onClick={() => setIsSupportOpen(true)}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                padding: '10px 20px', borderRadius: '8px', 
                background: 'var(--primary-gradient)', border: 'none',
                color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <HelpCircle size={16} /> 24/7 Farmer Helpline & Support
            </button>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>AI AGENTS</h4>
          <ul>
            <li><Link to="/crop-tool">Soil & Crop Recommender</Link></li>
            <li><Link to="/disease">Leaf Disease Scan (Grad-CAM)</Link></li>
            <li><Link to="/chat">Sahayak 24x7 Chatbot</Link></li>
            <li><Link to="/dashboard">Mandi Market Tracker</Link></li>
            <li><Link to="/xai">XAI Visualizer (SHAP/LIME)</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>FARMER RESOURCES</h4>
          <ul>
            <li><Link to="/knowledge">PM-Kisan & Govt Subsidies</Link></li>
            <li><Link to="/dashboard">Monsoon & Weather Radar</Link></li>
            <li><Link to="/knowledge">Fertilizer Dosing Guide</Link></li>
            <li><Link to="/knowledge">Organic Pest Control</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>POLICY & SAFETY</h4>
          <ul>
            <li><span style={{ color: 'var(--fk-text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} /> AES-256 Federated Privacy</span></li>
            <li><span style={{ color: 'var(--fk-text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}><HeartHandshake size={14} /> Research Grade AI</span></li>
            <li><span style={{ color: 'var(--fk-text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}><PhoneCall size={14} /> Toll-Free Krishi Support</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Sampoorn Kisan AI • National Agriculture Intelligence System • ICAR & CIBRC Aligned.</p>
      </div>

      {isSupportOpen && <SupportModal onClose={() => setIsSupportOpen(false)} />}
    </footer>
  );
}
