import React, { useState } from 'react';
import { CheckCircle, Calendar, Plus, Sparkles, Trash2, Edit3, Check, Clock, User, ArrowRight, ShieldAlert, X, AlertCircle } from 'lucide-react';
import { Chore, Schedule, Team, User as UserType, Notification, Announcement } from '../types';
import ConfirmModal from '../components/ConfirmModal';

interface TasksPageProps {
  user: UserType | null;
  users: UserType[];
  teams: Team[];
  chores: Chore[];
  schedules: Schedule[];
  themeClasses: any;
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
}

export default function TasksPage({
  user,
  users,
  teams,
  chores,
  schedules,
  themeClasses,
  onRefresh,
  setActiveTab,
}: TasksPageProps) {
  const [showAddChore, setShowAddChore] = useState(false);
  const [showGenerateSchedule, setShowGenerateSchedule] = useState(false);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [loading, setLoading] = useState(false);

  // New Chore Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFreq, setNewFreq] = useState<'Every Week' | 'Every 2 Weeks' | 'Monthly' | 'Custom'>('Every Week');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTime, setNewTime] = useState('30m');
  const [newColor, setNewColor] = useState('violet');

  // Schedule Generation State
  const [genWeeks, setGenWeeks] = useState('4');

  // Edit Chore State
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFreq, setEditFreq] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editTime, setEditTime] = useState('');
  const [editColor, setEditColor] = useState('');

  // Confirmation state for deletion
  const [confirmDeleteChoreId, setConfirmDeleteChoreId] = useState<string | null>(null);

  // Mark Complete Module state
  const [completeWho, setCompleteWho] = useState<string>('');
  const [completeRemarks, setCompleteRemarks] = useState<string>('');
  const [completeProof, setCompleteProof] = useState<string>('');
  const [completing, setCompleting] = useState<boolean>(false);
  const [completeSuccess, setCompleteSuccess] = useState<boolean>(false);

  const isOwnerAdmin =
    user?.role === 'admin' ||
    user?.username?.toLowerCase().includes('shalz') ||
    user?.name?.toLowerCase().includes('shalz') ||
    user?.email?.toLowerCase().includes('hemapriya');

  const startEditingChore = (chore: Chore) => {
    setEditingChore(chore);
    setEditTitle(chore.title);
    setEditDesc(chore.description);
    setEditFreq(chore.frequency);
    setEditPriority(chore.priority as any);
    setEditTime(chore.estimatedTime);
    setEditColor(chore.color);
  };

  const handleSaveEditChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingChore || !editTitle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/chores/${editingChore.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          frequency: editFreq,
          priority: editPriority,
          estimatedTime: editTime,
          color: editColor,
        }),
      });
      if (!res.ok) throw new Error('Failed to update chore template');
      setEditingChore(null);
      if (selectedChore?.id === editingChore.id) {
        setSelectedChore({
          ...selectedChore,
          title: editTitle,
          description: editDesc,
          frequency: editFreq,
          priority: editPriority,
          estimatedTime: editTime,
          color: editColor,
        });
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating chore');
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('roommate_token');

  const handleCreateChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          frequency: newFreq,
          priority: newPriority,
          estimatedTime: newTime,
          color: newColor,
        }),
      });
      if (!res.ok) throw new Error('Failed to create chore template');
      setNewTitle('');
      setNewDesc('');
      setShowAddChore(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error creating chore');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChore = async (choreId: string) => {
    setConfirmDeleteChoreId(choreId);
  };

  const executeDeleteChore = async (choreId: string) => {
    try {
      const res = await fetch(`/api/chores/${choreId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete chore');
      if (selectedChore?.id === choreId) setSelectedChore(null);
      setConfirmDeleteChoreId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting chore');
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId: string, status: string, comments = '') => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, comments: comments || 'Task completed!' }),
      });
      if (!res.ok) throw new Error('Failed to update schedule status');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating schedule');
    }
  };

  const handleMarkChoreCompleteModule = async (chore: Chore) => {
    if (!token) return;
    setCompleting(true);
    try {
      const pendingShift = schedules.find((s) => s.choreId === chore.id && s.status === 'Pending');
      const completionName = completeWho || user?.name || user?.email || 'Roommate';

      if (pendingShift) {
        const res = await fetch(`/api/schedules/${pendingShift.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Completed',
            comments: completeRemarks || `Completed by ${completionName} via Mark Complete Module`,
            photoProof: completeProof,
          }),
        });
        if (!res.ok) throw new Error('Failed to complete shift');
      } else {
        const res = await fetch(`/api/chores/${chore.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completedBy: completionName,
            comments: completeRemarks || `Completed ad-hoc by ${completionName}`,
            photoProof: completeProof,
          }),
        });
        if (!res.ok) throw new Error('Failed to record chore completion');
      }

      setCompleteSuccess(true);
      onRefresh();
      setTimeout(() => {
        setCompleteSuccess(false);
        setCompleteRemarks('');
        setCompleteProof('');
      }, 3500);
    } catch (err: any) {
      alert(err.message || 'Error marking chore complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleGenerateSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedules/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count: parseInt(genWeeks, 10) || 4 }),
      });
      if (!res.ok) throw new Error('Failed to generate rotation schedule');
      setShowGenerateSchedule(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error generating rotation schedule');
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Unassigned Team';
  };

  const getTeamMembers = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return [];
    return team.members.map((mId) => users.find((u) => u.id === mId)).filter(Boolean);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className={`p-6 rounded-2xl ${themeClasses.card} border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2.5">
            <CheckCircle className="w-7 h-7 text-violet-400" />
            Household Chores & Rotation Board
          </h1>
          <p className={`text-xs ${themeClasses.textMuted} mt-1 max-w-2xl`}>
            Manage all active chore assignments, rotate teams automatically, and mark finished tasks to archive them directly into the History page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowGenerateSchedule(true)}
            className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            AI Auto-Rotate Schedule
          </button>
          <button
            onClick={() => setShowAddChore(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow ${themeClasses.buttonPrimary}`}
          >
            <Plus className="w-4 h-4" />
            Create Chore Template
          </button>
        </div>
      </div>

      {/* Active Chores Pool Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span>Active Household Chores Pool</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-normal">{chores.length} total</span>
          </h2>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
          >
            View Completed & Archived in History <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {chores.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl ${themeClasses.card} border border-white/5`}>
            <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-base text-gray-300">No Chores Configured Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Click the Create Chore Template button above to define cleaning duties like kitchen trash, bathroom scrub, or living room vacuum.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {chores.map((chore) => {
              const assignedSchedules = schedules.filter((s) => s.choreId === chore.id && s.status === 'Pending');
              return (
                <div
                  key={chore.id}
                  onClick={() => setSelectedChore(chore)}
                  className={`p-5 rounded-2xl ${themeClasses.card} border border-white/10 hover:border-violet-500/50 transition cursor-pointer flex flex-col justify-between group shadow-lg`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        chore.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        chore.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {chore.priority} Priority
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingChore(chore);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 text-gray-400 hover:text-violet-300 transition"
                          title="Edit Chore Template"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChore(chore.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                          title="Delete Chore Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-white mt-3 group-hover:text-violet-300 transition">{chore.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">{chore.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-violet-400" /> {chore.estimatedTime}
                    </span>
                    <span className="text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded">
                      {chore.frequency}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Assigned rotation:</span>
                    <span className="text-emerald-400 font-bold">
                      {assignedSchedules.length > 0 ? `${assignedSchedules.length} active shift${assignedSchedules.length > 1 ? 's' : ''}` : 'No upcoming shifts'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rotation Schedules Board: Active & Completed Sections */}
      <div className="space-y-6 pt-4">
        {/* Active & Pending Section */}
        <div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2 px-1 mb-4">
            <span>📅 Active & Upcoming Chore Shifts</span>
          </h2>

          {schedules.filter((s) => s.status !== 'Completed').length === 0 ? (
            <div className={`p-8 text-center rounded-2xl ${themeClasses.card} border border-white/5`}>
              <Calendar className="w-10 h-10 text-gray-500 mx-auto mb-2 opacity-40" />
              <h3 className="font-bold text-sm text-gray-300">No Active Shifts Pending</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                All chores are finished! Click "AI Auto-Rotate Schedule" above to generate next week's assignments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules
                .filter((s) => s.status !== 'Completed')
                .map((sched) => {
                  const chore = chores.find((c) => c.id === sched.choreId);
                  const members = getTeamMembers(sched.teamId);
                  const isAssignedToMe = members.some((m) => m?.id === user?.id);

                  return (
                    <div
                      key={sched.id}
                      className={`p-5 rounded-2xl ${themeClasses.card} border ${
                        isAssignedToMe ? 'border-violet-500/50 bg-violet-500/[0.04]' : 'border-white/10'
                      } transition flex flex-col justify-between shadow`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-gray-400">
                            Week #{sched.weekNumber} • <span className="text-white">{sched.startDate} to {sched.endDate}</span>
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            sched.status === 'Overdue' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          }`}>
                            {sched.status}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-white mt-2.5 flex items-center gap-2">
                          <span>{chore?.title || 'Chore Task'}</span>
                        </h3>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{chore?.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium">Team:</span>
                          <strong className="text-xs text-white">{getTeamName(sched.teamId)}</strong>
                          <div className="flex -space-x-1.5 overflow-hidden ml-1">
                            {members.map((m) => (
                              <img
                                key={m?.id}
                                src={m?.avatarUrl}
                                alt={m?.name}
                                className="w-6 h-6 rounded-full border-2 border-slate-900 object-cover"
                                title={m?.name}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            handleUpdateScheduleStatus(sched.id, 'Completed', `Completed by ${user?.name || 'Roommate'}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Completed Section */}
        {schedules.filter((s) => s.status === 'Completed').length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h2 className="text-base font-bold tracking-tight text-emerald-400 flex items-center gap-2 px-1 mb-4">
              <span>✅ Completed & Archived Shifts</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules
                .filter((s) => s.status === 'Completed')
                .map((sched) => {
                  const chore = chores.find((c) => c.id === sched.choreId);
                  const members = getTeamMembers(sched.teamId);

                  return (
                    <div
                      key={sched.id}
                      className={`p-4 rounded-2xl ${themeClasses.card} border border-emerald-500/30 bg-emerald-500/[0.02] transition flex flex-col justify-between shadow opacity-80`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-gray-400">
                            Week #{sched.weekNumber} • {sched.startDate}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Completed
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white mt-2 flex items-center gap-2 line-through text-gray-300">
                          <span>{chore?.title || 'Chore Task'}</span>
                        </h3>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                        <span className="text-gray-400">Team: <strong className="text-slate-200">{getTeamName(sched.teamId)}</strong></span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Archived in History
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* FULL CHORE DETAIL VIEW MODAL / NEW PAGE */}
      {selectedChore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`max-w-2xl w-full rounded-3xl ${themeClasses.card} border border-white/20 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setSelectedChore(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Full Chore Page View
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{selectedChore.title}</h2>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300 pt-2 border-t border-white/10">
              <div>
                <strong className="text-white block text-sm mb-1">Chore Description & Duties:</strong>
                <p className="leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5 text-slate-200">
                  {selectedChore.description || 'No detailed instructions provided.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block font-medium">Frequency</span>
                  <strong className="text-white text-sm">{selectedChore.frequency}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block font-medium">Priority</span>
                  <strong className="text-emerald-400 text-sm uppercase">{selectedChore.priority}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block font-medium">Est. Time</span>
                  <strong className="text-violet-400 text-sm">{selectedChore.estimatedTime}</strong>
                </div>
              </div>

              {/* Associated Shifts */}
              <div className="pt-2">
                <strong className="text-white block text-sm mb-2">Assigned Rotation Shifts for this Chore:</strong>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {schedules.filter((s) => s.choreId === selectedChore.id).length === 0 ? (
                    <p className="text-gray-400 italic">No shifts currently scheduled for this chore.</p>
                  ) : (
                    schedules.filter((s) => s.choreId === selectedChore.id).map((shift) => (
                      <div key={shift.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold">Week #{shift.weekNumber} ({shift.startDate})</span>
                          <span className="text-gray-400 block mt-0.5">Assigned to: <strong className="text-violet-300">{getTeamName(shift.teamId)}</strong></span>
                        </div>
                        {shift.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              handleUpdateScheduleStatus(shift.id, 'Completed');
                              setSelectedChore(null);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                          >
                            <Check className="w-3 h-3" /> Mark Complete
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold text-[11px]">✅ Completed & Stored</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MARK CHORE COMPLETE & RECORD MODULE */}
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Mark Complete & Record Module</h3>
                      <p className="text-[11px] text-emerald-300/80">Record instant completion, reward +15 points, & store in History</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    +15 Reward Pts
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-bold mb-1">Completed By (Roommate / Team)</label>
                      <select
                        value={completeWho}
                        onChange={(e) => setCompleteWho(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:ring-2 focus:ring-emerald-500 text-xs"
                      >
                        <option value={user?.name || user?.email || 'Me'}>Self ({user?.name || 'Me'})</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.name}>Roommate: {u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 font-bold mb-1">Photo Proof / Verified Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., Verified spotless / photo link"
                        value={completeProof}
                        onChange={(e) => setCompleteProof(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Completion Remarks & Notes</label>
                    <input
                      type="text"
                      placeholder="e.g., Vacuumed carpets and mopped floor thoroughly with disinfectant"
                      value={completeRemarks}
                      onChange={(e) => setCompleteRemarks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  {completeSuccess ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center animate-fadeIn">
                      Chore Marked Completed! +15 Points rewarded & archived into Household History!
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={completing}
                      onClick={() => handleMarkChoreCompleteModule(selectedChore)}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {completing ? 'Recording Completion...' : 'Confirm & Mark Chore Complete Now (+15 Pts)'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    startEditingChore(selectedChore);
                    setSelectedChore(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Chore
                </button>
                <button
                  onClick={() => handleDeleteChore(selectedChore.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Chore
                </button>
              </div>
              <button
                onClick={() => setSelectedChore(null)}
                className={`px-6 py-2 rounded-xl font-bold text-xs ${themeClasses.buttonPrimary}`}
              >
                Close Full Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHORE TEMPLATE MODAL */}
      {showAddChore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`max-w-md w-full rounded-3xl ${themeClasses.card} border border-white/20 p-6 shadow-2xl relative`}>
            <button
              onClick={() => setShowAddChore(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Create New Chore Template</h2>
            <form onSubmit={handleCreateChore} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Chore Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Living Room Vacuum"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Description & Duties</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vacuum rug, dust TV stand, empty trash can"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Frequency</label>
                  <select
                    value={newFreq}
                    onChange={(e: any) => setNewFreq(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Every Week">Every Week</option>
                    <option value="Every 2 Weeks">Every 2 Weeks</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Estimated Time (e.g. 20m, 45m)</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChore(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl font-bold ${themeClasses.buttonPrimary}`}
                >
                  {loading ? 'Creating...' : 'Create Chore Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI AUTO-ROTATE SCHEDULE MODAL */}
      {showGenerateSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`max-w-md w-full rounded-3xl ${themeClasses.card} border border-white/20 p-6 shadow-2xl relative`}>
            <button
              onClick={() => setShowGenerateSchedule(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              AI Auto-Rotate Schedule
            </h2>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Generate balanced weekly assignments automatically across all roommate teams and chores.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Number of Weeks to Schedule</label>
                <select
                  value={genWeeks}
                  onChange={(e) => setGenWeeks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                >
                  <option value="1">1 Week Ahead</option>
                  <option value="4">4 Weeks Ahead (1 Month)</option>
                  <option value="12">12 Weeks Ahead (3 Months)</option>
                  <option value="52">52 Weeks Ahead (1 Full Year)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-200">
                <strong className="block font-bold mb-1">How AI Rotation works:</strong>
                Chore templates are systematically rotated among active roommate teams so that nobody gets stuck with the same task twice in a row.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGenerateSchedule(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateSchedules}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 ${themeClasses.buttonPrimary}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loading ? 'Generating...' : 'Generate AI Rotation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CHORE MODAL */}
      {editingChore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-lg w-full p-6 rounded-2xl ${themeClasses.card} border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-violet-400" />
                <span>Edit Chore Template</span>
              </h3>
              <button onClick={() => setEditingChore(null)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditChore} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Chore Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl ${themeClasses.input} text-xs`}
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Description & Instructions</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl ${themeClasses.input} text-xs`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Frequency</label>
                  <select
                    value={editFreq}
                    onChange={(e) => setEditFreq(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Priority Level</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Estimated Time</label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl ${themeClasses.input} text-xs`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingChore(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-xl font-bold ${themeClasses.buttonPrimary}`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteChoreId}
        title="Confirm Chore Deletion"
        message="Are you sure you want to permanently delete this chore template? All completed rotation shifts will remain archived in Household History."
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
    </div>
  );
}
