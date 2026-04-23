import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background */}
      <div className="bg-layer">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-lines" />
      </div>

      <div className="login-card">
        {/* Logo / Brand */}
        <div className="brand">
          <span className="brand-name">LUMERIAR</span>
        </div>

        <div className="card-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080b12;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* ---- Background ---- */
        .bg-layer { position: fixed; inset: 0; pointer-events: none; }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: 520px; height: 520px; background: #3b82f6; top: -160px; left: -160px; animation-delay: 0s; }
        .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -120px; right: -80px; animation-delay: -4s; }
        .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 50%; left: 55%; animation-delay: -8s; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.05); }
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ---- Card ---- */
        .login-card {
          position: relative;
          width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 44px 40px;
          backdrop-filter: blur(24px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.5);
          animation: rise 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ---- Brand ---- */
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          color: #e2e8f0;
        }
        .brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }
        .brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 0.12em;
          color: #f1f5f9;
        }

        /* ---- Header ---- */
        .card-header { margin-bottom: 32px; }
        .card-header h1 {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 6px;
        }
        .card-header p {
          font-size: 14px;
          color: #64748b;
          font-weight: 300;
        }

        /* ---- Form ---- */
        .login-form { display: flex; flex-direction: column; gap: 20px; }

        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .field-group label {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #475569;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .input-wrap input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 42px 12px 40px;
          font-size: 14px;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .input-wrap input::placeholder { color: #334155; }
        .input-wrap input:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.06);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }

        .toggle-pass {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          display: flex; align-items: center;
          padding: 4px;
          transition: color 0.2s;
        }
        .toggle-pass:hover { color: #94a3b8; }

        /* ---- Error ---- */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #f87171;
          animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(3px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        /* ---- Submit ---- */
        .submit-btn {
          margin-top: 4px;
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border: none;
          border-radius: 10px;
          padding: 13px 24px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card { width: 92vw; padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}
