import { useState } from "react";
import api from "../api/client";
import { X, HelpCircle, Mail, MessageSquare, AlertCircle, CheckCircle2, User } from "lucide-react";

export default function SupportModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("contact"); // "contact", "forgot"
  
  const [formData, setFormData] = useState({ name: "", email: "", issueType: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (activeTab === "contact") {
        await api.post("/api/auth/contact-support", formData);
        setSuccess("Your support request has been received. Our team will contact you shortly.");
      } else {
        await api.post("/api/auth/forgot-password", { email: formData.email });
        setSuccess("If an account exists, recovery instructions have been sent to that email.");
      }
      setTimeout(() => onClose(), 3500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-gate-overlay">
      <div className="auth-modal" style={{ width: 'min(460px, 92%)', padding: '30px' }}>
        <button className="close-modal" onClick={onClose}><X size={18} /></button>
        
        <div className="auth-header" style={{ marginBottom: '20px' }}>
          <div className="auth-logo" style={{ marginBottom: '15px' }}><HelpCircle size={28} /></div>
          <h2 style={{ fontSize: '22px' }}>Support & Help</h2>
          <p>How can we assist you today?</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab("contact"); setError(""); setSuccess(""); }}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: activeTab === "contact" ? 'rgba(168,233,104,0.15)' : 'rgba(255,255,255,0.05)',
              color: activeTab === "contact" ? '#a8e968' : '#aebbb3',
              border: `1px solid ${activeTab === "contact" ? 'rgba(168,233,104,0.3)' : 'transparent'}`
            }}
          >
            Contact Support
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab("forgot"); setError(""); setSuccess(""); }}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: activeTab === "forgot" ? 'rgba(168,233,104,0.15)' : 'rgba(255,255,255,0.05)',
              color: activeTab === "forgot" ? '#a8e968' : '#aebbb3',
              border: `1px solid ${activeTab === "forgot" ? 'rgba(168,233,104,0.3)' : 'transparent'}`
            }}
          >
            Recover Details
          </button>
        </div>

        {error && <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16}/> {error}</div>}
        {success && <div className="auth-error" style={{ background: "rgba(168,233,104,0.15)", color: "#a8e968", borderColor: "rgba(168,233,104,0.3)", display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16}/> {success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === "contact" ? (
            <>
              <div className="input-group" style={{ padding: '0 16px', marginBottom: '15px' }}>
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px 0' }}/>
              </div>
              <div className="input-group" style={{ padding: '0 16px', marginBottom: '15px' }}>
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="Your Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ padding: '12px 0' }}/>
              </div>
              <div className="input-group" style={{ padding: '0 16px', marginBottom: '15px' }}>
                <HelpCircle size={18} className="input-icon" />
                <select value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value})} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text)', fontSize: '14px', padding: '12px 0', cursor: 'pointer' }}>
                  <option value="General Inquiry" style={{ background: 'var(--fk-card)', color: 'var(--fk-text)' }}>General Inquiry</option>
                  <option value="Technical Issue" style={{ background: 'var(--fk-card)', color: 'var(--fk-text)' }}>Technical Issue</option>
                  <option value="Account Access" style={{ background: 'var(--fk-card)', color: 'var(--fk-text)' }}>Account Access</option>
                  <option value="Feedback" style={{ background: 'var(--fk-card)', color: 'var(--fk-text)' }}>Feedback</option>
                </select>
              </div>
              <div className="input-group" style={{ padding: '12px 16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <MessageSquare size={18} className="input-icon" style={{ marginTop: '4px' }} />
                <textarea placeholder="Describe your issue..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text)', fontSize: '14px', resize: 'none', minHeight: '80px', fontFamily: 'inherit' }}></textarea>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#8e9c94', marginBottom: '15px', textAlign: 'center' }}>
                Enter the email associated with your account. We will send you instructions to reset your password or recover your username.
              </p>
              <div className="input-group" style={{ padding: '0 16px', marginBottom: '20px' }}>
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="Registered Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ padding: '12px 0' }}/>
              </div>
            </>
          )}

          <button type="submit" className="primary-btn full-width" style={{ position: 'relative', overflow: 'hidden' }} disabled={loading || success}>
            <span style={{ position: 'relative', zIndex: 1 }}>{loading ? "Processing..." : (activeTab === "contact" ? "Send Message" : "Send Recovery Link")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
