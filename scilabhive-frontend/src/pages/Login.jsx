import { useState } from "react";
import "./Login.css";

// ── SVG Icons ────────────────────────────────────────────
const HexIcon = () => (
  <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="36,4 66,20 66,52 36,68 6,52 6,20"
      stroke="#4ade80"
      strokeWidth="1.5"
      fill="none"
    />
    <polygon
      points="36,14 56,25 56,47 36,58 16,47 16,25"
      stroke="#4ade80"
      strokeWidth="1"
      strokeOpacity="0.35"
      fill="#4ade8008"
    />
    {/* Flask icon inside */}
    <path
      d="M30 22v10l-6 12h24l-6-12V22M28 22h16"
      stroke="#4ade80"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="32" cy="40" r="1.5" fill="#4ade80" opacity="0.8" />
    <circle cx="38" cy="43" r="1" fill="#4ade80" opacity="0.5" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" opacity="0.8"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor" opacity="0.8"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity="0.8"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ── Main Component ────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    // Simulate API call — replace with your real auth logic
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);

    // Demo: show error for wrong demo creds
    if (email !== "researcher@scilabhive.io" || password !== "demo1234") {
      setError("Invalid credentials. Try researcher@scilabhive.io / demo1234");
    } else {
      alert("✓ Login successful! Redirecting to dashboard...");
    }
  };

  return (
    <div className="page-wrapper">

      {/* ── Left Hero Panel ── */}
      <section className="hero-panel">
        <span className="brand-tag">v1.0 · Early Access</span>

        <div className="hex-icon">
          <HexIcon />
        </div>

        <h1 className="hero-title">
          SciLab
          <span className="highlight">Hive</span>
        </h1>

        <p className="hero-description">
          SciLabHive is your personal lab notebook in the cloud — built for students, hobbyists, and small labs to log, track, and revisit experiments without the mess of 
          scattered notes and spreadsheets.
        </p>

        <ul className="feature-list">
          {[
            "Log experiments with structured parameters, results, and observations",
            "Compare past experiments side-by-side with visual dashboards",
            "Search your experiment history and discover similar setups",
            "Get AI-assisted insights on what's affecting your results",
            "Collaborate and share experiments with your lab or class",
          ].map((f) => (
            <li key={f} className="feature-item">
              <span className="feature-dot" />
              {f}
            </li>
          ))}
        </ul>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-value">18k+</span>
            <span className="stat-label">Experiments</span>
          </div>
          <div className="stat">
            <span className="stat-value">340</span>
            <span className="stat-label">Institutions</span>
          </div>
          <div className="stat">
            <span className="stat-value">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </section>

      {/* ── Right Login Panel ── */}
      <section className="login-panel">
        <span className="corner-deco">@SciLabHive · 2026</span>

        <div className="login-box">
          <div className="login-header">
            <h2>
              Access Terminal
              <span className="cursor-blink" />
            </h2>
            <p>Sign in to continue to your lab workspace</p>
          </div>

          {error && (
            <div className="error-msg">
              <AlertIcon />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="field-group">
              <label className="field-label">
                <span className="prompt">$</span>
                researcher_id
              </label>
              <input
                className="field-input"
                type="email"
                placeholder="email@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                <span className="prompt">$</span>
                passphrase
              </label>
              <input
                className="field-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <div className="field-meta">
                <button
                  type="button"
                  className="link-muted"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "hide" : "reveal"} passphrase
                </button>
                <span style={{ flex: 1 }} />
                <button type="button" className="link-muted">
                  forgot credentials?
                </button>
              </div>
            </div>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Authenticating…
                </>
              ) : (
                "→ Enter Workspace"
              )}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <div className="oauth-row">
            <button className="btn-oauth" type="button">
              <GoogleIcon />
              Google
            </button>
            <button className="btn-oauth" type="button">
              <GithubIcon />
              GitHub
            </button>
          </div>

          <p className="register-link">
            New to SciLabHive?{" "}
            <a href="#register">Create a account →</a>
          </p>
        </div>
      </section>
    </div>
  );
}
