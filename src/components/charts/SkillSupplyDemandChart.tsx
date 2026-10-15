import React, { useState } from 'react';
import { Employee, ProjectDefinition, SkillSupplyDemand } from '../../types';
import { calculateSkillSupplyVsDemand } from '../../utils/workforceAlgorithms';
import { PROJECT_PRESETS } from '../../data/initialData';
import { Scale, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface SkillSupplyDemandChartProps {
  employees: Employee[];
  projects?: ProjectDefinition[];
}

export const SkillSupplyDemandChart: React.FC<SkillSupplyDemandChartProps> = ({
  employees,
  projects = PROJECT_PRESETS.map((p, idx) => ({ id: `proj-${idx}`, ...p })),
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'shortages'>('all');

  const data: SkillSupplyDemand[] = calculateSkillSupplyVsDemand(employees, projects);

  const displayData = filterMode === 'shortages'
    ? data.filter(d => d.status === 'Critical Shortage' || d.status === 'Tight Supply')
    : data;

  const shortageCount = data.filter(d => d.status === 'Critical Shortage' || d.status === 'Tight Supply').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Skill Supply vs. Project Demand
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal talent capacity vs. active project staffing requirements ({projects.length} planned initiatives)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Skills ({data.length})
            </button>
            <button
              onClick={() => setFilterMode('shortages')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'shortages'
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
              }`}
            >
              Shortages Only ({shortageCount})
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
            <span>Talent Supply (Proficient Staff)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
            <span>Project Demand (Requirements)</span>
          </div>
        </div>

        <span className="font-mono text-[11px]">
          Benchmark based on 16 engineers across 4 active pipelines
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-3">
        {displayData.map(item => {
          const maxScale = Math.max(8, item.supplyCount, item.demandCount);
          const supplyPct = (item.supplyCount / maxScale) * 100;
          const demandPct = (item.demandCount / maxScale) * 100;

          let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
          if (item.status === 'Critical Shortage') {
            badgeClass = 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800';
          } else if (item.status === 'Tight Supply') {
            badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
          } else if (item.status === 'Surplus') {
            badgeClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
          } else {
            badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
          }

          return (
            <div
              key={item.skill}
              className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{item.skill}</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Supply: {item.supplyCount}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">vs</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    Demand: {item.demandCount}
                  </span>
                  {item.deficit > 0 && (
                    <span className="text-red-600 text-[11px] font-bold">
                      (-{item.deficit} Deficit)
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Bar Scale */}
              <div className="space-y-1">
                {/* Supply Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12 text-right">Supply:</span>
                  <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${supplyPct}%` }}
                    />
                  </div>
                </div>

                {/* Demand Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12 text-right">Demand:</span>
                  <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${demandPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
