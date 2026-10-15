import React from 'react';
import { Employee, BusFactorRisk } from '../types';
import { calculateBusFactorSkills } from '../utils/workforceAlgorithms';
import { AlertOctagon, UserPlus, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface BusFactorSectionProps {
  employees: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
}

export const BusFactorSection: React.FC<BusFactorSectionProps> = ({
  employees,
  onSelectEmployee,
}) => {
  const risks: BusFactorRisk[] = calculateBusFactorSkills(employees);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 p-6 shadow-sm space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bus Factor & Single Point of Failure (SPOF) Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flags critical capabilities held by only 1–2 staff members with automated cross-training recommendations
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
          {risks.length} Vulnerable Skills Identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {risks.map(item => {
          const isCritical = item.count === 1;
          const crossTrainEmp = employees.find(e => e.id === item.suggestedCrossTrainCandidate.id);

          return (
            <div
              key={item.skill}
              className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                isCritical
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{item.skill}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.count} certified practitioner{item.count > 1 ? 's' : ''}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                    isCritical
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                      : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {item.riskLevel}
                </span>
              </div>

              {/* Current Holders */}
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Sole Holder(s):</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.practitioners.map(p => {
                    const emp = employees.find(e => e.id === p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => emp && onSelectEmployee && onSelectEmployee(emp)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                      >
                        {p.name} (L{p.level})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Cross-Training */}
              <div className="p-2.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cross-Training Target:</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    onClick={() => crossTrainEmp && onSelectEmployee && onSelectEmployee(crossTrainEmp)}
                    className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:underline"
                  >
                    {item.suggestedCrossTrainCandidate.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    {40 - item.suggestedCrossTrainCandidate.currentLoad}h free
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {item.suggestedCrossTrainCandidate.reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
