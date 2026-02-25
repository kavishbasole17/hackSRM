import { useState, useEffect } from 'react';

// Helper to read registry
function getRegistry() {
    try { return JSON.parse(localStorage.getItem('nia_user_registry') || '{}'); } catch { return {}; }
}

// Load friends with migration: converts strings → objects via registry
function loadFriends() {
    try {
        const raw = JSON.parse(localStorage.getItem('pathways_friends') || '[]');
        if (!Array.isArray(raw)) return [];
        const registry = getRegistry();
        const migrated = raw.map(f => {
            if (typeof f === 'string') {
                // Legacy format: friend stored as just an ID string
                return registry[f] || { id: f, displayName: f.split('#')[0] || 'User', tag: f.split('#')[1] || '0000', avatarColor: '#7b3fe4', bio: '' };
            }
            if (f && typeof f === 'object') {
                // Ensure all required fields exist
                return {
                    id: f.id || `${f.displayName || f.name || 'user'}#0000`,
                    displayName: f.displayName || f.name || 'User',
                    tag: f.tag || '0000',
                    avatarColor: f.avatarColor || '#7b3fe4',
                    bio: f.bio || '',
                    ...f,
                };
            }
            return null;
        }).filter(Boolean);
        // Save migrated data back
        localStorage.setItem('pathways_friends', JSON.stringify(migrated));
        return migrated;
    } catch { return []; }
}

function saveFriends(list) {
    localStorage.setItem('pathways_friends', JSON.stringify(list));
}
function loadNotifications() {
    try { return JSON.parse(localStorage.getItem('pathways_notifications') || '[]'); } catch { return []; }
}
function saveNotifications(list) {
    localStorage.setItem('pathways_notifications', JSON.stringify(list));
}

// Safe accessor for display name initial
function getInitial(obj) {
    const name = obj?.displayName || obj?.name || 'U';
    return name[0]?.toUpperCase() || 'U';
}
function getName(obj) {
    return obj?.displayName || obj?.name || 'User';
}

