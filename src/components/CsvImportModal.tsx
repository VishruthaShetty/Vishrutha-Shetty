import React, { useState } from 'react';
import { Employee, SkillLevel } from '../types';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Users, Check } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newEmployees: Employee[], mode: 'append' | 'replace') => void;
}

export const CSV_TEMPLATE_CONTENT = `name,role,department,experienceYears,capacity,currentLoad,skills
Aria Vance,Senior Backend Engineer,Engineering,6,40,36,Go:4;PostgreSQL:5;Docker:4;Kubernetes:3
Darius Thorne,Cloud Infrastructure Lead,Platform & Infrastructure,8,40,42,AWS:5;Kubernetes:5;Docker:4;Python:3
Clara Zhang,Staff Frontend Architect,Product & Design,7,40,22,React:5;TypeScript:5;UI/UX Design:4;GraphQL:3
Mateo Silva,Machine Learning Engineer,Data & Analytics,5,40,38,Python:5;Machine Learning:4;Data Engineering:4
`;

export function downloadCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'workforceiq_employees_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        parseCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (raw: string) => {
    setParseErrors([]);
    setParsedEmployees([]);
    setHasParsed(true);

    const lines = raw
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length <= 1) {
      setParseErrors(['CSV file is empty or contains only the header row.']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const validEmployees: Employee[] = [];
    const errors: string[] = [];

    // Check minimum required headers
    const nameIdx = headers.indexOf('name');
    const roleIdx = headers.indexOf('role');
    const deptIdx = headers.indexOf('department');
    const expIdx = headers.indexOf('experienceyears') !== -1 ? headers.indexOf('experienceyears') : headers.indexOf('experience');
    const capIdx = headers.indexOf('capacity');
    const loadIdx = headers.indexOf('currentload') !== -1 ? headers.indexOf('currentload') : headers.indexOf('load');
    const skillsIdx = headers.indexOf('skills');

    if (nameIdx === -1 || roleIdx === -1) {
      setParseErrors(['Missing required headers: "name" and "role" must be present.']);
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Handle CSV cells with possible quotes or semicolons
      const parts: string[] = [];
      let inQuotes = false;
      let currentPart = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(currentPart.trim());
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      parts.push(currentPart.trim());

      const name = parts[nameIdx] || '';
      const role = parts[roleIdx] || '';
      const department = (deptIdx !== -1 && parts[deptIdx]) ? parts[deptIdx] : 'Engineering';
      const experienceYears = expIdx !== -1 ? parseFloat(parts[expIdx]) || 3 : 3;
      const capacity = capIdx !== -1 ? parseInt(parts[capIdx]) || 40 : 40;
      const currentLoad = loadIdx !== -1 ? parseInt(parts[loadIdx]) || 35 : 35;

      if (!name) {
        errors.push(`Row ${i + 1}: Name cannot be empty.`);
        continue;
      }
      if (!role) {
        errors.push(`Row ${i + 1} (${name}): Role cannot be empty.`);
        continue;
      }

      // Parse skills: e.g. "React:4;TypeScript:5;Node.js:3"
      const skillsRaw = skillsIdx !== -1 ? parts[skillsIdx] || '' : '';
      const skillsMap: Record<string, SkillLevel> = {};

      if (skillsRaw) {
        const skillEntries = skillsRaw.split(/[;,]/).map(s => s.trim()).filter(Boolean);
        skillEntries.forEach(entry => {
          const [skillName, lvlStr] = entry.split(':').map(x => x.trim());
          if (skillName) {
            const parsedLvl = parseInt(lvlStr) || 3;
            const clampedLvl = Math.max(1, Math.min(5, parsedLvl)) as SkillLevel;
            skillsMap[skillName] = clampedLvl;
          }
        });
      }

      if (Object.keys(skillsMap).length === 0) {
        skillsMap['Software Engineering'] = 3;
      }

      const newEmp: Employee = {
        id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        role,
        department,
        experienceYears,
        capacity: capacity > 0 ? capacity : 40,
        currentLoad: currentLoad >= 0 ? currentLoad : 35,
        baselineLoad: currentLoad >= 0 ? currentLoad : 35,
        skills: skillsMap,
        bio: `${role} with ${experienceYears} years experience in ${department}.`,
      };

      validEmployees.push(newEmp);
    }

    setParsedEmployees(validEmployees);
    setParseErrors(errors);
  };

  const handleConfirmImport = () => {
    if (parsedEmployees.length === 0) return;
    onImport(parsedEmployees, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Employee CSV Import
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload or paste a spreadsheet of engineers to populate the workforce at scale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Action Row: Download Template & File Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Need the correct column structure?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Format: <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">name,role,department,experienceYears,capacity,currentLoad,skills</code>
              </p>
            </div>
            <button
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold rounded-lg shadow-2xs text-xs whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Upload CSV File or Paste Text
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Choose .CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-slate-400 text-[11px]">or paste CSV content below</span>
            </div>

            <textarea
              rows={4}
              value={csvText}
              onChange={e => {
                setCsvText(e.target.value);
                if (e.target.value.trim()) {
                  parseCsv(e.target.value);
                } else {
                  setParsedEmployees([]);
                  setHasParsed(false);
                }
              }}
              placeholder={`name,role,department,experienceYears,capacity,currentLoad,skills\nJane Doe,Senior Backend Engineer,Engineering,5,40,38,Go:4;Docker:4;PostgreSQL:3`}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Import Mode: Append or Replace */}
          <div className="space-y-1.5 pt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Import Mode:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-indigo-600"
                />
                <span>Append to current workforce roster</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-indigo-600"
                />
                <span className="text-red-600 dark:text-red-400">Replace entire roster</span>
              </label>
            </div>
          </div>

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-800 dark:text-red-300 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Parse Errors Detected:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview of Parsed Records */}
          {hasParsed && parsedEmployees.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Ready to Import: {parsedEmployees.length} Valid Engineers
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Validated
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Exp</th>
                      <th className="p-2">Load/Cap</th>
                      <th className="p-2">Parsed Skills</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedEmployees.map((emp, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400">{emp.role}</td>
                        <td className="p-2 font-mono">{emp.experienceYears}y</td>
                        <td className="p-2 font-mono">{emp.currentLoad}h / {emp.capacity}h</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400">
                          {Object.entries(emp.skills).map(([s, l]) => `${s} (L${l})`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedEmployees.length === 0}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Import {parsedEmployees.length} Employees ({importMode === 'append' ? 'Append' : 'Replace'})
          </button>
        </div>
      </div>
    </div>
  );
};
