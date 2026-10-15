import React from 'react';
import { Employee } from '../types';
import { calculateTeamWellbeing } from '../utils/workforceAlgorithms';
import { Smile, X, Heart, ShieldAlert, Sparkles, TrendingUp, User } from 'lucide-react';

interface TeamWellbeingModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onUpdateMood: (empId: string, newMood: number) => void;
  onSelectEmployee?: (employee: Employee) => void;
}

const MOOD_EMOJIS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😫', label: 'Overwhelmed', color: 'text-rose-600 dark:text-rose-400' },
  2: { emoji: '😕', label: 'Fatigued', color: 'text-amber-600 dark:text-amber-400' },
  3: { emoji: '😐', label: 'Balanced', color: 'text-slate-600 dark:text-slate-300' },
  4: { emoji: '😊', label: 'Satisfied', color: 'text-sky-600 dark:text-sky-400' },
  5: { emoji: '🚀', label: 'Energized', color: 'text-emerald-600 dark:text-emerald-400' },
};

export const TeamWellbeingModal: React.FC<TeamWellbeingModalProps> = ({
  isOpen,
  onClose,
  employees,
  onUpdateMood,
  onSelectEmployee,
}) => {
  if (!isOpen) return null;

  const wellbeing = calculateTeamWellbeing(employees);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Team Wellbeing & Morale Monitor
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  wellbeing.score >= 80
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : wellbeing.score >= 60
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {wellbeing.status}: {wellbeing.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly employee sentiment check-in. Score dynamically decreases when burnout risk and hours over capacity rise.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Score Summary Banner */}
          <div className="p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200 dark:border-pink-900/60 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700 dark:text-pink-300">
                  Team Wellbeing Index
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    {wellbeing.score}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-400 ml-2">
                    {wellbeing.status}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs space-y-1">
                <div className="text-slate-600 dark:text-slate-300">
                  Avg Reported Morale: <strong className="font-mono">{wellbeing.averageMood}/5.0</strong>
                </div>
                <div className="text-rose-600 dark:text-rose-400 font-medium">
                  Burnout Drag: -{wellbeing.burnoutDrag} pts ({wellbeing.overloadedCount} overloaded staff)
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  wellbeing.score >= 80 ? 'bg-emerald-500' : wellbeing.score >= 60 ? 'bg-sky-500' : 'bg-rose-500'
                }`}
                style={{ width: `${wellbeing.score}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              {wellbeing.narrative}
            </p>
          </div>

          {/* Quick Roster Mood Sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-pink-500" />
                Employee Weekly Mood Ratings ({employees.length} Engineers)
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Slide to log current week sentiment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {employees.map(emp => {
                const moodVal = emp.weeklyMood ?? 4;
                const moodData = MOOD_EMOJIS[moodVal] || MOOD_EMOJIS[4];
                const isOverloaded = emp.currentLoad > 40;

                return (
                  <div
                    key={emp.id}
                    className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-pink-300 dark:hover:border-pink-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="truncate">
                          <p
                            onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                            className="font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                          >
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 font-bold text-xs">
                          <span className="text-base">{moodData.emoji}</span>
                          <span className={moodData.color}>{moodVal}/5</span>
                        </div>
                        {isOverloaded && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1 py-0.2 rounded border border-rose-200">
                            {emp.currentLoad}h (Overloaded)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={moodVal}
                        onChange={e => onUpdateMood(emp.id, parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5">
                        <span>1 😫 Stressed</span>
                        <span>3 😐 Balanced</span>
                        <span>5 🚀 Energized</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
