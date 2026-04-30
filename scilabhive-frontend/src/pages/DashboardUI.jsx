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
      <h3 className="card-title">Experiment this week</h3>
      <div>
        <div>
          <DisplayBar />
        </div>
      </div>
    </div>
  );
}

export function DisplayActivity() {
  const activities = [
    {
      color: "#2798F5",
      text: "result added",
      bold: "Enzyme Kinetics #3",
      time: "2 hours ago",
    },
    {
      color: "#F527E4",
      text: "marked complete",
      bold: "pH Titration study",
      time: "yesterday",
    },
    {
      color: "#F52765",
      text: "joined your workplace",
      bold: "Dr. Chen",
      time: "2 days ago",
    },
    {
      color: "#F55027",
      text: "flagged for review",
      bold: "Spectroscopy Analysis",
      time: "3 days ago",
    },
  ];

  return (
    <div className="activity-card">
      {activities.map((a) => (
        <div key={a.bold} className="activity-area">
          <div className="dot" style={{ background: a.color }} />

          <div className="activity-text">
            <p className="act-bold">{a.bold}</p>
            <p className="act-text">{a.text}</p>
            <span className="act-time">{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShowRecentActivity() {
  return (
    <div className="activity-chart">
      <h3 className="card-title"> Recent Activity</h3>
      <div>
        <DisplayActivity />
      </div>
    </div>
  );
}
