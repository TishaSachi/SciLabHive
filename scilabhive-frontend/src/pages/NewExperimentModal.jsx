import { useState } from "react";
import { createExperiment, updateExperiment } from "../services/api"; // adjust path
import "./ExperimentsPage.css";

export default function NewExperimentModal({ onClose, onSubmit, initialData }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    type: initialData?.experiment_type || "",
    status: initialData?.status || "Planned",
    description: initialData?.description || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const handleSubmit = async () => {
    if (!form.title || !form.type) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        experiment_type: form.type,
        status: form.status,
        description: form.description,
      };

      let saved;
      if (isEdit) {
        saved = await updateExperiment(initialData.experiment_id, payload);
      } else {
        saved = await createExperiment(payload);
      }
      onSubmit(saved);
      onClose();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err);
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
          <div className="modal-title">
            {isEdit ? "Edit Experiment" : "New Experiment"}
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
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
              onChange={set("title")}
            />
          </div>

          {/* Type + Status row */}
          <div className="modal-field-row">
            <div className="modal-field">
              <label className="modal-label">Type *</label>
              <select
                className="modal-input"
                value={form.type}
                onChange={set("type")}
              >
                <option value="">Select type…</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Status</label>
              <select
                className="modal-input"
                value={form.status}
                onChange={set("status")}
              >
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
              onChange={set("description")}
            />
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || !form.title || !form.type}
            >
              {loading
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save Changes"
                  : "Create Experiment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
