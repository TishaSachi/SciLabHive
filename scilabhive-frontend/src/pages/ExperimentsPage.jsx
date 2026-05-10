import NewExperimentModal from "./NewExperimentModal";
import { useState, useEffect } from "react";
import { getExperiments } from "../services/api"; // adjust path
import "./ExperimentsPage.css";

// Maps status string → badge CSS class
const STATUS_CLASS = {
  "In Progress": "badge-warning",
  Completed: "badge-success",
  Review: "badge-danger",
  Planned: "badge-info",
};

// ── Mini stat card ──────────────────────────────
function MiniStat({ value, label, accentColor }) {
  return (
    <div className="mini-stat" style={{ "--mini-accent": accentColor }}>
      <div className="mini-stat-val">{value}</div>
      <div className="mini-stat-lbl">{label}</div>
    </div>
  );
}

// ── Experiments table ───────────────────────────
function ExperimentsTable({ data }) {
  return (
    <div className="exp-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Experiment</th>
            <th>Type</th>
            <th>Status</th>
            <th>Parameters</th>
            <th>Results</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((exp) => (
            <tr key={exp.id}>
              <td>
                <div className="exp-title">{exp.title}</div>
                <div className="exp-id">{exp.id}</div>
              </td>
              <td>
                <span className="type-tag">{exp.type}</span>
              </td>
              <td>
                <span className={`badge ${STATUS_CLASS[exp.status]}`}>
                  {exp.status}
                </span>
              </td>
              <td style={{ color: "var(--text-muted)" }}>{exp.params}</td>
              <td style={{ color: "var(--text-muted)" }}>{exp.results}</td>
              <td style={{ color: "var(--text-muted)", fontSize: 12.5 }}>
                {exp.date}
              </td>
              <td>
                <div className="actions-cell">
                  <button className="action-btn">View</button>
                  <button className="action-btn">Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span className="page-info">
          Showing 1–{data.length} of 47 experiments
        </span>
        <div className="page-btns">
          <button className="page-btn">‹</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">›</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ExperimentsPage ────────────────────────
export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getExperiments();
        setExperiments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Mapping ligic

  const mapped = experiments.map((e) => ({
    id: `#${e.experiment_id}`,
    title: e.title,
    type: e.experiment_type,
    status: e.status,
    params: 0,
    results: 0,
    date: new Date(e.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  // filter logic
  const filtered = mapped.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? e.status === statusFilter : true;
    const matchType = typeFilter ? e.type === typeFilter : true;
    return matchSearch && matchStatus && matchType;
  });

  // Add new experiment to the list optimistically
  const handleNewExperiment = (saved) => {
    const newExp = {
      id: `#${saved.experiment_id}`,
      title: saved.title,
      type: saved.experiment_type,
      status: saved.status,
      params: 0,
      results: 0,
      date: new Date(saved.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setExperiments((prev) => [saved, ...prev]);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="exp-page-header">
        <div>
          <div className="exp-page-title">Experiments</div>
          <div className="exp-page-sub">
            Track, manage and compare all your lab experiments
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Experiment
        </button>
      </div>

      {/* ── Mini stats ── */}
      <div className="exp-stats-row">
        <MiniStat value={experiments.length} label="Total" />
        <MiniStat
          value={experiments.filter((e) => e.status === "Completed").length}
          label="Completed"
          accentColor="#059669"
        />
        <MiniStat
          value={experiments.filter((e) => e.status === "In Progress").length}
          label="In Progress"
          accentColor="#d97706"
        />
        <MiniStat
          value={experiments.filter((e) => e.status === "Review").length}
          label="Under Review"
          accentColor="#dc2626"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="exp-toolbar">
        <div className="search-box">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search experiments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Review">Review</option>
          <option value="Planned">Planned</option>
        </select>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          <option value="Biochemistry">Biochemistry</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Physics">Physics</option>
          <option value="Biology">Biology</option>
        </select>

        <button className="sort-btn">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="21" y1="4" x2="14" y2="4" />
            <line x1="10" y1="4" x2="3" y2="4" />
            <line x1="21" y1="12" x2="12" y2="12" />
            <line x1="8" y1="12" x2="3" y2="12" />
            <line x1="21" y1="20" x2="16" y2="20" />
            <line x1="12" y1="20" x2="3" y2="20" />
            <circle cx="12" cy="4" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="14" cy="20" r="2" />
          </svg>
          Sort
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Loading experiments…
        </div>
      ) : (
        <ExperimentsTable data={filtered} />
      )}

      {/* ── Modal ── */}
      {showModal && (
        <NewExperimentModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNewExperiment}
        />
      )}
    </div>
  );
}
