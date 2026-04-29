import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth"; // adjust path as needed
import "./Topbar.css";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  experiments: "Experiments",
  results: "Results",
  collaborate: "Collaborate",
  analytics: "Analytics",
  ai: "AI Insights",
  profile: "Profile",
  settings: "Settings",
};

export default function Topbar({ activePage, onNavigate, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout(); // clears token from localStorage
    navigate("/login");
  };

  const handleNavFromDropdown = (page) => {
    setDropdownOpen(false);
    onNavigate(page);
  };

  return (
    <header className="topbar">
      <span className="topbar-title">
        {PAGE_TITLES[activePage] || "Dashboard"}
      </span>

      <div className="topbar-spacer" />

      {/* Search */}
      <div className="topbar-search">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search experiments…
      </div>

      {/* Notification bell */}
      <div className="topbar-icon-btn">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <span className="notif-dot" />
      </div>

      {/* Avatar + dropdown */}
      <div className="avatar-wrap" ref={dropdownRef}>
        <div
          className={`avatar ${dropdownOpen ? "open" : ""}`}
          onClick={() => setDropdownOpen((o) => !o)}
        >
          {initials}
        </div>

        {dropdownOpen && (
          <div className="dropdown">
            <div className="dropdown-header">
              <div className="dropdown-name">{user?.full_name || "User"}</div>
              <div className="dropdown-email">{user?.email || ""}</div>
            </div>

            <button
              className="dropdown-item"
              onClick={() => handleNavFromDropdown("profile")}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              My Profile
            </button>

            <button
              className="dropdown-item"
              onClick={() => handleNavFromDropdown("settings")}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Settings
            </button>

            <div className="dropdown-divider" />

            <button className="dropdown-item logout" onClick={handleLogout}>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
