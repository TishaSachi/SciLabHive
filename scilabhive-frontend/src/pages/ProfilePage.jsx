import { useState, useRef } from 'react';
import { updateProfile, changePassword, uploadAvatar } from '../services/api';
import './ProfilePage.css';

// ── Avatar component ──────────────────────────────────────
function Avatar({ user, onAvatarChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB.');
      return;
    }

    setUploading(true);
    try {
      const data = await uploadAvatar(file);
      onAvatarChange(data.avatar_url);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="avatar-outer">
      <div className="avatar-circle">
        {user?.avatar_url
          ? <img src={user.avatar_url} alt="Profile" />
          : initials
        }
        {uploading && (
          <div className="avatar-uploading">
            <div className="spinner" />
          </div>
        )}
      </div>
      <label className="avatar-upload-btn" title="Upload photo">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

// ── Personal info section ─────────────────────────────────
function PersonalInfoSection({ user, onSaved }) {
  const nameParts   = user?.full_name?.split(' ') || ['', ''];
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [userRole, setUserRole]   = useState(user?.user_role || '');
  const [loading,  setLoading]    = useState(false);
  const [saved,    setSaved]      = useState(false);
  const [error,    setError]      = useState('');

  const handleSave = async () => {
    if (!firstName.trim()) { setError('First name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      const updated = await updateProfile({
        full_name:   `${firstName.trim()} ${lastName.trim()}`.trim(),
        institution: institution.trim(),
        user_role:   userRole,
      });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-title">Personal Information</div>
        <div className="section-sub">Update your name, institution and role</div>
      </div>

      <div className="section-body">
        <div className="field-row-2">
          <div className="profile-field">
            <label className="profile-label">First name</label>
            <input
              className="profile-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ada"
            />
          </div>
          <div className="profile-field">
            <label className="profile-label">Last name</label>
            <input
              className="profile-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Lovelace"
            />
          </div>
        </div>

        <div className="profile-field">
          <label className="profile-label">Email address</label>
          <input
            className="profile-input"
            value={user?.email || ''}
            disabled
          />
        </div>

        <div className="profile-field">
          <label className="profile-label">Institution / Organisation</label>
          <input
            className="profile-input"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. University of Cambridge"
          />
        </div>

        <div className="profile-field">
          <label className="profile-label">Role</label>
          <select
            className="profile-input"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
          >
            <option value="">Select role…</option>
            <option value="student">Student</option>
            <option value="researcher">Researcher</option>
            <option value="professor">Professor / Lecturer</option>
            <option value="hobbyist">Hobbyist</option>
            <option value="industry">Industry Professional</option>
          </select>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}
      </div>

      <div className="section-footer">
        {saved && <span className="success-msg">✓ Saved successfully</span>}
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

// ── Change password section ───────────────────────────────
function ChangePasswordSection() {
  const [current,  setCurrent]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  const handleUpdate = async () => {
    setError('');
    if (!current)           { setError('Please enter your current password.');    return; }
    if (newPass.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (newPass !== confirm) { setError('New passwords do not match.'); return; }

    setLoading(true);
    try {
      await changePassword({ current_password: current, new_password: newPass });
      setCurrent(''); setNewPass(''); setConfirm('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-title">Change Password</div>
        <div className="section-sub">Choose a strong password of at least 8 characters</div>
      </div>

      <div className="section-body">
        <div className="profile-field">
          <label className="profile-label">Current password</label>
          <div className="pass-wrap">
            <input
              className="profile-input"
              type={showCur ? 'text' : 'password'}
              placeholder="••••••••"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <button className="pass-toggle" onClick={() => setShowCur(s => !s)}>
              {showCur ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="field-row-2">
          <div className="profile-field">
            <label className="profile-label">New password</label>
            <div className="pass-wrap">
              <input
                className="profile-input"
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <button className="pass-toggle" onClick={() => setShowNew(s => !s)}>
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="profile-field">
            <label className="profile-label">Confirm password</label>
            <input
              className={`profile-input ${confirm && confirm !== newPass ? 'error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {confirm && confirm !== newPass && (
              <div className="error-msg">Passwords don't match</div>
            )}
          </div>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}
      </div>

      <div className="section-footer">
        {saved && <span className="success-msg">✓ Password updated</span>}
        <button className="btn-primary" onClick={handleUpdate} disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────
export default function ProfilePage({ user, onUserUpdate }) {
  const [currentUser, setCurrentUser] = useState(user);

  const handleProfileSaved = (updated) => {
    setCurrentUser(updated);
    if (onUserUpdate) onUserUpdate(updated);
  };

  const handleAvatarChange = (avatarUrl) => {
    const updated = { ...currentUser, avatar_url: avatarUrl };
    setCurrentUser(updated);
    if (onUserUpdate) onUserUpdate(updated);
  };

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const joinedDate = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div>
      <div className="profile-page-title">My Profile</div>
      <div className="profile-page-sub">Manage your account details and preferences</div>

      <div className="profile-layout">

        {/* ── Left card ── */}
        <div className="profile-left">
          <div className="profile-left-banner" />
          <div className="profile-left-body">
            <Avatar user={currentUser} onAvatarChange={handleAvatarChange} />
            <div className="profile-display-name">{currentUser?.full_name || 'Your Name'}</div>
            <div className="profile-role-pill">{currentUser?.user_role || 'Member'}</div>
            <div className="profile-institution-text">{currentUser?.institution || '—'}</div>

            <div className="profile-divider" />

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-val">—</div>
                <div className="profile-stat-lbl">Experiments</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">—</div>
                <div className="profile-stat-lbl">Results</div>
              </div>
            </div>

            <div className="profile-joined">Member since {joinedDate}</div>
          </div>
        </div>

        {/* ── Right sections ── */}
        <div className="profile-right">
          <PersonalInfoSection user={currentUser} onSaved={handleProfileSaved} />
          <ChangePasswordSection />

          {/* Danger zone */}
          <div className="danger-zone">
            <div className="danger-title">Danger Zone</div>
            <div className="danger-sub">
              Once you delete your account, all your experiments and results will be
              permanently removed. This cannot be undone.
            </div>
            <button className="btn-danger">Delete account</button>
          </div>
        </div>

      </div>
    </div>
  );
}
