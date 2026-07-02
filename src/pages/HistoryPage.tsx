import React, { useState } from 'react';
import { History, CheckCircle2, Trash2, Megaphone, Search, Filter, Calendar, User, ShieldAlert } from 'lucide-react';
import { HistoryItem, User as UserType } from '../types';
import ConfirmModal from '../components/ConfirmModal';

interface HistoryPageProps {
  history: HistoryItem[];
  currentUser: UserType | null;
  themeClasses: any;
  onDeleteHistoryItem: (id: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
}

export default function HistoryPage({
  history,
  currentUser,
  themeClasses,
  onDeleteHistoryItem,
  onClearHistory,
}: HistoryPageProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'chore' | 'announcement'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'deleted'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const isOwnerAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.username?.toLowerCase().includes('shalz') ||
    currentUser?.name?.toLowerCase().includes('shalz') ||
    currentUser?.email?.toLowerCase().includes('hemapriya');

  const filteredHistory = history.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.completedBy.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || item.type === filterType;
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className={`p-6 rounded-2xl ${themeClasses.card} border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-400" />
            Household History & Archives
          </h1>
          <p className={`text-xs ${themeClasses.textMuted} mt-1 max-w-2xl`}>
            When chores or announcements are finished or deleted from active pages, they are safely stored here for historical record, audit trail, and house accountability.
          </p>
        </div>

        {isOwnerAdmin && history.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className={`p-4 rounded-2xl ${themeClasses.card} border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center`}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history archives..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'all' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('chore')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'chore' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Chores ({history.filter((h) => h.type === 'chore').length})
            </button>
            <button
              onClick={() => setFilterType('announcement')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'announcement' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Announcements ({history.filter((h) => h.type === 'announcement').length})
            </button>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === 'all' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === 'completed' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Finished
            </button>
            <button
              onClick={() => setFilterStatus('deleted')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === 'deleted' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Deleted
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl ${themeClasses.card} border border-white/5`}>
            <History className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-base text-gray-300">No Historical Records Found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              When chores are marked completed or deleted, and when notices are archived, they will appear here automatically.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl ${themeClasses.card} border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  item.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {item.type === 'chore' ? (
                    item.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />
                  ) : (
                    <Megaphone className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.type === 'chore' ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {item.status === 'completed' ? 'FINISHED & ARCHIVED' : 'REMOVED FROM ACTIVE'}
                    </span>
                    {item.category && (
                      <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">{item.title}</h3>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{item.description}</p>

                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5 text-[11px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      By: <strong className="text-white">{item.completedBy}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" />
                      {new Date(item.completedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {isOwnerAdmin && (
                <button
                  onClick={() => onDeleteHistoryItem(item.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition self-end sm:self-center"
                  title="Remove record from archives"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={confirmClear}
        title="Confirm Clear All History"
        message="Are you sure you want to clear all historical records? This cannot be undone and will erase the entire house audit trail."
        confirmText="Yes, Clear All History"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          onClearHistory();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
