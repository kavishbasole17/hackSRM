import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import AuthPage from "./components/AuthPage";
import OnboardingPage from "./components/OnboardingPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import HomePage from "./components/HomePage";
import CoursesPage from "./components/CoursesPage";
import RoadmapView from "./components/RoadmapView";
import ProfilePage from "./components/ProfilePage";
import FriendsPage from "./components/FriendsPage";
import Footer from "./components/Footer";
import "./index.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://hacksrm-mbcr.onrender.com";

function loadCompleted() {
  try {
    return JSON.parse(localStorage.getItem("pathways_completed") || "{}");
  } catch {
    return {};
  }
}

function migrateUser(u) {
  if (!u) return null;
  if (u.id && u.tag) return u;

  const username = u.name || u.displayName || u.email?.split("@")[0] || "user";
  const tag = String(Math.floor(1000 + Math.random() * 9000));

  const migrated = {
    ...u,
    id: u.id || `${username}#${tag}`,
    tag,
    username,
    displayName: username,
    avatarColor: "#e60023",
    bio: "",
    joinDate: new Date().toLocaleDateString(),
    courses: [],
  };

  localStorage.setItem("pathways_user", JSON.stringify(migrated));
  return migrated;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("pathways_user"));
      return migrateUser(raw);
    } catch {
      return null;
    }
  });

  const [authEmail, setAuthEmail] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSkill, setCurrentSkill] = useState("");
  const [completedNodes, setCompletedNodes] = useState(loadCompleted);

  // ✅ ONLY sync user — NO navigation here
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const migrated = migrateUser({
          ...session.user,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0],
        });

        setUser(migrated);
        localStorage.setItem("pathways_user", JSON.stringify(migrated));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ THIS is the ONLY redirect after login
  const handleAuth = useCallback(
    (authUser) => {
      if (!authUser) return;

      const migrated = migrateUser({
        ...authUser,
        name:
          authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
      });

      setUser(migrated);
      localStorage.setItem("pathways_user", JSON.stringify(migrated));

      navigate("/home", { replace: true }); // ✅ redirect ONLY here
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("pathways_user");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const generateRoadmap = useCallback(
    async (skill) => {
      if (!skill.trim()) return;
      setLoading(true);
      setError(null);
      setCurrentSkill(skill.trim());
      navigate("/roadmap");

      const courses = (() => {
        try {
          return JSON.parse(localStorage.getItem("pathways_courses") || "[]");
        } catch {
          return [];
        }
      })();
      const alreadyTracked = courses.find((c) => c.skill === skill.trim());
      if (!alreadyTracked) {
        const updated = [
          { skill: skill.trim(), date: new Date().toLocaleDateString() },
          ...courses,
        ].slice(0, 20);
        localStorage.setItem("pathways_courses", JSON.stringify(updated));

        const registry = JSON.parse(
          localStorage.getItem("nia_user_registry") || "{}",
        );
        if (user && registry[user.id]) {
          registry[user.id].currentCourse = skill.trim();
          registry[user.id].courses = [
            ...new Set([...(registry[user.id].courses || []), skill.trim()]),
          ];
          localStorage.setItem("nia_user_registry", JSON.stringify(registry));
        }
      }

      try {
        const res = await fetch(`${API_URL}/tree/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    },
    [user, navigate],
  );

  const markDone = useCallback((nodeId) => {
    setCompletedNodes((prev) => {
      const next = { ...prev, [nodeId]: true };
      localStorage.setItem("pathways_completed", JSON.stringify(next));
      return next;
    });
  }, []);

  const isNodeDone = useCallback(
    (nodeId) => !!completedNodes[nodeId],
    [completedNodes],
  );

  const isNodeAccessible = useCallback(
    (node) => {
      if (!node.prerequisites || node.prerequisites.length === 0) return true;
      return node.prerequisites.every((pid) => completedNodes[pid]);
    },
    [completedNodes],
  );

  const handleUpdateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem("pathways_user", JSON.stringify(updated));
  }, []);

  const path = useMemo(
    () => location.pathname.replace(/^\//, "") || "home",
    [location.pathname],
  );

  // 🔒 LOGGED OUT FLOW (UNCHANGED)
  if (!user) {
    if (authEmail) {
      return (
        <OnboardingPage
          email={authEmail}
          onComplete={(profile) => {
            setUser(profile);
            navigate("/home", { replace: true });
          }}
        />
      );
    }

    return <AuthPage onAuth={handleAuth} />;
  }

  // 🔓 LOGGED IN FLOW (100% YOUR ORIGINAL DESIGN)
  return (
    <>
      <Sidebar active={path} />

      <main className="main-content">
        <Topbar onGenerate={generateRoadmap} loading={loading} />

        <Routes>
          <Route
            path="/home"
            element={<HomePage user={user} completedNodes={completedNodes} />}
          />
          <Route
            path="/courses"
            element={<CoursesPage onSelectSkill={generateRoadmap} />}
          />
          <Route
            path="/roadmap"
            element={
              <RoadmapView
                skill={currentSkill}
                data={treeData}
                loading={loading}
                error={error}
                onBack={() => navigate(-1)}
                onRetry={() => generateRoadmap(currentSkill)}
                completedNodes={completedNodes}
                markDone={markDone}
                isNodeAccessible={isNodeAccessible}
                isNodeDone={isNodeDone}
              />
            }
          />
          <Route path="/friends" element={<FriendsPage user={user} />} />
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
                completedNodes={completedNodes}
              />
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        <Footer />
      </main>
    </>
  );
}