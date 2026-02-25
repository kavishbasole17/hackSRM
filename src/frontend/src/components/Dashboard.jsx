export default function Dashboard({ onSelectSkill }) {
    const recentRoadmaps = [
        { skill: 'Data Structures', percent: 70, color: 'blue', icon: 'grid' },
        { skill: 'Frontend Engineering', percent: 45, color: 'green', icon: 'monitor' },
        { skill: 'System Design', percent: 12, color: 'pink', icon: 'file' },
    ];

    const courses = [
        { skill: 'Advanced Algorithms', lessons: 24, level: 'Beginner' },
        { skill: 'SQL Masterclass', lessons: 18, level: 'Intermediate' },
    ];

    const suggestions = [
        { name: 'Badminton', color: 'blue' },
        { name: 'Baking', color: 'green' },
        { name: 'Photography', color: 'yellow' },
        { name: 'Graphic Design', color: 'pink' },
        { name: '3D Modelling', color: 'purple' },
    ];

    const iconMap = {
        grid: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        monitor: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        file: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    };

    const accentVar = { blue: 'var(--blue)', green: 'var(--green)', pink: 'var(--red)' };

    return (
        <section className="dashboard">
            <div className="dashboard-grid">
                {/* Left Column */}
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 4 }}>Node-It-All</h1>
                    <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>Your personalized learning roadmap engine</p>
                    <div className="section-header">
                        <h2>Recent Roadmaps</h2>
                        <a href="#" className="view-all">View all</a>
                    </div>
                    <div className="roadmap-cards">
                        {recentRoadmaps.map((r, i) => (
                            <div
                                key={r.skill}
                                className={`roadmap-card fade-in fade-in-delay-${i + 1}`}
                                onClick={() => onSelectSkill(r.skill)}
                            >
                                <div className="card-top">
                                    <div className={`card-icon ${r.color}`}>{iconMap[r.icon]}</div>
                                    <span className="card-percent">{r.percent}% Complete</span>
                                </div>
                                <h3 className="card-title">{r.skill}</h3>
                                <div className="card-progress">
                                    <div
                                        className="card-progress-fill"
                                        style={{ width: `${r.percent}%`, background: accentVar[r.color] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="section-title">Recommended Courses</h2>
                    <div className="course-list">
                        {courses.map((c, i) => (
                            <div
                                key={c.skill}
                                className={`course-card fade-in fade-in-delay-${i + 3}`}
                                onClick={() => onSelectSkill(c.skill)}
                            >
                                <div className="course-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </div>
                                <div className="course-info">
                                    <h4>{c.skill}</h4>
                                    <span>{c.lessons} Lessons &bull; {c.level}</span>
                                </div>
                                <svg className="course-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <h2 className="section-title" style={{ marginTop: 0 }}>Suggested Topics</h2>
                    <ul className="suggested-list">
                        {suggestions.map((s) => (
                            <li key={s.name} onClick={() => onSelectSkill(s.name)}>
                                <span className={`dot ${s.color}`} />
                                {s.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
