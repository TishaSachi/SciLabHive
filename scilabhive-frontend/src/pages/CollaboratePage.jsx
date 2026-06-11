import { useState, useEffect } from 'react';
import {
  getMyCollaborators,
  getMyInvitations,
  inviteCollaborator,
  acceptInvitation,
  declineInvitation,
  removeCollaborator,
  getExperiments,
} from '../services/api';
import './CollaboratePage.css';

const AVATAR_COLORS = ['#7c3aed','#0d9488','#d97706','#e11d48','#059669','#3b82f6'];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Toast ─────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div className="collab-toast">
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}

// ── Invite Modal ───────────────────────────────────────────
function InviteModal({ experiments, onClose, onInvited }) {
  const [email,        setEmail]        = useState('');
  const [experimentId, setExperimentId] = useState('');
  const [role,         setRole]         = useState('viewer');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const handleSubmit = async () => {
    if (!email.trim())    { setError('Email is required.');        return; }
    if (!experimentId)    { setError('Select an experiment.');     return; }
    setError('');
    setLoading(true);
    try {
      const saved = await inviteCollaborator({
        invite_email:  email.trim(),
        experiment_id: parseInt(experimentId),
        role,
      });
      onInvited(saved);
      onClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail === 'Already invited') setError('This person has already been invited.');
      else setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collab-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="collab-modal">
        <div className="collab-modal-title">Invite a Collaborator</div>
        <div className="collab-modal-sub">They'll receive an email invitation to join your workspace</div>

        <div className="invite-field">
          <label className="invite-label">Email address *</label>
          <input
            className="invite-input"
            type="email"
            placeholder="colleague@institution.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        <div className="invite-field">
          <label className="invite-label">Experiment *</label>
          <select
            className="invite-select"
            value={experimentId}
            onChange={e => setExperimentId(e.target.value)}
          >
            <option value="">Select experiment…</option>
            {experiments.map(exp => (
              <option key={exp.experiment_id} value={exp.experiment_id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>

        <div className="invite-field">
          <label className="invite-label">Role</label>
          <select className="invite-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="viewer">Viewer — can view experiments and results</option>
            <option value="contributor">Contributor — can add results</option>
            <option value="editor">Editor — can create and edit experiments</option>
          </select>
        </div>

        {error && <div className="collab-error">⚠ {error}</div>}

        <div className="collab-modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-modal-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sending…' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Incoming Invitations Modal ─────────────────────────────
function InvitationsModal({ invitations, onClose, onAccept, onDecline }) {
  return (
    <div className="collab-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="collab-modal">
        <div className="collab-modal-title">Pending Invitations</div>
        <div className="collab-modal-sub">Collaboration requests sent to you</div>

        {invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13.5 }}>
            No pending invitations
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invitations.map(inv => (
              <div key={inv.id} className="collab-card">
                <div
                  className="collab-avatar"
                  style={{ background: getAvatarColor(inv.collaborator_name) }}
                >
                  {getInitials(inv.collaborator_name)}
                </div>
                <div className="collab-info">
                  <div className="collab-name">{inv.collaborator_name || 'Unknown'}</div>
                  <div className="collab-meta">
                    invited you to <strong>{inv.experiment_title}</strong> as {inv.role}
                  </div>
                </div>
                <div className="collab-right">
                  <button className="action-btn accept" onClick={() => onAccept(inv.id)}>Accept</button>
                  <button className="action-btn" onClick={() => onDecline(inv.id)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="collab-modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main CollaboratePage ───────────────────────────────────
export default function CollaboratePage() {
  const [collaborators, setCollaborators] = useState([]);
  const [invitations,   setInvitations]   = useState([]);
  const [experiments,   setExperiments]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showInvite,    setShowInvite]    = useState(false);
  const [showIncoming,  setShowIncoming]  = useState(false);
  const [toast,         setToast]         = useState('');

  // Quick invite form state
  const [quickEmail, setQuickEmail]   = useState('');
  const [quickExpId, setQuickExpId]   = useState('');
  const [quickRole,  setQuickRole]    = useState('viewer');
  const [quickLoading, setQuickLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [collabs, invs, exps] = await Promise.all([
          getMyCollaborators(),
          getMyInvitations(),
          getExperiments(),
        ]);
        setCollaborators(collabs);
        setInvitations(invs);
        setExperiments(exps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRemove = async (collabId) => {
    try {
      await removeCollaborator(collabId);
      setCollaborators(prev => prev.filter(c => c.id !== collabId));
      showToast('Collaborator removed');
    } catch {
      showToast('Failed to remove collaborator');
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      await acceptInvitation(inviteId);
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
      showToast('Invitation accepted!');
      setShowIncoming(false);
    } catch {
      showToast('Failed to accept invitation');
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await declineInvitation(inviteId);
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
      showToast('Invitation declined');
    } catch {
      showToast('Failed to decline invitation');
    }
  };

  const handleNewInvite = (saved) => {
    setCollaborators(prev => [saved, ...prev]);
    showToast('Invitation sent!');
  };

  const handleQuickInvite = async () => {
    if (!quickEmail.trim() || !quickExpId) return;
    setQuickLoading(true);
    try {
      const saved = await inviteCollaborator({
        invite_email:  quickEmail.trim(),
        experiment_id: parseInt(quickExpId),
        role:          quickRole,
      });
      setCollaborators(prev => [saved, ...prev]);
      setQuickEmail('');
      setQuickExpId('');
      showToast('Invitation sent!');
    } catch (err) {
      const detail = err?.response?.data?.detail;
      showToast(detail === 'Already invited' ? 'Already invited!' : 'Failed to send');
    } finally {
      setQuickLoading(false);
    }
  };

  // Derived stats
  const active   = collaborators.filter(c => c.status === 'active').length;
  const pending  = collaborators.filter(c => c.status === 'pending').length;

  // Shared experiments — unique experiments that have collaborators
  const sharedExpIds  = [...new Set(collaborators.map(c => c.experiment_id))];
  const sharedExpData = sharedExpIds.map(id => ({
    id,
    title: collaborators.find(c => c.experiment_id === id)?.experiment_title || `Experiment #${id}`,
    count: collaborators.filter(c => c.experiment_id === id).length,
  }));

  if (loading) {
    return (
      <div>
        <div className="collab-page-title">Collaborate</div>
        <div className="collab-page-sub">Manage your research collaborators</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', height: 72 }}>
              <div className="skeleton" style={{ width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '25%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="collab-page-title">Collaborate</div>
      <div className="collab-page-sub">Manage your research collaborators</div>

      {/* Incoming invitations banner */}
      {invitations.length > 0 && (
        <div className="invitations-banner">
          <div className="invitations-banner-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <div className="invitations-banner-text">
              You have {invitations.length} pending invitation{invitations.length > 1 ? 's' : ''}
            </div>
            <div className="invitations-banner-sub">
              Someone invited you to collaborate on their experiments
            </div>
          </div>
          <button className="btn-view-invitations" onClick={() => setShowIncoming(true)}>
            View Invitations
          </button>
        </div>
      )}

      {/* Header row */}
      <div className="collab-header-row">
        <div className="collab-header-meta">
          {active} active · {pending} pending
        </div>
        <button className="btn-primary" onClick={() => setShowInvite(true)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Invite Collaborator
        </button>
      </div>

      <div className="collab-layout">
        {/* Left — collaborator lists */}
        <div>
          {collaborators.length === 0 ? (
            <div className="collab-empty">
              <div className="collab-empty-icon">🤝</div>
              <div className="collab-empty-title">No collaborators yet</div>
              <div className="collab-empty-sub">Invite colleagues to work on experiments together</div>
            </div>
          ) : (
            <>
              {/* Active */}
              {collaborators.filter(c => c.status === 'active').length > 0 && (
                <>
                  <div className="collab-section-label">Active</div>
                  <div className="collab-list">
                    {collaborators.filter(c => c.status === 'active').map(c => (
                      <div key={c.id} className="collab-card">
                        <div
                          className="collab-avatar"
                          style={{ background: getAvatarColor(c.collaborator_name || c.invite_email) }}
                        >
                          {getInitials(c.collaborator_name || c.invite_email)}
                        </div>
                        <div className="collab-info">
                          <div className="collab-name">{c.collaborator_name || c.invite_email}</div>
                          <div className="collab-meta">
                            {c.collaborator_email || c.invite_email}
                            {c.experiment_title && ` · ${c.experiment_title}`}
                          </div>
                        </div>
                        <div className="collab-right">
                          <span className="role-pill">{c.role}</span>
                          <span className="c-badge success">Active</span>
                          <button className="action-btn" onClick={() => handleRemove(c.id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pending */}
              {collaborators.filter(c => c.status === 'pending').length > 0 && (
                <>
                  <div className="collab-section-label">Pending Invitations</div>
                  <div className="collab-list">
                    {collaborators.filter(c => c.status === 'pending').map(c => (
                      <div key={c.id} className="collab-card">
                        <div
                          className="collab-avatar"
                          style={{ background: 'var(--text-light)' }}
                        >
                          {getInitials(c.invite_email)}
                        </div>
                        <div className="collab-info">
                          <div className="collab-name">{c.invite_email}</div>
                          <div className="collab-meta">
                            {c.experiment_title && `${c.experiment_title} · `}
                            Invited {new Date(c.invited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="collab-right">
                          <span className="role-pill">{c.role}</span>
                          <span className="c-badge warning">Pending</span>
                          <button className="action-btn" onClick={() => handleRemove(c.id)}>Cancel</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="collab-right-panel">

          {/* Quick invite */}
          <div className="panel-card">
            <div className="panel-title">Quick Invite</div>
            <div className="panel-sub">Send an invitation by email</div>
            <div className="invite-field">
              <label className="invite-label">Email</label>
              <input
                className="invite-input"
                type="email"
                placeholder="colleague@institution.edu"
                value={quickEmail}
                onChange={e => setQuickEmail(e.target.value)}
              />
            </div>
            <div className="invite-field">
              <label className="invite-label">Experiment</label>
              <select
                className="invite-select"
                value={quickExpId}
                onChange={e => setQuickExpId(e.target.value)}
              >
                <option value="">Select experiment…</option>
                {experiments.map(exp => (
                  <option key={exp.experiment_id} value={exp.experiment_id}>
                    {exp.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="invite-field">
              <label className="invite-label">Role</label>
              <select className="invite-select" value={quickRole} onChange={e => setQuickRole(e.target.value)}>
                <option value="viewer">Viewer</option>
                <option value="contributor">Contributor</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <button
              className="btn-invite"
              onClick={handleQuickInvite}
              disabled={quickLoading || !quickEmail || !quickExpId}
            >
              {quickLoading ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>

          {/* Overview stats */}
          <div className="panel-card">
            <div className="panel-title">Overview</div>
            <div className="panel-sub" style={{ marginBottom: 12 }}>Your collaboration stats</div>
            <div className="collab-stat-grid">
              <div className="collab-mini-stat">
                <div className="collab-mini-val">{active}</div>
                <div className="collab-mini-lbl">Active</div>
              </div>
              <div className="collab-mini-stat">
                <div className="collab-mini-val">{pending}</div>
                <div className="collab-mini-lbl">Pending</div>
              </div>
              <div className="collab-mini-stat">
                <div className="collab-mini-val">{sharedExpIds.length}</div>
                <div className="collab-mini-lbl">Shared Exp</div>
              </div>
              <div className="collab-mini-stat">
                <div className="collab-mini-val">{collaborators.length}</div>
                <div className="collab-mini-lbl">Total Invited</div>
              </div>
            </div>
          </div>

          {/* Shared experiments */}
          {sharedExpData.length > 0 && (
            <div className="panel-card">
              <div className="panel-title">Shared Experiments</div>
              <div className="panel-sub" style={{ marginBottom: 12 }}>Experiments with collaborators</div>
              <div className="shared-list">
                {sharedExpData.map((exp, i) => (
                  <div key={exp.id} className="shared-item">
                    <div className="shared-dot" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }} />
                    <span className="shared-title">{exp.title}</span>
                    <span className="shared-count">{exp.count} member{exp.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {showInvite && (
        <InviteModal
          experiments={experiments}
          onClose={() => setShowInvite(false)}
          onInvited={handleNewInvite}
        />
      )}

      {showIncoming && (
        <InvitationsModal
          invitations={invitations}
          onClose={() => setShowIncoming(false)}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
