import "./ExperimentsPage.css";

const STATUS_CLASS = {
  "In Progress": "badge-warning",
  Completed: "badge-success",
  Review: "badge-danger",
  Planned: "badge-info",
};

export default function ViewExperimentModal({ experiment, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formattedDate = new Date(experiment.created_at).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">Experiment Details</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Title</label>
            <div className="view-value">{experiment.title}</div>
          </div>

          <div className="modal-field-row">
            <div className="modal-field">
              <label className="modal-label">Type</label>
              <div className="view-value">
                <span className="type-tag">{experiment.experiment_type}</span>
              </div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Status</label>
              <div className="view-value">
                <span className={`badge ${STATUS_CLASS[experiment.status]}`}>
                  {experiment.status}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <div className="view-value view-description">
              {experiment.description || (
                <span style={{ color: "var(--text-light)" }}>
                  No description provided
                </span>
              )}
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Created</label>
            <div className="view-value">{formattedDate}</div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Experiment ID</label>
            <div className="view-value" style={{ color: "var(--text-muted)" }}>
              #{experiment.experiment_id}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
