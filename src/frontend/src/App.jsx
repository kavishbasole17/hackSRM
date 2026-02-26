import { useState, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import OnboardingPage from './components/OnboardingPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import HomePage from './components/HomePage';
import CoursesPage from './components/CoursesPage';
import RoadmapView from './components/RoadmapView';
import ProfilePage from './components/ProfilePage';
import FriendsPage from './components/FriendsPage';
import Footer from './components/Footer';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacksrm-mbcr.onrender.com';


function loadCompleted() {
  try { return JSON.parse(localStorage.getItem('pathways_completed') || '{}'); } catch { return {}; }
}
function saveCompleted(map) {
  localStorage.setItem('pathways_completed', JSON.stringify(map));
}

// Migrate legacy accounts that were created before the Discord-style ID system
function migrateUser(u) {
  if (!u) return null;
  if (u.id && u.tag) return u; // Already has Discord-style fields

  // Generate missing fields
  const username = u.name || u.displayName || u.email?.split('@')[0] || 'user';
  const tag = String(Math.floor(1000 + Math.random() * 9000));
  const migrated = {
    ...u,
    id: u.id || `${username}#${tag}`,
    tag: u.tag || tag,
    username: u.username || username,
    displayName: u.displayName || u.name || username,
    avatarColor: u.avatarColor || '#e60023',
    bio: u.bio || '',
    joinDate: u.joinDate || new Date().toLocaleDateString(),
    courses: u.courses || [],
  };

  // Save migrated user
  localStorage.setItem('pathways_user', JSON.stringify(migrated));

  // Add to registry
  const registry = JSON.parse(localStorage.getItem('nia_user_registry') || '{}');
  if (!registry[migrated.id]) {
    registry[migrated.id] = migrated;
    localStorage.setItem('nia_user_registry', JSON.stringify(registry));
  }

  return migrated;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('pathways_user'));
      return migrateUser(raw);
    } catch { return null; }
  });
  const [authEmail, setAuthEmail] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSkill, setCurrentSkill] = useState('');
  const [completedNodes, setCompletedNodes] = useState(loadCompleted);

  // ─── ALL HOOKS MUST BE ABOVE ANY CONDITIONAL RETURNS ───

  const handleAuth = useCallback((authData) => {
    const registry = JSON.parse(localStorage.getItem('nia_user_registry') || '{}');
    const existingUser = Object.values(registry).find(u => u.email === authData.email);
    if (existingUser) {
      const migrated = migrateUser(existingUser);
      setUser(migrated);
      localStorage.setItem('pathways_user', JSON.stringify(migrated));
      setTimeout(() => navigate('/home', { replace: true }), 0);
    } else {
      setAuthEmail(authData.email);
    }
  }, [navigate]);

  const handleOnboardingComplete = useCallback((userProfile) => {
    setUser(userProfile);
    localStorage.setItem('pathways_user', JSON.stringify(userProfile));
    setAuthEmail(null);
    setTimeout(() => navigate('/home', { replace: true }), 0);
  }, [navigate]);

  const handleUpdateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('pathways_user', JSON.stringify(updated));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('pathways_user');
    setUser(null);
    setAuthEmail(null);
    setTimeout(() => navigate('/login', { replace: true }), 0);
  }, [navigate]);

  const generateRoadmap = useCallback(async (skill) => {
    if (!skill.trim()) return;
    setLoading(true);
    setError(null);
    setCurrentSkill(skill.trim());
    navigate('/roadmap');

    const courses = (() => { try { return JSON.parse(localStorage.getItem('pathways_courses') || '[]'); } catch { return []; } })();
    const alreadyTracked = courses.find(c => c.skill === skill.trim());
    if (!alreadyTracked) {
      const updated = [{ skill: skill.trim(), date: new Date().toLocaleDateString() }, ...courses].slice(0, 20);
      localStorage.setItem('pathways_courses', JSON.stringify(updated));

      const registry = JSON.parse(localStorage.getItem('nia_user_registry') || '{}');
      if (user && registry[user.id]) {
        registry[user.id].currentCourse = skill.trim();
        registry[user.id].courses = [...new Set([...(registry[user.id].courses || []), skill.trim()])];
        localStorage.setItem('nia_user_registry', JSON.stringify(registry));
      }
    }

    try {
      const res = await fetch(`${API_URL}/tree/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skill.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setTreeData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const markDone = useCallback((nodeId) => {
    setCompletedNodes((prev) => {
      const next = { ...prev, [nodeId]: true };
      saveCompleted(next);
      const registry = JSON.parse(localStorage.getItem('nia_user_registry') || '{}');
      if (user && registry[user.id]) {
        registry[user.id].currentNode = nodeId;
        localStorage.setItem('nia_user_registry', JSON.stringify(registry));
      }
      return next;
    });
  }, [user]);

  const isNodeAccessible = useCallback((node) => {
    if (!node.prerequisites || node.prerequisites.length === 0) return true;
    return node.prerequisites.every((pid) => completedNodes[pid]);
  }, [completedNodes]);

  const isNodeDone = useCallback((nodeId) => !!completedNodes[nodeId], [completedNodes]);

  const path = useMemo(() => location.pathname.replace(/^\//, '') || 'home', [location.pathname]);

  // ─── CONDITIONAL RETURNS (after all hooks) ───

  if (!user) {
    if (authEmail) {
      return <OnboardingPage email={authEmail} onComplete={handleOnboardingComplete} />;
    }
    return (
      <Routes>
        <Route path="*" element={<AuthPage onAuth={handleAuth} />} />
      </Routes>
    );
  }

  // ─── Logged in: main app ───
  return (
    <>
      <Sidebar active={path} />
      <main className="main-content">
        <Topbar onGenerate={generateRoadmap} loading={loading} />
        <Routes>
          <Route path="/home" element={<HomePage user={user} completedNodes={completedNodes} />} />
          <Route path="/courses" element={<CoursesPage onSelectSkill={generateRoadmap} />} />
          <Route path="/roadmap" element={
            <RoadmapView
              skill={currentSkill} data={treeData} loading={loading} error={error}
              onBack={() => navigate(-1)} onRetry={() => generateRoadmap(currentSkill)}
              completedNodes={completedNodes} markDone={markDone}
              isNodeAccessible={isNodeAccessible} isNodeDone={isNodeDone}
            />
          } />
          <Route path="/friends" element={<FriendsPage user={user} />} />
          <Route path="/profile" element={
            <ProfilePage user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} completedNodes={completedNodes} />
          } />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <Footer />
      </main>
    </>
  );
}
