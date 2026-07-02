import React, { useState, useEffect, useRef } from 'react';
import { Home, CheckSquare, Users, FolderHeart, Calendar, MessageSquare, ShieldAlert, Settings, LogOut, Bell, Menu, X, Layers, RefreshCw, History, Trophy, Award, Gift } from 'lucide-react';
import { User, Team, Chore, Schedule, GalleryPhoto, Album, Notification, Announcement, ChatMessage, HistoryItem } from './types';
import { getThemeClasses, getThemeBackgroundStyle } from './utils/theme';
import { translations, Language } from './translations';
import ConfirmModal from './components/ConfirmModal';

// Import subpages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import GalleryPage from './pages/GalleryPage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import TasksPage from './pages/TasksPage';
import HistoryPage from './pages/HistoryPage';
import RewardsPage from './pages/RewardsPage';
import apartmentBg from './assets/images/apartment_garden_sunset_1782971356082.jpg';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('roommate_token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<{ title: string; message: string } | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<{ id: string; msg: string; isSelf: boolean } | null>(null);

  // Pull-to-refresh state for mobile responsiveness
  const [pullOffset, setPullOffset] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const touchStartY = useRef<number>(-1);

  // Multi-language localization state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('roommate_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('roommate_language', language);
  }, [language]);

  const t = translations[language];
  
  // Responsive sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared application database states
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Notifications display dropdown state
  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(true);

  // Fetch all database state from Express REST endpoints
  const fetchAllData = async (authToken: string, isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const headers = { Authorization: `Bearer ${authToken}` };

      const [
        resUsers,
        resTeams,
        resChores,
        resSchedules,
        resGallery,
        resAlbums,
        resNotifs,
        resAnns,
        resChats,
        resHistory,
      ] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/teams', { headers }),
        fetch('/api/chores', { headers }),
        fetch('/api/schedules', { headers }),
        fetch('/api/gallery', { headers }),
        fetch('/api/albums', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/announcements', { headers }),
        fetch('/api/chats', { headers }),
        fetch('/api/history', { headers }),
      ]);

      if (resUsers.ok) setUsers(await resUsers.json());
      if (resTeams.ok) setTeams(await resTeams.json());
      if (resChores.ok) setChores(await resChores.json());
      if (resSchedules.ok) setSchedules(await resSchedules.json());
      if (resGallery.ok) setGallery(await resGallery.json());
      if (resAlbums.ok) setAlbums(await resAlbums.json());
      if (resNotifs.ok) setNotifications(await resNotifs.json());
      if (resAnns.ok) setAnnouncements(await resAnns.json());
      if (resChats.ok) setChatMessages(await resChats.json());
      if (resHistory.ok) setHistory(await resHistory.json());

    } catch (err) {
      if (!isSilent) console.error('Failed to load roommate synchronization data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Verify and load active user session
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          await fetchAllData(token);
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          localStorage.removeItem('roommate_token');
          setToken(null);
          setUser(null);
        } else {
          console.warn('Session check returned non-auth error status:', res.status);
        }
      } catch (err) {
        console.error('Session verification error', err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // Real-time updates polling for all data (chores, schedules, announcements, teams, users, chats, notifications)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchAllData(token, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  // Recurring notification system: Trigger local alert 1 hour before a chore task is due for assigned user
  useEffect(() => {
    if (!user || !schedules.length || !chores.length) return;

    const checkDueChores = () => {
      const now = new Date();
      schedules.forEach((sched) => {
        if (sched.status !== 'Pending') return;
        
        const team = teams.find((t) => t.id === sched.teamId);
        if (!team || !team.members.includes(user.id)) return;

        const chore = chores.find((c) => c.id === sched.choreId);
        if (!chore) return;

        // Calculate due time (assume 5:00 PM / 17:00 on endDate)
        const dueTime = new Date(`${sched.endDate}T17:00:00`);
        const diffMinutes = (dueTime.getTime() - now.getTime()) / (1000 * 60);

        // Alert if due within approximately 1 hour (between -60 and 90 minutes)
        const alertKey = `alerted_${sched.id}`;
        if (diffMinutes > -60 && diffMinutes <= 90 && !localStorage.getItem(alertKey)) {
          localStorage.setItem(alertKey, 'true');
          setActiveAlert({
            title: `⏰ Chore Due Soon: ${chore.title}`,
            message: `You are assigned to "${chore.title}" which is due in approximately 1 hour! Please remember to complete your task.`,
          });
        }
      });
    };

    checkDueChores();
    const timer = setInterval(checkDueChores, 30000);
    return () => clearInterval(timer);
  }, [user, schedules, chores, teams]);

  // Handle Login success
  const handleLogin = (newUser: User, newToken: string) => {
    localStorage.setItem('roommate_token', newToken);
    setToken(newToken);
    setUser(newUser);
    fetchAllData(newToken);
  };

  // Mobile Pull-to-Refresh Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 10) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = -1;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current < 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0 && window.scrollY <= 10) {
      const offset = Math.min(diff * 0.45, 90);
      setPullOffset(offset);
    }
  };

  const handleTouchEnd = async () => {
    if (touchStartY.current < 0 || isRefreshing) return;
    touchStartY.current = -1;
    if (pullOffset > 55 && token) {
      setIsRefreshing(true);
      setPullOffset(50);
      await fetchAllData(token);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullOffset(0);
      }, 700);
    } else {
      setPullOffset(0);
    }
  };

  // Handle Log out
  const handleLogout = () => {
    localStorage.removeItem('roommate_token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
    setSelectedProfileId(null);
  };

  // Profile Edit Callback
  const handleUpdateProfile = async (updates: any) => {
    if (!user || !token) return;

    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    setUser(data.user);
    fetchAllData(token, true);
  };

  // Profile Delete Callback
  const handleDeleteProfile = async (targetId: string) => {
    if (!token) return;
    const targetUser = users.find((u) => u.id === targetId) || (user?.id === targetId ? user : null);
    const isSelf = user?.id === targetId;

    // Verify if requester is Shalzz / Admin
    const isOwnerAdmin =
      user?.role === 'admin' ||
      user?.username?.toLowerCase().includes('shalz') ||
      user?.name?.toLowerCase().includes('shalz') ||
      user?.email?.toLowerCase().includes('hemapriya');

    if (!isSelf && !isOwnerAdmin) {
      alert('Only the House Owner/Admin can permanently delete remaining roommate profiles.');
      return;
    }

    const confirmMsg = isSelf
      ? 'Are you sure you want to permanently delete your own account and roommate profile? This will log you out immediately and cannot be undone.'
      : `Are you sure you want to permanently delete ${targetUser?.name || 'this roommate'}'s profile and account? This action cannot be undone.`;

    setConfirmDeleteUser({ id: targetId, msg: confirmMsg, isSelf });
  };

  const executeDeleteProfile = async (targetId: string, isSelf: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/users/${targetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete profile');
      }

      // If deleting own profile, log out cleanly
      if (isSelf) {
        localStorage.removeItem('roommate_token');
        setToken(null);
        setUser(null);
        setActiveTab('dashboard');
        setSelectedProfileId(null);
      } else {
        // Individual user profile deletion without affecting session state of other users
        setSelectedProfileId(null);
        setUsers((prev) => prev.filter((u) => u.id !== targetId));
        await fetchAllData(token, true);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting profile');
    }
  };

  // History item handlers
  const handleDeleteHistoryItem = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item', err);
    }
  };

  const handleClearHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const handleVoteForAdmin = async (targetUserId: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteForId: targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
        if (data.users) {
          setUsers(data.users);
        }
        fetchAllData(token, true);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to submit vote');
      }
    } catch (err) {
      console.error('Error voting for admin:', err);
    }
  };

  // Send message callback
  const handleSendMessage = async (message: string, receiverId: string, isGroup: boolean, imageUrl?: string) => {
    if (!token) return;

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, receiverId, isGroup, imageUrl }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages((prev) => [...prev, newMsg]);
        // Fast refresh in background
        const resChats = await fetch('/api/chats', { headers: { Authorization: `Bearer ${token}` } });
        if (resChats.ok) setChatMessages(await resChats.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list
      const resNotifs = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      if (resNotifs.ok) setNotifications(await resNotifs.json());
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-400">Synchronizing Apartment Data...</p>
        </div>
      </div>
    );
  }

  // Generate background style referring to user preferences or high-resolution asset
  const bgStyle = getThemeBackgroundStyle(user, apartmentBg);

  // Resolve theme layout options
  const activeTheme = user?.themePreference || 'glass';
  const themeClasses = getThemeClasses(activeTheme);

  // Helper: Find selected user details
  const selectedUserObj = selectedProfileId ? users.find((u) => u.id === selectedProfileId) || null : null;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col font-sans select-none overflow-x-hidden"
      style={bgStyle}
    >
      {/* Background Overlay */}
      <div className={`absolute inset-0 z-0 ${themeClasses.bgOverlay}`} />

      {/* Recurring Chore Due Alert Popup Banner */}
      {activeAlert && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-[90vw] sm:w-96 bg-slate-900/95 border-2 border-emerald-400 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-bounce flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-emerald-400 mb-1 truncate">{activeAlert.title}</h4>
            <p className="text-xs text-slate-200 leading-relaxed break-words">{activeAlert.message}</p>
            <button
              onClick={() => setActiveAlert(null)}
              className="mt-3 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-lg w-full sm:w-auto"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      )}

      {/* Main Orchestrated View */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!token || !user ? (
          <AuthPage onLogin={handleLogin} themeClasses={themeClasses} />
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Sidebar Layout */}
            <aside
              className={`w-64 shrink-0 transition-transform lg:translate-x-0 ${themeClasses.sidebar} flex flex-col justify-between fixed lg:sticky top-0 h-screen z-40 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              style={{ id: 'left-sidebar-panel' }}
            >
              {/* Header / Brand */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-base tracking-tight text-white">{t.appName}</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="space-y-1.5 mt-8">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'dashboard' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <Home className="w-4 h-4" /> {t.dashboard}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('tasks');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'tasks' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" /> {t.chores}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('rewards');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'rewards' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-amber-400" /> {t.rewards || 'Rewards & Standings'}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'history' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <History className="w-4 h-4" /> {t.history || 'History & Archives'}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('directory');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'directory' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <Users className="w-4 h-4" /> {t.directory}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('gallery');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'gallery' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <FolderHeart className="w-4 h-4" /> {t.gallery}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('calendar');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'calendar' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <Calendar className="w-4 h-4" /> {t.schedule}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'chat' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> {t.chat}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setSelectedProfileId(null);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'settings' && !selectedProfileId ? themeClasses.sidebarActive : themeClasses.sidebarHover
                    }`}
                  >
                    <Settings className="w-4 h-4" /> {t.settings}
                  </button>
                </nav>
              </div>

              {/* Sidebar bottom: active roommate profile */}
              <div className="p-4 border-t border-white/5 space-y-3">
                <button
                  onClick={() => {
                    setSelectedProfileId(user.id);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 text-left"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate flex-1">
                    <p className="font-bold text-xs text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">@{user.username}</p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </aside>

            {/* Backdrop cover for mobile sidebar */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
              />
            )}

            {/* Right main board panel */}
            <main className="flex-1 flex flex-col min-w-0" style={{ id: 'main-stage-panel' }}>
              {/* Sticky Topbar Header */}
              <header className="sticky top-0 z-20 bg-black/10 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-white flex items-center gap-2">
                  <Menu className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm tracking-tight text-white">{t.appName}</span>
                </button>

                {/* Left side: date metadata info */}
                <div className="hidden sm:flex items-center gap-2 bg-black/15 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">
                    {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('rewards');
                    setSelectedProfileId(null);
                  }}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-300 font-bold transition shadow-sm ml-3"
                  title="View Household Points & Award Rewards"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Points Table</span>
                  <span className="bg-amber-500/30 px-1.5 py-0.5 rounded text-[10px] text-white">+{user.points || 0} pts</span>
                </button>

                {/* Right side: triggers */}
                <div className="flex items-center gap-2 sm:gap-3 ml-auto relative">
                  {/* Demo trigger button for 1-Hour Chore Due Alert */}
                  <button
                    onClick={() => {
                      const pendingMySchedule = schedules.find((s) => s.status === 'Pending' && teams.find((t) => t.id === s.teamId)?.members.includes(user?.id || ''));
                      const choreObj = pendingMySchedule ? chores.find((c) => c.id === pendingMySchedule.choreId) : chores[0];
                      setActiveAlert({
                        title: `⏰ Chore Due Soon: ${choreObj?.title || 'Kitchen Cleaning'}`,
                        message: `You are assigned to "${choreObj?.title || 'Kitchen Cleaning'}" which is due in approximately 1 hour! Please remember to mark it complete.`,
                      });
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] transition shrink-0"
                    title="Test 1-Hour Chore Due Alert"
                  >
                    <Bell className="w-3.5 h-3.5 animate-bounce" />
                    <span className="hidden sm:inline">Test 1h Alert</span>
                  </button>

                  {/* Notifications bell badge */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (!showNotifications) handleMarkNotificationsRead();
                      }}
                      className="p-2 rounded-xl bg-black/15 hover:bg-black/30 border border-white/5 text-white transition flex items-center justify-center"
                    >
                      <Bell className="w-4 h-4" />
                      {notifications.some((n) => !n.read) && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </button>

                    {/* Dropdown popup panel */}
                    {showNotifications && (
                      <div className={`absolute right-0 mt-2.5 w-80 rounded-2xl ${themeClasses.card} p-4 border border-white/10 shadow-2xl z-50 space-y-3`}>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="font-bold text-xs">House Notifications</h4>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-[10px] text-emerald-400 font-semibold hover:underline"
                          >
                            Close
                          </button>
                        </div>
                        <div className="space-y-2.5 max-h-60 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No recent house activities.</p>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className="text-[11px] flex gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
                                <div>
                                  <p className="font-semibold">{n.title}</p>
                                  <p className="text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Central View Content Stage */}
              <div
                className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Pull-to-Refresh Indicator Banner */}
                {(pullOffset > 0 || isRefreshing) && (
                  <div
                    style={{ height: isRefreshing ? 48 : pullOffset }}
                    className="w-full flex items-center justify-center transition-all duration-200 overflow-hidden bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs gap-2 rounded-2xl mb-4 shadow-xl backdrop-blur-xl"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-300' : ''}`}
                      style={{ transform: !isRefreshing ? `rotate(${pullOffset * 4}deg)` : undefined }}
                    />
                    <span>
                      {isRefreshing
                        ? 'Syncing apartment status...'
                        : pullOffset > 55
                        ? 'Release to refresh status 🏡'
                        : 'Pull down to refresh status'}
                    </span>
                  </div>
                )}

                {/* Router-like switcher */}
                {selectedProfileId ? (
                  <ProfilePage
                    user={user}
                    selectedUser={selectedUserObj}
                    schedules={schedules}
                    themeClasses={themeClasses}
                    onBack={() => setSelectedProfileId(null)}
                    onUpdateProfile={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                  />
                ) : (
                  <>
                    {activeTab === 'dashboard' && (
                      <DashboardPage
                        user={user}
                        users={users}
                        teams={teams}
                        chores={chores}
                        schedules={schedules}
                        notifications={notifications}
                        announcements={announcements}
                        themeClasses={themeClasses}
                        onRefresh={() => fetchAllData(token, true)}
                        setActiveTab={setActiveTab}
                      />
                    )}

                    {activeTab === 'tasks' && (
                      <TasksPage
                        user={user}
                        users={users}
                        teams={teams}
                        chores={chores}
                        schedules={schedules}
                        themeClasses={themeClasses}
                        onRefresh={() => fetchAllData(token, true)}
                        setActiveTab={setActiveTab}
                      />
                    )}

                    {activeTab === 'rewards' && (
                      <RewardsPage
                        currentUser={user}
                        users={users}
                        history={history}
                        themeClasses={themeClasses}
                        onRefresh={() => fetchAllData(token, true)}
                        token={token}
                      />
                    )}

                    {activeTab === 'history' && (
                      <HistoryPage
                        history={history}
                        currentUser={user}
                        themeClasses={themeClasses}
                        onDeleteHistoryItem={handleDeleteHistoryItem}
                        onClearHistory={handleClearHistory}
                      />
                    )}

                    {activeTab === 'directory' && (
                      <DirectoryPage
                        users={users}
                        themeClasses={themeClasses}
                        currentUser={user}
                        onVoteForAdmin={handleVoteForAdmin}
                        onSelectUser={(id) => setSelectedProfileId(id)}
                        onDeleteProfile={handleDeleteProfile}
                      />
                    )}

                    {activeTab === 'gallery' && (
                      <GalleryPage
                        user={user}
                        gallery={gallery}
                        albums={albums}
                        themeClasses={themeClasses}
                        onRefresh={() => fetchAllData(token, true)}
                      />
                    )}

                    {activeTab === 'calendar' && (
                      <CalendarPage
                        schedules={schedules}
                        teams={teams}
                        chores={chores}
                        users={users}
                        themeClasses={themeClasses}
                      />
                    )}

                    {activeTab === 'chat' && (
                      <ChatPage
                        user={user}
                        users={users}
                        chatMessages={chatMessages}
                        themeClasses={themeClasses}
                        onSendMessage={handleSendMessage}
                      />
                    )}

                    {activeTab === 'settings' && (
                      <SettingsPage
                        user={user}
                        themeClasses={themeClasses}
                        language={language}
                        onLanguageChange={(lang) => setLanguage(lang)}
                        onUpdateProfile={handleUpdateProfile}
                        onDeleteProfile={handleDeleteProfile}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Sticky bottom credit line */}
              <footer className="py-4 px-6 border-t border-white/5 text-center text-[10px] text-gray-400 mt-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>© 2026 zzzs. All rights reserved.</span>
                <span className="flex items-center gap-1">Made for better living together</span>
              </footer>
            </main>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteUser}
        title="Confirm Profile Deletion"
        message={confirmDeleteUser?.msg || ''}
        confirmText="Yes, Permanently Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (confirmDeleteUser) {
            executeDeleteProfile(confirmDeleteUser.id, confirmDeleteUser.isSelf);
          }
        }}
        onCancel={() => setConfirmDeleteUser(null)}
      />
    </div>
  );
}
