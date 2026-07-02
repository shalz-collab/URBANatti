import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Schedule, Team, Chore, User } from '../types';

interface CalendarPageProps {
  schedules: Schedule[];
  teams: Team[];
  chores: Chore[];
  users: User[];
  themeClasses: any;
}

export default function CalendarPage({ schedules, teams, chores, users, themeClasses }: CalendarPageProps) {
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date('2026-07-01')); // Base on timeline date

  // helper utilities
  const getChore = (choreId: string) => chores.find((c) => c.id === choreId);
  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate days in a standard 35-day grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null); // empty padding
  }
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push(new Date(year, month, i));
  }
  while (daysGrid.length % 7 !== 0) {
    daysGrid.push(null); // trailing padding
  }

  // Find schedules active on a specific day
  const getSchedulesForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return schedules.filter((s) => {
      // Since schedules are weekly (start to end date), check if this date is within the range
      const sDate = new Date(s.startDate);
      const eDate = new Date(s.endDate);
      return date >= sDate && date <= eDate;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Apartment Schedule Calendar</h2>
          <p className={`${themeClasses.textMuted} text-sm mt-1`}>
            Track assigned roommate tasks across months, weeks, and daily routines.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-black/15 p-1 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setViewType('month')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewType === 'month' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Month Grid
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewType === 'week' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Weekly Timeline
          </button>
          <button
            onClick={() => setViewType('day')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewType === 'day' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Daily Checklist
          </button>
        </div>
      </div>

      {/* Calendar Frame */}
      <div className={`rounded-2xl ${themeClasses.card} p-6 relative overflow-hidden`} style={{ id: 'calendar-board' }}>
        {/* Month View Controller */}
        {viewType === 'month' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[600px]">
                {/* Days Week labels */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 border-b border-white/5 pb-2">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* 35 Day grid */}
                <div className="grid grid-cols-7 gap-2 min-h-[320px] mt-2">
                  {daysGrid.map((day, idx) => {
                    if (!day) {
                      return <div key={idx} className="bg-white/1 border border-transparent rounded-xl opacity-20" />;
                    }

                    const daySchedules = getSchedulesForDate(day);
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl min-h-[70px] flex flex-col justify-between border ${
                          isToday ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-black/10'
                        } hover:bg-white/5 transition`}
                      >
                        <span className={`text-[10px] font-bold ${isToday ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {day.getDate()}
                        </span>
                        
                        {/* Small task markers */}
                        <div className="space-y-1 mt-1.5">
                          {daySchedules.map((s) => {
                            const chore = getChore(s.choreId);
                            return (
                              <div
                                key={s.id}
                                className={`text-[8px] font-semibold px-1 py-0.5 rounded truncate bg-${chore?.color || 'emerald'}-500/15 text-${chore?.color || 'emerald'}-400 border border-${chore?.color || 'emerald'}-500/10`}
                                title={`${chore?.title} - ${getTeam(s.teamId)?.name}`}
                              >
                                {chore?.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Timeline View */}
        {viewType === 'week' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Week 21 Calendar Schedule (May 20 – May 26)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
                // Mock days of week 21
                const mockDayNum = 20 + idx;
                const daySchedules = schedules.filter((s) => s.weekNumber === 21);

                return (
                  <div key={idx} className="p-4 rounded-xl bg-black/10 border border-white/5 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{dayName}</span>
                      <span className="text-lg font-black block mt-0.5">May {mockDayNum}</span>
                    </div>

                    <div className="space-y-2 mt-4">
                      {daySchedules.map((s) => {
                        const chore = getChore(s.choreId);
                        const team = getTeam(s.teamId);
                        return (
                          <div
                            key={s.id}
                            className={`p-2 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}
                          >
                            <span className="block font-bold">{chore?.title}</span>
                            <span className="block text-[8px] text-gray-400 mt-0.5">Assigned: {team?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily timeline / slot view */}
        {viewType === 'day' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold">Today's Daily Checklist & Slots</h3>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                Online Sync Active
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {schedules
                .filter((s) => s.weekNumber === 21)
                .map((s) => {
                  const chore = getChore(s.choreId);
                  const team = getTeam(s.teamId);

                  return (
                    <div key={s.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        <div className={`p-2 rounded-xl bg-${chore?.color || 'emerald'}-500/10 text-${chore?.color || 'emerald'}-400 mt-0.5 shrink-0`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{chore?.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{chore?.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-gray-300">
                            <span className="flex items-center gap-1">
                              Estimated Time: {chore?.estimatedTime}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400">Assigned Team: {team?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex -space-x-1.5">
                          {team?.members.map((memId) => {
                            const u = getUser(memId);
                            return (
                              <img
                                key={memId}
                                src={u?.avatarUrl}
                                alt={u?.name}
                                className="w-6 h-6 rounded-full border border-slate-900 object-cover"
                                title={u?.name}
                                referrerPolicy="no-referrer"
                              />
                            );
                          })}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            s.status === 'Completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {s.status === 'Completed' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {s.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
