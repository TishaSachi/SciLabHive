import { useState, useEffect } from 'react';
import { getExperiments, getResults, addResult, deleteResult } from '../services/api';
import './ResultsPage.css';

const COLORS = ['#7c3aed', '#0d9488', '#d97706', '#e11d48', '#059669', '#3b82f6'];

const STATUS_CLASS = {
  'Completed':   'success',
  'In Progress': 'warning',
  'Review':      'danger',
  'Planned':     'info',
};

// ── Add Result Modal ────────────────────────────────────
function AddResultModal({ experiment, onClose, onSaved }) {
  const [form, setForm]     = useState({ name: '', value: '', unit: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.value.trim()) {
      setError('Name and value are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const saved = await addResult(experiment.experiment_id, {
        result_name:  form.name.trim(),
        result_value: form.value.trim(),
        result_unit:  form.unit.trim() || null,
      });
      onSaved(experiment.experiment_id, saved);
      onClose();
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="result-modal-overlay" onClick={handleOverlay}>
      <div className="result-modal">
        <div className="result-modal-header">
          <div>
            <div className="result-modal-title">Add Result</div>
            <div className="result-modal-exp">{experiment.title}</div>
          </div>
          <button className="result-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="result-modal-body">
          <div className="result-modal-row">
            <div className="result-modal-field">
              <label className="result-modal-label">Result name *</label>
              <input
                className="result-modal-input"
                placeholder="e.g. Absorbance Peak"
                value={form.name}
                onChange={set('name')}
                autoFocus
              />
            </div>
            <div className="result-modal-field">
              <label className="result-modal-label">Value *</label>
              <input
                className="result-modal-input"
                placeholder="e.g. 520"
                value={form.value}
                onChange={set('value')}
              />
            </div>
          </div>

          <div className="result-modal-field">
            <label className="result-modal-label">
              Unit{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-light)' }}>
                (optional)
              </span>
            </label>
            <input
              className="result-modal-input"
              placeholder="e.g. nm, pH, mL, %"
              value={form.unit}
              onChange={set('unit')}
            />
          </div>

          {error && <div className="result-error">{error}</div>}

          <div className="result-modal-footer">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save Result'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single Experiment Card ──────────────────────────────
function ExperimentResultCard({ experiment, colorIndex, onResultAdded, onResultDeleted }) {
  const [open, setOpen]         = useState(false);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fetched, setFetched]   = useState(false);

  // Fetch results when card is opened for the first time
  const handleToggle = async () => {
    setOpen((o) => !o);
    if (!fetched) {
      setLoading(true);
      try {
        const data = await getResults(experiment.experiment_id);
        setResults(data);
        setFetched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Called after a result is saved in the modal
  const handleResultSaved = (expId, saved) => {
    setResults((prev) => [...prev, saved]);
  };

  // Delete a result
  const handleDelete = async (resultId) => {
    try {
      await deleteResult(resultId);
      setResults((prev) => prev.filter((r) => r.result_id !== resultId));
    } catch (err) {
      console.error(err);
    }
  };

  const color = COLORS[colorIndex % COLORS.length];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  };

  return (
    <>
      <div className={`exp-result-card ${open ? 'open' : ''}`}>

        {/* ── Header ── */}
        <div className="exp-result-header" onClick={handleToggle}>
          <div className="exp-color-bar" style={{ background: color }} />
          <div className="exp-result-info">
            <div className="exp-result-name">{experiment.title}</div>
            <div className="exp-result-meta">{experiment.experiment_type}</div>
          </div>
          <div className="exp-result-right">
            <span className="exp-result-count">
              {fetched ? `${results.length} result${results.length !== 1 ? 's' : ''}` : '—'}
            </span>
            <span className={`r-badge ${STATUS_CLASS[experiment.status] || 'info'}`}>
              {experiment.status}
            </span>
            <svg className="exp-chevron" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* ── Body ── */}
        {open && (
          <div className="exp-result-body">
            <div className="results-toolbar">
              <span className="results-toolbar-left">
                {loading ? 'Loading…' : `${results.length} result${results.length !== 1 ? 's' : ''} logged`}
              </span>
              <button className="btn-add-result" onClick={() => setShowModal(true)}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Result
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="results-loading">
                <div className="skeleton" style={{ width: '60%' }} />
                <div className="skeleton" style={{ width: '40%' }} />
                <div className="skeleton" style={{ width: '70%' }} />
              </div>
            )}

            {/* Empty state */}
            {!loading && results.length === 0 && (
              <div className="results-empty">
                <div className="results-empty-icon">🧪</div>
                <div className="results-empty-title">No results yet</div>
                <div className="results-empty-sub">Click "Add Result" to log your first measurement</div>
              </div>
            )}

            {/* Results grid */}
            {!loading && results.length > 0 && (
              <div className="results-grid">
                {results.map((r) => (
                  <div key={r.result_id} className="result-tile">
                    <div className="result-tile-name">{r.result_name}</div>
                    <div>
                      <span className="result-tile-value">{r.result_value}</span>
                      {r.result_unit && (
                        <span className="result-tile-unit">{r.result_unit}</span>
                      )}
                    </div>
                    <div className="result-tile-date">{formatDate(r.created_at)}</div>
                    <button
                      className="result-tile-delete"
                      onClick={() => handleDelete(r.result_id)}
                      title="Delete result"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AddResultModal
          experiment={experiment}
          onClose={() => setShowModal(false)}
          onSaved={handleResultSaved}
        />
      )}
    </>
  );
}

// ── Main Results Page ───────────────────────────────────
export default function ResultsPage() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading]         = useState(true);

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

  return (
    <div>
      <div className="results-page-title">Results</div>
      <div className="results-page-sub">Log and view results for each experiment</div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '18px 22px',
              height: 76,
            }}>
              <div className="skeleton" style={{ width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '20%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Experiment list */}
      {!loading && experiments.length === 0 && (
        <div className="results-empty">
          <div className="results-empty-icon">🔬</div>
          <div className="results-empty-title">No experiments yet</div>
          <div className="results-empty-sub">Create an experiment first, then log results here</div>
        </div>
      )}

      {!loading && experiments.map((exp, i) => (
        <ExperimentResultCard
          key={exp.experiment_id}
          experiment={exp}
          colorIndex={i}
          onResultAdded={() => {}}
          onResultDeleted={() => {}}
        />
      ))}
    </div>
  );
}
