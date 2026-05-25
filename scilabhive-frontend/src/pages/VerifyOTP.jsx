import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOTP, resendOTP } from "../services/api";
import "./VerifyOTP.css";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last character
    setOtp(newOtp);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 filled
    if (newOtp.every((d) => d !== "") && value) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // On backspace move to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    setError("");
    setLoading(true);
    try {
      await verifyOTP(email, code);
      setSuccess("Email verified! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail === "OTP has expired") {
        setError("Code has expired. Please request a new one.");
      } else {
        setError("Invalid code. Please try again.");
      }
      // Clear inputs on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await resendOTP(email);
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        {/* Icon */}
        <div className="otp-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="otp-title">Check your email</h1>
        <p className="otp-sub">
          We sent a 6-digit code to
          <br />
          <strong>{email}</strong>
        </p>

        {/* OTP inputs */}
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              className={`otp-input ${error ? "error" : ""} ${success ? "success" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading || !!success}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Error / success */}
        {error && <div className="otp-error">⚠ {error}</div>}
        {success && <div className="otp-success">✓ {success}</div>}

        {/* Loading */}
        {loading && (
          <div className="otp-loading">
            <div className="otp-spinner" />
            Verifying…
          </div>
        )}

        {/* Resend */}
        <div className="otp-resend">
          {canResend ? (
            <button
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          ) : (
            <span className="otp-countdown">
              Resend code in <strong>{countdown}s</strong>
            </span>
          )}
        </div>

        <button className="otp-back" onClick={() => navigate("/login")}>
          ← Back to login
        </button>
      </div>
    </div>
  );
}
