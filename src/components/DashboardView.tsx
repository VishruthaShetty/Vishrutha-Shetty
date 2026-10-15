import React, { useState, useMemo } from 'react';
import { Employee, ActivityLogItem } from '../types';
import {
  calculateWorkforceMetrics,
  matchesNaturalLanguage,
  getBurnoutRisk,
  calculateTeamWellbeing,
  getPredictedOverloadEmployees,
} from '../utils/workforceAlgorithms';
import { WorkloadBarChart } from './charts/WorkloadBarChart';
import { SkillDoughnutChart } from './charts/SkillDoughnutChart';
import { SkillSupplyDemandChart } from './charts/SkillSupplyDemandChart';
import { SkillMatrixTable } from './SkillMatrixTable';
import { BusFactorSection } from './BusFactorSection';
import { ActivityLogSection } from './ActivityLogSection';
import {
  Users,
  AlertTriangle,
  Clock,
  Activity,
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
  Timer,
  ShieldAlert,
  X,
  Scale,
  Percent,
  Heart,
  Palmtree,
  Smile,
} from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  activityLogs?: ActivityLogItem[];
  onNavigate: (tab: 'dashboard' | 'employees' | 'new-project' | 'workload') => void;
  onSelectEmployee: (employee: Employee) => void;
  onOpenAddModal?: () => void;
  onOpenLeaveCalendar?: () => void;
  onOpenWellbeingModal?: () => void;
}

