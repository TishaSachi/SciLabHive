import { useState, useEffect, useRef } from "react";
import "./Register.css";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import { api } from "../services/api";

// ── Science Particle Canvas (shared visual) ───────────────
function SciCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const COLORS = ["#7c3aed", "#0d9488", "#d97706", "#059669", "#e11d48"];
    const ELEMENT_LABELS = [
      "H",
      "O",
      "C",
      "N",
      "Na",
      "K",
      "Fe",
      "Ca",
      "Mg",
      "Cl",
    ];

    class Particle {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.r = Math.random() * 3 + 1.5;
        this.vx = (Math.random() - 0.5) * 0.42;
        this.vy = (Math.random() - 0.5) * 0.42;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.45 + 0.18;
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
      H = 0,
      particles = [];

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

      // Violet sine waves
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        const amp = 14 + w * 10;
        const freq = 0.007 - w * 0.0014;
        const phase = t * 0.0035 + w * 1.4;
        const yBase = H * (0.2 + w * 0.2);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(
            x,
            yBase +
              Math.sin(x * freq + phase) * amp +
              Math.cos(x * freq * 0.55 + phase * 0.65) * amp * 0.4,
          );
        }
        ctx.strokeStyle = `rgba(124,58,237,${0.05 - w * 0.009})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Bond connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${0.11 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if (p.r > 3.2) {
          ctx.globalAlpha = p.alpha * 0.5;
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

  return <canvas ref={canvasRef} className="reg-sci-canvas" />;
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
      <div ref={dotRef} className="reg-cursor-dot" />
      <div ref={ringRef} className="reg-cursor-ring" />
    </>
  );
}

// ── pH Calculator Widget ──────────────────────────────────
function PHCalc() {
  const [conc, setConc] = useState(0.01);
  const pH = (-Math.log10(conc)).toFixed(2);
  const type = conc < 1e-7 ? "Basic" : conc > 1e-7 ? "Acidic" : "Neutral";
  const typeColor =
    conc < 1e-7 ? "#7c3aed" : conc > 1e-7 ? "#e11d48" : "#059669";

  return (
    <div className="reg-sci-widget">
      <div className="reg-sci-widget-label">
        🧪 pH Calculator · H⁺ Concentration
      </div>
      <div className="reg-sci-widget-formula">
        pH = −log[H⁺] = −log({conc.toExponential(2)}) ={" "}
        <span className="reg-sci-val" style={{ color: typeColor }}>
          {pH}
        </span>
        <span
          className="reg-sci-type"
          style={{ background: typeColor + "1a", color: typeColor }}
        >
          {type}
        </span>
      </div>
      <div className="reg-sci-controls">
        <label>[H⁺] mol/L</label>
        <input
          type="range"
          min="-14"
          max="0"
          step="0.1"
          value={Math.log10(conc)}
          onChange={(e) => setConc(Math.pow(10, parseFloat(e.target.value)))}
        />
        <span className="reg-sci-readout">{conc.toExponential(2)}</span>
      </div>
    </div>
  );
}

// ── Password Strength ─────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#e11d48", "#d97706", "#0d9488", "#059669"];

  if (!password) return null;

  return (
    <div className="reg-strength">
      <div className="reg-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="reg-strength-bar"
            style={{ background: i <= score ? colors[score] : "#d1c9b8" }}
          />
        ))}
      </div>
      <div className="reg-strength-checks">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`reg-strength-check ${c.ok ? "ok" : ""}`}
          >
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Register Page ────────────────────────────────────
export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    password: "",
    confirm: "",
    user_role: "",
    agree: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const set = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.agree) {
      setError("Please accept the terms to continue.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        institution: form.institution,
        user_role: form.user_role,
      });

      // Redirect to OTP verification page
      navigate("/verify-otp", {
        state: { email: form.email },
      });
    } catch (err) {
      setError("Registration failed. This email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ""}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ""}/auth/github`;
  };

  if (success) {
    return (
      <div className="reg-success-screen">
        <CursorDot />
        <SciCanvas />
        <div className="reg-success-box">
          <div className="reg-success-icon">🧬</div>
          <h2>Account Created!</h2>
          <p>Welcome to SciLabHive. Redirecting to your workspace…</p>
          <div className="reg-success-bar">
            <div className="reg-success-bar-fill" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      <CursorDot />
      <SciCanvas />

      {/* LEFT INFO PANEL */}
      <section className="reg-hero">
        <div className="reg-badge">
          <span className="reg-badge-dot" />
          Join 18,000+ Researchers
        </div>

        <div className="reg-logo">
          <span className="reg-logo-eyebrow">Create Your Account</span>
          Sci<span className="reg-logo-accent">Lab</span>
          <br />
          Hive
        </div>

        <p className="reg-tagline">
          Start your scientific journey today. Set up your personal lab notebook
          in under 2 minutes — free for students and hobbyists.
        </p>

        <div className="reg-steps">
          {[
            {
              n: "01",
              title: "Create your account",
              desc: "Name, email and secure password",
            },
            {
              n: "02",
              title: "Set up your profile",
              desc: "Institution, role, and research area",
            },
            {
              n: "03",
              title: "Start your first experiment",
              desc: "Use templates or start from scratch",
            },
            {
              n: "04",
              title: "Invite collaborators",
              desc: "Share with your lab or class",
            },
          ].map((s) => (
            <div key={s.n} className="reg-step">
              <div className="reg-step-num">{s.n}</div>
              <div>
                <div className="reg-step-title">{s.title}</div>
                <div className="reg-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="reg-trust">
          {[
            "Free for students",
            "No credit card required",
            "GDPR compliant",
            "Open source",
          ].map((t) => (
            <span key={t} className="reg-trust-pill">
              {t}
            </span>
          ))}
        </div>

        <PHCalc />
      </section>

      {/* RIGHT FORM */}
      <section className="reg-form-panel">
        <span className="reg-corner">@SciLabHive · 2026</span>
        <div className="reg-form-box">
          <h2 className="reg-form-title">Create your account</h2>
          <p className="reg-form-sub">Join the open science community</p>

          {error && (
            <div className="reg-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          {/* OAuth first */}
          <div className="reg-oauth">
            <button
              className="reg-btn-oauth"
              type="button"
              onClick={handleGoogleRegister}
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
              Continue with Google
            </button>
            <button
              className="reg-btn-oauth"
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
              Continue with GitHub
            </button>
          </div>

          <div className="reg-divider">or register with email</div>

          <form onSubmit={handleRegister} noValidate>
            {/* Name row */}
            <div className="reg-field-row">
              <div className="reg-field">
                <label className="reg-label">
                  First name <span className="reg-req">*</span>
                </label>
                <input
                  className="reg-input"
                  type="text"
                  placeholder="Ada"
                  value={form.firstName}
                  onChange={set("firstName")}
                  disabled={loading}
                />
              </div>
              <div className="reg-field">
                <label className="reg-label">
                  Last name <span className="reg-req">*</span>
                </label>
                <input
                  className="reg-input"
                  type="text"
                  placeholder="Lovelace"
                  value={form.lastName}
                  onChange={set("lastName")}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="reg-field">
              <label className="reg-label">
                Email address <span className="reg-req">*</span>
              </label>
              <input
                className="reg-input"
                type="email"
                placeholder="ada@institution.edu"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Institution / Organisation</label>
              <input
                className="reg-input"
                type="text"
                placeholder="University of Cambridge"
                value={form.institution}
                onChange={set("institution")}
                disabled={loading}
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Role</label>
              <select
                className="reg-input reg-select"
                value={form.user_role}
                onChange={set("user_role")}
                disabled={loading}
              >
                <option value="">Select your role…</option>
                <option value="student">Student</option>
                <option value="researcher">Researcher</option>
                <option value="professor">Professor / Lecturer</option>
                <option value="hobbyist">Hobbyist</option>
                <option value="industry">Industry Professional</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="reg-field">
              <label className="reg-label">
                Password <span className="reg-req">*</span>
              </label>
              <div className="reg-pass-wrap">
                <input
                  className="reg-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="reg-show-pass"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div className="reg-field">
              <label className="reg-label">
                Confirm password <span className="reg-req">*</span>
              </label>
              <input
                className={`reg-input ${form.confirm && form.confirm !== form.password ? "reg-input-err" : ""}`}
                type={showPass ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set("confirm")}
                autoComplete="new-password"
                disabled={loading}
              />
              {form.confirm && form.confirm !== form.password && (
                <span className="reg-field-err">Passwords don't match</span>
              )}
            </div>

            <label className="reg-agree">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={set("agree")}
                disabled={loading}
              />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and{" "}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>

            <button className="reg-btn-main" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="reg-spinner" /> Creating account…
                </>
              ) : (
                "→ Create Account"
              )}
            </button>
          </form>

          <p className="reg-login-link">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
