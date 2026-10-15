import React, { useState } from 'react';
import { Employee } from '../../types';
import { getBurnoutRisk } from '../../utils/workforceAlgorithms';

interface WorkloadBarChartProps {
  employees: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
}

export const WorkloadBarChart: React.FC<WorkloadBarChartProps> = ({ employees, onSelectEmployee }) => {
  const [hoveredEmpId, setHoveredEmpId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'workload-desc' | 'workload-asc'>('workload-desc');

  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortBy === 'workload-desc') {
      return (b.currentLoad / b.capacity) - (a.currentLoad / a.capacity);
    }
    if (sortBy === 'workload-asc') {
      return (a.currentLoad / a.capacity) - (b.currentLoad / b.capacity);
    }
    return a.name.localeCompare(b.name);
  });

  const hoveredEmp = employees.find(e => e.id === hoveredEmpId);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Workload Utilization per Employee</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            40h weekly benchmark · Monitored real-time capacity
          </p>
        </div>

        {/* Legend and Sort Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500"></span>
              <span>Overloaded (&gt;100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
              <span>Optimal (60–100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-500"></span>
              <span>Underused (&lt;60%)</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setSortBy('workload-desc')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'workload-desc' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Highest
            </button>
            <button
              onClick={() => setSortBy('workload-asc')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'workload-asc' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lowest
            </button>
            <button
              onClick={() => setSortBy('default')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'default' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="space-y-3 pt-2">
        {/* 100% capacity guideline */}
        <div className="relative border-b border-dashed border-slate-300 dark:border-slate-700 pb-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
          <span>0%</span>
          <span className="text-sky-600 dark:text-sky-400">60% Threshold (24h)</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">100% Capacity (40h)</span>
          <span className="text-red-600 dark:text-red-400">125% Peak (50h)</span>
        </div>

        <div className="space-y-2">
          {sortedEmployees.map((emp) => {
            const pct = Math.round((emp.currentLoad / emp.capacity) * 100);
            const isOverloaded = pct > 100;
            const isUnderused = pct < 60;
            const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);

            let barColor = 'bg-emerald-500 hover:bg-emerald-600';
            let textColor = 'text-emerald-700 dark:text-emerald-400';
            let statusText = 'Optimal';
            if (isOverloaded) {
              barColor = 'bg-red-500 hover:bg-red-600';
              textColor = 'text-red-700 dark:text-red-400';
              statusText = 'Overloaded';
            } else if (isUnderused) {
              barColor = 'bg-sky-500 hover:bg-sky-600';
              textColor = 'text-sky-700 dark:text-sky-400';
              statusText = 'Underused';
            }

            const barWidthPercent = Math.min(100, Math.round((pct / 130) * 100));

            return (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                onMouseEnter={() => setHoveredEmpId(emp.id)}
                onMouseLeave={() => setHoveredEmpId(null)}
                className={`group p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredEmpId === emp.id ? 'bg-slate-50 dark:bg-slate-800/60' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{emp.name}</span>
                    <span className="text-slate-400 hidden sm:inline truncate">· {emp.role}</span>
                    <span className={`text-[10px] font-semibold px-1 rounded ${
                      risk.level === 'High' ? 'text-red-600' : risk.level === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {risk.level} Risk
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums font-mono text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{emp.currentLoad}h / {emp.capacity}h</span>
                    <span className={`font-semibold ${textColor}`}>
                      {pct}% ({statusText})
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  {/* 60% mark */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600 z-10"
                    style={{ left: `${(60 / 130) * 100}%` }}
                    title="60% Underused boundary"
                  />
                  {/* 100% mark */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
                    style={{ left: `${(100 / 130) * 100}%` }}
                    title="100% Capacity benchmark"
                  />
                  {/* Progress bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip / detail footer when hovered */}
      {hoveredEmp && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">{hoveredEmp.name}</span>
            <span className="text-slate-400">({hoveredEmp.department})</span>
            <span>· {hoveredEmp.experienceYears} yrs experience</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Top competencies:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {Object.entries(hoveredEmp.skills)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([s, lvl]) => `${s} (L${lvl})`)
                .join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
