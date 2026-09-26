import { useState, useEffect, useCallback } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import api, { getApiErrorMessage } from "../api/client";

export default function ResetPassword({ token: propToken, onNavigateLogin }) {
  // Extract token from prop, URL pathname, or query string
  const getInitialToken = () => {
    if (propToken) return propToken;
    const pathParts = window.location.pathname.split("/");
    const resetIndex = pathParts.indexOf("reset-password");
    if (resetIndex !== -1 && pathParts[resetIndex + 1]) {
      return pathParts[resetIndex + 1];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  };

  const token = getInitialToken();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);



  // Password rules validation
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: Boolean(password && confirmPassword && password === confirmPassword),
  };

  const passedCount = [rules.length, rules.uppercase, rules.number, rules.special].filter(Boolean).length;
  
  const getStrengthInfo = () => {
    if (password.length === 0) return { label: "", percent: 0, color: "#94a3b8" };
    if (passedCount <= 1) return { label: "Weak", percent: 25, color: "#ef4444" };
    if (passedCount === 2) return { label: "Fair", percent: 50, color: "#f59e0b" };
    if (passedCount === 3) return { label: "Good", percent: 75, color: "#3b82f6" };
    return { label: "Strong", percent: 100, color: "#10b981" };
  };

  const strength = getStrengthInfo();
  const canSubmit = rules.length && rules.match && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Password reset link is invalid or missing token. Please request a new link.");
      return;
    }

    if (!rules.length) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!rules.match) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/reset-password", {
        token: token.trim(),
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (res.data?.success || res.status === 200) {
        setSuccess(true);
      } else {
        setError(res.data?.error || res.data?.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Password reset link is invalid or has expired. Please request a new one."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = useCallback(() => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      window.location.href = "/";
    }
  }, [onNavigateLogin]);

  // Countdown auto-redirect on success
  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGoToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, handleGoToLogin]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        padding: "20px",
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(255, 255, 255, 0.98)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Top decorative accent bar */}
        <div style={{ height: "6px", background: "linear-gradient(90deg, #10b981, #059669, #047857)" }} />

        <div style={{ padding: "36px 32px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                border: "1px solid #a7f3d0",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#059669",
                marginBottom: "14px",
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>
              Reset Your Password
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Create a strong, secure password for your Sampoorn Kisan AI account.
            </p>
          </div>

          {/* Success View */}
          {success ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#166534", marginBottom: "8px" }}>
                Password Reset Successfully!
              </h2>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5, marginBottom: "24px" }}>
                Your account password has been updated. All previous active sessions have been revoked for your security.
              </p>
              <div
                style={{
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "20px",
                }}
              >
                Redirecting to Sign In in <strong style={{ color: "#059669" }}>{countdown}s</strong>...
              </div>
              <button
                type="button"
                onClick={handleGoToLogin}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Sign In Now <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* Reset Form View */
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  id="reset-error-alert"
                  role="alert"
                  aria-live="assertive"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#b91c1c",
                    fontSize: "13px",
                    lineHeight: 1.4,
                    marginBottom: "20px",
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>{error}</div>
                </div>
              )}

              {/* New Password Input */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="reset-new-password"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Lock size={18} />
                  </div>
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter min 8 characters"
                    required
                    autoComplete="new-password"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "reset-error-alert" : undefined}
                    style={{
                      width: "100%",
                      padding: "12px 42px 12px 40px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#059669")}
                    onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Password Strength:</span>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "#e2e8f0",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${strength.percent}%`,
                          backgroundColor: strength.color,
                          transition: "width 0.3s ease, background-color 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="reset-confirm-password"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Lock size={18} />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "reset-error-alert" : undefined}
                    style={{
                      width: "100%",
                      padding: "12px 42px 12px 40px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#059669")}
                    onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Policy Requirements Checklist */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
                  Password Requirements:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { label: "At least 8 characters", met: rules.length },
                    { label: "At least one uppercase letter (A-Z)", met: rules.uppercase },
                    { label: "At least one number (0-9)", met: rules.number },
                    { label: "At least one special character (!@#$)", met: rules.special },
                    { label: "Passwords match", met: rules.match },
                  ].map((req, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        color: req.met ? "#15803d" : "#64748b",
                        fontWeight: req.met ? "600" : "400",
                      }}
                    >
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          background: req.met ? "#22c55e" : "#e2e8f0",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: "bold",
                        }}
                      >
                        {req.met ? "✓" : "•"}
                      </div>
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: canSubmit
                    ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                    : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: canSubmit ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" /> Updating Password...
                  </>
                ) : (
                  <>
                    Update Password <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "18px" }}>
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#059669",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
