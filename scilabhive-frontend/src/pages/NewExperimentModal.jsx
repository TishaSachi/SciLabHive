import { useState } from 'react';
import './ExperimentsPage.css';

export default function NewExperimentModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    type: '',
    status: 'Planned',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.type) return;
    setLoading(true);
    try {
      // ── Replace with your real API call ──
      // await api.post('/experiments', {
      //   title: form.title,
      //   experiment_type: form.type,
      //   description: form.description,
      // });
      await new Promise((r) => setTimeout(r, 800)); // placeholder
      onSubmit(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">

        <div className="modal-header">
          <div className="modal-title">New Experiment</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Title */}
          <div className="modal-field">
            <label className="modal-label">Experiment title *</label>
            <input
              className="modal-input"
              type="text"
              placeholder="e.g. Enzyme Kinetics #4"
              value={form.title}
              onChange={set('title')}
            />
          </div>

          {/* Type + Status row */}
          <div className="modal-field-row">
            <div className="modal-field">
              <label className="modal-label">Type *</label>
              <select className="modal-input" value={form.type} onChange={set('type')}>
                <option value="">Select type…</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Status</label>
              <select className="modal-input" value={form.status} onChange={set('status')}>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea
              className="modal-textarea"
              placeholder="Brief description of the experiment…"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || !form.title || !form.type}
            >
              {loading ? 'Creating…' : 'Create Experiment'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