export default function FriendsPage({ user }) {
    const [friends, setFriends] = useState(loadFriends);
    const [notifications, setNotifications] = useState(loadNotifications);
    const [friendIdInput, setFriendIdInput] = useState('');
    const [addMsg, setAddMsg] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [activeTab, setActiveTab] = useState('friends');
    const [searchResult, setSearchResult] = useState(null);

    const userId = user?.id;

    // Seed notifications on first load
    useEffect(() => {
        if (!userId) return;
        if (notifications.length === 0) {
            const registry = getRegistry();
            const demoNotifs = [];
            const regKeys = Object.keys(registry).filter(k => k !== userId);
            if (regKeys.length > 0) {
                const u1 = registry[regKeys[0]];
                if (u1?.currentCourse) {
                    demoNotifs.push({ id: 1, type: 'course', friendName: getName(u1), message: `started learning ${u1.currentCourse}`, time: '10 min ago', read: false });
                }
            }
            if (regKeys.length > 1) {
                const u2 = registry[regKeys[1]];
                if (u2?.currentNode) {
                    demoNotifs.push({ id: 2, type: 'progress', friendName: getName(u2), message: `completed ${u2.currentNode}`, time: '1 hour ago', read: false });
                }
            }
            if (demoNotifs.length > 0) {
                setNotifications(demoNotifs);
                saveNotifications(demoNotifs);
            }
        }
    }, [userId]);

    // Guard
    if (!user) return null;

    const searchUser = () => {
        const id = friendIdInput.trim();
        if (!id) return;
        if (id === user.id) { setAddMsg({ type: 'error', text: "That's you!" }); setSearchResult(null); return; }

        const registry = getRegistry();
        const found = registry[id];
        if (found) {
            setSearchResult(found);
            setAddMsg(null);
        } else {
            setSearchResult(null);
            setAddMsg({ type: 'error', text: `No user found with ID "${id}"` });
        }
    };

    const addFriend = (friendProfile) => {
        if (friends.find(f => f.id === friendProfile.id)) {
            setAddMsg({ type: 'error', text: 'Already in your friends list' });
            return;
        }

        const updated = [...friends, friendProfile];
        setFriends(updated);
        saveFriends(updated);
        setFriendIdInput('');
        setSearchResult(null);
        setAddMsg({ type: 'success', text: `${getName(friendProfile)} added as a friend!` });

        const newNotif = {
            id: Date.now(), type: 'friend', friendName: getName(friendProfile),
            message: 'is now your friend', time: 'just now', read: false
        };
        const updatedNotifs = [newNotif, ...notifications];
        setNotifications(updatedNotifs);
        saveNotifications(updatedNotifs);

        setTimeout(() => setAddMsg(null), 3000);
    };

    const removeFriend = (friendId) => {
        const updated = friends.filter(f => f.id !== friendId);
        setFriends(updated);
        saveFriends(updated);
        if (selectedFriend?.id === friendId) setSelectedFriend(null);
    };

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        saveNotifications(updated);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Get demo user IDs for suggestions
    const registry = getRegistry();
    const suggestedIds = Object.keys(registry)
        .filter(k => k !== user.id && !friends.find(f => f.id === k))
        .slice(0, 4);

    return (
        <section className="friends-page">
            <h1 className="page-heading">Friends</h1>

            {/* Tabs */}
            <div className="friends-tabs">
                <button className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    Friends ({friends.length})
                </button>
                <button className={`friends-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                    Notifications
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>
            </div>

            {/* Friends Tab */}
            {activeTab === 'friends' && (
                <div className="friends-content">
                    {/* Add Friend */}
                    <div className="add-friend-card">
                        <h3>Add a Friend</h3>
                        <p>Enter their full ID (e.g. <code>username#1234</code>) to find and add them</p>
                        <div className="add-friend-row">
                            <input
                                type="text"
                                placeholder="username#1234"
                                value={friendIdInput}
                                onChange={(e) => { setFriendIdInput(e.target.value); setSearchResult(null); setAddMsg(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                            />
                            <button onClick={searchUser}>Search</button>
                        </div>
                        {addMsg && <p className={`add-msg ${addMsg.type}`}>{addMsg.text}</p>}

                        {/* Search Result Card */}
                        {searchResult && (
                            <div className="search-result-card">
                                <div className="search-result-left">
                                    <div className="friend-avatar" style={{ background: searchResult.avatarColor || 'var(--red)', color: '#fff' }}>
                                        {getInitial(searchResult)}
                                    </div>
                                    <div className="search-result-info">
                                        <span className="friend-name">
                                            {getName(searchResult)}
                                            <span className="discord-tag">#{searchResult.tag || '0000'}</span>
                                        </span>
                                        <span className="search-result-bio">{searchResult.bio || 'No bio'}</span>
                                    </div>
                                </div>
                                <button className="add-result-btn" onClick={() => addFriend(searchResult)}>
                                    + Add Friend
                                </button>
                            </div>
                        )}

                        {/* Suggested IDs */}
                        {suggestedIds.length > 0 && (
                            <div className="demo-ids">
                                <span className="demo-label">Try these IDs:</span>
                                {suggestedIds.map(id => (
                                    <button key={id} className="demo-id-chip" onClick={() => { setFriendIdInput(id); setSearchResult(null); }}>
                                        {id}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Friends List */}
                    <div className="friends-list">
                        {friends.map(friend => {
                            // Refresh friend data from registry for live updates
                            const live = registry[friend.id] || friend;
                            return (
                                <div
                                    key={friend.id}
                                    className={`friend-card ${selectedFriend?.id === friend.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedFriend(selectedFriend?.id === friend.id ? null : live)}
                                >
                                    <div className="friend-left">
                                        <div className="friend-avatar" style={{ background: live.avatarColor || 'var(--bg-warm)', color: live.avatarColor ? '#fff' : 'var(--text)' }}>
                                            {getInitial(live)}
                                            <span className={`status-dot ${live.currentCourse ? 'online' : 'offline'}`} />
                                        </div>
                                        <div className="friend-meta">
                                            <span className="friend-name">
                                                {getName(live)}
                                                <span className="discord-tag">#{live.tag || '0000'}</span>
                                            </span>
                                            <span className="friend-id">{live.bio || 'No bio'}</span>
                                        </div>
                                    </div>
                                    <div className="friend-right">
                                        {live.currentCourse ? (
                                            <span className="friend-activity-badge">
                                                <span className="pulse-dot" />
                                                Learning
                                            </span>
                                        ) : (
                                            <span className="friend-idle-badge">Idle</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {friends.length === 0 && (
                            <div className="empty-state">
                                <p>No friends yet. Search for a user by their ID above!</p>
                            </div>
                        )}
                    </div>

                    {/* Selected Friend Detail */}
                    {selectedFriend && (
                        <div className="friend-detail-card">
                            <div className="friend-detail-header">
                                <div className="friend-avatar lg" style={{ background: selectedFriend.avatarColor || 'var(--bg-warm)', color: selectedFriend.avatarColor ? '#fff' : 'var(--text)' }}>
                                    {getInitial(selectedFriend)}
                                    <span className={`status-dot ${selectedFriend.currentCourse ? 'online' : 'offline'}`} />
                                </div>
                                <div>
                                    <h3>
                                        {getName(selectedFriend)}
                                        <span className="discord-tag" style={{ fontSize: 14 }}>#{selectedFriend.tag || '0000'}</span>
                                    </h3>
                                    <p className="friend-detail-email">{selectedFriend.bio || 'No bio'}</p>
                                    <p className="friend-detail-joined">Joined {selectedFriend.joinDate || 'recently'} · {selectedFriend.email || ''}</p>
                                </div>
                            </div>

                            {/* Courses */}
                            {selectedFriend.courses && selectedFriend.courses.length > 0 && (
                                <div className="friend-courses-list">
                                    <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Courses ({selectedFriend.courses.length})
                                    </h4>
                                    {selectedFriend.courses.map((c, i) => (
                                        <span key={i} className="friend-course-chip">{c}</span>
                                    ))}
                                </div>
                            )}

                            {selectedFriend.currentCourse ? (
                                <div className="friend-course-info">
                                    <h4>Currently Learning</h4>
                                    <div className="friend-course-card">
                                        <div className="friend-course-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="friend-course-name">{selectedFriend.currentCourse}</span>
                                            <span className="friend-course-node">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="3" /></svg>
                                                Currently on: <strong>{selectedFriend.currentNode || 'Unknown'}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="friend-course-info">
                                    <p className="friend-idle-text">Not currently learning anything</p>
                                </div>
                            )}

                            <button className="remove-friend-btn" onClick={(e) => { e.stopPropagation(); removeFriend(selectedFriend.id); }}>
                                Remove Friend
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="notifications-content">
                    {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={markAllRead}>Mark all as read</button>
                    )}
                    <div className="notifications-list">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`notif-item ${notif.read ? '' : 'unread'}`}>
                                <div className="notif-icon-wrap">
                                    {notif.type === 'course' && (
                                        <div className="notif-icon blue">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                                        </div>
                                    )}
                                    {notif.type === 'progress' && (
                                        <div className="notif-icon green">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                    )}
                                    {notif.type === 'friend' && (
                                        <div className="notif-icon purple">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="notif-body">
                                    <p><strong>{notif.friendName}</strong> {notif.message}</p>
                                    <span className="notif-time">{notif.time}</span>
                                </div>
                                {!notif.read && <span className="unread-dot" />}
                            </div>
                        ))}
                        {notifications.length === 0 && (
                            <div className="empty-state">
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
