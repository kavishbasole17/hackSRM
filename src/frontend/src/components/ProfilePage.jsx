import { useState } from 'react';

const AVATAR_COLORS = [
    '#e60023', '#1877f2', '#0a8745', '#cc7a00', '#7c3aed',
    '#0891b2', '#dc2626', '#4f46e5', '#059669', '#d97706',
];

export default function ProfilePage({ user, onLogout, onUpdateUser, completedNodes }) {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(user.displayName || user.name || '');
    const [editBio, setEditBio] = useState(user.bio || '');
    const [editColor, setEditColor] = useState(user.avatarColor || '#e60023');
    const [copied, setCopied] = useState(false);

    const totalCompleted = Object.keys(completedNodes || {}).length;

    const copyId = () => {
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveEdits = () => {
        const updatedUser = {
            ...user,
            displayName: editName.trim() || user.displayName,
            bio: editBio.trim(),
            avatarColor: editColor,
        };
        // Update registry
        const registry = JSON.parse(localStorage.getItem('nia_user_registry') || '{}');
        registry[user.id] = updatedUser;
        localStorage.setItem('nia_user_registry', JSON.stringify(registry));
        onUpdateUser(updatedUser);
        setEditing(false);
    };

    const courses = (() => {
        try { return JSON.parse(localStorage.getItem('pathways_courses') || '[]'); } catch { return []; }
    })();
    const friendCount = (() => {
        try { return JSON.parse(localStorage.getItem('pathways_friends') || '[]').length; } catch { return 0; }
    })();

    return (
        <section className="profile-page">
            <div className="page-heading-row">
                <h1 className="page-heading">Profile</h1>
                {!editing && (
                    <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-avatar-lg" style={{ background: user.avatarColor || '#e60023' }}>
                    {(user.displayName || user.name || 'U')[0].toUpperCase()}
                </div>
                <div className="profile-info">
                    {editing ? (
                        <>
                            <div className="auth-field" style={{ marginBottom: 10 }}>
                                <label>Display Name</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={24} />
                            </div>
                            <div className="auth-field" style={{ marginBottom: 10 }}>
                                <label>Bio</label>
                                <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} maxLength={100} placeholder="Tell us about yourself..." />
                            </div>
                            <div className="auth-field" style={{ marginBottom: 14 }}>
                                <label>Avatar Color</label>
                                <div className="color-picker">
                                    {AVATAR_COLORS.map(c => (
                                        <button
                                            key={c} type="button"
                                            className={`color-swatch ${editColor === c ? 'active' : ''}`}
                                            style={{ background: c }}
                                            onClick={() => setEditColor(c)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="auth-submit" style={{ padding: '8px 20px', fontSize: 13, width: 'auto' }} onClick={saveEdits}>Save</button>
                                <button className="remove-friend-btn" onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="profile-name">
                                {user.displayName || user.name || 'User'}
                                <span className="discord-tag" style={{ fontSize: 16 }}>#{user.tag}</span>
                            </h2>
                            <p className="profile-bio">{user.bio || 'No bio yet'}</p>
                            <p className="profile-email">{user.email} · Joined {user.joinDate || 'recently'}</p>
                            <div className="profile-id-row">
                                <span className="profile-id-label">Your ID</span>
                                <div className="profile-id-box" onClick={copyId}>
                                    <code>{user.id}</code>
                                    <span className="copy-hint">{copied ? '✓ Copied!' : 'Click to copy'}</span>
                                </div>
                            </div>
                            <p className="profile-id-tip">Share this ID with friends so they can add you (like Discord!)</p>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{totalCompleted}</span>
                    <span className="stat-label">Nodes Done</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{courses.length}</span>
                    <span className="stat-label">Courses</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{friendCount}</span>
                    <span className="stat-label">Friends</span>
                </div>
            </div>

            {/* Courses History */}
            {courses.length > 0 && (
                <div className="profile-section">
                    <h3>Course History</h3>
                    <div className="course-history">
                        {courses.map((c, i) => (
                            <div key={i} className="history-item">
                                <div className="history-dot" />
                                <div className="history-info">
                                    <span className="history-skill">{c.skill}</span>
                                    <span className="history-time">{c.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Logout */}
            <button className="logout-btn" onClick={onLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
            </button>
        </section>
    );
}
