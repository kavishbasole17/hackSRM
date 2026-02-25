import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function NodeDetailPanel({ node, onClose, isDone, isAccessible, onMarkDone }) {
    const [activeTab, setActiveTab] = useState('resources');
    const [content, setContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);

    useEffect(() => {
        if (!node) return;
        setActiveTab('resources');
        setContent(null);
    }, [node]);

    const fetchContent = async () => {
        if (content) { setActiveTab('content'); return; }
        setLoadingContent(true);
        setActiveTab('content');
        try {
            const res = await fetch(`${API_URL}/node/${node.id}/content`);
            if (!res.ok) throw new Error('Failed to load content');
            const data = await res.json();
            setContent(data.content || data);
        } catch {
            setContent('_Content could not be loaded. Please try again later._');
        } finally {
            setLoadingContent(false);
        }
    };

    if (!node) return null;

    const levelClass = (node.level || 'Mid').toLowerCase();
    const levelColors = {
        root: { bg: '#e8f5ee', color: '#0a8745', border: '#b8e6cc' },
        mid: { bg: '#edf4fe', color: '#1877f2', border: '#c4dcf6' },
        advanced: { bg: '#fff5e6', color: '#cc7a00', border: '#ffe0b2' },
    };
    const colors = levelColors[levelClass] || levelColors.mid;

    // Button state
    let btnClass = 'available';
    let btnLabel = 'Mark as Done';
    let btnIcon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
    if (isDone) {
        btnClass = 'completed';
        btnLabel = 'Completed';
        btnIcon = (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        );
    } else if (!isAccessible) {
        btnClass = 'locked-btn';
        btnLabel = 'Complete Prerequisites First';
        btnIcon = (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
        );
    }

    return (
        <div className="node-panel-overlay" onClick={onClose}>
            <aside className="node-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="node-panel-header">
                    <div className="node-panel-tabs">
                        <button
                            className={`panel-tab ${activeTab === 'resources' ? 'active' : ''}`}
                            onClick={() => setActiveTab('resources')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                            Resources
                        </button>
                        <button
                            className={`panel-tab ${activeTab === 'content' ? 'active' : ''}`}
                            onClick={fetchContent}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            AI Lesson
                        </button>
                    </div>
                    <div className="node-panel-actions">
                        <span className="panel-status-badge" style={{ background: colors.bg, color: colors.color, borderColor: colors.border }}>
                            {isDone ? '✓ Done' : (node.level || 'Mid')}
                        </span>
                        <button className="panel-close" onClick={onClose}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="node-panel-body">
                    <h2 className="node-panel-title">{node.title}</h2>
                    <p className="node-panel-summary">{node.summary}</p>

                    {/* Mark Done Button */}
                    <button
                        className={`mark-done-btn ${btnClass}`}
                        onClick={btnClass === 'available' ? onMarkDone : undefined}
                        disabled={btnClass !== 'available'}
                    >
                        {btnIcon}
                        {btnLabel}
                    </button>

                    {activeTab === 'resources' && (
                        <div className="node-panel-resources fade-in">
                            <div className="resource-section">
                                <h4 className="resource-label free">★ FREE RESOURCES</h4>

                                {node.video_url && (
                                    <a href={node.video_url} target="_blank" rel="noopener noreferrer" className="resource-item video">
                                        <div className="resource-icon video-icon">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                        </div>
                                        <div className="resource-info">
                                            <span className="resource-type">Video</span>
                                            <span className="resource-name">Watch: {node.title}</span>
                                        </div>
                                        <svg className="resource-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6" /></svg>
                                    </a>
                                )}

                                <a href={`https://www.google.com/search?q=${encodeURIComponent(node.title + ' tutorial')}`} target="_blank" rel="noopener noreferrer" className="resource-item">
                                    <div className="resource-icon article-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    </div>
                                    <div className="resource-info">
                                        <span className="resource-type">Article</span>
                                        <span className="resource-name">Search: {node.title}</span>
                                    </div>
                                    <svg className="resource-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6" /></svg>
                                </a>
                            </div>

                            {node.prerequisites && node.prerequisites.length > 0 && (
                                <div className="resource-section">
                                    <h4 className="resource-label prereq">⚡ PREREQUISITES</h4>
                                    <div className="prereq-list">
                                        {node.prerequisites.map((p) => (
                                            <span key={p} className="prereq-chip">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="node-panel-content fade-in">
                            {loadingContent ? (
                                <div className="loading-container" style={{ padding: '40px 0' }}>
                                    <div className="spinner" />
                                    <p className="loading-text">Generating lesson with AI...</p>
                                </div>
                            ) : (
                                <div className="lesson-content">
                                    {content && typeof content === 'string' ? (
                                        content.split('\n').map((line, i) => {
                                            if (line.startsWith('# ')) return <h2 key={i} className="lesson-h2">{line.slice(2)}</h2>;
                                            if (line.startsWith('## ')) return <h3 key={i} className="lesson-h3">{line.slice(3)}</h3>;
                                            if (line.startsWith('### ')) return <h4 key={i} className="lesson-h4">{line.slice(4)}</h4>;
                                            if (line.startsWith('- ')) return <li key={i} className="lesson-li">{line.slice(2)}</li>;
                                            if (line.startsWith('```')) return <pre key={i} className="lesson-code">{line}</pre>;
                                            if (line.trim() === '') return <br key={i} />;
                                            return <p key={i} className="lesson-p">{line}</p>;
                                        })
                                    ) : (
                                        <p className="lesson-p">{JSON.stringify(content)}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
