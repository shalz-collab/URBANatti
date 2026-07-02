import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, User, Award, Check, Trash2, UserPlus, Copy } from 'lucide-react';
import { User as UserType } from '../types';

interface DirectoryPageProps {
  users: UserType[];
  themeClasses: any;
  currentUser?: UserType | null;
  onVoteForAdmin?: (userId: string) => void;
  onSelectUser: (userId: string) => void;
  onDeleteProfile?: (userId: string) => Promise<void>;
}

export default function DirectoryPage({
  users,
  themeClasses,
  currentUser,
  onVoteForAdmin,
  onSelectUser,
  onDeleteProfile,
}: DirectoryPageProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [sortField, setSortField] = useState<'name' | 'points' | 'roomNumber' | 'votes'>('name');

  const [copiedInvite, setCopiedInvite] = useState(false);

  const isOwnerAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.username?.toLowerCase().includes('shalz') ||
    currentUser?.name?.toLowerCase().includes('shalz') ||
    currentUser?.email?.toLowerCase().includes('hemapriya');

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/?invite=roommate_join`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  // Find who has the highest votes (must be >= 1 vote)
  const sortedByVotes = [...users].sort((a, b) => (b.adminVotesCount || 0) - (a.adminVotesCount || 0));
  const topVoted = sortedByVotes[0];
  const hasElectedAdmin = topVoted && (topVoted.adminVotesCount || 0) > 0;

  // Filter & Sort Roommates
  const filteredUsers = users
    .filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
        u.occupation.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || u.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortField === 'points') {
        return (b.points || 0) - (a.points || 0);
      } else if (sortField === 'votes') {
        return (b.adminVotesCount || 0) - (a.adminVotesCount || 0);
      } else {
        return a.roomNumber.localeCompare(b.roomNumber);
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roommate Directory</h2>
          <p className={`${themeClasses.textMuted} text-sm mt-1`}>
            Connect and elect active leadership with the roommates in your shared space.
          </p>
        </div>
        <button
          onClick={handleCopyInvite}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg shrink-0 ${
            copiedInvite ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {copiedInvite ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {copiedInvite ? 'Invite Link Copied!' : 'Invite Roommate'}
        </button>
      </div>

      {/* House Admin Election Banner */}
      {hasElectedAdmin ? (
        <div className="p-5 md:p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border-2 border-amber-500 flex items-center justify-center bg-amber-500/15 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-300 flex items-center gap-1.5">
                Current Elected House Admin
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                By roommate consensus, <strong className="text-white font-semibold">{topVoted.name}</strong> is the House Admin with <strong className="text-amber-400 font-bold">{topVoted.adminVotesCount} vote{topVoted.adminVotesCount !== 1 ? 's' : ''}</strong>.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/20 shadow-md">
            Active Organizer
          </div>
        </div>
      ) : (
        <div className="p-5 md:p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 text-2xl">
              🗳️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-400">
                Democratically Elect our House Admin
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                No active House Admin has been elected yet. Every roommate gets 1 vote to choose who holds active organizer status.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Standings Live
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl ${themeClasses.card} flex flex-col md:flex-row gap-3 items-center justify-between border border-white/5`}>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, room, or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Filter */}
          <div className="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-lg border border-white/5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-lg border border-white/5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortField}
              onChange={(e: any) => setSortField(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="points">Sort by Points</option>
              <option value="roomNumber">Sort by Room</option>
              <option value="votes">Sort by Votes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Roommate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-gray-400">
            No roommates found matching your criteria.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isElectedAdmin = hasElectedAdmin && topVoted.id === u.id;
            const hasVotedForThisPerson = currentUser?.adminVote === u.id;

            return (
              <div
                key={u.id}
                className={`rounded-2xl ${themeClasses.card} overflow-hidden flex flex-col hover:shadow-xl hover:translate-y-[-2px] transition duration-200 border ${
                  isElectedAdmin ? 'border-amber-500/30 shadow-amber-500/5' : 'border-white/5'
                }`}
              >
                {/* Cover Banner */}
                <div
                  className="h-16 w-full bg-cover bg-center bg-no-repeat relative"
                  style={{ backgroundImage: `url(${u.coverUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Status Tag */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                      u.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {u.status}
                  </span>

                  {/* Crown indicator if they are elected admin */}
                  {isElectedAdmin && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-black font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      House Admin
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col items-center text-center -mt-8 relative z-10">
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className={`w-16 h-16 rounded-full border-4 shadow-md object-cover mb-3 ${
                      isElectedAdmin ? 'border-amber-500' : 'border-slate-900'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  
                  <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                    {u.name}
                  </h3>
                  <span className={`text-xs ${themeClasses.textMuted} font-medium mt-0.5`}>@{u.username}</span>
                  
                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 h-8 px-2 italic">
                    "{u.bio || 'No bio written yet.'}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-white/5 text-xs text-slate-300">
                    <div>
                      <span className="text-gray-400 block font-medium">Room</span>
                      <span className="font-bold text-emerald-400">{u.roomNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Consensus</span>
                      <span className="font-bold text-violet-400">🗳️ {u.adminVotesCount || 0} vote{u.adminVotesCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Voting Button Row */}
                  <div className="w-full mt-4 space-y-2 pt-2 border-t border-white/5">
                    {hasVotedForThisPerson ? (
                      <div className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Voted for as Admin
                      </div>
                    ) : (
                      <button
                        onClick={() => onVoteForAdmin && onVoteForAdmin(u.id)}
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition bg-violet-600/10 hover:bg-violet-600/30 text-violet-300 hover:text-white border border-violet-500/20 hover:border-violet-500/40 flex items-center justify-center gap-1.5"
                      >
                        🗳️ Vote as House Admin
                      </button>
                    )}

                    <button
                      onClick={() => onSelectUser(u.id)}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 flex items-center justify-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      View Full Profile
                    </button>

                    {isOwnerAdmin && u.id !== currentUser?.id && (
                      <button
                        onClick={() => onDeleteProfile && onDeleteProfile(u.id)}
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-bold transition bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/20 flex items-center justify-center gap-1.5 shadow-sm mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Profile (Admin Only)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
