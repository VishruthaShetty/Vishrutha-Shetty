import React, { useState, useEffect } from 'react';
import { Employee, SkillLevel } from '../types';
import { ALL_SKILLS } from '../data/courseCatalog';
import { extractSkillsFromResume } from '../utils/workforceAlgorithms';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, User, Briefcase, Clock, Award, FileText, ChevronDown, ChevronUp, Smile } from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
}

const SAMPLE_RESUMES = {
  cloud: `Alexandria Vance
Lead Cloud & Platform Architect
10+ years of experience in distributed systems, infrastructure automation, and enterprise scaling.
Extensive mastery of Kubernetes, Docker, AWS, Go, and PostgreSQL.
Led migration of 40+ microservices to multi-region EKS clusters with Terraform and CI/CD pipelines.`,
  ml: `Dr. Devendra Rao
Senior AI & Machine Learning Engineer
7 years experience developing predictive models, deep learning architectures, and production pipelines.
Core proficiencies: Python, Machine Learning, Data Engineering, PostgreSQL, Docker.
Built high-throughput ETL workflows with Kafka and PyTorch embeddings.`,
  frontend: `Priya Nambiar
Senior Frontend Architect & UI Lead
6 years of experience engineering high-performance web applications and design systems.
Expertise: React, TypeScript, UI/UX Design, GraphQL, Node.js.
Spearheaded unified tokenized component library in Figma and React for 2M monthly active users.`,
};

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
}) => {
  const isEditing = Boolean(employeeToEdit);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [capacity, setCapacity] = useState<number>(40);
  const [currentLoad, setCurrentLoad] = useState<number>(35);
  const [weeklyMood, setWeeklyMood] = useState<number>(4);
  const [skills, setSkills] = useState<Record<string, SkillLevel>>({
    React: 3,
    TypeScript: 3,
  });

  // Resume Extractor State
  const [isExtractorOpen, setIsExtractorOpen] = useState<boolean>(!isEditing);
  const [resumeText, setResumeText] = useState<string>('');
  const [extractorMessage, setExtractorMessage] = useState<string | null>(null);

  // State for adding a new skill
  const [selectedSkillDropdown, setSelectedSkillDropdown] = useState<string>('Go');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  const [isCustomSkill, setIsCustomSkill] = useState<boolean>(false);
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>(3);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Initialize form when opened or employeeToEdit changes
  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setRole(employeeToEdit.role);
      setDepartment(employeeToEdit.department || 'Engineering');
      setExperienceYears(employeeToEdit.experienceYears);
      setCapacity(employeeToEdit.capacity);
      setCurrentLoad(employeeToEdit.currentLoad);
      setWeeklyMood(employeeToEdit.weeklyMood ?? 4);
      setSkills({ ...employeeToEdit.skills });
      setIsExtractorOpen(false);
    } else {
      setName('');
      setRole('');
      setDepartment('Engineering');
      setExperienceYears(3);
      setCapacity(40);
      setCurrentLoad(32);
      setWeeklyMood(4);
      setSkills({
        React: 3,
        TypeScript: 3,
      });
      setIsExtractorOpen(true);
    }
    setResumeText('');
    setExtractorMessage(null);
    setErrors({});
    setShowSuccessToast(false);
    setIsCustomSkill(false);
    setCustomSkillInput('');
  }, [employeeToEdit, isOpen]);

  const handleExtractFromResume = () => {
    if (!resumeText.trim()) {
      setExtractorMessage('Please paste a resume or biography text first.');
      return;
    }

    const extracted = extractSkillsFromResume(resumeText);
    if (extracted.name) setName(extracted.name);
    if (extracted.role) setRole(extracted.role);
    if (extracted.experienceYears) setExperienceYears(extracted.experienceYears);
    if (Object.keys(extracted.skills).length > 0) {
      setSkills(extracted.skills);
    }

    setExtractorMessage(
      `Detected ${Object.keys(extracted.skills).length} skills (${extracted.detectedKeywords.join(', ')}). Form fields pre-filled!`
    );
    setErrors({});
  };

  const handleLoadSampleResume = (type: 'cloud' | 'ml' | 'frontend') => {
    const text = SAMPLE_RESUMES[type];
    setResumeText(text);
    const extracted = extractSkillsFromResume(text);
    setName(extracted.name);
    setRole(extracted.role);
    setExperienceYears(extracted.experienceYears);
    setSkills(extracted.skills);
    setExtractorMessage(
      `Loaded & extracted ${Object.keys(extracted.skills).length} skills: ${extracted.detectedKeywords.join(', ')}!`
    );
    setErrors({});
  };

  if (!isOpen) return null;

  const availableDropdownSkills = ALL_SKILLS.filter(s => !skills[s]);

  const handleAddSkill = () => {
    const skillName = isCustomSkill ? customSkillInput.trim() : selectedSkillDropdown;
    if (!skillName) {
      setErrors(prev => ({ ...prev, skill: 'Please select or enter a valid skill name' }));
      return;
    }

    setSkills(prev => ({
      ...prev,
      [skillName]: newSkillLevel,
    }));

    if (isCustomSkill) {
      setCustomSkillInput('');
      setIsCustomSkill(false);
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next.skill;
      delete next.skills;
      return next;
    });
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(prev => {
      const next = { ...prev };
      delete next[skillName];
      return next;
    });
  };

  const handleUpdateSkillLevel = (skillName: string, level: SkillLevel) => {
    setSkills(prev => ({
      ...prev,
      [skillName]: level,
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!role.trim()) {
      errs.role = 'Role / Title is required';
    }
    if (capacity <= 0 || isNaN(capacity)) {
      errs.capacity = 'Capacity must be greater than 0 hours';
    }
    if (currentLoad < 0 || isNaN(currentLoad)) {
      errs.currentLoad = 'Current workload cannot be negative';
    }
    if (experienceYears < 0 || isNaN(experienceYears)) {
      errs.experienceYears = 'Experience cannot be negative';
    }
    if (Object.keys(skills).length === 0) {
      errs.skills = 'Please add at least one skill with proficiency level';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const savedEmployee: Employee = {
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      department: department.trim() || 'Engineering',
      experienceYears: Number(experienceYears),
      capacity: Number(capacity),
      currentLoad: Number(currentLoad),
      baselineLoad: employeeToEdit ? employeeToEdit.baselineLoad : Number(currentLoad),
      skills: { ...skills },
      weeklyMood: Number(weeklyMood),
      pastProjects: employeeToEdit?.pastProjects || ['Next-Gen Cloud Fintech Platform'],
      leaves: employeeToEdit?.leaves || [],
      isOnLeave: employeeToEdit?.isOnLeave || false,
      leaveStatusText: employeeToEdit?.leaveStatusText,
      upcomingTasks: employeeToEdit?.upcomingTasks || [],
      bio: employeeToEdit?.bio || `${role.trim()} with ${experienceYears} years experience specializing in ${Object.keys(skills).slice(0, 3).join(', ')}.`,
    };

    onSave(savedEmployee);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 600);
  };

  const moodEmojis: Record<number, { emoji: string; label: string; color: string }> = {
    1: { emoji: '😫', label: 'Overwhelmed', color: 'text-rose-600 dark:text-rose-400' },
    2: { emoji: '😕', label: 'Fatigued', color: 'text-amber-600 dark:text-amber-400' },
    3: { emoji: '😐', label: 'Balanced', color: 'text-slate-600 dark:text-slate-300' },
    4: { emoji: '😊', label: 'Satisfied', color: 'text-sky-600 dark:text-sky-400' },
    5: { emoji: '🚀', label: 'Energized', color: 'text-emerald-600 dark:text-emerald-400' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Employee: ${employeeToEdit?.name}` : 'Add New Employee'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update employee profile, capacity limits, and technical competencies'
                  : 'Register a new workforce member or auto-extract skills from a resume'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Success Banner */}
          {showSuccessToast && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                {isEditing ? 'Employee profile updated successfully!' : 'Employee added to workforce intelligence pool!'}
              </span>
            </div>
          )}

          {/* Smart Resume Skill Extractor Accordion Panel */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Smart Resume & Bio Skill Extractor
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Paste raw candidate resume/bio to auto-detect skills and pre-fill form
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExtractorOpen(!isExtractorOpen)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                {isExtractorOpen ? (
                  <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Open <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>

            {isExtractorOpen && (
              <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste candidate resume or biography here (e.g. 'Alex Rivera, Senior Cloud Architect with 8 years experience in Kubernetes, AWS, Go, and PostgreSQL...')..."
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleResume('cloud')}
                      className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200"
                    >
                      Cloud Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleResume('ml')}
                      className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200"
                    >
                      AI/ML Scientist
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleResume('frontend')}
                      className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200"
                    >
                      UI Lead
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExtractFromResume}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Extract Skills & Auto-Fill
                  </button>
                </div>

                {extractorMessage && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>{extractorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic Details Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Elena Rostova"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={e => {
                    setRole(e.target.value);
                    if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
                  }}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.role && <p className="text-[11px] text-red-600 mt-1">{errors.role}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Platform & Infrastructure">Platform & Infrastructure</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                </select>
              </div>

              {/* Experience Years */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={experienceYears}
                  onChange={e => setExperienceYears(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Workload */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capacity & Workload Allocation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weekly Capacity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Weekly Capacity (Hours)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Standard: 40h</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value) || 40)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.capacity ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.capacity && <p className="text-[11px] text-red-600 mt-1">{errors.capacity}</p>}
              </div>

              {/* Current Load */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Current Workload (Hours)
                  </label>
                  <span className={`text-[10px] font-bold font-mono ${
                    currentLoad > capacity
                      ? 'text-red-600'
                      : currentLoad < capacity * 0.6
                      ? 'text-sky-600'
                      : 'text-emerald-600'
                  }`}>
                    {Math.round((currentLoad / (capacity || 40)) * 100)}% ({
                      currentLoad > capacity ? 'Overloaded' : currentLoad < capacity * 0.6 ? 'Underused' : 'Optimal'
                    })
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentLoad}
                  onChange={e => setCurrentLoad(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.currentLoad ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.currentLoad && <p className="text-[11px] text-red-600 mt-1">{errors.currentLoad}</p>}
              </div>

              {/* Weekly Mood / Wellbeing Slider */}
              <div className="sm:col-span-2 pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-indigo-600" />
                    Weekly Wellbeing & Morale Check:
                  </label>
                  <span className={`text-xs font-bold ${moodEmojis[weeklyMood]?.color || ''} flex items-center gap-1.5`}>
                    <span className="text-sm">{moodEmojis[weeklyMood]?.emoji}</span>
                    <span>{weeklyMood}/5 · {moodEmojis[weeklyMood]?.label}</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={weeklyMood}
                  onChange={e => setWeeklyMood(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1">
                  <span>1 😫 Overwhelmed</span>
                  <span>2 😕 Fatigued</span>
                  <span>3 😐 Balanced</span>
                  <span>4 😊 Satisfied</span>
                  <span>5 🚀 Energized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills & Proficiency Levels */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Skills & Proficiency (Level 1–5)
              </h3>
              <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {Object.keys(skills).length} Competencies Added
              </span>
            </div>

            {/* List of currently assigned skills */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(skills).map(([skillName, level]) => (
                <div
                  key={skillName}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{skillName}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">
                      Level {level}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Level buttons 1-5 */}
                    <div className="flex items-center gap-1">
                      {([1, 2, 3, 4, 5] as SkillLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleUpdateSkillLevel(skillName, lvl)}
                          className={`w-6 h-6 rounded-md font-mono text-[11px] font-semibold transition-all ${
                            level >= lvl
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skillName)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Skill Section */}
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  Add Technical Skill:
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomSkill(!isCustomSkill)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {isCustomSkill ? '← Select from catalog' : '+ Type custom skill'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-7">
                  {isCustomSkill ? (
                    <input
                      type="text"
                      placeholder="e.g. Rust, Kafka, Flutter..."
                      value={customSkillInput}
                      onChange={e => setCustomSkillInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <select
                      value={selectedSkillDropdown}
                      onChange={e => setSelectedSkillDropdown(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {availableDropdownSkills.length === 0 ? (
                        <option value="">All standard skills added</option>
                      ) : (
                        availableDropdownSkills.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="sm:col-span-3 flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-medium mr-1">Lvl:</span>
                  {([1, 2, 3, 4, 5] as SkillLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewSkillLevel(lvl)}
                      className={`w-6 h-6 rounded text-[11px] font-mono font-semibold transition-all ${
                        newSkillLevel === lvl
                          ? 'bg-indigo-600 text-white ring-1 ring-indigo-500'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!isCustomSkill && availableDropdownSkills.length === 0}
                    className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-2xs text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {errors.skill && <p className="text-[11px] text-red-600">{errors.skill}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
