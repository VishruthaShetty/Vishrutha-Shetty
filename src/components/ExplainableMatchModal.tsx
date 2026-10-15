import React from 'react';
import { CandidateEvaluation, RequiredSkill } from '../types';
import { X, CheckCircle2, Award, Clock, Cpu, HelpCircle } from 'lucide-react';

interface ExplainableMatchModalProps {
  candidate: CandidateEvaluation | null;
  onClose: () => void;
  requiredSkills: RequiredSkill[];
}

export const ExplainableMatchModal: React.FC<ExplainableMatchModalProps> = ({
  candidate,
  onClose,
  requiredSkills,
}) => {
  if (!candidate) return null;

  const emp = candidate.employee;
  const freeHours = Math.max(0, emp.capacity - emp.currentLoad);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {emp.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{emp.name}</h3>
                <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded">
                  {candidate.totalMatchScore}% Match
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role} · {emp.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* One-Line Reason Box */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl">
            <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-1">
              Why this candidate was chosen:
            </span>
            <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium leading-relaxed">
              "{candidate.oneLineReason}"
            </p>
          </div>

          {/* Mini Bar Chart Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Scoring Weight Breakdown (100% Total)
            </h4>

            {/* Skill Fit Bar (60%) */}
            <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Skill Competency Fit (60% weight)</span>
                </div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {candidate.skillFitScore}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${candidate.skillFitScore}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Weighted contribution:</span>
                <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {Math.round(candidate.skillFitScore * 0.60 * 10) / 10} / 60 pts
                </span>
              </div>
            </div>

            {/* Experience Bar (15%) */}
            <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Industry Experience (15% weight)</span>
                </div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {candidate.experienceScore}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${candidate.experienceScore}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>{emp.experienceYears} years verified tenure:</span>
                <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {Math.round(candidate.experienceScore * 0.15 * 10) / 10} / 15 pts
                </span>
              </div>
            </div>

            {/* Availability Bar (25%) */}
            <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Current Bandwidth (25% weight)</span>
                </div>
                <span className={`font-mono font-bold tabular-nums ${candidate.availabilityScore === 0 ? 'text-red-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {candidate.availabilityScore}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${candidate.availabilityScore === 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${candidate.availabilityScore}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>{freeHours}h free / {emp.currentLoad}h committed:</span>
                <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {Math.round(candidate.availabilityScore * 0.25 * 10) / 10} / 25 pts
                </span>
              </div>
            </div>
          </div>

          {/* Project Skill Checklist */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Target Requirements Met
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {requiredSkills.map(req => {
                const empLvl = emp.skills[req.skill] || 0;
                const meets = empLvl >= req.minLevel;
                return (
                  <div
                    key={req.skill}
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      meets
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="truncate">{req.skill}</span>
                    <span className="font-mono text-[11px] tabular-nums shrink-0">
                      L{empLvl} / L{req.minLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
