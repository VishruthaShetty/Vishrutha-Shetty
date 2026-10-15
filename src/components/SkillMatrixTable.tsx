import React, { useState } from 'react';
import { Employee, SkillLevel } from '../types';
import { ALL_SKILLS } from '../data/courseCatalog';
import { getBurnoutRisk } from '../utils/workforceAlgorithms';
import { Search, ArrowUpDown, Filter, ShieldAlert } from 'lucide-react';

interface SkillMatrixTableProps {
  employees: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
}

export const SkillMatrixTable: React.FC<SkillMatrixTableProps> = ({ employees, onSelectEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [highlightSkill, setHighlightSkill] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'workload' | 'experience' | 'risk'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const departments = ['All', ...new Set(employees.map(e => e.department))];

  // Filter
  const filteredEmployees = employees.filter(emp => {
    const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesSkill = highlightSkill === 'All' || ((emp.skills[highlightSkill] || 0) > 0);
    const matchesRisk = selectedRisk === 'All' || risk.level === selectedRisk;
    return matchesSearch && matchesDept && matchesSkill && matchesRisk;
  });

  // Sort
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortField === 'name') {
      const res = a.name.localeCompare(b.name);
      return sortDirection === 'asc' ? res : -res;
    }
    if (sortField === 'workload') {
      const diff = a.currentLoad - b.currentLoad;
      return sortDirection === 'asc' ? diff : -diff;
    }
    if (sortField === 'experience') {
      const diff = a.experienceYears - b.experienceYears;
      return sortDirection === 'asc' ? diff : -diff;
    }
    if (sortField === 'risk') {
      const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const rA = riskOrder[getBurnoutRisk(a.currentLoad, a.capacity).level];
      const rB = riskOrder[getBurnoutRisk(b.currentLoad, b.capacity).level];
      return sortDirection === 'asc' ? rA - rB : rB - rA;
    }
    return 0;
  });

  const handleSort = (field: 'name' | 'workload' | 'experience' | 'risk') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderRiskBadge = (emp: Employee) => {
    const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);
    let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (risk.level === 'High') {
      badgeClass = 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
    } else if (risk.level === 'Medium') {
      badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    } else {
      badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }

    return (
      <span
        title={risk.reason}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold cursor-help ${badgeClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${
          risk.level === 'High' ? 'bg-red-500' : risk.level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
        {risk.level}
      </span>
    );
  };

  const renderSkillBadge = (level: SkillLevel | undefined) => {
    if (!level) {
      return <span className="text-slate-300 dark:text-slate-600 font-mono text-xs">·</span>;
    }

    let bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (level === 5) bgClass = 'bg-indigo-600 text-white font-bold';
    else if (level === 4) bgClass = 'bg-indigo-500 text-white font-semibold';
    else if (level === 3) bgClass = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 font-medium';
    else if (level === 2) bgClass = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
    else if (level === 1) bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

    return (
      <span
        title={`Proficiency Level ${level}/5`}
        className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono tabular-nums transition-transform hover:scale-110 ${bgClass}`}
      >
        {level}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Workforce Skill Matrix & Burnout Risk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cross-functional competency breakdown evaluated Level 1-5 with integrated burnout health indicators
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search engineer or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 dark:text-white w-48 sm:w-56"
              />
            </div>

            {/* Burnout Risk Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRisk}
                onChange={e => setSelectedRisk(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Risks</option>
                <option value="High">High Risk Only</option>
                <option value="Medium">Medium Risk Only</option>
                <option value="Low">Low Risk Only</option>
              </select>
            </div>

            {/* Department dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Dept:</span>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Skill filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={highlightSkill}
                onChange={e => setHighlightSkill(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Skills</option>
                {ALL_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <th
                onClick={() => handleSort('name')}
                className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white sticky left-0 bg-slate-50/95 dark:bg-slate-800/95 z-20 min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>Employee & Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('risk')}
                className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white text-center min-w-[85px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Risk</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('experience')}
                className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white text-center min-w-[60px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Exp</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('workload')}
                className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white text-center min-w-[90px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Load</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {ALL_SKILLS.map(skill => {
                const isSelected = highlightSkill === skill;
                return (
                  <th
                    key={skill}
                    className={`p-2.5 text-center font-semibold whitespace-nowrap min-w-[75px] transition-colors ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {skill}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedEmployees.length === 0 ? (
              <tr>
                <td colSpan={ALL_SKILLS.length + 4} className="p-8 text-center text-slate-400">
                  No engineers match current search and risk filters.
                </td>
              </tr>
            ) : (
              sortedEmployees.map(emp => {
                const isOverloaded = emp.currentLoad > 40;
                const isUnderused = emp.currentLoad < 24;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Fixed Name Column */}
                    <td className="p-3 sticky left-0 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 z-10 border-r border-slate-100 dark:border-slate-800">
                      <div
                        onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                        className="flex items-center gap-2.5 cursor-pointer group/emp"
                        title="Click to view comprehensive employee talent profile"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs shrink-0 group-hover/emp:ring-2 group-hover/emp:ring-indigo-500 transition-all">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 dark:text-white truncate group-hover/emp:text-indigo-600 dark:group-hover/emp:text-indigo-400 transition-colors">{emp.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{emp.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Burnout Risk Badge */}
                    <td className="p-3 text-center">
                      {renderRiskBadge(emp)}
                    </td>

                    {/* Exp */}
                    <td className="p-3 text-center font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                      {emp.experienceYears}y
                    </td>

                    {/* Load */}
                    <td className="p-3 text-center font-mono tabular-nums">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          isOverloaded
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : isUnderused
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {emp.currentLoad}h
                      </span>
                    </td>

                    {/* Skill cells */}
                    {ALL_SKILLS.map(skill => {
                      const level = emp.skills[skill];
                      const isHighlighted = highlightSkill === skill;
                      return (
                        <td
                          key={skill}
                          className={`p-2 text-center align-middle transition-colors ${
                            isHighlighted ? 'bg-indigo-50/40 dark:bg-indigo-950/40' : ''
                          }`}
                        >
                          {renderSkillBadge(level)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Displaying {sortedEmployees.length} of {employees.length} engineers</span>
        <span>Burnout Risk: High (&gt;42h/&gt;105%), Medium (36–42h), Low (&lt;36h)</span>
      </div>
    </div>
  );
};
