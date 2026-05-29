import { useState, useEffect, useRef } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import { login as loginService } from "../services/auth";
import { login as saveToken } from "../auth/auth";

// ── Science Particle Canvas ───────────────────────────────
function SciCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const COLORS = ["#0d9488", "#d97706", "#e11d48", "#7c3aed", "#059669"];
    const ELEMENT_LABELS = ["H", "O", "C", "N", "Na", "K", "Fe", "Ca"];

    class Particle {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h;
      }
      reset() {
        this.x = Math.random() * this.w;
        this.y = Math.random() * this.h;
        this.r = Math.random() * 3 + 1.5;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.45 + 0.2;
        this.label =
          ELEMENT_LABELS[Math.floor(Math.random() * ELEMENT_LABELS.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.w) this.vx *= -1;
        if (this.y < 0 || this.y > this.h) this.vy *= -1;
      }
    }

    let W = 0,
      H = 0;
    let particles = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 72 }, () => new Particle(W, H));
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Sine waves
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        const amp = 16 + w * 9;
        const freq = 0.007 - w * 0.0015;
        const phase = t * 0.004 + w * 1.3;
        const yBase = H * (0.22 + w * 0.19);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(
            x,
            yBase +
              Math.sin(x * freq + phase) * amp +
              Math.cos(x * freq * 0.5 + phase * 0.7) * amp * 0.4,
          );
        }
        ctx.strokeStyle = `rgba(13,148,136,${0.055 - w * 0.01})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Bond connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(13,148,136,${0.13 * (1 - dist / 115)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Atoms
      particles.forEach((p) => {
        p.update();
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if (p.r > 3.2) {
          ctx.globalAlpha = p.alpha * 0.55;
          ctx.fillStyle = p.color;
          ctx.font = "7px monospace";
          ctx.fillText(p.label, p.x + 4, p.y - 4);
        }
        ctx.restore();
      });

      t++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="sci-canvas" />;
}

// ── Cursor Dot ────────────────────────────────────────────
function CursorDot() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let tx = 0,
      ty = 0;
    const handleMove = (e) => {
      const dot = dotRef.current;
      if (dot) {
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
      }
      tx = e.clientX;
      ty = e.clientY;
    };
    const interval = setInterval(() => {
      const ring = ringRef.current;
      if (!ring) return;
      const cx = parseFloat(ring.style.left || 0);
      const cy = parseFloat(ring.style.top || 0);
      ring.style.left = cx + (tx - cx) * 0.14 + "px";
      ring.style.top = cy + (ty - cy) * 0.14 + "px";
    }, 16);
    document.addEventListener("mousemove", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

// ── Reaction Calculator ───────────────────────────────────
function ReactionCalc() {
  const [moles, setMoles] = useState(1.0);
  const energy = Math.round(2870 * moles);
  const o2 = (6 * moles).toFixed(1);

  return (
    <div className="reaction-box">
      <div className="rxn-label">⚗ Live Reaction Calculator</div>
      <div className="rxn-formula">
        C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>
        <span className="rxn-arrow">→</span>
        6CO<sub>2</sub> + 6H<sub>2</sub>O +{" "}
        <span className="rxn-energy">{energy.toLocaleString()}</span> kJ
      </div>
      <div className="rxn-controls">
        <label>Moles</label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={moles}
          onChange={(e) => setMoles(parseFloat(e.target.value))}
        />
        <span className="rxn-mole-val">{moles.toFixed(1)}</span>
      </div>
      <div className="rxn-result">
        Energy released: {energy.toLocaleString()} kJ · O₂ consumed: {o2} mol
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────
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
      // If email not verified redirect to OTP page
      if (err?.response?.data?.detail === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-otp", { state: { email } });
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ""}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ""}/auth/github`;
  };

  return (
    <div className="slh-page">
      <CursorDot />
      <SciCanvas />

      {/* LEFT HERO */}
      <section className="slh-hero">
        <span className="slh-badge">
          <span className="slh-badge-dot" />
          v2.0 · Open Science
        </span>

        <div className="slh-logo">
          <span className="slh-logo-eyebrow">Laboratory Intelligence</span>
          Sci<span className="slh-logo-accent">Lab</span>
          <br />
          Hive
        </div>

        <p className="slh-tagline">
          Your personal cloud lab notebook — built for curious minds. Log,
          track, and revisit experiments with AI-powered insights.
        </p>

        <ul className="slh-features">
          {[
            {
              icon: "⚗",
              text: "Log experiments with structured parameters, results & observations",
            },
            {
              icon: "📊",
              text: "Compare past experiments side-by-side with visual dashboards",
            },
            {
              icon: "🔍",
              text: "Search your history and discover similar experimental setups",
            },
            {
              icon: "🤖",
              text: "Get AI-assisted insights on what's affecting your results",
            },
            {
              icon: "🧬",
              text: "Collaborate and share experiments with your lab or class",
            },
          ].map((f) => (
            <li key={f.text} className="slh-feat">
              <span className="slh-feat-icon">{f.icon}</span>
              {f.text}
            </li>
          ))}
        </ul>

        <div className="slh-stats">
          <div className="slh-stat">
            <div className="slh-stat-val">18k+</div>
            <div className="slh-stat-lab">Experiments</div>
          </div>
          <div className="slh-stat">
            <div className="slh-stat-val">340</div>
            <div className="slh-stat-lab">Institutions</div>
          </div>
          <div className="slh-stat">
            <div className="slh-stat-val">99.9%</div>
            <div className="slh-stat-lab">Uptime</div>
          </div>
        </div>
      </section>

      {/* RIGHT FORM */}
      <section className="slh-form-panel">
        <span className="slh-corner">@SciLabHive · 2026</span>
        <div className="slh-form-box">
          <h2 className="slh-form-title">Welcome back 👋</h2>
          <p className="slh-form-sub">Sign in to your lab workspace</p>

          {error && (
            <div className="slh-error">
              <span className="slh-error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="slh-field">
              <label className="slh-label">Researcher Email</label>
              <input
                className="slh-input"
                type="email"
                placeholder="your@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="slh-field">
              <label className="slh-label">Password</label>
              <input
                className="slh-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <div className="slh-pass-row">
                <button
                  type="button"
                  className="slh-link"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"} password
                </button>
                <button type="button" className="slh-link">
                  Forgot credentials?
                </button>
              </div>
            </div>

            <button className="slh-btn-main" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="slh-spinner" /> Authenticating…
                </>
              ) : (
                "→ Enter Workspace"
              )}
            </button>
          </form>

          <div className="slh-divider">or continue with</div>

          <div className="slh-oauth">
            <button
              className="slh-btn-oauth"
              type="button"
              onClick={handleGoogleLogin}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              className="slh-btn-oauth"
              type="button"
              onClick={handleGithubLogin}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="slh-register-link">
            New to SciLabHive? <Link to="/register">Create an account →</Link>
          </p>

          <ReactionCalc />
        </div>
      </section>
    </div>
  );
}
