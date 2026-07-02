import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Layers,
  CheckCircle,
  Clock,
  Plus,
  Play,
  Bell,
  Check,
  UserPlus,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Volume2,
  Trash2,
  Megaphone,
  X,
  Trophy,
  Award,
  Gift,
} from 'lucide-react';
import { User, Team, Chore, Schedule, Notification, Announcement } from '../types';
import ConfirmModal from '../components/ConfirmModal';

interface DashboardPageProps {
  user: User;
  users: User[];
  teams: Team[];
  chores: Chore[];
  schedules: Schedule[];
  notifications: Notification[];
  announcements: Announcement[];
  themeClasses: any;
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardPage({
  user,
  users,
  teams,
  chores,
  schedules,
  notifications,
  announcements = [],
  themeClasses,
  onRefresh,
  setActiveTab,
}: DashboardPageProps) {
  // Quick Action Form Modal states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddChore, setShowAddChore] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);

  // New Announcement Form States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [confirmDeleteChoreId, setConfirmDeleteChoreId] = useState<string | null>(null);
  const [confirmDeleteAnnouncementId, setConfirmDeleteAnnouncementId] = useState<string | null>(null);

  // New Member Form States
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemUser, setNewMemUser] = useState('');
  const [newMemPass, setNewMemPass] = useState('');
  const [newMemRoom, setNewMemRoom] = useState('');

