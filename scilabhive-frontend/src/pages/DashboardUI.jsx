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

export function DisplayBar() {
  const data = [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 5 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 7 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 10 },
    { label: "Sun", value: 12 },
  ];

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="chart-bars">
      {data.map((d) => (
        <div key={d.label} className="bar-col">
          <div
            className="bar"
            style={{ height: `${(d.value / max) * 80}px` }}
          />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ExperimentChart() {
  return (
    <div className="ex-chart">
      <h3>Experiment this week</h3>
      <div>
        <div>
          <DisplayBar />
        </div>
      </div>
    </div>
  );
}

export function ShowRecentActivity() {
  return <div> Recent Activity</div>;
}
