import { StatCard, QuickCard } from "./DashboardUI";

export function DashboardPage({ onNavigate }) {
  return (
    <div>
      {/* ── Section 1: Stat Cards ── */}
      <div className="stat-grid">
        <StatCard
          label="Total Experiments"
          value="47"
          sub="12% this month"
          upDown="up"
        />
        <StatCard
          label="Completed"
          value="31"
          sub="8% vs last month"
          upDown="up"
          accentColor="#0d9488"
        />
        <StatCard
          label="In Progress"
          value="11"
          sub="3 due this week"
          accentColor="#d97706"
        />
        <StatCard
          label="Collaborators"
          value="8"
          sub="+2 new this week"
          upDown="up"
          accentColor="#e11d48"
        />
      </div>

      {/* ── Section 2: Quick Actions ── */}
      <div className="quick-grid">
        <QuickCard
          label="New Experiment"
          sub="Start logging now"
          onClick={() => onNavigate("experiments")}
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        />
        <QuickCard
          label="View Results"
          sub="Analyse your data"
          onClick={() => onNavigate("results")}
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <QuickCard
          label="AI Insights"
          sub="Get smart analysis"
          onClick={() => onNavigate("ai")}
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
