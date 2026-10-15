import { LayoutDashboard, Users, SlidersHorizontal, Download, Bell, Moon, Sun, Target, Plus, UserCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'employees' | 'new-project' | 'workload';
  onSelectTab: (tab: 'dashboard' | 'employees' | 'new-project' | 'workload') => void;
  onExportReport: () => void;
  onOpenAlerts: () => void;
  onOpenAddModal?: () => void;
  totalAlertsCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  overloadedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onExportReport,
  onOpenAlerts,
  onOpenAddModal,
  totalAlertsCount,
  isDarkMode,
  onToggleDarkMode,
  overloadedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              IQ
            </div>
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
            >
              WorkforceIQ
            </a>
          </div>

          {/* Zone 2: Clean single-line nav links */}
          <nav className="flex items-center gap-1.5 sm:gap-4 md:gap-5 text-sm font-medium text-slate-600 dark:text-slate-300 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 py-1.5 border-b-2 text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('employees')}
              className={`flex items-center gap-1.5 py-1.5 border-b-2 text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'employees'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Employees</span>
            </button>

            <button
              onClick={() => onSelectTab('new-project')}
              className={`flex items-center gap-1.5 py-1.5 border-b-2 text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'new-project'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Team Builder</span>
            </button>

            <button
              onClick={() => onSelectTab('workload')}
              className={`flex items-center gap-1.5 py-1.5 border-b-2 text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'workload'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Workload</span>
              {overloadedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500" title={`${overloadedCount} overloaded`} />
              )}
            </button>
          </nav>

          {/* Zone 3: Controls (Add Employee, Dark mode, Alerts bell, Primary Action) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                title="Add new employee"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Staff</span>
              </button>
            )}
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Alerts Bell Icon */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Workforce Alerts"
              aria-label="Open Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono ring-2 ring-white dark:ring-slate-900">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onExportReport}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Executive Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
