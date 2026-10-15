import React, { useState } from 'react';
import { Employee, RebalancePlan } from '../types';
import { generateRebalancePlan, getBurnoutRisk, calculateWorkloadFairnessScore } from '../utils/workforceAlgorithms';
import { BeforeAfterChart } from './charts/BeforeAfterChart';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Zap,
  Info,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';

interface WorkloadViewProps {
  employees: Employee[];
  onApplyRebalance: (updatedEmployees: Employee[]) => void;
  onResetBaseline: () => void;
  isRebalanceApplied: boolean;
  onSelectEmployee?: (employee: Employee) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({
  employees,
  onApplyRebalance,
  onResetBaseline,
  isRebalanceApplied,
  onSelectEmployee,
}) => {
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  // What-If Simulator State: employeeId -> simulatedHours
  const [simulatedHoursMap, setSimulatedHoursMap] = useState<Record<string, number>>({});
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);

  // Merge simulated hours if any
  const workingEmployees: Employee[] = employees.map(emp => ({
    ...emp,
    currentLoad: simulatedHoursMap[emp.id] !== undefined ? simulatedHoursMap[emp.id] : emp.currentLoad,
  }));

  const hasWhatIfChanges = Object.keys(simulatedHoursMap).length > 0;

  const handleSliderChange = (empId: string, newHours: number) => {
    setSimulatedHoursMap(prev => ({
      ...prev,
      [empId]: newHours,
    }));
  };

  const handleResetSimulator = () => {
    setSimulatedHoursMap({});
  };

