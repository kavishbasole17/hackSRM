import { useState } from 'react';

const AVATAR_COLORS = [
    '#e60023', '#1877f2', '#0a8745', '#cc7a00', '#7c3aed',
    '#0891b2', '#dc2626', '#4f46e5', '#059669', '#d97706',
];

export default function OnboardingPage({ email, onComplete }) {
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (trimmed.length < 3) {
            setError('Username must be at least 3 characters (letters, numbers, underscores)');
            return;
        }
        if (trimmed.length > 16) {
            setError('Username must be 16 characters or less');
            return;
        }

        // Generate a Discord-style unique tag
        const tag = String(Math.floor(1000 + Math.random() * 9000));
        const userId = `${trimmed}#${tag}`;

        // Check if username#tag already exists in registry
        const registry = JSON.parse(localStorage.getItem('nia_user_registry') || '{}');
        if (registry[userId]) {
            setError('This username is taken. Try a different one!');
            return;
        }

        // Build full user profile
        const userProfile = {
            id: userId,
            username: trimmed,
            tag,
            displayName: username.trim(),
            email,
            bio: bio.trim() || 'Learning something new every day 🚀',
            avatarColor,
            joinDate: new Date().toLocaleDateString(),
            courses: [],
            currentCourse: null,
            currentNode: null,
        };

        // Register this user in the global registry
        registry[userId] = userProfile;
        localStorage.setItem('nia_user_registry', JSON.stringify(registry));

        // Seed some demo users if registry is small
        if (Object.keys(registry).length <= 1) {
            const demoUsers = [
                { id: 'amar#7291', username: 'amar', tag: '7291', displayName: 'Amar', email: 'amar@email.com', bio: 'ML enthusiast', avatarColor: '#1877f2', joinDate: '2/12/2026', courses: ['Machine Learning'], currentCourse: 'Machine Learning', currentNode: 'Neural Networks' },
                { id: 'akbar#3842', username: 'akbar', tag: '3842', displayName: 'Akbar', email: 'akbar@email.com', bio: 'Loves Python 🐍', avatarColor: '#0a8745', joinDate: '1/25/2026', courses: ['Python', 'Data Structures'], currentCourse: 'Python', currentNode: 'Functions in Python' },
                { id: 'anthony#9054', username: 'anthony', tag: '9054', displayName: 'Anthony', email: 'anthony@email.com', bio: 'Frontend dev', avatarColor: '#7c3aed', joinDate: '2/1/2026', courses: [], currentCourse: null, currentNode: null },
                { id: 'jamal#5127', username: 'jamal', tag: '5127', displayName: 'Jamal', email: 'jamal@email.com', bio: 'DSA grinder 💪', avatarColor: '#cc7a00', joinDate: '2/20/2026', courses: ['Data Structures'], currentCourse: 'Data Structures', currentNode: 'Binary Search Trees' },
            ];
            demoUsers.forEach(u => { registry[u.id] = u; });
            localStorage.setItem('nia_user_registry', JSON.stringify(registry));
        }

        onComplete(userProfile);
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <div className="auth-logo" style={{ background: avatarColor }}>
                        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>
                            {username ? username[0].toUpperCase() : '?'}
                        </span>
                    </div>
                    <h1>Set up your profile</h1>
                    <p>Choose a unique username — this is how friends will find you</p>
                </div>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    {/* Username */}
                    <div className="auth-field">
                        <label>Username</label>
                        <div className="username-input-wrap">
                            <input
                                type="text"
                                placeholder="e.g. alex_dev"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                maxLength={16}
                                autoFocus
                            />
                            <span className="username-preview">
                                {username.trim() ? `${username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')}#????` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Avatar Color */}
                    <div className="auth-field">
                        <label>Avatar Color</label>
                        <div className="color-picker">
                            {AVATAR_COLORS.map(c => (
                                <button
                                    key={c} type="button"
                                    className={`color-swatch ${avatarColor === c ? 'active' : ''}`}
                                    style={{ background: c }}
                                    onClick={() => setAvatarColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="auth-field">
                        <label>Bio <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>(optional)</span></label>
                        <input
                            type="text"
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    {/* Preview */}
                    <div className="profile-preview">
                        <div className="preview-label">Preview</div>
                        <div className="preview-card">
                            <div className="preview-avatar" style={{ background: avatarColor }}>
                                {username ? username[0].toUpperCase() : '?'}
                            </div>
                            <div className="preview-info">
                                <span className="preview-name">
                                    {username.trim() || 'username'}
                                    <span className="preview-tag">#????</span>
                                </span>
                                <span className="preview-bio">{bio || 'Learning something new every day 🚀'}</span>
                            </div>
                        </div>
                    </div>

                    {error && <p className="add-msg error">{error}</p>}

                    <button type="submit" className="auth-submit">
                        Create Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
