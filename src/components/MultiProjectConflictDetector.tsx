import React, { useState } from 'react';
import { Employee, ProjectDefinition } from '../types';
import { PROJECT_PRESETS } from '../data/initialData';
import { detectMultiProjectConflicts } from '../utils/workforceAlgorithms';
import { Layers, AlertTriangle, UserCheck, ArrowRight, CheckCircle2, UserX, RefreshCw } from 'lucide-react';

interface MultiProjectConflictDetectorProps {
  employees: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
}

export const MultiProjectConflictDetector: React.FC<MultiProjectConflictDetectorProps> = ({
  employees,
  onSelectEmployee,
}) => {
  // Convert presets into selectable ProjectDefinitions
  const allAvailableProjects: ProjectDefinition[] = PROJECT_PRESETS.map((p, idx) => ({
    id: `proj-${idx + 1}`,
    name: p.name,
    teamSize: p.teamSize,
    skills: p.skills,
  }));

  // Selected projects (default to first 2 or 3)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([
    allAvailableProjects[0].id,
    allAvailableProjects[1].id,
  ]);

  // Project overrides: project.id -> employeeId replaced with alternateId
  const [alternateOverrides, setAlternateOverrides] = useState<Record<string, Record<string, string>>>({});

  const activeProjects = allAvailableProjects.filter(p => selectedProjectIds.includes(p.id));

  // Run conflict detection
  const { projectRosters, conflicts } = detectMultiProjectConflicts(activeProjects, employees);

  const toggleProject = (projId: string) => {
    if (selectedProjectIds.includes(projId)) {
      if (selectedProjectIds.length > 2) {
        setSelectedProjectIds(prev => prev.filter(id => id !== projId));
      }
    } else {
      if (selectedProjectIds.length < 3) {
        setSelectedProjectIds(prev => [...prev, projId]);
      } else {
        // Swap last
        setSelectedProjectIds([selectedProjectIds[0], selectedProjectIds[1], projId]);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Project Staffing Conflict Detector
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simultaneously allocate 2–3 project initiatives and detect concurrent engineer double-booking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select 2–3 pipelines:</span>
          <div className="flex items-center gap-1.5">
            {allAvailableProjects.map(proj => {
              const isSelected = selectedProjectIds.includes(proj.id);
              return (
                <button
                  key={proj.id}
                  onClick={() => toggleProject(proj.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {proj.name.split(' ')[0]} ({proj.teamSize})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conflict Status Banner */}
      {conflicts.length > 0 ? (
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Staffing Clash Detected: </span>
            <span>
              {conflicts.length} engineer{conflicts.length > 1 ? 's are' : ' is'} recommended for multiple concurrent initiatives simultaneously. Review suggested alternates below.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Zero Resource Collisions! All active project rosters operate with distinct, non-overlapping engineers.
          </span>
        </div>
      )}

      {/* Concurrent Project Rosters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeProjects.map(proj => {
          const roster = projectRosters[proj.id] || [];
          return (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[170px]">
                    {proj.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {roster.length} of {proj.teamSize} members staffed
                  </p>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded font-semibold">
                  Active
                </span>
              </div>

              <div className="space-y-1.5">
                {roster.map(cand => {
                  const emp = cand.employee;
                  const isConflicted = conflicts.some(c => c.employeeId === emp.id);

                  return (
                    <div
                      key={emp.id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isConflicted
                          ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                          className="font-semibold truncate cursor-pointer hover:underline"
                        >
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">· {emp.role.split(' ')[0]}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isConflicted && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900 px-1.5 py-0.2 rounded">
                            Double-Booked
                          </span>
                        )}
                        <span className="font-mono text-[11px] tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
                          {cand.totalMatchScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conflicted Personnel & Suggested Alternates */}
      {conflicts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Conflict Resolution & Recommended Alternate Replacements
          </h4>

          <div className="space-y-3">
            {conflicts.map(conf => (
              <div
                key={conf.employeeId}
                className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{conf.employeeName}</span>
                    <span className="text-slate-500">({conf.employeeRole})</span>
                  </div>
                  <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    Claimed simultaneously by: {conf.conflictingProjects.join(' & ')}
                  </span>
                </div>

                {/* Alternates */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Recommended Unconflicted Alternates:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {conf.recommendedAlternates.map((altItem, aIdx) => {
                      const altEmp = altItem.alternate.employee;
                      return (
                        <div
                          key={`${altItem.forProject}-${altEmp.id}`}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {altEmp.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {altItem.alternate.totalMatchScore}% Match
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Suitable for <strong>{altItem.forProject}</strong> · {altEmp.role} ({40 - altEmp.currentLoad}h free)
                          </p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 italic">
                            "{altItem.alternate.oneLineReason}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
