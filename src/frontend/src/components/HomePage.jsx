import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage({ user, completedNodes }) {
    const navigate = useNavigate();
    const courses = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('pathways_courses') || '[]'); } catch { return []; }
    }, []);

    const friends = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('pathways_friends') || '[]'); } catch { return []; }
    }, []);

    const totalDone = Object.keys(completedNodes || {}).length;
    const displayName = user?.displayName || user?.name || 'there';

    return (
        <section className="home-page">
            <div className="home-hero">
                <div className="home-avatar" style={{ background: user?.avatarColor || 'var(--red)' }}>
                    {displayName[0].toUpperCase()}
                </div>
                <div>
                    <h1 className="home-greeting">Welcome back, {displayName}!</h1>
                    <p className="home-subtitle">Here's your learning snapshot</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="home-stats">
                <div className="home-stat-card">
                    <div className="home-stat-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="home-stat-val">{courses.length}</span>
                        <span className="home-stat-lbl">Courses</span>
                    </div>
                </div>
                <div className="home-stat-card">
                    <div className="home-stat-icon green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <span className="home-stat-val">{totalDone}</span>
                        <span className="home-stat-lbl">Nodes Done</span>
                    </div>
                </div>
                <div className="home-stat-card">
                    <div className="home-stat-icon purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                    </div>
                    <div>
                        <span className="home-stat-val">{friends.length}</span>
                        <span className="home-stat-lbl">Friends</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="home-section">
                <h2>Quick Actions</h2>
                <div className="home-actions">
                    <button className="home-action-card" onClick={() => navigate('/courses')}>
                        <div className="home-action-icon" style={{ background: 'var(--red)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="20" height="20">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <span>Explore Courses</span>
                    </button>
                    <button className="home-action-card" onClick={() => navigate('/friends')}>
                        <div className="home-action-icon" style={{ background: 'var(--blue)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="20" height="20">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <span>Add Friends</span>
                    </button>
                    <button className="home-action-card" onClick={() => navigate('/profile')}>
                        <div className="home-action-icon" style={{ background: 'var(--green)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="20" height="20">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <span>My Profile</span>
                    </button>
                </div>
            </div>

            {/* Recent Courses */}
            {courses.length > 0 && (
                <div className="home-section">
                    <h2>Recent Activity</h2>
                    <div className="home-recent">
                        {courses.slice(0, 5).map((c, i) => (
                            <div key={i} className="home-recent-item">
                                <div className="home-recent-dot" />
                                <span className="home-recent-skill">{c.skill}</span>
                                <span className="home-recent-date">{c.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
