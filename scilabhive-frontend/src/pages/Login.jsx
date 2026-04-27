import { useState } from "react";
import "./Login.css";
import HexIcon from "../components/HexIcon";
import GoogleIcon from "../components/GoogleIcon";
import GithubIcon from "../components/GithubIcon";
import AlertIcon from "../components/AlertIcon";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/auth";
import { login as saveToken } from "../auth/auth";

// ── Main Component ────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginService(email, password);
      saveToken(data.access_token);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
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
          SciLabHive is your personal lab notebook in the cloud — built for
          students, hobbyists, and small labs to log, track, and revisit
          experiments without the mess of scattered notes and spreadsheets.
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
            New to SciLabHive? <a href="#register">Create a account →</a>
          </p>
        </div>
      </section>
    </div>
  );
}