  // New Team Form States
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamM1, setNewTeamM1] = useState('');
  const [newTeamM2, setNewTeamM2] = useState('');

  // New Chore Form States
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreDesc, setNewChoreDesc] = useState('');
  const [newChoreFreq, setNewChoreFreq] = useState<'Every Week' | 'Every 2 Weeks' | 'Monthly' | 'Custom'>('Every Week');
  const [newChorePrio, setNewChorePrio] = useState<'low' | 'medium' | 'high'>('medium');
  const [newChoreTime, setNewChoreTime] = useState('30 mins');
  const [newChoreColor, setNewChoreColor] = useState('emerald');

  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Stats calculation
  const totalMembers = users.length;
  const totalTeams = teams.length;
  const completedTasksCount = schedules.filter((s) => s.status === 'Completed').length;
  const pendingTasksCount = schedules.filter((s) => s.status === 'Pending').length;

  // Week Details
  const currentWeekSchedules = schedules.filter((s) => s.weekNumber === 21);
  const upcomingSchedules = schedules.filter((s) => s.status === 'Pending' && s.weekNumber > 21);

  // Helper: get team details
  const getTeamDetails = (teamId: string) => {
    return teams.find((t) => t.id === teamId);
  };

  // Helper: get user details
  const getUserDetails = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  // Helper: get chore details
  const getChoreDetails = (choreId: string) => {
    return chores.find((c) => c.id === choreId);
  };

  // Action: Complete schedule chore task
  const handleCompleteChore = async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({
          status: 'Completed',
          comments: 'Task completed via dashboard check.',
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to complete task');
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Action: Add Member
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newMemEmail,
          password: newMemPass,
          name: newMemName,
          username: newMemUser,
          roomNumber: newMemRoom,
          role: 'member',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create member');

      setActionSuccess('Member successfully added to apartment!');
      setTimeout(() => {
        setShowAddMember(false);
        setNewMemName('');
        setNewMemEmail('');
        setNewMemUser('');
        setNewMemPass('');
        setNewMemRoom('');
        setActionSuccess('');
        onRefresh();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Create Team
  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({
          name: newTeamName,
          members: [newTeamM1, newTeamM2],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');

      setActionSuccess('Team successfully created!');
      setTimeout(() => {
        setShowCreateTeam(false);
        setNewTeamName('');
        setNewTeamM1('');
        setNewTeamM2('');
        setActionSuccess('');
        onRefresh();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Add Chore
  const handleAddChoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setLoading(true);
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({
          title: newChoreTitle,
          description: newChoreDesc,
          frequency: newChoreFreq,
          priority: newChorePrio,
          estimatedTime: newChoreTime,
          color: newChoreColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create chore');

      setActionSuccess('Chore successfully created!');
      setTimeout(() => {
        setShowAddChore(false);
        setNewChoreTitle('');
        setNewChoreDesc('');
        setActionSuccess('');
        onRefresh();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Add Announcement
  const handleAddAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setLoading(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post announcement');

      setActionSuccess('Announcement successfully posted!');
      setTimeout(() => {
        setShowAddAnnouncement(false);
        setAnnTitle('');
        setAnnContent('');
        setActionSuccess('');
        onRefresh();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Delete Chore Template
  const handleDeleteChore = async (choreId: string) => {
    setConfirmDeleteChoreId(choreId);
  };

  const executeDeleteChore = async (choreId: string) => {
    try {
      const res = await fetch(`/api/chores/${choreId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete chore');
      }
      setConfirmDeleteChoreId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Action: Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    setConfirmDeleteAnnouncementId(id);
  };

  const executeDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
      });
      if (res.ok) {
        setConfirmDeleteAnnouncementId(null);
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting announcement');
    }
  };

  // Action: Generate Next Week Schedules
  const handleGenerateSchedule = async () => {
    try {
      const res = await fetch('/api/schedules/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({ count: 1 }),
      });
      if (!res.ok) throw new Error('Failed to generate schedules');
      onRefresh();
      alert('Schedules for next week generated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
          <p className={`${themeClasses.textMuted} text-sm mt-1`}>
            Here is what is happening in your home today.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={`p-2 rounded-xl border border-white/10 hover:bg-white/5 transition flex items-center gap-1.5 text-xs font-medium`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Live
        </button>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('directory')}
          className={`rounded-2xl ${themeClasses.card} p-6 flex items-center justify-between cursor-pointer`}
          style={{ id: 'stat-members' }}
        >
          <div>
            <span className={`text-xs uppercase tracking-wider font-semibold ${themeClasses.textMuted}`}>
              Total Members
            </span>
            <h3 className="text-3xl font-extrabold mt-1">{totalMembers}</h3>
            <span className="text-[10px] text-emerald-400 font-medium block mt-1 hover:underline">
              View all members →
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('directory')}
          className={`rounded-2xl ${themeClasses.card} p-6 flex items-center justify-between cursor-pointer`}
          style={{ id: 'stat-teams' }}
        >
          <div>
            <span className={`text-xs uppercase tracking-wider font-semibold ${themeClasses.textMuted}`}>
              Total Teams
            </span>
            <h3 className="text-3xl font-extrabold mt-1">{totalTeams}</h3>
            <span className="text-[10px] text-blue-400 font-medium block mt-1 hover:underline">
              View all teams →
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('tasks')}
          className={`rounded-2xl ${themeClasses.card} p-6 flex items-center justify-between cursor-pointer`}
          style={{ id: 'stat-completed' }}
        >
          <div>
            <span className={`text-xs uppercase tracking-wider font-semibold ${themeClasses.textMuted}`}>
              Completed Tasks
            </span>
            <h3 className="text-3xl font-extrabold mt-1">{completedTasksCount}</h3>
            <span className="text-[10px] text-violet-400 font-medium block mt-1 hover:underline">
              View my tasks →
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('tasks')}
          className={`rounded-2xl ${themeClasses.card} p-6 flex items-center justify-between cursor-pointer`}
          style={{ id: 'stat-pending' }}
        >
          <div>
            <span className={`text-xs uppercase tracking-wider font-semibold ${themeClasses.textMuted}`}>
              Pending Tasks
            </span>
            <h3 className="text-3xl font-extrabold mt-1">{pendingTasksCount}</h3>
            <span className={`text-[10px] ${themeClasses.textMuted} block mt-1`}>
              This week
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Live Household Points & Rewards Leaderboard Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30">
            <Trophy className="w-3 h-3" />
            <span>Open Democratic Recognition</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 inline" />
            <span>Household Points Table & Rewards</span>
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            Check the live standings of roommate contributions! <strong className="text-amber-300 font-bold">Anyone can assign reward points</strong> to any roommate for cooking, cleaning, or favors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto shrink-0">
          <div className="flex -space-x-2 overflow-hidden py-1 px-2 bg-black/30 rounded-2xl border border-white/10 items-center justify-center">
            {[...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3).map((u, idx) => (
              <div key={u.id} className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800 border border-amber-500/30 text-xs font-bold text-white shadow">
                {idx === 0 ? <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <span className="font-mono text-gray-400">#{idx + 1}</span>}
                <span className="truncate max-w-[80px]">{u.name.split(' ')[0]}</span>
                <span className="text-[10px] text-amber-400 font-mono">{u.points || 0}p</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('rewards')}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition transform hover:scale-105 shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>Award Points / Full Table →</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Current Week Tasks & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Week Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-2xl ${themeClasses.card} p-6 relative overflow-hidden`} style={{ id: 'week-tasks-container' }}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold">Current Week Tasks</h3>
                <span className={`text-xs flex items-center gap-1 ${themeClasses.textMuted} mt-1`}>
                  <CalendarDays className="w-3.5 h-3.5" />
                  Week 21 • May 20 – May 26
                </span>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                View Full Calendar →
              </button>
            </div>

            {currentWeekSchedules.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                No tasks scheduled for this week. Generate schedules in Quick Actions or Admin Panel.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-white/5">
                      <th className="pb-3 font-semibold">Team</th>
                      <th className="pb-3 font-semibold">Members</th>
                      <th className="pb-3 font-semibold">Chore</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {currentWeekSchedules.map((sched) => {
                      const team = getTeamDetails(sched.teamId);
                      const chore = getChoreDetails(sched.choreId);
                      
                      const isUserInTeam = team?.members.includes(user.id);

                      return (
                        <tr key={sched.id} className="hover:bg-white/5 transition duration-150">
                          <td className="py-4 font-semibold text-emerald-400">
                            {team?.name || 'Unassigned Team'}
                          </td>
                          <td className="py-4">
                            <div className="flex -space-x-2">
                              {team?.members.map((memId) => {
                                const mem = getUserDetails(memId);
                                return (
                                  <img
                                    key={memId}
                                    src={mem?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                                    alt={mem?.name}
                                    title={mem?.name}
                                    className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <span className="font-semibold block">{chore?.title || 'Chore'}</span>
                              <span className="text-xs text-gray-400 font-medium">
                                {chore?.frequency || 'Weekly'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                sched.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {sched.status}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            {sched.status === 'Completed' ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCompleteChore(sched.id)}
                                className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* House Announcements Banner */}
          <div className={`rounded-2xl ${themeClasses.card} p-6 border border-emerald-500/10 bg-emerald-950/5 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                Latest House Announcements
              </h3>
              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Announce Something
              </button>
            </div>
            {announcements.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center italic">
                No active announcements yet. Anyone can announce chores or roommate notices!
              </p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {announcements.slice().reverse().map((ann) => {
                  const author = users.find((u) => u.id === ann.authorId);
                  const authorName = author ? author.name : 'Anonymous';
                  return (
                    <div key={ann.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5 hover:bg-white/[0.08] transition group">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1 rounded transition"
                            title="Remove & Archive to History"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{ann.content}</p>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-400">By Roommate:</span>
                        <span>{authorName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* House Chores Pool */}
          <div className={`rounded-2xl ${themeClasses.card} p-6 border border-white/5`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-violet-400" />
                Active House Chores Pool
              </h3>
              <button
                onClick={() => setShowAddChore(true)}
                className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Chore
              </button>
            </div>
            {chores.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center italic">
                No chores templates configured. Create chores templates to auto-rotate them!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {chores.map((chore) => (
                  <div key={chore.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition relative group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-${chore.color || 'emerald'}-500/10 text-${chore.color || 'emerald'}-400 border border-${chore.color || 'emerald'}-500/20`}>
                          {chore.priority} Priority
                        </span>
                        <button
                          onClick={() => handleDeleteChore(chore.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition"
                          title="Delete Chore Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm mt-2 text-white">{chore.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{chore.description}</p>
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                      <span>{chore.frequency}</span>
                      <span>Est. time: {chore.estimatedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Upcoming & Notifications */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`} style={{ id: 'quick-actions-container' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition duration-200 border border-white/5 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" /> Add Roommate Member
                </span>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setShowCreateTeam(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition duration-200 border border-white/5 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" /> Create Roommate Team
                </span>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setShowAddChore(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition duration-200 border border-white/5 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-400" /> Add Chore Template
                </span>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition duration-200 border border-white/5 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" /> Post House Announcement
                </span>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition duration-200 border border-white/5 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" /> My Assigned Tasks
                </span>
                <Check className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={handleGenerateSchedule}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition duration-200 border border-emerald-500/20 text-sm font-semibold text-emerald-400"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" /> Rotate Tasks (Next Week)
                </span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upcoming Tasks Card */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`} style={{ id: 'upcoming-tasks-container' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Upcoming Tasks
            </h3>
            {upcomingSchedules.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No upcoming schedule generated yet.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.slice(0, 3).map((sched) => {
                  const team = getTeamDetails(sched.teamId);
                  const chore = getChoreDetails(sched.choreId);
                  return (
                    <div
                      key={sched.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-sm block">{chore?.title}</span>
                        <span className="text-[10px] text-gray-400 font-medium block">
                          Assigned to: {team?.name}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                        Week {sched.weekNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity/Notifications Card */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`} style={{ id: 'recent-activity-container' }}>
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider">Recent House Activity</h3>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className="text-xs flex gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-gray-400 mt-0.5">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl ${themeClasses.card} border border-white/15`}>
            <h3 className="text-lg font-bold mb-4">Add Roommate Member</h3>
            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              {actionError && <p className="text-xs text-red-400">{actionError}</p>}
              {actionSuccess && <p className="text-xs text-emerald-400">{actionSuccess}</p>}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newMemUser}
                  onChange={(e) => setNewMemUser(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. alexj"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newMemEmail}
                  onChange={(e) => setNewMemEmail(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. alex@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newMemPass}
                  onChange={(e) => setNewMemPass(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Room Assignment</label>
                <input
                  type="text"
                  value={newMemRoom}
                  onChange={(e) => setNewMemRoom(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Room A-101"
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${themeClasses.buttonPrimary}`}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl ${themeClasses.card} border border-white/15`}>
            <h3 className="text-lg font-bold mb-4">Create Fixed Team</h3>
            <p className="text-xs text-gray-400 mb-3">
              Each team must have exactly two members. Active rotation will loop through fixed teams.
            </p>
            <form onSubmit={handleCreateTeamSubmit} className="space-y-3">
              {actionError && <p className="text-xs text-red-400">{actionError}</p>}
              {actionSuccess && <p className="text-xs text-emerald-400">{actionSuccess}</p>}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Team D"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">First Member</label>
                <select
                  required
                  value={newTeamM1}
                  onChange={(e) => setNewTeamM1(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                >
                  <option value="">Select Member...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Second Member</label>
                <select
                  required
                  value={newTeamM2}
                  onChange={(e) => setNewTeamM2(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                >
                  <option value="">Select Member...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} disabled={u.id === newTeamM1}>
                      {u.name} ({u.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${themeClasses.buttonPrimary}`}
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddChore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl ${themeClasses.card} border border-white/15`}>
            <h3 className="text-lg font-bold mb-4">Add Apartment Chore</h3>
            <form onSubmit={handleAddChoreSubmit} className="space-y-3">
              {actionError && <p className="text-xs text-red-400">{actionError}</p>}
              {actionSuccess && <p className="text-xs text-emerald-400">{actionSuccess}</p>}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Chore Title</label>
                <input
                  type="text"
                  required
                  value={newChoreTitle}
                  onChange={(e) => setNewChoreTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Hallway Vacuuming"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Description</label>
                <textarea
                  required
                  value={newChoreDesc}
                  onChange={(e) => setNewChoreDesc(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs h-16 focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="Explain exactly what is expected..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Frequency</label>
                  <select
                    value={newChoreFreq}
                    onChange={(e: any) => setNewChoreFreq(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  >
                    <option value="Every Week">Every Week</option>
                    <option value="Every 2 Weeks">Every 2 Weeks</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Priority</label>
                  <select
                    value={newChorePrio}
                    onChange={(e: any) => setNewChorePrio(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Est. Completion Time</label>
                  <input
                    type="text"
                    required
                    value={newChoreTime}
                    onChange={(e) => setNewChoreTime(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                    placeholder="e.g. 45 mins"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Color Style</label>
                  <select
                    value={newChoreColor}
                    onChange={(e) => setNewChoreColor(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  >
                    <option value="emerald">Emerald Green</option>
                    <option value="blue">Royal Blue</option>
                    <option value="violet">Violet Purple</option>
                    <option value="indigo">Indigo Indigo</option>
                    <option value="amber">Amber Gold</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChore(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${themeClasses.buttonPrimary}`}
                >
                  Create Chore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl ${themeClasses.card} border border-white/15`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                Post House Announcement
              </h3>
              <button
                onClick={() => setShowAddAnnouncement(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddAnnouncementSubmit} className="space-y-3">
              {actionError && <p className="text-xs text-red-400">{actionError}</p>}
              {actionSuccess && <p className="text-xs text-emerald-400">{actionSuccess}</p>}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. WiFi Router Maintenance / Groceries Due"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Content / Message</label>
                <textarea
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs h-24 focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="Tell your roommates the details..."
                />
              </div>
              <div className="flex gap-2 justify-end mt-4 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncement(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${themeClasses.buttonPrimary}`}
                >
                  {loading ? 'Posting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteChoreId}
        title="Confirm Chore Deletion"
        message="Are you sure you want to delete this chore template? It will be archived into Household History."
        confirmText="Yes, Delete Chore"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (confirmDeleteChoreId) {
            executeDeleteChore(confirmDeleteChoreId);
          }
        }}
        onCancel={() => setConfirmDeleteChoreId(null)}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteAnnouncementId}
        title="Confirm Announcement Removal"
        message="Are you sure you want to remove this announcement? It will be archived into Household History."
        confirmText="Yes, Remove Announcement"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (confirmDeleteAnnouncementId) {
            executeDeleteAnnouncement(confirmDeleteAnnouncementId);
          }
        }}
        onCancel={() => setConfirmDeleteAnnouncementId(null)}
      />
    </div>
  );
}
