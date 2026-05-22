import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import { deleteAccount } from '../services/api';
import './SettingsPage.css';

// ── Toggle component ──────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-wrap">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

// ── Toast component ───────────────────────────────────────
function Toast({ message }) {
  return (
    <div className="settings-toast">
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────
function DeleteModal({ onClose, onConfirm, loading }) {
  const [typed, setTyped] = useState('');
  const confirmed = typed === 'DELETE';

  return (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="confirm-modal">
        <div className="confirm-icon">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>

        <div className="confirm-title">Delete account?</div>
        <div className="confirm-desc">
          This will permanently delete your account, all experiments, results and data.
          This action <strong>cannot be undone</strong>.
        </div>

        <label className="confirm-input-label">
          Type <strong>DELETE</strong> to confirm
        </label>
        <input
          className="confirm-input"
          placeholder="DELETE"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
        />

        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onClose}>Cancel</button>
          <button
            className="confirm-delete"
            onClick={onConfirm}
            disabled={!confirmed || loading}
          >
            {loading ? 'Deleting…' : 'Yes, delete my account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main SettingsPage ─────────────────────────────────────
export default function SettingsPage() {
  const navigate  = useNavigate();

  // Load saved preferences from localStorage
  const [prefs, setPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('scilabhive_prefs')) || {
        emailNotif:    true,
        expReminders:  true,
        aiAlerts:      false,
        publicProfile: false,
      };
    } catch {
      return { emailNotif: true, expReminders: true, aiAlerts: false, publicProfile: false };
    }
  });

  const [toast,         setToast]         = useState('');
  const [showDelete,    setShowDelete]     = useState(false);
  const [deleteLoading, setDeleteLoading]  = useState(false);

  // Save prefs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scilabhive_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const setPref = (key) => (e) => {
    setPrefs((p) => ({ ...p, [key]: e.target.checked }));
    showToast('Preference saved');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      showToast('Failed to delete account. Please try again.');
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  return (
    <div>
      <div className="settings-page-title">Settings</div>
      <div className="settings-page-sub">Manage your preferences</div>

      <div className="settings-layout">

        {/* ── Notifications ── */}
        <div className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-title">Notifications</div>
            <div className="settings-card-sub">Choose what you want to be notified about</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Email notifications</div>
              <div className="settings-row-desc">Experiment updates sent to your email</div>
            </div>
            <Toggle checked={prefs.emailNotif} onChange={setPref('emailNotif')} />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Experiment reminders</div>
              <div className="settings-row-desc">Nudge for experiments idle over 7 days</div>
            </div>
            <Toggle checked={prefs.expReminders} onChange={setPref('expReminders')} />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">AI insight alerts</div>
              <div className="settings-row-desc">Notify when AI spots anomalies in results</div>
            </div>
            <Toggle checked={prefs.aiAlerts} onChange={setPref('aiAlerts')} />
          </div>
        </div>

        {/* ── Privacy ── */}
        <div className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-title">Privacy & Data</div>
            <div className="settings-card-sub">Control your data and visibility</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Public profile</div>
              <div className="settings-row-desc">Let other researchers find and view your profile</div>
            </div>
            <Toggle checked={prefs.publicProfile} onChange={setPref('publicProfile')} />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Export my data</div>
              <div className="settings-row-desc">Download all your experiments as CSV</div>
            </div>
            <button className="btn-ghost-sm" onClick={() => showToast('Preparing your data export…')}>
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Session ── */}
        <div className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-title">Session</div>
            <div className="settings-card-sub">Manage your active login</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Sign out</div>
              <div className="settings-row-desc">Sign out of your current session</div>
            </div>
            <button className="btn-ghost-sm" onClick={handleSignOut}>
              Sign out
            </button>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Sign out all devices</div>
              <div className="settings-row-desc">Revoke all active sessions</div>
            </div>
            <button className="btn-danger-sm" onClick={handleSignOut}>
              Sign out all
            </button>
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div className="danger-zone-card">
          <div className="danger-zone-title">Danger Zone</div>
          <div className="danger-zone-desc">
            Permanently delete your account and all data. This cannot be undone.
          </div>
          <button className="btn-danger-sm" onClick={() => setShowDelete(true)}>
            Delete account
          </button>
        </div>

      </div>

      {/* ── Delete modal ── */}
      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteAccount}
          loading={deleteLoading}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
