import { useState } from 'react';

export default function CoursesPage({ onSelectSkill }) {
    const [searchVal, setSearchVal] = useState('');

    const suggestions = [
        { name: 'Machine Learning', color: 'blue' },
        { name: 'Web Development', color: 'green' },
        { name: 'Photography', color: 'yellow' },
        { name: 'Graphic Design', color: 'pink' },
        { name: 'Data Structures', color: 'purple' },
        { name: 'Cooking', color: 'blue' },
        { name: 'Public Speaking', color: 'green' },
        { name: '3D Modelling', color: 'yellow' },
    ];

    const recentCourses = (() => {
        try { return JSON.parse(localStorage.getItem('pathways_courses') || '[]'); } catch { return []; }
    })();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchVal.trim()) onSelectSkill(searchVal.trim());
    };

    return (
        <section className="courses-page">
            <h1 className="page-heading">Courses</h1>
            <p className="courses-subtitle">Search for any topic and we'll generate a personalized learning roadmap</p>

            {/* Search Bar */}
            <form className="courses-search" onSubmit={handleSearch}>
                <div className="courses-search-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="What would you like to learn?"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                    />
                    <button type="submit" className="courses-search-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* Suggested Topics */}
            <div className="courses-section">
                <h2>Suggested Topics</h2>
                <div className="courses-grid">
                    {suggestions.map((s) => (
                        <button
                            key={s.name}
                            className="course-topic-card"
                            onClick={() => onSelectSkill(s.name)}
                        >
                            <span className={`dot ${s.color}`} />
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent */}
            {recentCourses.length > 0 && (
                <div className="courses-section">
                    <h2>Your Course History</h2>
                    <div className="courses-history">
                        {recentCourses.map((c, i) => (
                            <button key={i} className="course-history-card" onClick={() => onSelectSkill(c.skill)}>
                                <div className="course-history-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                                    </svg>
                                </div>
                                <div className="course-history-info">
                                    <span className="course-history-name">{c.skill}</span>
                                    <span className="course-history-date">{c.date}</span>
                                </div>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="course-arrow-icon">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
