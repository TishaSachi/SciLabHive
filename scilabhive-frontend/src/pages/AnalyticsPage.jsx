import { useState, useEffect } from 'react';
import { getExperiments, getResultsStats } from '../services/api';
import './AnalyticsPage.css';

// ── Constants ──────────────────────────────────────────────
const MONTHS       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS         = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TYPE_COLORS  = ['#7c3aed','#0d9488','#d97706','#e11d48','#059669','#3b82f6'];
const STATUS_COLORS = {
  'Completed':   '#059669',
  'In Progress': '#d97706',
  'Review':      '#dc2626',
  'Planned':     '#7c3aed',
};
const STATUS_BADGE = {
  'Completed':   'success',
  'In Progress': 'warning',
  'Review':      'danger',
  'Planned':     'info',
};

// ── Helper: group experiments by month (last 6) ──
function getMonthlyData(experiments) {
  const counts = {};
  experiments.forEach(e => {
    const m = new Date(e.created_at).getMonth();
    counts[m] = (counts[m] || 0) + 1;
  });
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    const m = d.getMonth();
    return { label: MONTHS[m], value: counts[m] || 0 };
  });
}

// ── Helper: group by day of week this week ──
function getWeeklyData(experiments) {
  const now       = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const counts = Array(7).fill(0);
  experiments.forEach(e => {
    const d = new Date(e.created_at);
    if (d >= weekStart) {
      const dayIndex = ((d.getDay() - now.getDay() + 6 + 7) % 7);
      if (dayIndex < 7) counts[dayIndex]++;
    }
  });
  return counts;
}

