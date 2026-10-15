import React, { useState } from 'react';
import { ActivityLogItem } from '../types';
import {
  Clock,
  UserCheck,
  Zap,
  Calendar,
  Smile,
  FileText,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ActivityLogSectionProps {
  logs: ActivityLogItem[];
  onClearLogs?: () => void;
}

export const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({ logs, onClearLogs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const filteredLogs = logs.filter(log => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const getCategoryBadge = (category: ActivityLogItem['category']) => {
    switch (category) {
      case 'employee':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/80',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'workload':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/80',
          text: 'text-indigo-700 dark:text-indigo-400',
          border: 'border-indigo-200 dark:border-indigo-800',
          icon: <Zap className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case 'project':
        return {
          bg: 'bg-violet-50 dark:bg-violet-950/80',
          text: 'text-violet-700 dark:text-violet-400',
          border: 'border-violet-200 dark:border-violet-800',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />,
        };
      case 'leave':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/80',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800',
          icon: <Calendar className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'wellbeing':
        return {
          bg: 'bg-pink-50 dark:bg-pink-950/80',
          text: 'text-pink-700 dark:text-pink-400',
          border: 'border-pink-200 dark:border-pink-800',
          icon: <Smile className="w-3.5 h-3.5 text-pink-600" />,
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Log & Audit Trail</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {logs.length} Recorded Actions
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological timeline of employee additions, capacity rebalances, team creations, and leaves
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'employee', label: 'Employees' },
            { id: 'workload', label: 'Workload' },
            { id: 'project', label: 'Projects' },
            { id: 'leave', label: 'Leaves' },
            { id: 'wellbeing', label: 'Wellbeing' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterCategory === f.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
            title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {isExpanded && (
        <div className="space-y-3 pt-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No recent actions matching category '{filterCategory}'.
            </div>
          ) : (
            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredLogs.slice(0, 8).map(item => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div key={item.id} className="relative group flex items-start gap-3 text-xs">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-600 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    </div>

                    <div className="flex-1 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-800 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.icon}
                            {item.action}
                          </span>
                          {item.author && (
                            <span className="text-[11px] text-slate-400">by {item.author}</span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 sm:text-right">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
