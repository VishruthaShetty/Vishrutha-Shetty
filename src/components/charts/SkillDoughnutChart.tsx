import React, { useState } from 'react';
import { Employee } from '../../types';

interface SkillDoughnutChartProps {
  employees: Employee[];
}

const PALETTE = [
  '#4f46e5', // indigo-600
  '#6366f1', // indigo-500
  '#818cf8', // indigo-400
  '#2563eb', // blue-600
  '#3b82f6', // blue-500
  '#0284c7', // sky-600
  '#0d9488', // teal-600
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
];

export const SkillDoughnutChart: React.FC<SkillDoughnutChartProps> = ({ employees }) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const skillCountMap: Record<string, number> = {};
  employees.forEach(emp => {
    Object.entries(emp.skills).forEach(([skill, level]) => {
      if (level >= 1) {
        skillCountMap[skill] = (skillCountMap[skill] || 0) + 1;
      }
    });
  });

  const skillEntries = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1]);

  const totalSkillAssignments = skillEntries.reduce((sum, item) => sum + item[1], 0);

  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const slices = skillEntries.map(([skill, count], idx) => {
    const fraction = totalSkillAssignments > 0 ? count / totalSkillAssignments : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    const color = PALETTE[idx % PALETTE.length];
    cumulativePercent += fraction;

    return {
      skill,
      count,
      percent: Math.round(fraction * 100),
      color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const selectedSlice = slices.find(s => s.skill === activeSkill) || null;
  const skilledEmployees = activeSkill
    ? employees.filter(e => (e.skills[activeSkill] || 0) >= 1)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Skill Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Employees certified per core competency</p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            {skillEntries.length} Unique Skills
          </span>
        </div>

        {/* Chart + Center Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
          <div className="relative w-[240px] h-[240px] shrink-0">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full -rotate-90 transform"
            >
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
                className="dark:stroke-slate-800"
              />
              {slices.map((slice) => {
                const isHovered = activeSkill === slice.skill;
                return (
                  <circle
                    key={slice.skill}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setActiveSkill(slice.skill)}
                    onMouseLeave={() => setActiveSkill(null)}
                  />
                );
              })}
            </svg>

            {/* Central Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {selectedSlice ? (
                <>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">
                    {selectedSlice.skill}
                  </span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {selectedSlice.count}
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    {selectedSlice.percent}% of skills
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-400 font-medium">Workforce Pool</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {employees.length}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Engineers Total</span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-sm text-xs">
            {slices.map((slice) => (
              <button
                key={slice.skill}
                onMouseEnter={() => setActiveSkill(slice.skill)}
                onMouseLeave={() => setActiveSkill(null)}
                onClick={() => setActiveSkill(activeSkill === slice.skill ? null : slice.skill)}
                className={`flex items-center justify-between p-1.5 rounded-md transition-colors text-left ${
                  activeSkill === slice.skill ? 'bg-indigo-50 dark:bg-indigo-950 font-semibold text-indigo-950 dark:text-indigo-200' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate">{slice.skill}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                  {slice.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Skill Drilldown */}
      {activeSkill && skilledEmployees.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Proficient with {activeSkill} ({skilledEmployees.length} members):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skilledEmployees.map(emp => (
              <span
                key={emp.id}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded"
              >
                {emp.name} (L{emp.skills[activeSkill]})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