// ── Helper: most active day ──
function getMostActiveDay(experiments) {
  const counts = {};
  experiments.forEach(e => {
    const day = DAYS[new Date(e.created_at).getDay()];
    counts[day] = (counts[day] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : '—';
}

// ── Donut Chart ────────────────────────────────────────────
function DonutChart({ statusCounts, total }) {
  const r    = 38;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const slices = Object.entries(statusCounts).map(([status, count]) => {
    const pct   = count / total;
    const dash  = pct * circ;
    const slice = { status, count, pct, dash, offset };
    offset += pct;
    return slice;
  });

  if (total === 0) {
    return (
      <div className="analytics-empty">
        <div className="analytics-empty-icon">📊</div>
        No data yet
      </div>
    );
  }

  return (
    <div className="donut-wrap">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ddd6fe" strokeWidth="14" />
        {slices.map(s => (
          <circle
            key={s.status}
            cx="50" cy="50" r={r}
            fill="none"
            stroke={STATUS_COLORS[s.status] || '#ccc'}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset * circ}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <div className="donut-legend">
        {slices.map(s => (
          <div key={s.status} className="legend-item">
            <div className="legend-dot" style={{ background: STATUS_COLORS[s.status] }} />
            {s.status}
            <span className="legend-val">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ──────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-group">
          <div className="bar-val">{d.value > 0 ? d.value : ''}</div>
          <div
            className="bar-fill"
            style={{ height: `${Math.round((d.value / max) * 100)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <div className="bar-lbl">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────
function Sparkline({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div className="sparkline">
      {data.map((v, i) => (
        <div
          key={i}
          className="spark-bar"
          style={{ height: `${Math.max(Math.round((v / max) * 40), 3)}px` }}
          title={`${DAYS[(new Date().getDay() - 6 + i + 7) % 7]}: ${v}`}
        />
      ))}
    </div>
  );
}

// ── Horizontal Bars ────────────────────────────────────────
function TypeBars({ typeCounts }) {
  const entries = Object.entries(typeCounts);
  const max     = Math.max(...entries.map(([, c]) => c), 1);

  if (entries.length === 0) {
    return (
      <div className="analytics-empty">
        <div className="analytics-empty-icon">🔬</div>
        No experiments yet
      </div>
    );
  }

  return (
    <div className="h-bar-list">
      {entries.map(([type, count], i) => (
        <div key={type} className="h-bar-item">
          <div className="h-bar-header">
            <span className="h-bar-label">{type}</span>
            <span className="h-bar-count">{count} exp</span>
          </div>
          <div className="h-bar-track">
            <div
              className="h-bar-fill"
              style={{
                width:      `${Math.round((count / max) * 100)}%`,
                background: TYPE_COLORS[i % TYPE_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────
function Timeline({ experiments }) {
  const recent = [...experiments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="analytics-empty">
        <div className="analytics-empty-icon">📋</div>
        No experiments yet
      </div>
    );
  }

  return (
    <div className="timeline">
      {recent.map((e, i) => (
        <div key={e.experiment_id} className="tl-item">
          <div className="tl-left">
            <div className="tl-dot" style={{ background: STATUS_COLORS[e.status] || '#ccc' }} />
            {i < recent.length - 1 && <div className="tl-line" />}
          </div>
          <div className="tl-content">
            <div className="tl-title">
              {e.title}
              <span className={`a-badge ${STATUS_BADGE[e.status] || 'info'}`}>
                {e.status}
              </span>
            </div>
            <div className="tl-meta">
              {e.experiment_type} · {new Date(e.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main AnalyticsPage ─────────────────────────────────────
export default function AnalyticsPage() {
  const [experiments,   setExperiments]   = useState([]);
  const [resultsStats,  setResultsStats]  = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [exps, stats] = await Promise.all([
          getExperiments(),
          getResultsStats(),
        ]);
        setExperiments(exps);
        setResultsStats(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="analytics-title">Analytics</div>
        <div className="analytics-sub">Overview of your experiment activity</div>
        <div className="analytics-stat-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="analytics-stat-card">
              <div className="skeleton" style={{ width: '60%' }} />
              <div className="skeleton" style={{ width: '40%', height: 32 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Derived data ──
  const total        = experiments.length;
  const completed    = experiments.filter(e => e.status === 'Completed').length;
  const rate         = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalResults = resultsStats?.total_results ?? 0;
  const avg          = total > 0 ? (totalResults / total).toFixed(1) : '0';

  const monthlyData  = getMonthlyData(experiments);
  const weeklyData   = getWeeklyData(experiments);
  const mostActive   = getMostActiveDay(experiments);

  const statusCounts = {};
  experiments.forEach(e => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
  });

  const typeCounts = {};
  experiments.forEach(e => {
    typeCounts[e.experiment_type] = (typeCounts[e.experiment_type] || 0) + 1;
  });

  return (
    <div>
      <div className="analytics-title">Analytics</div>
      <div className="analytics-sub">Overview of your experiment activity and results</div>

      {/* ── Stat cards ── */}
      <div className="analytics-stat-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-lbl">Total Experiments</div>
          <div className="analytics-stat-val">{total}</div>
          <div className="analytics-stat-sub">experiments logged</div>
        </div>
        <div className="analytics-stat-card" style={{ '--sc': '#059669' }}>
          <div className="analytics-stat-lbl">Completion Rate</div>
          <div className="analytics-stat-val">{rate}%</div>
          <div className="analytics-stat-sub">{completed} completed</div>
        </div>
        <div className="analytics-stat-card" style={{ '--sc': '#d97706' }}>
          <div className="analytics-stat-lbl">Total Results</div>
          <div className="analytics-stat-val">{totalResults}</div>
          <div className="analytics-stat-sub">across all experiments</div>
        </div>
        <div className="analytics-stat-card" style={{ '--sc': '#7c3aed' }}>
          <div className="analytics-stat-lbl">Avg Results / Exp</div>
          <div className="analytics-stat-val">{avg}</div>
          <div className="analytics-stat-sub">per experiment</div>
        </div>
      </div>

      {/* ── Monthly + Status ── */}
      <div className="analytics-two-col">
        <div className="analytics-card">
          <div className="analytics-card-title">Monthly Activity</div>
          <div className="analytics-card-sub">Experiments created per month</div>
          <BarChart data={monthlyData} />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Status Breakdown</div>
          <div className="analytics-card-sub">Current experiment statuses</div>
          <DonutChart statusCounts={statusCounts} total={total} />
        </div>
      </div>

      {/* ── Type bars + Timeline ── */}
      <div className="analytics-two-col">
        <div className="analytics-card">
          <div className="analytics-card-title">By Experiment Type</div>
          <div className="analytics-card-sub">Distribution across science fields</div>
          <TypeBars typeCounts={typeCounts} />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Recent Experiments</div>
          <div className="analytics-card-sub">Latest activity timeline</div>
          <Timeline experiments={experiments} />
        </div>
      </div>

      {/* ── Sparklines + Most active day ── */}
      <div className="analytics-three-col">
        <div className="analytics-card">
          <div className="analytics-card-title">This Week</div>
          <div className="analytics-card-sub">Experiments created daily</div>
          <Sparkline data={weeklyData} />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Completion Progress</div>
          <div className="analytics-card-sub">Completed vs total</div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Completed</span>
              <span style={{ fontWeight: 600 }}>{completed} / {total}</span>
            </div>
            <div className="h-bar-track" style={{ height: 12 }}>
              <div
                className="h-bar-fill"
                style={{
                  width:      `${rate}%`,
                  background: '#059669',
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>
              {total - completed} experiments still in progress or planned
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Most Active Day</div>
          <div className="analytics-card-sub">Based on experiment creation</div>
          <div className="active-day-val">{mostActive}</div>
          <div className="active-day-sub">most experiments started</div>
        </div>
      </div>

    </div>
  );
}
