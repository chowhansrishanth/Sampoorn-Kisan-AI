import { useState, useEffect, useRef } from "react";
import { Sprout, Lock, Mail, User, MapPin, Eye, EyeOff, ArrowLeft, HelpCircle, CheckCircle, AlertCircle, Loader2, ArrowRight, Phone, Compass } from "lucide-react";
import SupportModal from "../components/SupportModal";
import { detectGPSLocation } from "../utils/locationHelper";
import api, { getApiErrorMessage } from "../api/client";

import SearchableCropSelector from "../components/ui/SearchableCropSelector";


export default function LoginGate({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [formData, setFormData] = useState({
    name: "", identifier: "", phone: "", email: "", password: "", confirmPassword: "",
    location: "Punjab, India", cropType: "Wheat & Rice", customLocation: ""
  });
  const [regCrops, setRegCrops] = useState([
    { id: "rice", name: "Wheat & Rice", icon: "🌾", isPrimary: true, area: 2.5, stage: "Vegetative Growth" }
  ]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isOtherLoc, setIsOtherLoc] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const clearAlerts = () => { setError(""); setSuccessMsg(""); };

  const handleDetectLocation = async () => {
    clearAlerts();
    setGeoLoading(true);
    try {
      const res = await detectGPSLocation();
      if (res.success) {
        set("customLocation", res.formattedAddress);
        set("location", res.formattedAddress);
        setFormData(prev => ({ ...prev, locationObj: res }));
        setIsOtherLoc(true);
        setSuccessMsg(`📍 GPS Location detected: ${res.formattedAddress}${res.accuracy ? ` (Accuracy: ±${Math.round(res.accuracy)}m)` : ""}`);
      } else {
        setError(res.error || "📍 Unable to retrieve device GPS location. Please enter manually.");
      }
    } catch {
      setError("📍 Unable to retrieve device GPS location. Please enter manually.");
    } finally {
      setGeoLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Please check your details.";
    if (!formData.email.includes("@") && !formData.phone.trim()) return "Please check your details.";
    if (formData.password.length < 8) return "Please check your details.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearAlerts();
    const ident = (formData.identifier || "").trim();
    const pass = (formData.password || "");

    if (!ident || !pass) {
      setError("Please enter your email or mobile number and password.");
      return;
    }
    setLoading(true);
    try {
      const normalizedIdent = ident.toLowerCase();
      const res = await api.post("/api/auth/login", {
        identifier: normalizedIdent,
        email: normalizedIdent.includes("@") ? normalizedIdent : "",
        phone: !normalizedIdent.includes("@") ? ident : "",
        password: pass,
        rememberMe: true
      });

      if (res.data?.user && res.data?.token) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.response?.data?.error;

      if (code === "INVALID_CREDENTIALS" || code === "INVALID_PASSWORD" || code === "ACCOUNT_NOT_FOUND" || err.response?.status === 401) {
        setError("Invalid email/mobile number or password.");
      } else if (code === "RATE_LIMITED" || err.response?.status === 429) {
        setError("Too many sign-in attempts. Please wait a moment and try again.");
      } else if (err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response) {
        setError("Unable to reach server. Please check your connection.");
      } else {
        setError(msg || "Unable to sign in right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Register (Step 2 → submit) ───────────────────────────────────────────
  const handleRegister = async () => {
    clearAlerts();

    if (!formData.name.trim() || (!formData.email.trim() && !formData.phone.trim()) || !formData.password) {
      setError("Please check your details.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return; // Do NOT send request!
    }

    setLoading(true);
    const finalLocation = isOtherLoc ? formData.customLocation : formData.location;
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.trim();

    const userPayload = {
      name: formData.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      location: finalLocation,
      cropType: formData.cropType
    };

    try {
      const res = await api.post("/api/auth/register", userPayload);
      if (res.data?.success || res.status === 201) {
        setSuccessMsg("Account created successfully. Please sign in.");
        redirectTimer.current = setTimeout(() => {
          setMode("login");
          setStep(1);
          setFormData(prev => ({
            ...prev,
            identifier: cleanEmail || cleanPhone,
            password: ""
          }));
        }, 1500);
      } else {
        setError("The account could not be created. Please try again.");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.response?.data?.error;

      if (code === "USER_ALREADY_EXISTS" || msg === "User already exists") {
        setError("User already exists");
        // Smooth transition to sign in page after showing message
        redirectTimer.current = setTimeout(() => {
          setMode("login");
          setStep(1);
          setFormData(prev => ({
            ...prev,
            identifier: cleanEmail || cleanPhone
          }));
        }, 1500);
      } else if (code === "PASSWORD_MISMATCH" || msg === "Passwords do not match.") {
        setError("Passwords do not match.");
      } else {
        // Keep the actual server or connection failure visible. Previously every
        // registration failure was presented as invalid form data, which made a
        // stopped backend look like a broken Step 2 form.
        setError(getApiErrorMessage(err, "Unable to create your account right now. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStepNext = async () => {
    clearAlerts();
    const err = validateStep1();
    if (err) { setError(err); return; }

    setStep(2);
  };

  // ── Forgot Password ──────────────────────────────────────────────────────

  const handleForgot = async (e) => {
    e.preventDefault();
    clearAlerts();
    const cleanId = (formData.identifier || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", {
        email: cleanId.toLowerCase()
      });
      setSuccessMsg(res.data?.message || "If an account matches that email address, a password reset link has been sent.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to request password reset. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setStep(1);
    clearAlerts();
    setAnimKey(k => k + 1);
  };

  const totalSteps = 2;
  const progressPct = mode === "register" ? (step / totalSteps) * 100 : 0;

  return (
    <div className="lg-overlay">
      {/* Autofill override: prevents Chrome/Edge dark/black box on saved credentials */}
      <style>{`
        .lg-input-group input:-webkit-autofill,
        .lg-input-group input:-webkit-autofill:hover,
        .lg-input-group input:-webkit-autofill:focus,
        .lg-input-group input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #1a1a2e !important;
          color: #1a1a2e !important;
          background-color: #ffffff !important;
          transition: background-color 9999s ease-in-out 0s !important;
          caret-color: #1a1a2e !important;
        }
        .lg-input-group {
          background: #ffffff !important;
        }
        .lg-input-group input {
          background: transparent !important;
          background-color: transparent !important;
          color: #1a1a2e !important;
        }
      `}</style>
        <div className="lg-form-panel" key={animKey}>
          <div className="lg-card lg-mode-enter">
            {mode !== "forgot" && (
              <div className="lg-tabs">
                <button
                  type="button"
                  className={`lg-tab-btn ${mode === "login" ? "active" : ""}`}
                  onClick={() => switchMode("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`lg-tab-btn ${mode === "register" ? "active" : ""}`}
                  onClick={() => {
                    const entered = (formData.identifier || "").trim();
                    if (entered && !formData.name) {
                      set("name", entered);
                    }
                    switchMode("register");
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {mode === "register" && (
              <div className="lg-progress-wrap">
                <div className="lg-progress-bar">
                  <div className="lg-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="lg-progress-label">Step {step} of {totalSteps}</span>
              </div>
            )}

            {error && (
              <div className="lg-alert lg-alert-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
                {mode === "login" && (
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#4b5563' }}>Don't have an account or trying to sign up?</span>
                    <button
                      type="button"
                      onClick={() => {
                        const entered = (formData.identifier || "").trim();
                        if (entered && !formData.name) {
                          set("name", entered);
                        }
                        switchMode("register");
                      }}
                      style={{ background: 'none', border: 'none', color: '#006948', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Click here to Create Account →
                    </button>
                  </div>
                )}
                {error === "User already exists" && (
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#4b5563' }}>Already have an account?</span>
                    <button type="button" onClick={() => switchMode("login")} style={{ background: 'none', border: 'none', color: '#006948', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                      Sign In →
                    </button>
                  </div>
                )}
              </div>
            )}
            {successMsg && (
              <div className="lg-alert lg-alert-success">
                <CheckCircle size={16} />{successMsg}
              </div>
            )}

            {/* FORGOT PASSWORD */}
            {mode === "forgot" && (
              <>
                <div className="lg-form-header">
                  <div className="lg-form-icon"><Lock size={24} /></div>
                  <h2>Reset Password</h2>
                  <p>Enter your registered email address</p>
                </div>
                <form onSubmit={handleForgot} className="lg-form">
                  <div className="lg-input-group">
                    <Mail size={17} className="lg-input-icon" />
                    <input
                      type="email" placeholder="Email Address"
                      value={formData.identifier}
                      onChange={e => set("identifier", e.target.value)}
                      required autoFocus
                    />
                  </div>
                  <button type="submit" className="lg-btn-primary" disabled={loading}>
                    {loading ? <><Loader2 size={16} className="spin" /> Sending...</> : <>Send Reset Link <ArrowRight size={16} /></>}
                  </button>
                </form>
                <div className="lg-footer-link">
                  <button onClick={() => switchMode("login")} className="lg-text-btn">
                    <ArrowLeft size={15} /> Back to Login
                  </button>
                </div>
              </>
            )}

            {/* REGISTER STEP 1 */}
            {mode === "register" && step === 1 && (
              <>
                <div className="lg-form-header">
                  <div className="lg-form-icon"><User size={24} /></div>
                  <h2>Create Account</h2>
                  <p>Join 38,000+ farmers on Sampoorn Kisan AI</p>
                </div>
                <div className="lg-form">
                  <div className="lg-input-group">
                    <User size={17} className="lg-input-icon" />
                    <input
                      type="text" placeholder="Full Name"
                      value={formData.name}
                      onChange={e => set("name", e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="lg-input-group">
                    <Phone size={17} className="lg-input-icon" />
                    <input
                      type="tel" placeholder="Mobile Number (+91)"
                      value={formData.phone}
                      onChange={e => set("phone", e.target.value)}
                    />
                  </div>

                  <div className="lg-input-group">
                    <Mail size={17} className="lg-input-icon" />
                    <input
                      type="email" placeholder="Email Address (Optional)"
                      value={formData.email}
                      onChange={e => set("email", e.target.value)}
                    />
                  </div>

                  <div className="lg-input-group">
                    <Lock size={17} className="lg-input-icon" />
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Password (min 8 chars)"
                      value={formData.password}
                      onChange={e => set("password", e.target.value)}
                    />
                    <button type="button" className="lg-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="lg-input-group">
                    <Lock size={17} className="lg-input-icon" />
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={e => set("confirmPassword", e.target.value)}
                    />
                    <button type="button" className="lg-eye-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                      {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button type="button" className="lg-btn-primary" onClick={handleStepNext} disabled={loading}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
                <div className="lg-footer-link">
                  <span>Already have an account?</span>
                  <button onClick={() => switchMode("login")} className="lg-text-btn">Sign In</button>
                </div>
              </>
            )}

            {/* REGISTER STEP 2 */}
            {mode === "register" && step === 2 && (
              <>
                <div className="lg-form-header">
                  <div className="lg-form-icon"><MapPin size={24} /></div>
                  <h2>Farm Profile & Location</h2>
                  <p>Choose or auto-detect your location</p>
                </div>
                <div className="lg-form">
                  <div style={{ marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={geoLoading}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '10px 14px', borderRadius: '4px', background: 'rgba(40, 116, 240, 0.15)', border: '1px solid #2874f0',
                        color: '#2874f0', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                      }}
                    >
                      {geoLoading ? <Loader2 size={16} className="spin" /> : <Compass size={16} />}
                      {geoLoading ? "Detecting GPS Location..." : "🎯 Detect My Device Location (GPS)"}
                    </button>
                  </div>

                  <div className="lg-field-label">Farm Location (Any Indian Village / District / State)</div>
                  <div className="lg-input-group">
                    <MapPin size={17} className="lg-input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Kukatpally, Hyderabad, Telangana, India"
                      value={formData.location}
                      onChange={e => {
                        set("location", e.target.value);
                        set("customLocation", e.target.value);
                      }}
                    />
                  </div>

                  <div className="lg-field-label" style={{ marginTop: 12, marginBottom: 8 }}>Cultivated Crops (Searchable Multi-Crop Selector)</div>
                  <SearchableCropSelector
                    selectedCrops={regCrops}
                    onChange={(updatedCrops) => {
                      setRegCrops(updatedCrops);
                      const primary = updatedCrops.find(c => c.isPrimary) || updatedCrops[0];
                      if (primary) {
                        set("cropType", primary.name);
                      }
                    }}
                    totalFarmArea={5}
                    landUnit="Acres"
                  />

                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button
                      type="button"
                      className="lg-btn-outline"
                      onClick={() => { clearAlerts(); setStep(1); }}
                      style={{ flex: 1 }}
                    >
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button
                      type="button"
                      className="lg-btn-primary"
                      onClick={handleRegister}
                      disabled={loading}
                      style={{ flex: 2 }}
                    >
                      {loading ? <><Loader2 size={16} className="spin" /> Creating Account...</> : <>Create Account <CheckCircle size={16} /></>}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* LOGIN */}
            {mode === "login" && (
              <>
                <div className="lg-form-header">
                  <div className="lg-form-icon"><Sprout size={24} /></div>
                  <h2>Welcome Back</h2>
                  <p>Sign in with your Email or Mobile Number</p>
                </div>
                <form onSubmit={handleLogin} className="lg-form">
                  <div className="lg-input-group">
                    <User size={17} className="lg-input-icon" />
                    <input
                      id="login-identifier"
                      type="text" placeholder="Email, Mobile (+91), or Full Name"
                      value={formData.identifier}
                      onChange={e => set("identifier", e.target.value)}
                      required autoFocus
                      autoComplete="username"
                    />
                  </div>
                  <div className="lg-input-group">
                    <Lock size={17} className="lg-input-icon" />
                    <input
                      id="login-password"
                      type={showPwd ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={e => set("password", e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="lg-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="lg-login-extras">
                    <button
                      type="button"
                      className="lg-text-btn"
                      onClick={() => switchMode("forgot")}
                    >
                      <HelpCircle size={13} /> Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="lg-btn-primary"
                    disabled={loading || !formData.identifier?.trim() || !formData.password?.trim()}
                  >
                    {loading
                      ? <><Loader2 size={16} className="spin" /> Signing in...</>
                      : <>Sign In <ArrowRight size={16} /></>
                    }
                  </button>
                </form>

                <div className="lg-footer-link">
                  <span>New to Sampoorn Kisan AI?</span>
                  <button onClick={() => switchMode("register")} className="lg-text-btn">
                    Create Free Account <ArrowRight size={13} />
                  </button>
                </div>
              </>
            )}

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                className="lg-text-btn"
                style={{ fontSize: 13, color: "#637068" }}
                onClick={() => setIsSupportOpen(true)}
              >
                <HelpCircle size={12} /> Need support?
              </button>
            </div>
          </div>
        </div>

      {isSupportOpen && <SupportModal onClose={() => setIsSupportOpen(false)} />}
    </div>
  );
}
