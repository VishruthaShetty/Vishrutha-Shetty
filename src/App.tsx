/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Employee } from './types';
import { INITIAL_EMPLOYEES, PROJECT_PRESETS } from './data/initialData';
import { buildRecommendedTeam } from './utils/workforceAlgorithms';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeeDirectoryView } from './components/EmployeeDirectoryView';
import { NewProjectView } from './components/NewProjectView';
import { WorkloadView } from './components/WorkloadView';
import { ExportReportModal } from './components/ExportReportModal';
import { AlertsCenterDrawer } from './components/AlertsCenterDrawer';
import { EmployeeProfileModal } from './components/EmployeeProfileModal';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CsvImportModal } from './components/CsvImportModal';
import { AiAssistantChat } from './components/AiAssistantChat';
import { CheckCircle2, Info, X } from 'lucide-react';

export default function App() {
  // Load employees from browser localStorage if available
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('workforce_iq_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load employees from localStorage:', err);
    }
    return INITIAL_EMPLOYEES;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'new-project' | 'workload'>('dashboard');
  const [isRebalanceApplied, setIsRebalanceApplied] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);

  // Employee management modal states
  const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // User feedback toast banner
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastNotification({
      id: `toast-${Date.now()}`,
      type,
      message,
    });
    setTimeout(() => {
      setToastNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Sync employees to browser localStorage on every state mutation
  useEffect(() => {
    try {
      localStorage.setItem('workforce_iq_employees', JSON.stringify(employees));
    } catch (err) {
      console.error('Failed to sync employees to localStorage:', err);
    }
  }, [employees]);

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('workforce_iq_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('workforce_iq_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('workforce_iq_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Compute active skill gaps from default primary project
  const defaultProjectGaps = useMemo(() => {
    const defaultPreset = PROJECT_PRESETS[0];
    const res = buildRecommendedTeam(
      employees,
      defaultPreset.skills,
      defaultPreset.teamSize,
      defaultPreset.name
    );
    return res.skillGaps;
  }, [employees]);

  const overloadedCount = employees.filter(e => e.currentLoad > 40).length;
  const underusedCount = employees.filter(e => e.currentLoad < 24).length;
  const totalAlertsCount = overloadedCount + underusedCount + defaultProjectGaps.length;

  // Handlers for Add, Edit, Delete, Rebalance, Import, and Reset
  const handleSaveEmployee = (savedEmp: Employee) => {
    setEmployees(prev => {
      const exists = prev.some(e => e.id === savedEmp.id);
      if (exists) {
        return prev.map(e => (e.id === savedEmp.id ? savedEmp : e));
      } else {
        return [savedEmp, ...prev];
      }
    });

    // If profile was open for this employee, update it
    if (selectedEmployeeForProfile?.id === savedEmp.id) {
      setSelectedEmployeeForProfile(savedEmp);
    }

    const isEdit = employees.some(e => e.id === savedEmp.id);
    showToast(isEdit ? `Updated profile for ${savedEmp.name}` : `Added ${savedEmp.name} to workforce platform!`);
  };

  const handleConfirmDelete = (empId: string) => {
    const target = employees.find(e => e.id === empId);
    setEmployees(prev => prev.filter(e => e.id !== empId));

    if (selectedEmployeeForProfile?.id === empId) {
      setSelectedEmployeeForProfile(null);
    }

    showToast(`Removed ${target?.name || 'employee'} from workforce`, 'info');
  };

  const handleImportCsv = (imported: Employee[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setEmployees(imported);
      showToast(`Roster replaced with ${imported.length} imported employees`);
    } else {
      setEmployees(prev => [...imported, ...prev]);
      showToast(`Appended ${imported.length} new employees to workforce roster`);
    }
  };

  const handleResetDemoData = () => {
    const baseline = INITIAL_EMPLOYEES.map(e => ({ ...e }));
    setEmployees(baseline);
    try {
      localStorage.setItem('workforce_iq_employees', JSON.stringify(baseline));
    } catch (e) {
      // ignore
    }
    setIsRebalanceApplied(false);
    showToast('Reset workforce data to the original 16 benchmark employees');
  };

  const handleApplyRebalance = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    setIsRebalanceApplied(true);
    showToast('Capacity rebalance schedule applied across the workforce');
  };

  const handleResetBaselineRebalance = () => {
    setEmployees(prev =>
      prev.map(e => ({
        ...e,
        currentLoad: e.baselineLoad || e.capacity,
      }))
    );
    setIsRebalanceApplied(false);
    showToast('Reset current workloads to baseline allocation');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExportReport={() => setIsReportModalOpen(true)}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        onOpenAddModal={() => {
          setEmployeeToEdit(null);
          setIsAddModalOpen(true);
        }}
        totalAlertsCount={totalAlertsCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        overloadedCount={overloadedCount}
      />

      {/* Floating Dynamic Toast Notification */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-xl border border-slate-700/60 animate-in slide-in-from-top-4 duration-200">
          {toastNotification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastNotification.message}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 text-slate-400 hover:text-white rounded ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            employees={employees}
            onNavigate={setActiveTab}
            onSelectEmployee={setSelectedEmployeeForProfile}
            onOpenAddModal={() => {
              setEmployeeToEdit(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeDirectoryView
            employees={employees}
            onSelectEmployee={setSelectedEmployeeForProfile}
            onOpenAddModal={() => {
              setEmployeeToEdit(null);
              setIsAddModalOpen(true);
            }}
            onOpenEditModal={(emp) => setEmployeeToEdit(emp)}
            onOpenDeleteModal={(emp) => setEmployeeToDelete(emp)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {activeTab === 'new-project' && (
          <NewProjectView
            employees={employees}
            onSelectEmployee={setSelectedEmployeeForProfile}
          />
        )}

        {activeTab === 'workload' && (
          <WorkloadView
            employees={employees}
            onApplyRebalance={handleApplyRebalance}
            onResetBaseline={handleResetBaselineRebalance}
            isRebalanceApplied={isRebalanceApplied}
            onSelectEmployee={setSelectedEmployeeForProfile}
          />
        )}
      </main>

      {/* Clean Unboxed Editorial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">WorkforceIQ</span>
            <span aria-hidden="true">·</span>
            <span>Workforce Intelligence Platform</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{employees.length} Engineers Active</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Capacity Model: 40h Standard</span>
            <span aria-hidden="true">·</span>
            <span>Local Persistence: Enabled</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetDemoData}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium hover:underline"
              title="Restores the 16 original benchmark employees"
            >
              Reset Demo Data (16 Employees)
            </button>
          </div>
        </div>
      </footer>

      {/* Executive Report Modal */}
      <ExportReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        employees={employees}
      />

      {/* Alerts Center Drawer */}
      <AlertsCenterDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        employees={employees}
        skillGaps={defaultProjectGaps}
        onNavigate={setActiveTab}
      />

      {/* Comprehensive Employee Profile Modal */}
      <EmployeeProfileModal
        employee={selectedEmployeeForProfile}
        onClose={() => setSelectedEmployeeForProfile(null)}
        onEdit={(emp) => setEmployeeToEdit(emp)}
        onDelete={(emp) => setEmployeeToDelete(emp)}
      />

      {/* Add / Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={isAddModalOpen || Boolean(employeeToEdit)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(employeeToDelete)}
        employee={employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Bulk CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCsv}
      />

      {/* Floating AI Assistant Chat */}
      <AiAssistantChat
        employees={employees}
        onSelectEmployee={setSelectedEmployeeForProfile}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
