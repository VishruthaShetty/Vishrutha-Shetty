import React, { useState } from 'react';
import { Employee, EmployeeLeave } from '../types';
import {
  Calendar,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Palmtree,
  Clock,
  User,
  ShieldAlert,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface LeaveCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onUpdateEmployeeLeave: (empId: string, updatedLeaves: EmployeeLeave[], isOnLeave: boolean, statusText?: string) => void;
  onSelectEmployee?: (employee: Employee) => void;
}

export const LeaveCalendarModal: React.FC<LeaveCalendarModalProps> = ({
  isOpen,
  onClose,
  employees,
  onUpdateEmployeeLeave,
  onSelectEmployee,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [startDate, setStartDate] = useState<string>('2026-10-20');
  const [endDate, setEndDate] = useState<string>('2026-10-27');
  const [leaveType, setLeaveType] = useState<EmployeeLeave['type']>('Annual');
  const [reason, setReason] = useState<string>('');
  const [markCurrentlyActive, setMarkCurrentlyActive] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'scheduled'>('all');

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Aggregate all leaves across workforce
  const allWorkforceLeaves = employees.flatMap(emp =>
    (emp.leaves || []).map(lv => ({
      ...lv,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      avatarUrl: emp.avatarUrl,
      currentLoad: emp.currentLoad,
      isCurrentlyOnLeave: emp.isOnLeave,
    }))
  );

  const filteredLeaves = allWorkforceLeaves.filter(lv => {
    if (filterType === 'active') return lv.isCurrentlyOnLeave;
    if (filterType === 'scheduled') return !lv.isCurrentlyOnLeave;
    return true;
  });

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const newLeave: EmployeeLeave = {
      id: `lv-${Date.now()}`,
      startDate,
      endDate,
      type: leaveType,
      reason: reason.trim() || `${leaveType} Leave`,
    };

    const currentLeaves = selectedEmployee.leaves || [];
    const updatedLeaves = [...currentLeaves, newLeave];

    // Determine status text
    const statusText = markCurrentlyActive
      ? `On Leave (${startDate} – ${endDate})`
      : `Scheduled Leave (${startDate} – ${endDate})`;

    onUpdateEmployeeLeave(selectedEmployee.id, updatedLeaves, markCurrentlyActive, statusText);
    setReason('');
  };

  const handleRemoveLeave = (empId: string, leaveId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const updatedLeaves = (emp.leaves || []).filter(lv => lv.id !== leaveId);
    const stillOnLeave = updatedLeaves.length > 0;
    onUpdateEmployeeLeave(
      empId,
      updatedLeaves,
      stillOnLeave,
      stillOnLeave ? updatedLeaves[0].reason : undefined
    );
  };

  const handleToggleCurrentStatus = (empId: string, currentStatus: boolean) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'On Leave (Active Absence)' : undefined;
    onUpdateEmployeeLeave(empId, emp.leaves || [], newStatus, statusText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Leave & Availability Calendar
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {employees.filter(e => e.isOnLeave).length} Away Currently
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage planned absences, PTO, and exclude unavailable staff from project rosters and workload reallocation
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Notice */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs">Intelligent Roster Protection</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Engineers marked as <strong>On Leave</strong> are automatically excluded from the project recommendation algorithm and will not be selected as capacity donation recipients in workload rebalancing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Log New Leave Form */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Schedule Leave / Out-of-Office
              </h3>

              <form onSubmit={handleAddLeave} className="space-y-3.5">
                {/* Employee Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Employee
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={e => setSelectedEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role}) {emp.isOnLeave ? '• Currently Out' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Annual', 'Medical', 'Personal', 'Conference'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLeaveType(t)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                          leaveType === t
                            ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason / Event Notes
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Annual Vacation, KubeCon Keynote, Paternity Leave..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs placeholder:text-slate-400"
                  />
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markCurrentlyActive}
                    onChange={e => setMarkCurrentlyActive(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    Mark as actively on leave right now (exclude immediately)
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Palmtree className="w-4 h-4" />
                  Save Leave to Calendar
                </button>
              </form>
            </div>

            {/* Right: Roster Schedule & Logged Absences */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  Scheduled Absences ({filteredLeaves.length})
                </h3>

                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('active')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      filterType === 'active'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Active Away
                  </button>
                  <button
                    onClick={() => setFilterType('scheduled')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      filterType === 'scheduled'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Upcoming
                  </button>
                </div>
              </div>

              {filteredLeaves.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Palmtree className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No leaves logged</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Schedule PTO or mark team members on leave using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredLeaves.map(lv => (
                    <div
                      key={lv.id}
                      className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={lv.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={lv.employeeName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => {
                                const emp = employees.find(e => e.id === lv.employeeId);
                                if (emp && onSelectEmployee) onSelectEmployee(emp);
                              }}
                              className="font-bold text-slate-900 dark:text-white cursor-pointer hover:underline hover:text-indigo-600"
                            >
                              {lv.employeeName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60">
                              {lv.type}
                            </span>
                            {lv.isCurrentlyOnLeave ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200">
                                Currently Out
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                                Scheduled
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {lv.reason} · <span className="font-mono">{lv.startDate} → {lv.endDate}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCurrentStatus(lv.employeeId, Boolean(lv.isCurrentlyOnLeave))}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            lv.isCurrentlyOnLeave
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 hover:bg-amber-200'
                          }`}
                        >
                          {lv.isCurrentlyOnLeave ? 'Mark Returned' : 'Set Active Now'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLeave(lv.employeeId, lv.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md"
                          title="Delete leave"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
