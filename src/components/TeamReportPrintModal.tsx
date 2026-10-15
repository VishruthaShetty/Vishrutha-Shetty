import React, { useState } from 'react';
import { RecommendedTeamResult, RequiredSkill } from '../types';
import { X, Printer, Copy, Check, Download, Users, Award, BookOpen, Sparkles } from 'lucide-react';

interface TeamReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamResult: RecommendedTeamResult;
  requiredSkills: RequiredSkill[];
}

export const TeamReportPrintModal: React.FC<TeamReportPrintModalProps> = ({
  isOpen,
  onClose,
  teamResult,
  requiredSkills,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPlainText = () => {
    return `=====================================================
WORKFORCEIQ — PROJECT STAFFING & TEAM READINESS REPORT
Project: ${teamResult.projectName}
Generated: ${new Date().toLocaleDateString()}
=====================================================

1. EXECUTIVE OVERVIEW
-----------------------------------------------------
• Overall Team Score: ${teamResult.teamScore}%
• Team Chemistry Score: ${teamResult.chemistry.overallScore}% (${teamResult.chemistry.assessment})
• Skill Coverage: ${teamResult.skillCoveragePct}% (${teamResult.coveredSkillCount}/${teamResult.totalRequiredSkillCount} requirements met)
• Team Size: ${teamResult.selectedMembers.length} Members

2. RECOMMENDED ROSTER
-----------------------------------------------------
${teamResult.selectedMembers.map((m, i) => `${i + 1}. ${m.employee.name} (${m.employee.role})
   - Match Score: ${m.totalMatchScore}% (Skills: ${m.skillFitScore}%, Exp: ${m.experienceScore}%, Availability: ${m.availabilityScore}%)
   - Justification: ${m.oneLineReason}
   - Weekly Load: ${m.employee.currentLoad}h / 40h
`).join('\n')}

3. SKILL GAP ANALYSIS & TRAINING ROADMAP
-----------------------------------------------------
${teamResult.skillGaps.length === 0 ? 'All project requirements fully covered at target proficiency levels.' : teamResult.skillGaps.map((g, i) => `${i + 1}. Skill Gap: ${g.skill} (Target: Level ${g.requiredLevel}, Team Best: ${g.teamBestLevel > 0 ? `Level ${g.teamBestLevel}` : 'None'})
   - Course: ${g.course.title} (${g.course.provider})
   - Total Estimated Time: ${g.totalWeeksToClose} weeks
   - Learning Steps:
${g.roadmap.map(s => `     • ${s.level} (${s.durationWeeks} wks): ${s.topic} — ${s.objective}`).join('\n')}
`).join('\n')}
=====================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              IQ
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Project Staffing Intelligence Dossier</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ready for stakeholder presentation & board approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-xs">
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                Staffing Allocation Brief
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{teamResult.projectName}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generated via WorkforceIQ Algorithmic Matching · {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 rounded-xl text-center min-w-[90px]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Team Score</span>
                <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  {teamResult.teamScore}%
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 rounded-xl text-center min-w-[90px]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Chemistry</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {teamResult.chemistry.overallScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Chemistry Assessment */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Team Chemistry Assessment: </span>
              <span className="text-slate-600 dark:text-slate-300">{teamResult.chemistry.assessment}</span>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>Unique Competencies: <strong>{teamResult.chemistry.uniqueSkillsCount}</strong></span>
                <span>·</span>
                <span>Avg Member Load: <strong>{teamResult.chemistry.averageLoad}h/wk</strong></span>
                <span>·</span>
                <span>Workload Balance Rating: <strong>{teamResult.chemistry.workloadBalanceScore}%</strong></span>
              </div>
            </div>
          </div>

          {/* Roster Section */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              1. Recommended Team Members ({teamResult.selectedMembers.length})
            </h2>
            <div className="space-y-2.5">
              {teamResult.selectedMembers.map((cand, idx) => {
                const emp = cand.employee;
                return (
                  <div
                    key={emp.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {idx + 1}. {emp.name} — {emp.role}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">({emp.department} · {emp.experienceYears}y exp)</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                        {cand.totalMatchScore}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{cand.oneLineReason}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex gap-3 font-mono">
                        <span>Skill Fit: {cand.skillFitScore}%</span>
                        <span>Experience: {cand.experienceScore}%</span>
                        <span>Availability: {cand.availabilityScore}%</span>
                      </div>
                      <span>Load: {emp.currentLoad}h / 40h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gaps & Training Roadmaps */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              2. Skill Gaps & Training Roadmaps
            </h2>
            {teamResult.skillGaps.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                All {teamResult.totalRequiredSkillCount} required skills are fully covered at or above target levels!
              </div>
            ) : (
              <div className="space-y-3">
                {teamResult.skillGaps.map(gap => (
                  <div
                    key={gap.skill}
                    className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {gap.skill} Gap: Target L{gap.requiredLevel} vs. Team Best {gap.teamBestLevel > 0 ? `L${gap.teamBestLevel}` : 'None'}
                      </span>
                      <span className="font-mono text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded text-[11px] border border-amber-200 dark:border-amber-800">
                        Est. {gap.totalWeeksToClose} Weeks to Close
                      </span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-amber-200/80 dark:border-amber-800/80 text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Primary Curriculum: </span>
                      <span>{gap.course.title} ({gap.course.provider})</span>
                    </div>

                    {/* 3 Step Roadmap */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {gap.roadmap.map(step => (
                        <div key={step.level} className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                            <span>{step.level}</span>
                            <span>{step.durationWeeks} wks</span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white text-[11px] truncate">{step.topic}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-2">{step.objective}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Print layout removes application chrome automatically
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Brief' : 'Copy Text'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
