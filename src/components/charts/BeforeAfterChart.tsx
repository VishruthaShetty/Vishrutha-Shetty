import React, { useState } from 'react';
import { Employee, RebalancePlan } from '../../types';

interface BeforeAfterChartProps {
  employees: Employee[];
  rebalancePlan: RebalancePlan;
  isApplied: boolean;
}

export const BeforeAfterChart: React.FC<BeforeAfterChartProps> = ({
  employees,
  rebalancePlan,
  isApplied,
}) => {
  const [filterMode, setFilterMode] = useState<'affected' | 'all'>('affected');

  const afterLoadsMap: Record<string, number> = {};
  employees.forEach(e => {
    if (isApplied) {
      afterLoadsMap[e.id] = e.currentLoad;
    } else {
      let load = e.currentLoad;
      rebalancePlan.transfers.forEach(t => {
        if (t.fromEmployeeId === e.id) load -= t.hours;
        if (t.toEmployeeId === e.id) load += t.hours;
      });
      afterLoadsMap[e.id] = load;
    }
  });

  const getBeforeLoad = (e: Employee) => {
    return isApplied ? e.baselineLoad : e.currentLoad;
  };

  const getAfterLoad = (e: Employee) => {
    return afterLoadsMap[e.id] ?? e.currentLoad;
  };

  const displayEmployees = employees.filter(e => {
    if (filterMode === 'all') return true;
    const before = getBeforeLoad(e);
    const after = getAfterLoad(e);
    return before !== after;
  }).sort((a, b) => getBeforeLoad(b) - getBeforeLoad(a));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Workload Capacity: Before vs. After Optimization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isApplied
              ? 'Active rebalance schedule applied across workforce'
              : 'Projected simulation of task reallocation & capacity relief'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-600"></span>
              <span>Before Load</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
              <span>After Rebalance</span>
            </div>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterMode('affected')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'affected'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reallocated ({rebalancePlan.transfers.length > 0 ? employees.filter(e => getBeforeLoad(e) !== getAfterLoad(e)).length : 0})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All 16 Engineers
            </button>
          </div>
        </div>
      </div>

      {/* Capacity Guideline Scale */}
      <div className="border-b border-dashed border-slate-300 dark:border-slate-700 pb-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
        <span>0h</span>
        <span className="text-sky-600 dark:text-sky-400">24h (60% Minimum Safe Load)</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold">40h (100% Full Capacity)</span>
        <span className="text-red-600 dark:text-red-400">52h Max Peak</span>
      </div>

      {/* Comparison Rows */}
      <div className="space-y-4">
        {displayEmployees.map(emp => {
          const before = getBeforeLoad(emp);
          const after = getAfterLoad(emp);
          const delta = after - before;
          const maxScale = 52;

          const beforePct = Math.min(100, (before / maxScale) * 100);
          const afterPct = Math.min(100, (after / maxScale) * 100);

          const isOverloadedBefore = before > 40;
          const isUnderusedBefore = before < 24;

          return (
            <div key={emp.id} className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{emp.name}</span>
                  <span className="text-slate-400 hidden sm:inline">· {emp.role}</span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                  <span className="text-slate-400">{before}h</span>
                  <span className="text-slate-300 dark:text-slate-600">→</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">{after}h / 40h</span>
                  <span
                    className={`font-semibold text-[11px] px-1.5 py-0.2 rounded ${
                      delta < 0
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : delta > 0
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {delta > 0 ? `+${delta}h` : delta < 0 ? `${delta}h` : '0h'}
                  </span>
                </div>
              </div>

              {/* Dual Bar Graphic */}
              <div className="space-y-1 relative">
                {/* 40h Guideline Vertical Tick */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400/70 z-10"
                  style={{ left: `${(40 / maxScale) * 100}%` }}
                  title="40h Capacity Ceiling"
                />

                {/* 24h Guideline Vertical Tick */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600 z-10"
                  style={{ left: `${(24 / maxScale) * 100}%` }}
                  title="24h Safe Minimum Load"
                />

                {/* Before Bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverloadedBefore
                        ? 'bg-red-400'
                        : isUnderusedBefore
                        ? 'bg-sky-400'
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{ width: `${beforePct}%` }}
                    title={`Before: ${before} hours`}
                  />
                </div>

                {/* After Bar */}
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${afterPct}%` }}
                    title={`After: ${after} hours`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
