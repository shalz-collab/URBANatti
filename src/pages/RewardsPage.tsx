import React, { useState } from 'react';
import { Award, Trophy, Star, Sparkles, Gift, PlusCircle, CheckCircle2, User as UserIcon, ShieldCheck, Heart, Zap, History, ArrowRight } from 'lucide-react';
import { User, HistoryItem } from '../types';

interface RewardsPageProps {
  currentUser: User;
  users: User[];
  history: HistoryItem[];
  themeClasses: any;
  onRefresh: () => void;
  token: string | null;
}

export default function RewardsPage({
  currentUser,
  users,
  history,
  themeClasses,
  onRefresh,
  token,
}: RewardsPageProps) {
  // Time filtering state
  const [timeFilter, setTimeFilter] = useState<'all' | 'monthly' | 'weekly'>('all');

  // Helper to calculate displayed points based on time filter
  const getUserPoints = (u: User) => {
    const basePts = u.points || 0;
    if (timeFilter === 'all') return basePts;
    
    const now = new Date().getTime();
    const days = timeFilter === 'weekly' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    
    const recentHistory = history.filter(item => {
      if (!item.completedAt) return false;
      const itemTime = new Date(item.completedAt).getTime();
      return itemTime >= cutoff && (
        item.completedBy?.toLowerCase() === u.name?.toLowerCase() ||
        item.description?.toLowerCase().includes(u.name?.toLowerCase()) ||
        item.title?.toLowerCase().includes(u.name?.toLowerCase())
      );
    });

    let historyPts = 0;
    recentHistory.forEach(item => {
      const match = item.description?.match(/(\d+)\s*pts/i) || item.title?.match(/(\d+)\s*pts/i);
      if (match) {
        historyPts += parseInt(match[1], 10);
      } else if (item.type === 'chore' || item.title?.toLowerCase().includes('chore')) {
        historyPts += 15;
      } else if (item.category === 'reward' || item.title?.toLowerCase().includes('reward')) {
        historyPts += 10;
      }
    });

    if (historyPts > 0) return historyPts;
    if (timeFilter === 'weekly') return Math.max(0, Math.round(basePts * 0.35));
    return Math.max(0, Math.round(basePts * 0.65));
  };

  // Sort users by dynamic points descending
  const sortedUsers = [...users].sort((a, b) => getUserPoints(b) - getUserPoints(a));

  // Form states for open reward assignment
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(sortedUsers[0]?.id || '');
  const [pointsAmount, setPointsAmount] = useState<number>(15);
  const [customPoints, setCustomPoints] = useState<string>('');
  const [rewardTitle, setRewardTitle] = useState<string>('Spotless Kitchen Clean');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [awardedBy, setAwardedBy] = useState<string>(currentUser.name || currentUser.email || 'Roommate');
  const [remarks, setRemarks] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    'Spotless Kitchen Clean',
    'Cooked Dinner for House',
    'Took Out Trash & Recycling',
    'Helped Fix Apartment Issue',
    'Deep Cleaned Common Room',
    'Grocery Shopping Champion',
    'General Roommate Appreciation',
    'Custom Achievement...'
  ];

  const handleSelectUserForAward = (userId: string) => {
    setSelectedRecipientId(userId);
    // Scroll smoothly to form on mobile
    const formEl = document.getElementById('award-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!selectedRecipientId) {
      setErrorMsg('Please select a recipient roommate.');
      return;
    }

    const finalPts = customPoints ? Number(customPoints) : pointsAmount;
    if (!finalPts || finalPts <= 0 || isNaN(finalPts)) {
      setErrorMsg('Please enter a valid positive points amount.');
      return;
    }

    const finalTitle = rewardTitle === 'Custom Achievement...' ? (customTitle || 'Special House Contribution') : rewardTitle;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedRecipientId,
          points: finalPts,
          title: finalTitle,
          awardedBy: awardedBy.trim() || currentUser.name || 'Roommate',
          remarks: remarks.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to award points');
      }

      const recipient = users.find((u) => u.id === selectedRecipientId);
      setSuccessMsg(`Successfully awarded +${finalPts} pts to ${recipient?.name || 'roommate'}!`);
      setRemarks('');
      setCustomTitle('');
      if (rewardTitle === 'Custom Achievement...') setRewardTitle('Spotless Kitchen Clean');
      
      onRefresh();

      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error awarding points');
    } finally {
      setSubmitting(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs shadow-sm" title="1st Place Champion">
          <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>1st Place</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="px-2.5 py-1 rounded-xl bg-slate-400/20 border border-slate-400/30 text-slate-300 font-extrabold text-xs">
          2nd Place
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="px-2.5 py-1 rounded-xl bg-amber-700/20 border border-amber-700/30 text-amber-400 font-extrabold text-xs">
          3rd Place
        </div>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-white/10 font-mono font-bold text-xs flex items-center justify-center text-gray-300">
        #{index + 1}
      </span>
    );
  };

  const getTitleBadge = (pts: number) => {
    if (pts >= 100) return { title: 'Platinum Tier', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold' };
    if (pts >= 50) return { title: 'Gold Tier', bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 font-semibold' };
    if (pts >= 30) return { title: 'Silver Tier', bg: 'bg-slate-400/15 text-slate-300 border-slate-400/30 font-semibold' };
    if (pts >= 15) return { title: 'Bronze Tier', bg: 'bg-amber-700/15 text-amber-400 border-amber-700/30 font-semibold' };
    return { title: 'Active Member', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-semibold' };
  };

  // Filter reward history
  const rewardHistory = history.filter((h) => 
    h.category === 'reward' || 
    h.title?.toLowerCase().includes('reward') || 
    h.title?.toLowerCase().includes('completed') ||
    h.description?.toLowerCase().includes('points') ||
    h.description?.toLowerCase().includes('pts')
  );

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className={`p-6 rounded-3xl ${themeClasses.card} border border-white/10 relative overflow-hidden shadow-2xl`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Open Household Leaderboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Points Table & Rewards Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Welcome to the democratic household recognition table! Here you can check the live point standings and celebrate your roommates. <strong className="text-amber-300">Anyone can assign rewards to anyone</strong>—no admin access required!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/30 p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Total House Points</div>
              <div className="text-2xl font-black text-white">
                {sortedUsers.reduce((acc, u) => acc + getUserPoints(u), 0)} <span className="text-xs text-amber-400 font-bold">PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Leaderboard & Award Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Center: Leaderboard Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Roommate Points Standing</span>
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
              {(['all', 'monthly', 'weekly'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold capitalize transition ${
                    timeFilter === filter
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter === 'all' ? 'All-Time' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl ${themeClasses.card} border border-white/10 overflow-hidden shadow-xl`}>
            <div className="p-4 bg-white/5 border-b border-white/10 grid grid-cols-12 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              <div className="col-span-3 text-center">Rank</div>
              <div className="col-span-4">Roommate</div>
              <div className="col-span-3 text-center">Status Tier</div>
              <div className="col-span-2 text-right">Points</div>
            </div>

            <div className="divide-y divide-white/5">
              {sortedUsers.map((u, idx) => {
                const isMe = u.id === currentUser.id;
                const badge = getTitleBadge(getUserPoints(u));

                return (
                  <div
                    key={u.id}
                    className={`p-4 grid grid-cols-12 items-center gap-2 transition hover:bg-white/5 ${
                      isMe ? 'bg-amber-500/5 border-l-4 border-l-amber-400' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-3 flex justify-center">
                      {getRankBadge(idx)}
                    </div>

                    {/* Roommate info */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/20" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-sm" title="Current Leaderboard Champion">
                              <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>#1 Leader</span>
                            </span>
                          )}
                          {isMe && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">You</span>}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {u.roomNumber ? `Room ${u.roomNumber}` : u.role === 'admin' ? 'House Admin' : 'Roommate'}
                        </div>
                      </div>
                    </div>

                    {/* Title Badge */}
                    <div className="col-span-3 flex justify-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border truncate max-w-full ${badge.bg}`}>
                        {badge.title}
                      </span>
                    </div>

                    {/* Points & Quick Action */}
                    <div className="col-span-2 flex flex-col items-end justify-center gap-1">
                      <span className="font-black text-sm sm:text-base text-amber-400">
                        {getUserPoints(u)} <span className="text-[10px] font-bold text-gray-400">pts</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectUserForAward(u.id)}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/10 hover:bg-amber-500 hover:text-slate-900 text-gray-200 transition flex items-center gap-1"
                        title="Give points to this roommate"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Award</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Open Reward Assignment Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4" id="award-form">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span>Assign Reward Points</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Open for Anyone
            </span>
          </div>

          <form onSubmit={handleAwardSubmit} className={`p-6 rounded-3xl ${themeClasses.card} border border-emerald-500/30 shadow-2xl space-y-5 relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <Zap className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <strong className="font-extrabold block text-white">Democratic Recognition Rules:</strong>
                Anyone in the apartment can assign points! Celebrate good deeds, cooking, cleaning, or helpful favors.
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-400/50 text-emerald-300 font-extrabold text-xs sm:text-sm text-center animate-bounce shadow-lg">
                {successMsg}
              </div>
            )}

            {/* Recipient Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                1. Select Roommate to Reward
              </label>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {sortedUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white font-semibold">
                    {u.name} {u.id === currentUser.id ? '(Yourself)' : ''} • Current: {getUserPoints(u)} pts
                  </option>
                ))}
              </select>
            </div>

            {/* Points Amount Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                2. Points to Award
              </label>
              <div className="flex flex-wrap gap-2">
                {[10, 15, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setPointsAmount(amt);
                      setCustomPoints('');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${
                      pointsAmount === amt && !customPoints
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-white/10 text-gray-300 hover:bg-white/15'
                    }`}
                  >
                    +{amt} PTS
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <input
                  type="number"
                  placeholder="Or enter custom points amount (e.g. 35)..."
                  value={customPoints}
                  onChange={(e) => {
                    setCustomPoints(e.target.value);
                    if (e.target.value) setPointsAmount(Number(e.target.value));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Achievement / Title Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                3. Reward Title / Achievement
              </label>
              <select
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {presets.map((p) => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
              {rewardTitle === 'Custom Achievement...' && (
                <input
                  type="text"
                  placeholder="Type custom reward title..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 text-xs mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 animate-fadeIn"
                />
              )}
            </div>

            {/* Awarded By & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Assigned / Awarded By
                </label>
                <input
                  type="text"
                  value={awardedBy}
                  onChange={(e) => setAwardedBy(e.target.value)}
                  placeholder="Your Name / Anyone"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Optional Note / Remarks
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Thanks for dinner!"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              <span>{submitting ? 'Awarding Points...' : `Confirm & Award +${customPoints || pointsAmount} Pts Now`}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section: Recent Rewards & Achievements Log */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Recent Rewards & Point Activity</span>
          </h2>
          <span className="text-xs font-bold text-gray-400">
            {rewardHistory.length} Recorded Rewards
          </span>
        </div>

        <div className={`p-6 rounded-3xl ${themeClasses.card} border border-white/10 shadow-xl`}>
          {rewardHistory.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Trophy className="w-10 h-10 text-gray-500 mx-auto" />
              <p className="text-sm font-bold text-gray-400">No rewards recorded yet!</p>
              <p className="text-xs text-gray-500">Be the first to assign points to a roommate using the form above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardHistory.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                        {new Date(item.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    {item.completedBy && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                        <span>Assigned by {item.completedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
