import React, { useState } from 'react';
import { Employee, SkillGapAlert } from '../types';
import { getBurnoutRisk } from '../utils/workforceAlgorithms';
import { X, AlertTriangle, Clock, BookOpen, ArrowRight, Bell } from 'lucide-react';

interface AlertsCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  skillGaps: SkillGapAlert[];
  onNavigate: (tab: 'dashboard' | 'employees' | 'new-project' | 'workload') => void;
}

export const AlertsCenterDrawer: React.FC<AlertsCenterDrawerProps> = ({
  isOpen,
  onClose,
  employees,
  skillGaps,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'overloaded' | 'underused' | 'gaps'>('all');

  if (!isOpen) return null;

  const overloaded = employees.filter(e => e.currentLoad > 40);
  const underused = employees.filter(e => e.currentLoad < 24);
  const totalAlerts = overloaded.length + underused.length + skillGaps.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 transition-colors">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Workforce Alerts Center</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live operational exceptions & capacity bottlenecks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({totalAlerts})
          </button>
          <button
            onClick={() => setFilter('overloaded')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              filter === 'overloaded'
                ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-red-700'
            }`}
          >
            Overloaded ({overloaded.length})
          </button>
          <button
            onClick={() => setFilter('underused')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              filter === 'underused'
                ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-sky-700'
            }`}
          >
            Underused ({underused.length})
          </button>
          <button
            onClick={() => setFilter('gaps')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              filter === 'gaps'
                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-700'
            }`}
          >
            Skill Gaps ({skillGaps.length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Overloaded Alerts */}
          {(filter === 'all' || filter === 'overloaded') && overloaded.map(emp => {
            const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);
            return (
              <div
                key={`overload-${emp.id}`}
                className="p-3 rounded-xl border border-red-200/80 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/40 text-xs space-y-2 hover:bg-red-50/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.role}</p>
                    </div>
                  </div>
                  <span className="font-mono text-red-700 dark:text-red-300 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                    {emp.currentLoad}h / 40h
                  </span>
                </div>
                <p className="text-red-900 dark:text-red-300 text-[11px]">
                  {risk.reason}
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('workload');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-400 hover:underline"
                  >
                    Resolve in Rebalance Engine <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Underused Alerts */}
          {(filter === 'all' || filter === 'underused') && underused.map(emp => {
            const free = 40 - emp.currentLoad;
            return (
              <div
                key={`underused-${emp.id}`}
                className="p-3 rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/40 text-xs space-y-2 hover:bg-sky-50/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.role}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sky-700 dark:text-sky-300 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                    {emp.currentLoad}h / 40h
                  </span>
                </div>
                <p className="text-sky-900 dark:text-sky-300 text-[11px]">
                  Available bandwidth of {free} hours/week. Ready to absorb delegated workload or join new projects.
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('workload');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    Assign tasks <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Skill Gap Alerts */}
          {(filter === 'all' || filter === 'gaps') && skillGaps.map(gap => (
            <div
              key={`gap-${gap.skill}`}
              className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/40 text-xs space-y-2 hover:bg-amber-50/70 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Skill Shortage: {gap.skill}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Team best: {gap.teamBestLevel > 0 ? `L${gap.teamBestLevel}` : 'None'} (Target: L{gap.requiredLevel})
                    </p>
                  </div>
                </div>
                <span className="font-mono text-amber-700 dark:text-amber-300 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Gap: -{gap.gap}
                </span>
              </div>
              <p className="text-amber-900 dark:text-amber-300 text-[11px]">
                Upskilling path available: "{gap.course.title}" ({gap.totalWeeksToClose} weeks to close).
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('new-project');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  View Training Roadmap <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {totalAlerts === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No active operational alerts. Workforce is balanced and operating smoothly.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Real-time status updates</span>
          <button
            onClick={() => {
              onClose();
              onNavigate('workload');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Open Rebalancing Engine
          </button>
        </div>
      </div>
    </div>
  );
};
