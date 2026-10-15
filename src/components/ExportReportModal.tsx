import React, { useState } from 'react';
import { Employee } from '../types';
import { calculateWorkforceMetrics, generateRebalancePlan } from '../utils/workforceAlgorithms';
import { X, Copy, Check, Download, FileText } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  employees,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const metrics = calculateWorkforceMetrics(employees);
  const rebalancePlan = generateRebalancePlan(employees);

  const reportText = `=====================================================
WORKFORCEIQ — WORKFORCE INTELLIGENCE EXECUTIVE REPORT
Generated: ${new Date().toLocaleDateString()}
=====================================================

1. WORKFORCE CAPACITY SUMMARY
-----------------------------------------------------
• Total Headcount: ${metrics.totalEmployees} Engineers
• Total Weekly Capacity: ${metrics.totalCapacity} hours
• Allocated Workload: ${metrics.totalCurrentLoad} hours
• Average Utilization: ${metrics.avgUtilization}%
• Overloaded (>100%): ${metrics.overloadedCount} engineers
• Underused (<60%): ${metrics.underusedCount} engineers
• Balanced (60-100%): ${metrics.balancedCount} engineers

2. OVERLOADED STAFF AT RISK
-----------------------------------------------------
${metrics.overloaded.map(e => `• ${e.name} (${e.role}): ${e.currentLoad}h / 40h (${Math.round((e.currentLoad/40)*100)}% load, +${e.currentLoad-40}h excess)`).join('\n')}

3. AVAILABLE IDLE CAPACITY
-----------------------------------------------------
${metrics.underused.map(e => `• ${e.name} (${e.role}): ${e.currentLoad}h / 40h (${40-e.currentLoad}h available)`).join('\n')}

4. RECOMMENDED REBALANCE TRANSFERS
-----------------------------------------------------
• Total Transferable Hours: ${rebalancePlan.totalHoursMoved} hours across ${rebalancePlan.transfers.length} reallocations
${rebalancePlan.transfers.map((t, idx) => `${idx + 1}. From ${t.fromEmployeeName} -> To ${t.toEmployeeName}: ${t.hours}h (Skills: ${t.sharedSkills.join(', ')})`).join('\n')}

5. TOP WORKFORCE SKILLS
-----------------------------------------------------
${Object.entries(metrics.skillCounts).sort((a,b) => b[1]-a[1]).map(([s, count]) => `• ${s}: ${count} certified engineers`).join('\n')}
=====================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WorkforceIQ-Executive-Report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Workforce Intelligence Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Executive summary for management & resource planning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-950/60 space-y-4">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">
            {reportText}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">Ready to export or share with leadership</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