  const handleCommitWhatIf = () => {
    onApplyRebalance(workingEmployees);
    setSimulatedHoursMap({});
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 5000);
  };

  // Overloaded (> 40h) and underused (< 24h)
  const overloadedEmployees = workingEmployees.filter(e => e.currentLoad > 40)
    .sort((a, b) => b.currentLoad - a.currentLoad);

  const underusedEmployees = workingEmployees.filter(e => e.currentLoad < 24)
    .sort((a, b) => a.currentLoad - b.currentLoad);

  // Generate rebalance plan based on working state
  const rebalancePlan: RebalancePlan = generateRebalancePlan(workingEmployees);

  // Calculate Workload Fairness Scores (0-100)
  const baselineEmployees = employees.map(e => ({ ...e, currentLoad: e.baselineLoad }));
  const beforeFairnessScore = calculateWorkloadFairnessScore(baselineEmployees);

  const simulatedAfterEmployees = workingEmployees.map(emp => {
    let load = emp.currentLoad;
    rebalancePlan.transfers.forEach(t => {
      if (t.fromEmployeeId === emp.id) load -= t.hours;
      if (t.toEmployeeId === emp.id) load += t.hours;
    });
    return { ...emp, currentLoad: Math.max(0, load) };
  });

  const currentFairnessScore = calculateWorkloadFairnessScore(workingEmployees);
  const afterFairnessScore = isRebalanceApplied ? currentFairnessScore : calculateWorkloadFairnessScore(simulatedAfterEmployees);

  const handleApply = () => {
    const newEmployees = workingEmployees.map(emp => {
      let load = emp.currentLoad;
      rebalancePlan.transfers.forEach(t => {
        if (t.fromEmployeeId === emp.id) load -= t.hours;
        if (t.toEmployeeId === emp.id) load += t.hours;
      });
      return {
        ...emp,
        currentLoad: Math.max(0, load),
      };
    });

    onApplyRebalance(newEmployees);
    setSimulatedHoursMap({});
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workload Rebalancing Engine</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated task reallocation between overloaded (&gt;100%) and underused (&lt;60%) staff with live What-If simulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasWhatIfChanges && (
            <button
              onClick={handleCommitWhatIf}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Commit What-If Loads
            </button>
          )}

          {isRebalanceApplied ? (
            <button
              onClick={onResetBaseline}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Baseline
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={rebalancePlan.transfers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all hover:shadow"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Apply Rebalance ({rebalancePlan.totalHoursMoved}h Total)
            </button>
          )}
        </div>
      </div>

      {/* Workload Fairness Score Comparison Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Workforce Health Metric
              </span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Gini distribution equality index</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Workload Fairness Score (0–100)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measures how evenly hours are spread across the team. Higher scores prevent burnout silos and idle pockets.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            {/* Before Score */}
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Before</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-600 dark:text-slate-400">
                {beforeFairnessScore}
              </span>
              <span className="text-[10px] text-slate-400 block">/ 100</span>
            </div>

            <div className="text-slate-300 dark:text-slate-600 font-bold text-lg">→</div>

            {/* After Score */}
            <div className="text-center px-2">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block uppercase">After Rebalance</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {afterFairnessScore}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                +{afterFairnessScore - beforeFairnessScore} pts improvement
              </span>
            </div>
          </div>
        </div>

        {/* Visual Fairness Bar */}
        <div className="space-y-1 pt-1">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-300"
              style={{ width: `${beforeFairnessScore}%` }}
              title={`Before fairness: ${beforeFairnessScore}%`}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(0, afterFairnessScore - beforeFairnessScore)}%` }}
              title={`Improvement delta: +${afterFairnessScore - beforeFairnessScore}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0 (Severe Disparity)</span>
            <span>50 (Moderate Imbalance)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100 (Perfect Equality)</span>
          </div>
        </div>
      </div>

      {/* Rebalance Toast */}
      {showAppliedToast && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Workload schedule applied! Capacity leveled across matched engineers.
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">Live load active</span>
        </div>
      )}

      {/* What-If Simulator Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900/60 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                What-If Capacity Simulator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust employee work hours dynamically and watch utilization & burnout risks update live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasWhatIfChanges && (
              <button
                onClick={handleResetSimulator}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Sliders
              </button>
            )}
            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isSimulatorOpen ? 'Collapse Controls' : 'Expand Controls'}
            </button>
          </div>
        </div>

        {isSimulatorOpen && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {workingEmployees.map(emp => {
                const current = emp.currentLoad;
                const original = employees.find(e => e.id === emp.id)?.currentLoad || 40;
                const delta = current - original;
                const risk = getBurnoutRisk(current, emp.capacity);

                return (
                  <div
                    key={`sim-${emp.id}`}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      delta !== 0
                        ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => {
                          const orig = employees.find(e => e.id === emp.id) || emp;
                          onSelectEmployee?.(orig);
                        }}
                        className="font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                        title="Click to view employee profile"
                      >
                        {emp.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        risk.level === 'High'
                          ? 'bg-red-50 text-red-700'
                          : risk.level === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {risk.level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                      <span className="text-slate-500 dark:text-slate-400">{current}h / 40h</span>
                      {delta !== 0 && (
                        <span className={`font-semibold ${delta > 0 ? 'text-indigo-600' : 'text-emerald-600'}`}>
                          {delta > 0 ? `+${delta}h` : `${delta}h`}
                        </span>
                      )}
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={55}
                      step={1}
                      value={current}
                      onChange={e => handleSliderChange(emp.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>
                );
              })}
            </div>

            {hasWhatIfChanges && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                <span className="text-indigo-950 dark:text-indigo-200">
                  Simulation active: charts and rebalancing proposals reflect adjusted workloads.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetSimulator}
                    className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleCommitWhatIf}
                    className="px-3 py-1 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                  >
                    Commit What-If
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Column Lists: Overloaded vs Underused Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overloaded List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Overloaded Engineers (&gt; 40h)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
              {overloadedEmployees.length} Critical
            </span>
          </div>

          {overloadedEmployees.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              No overloaded employees currently. All team members are within safe capacity limits.
            </div>
          ) : (
            <div className="space-y-2.5">
              {overloadedEmployees.map(emp => {
                const excess = emp.currentLoad - 40;
                const pct = Math.round((emp.currentLoad / 40) * 100);
                const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);

                return (
                  <div
                    key={emp.id}
                    className="p-3 rounded-lg border border-red-100 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/30 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => {
                            const orig = employees.find(e => e.id === emp.id) || emp;
                            onSelectEmployee?.(orig);
                          }}
                          className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                          title="Click to view employee profile"
                        >
                          {emp.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">· {emp.role}</span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                          {risk.level} Risk
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(emp.skills)
                          .filter(([_, lvl]) => lvl >= 3)
                          .map(([s, lvl]) => (
                            <span
                              key={s}
                              className="bg-white dark:bg-slate-800 border border-red-200/60 dark:border-red-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded"
                            >
                              {s} (L{lvl})
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <div className="text-red-700 dark:text-red-300 font-bold">{emp.currentLoad}h / 40h</div>
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">+{excess}h excess ({pct}%)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Underused List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Underused Engineers (&lt; 24h / &lt; 60%)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
              {underusedEmployees.length} Idle Capacity
            </span>
          </div>

          {underusedEmployees.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              No underused employees. Team utilization is well balanced across the workforce.
            </div>
          ) : (
            <div className="space-y-2.5">
              {underusedEmployees.map(emp => {
                const available = 40 - emp.currentLoad;
                const pct = Math.round((emp.currentLoad / 40) * 100);

                return (
                  <div
                    key={emp.id}
                    className="p-3 rounded-lg border border-sky-100 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/30 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => {
                            const orig = employees.find(e => e.id === emp.id) || emp;
                            onSelectEmployee?.(orig);
                          }}
                          className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                          title="Click to view employee profile"
                        >
                          {emp.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">· {emp.role}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(emp.skills)
                          .filter(([_, lvl]) => lvl >= 2)
                          .map(([s, lvl]) => (
                            <span
                              key={s}
                              className="bg-white dark:bg-slate-800 border border-sky-200/60 dark:border-sky-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded"
                            >
                              {s} (L{lvl})
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <div className="text-sky-700 dark:text-sky-300 font-bold">{emp.currentLoad}h / 40h</div>
                      <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">{available}h free ({pct}%)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Task Reallocation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Recommended Task Reallocations ({rebalancePlan.transfers.length} Transfers Planned)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Skill-matched task delegation moving excess hours to certified recipients
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-md">
              {rebalancePlan.totalHoursMoved} Hours Reassigned
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <th className="p-3 font-semibold">From (Overloaded Donor)</th>
                <th className="p-3 text-center w-8"></th>
                <th className="p-3 font-semibold">To (Underused Recipient)</th>
                <th className="p-3 text-center font-semibold">Hours Transferred</th>
                <th className="p-3 font-semibold">Shared Competencies</th>
                <th className="p-3 font-semibold">Task Delegation Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rebalancePlan.transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No active rebalance transfers required. Workforce loads are optimally distributed.
                  </td>
                </tr>
              ) : (
                rebalancePlan.transfers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    {/* From Donor */}
                    <td className="p-3">
                      <div>
                        <p
                          onClick={() => {
                            const emp = employees.find(e => e.id === item.fromEmployeeId);
                            if (emp) onSelectEmployee?.(emp);
                          }}
                          className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                          title="Click to view employee profile"
                        >
                          {item.fromEmployeeName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.fromEmployeeRole}</p>
                        <p className="text-[10px] text-red-600 font-mono mt-0.5">
                          Load: {item.fromLoadBefore}h
                        </p>
                      </div>
                    </td>

                    {/* Arrow */}
                    <td className="p-3 text-center text-slate-400">
                      <ArrowRight className="w-4 h-4 mx-auto text-indigo-500" />
                    </td>

                    {/* To Recipient */}
                    <td className="p-3">
                      <div>
                        <p
                          onClick={() => {
                            const emp = employees.find(e => e.id === item.toEmployeeId);
                            if (emp) onSelectEmployee?.(emp);
                          }}
                          className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                          title="Click to view employee profile"
                        >
                          {item.toEmployeeName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.toEmployeeRole}</p>
                        <p className="text-[10px] text-sky-600 font-mono mt-0.5">
                          Load: {item.toLoadBefore}h
                        </p>
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="p-3 text-center font-mono font-bold tabular-nums">
                      <span className="inline-block bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded text-xs">
                        {item.hours} hrs
                      </span>
                    </td>

                    {/* Shared Skills */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.sharedSkills.map(skill => (
                          <span
                            key={skill}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] px-1.5 py-0.5 rounded font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Rationale */}
                    <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.rationale}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Applying rebalance updates all active workload tracking without changing project deadlines.
          </div>
          <div className="flex items-center gap-2">
            {!isRebalanceApplied ? (
              <button
                onClick={handleApply}
                disabled={rebalancePlan.transfers.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
              >
                Apply Rebalance Now
              </button>
            ) : (
              <button
                onClick={onResetBaseline}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
              >
                Reset to Baseline Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Before vs After Chart */}
      <div>
        <BeforeAfterChart
          employees={workingEmployees}
          rebalancePlan={rebalancePlan}
          isApplied={isRebalanceApplied}
        />
      </div>
    </div>
  );
};
