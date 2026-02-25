import { useState, useRef, useEffect, useMemo } from 'react';
import NodeDetailPanel from './NodeDetailPanel';

/* ────────── SVG Icons ────────── */
const ICONS = [
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /></svg>,
];

/* ────────── DAG Layout Engine ────────── */
function buildDagLayout(nodes) {
    if (!nodes || nodes.length === 0) return { layers: [], positions: {}, edges: [] };

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // Assign depths via BFS (topological layers)
    const depth = {};
    const children = {};
    nodes.forEach(n => {
        children[n.id] = [];
        if (!n.prerequisites || n.prerequisites.length === 0) {
            depth[n.id] = 0;
        }
    });

    // Build reverse map: parent → children
    nodes.forEach(n => {
        (n.prerequisites || []).forEach(pId => {
            if (children[pId]) children[pId].push(n.id);
        });
    });

    // BFS to assign depths
    let changed = true;
    while (changed) {
        changed = false;
        nodes.forEach(n => {
            if (depth[n.id] !== undefined) return;
            const prereqs = n.prerequisites || [];
            if (prereqs.every(p => depth[p] !== undefined)) {
                depth[n.id] = Math.max(...prereqs.map(p => depth[p])) + 1;
                changed = true;
            }
        });
    }
    // Fallback for any unassigned
    nodes.forEach(n => { if (depth[n.id] === undefined) depth[n.id] = 0; });

    // Group nodes by layer
    const layerMap = {};
    nodes.forEach(n => {
        const d = depth[n.id];
        if (!layerMap[d]) layerMap[d] = [];
        layerMap[d].push(n);
    });
    const maxDepth = Math.max(...Object.keys(layerMap).map(Number));
    const layers = [];
    for (let i = 0; i <= maxDepth; i++) {
        layers.push(layerMap[i] || []);
    }

    // Calculate positions
    const NODE_W = 180;
    const NODE_H = 120;
    const GAP_X = 60;
    const GAP_Y = 100;
    const positions = {};

    layers.forEach((layer, layerIdx) => {
        const totalWidth = layer.length * NODE_W + (layer.length - 1) * GAP_X;
        const startX = -totalWidth / 2 + NODE_W / 2;
        layer.forEach((node, idx) => {
            positions[node.id] = {
                x: startX + idx * (NODE_W + GAP_X),
                y: layerIdx * (NODE_H + GAP_Y),
                layer: layerIdx,
            };
        });
    });

    // Build edges
    const edges = [];
    nodes.forEach(n => {
        (n.prerequisites || []).forEach(pId => {
            if (positions[pId] && positions[n.id]) {
                edges.push({ from: pId, to: n.id });
            }
        });
    });

    return { layers, positions, edges };
}

/* ────────── Utility ────────── */
const levelColor = (level) => {
    const l = (level || 'Mid').toLowerCase();
    if (l === 'root') return { accent: '#0a8745', bg: '#e8f5ee', border: '#b8e6cc' };
    if (l === 'advanced') return { accent: '#cc7a00', bg: '#fff5e6', border: '#ffe0b2' };
    return { accent: '#1877f2', bg: '#edf4fe', border: '#c4dcf6' };
};

