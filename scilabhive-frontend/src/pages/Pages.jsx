import { useState, useEffect } from "react";
import { getExperiments } from "../services/api";
import {
  StatCard,
  QuickCard,
  ExperimentChart,
  ShowRecentActivity,
  ShowRecentExperiments,
} from "./DashboardUI";

export function DashboardPage({ onNavigate }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiments()
      .then((data) => setExperiments(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Derive stats from real data
  const total = experiments.length;
  const completed = experiments.filter((e) => e.status === "Completed").length;
  const inProgress = experiments.filter(
    (e) => e.status === "In Progress",
  ).length;
  const review = experiments.filter((e) => e.status === "Review").length;

  // Most recent 4 sorted by date
  const recent = [...experiments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <div>
      {/* ── Section 1: Stat Cards ── */}
      <div className="stat-grid">
        <StatCard
          label="Total Experiments"
          value={loading ? "—" : total}
          sub="experiments logged"
        />
        <StatCard
          label="Completed"
          value={loading ? "—" : completed}
          sub="fully done"
          accentColor="#0d9488"
        />
        <StatCard
          label="In Progress"
          value={loading ? "—" : inProgress}
          sub="currently active"
          accentColor="#d97706"
        />
        <StatCard
          label="Under Review"
          value={loading ? "—" : review}
          sub="needs attention"
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

      {/* ── Section 3: Chart + Activity ── */}
      <div className="sec-3">
        <ExperimentChart experiments={experiments} />
        <ShowRecentActivity experiments={experiments} />
      </div>

      {/* ── Section 4: Recent experiments ── */}
      <div className="sec-4">
        <ShowRecentExperiments onNavigate={onNavigate} experiments={recent} />
      </div>
    </div>
  );
}
