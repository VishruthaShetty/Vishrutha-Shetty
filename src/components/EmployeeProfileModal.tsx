import React from 'react';
import { Employee, ProjectDefinition } from '../types';
import { getBurnoutRisk } from '../utils/workforceAlgorithms';
import { COURSE_CATALOG, ALL_SKILLS } from '../data/courseCatalog';
import { PROJECT_PRESETS } from '../data/initialData';
import { X, Award, Clock, BookOpen, Briefcase, Zap, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

interface EmployeeProfileModalProps {
  employee: Employee | null;
  onClose: () => void;
  onAssignToProject?: (projectName: string) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  onClose,
  onAssignToProject,
  onEdit,
  onDelete,
}) => {
  if (!employee) return null;

  const risk = getBurnoutRisk(employee.currentLoad, employee.capacity);
  const freeHours = Math.max(0, employee.capacity - employee.currentLoad);

  // Find suitable projects among presets (skills matching)
  const suitableProjects = PROJECT_PRESETS.filter(p => {
    let matchCount = 0;
    p.skills.forEach(req => {
      if ((employee.skills[req.skill] || 0) >= req.minLevel) {
        matchCount++;
      }
    });
    return matchCount >= 2;
  });

  // Recommended personalized training (skills they have at level 2-4 that can be elevated to 5)
  const trainingRecommendations = Object.entries(employee.skills)
    .filter(([_, lvl]) => lvl >= 2 && lvl < 5)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, lvl]) => ({
      skill,
      currentLevel: lvl,
      targetLevel: 5,
      course: COURSE_CATALOG[skill] || {
        title: `${skill} Professional Certification`,
        provider: 'WorkforceIQ Academy',
        duration: '20 hours',
        level: 'Advanced',
      },
    }))
    .slice(0, 3);

  // SVG Radar Chart for Employee Skills
  const size = 260;
  const center = size / 2;
  const radius = 80;
  const maxLevel = 5;

  // Selected skills that the employee has or core subset
  const profileSkills = Object.keys(employee.skills).length >= 3
    ? Object.keys(employee.skills)
    : ALL_SKILLS.slice(0, 6);

  const angleStep = (2 * Math.PI) / profileSkills.length;

  const getCoordinates = (index: number, level: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (level / maxLevel) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map(lvl => {
    const points = profileSkills
      .map((_, idx) => {
        const { x, y } = getCoordinates(idx, lvl);
        return `${x},${y}`;
      })
      .join(' ');
    return { level: lvl, points };
  });

  const empPoints = profileSkills
    .map((skill, idx) => {
      const lvl = employee.skills[skill] || 0;
      const { x, y } = getCoordinates(idx, lvl);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{employee.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  risk.level === 'High'
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : risk.level === 'Medium'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {risk.level} Burnout Risk
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {employee.role} · {employee.department} · {employee.experienceYears}y experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(employee);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
                title="Edit this employee"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(employee);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 border border-red-200 dark:border-red-900 rounded-lg shadow-2xs transition-colors"
                title="Delete this employee"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Bio statement */}
          {employee.bio && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              "{employee.bio}"
            </p>
          )}

          {/* Workload & Capacity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Current Workload</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {employee.currentLoad}h
                </span>
                <span className="text-slate-500">/ 40h standard</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${
                    employee.currentLoad > 40
                      ? 'bg-red-500'
                      : employee.currentLoad < 24
                      ? 'bg-sky-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (employee.currentLoad / 50) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Available Bandwidth</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  {freeHours}h
                </span>
                <span className="text-slate-500">free weekly capacity</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {employee.currentLoad > 40 ? `Overallocated by ${employee.currentLoad - 40}h` : 'Ready for new assignments'}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Health Assessment</span>
              <p className="text-[11px] font-medium leading-tight text-slate-800 dark:text-slate-200">
                {risk.reason}
              </p>
            </div>
          </div>

          {/* Skill Radar Chart & Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Radar */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Competency Profile Polygon
              </span>
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[210px] h-auto overflow-visible">
                {gridPolygons.map(({ level, points }) => (
                  <polygon
                    key={level}
                    points={points}
                    fill={level % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'transparent'}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    className="dark:stroke-slate-700 dark:fill-slate-800/30"
                  />
                ))}

                {/* Spokes */}
                {profileSkills.map((skill, idx) => {
                  const { x, y } = getCoordinates(idx, maxLevel);
                  return (
                    <line
                      key={skill}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      className="dark:stroke-slate-700"
                    />
                  );
                })}

                {/* Employee Skill Polygon */}
                <polygon
                  points={empPoints}
                  fill="rgba(79, 70, 229, 0.25)"
                  stroke="#4f46e5"
                  strokeWidth="2"
                />

                {/* Nodes */}
                {profileSkills.map((skill, idx) => {
                  const lvl = employee.skills[skill] || 0;
                  const { x, y } = getCoordinates(idx, lvl);
                  return (
                    <circle
                      key={skill}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Labels */}
                {profileSkills.map((skill, idx) => {
                  const labelCoord = getCoordinates(idx, maxLevel + 0.9);
                  const lvl = employee.skills[skill] || 0;
                  let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                  if (labelCoord.x > center + 10) textAnchor = 'start';
                  else if (labelCoord.x < center - 10) textAnchor = 'end';

                  return (
                    <text
                      key={`lbl-${skill}`}
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className="text-[9px] font-semibold fill-slate-700 dark:fill-slate-300"
                    >
                      {skill} (L{lvl})
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Complete Skills List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Proficiency Breakdown (Level 1-5)
              </span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {Object.entries(employee.skills).map(([skill, lvl]) => (
                  <div
                    key={skill}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(dot => (
                          <span
                            key={dot}
                            className={`w-2.5 h-2.5 rounded-xs ${
                              lvl >= dot
                                ? 'bg-indigo-600'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-6 text-right">
                        L{lvl}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suitable Projects Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                High-Fit Project Matches
              </h4>
            </div>
            {suitableProjects.length === 0 ? (
              <p className="text-slate-400">No project templates currently match this skill subset.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suitableProjects.map(proj => (
                  <div
                    key={proj.name}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">
                      {proj.name}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Requires: {proj.skills.map(s => s.skill).slice(0, 3).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Upskilling Courses */}
          {trainingRecommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recommended Upskilling Paths (to Level 5 Mastery)
                </h4>
              </div>
              <div className="space-y-2">
                {trainingRecommendations.map(tr => (
                  <div
                    key={tr.skill}
                    className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{tr.course.title}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {tr.course.provider} · {tr.course.duration} · Elevates {tr.skill} from L{tr.currentLevel} → L{tr.targetLevel}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shrink-0">
                      Recommended
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