const SAMPLE_QUERIES = [
  'python and cloud',
  'react and typescript',
  'overloaded',
  'data engineering',
  'underused',
  'docker or kubernetes',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  activityLogs = [],
  onNavigate,
  onSelectEmployee,
  onOpenAddModal,
  onOpenLeaveCalendar,
  onOpenWellbeingModal,
}) => {
  const [nlQuery, setNlQuery] = useState('');

  // Filter employees using natural language query
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => matchesNaturalLanguage(emp, nlQuery));
  }, [employees, nlQuery]);

  const allMetrics = useMemo(() => calculateWorkforceMetrics(employees), [employees]);
  const filteredMetrics = useMemo(() => calculateWorkforceMetrics(filteredEmployees), [filteredEmployees]);
  const activeMetrics = nlQuery.trim() ? filteredMetrics : allMetrics;

  // Early warning system & wellbeing calculations
  const predictedOverloads = useMemo(() => getPredictedOverloadEmployees(employees), [employees]);
  const wellbeing = useMemo(() => calculateTeamWellbeing(employees), [employees]);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workforce Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time capacity utilization, early overload warning, team wellbeing, and talent supply-demand intelligence
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenLeaveCalendar && (
            <button
              onClick={onOpenLeaveCalendar}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg shadow-2xs transition-colors"
            >
              <Palmtree className="w-3.5 h-3.5 text-amber-600" />
              <span>Leaves ({employees.filter(e => e.isOnLeave).length})</span>
            </button>
          )}
          {onOpenWellbeingModal && (
            <button
              onClick={onOpenWellbeingModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-pink-800 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/60 border border-pink-200 dark:border-pink-800 rounded-lg shadow-2xs transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-pink-600" />
              <span>Wellbeing ({wellbeing.score}/100)</span>
            </button>
          )}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>+ Add Employee</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('employees')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <span>Directory</span>
          </button>
          <button
            onClick={() => onNavigate('new-project')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            Assemble Project Team
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Natural Language Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={nlQuery}
            onChange={e => setNlQuery(e.target.value)}
            placeholder="Natural language search: try 'python and cloud', 'react and typescript', 'overloaded', 'data engineering'..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {nlQuery && (
            <button
              onClick={() => setNlQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Try searching:
          </span>
          {SAMPLE_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => setNlQuery(q)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                nlQuery.toLowerCase() === q.toLowerCase()
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              "{q}"
            </button>
          ))}
          {nlQuery && (
            <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              Showing {filteredEmployees.length} of {employees.length} matches
            </span>
          )}
        </div>
      </div>

      {/* Burnout Risk Alert Banner (if High Risk present) */}
      {allMetrics.highRiskCount > 0 && (
        <div className="p-4 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/80 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-900 dark:text-red-200 uppercase tracking-wider">
                  Burnout Risk Alert
                </span>
                <span className="text-[11px] font-mono font-bold bg-red-200/80 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.2 rounded-full">
                  {allMetrics.highRiskCount} Engineers at High Risk
                </span>
              </div>
              <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                {allMetrics.overloaded.map(e => e.name).slice(0, 3).join(', ')} are exceeding safe capacity by 4+ hours/week. Immediate reallocation recommended.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('workload')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Resolve in Rebalance Engine →
          </button>
        </div>
      )}

      {/* Summary KPI Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employees */}
        <div
          onClick={() => onNavigate('employees')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Headcount</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeMetrics.totalEmployees}
            </span>
            <span className="text-xs text-slate-500">Engineers</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Capacity:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {activeMetrics.totalCapacity}h
            </span>
          </div>
        </div>

        {/* Burnout At-Risk Alert Card */}
        <div
          onClick={() => onNavigate('workload')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/60 p-5 shadow-sm cursor-pointer hover:border-red-400 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-red-600">At-Risk Staff</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600 font-mono tabular-nums">
              {activeMetrics.highRiskCount}
            </span>
            <span className="text-xs text-red-600 font-medium">High Risk</span>
          </div>
          <div className="mt-2 text-[11px] text-red-600 flex items-center justify-between font-medium">
            <span>+{activeMetrics.mediumRiskCount} Medium</span>
            <span className="underline">Mitigate →</span>
          </div>
        </div>

        {/* Overloaded */}
        <div
          onClick={() => onNavigate('workload')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm cursor-pointer hover:border-red-300 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-red-600">Overloaded</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600 font-mono tabular-nums">
              {activeMetrics.overloadedCount}
            </span>
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">&gt; 100%</span>
          </div>
          <div className="mt-2 text-[11px] text-red-600 flex items-center justify-between font-medium">
            <span>Critical excess</span>
            <span className="underline">Rebalance →</span>
          </div>
        </div>

        {/* Workload Fairness Score Card */}
        <div
          onClick={() => onNavigate('workload')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm cursor-pointer hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Fairness</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
              {activeMetrics.fairnessScore}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between font-medium">
            <span>Equality Index</span>
            <span className="text-indigo-600 dark:text-indigo-400 underline">Details →</span>
          </div>
        </div>

        {/* Avg Utilization */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Utilization</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeMetrics.avgUtilization}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {activeMetrics.totalCurrentLoad}h
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Benchmark:</span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">75% - 85%</span>
          </div>
        </div>
      </div>

      {/* Impact Panel (Calculated from Live Data) */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">
                Workforce Intelligence Impact & ROI
              </h3>
            </div>
            <p className="text-xs text-indigo-300/80 mt-0.5">
              Quantifiable operational efficiencies achieved through automated capacity rebalancing
            </p>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
            Real-Time Model Calculations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-indigo-950/50 rounded-lg border border-indigo-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                ~{allMetrics.impact.hoursSavedPerMonth}h
              </span>
              <p className="text-[11px] text-indigo-300 font-medium">Saved per Month</p>
              <p className="text-[10px] text-indigo-400/80">From burnout churn & context-switching</p>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/50 rounded-lg border border-indigo-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                {allMetrics.impact.overloadReductionPct}%
              </span>
              <p className="text-[11px] text-indigo-300 font-medium">Overload Reduction</p>
              <p className="text-[10px] text-indigo-400/80">Eliminates critical capacity bottlenecks</p>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/50 rounded-lg border border-indigo-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                {allMetrics.impact.staffingTimeReducedPct}%
              </span>
              <p className="text-[11px] text-indigo-300 font-medium">Staffing Velocity</p>
              <p className="text-[10px] text-indigo-400/80">Reduced team assembly from 8 days to minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Factor & Single Point of Failure (SPOF) Section */}
      <div>
        <BusFactorSection
          employees={employees}
          onSelectEmployee={onSelectEmployee}
        />
      </div>

      {/* Skill Supply vs Demand Chart */}
      <div>
        <SkillSupplyDemandChart
          employees={employees}
        />
      </div>

      {/* Main Charts Grid: Workload Bar Chart + Skill Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WorkloadBarChart
            employees={filteredEmployees}
            onSelectEmployee={onSelectEmployee}
          />
        </div>
        <div className="lg:col-span-5">
          <SkillDoughnutChart employees={filteredEmployees} />
        </div>
      </div>

      {/* Skill Matrix Table */}
      <div>
        <SkillMatrixTable
          employees={filteredEmployees}
          onSelectEmployee={onSelectEmployee}
        />
      </div>
    </div>
  );
};