/* ────────── Main Component ────────── */
export default function RoadmapView({ skill, data, loading, error, onBack, onRetry, completedNodes, markDone, isNodeAccessible, isNodeDone }) {
    const [selectedNode, setSelectedNode] = useState(null);
    const containerRef = useRef(null);
    const orderedNodes = data?.nodes || [];

    const { layers, positions, edges } = useMemo(() => buildDagLayout(orderedNodes), [orderedNodes]);

    const NODE_W = 180;
    const NODE_H = 120;
    const doneCount = orderedNodes.filter(n => isNodeDone(n.id)).length;

    // Calculate SVG canvas size
    const allX = Object.values(positions).map(p => p.x);
    const allY = Object.values(positions).map(p => p.y);
    const minX = Math.min(...allX, 0) - NODE_W / 2 - 40;
    const maxX = Math.max(...allX, 0) + NODE_W / 2 + 40;
    const maxY = Math.max(...allY, 0) + NODE_H + 60;
    const svgW = maxX - minX;
    const svgH = maxY + 40;
    const offsetX = -minX;

    return (
        <section className="roadmap-view">
            <div className="roadmap-layout">
                {/* Left sidebar: Learning Path */}
                <aside className="learning-path-sidebar">
                    <p className="lp-label">LEARNING PATH</p>
                    <div>
                        {orderedNodes.map((node) => {
                            const done = isNodeDone(node.id);
                            const accessible = isNodeAccessible(node);
                            const stateClass = done ? 'done' : !accessible ? 'locked' : '';
                            return (
                                <div
                                    key={node.id}
                                    className={`lp-item ${stateClass} ${selectedNode?.id === node.id ? 'active' : ''}`}
                                    onClick={() => (accessible || done) ? setSelectedNode(node) : null}
                                >
                                    <span className="lp-item-name" title={node.title}>{node.title}</span>
                                    <span className={`lp-badge ${done ? 'done-badge' : !accessible ? 'locked-badge' : 'progress'}`}>
                                        {done ? '✓' : !accessible ? '🔒' : node.level || 'Mid'}
                                    </span>
                                </div>
                            );
                        })}
                        {loading && <p style={{ fontSize: 11, color: 'var(--text-muted)', padding: '12px' }}>Loading...</p>}
                    </div>
                </aside>

                {/* Center: DAG */}
                <div className="roadmap-center">
                    <button className="back-btn" onClick={onBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="roadmap-title">{skill}</h1>
                    <p className="roadmap-subtitle">
                        {orderedNodes.length > 0 ? `${doneCount} of ${orderedNodes.length} completed` : 'Generating...'}
                    </p>

                    {loading && (
                        <div className="loading-container">
                            <div className="spinner" />
                            <p className="loading-text">Building your personalized roadmap...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-container">
                            <p>⚠️ {error}</p>
                            <button className="retry-btn" onClick={onRetry}>Retry</button>
                        </div>
                    )}

                    {!loading && !error && data && orderedNodes.length > 0 && (
                        <div className="dag-canvas" ref={containerRef}>
                            {/* SVG Connections */}
                            <svg
                                className="dag-svg"
                                width={svgW}
                                height={svgH}
                                viewBox={`0 0 ${svgW} ${svgH}`}
                                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                            >
                                {edges.map(({ from, to }, i) => {
                                    const p1 = positions[from];
                                    const p2 = positions[to];
                                    if (!p1 || !p2) return null;
                                    const x1 = p1.x + offsetX;
                                    const y1 = p1.y + 70; // bottom of parent node icon
                                    const x2 = p2.x + offsetX;
                                    const y2 = p2.y + 8;  // top of child node
                                    const midY = (y1 + y2) / 2;
                                    const bothDone = isNodeDone(from) && isNodeDone(to);
                                    const parentDone = isNodeDone(from);

                                    return (
                                        <g key={`${from}-${to}`}>
                                            {/* Glow line */}
                                            {parentDone && (
                                                <path
                                                    d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                                                    fill="none"
                                                    stroke={bothDone ? '#0a8745' : '#c6e8d5'}
                                                    strokeWidth="6"
                                                    opacity="0.25"
                                                    strokeLinecap="round"
                                                />
                                            )}
                                            {/* Main line */}
                                            <path
                                                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                                                fill="none"
                                                stroke={bothDone ? '#0a8745' : parentDone ? '#94d3a8' : '#ddd8d2'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                style={{ transition: 'stroke 0.4s ease' }}
                                            />
                                            {/* Arrow dot at target */}
                                            <circle
                                                cx={x2}
                                                cy={y2}
                                                r="3"
                                                fill={bothDone ? '#0a8745' : parentDone ? '#94d3a8' : '#ddd8d2'}
                                                style={{ transition: 'fill 0.4s ease' }}
                                            />
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Node Elements */}
                            {orderedNodes.map((node, i) => {
                                const pos = positions[node.id];
                                if (!pos) return null;
                                const done = isNodeDone(node.id);
                                const accessible = isNodeAccessible(node);
                                const lc = levelColor(node.level);
                                const isSelected = selectedNode?.id === node.id;

                                return (
                                    <div
                                        key={node.id}
                                        className={`dag-node ${done ? 'done' : !accessible ? 'locked' : ''} ${isSelected ? 'selected' : ''} fade-in fade-in-delay-${Math.min(i + 1, 5)}`}
                                        style={{
                                            position: 'absolute',
                                            left: pos.x + offsetX - NODE_W / 2,
                                            top: pos.y,
                                            width: NODE_W,
                                        }}
                                        onClick={() => (accessible || done) ? setSelectedNode(node) : null}
                                    >
                                        <div
                                            className="dag-node-icon"
                                            style={done ? {
                                                background: '#e8f5ee',
                                                borderColor: '#0a8745',
                                                color: '#0a8745',
                                            } : accessible ? {
                                                background: lc.bg,
                                                borderColor: lc.border,
                                                color: lc.accent,
                                            } : {}}
                                        >
                                            {!accessible && !done ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22, color: '#b0b0b0', opacity: 0.6 }}>
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                                </svg>
                                            ) : ICONS[i % ICONS.length]}
                                            {done && <div className="done-check">✓</div>}
                                        </div>
                                        <span className="dag-node-label" style={{ color: done ? '#0a8745' : accessible ? lc.accent : '#b0b0b0' }}>
                                            {done ? 'DONE' : !accessible ? 'LOCKED' : (node.level || 'Mid').toUpperCase()}
                                        </span>
                                        <span className="dag-node-title">{node.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right sidebar: Community */}
                <aside className="community-panel">
                    <div className="community-header">
                        <h3>Friends</h3>
                        <span className="live-badge">LIVE • 17</span>
                    </div>
                    <table className="community-table">
                        <thead><tr><th>USER</th><th>PROGRESS</th><th>STATUS</th></tr></thead>
                        <tbody>
                            <tr><td><span className="dot green" />Amar</td><td>Array ...</td><td className="status-done">✓</td></tr>
                            <tr><td><span className="dot green" />Akbar</td><td>Graphs</td><td className="status-done">✓</td></tr>
                            <tr><td><span className="dot blue" />Anthony</td><td>DP</td><td className="status-progress">●</td></tr>
                            <tr><td><span className="dot gray" />Jamal</td><td>Tries</td><td className="status-idle">○</td></tr>
                            <tr><td><span className="dot green" />Anonymous</td><td>Linked ...</td><td className="status-done">✓</td></tr>
                        </tbody>
                    </table>
                    <div className="daily-goal">
                        <div className="goal-header"><span>Daily Goal</span><span>{doneCount}/5</span></div>
                        <div className="goal-bar"><div className="goal-fill" style={{ width: `${Math.min(doneCount / 5 * 100, 100)}%` }} /></div>
                    </div>
                    <button className="share-btn">SHARE PROGRESS</button>
                </aside>
            </div>

            {/* Node Detail Panel */}
            {selectedNode && (
                <NodeDetailPanel
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    isDone={isNodeDone(selectedNode.id)}
                    isAccessible={isNodeAccessible(selectedNode)}
                    onMarkDone={() => markDone(selectedNode.id)}
                />
            )}
        </section>
    );
}
