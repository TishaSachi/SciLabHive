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

export function DisplayBar({ experiments = [] }) {
  // Build last 7 days going backwards from today
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // 6 days ago → today
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue etc
      date: date,
    };
  });

  // Count experiments created on each of those days
  const counts = days.map((d) => {
    const count = experiments.filter((e) => {
      return new Date(e.created_at).toDateString() === d.date.toDateString();
    }).length;
    return { label: d.label, value: count };
  });

  const max = Math.max(...counts.map((d) => d.value), 1);

  return (
    <div className="chart-bars">
      {counts.map((d, i) => (
        <div key={i} className="bar-col">
          <div
            className="bar"
            style={{ height: `${(d.value / max) * 130}px` }}
          />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ExperimentChart({ experiments }) {
  return (
    <div className="ex-chart">
      <h3 className="card-title">Experiments this week</h3>
      <DisplayBar experiments={experiments} />
    </div>
  );
}

export function DisplayActivity({ experiments = [] }) {
  const COLORS = ["#7c3aed", "#0d9488", "#d97706", "#e11d48", "#059669"];

  const activities = [...experiments]
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at);
      const dateB = new Date(b.updated_at || b.created_at);
      return dateB - dateA;
    })
    .slice(0, 4)
    .map((e, i) => ({
      color: COLORS[i % COLORS.length],
      bold: e.title,
      text: e.updated_at ? "— updated" : `— ${e.status}`,
      time: new Date(e.updated_at || e.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  if (activities.length === 0) {
    return (
      <div
        style={{
          padding: 20,
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        No activity yet
      </div>
    );
  }

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

export function ShowRecentActivity({ experiments }) {
  return (
    <div className="activity-chart">
      <h3 className="card-title">Recent Activity</h3>
      <DisplayActivity experiments={experiments} />
    </div>
  );
}

export function DisplayRecentExperimentCard({ experiments }) {
  const recentExperiments = experiments || [];

  const statusClass = {
    "In Progress": "badge-warning",
    Completed: "badge-success",
    Review: "badge-danger",
    Planned: "badge-info",
  };

  return (
    <div className="ex-table">
      <div className="table-titles">
        <div>Title</div>
        <div>Type</div>
        <div>Status</div>
        <div>Date</div>
      </div>
      {recentExperiments.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          No experiments yet — create your first one!
        </div>
      ) : (
        recentExperiments.map((r) => (
          <div key={r.experiment_id} className="re-ex-elements">
            <div>{r.title}</div>
            <div>{r.experiment_type}</div>
            <div>
              <p className={`status-badge ${statusClass[r.status]}`}>
                {r.status}
              </p>
            </div>
            <div>
              {new Date(r.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function ShowRecentExperiments({ onNavigate, experiments }) {
  return (
    <div>
      <div className="recent-ex">
        <p className="recent-ex-title">Recent Experiments</p>
        <button
          className="recent-ex-btn"
          onClick={() => onNavigate("experiments")}
        >
          Show all
        </button>
      </div>
      <div className="re-ex-cards">
        <DisplayRecentExperimentCard experiments={experiments} />{" "}
        {/* ← pass prop */}
      </div>
    </div>
  );
}
