import "./DashboardUI.css";

export function StatCard({ label, value, sub, upDown, accentColor }) {
  return (
    <div className="stat-card" style={{ "--card-accent": accentColor }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && (
        <div className="stat-sub">
          {upDown && (
            <span className={upDown === "up" ? "stat-up" : "stat-down"}>
              {upDown === "up" ? "↑" : "↓"}
            </span>
          )}
          {sub}
        </div>
      )}
    </div>
  );
}

export function QuickCard({ icon, label, sub, onClick }) {
  return (
    <div className="quick-card" onClick={onClick}>
      <div className="quick-icon">{icon}</div>
      <div className="quick-label">{label}</div>
      <div className="quick-sub">{sub}</div>
    </div>
  );
}
