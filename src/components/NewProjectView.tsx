import React, { useState, useMemo } from 'react';
import { Employee, RequiredSkill, SkillLevel, RecommendedTeamResult, CandidateEvaluation } from '../types';
import { ALL_SKILLS } from '../data/courseCatalog';
import { PROJECT_PRESETS } from '../data/initialData';
import { buildRecommendedTeam, getBurnoutRisk } from '../utils/workforceAlgorithms';
import { SkillRadarChart } from './charts/SkillRadarChart';
import { ExplainableMatchModal } from './ExplainableMatchModal';
import { TeamReportPrintModal } from './TeamReportPrintModal';
import { MultiProjectConflictDetector } from './MultiProjectConflictDetector';
import {
  Sparkles,
  Plus,
  Trash2,
  Users,
  Target,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  UserCheck,
  UserPlus,
  HelpCircle,
  Download,
  Calendar,
  Layers,
  Activity,
  SplitSquareVertical,
} from 'lucide-react';

interface NewProjectViewProps {
  employees: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({ employees, onSelectEmployee }) => {
  const [viewMode, setViewMode] = useState<'single' | 'conflicts'>('single');
  const [projectName, setProjectName] = useState('Next-Gen Cloud Fintech Platform');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([
    { skill: 'React', minLevel: 4 },
    { skill: 'TypeScript', minLevel: 4 },
    { skill: 'Go', minLevel: 4 },
    { skill: 'PostgreSQL', minLevel: 4 },
    { skill: 'Kubernetes', minLevel: 4 },
  ]);

  const [newSkillName, setNewSkillName] = useState<string>('Python');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>(3);
  const [manualTeamOverrides, setManualTeamOverrides] = useState<string[] | null>(null);

  // Modals state
  const [selectedExplainCandidate, setSelectedExplainCandidate] = useState<CandidateEvaluation | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Active roadmap tab for each gap (accordion/tab state)
  const [expandedGapRoadmap, setExpandedGapRoadmap] = useState<string | null>(null);

  // Compute recommended team result
  const teamResult: RecommendedTeamResult = useMemo(() => {
    const autoResult = buildRecommendedTeam(employees, requiredSkills, teamSize, projectName);

    if (!manualTeamOverrides) {
      return autoResult;
    }

    const overriddenCandidates = autoResult.allCandidates.map(c => ({
      ...c,
      isSelected: manualTeamOverrides.includes(c.employee.id),
    }));

    const selectedMembers = overriddenCandidates.filter(c => c.isSelected);

    const skillGaps = autoResult.skillGaps.map(gap => {
      let teamBest = 0;
      for (const m of selectedMembers) {
        const lvl = m.employee.skills[gap.skill] || 0;
        if (lvl > teamBest) teamBest = lvl;
      }
      return {
        ...gap,
        teamBestLevel: teamBest,
        gap: gap.requiredLevel - teamBest,
      };
    }).filter(g => g.teamBestLevel < g.requiredLevel);

    let coveredCount = 0;
    for (const req of requiredSkills) {
      const best = Math.max(0, ...selectedMembers.map(m => m.employee.skills[req.skill] || 0));
      if (best >= req.minLevel) coveredCount++;
    }

    const teamScore = selectedMembers.length > 0
      ? Math.round(selectedMembers.reduce((sum, m) => sum + m.totalMatchScore, 0) / selectedMembers.length)
      : 0;

    const skillCoveragePct = requiredSkills.length > 0
      ? Math.round((coveredCount / requiredSkills.length) * 100)
      : 100;

    return {
      ...autoResult,
      projectName,
      selectedMembers,
      teamScore,
      skillCoveragePct,
      coveredSkillCount: coveredCount,
      totalRequiredSkillCount: requiredSkills.length,
      skillGaps,
      allCandidates: overriddenCandidates,
    };
  }, [employees, requiredSkills, teamSize, projectName, manualTeamOverrides]);

  // Compute map of team best levels for radar chart
  const teamBestLevelsMap = useMemo(() => {
    const map: Record<string, number> = {};
    requiredSkills.forEach(req => {
      let best = 0;
      teamResult.selectedMembers.forEach(m => {
        const lvl = m.employee.skills[req.skill] || 0;
        if (lvl > best) best = lvl;
      });
      map[req.skill] = best;
    });
    return map;
  }, [requiredSkills, teamResult.selectedMembers]);

  const handleApplyPreset = (preset: typeof PROJECT_PRESETS[0]) => {
    setProjectName(preset.name);
    setTeamSize(preset.teamSize);
    setRequiredSkills([...preset.skills]);
    setManualTeamOverrides(null);
  };

  const handleAddSkill = () => {
    if (requiredSkills.some(r => r.skill === newSkillName)) return;
    setRequiredSkills(prev => [...prev, { skill: newSkillName, minLevel: newSkillLevel }]);
    setManualTeamOverrides(null);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(prev => prev.filter(r => r.skill !== skillToRemove));
    setManualTeamOverrides(null);
  };

  const handleUpdateSkillLevel = (skillName: string, level: SkillLevel) => {
    setRequiredSkills(prev =>
      prev.map(r => (r.skill === skillName ? { ...r, minLevel: level } : r))
    );
    setManualTeamOverrides(null);
  };

  const handleToggleCandidate = (empId: string) => {
    const currentSelectedIds = manualTeamOverrides !== null
      ? [...manualTeamOverrides]
      : teamResult.selectedMembers.map(m => m.employee.id);

    if (currentSelectedIds.includes(empId)) {
      setManualTeamOverrides(currentSelectedIds.filter(id => id !== empId));
    } else {
      if (currentSelectedIds.length >= teamSize) {
        const updated = [...currentSelectedIds.slice(0, teamSize - 1), empId];
        setManualTeamOverrides(updated);
      } else {
        setManualTeamOverrides([...currentSelectedIds, empId]);
      }
    }
  };

  const handleResetToAuto = () => {
    setManualTeamOverrides(null);
  };

  const remainingSkillsToAdd = ALL_SKILLS.filter(s => !requiredSkills.some(r => r.skill === s));

  return (
    <div className="space-y-6">
      {/* Title & Report Download Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Project Team Builder</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic staff matching based on skill fit (60%), experience (15%), availability (25%), and team chemistry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {manualTeamOverrides !== null && (
            <button
              onClick={handleResetToAuto}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mr-2"
            >
              Reset to Optimal
            </button>
          )}

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Team Report
          </button>
        </div>
      </div>

      {/* View Mode Segmented Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setViewMode('single')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            viewMode === 'single'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Single Initiative Builder
        </button>

        <button
          onClick={() => setViewMode('conflicts')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            viewMode === 'conflicts'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          Multi-Project Conflict Detector (2–3 Initiatives)
        </button>
      </div>

      {viewMode === 'conflicts' ? (
        <MultiProjectConflictDetector
          employees={employees}
          onSelectEmployee={onSelectEmployee}
        />
      ) : (
        <>
      {/* Preset Quick Selectors */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Project Templates:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PROJECT_PRESETS.map((preset) => {
            const isCurrent = projectName === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="truncate font-semibold mb-1">{preset.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  {preset.teamSize} members · {preset.skills.length} skills required
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Definition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              1. Project Requirements
            </h2>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g. Next-Gen Cloud Platform"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Team Size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Team Size</label>
                <span className="text-xs font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {teamSize} Engineers
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={7}
                value={teamSize}
                onChange={e => {
                  setTeamSize(Number(e.target.value));
                  setManualTeamOverrides(null);
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>2 (Lean)</span>
                <span>4 (Standard)</span>
                <span>7 (Scale)</span>
              </div>
            </div>

            {/* Required Skills List */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Required Competencies ({requiredSkills.length})
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Target Level (1-5)</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {requiredSkills.map(req => (
                  <div
                    key={req.skill}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{req.skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleUpdateSkillLevel(req.skill, lvl as SkillLevel)}
                            className={`w-5 h-5 rounded text-[11px] font-mono tabular-nums font-semibold transition-colors ${
                              req.minLevel >= lvl
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(req.skill)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Skill Row */}
              {remainingSkillsToAdd.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <select
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    {remainingSkillsToAdd.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(Number(e.target.value) as SkillLevel)}
                    className="w-20 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value={2}>L2 Basic</option>
                    <option value={3}>L3 Proficient</option>
                    <option value={4}>L4 Advanced</option>
                    <option value={5}>L5 Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Add skill requirement"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Skill Gap Radar Chart */}
          <div>
            <SkillRadarChart
              requiredSkills={requiredSkills}
              teamBestLevels={teamBestLevelsMap}
            />
          </div>
        </div>

        {/* Right Column: Recommended Team Output */}
        <div className="lg:col-span-7 space-y-5">
          {/* Team Metric Summary Cards (Team Score, Chemistry Score, Skill Coverage) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Team Score */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team Overall Fit</span>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                  {teamResult.teamScore}%
                </span>
                <span className="text-xs text-slate-400">composite match</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${teamResult.teamScore}%` }}
                />
              </div>
            </div>

            {/* Team Chemistry Score */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team Chemistry</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {teamResult.chemistry.overallScore}%
                </span>
                <span className="text-xs text-slate-400">synergy rating</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={teamResult.chemistry.assessment}>
                {teamResult.chemistry.uniqueSkillsCount} skills · std dev {teamResult.chemistry.loadStandardDeviation}h
              </div>
            </div>

            {/* Skill Coverage % */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Skill Coverage</span>
              <div className="flex items-baseline gap-2 my-1">
                <span className={`text-3xl font-bold font-mono tabular-nums ${
                  teamResult.skillCoveragePct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {teamResult.skillCoveragePct}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {teamResult.coveredSkillCount}/{teamResult.totalRequiredSkillCount} covered
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    teamResult.skillCoveragePct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${teamResult.skillCoveragePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skill Gap Alerts & Training Roadmaps */}
          {teamResult.skillGaps.length > 0 ? (
            <div className="bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-semibold text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Skill Shortage Alert: {teamResult.skillGaps.length} Target(s) Need Upskilling</span>
                </div>
                <span className="text-[11px] font-normal text-amber-800 dark:text-amber-300">
                  Step-by-step training roadmaps included below
                </span>
              </div>

              <div className="space-y-3">
                {teamResult.skillGaps.map(gap => {
                  const isExpanded = expandedGapRoadmap === gap.skill;
                  return (
                    <div
                      key={gap.skill}
                      className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200/80 dark:border-amber-800/80 text-xs shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{gap.skill}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            (Target: L{gap.requiredLevel} · Team Best: {gap.teamBestLevel > 0 ? `L${gap.teamBestLevel}` : 'None'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                            Gap: -{gap.gap} Level
                          </span>
                          <button
                            onClick={() => setExpandedGapRoadmap(isExpanded ? null : gap.skill)}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {isExpanded ? 'Hide Roadmap' : 'View Roadmap'}
                          </button>
                        </div>
                      </div>

                      {/* Course summary */}
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-slate-500 dark:text-slate-400">Primary Course: </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{gap.course.title}</span>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{gap.course.provider}</span>
                            <span>· {gap.course.duration}</span>
                            <span>· Est. {gap.totalWeeksToClose} weeks to close gap</span>
                          </div>
                        </div>
                      </div>

                      {/* Hire vs Train vs Outsource Advisor Recommendation Card */}
                      {gap.advisorRecommendation && (
                        <div className={`p-2.5 rounded-lg border text-[11px] space-y-1.5 ${
                          gap.advisorRecommendation.action === 'Train'
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                            : gap.advisorRecommendation.action === 'Hire'
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80'
                            : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              Hire vs Train vs Outsource Advisor:
                            </span>
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                              gap.advisorRecommendation.action === 'Train'
                                ? 'bg-emerald-600 text-white'
                                : gap.advisorRecommendation.action === 'Hire'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}>
                              Recommendation: {gap.advisorRecommendation.action}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {gap.advisorRecommendation.headline}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {gap.advisorRecommendation.reason}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800 font-mono">
                            <span>Target Timeframe: {gap.advisorRecommendation.timeToClose}</span>
                            <span>Projected Cost: {gap.advisorRecommendation.estimatedCost}</span>
                          </div>
                        </div>
                      )}

                      {/* Expandable Step-by-Step Training Roadmap */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                            Sequential Learning Path ({gap.totalWeeksToClose} Weeks Total):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {gap.roadmap.map((step, sIdx) => (
                              <div
                                key={step.level}
                                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-indigo-600 dark:text-indigo-400">
                                    Stage {sIdx + 1}: {step.level}
                                  </span>
                                  <span className="font-mono text-slate-500 text-[10px]">{step.durationWeeks} wks</span>
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-white text-xs">{step.topic}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{step.objective}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 p-3.5 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">
                100% Skill Coverage Achieved! The assembled team satisfies every target competency.
              </span>
            </div>
          )}

          {/* Team Compatibility History Banner */}
          {teamResult.compatibilityPairs && teamResult.compatibilityPairs.length > 0 && (
            <div className="p-3.5 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 rounded-xl border border-violet-200 dark:border-violet-800/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="text-xs font-bold text-violet-950 dark:text-violet-200">
                    Team Compatibility History: {teamResult.compatibilityPairs.length} High-Synergy Pair(s) Identified
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-300 rounded font-semibold text-[10px]">
                  +{(teamResult.compatibilityPairs.length * 4)} Chemistry Boost
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {teamResult.compatibilityPairs.map((pair, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-violet-200/80 dark:border-violet-800/80 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        {pair.emp1Name} & {pair.emp2Name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {pair.summary}
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] rounded shrink-0 border border-emerald-200">
                      ★ Worked well together before
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Team Members Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recommended Team ({teamResult.selectedMembers.length} Members)
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Click 'Why this person?' for full score justification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamResult.selectedMembers.map(cand => {
                const emp = cand.employee;
                const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);

                // Check compatibility with other squad members
                const sharedWithSquad = teamResult.selectedMembers
                  .filter(m => m.employee.id !== emp.id)
                  .flatMap(m => {
                    const overlap = (emp.pastProjects || []).filter(p => (m.employee.pastProjects || []).includes(p));
                    return overlap.map(proj => ({ colleague: m.employee.name, project: proj }));
                  });

                return (
                  <div
                    key={emp.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="truncate">
                          <p
                            onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                            className="font-bold text-slate-900 dark:text-white text-xs truncate cursor-pointer hover:underline hover:text-indigo-600"
                          >
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{emp.role}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                          {cand.totalMatchScore}%
                        </span>
                        <div className="mt-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            risk.level === 'High'
                              ? 'bg-red-50 text-red-700'
                              : risk.level === 'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {risk.level} Risk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Worked well together before badge if shared past projects exist */}
                    {sharedWithSquad.length > 0 && (
                      <div className="p-1.5 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800 rounded-md flex items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-violet-700 dark:text-violet-300">★ Worked well together before:</span>
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                          with {sharedWithSquad[0].colleague} ({sharedWithSquad[0].project})
                        </span>
                      </div>
                    )}

                    {/* Breakdown meters */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 font-mono tabular-nums">
                      <div className="bg-white dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Skill Fit</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{cand.skillFitScore}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Exp ({emp.experienceYears}y)</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{cand.experienceScore}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Free Cap</span>
                        <span className={`font-semibold ${cand.availabilityScore === 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                          {cand.availabilityScore}%
                        </span>
                      </div>
                    </div>

                    {/* Contributed skills */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {requiredSkills.map(req => {
                        const lvl = emp.skills[req.skill];
                        if (!lvl) return null;
                        const meets = lvl >= req.minLevel;
                        return (
                          <span
                            key={req.skill}
                            className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                              meets ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {req.skill}: L{lvl}
                          </span>
                        );
                      })}
                    </div>

                    {/* "Why this person?" Action Button */}
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedExplainCandidate(cand)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:underline"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Why this person?
                      </button>

                      <button
                        onClick={() => handleToggleCandidate(emp.id)}
                        className="text-[11px] text-slate-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Ranking Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">All Candidate Evaluations & Rankings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked by composite fit: 60% Skill Match + 15% Experience + 25% Availability
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Click 'Swap / Toggle' to customize team roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <th className="p-3 text-center w-12 font-semibold">Rank</th>
                <th className="p-3 font-semibold">Candidate</th>
                <th className="p-3 text-center font-semibold">Burnout Risk</th>
                <th className="p-3 text-center font-semibold">Match Score</th>
                <th className="p-3 text-center font-semibold">Skill Fit (60%)</th>
                <th className="p-3 text-center font-semibold">Experience (15%)</th>
                <th className="p-3 text-center font-semibold">Availability (25%)</th>
                <th className="p-3 text-center font-semibold">Current Load</th>
                <th className="p-3 text-center font-semibold">Roster Status</th>
                <th className="p-3 text-right font-semibold pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teamResult.allCandidates.map((cand, idx) => {
                const emp = cand.employee;
                const isSelected = cand.isSelected;
                const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);

                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-3 text-center font-mono font-bold text-slate-500">
                      #{idx + 1}
                    </td>

                    {/* Candidate */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center text-xs shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Burnout Risk */}
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        risk.level === 'High'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : risk.level === 'Medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {risk.level}
                      </span>
                    </td>

                    {/* Total Match Score */}
                    <td className="p-3 text-center font-mono font-bold tabular-nums">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${cand.totalMatchScore}%` }}
                          />
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">{cand.totalMatchScore}%</span>
                      </div>
                    </td>

                    {/* Skill Fit */}
                    <td className="p-3 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {cand.skillFitScore}%
                    </td>

                    {/* Experience */}
                    <td className="p-3 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {cand.experienceScore}% <span className="text-slate-400 text-[10px]">({emp.experienceYears}y)</span>
                    </td>

                    {/* Availability */}
                    <td className="p-3 text-center font-mono tabular-nums">
                      <span className={cand.availabilityScore === 0 ? 'text-red-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                        {cand.availabilityScore}%
                      </span>
                    </td>

                    {/* Current Load */}
                    <td className="p-3 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {emp.currentLoad}h / 40h
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Available</span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="p-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedExplainCandidate(cand)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="View score explanation"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleCandidate(emp.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            isSelected
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {isSelected ? 'Remove' : 'Select'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Explainable Matching Breakdown Modal */}
      <ExplainableMatchModal
        candidate={selectedExplainCandidate}
        onClose={() => setSelectedExplainCandidate(null)}
        requiredSkills={requiredSkills}
      />

      {/* Download Team Report Modal */}
      <TeamReportPrintModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        teamResult={teamResult}
        requiredSkills={requiredSkills}
      />
    </div>
  );
};
