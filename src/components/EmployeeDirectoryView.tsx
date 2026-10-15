import React, { useState, useMemo } from 'react';
import { Employee, SkillLevel } from '../types';
import { ALL_SKILLS } from '../data/courseCatalog';
import { getBurnoutRisk } from '../utils/workforceAlgorithms';
import { downloadCsvTemplate } from './CsvImportModal';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Upload,
  Download,
  RotateCcw,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (employee: Employee) => void;
  onOpenDeleteModal: (employee: Employee) => void;
  onOpenImportModal: () => void;
  onResetDemoData: () => void;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({
  employees,
  onSelectEmployee,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenImportModal,
  onResetDemoData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'overloaded' | 'balanced' | 'underused'>('all');
  const [sortField, setSortField] = useState<'name' | 'role' | 'experience' | 'workload' | 'risk'>('workload');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Extract unique roles for dropdown
  const uniqueRoles = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.role));
    return Array.from(set).sort();
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      if (search) {
        const matchesName = emp.name.toLowerCase().includes(search);
        const matchesRole = emp.role.toLowerCase().includes(search);
        const matchesDept = (emp.department || '').toLowerCase().includes(search);
        const matchesSkill = Object.keys(emp.skills).some(s => s.toLowerCase().includes(search));
        if (!matchesName && !matchesRole && !matchesDept && !matchesSkill) {
          return false;
        }
      }

      // Role filter
      if (selectedRole !== 'all' && emp.role !== selectedRole) {
        return false;
      }

      // Skill filter
      if (selectedSkill !== 'all' && !emp.skills[selectedSkill]) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'overloaded' && emp.currentLoad <= 40) return false;
      if (selectedStatus === 'underused' && emp.currentLoad >= 24) return false;
      if (selectedStatus === 'balanced' && (emp.currentLoad > 40 || emp.currentLoad < 24)) return false;

      return true;
    });
  }, [employees, searchTerm, selectedRole, selectedSkill, selectedStatus]);

  // Sort employees
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'role') {
        comparison = a.role.localeCompare(b.role);
      } else if (sortField === 'experience') {
        comparison = a.experienceYears - b.experienceYears;
      } else if (sortField === 'workload') {
        comparison = (a.currentLoad / a.capacity) - (b.currentLoad / b.capacity);
      } else if (sortField === 'risk') {
        const riskRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        const rA = riskRank[getBurnoutRisk(a.currentLoad, a.capacity).level] || 0;
        const rB = riskRank[getBurnoutRisk(b.currentLoad, b.capacity).level] || 0;
        comparison = rA - rB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredEmployees, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'role' | 'experience' | 'workload' | 'risk') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Summary counts
  const overloadedCount = employees.filter(e => e.currentLoad > 40).length;
  const underusedCount = employees.filter(e => e.currentLoad < 24).length;
  const balancedCount = employees.filter(e => e.currentLoad >= 24 && e.currentLoad <= 40).length;
  const avgUtilization = employees.length > 0
    ? Math.round((employees.reduce((sum, e) => sum + e.currentLoad, 0) / (employees.length * 40)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Workforce Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage individual employee profiles, skill proficiencies, weekly capacity, and live status
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onResetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            title="Restore original 16 baseline employees"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo Data</span>
            <span className="sm:hidden">Reset</span>
          </button>

          <button
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            title="Download CSV spreadsheet template"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">CSV Template</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Import CSV
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Staff</span>
            <Users className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{employees.length}</span>
            <span className="text-xs text-slate-500">Engineers</span>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overloaded (&gt;100%)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-red-600">{overloadedCount}</span>
            <span className="text-xs text-red-600/80 font-medium">Critical</span>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Balanced (60–100%)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-600">{balancedCount}</span>
            <span className="text-xs text-emerald-600/80 font-medium">Optimal</span>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-sky-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Underused (&lt;60%)</span>
            <Clock className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-sky-600">{underusedCount}</span>
            <span className="text-xs text-sky-600/80 font-medium">Available</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role, department, or skill..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Role Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Roles ({uniqueRoles.length})</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Skills ({ALL_SKILLS.length})</option>
              {ALL_SKILLS.map(skill => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="overloaded">Overloaded (&gt;40h)</option>
              <option value="balanced">Balanced (24–40h)</option>
              <option value="underused">Underused (&lt;24h)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        {(searchTerm || selectedRole !== 'all' || selectedSkill !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{sortedEmployees.length}</span> of {employees.length} engineers
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedSkill('all');
                setSelectedStatus('all');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Sortable Employee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                {/* Name */}
                <th
                  onClick={() => handleSort('name')}
                  className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white min-w-[200px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee & Department</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Role */}
                <th
                  onClick={() => handleSort('role')}
                  className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white min-w-[170px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role / Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Experience */}
                <th
                  onClick={() => handleSort('experience')}
                  className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white text-center min-w-[70px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Exp</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Workload & Utilization */}
                <th
                  onClick={() => handleSort('workload')}
                  className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white min-w-[190px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Workload & Utilization</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Burnout Risk */}
                <th
                  onClick={() => handleSort('risk')}
                  className="p-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white text-center min-w-[90px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Risk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Competencies */}
                <th className="p-3 font-semibold min-w-[230px]">
                  <span>Technical Competencies</span>
                </th>

                {/* Actions */}
                <th className="p-3 font-semibold text-right min-w-[130px]">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No employees match current filters</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting the filters or register a new team member.</p>
                  </td>
                </tr>
              ) : (
                sortedEmployees.map(emp => {
                  const pct = Math.round((emp.currentLoad / emp.capacity) * 100);
                  const isOverloaded = pct > 100;
                  const isUnderused = pct < 60;
                  const risk = getBurnoutRisk(emp.currentLoad, emp.capacity);

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-3">
                        <div
                          onClick={() => onSelectEmployee(emp)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {emp.department || 'Engineering'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{emp.role}</span>
                      </td>

                      {/* Exp */}
                      <td className="p-3 text-center font-mono font-medium text-slate-600 dark:text-slate-300">
                        {emp.experienceYears}y
                      </td>

                      {/* Workload */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-slate-500">{emp.currentLoad}h / {emp.capacity}h</span>
                            <span className={`font-bold ${
                              isOverloaded
                                ? 'text-red-600'
                                : isUnderused
                                ? 'text-sky-600'
                                : 'text-emerald-600'
                            }`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOverloaded
                                  ? 'bg-red-500'
                                  : isUnderused
                                  ? 'bg-sky-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (pct / 125) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                            risk.level === 'High'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : risk.level === 'Medium'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {risk.level}
                        </span>
                      </td>

                      {/* Skills */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Object.entries(emp.skills).slice(0, 4).map(([skill, lvl]) => (
                            <span
                              key={skill}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-slate-200/60 dark:border-slate-700"
                            >
                              {skill} (L{lvl})
                            </span>
                          ))}
                          {Object.keys(emp.skills).length > 4 && (
                            <span className="text-[10px] text-slate-400 font-mono self-center">
                              +{Object.keys(emp.skills).length - 4} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(emp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(emp)}
                            className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-md transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
