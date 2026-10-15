export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type BurnoutRiskLevel = 'Low' | 'Medium' | 'High';

export interface EmployeeLeave {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  type: 'Annual' | 'Medical' | 'Personal' | 'Conference';
}

export interface UpcomingTask {
  id: string;
  title: string;
  hours: number;
  project?: string;
  dueDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  experienceYears: number;
  capacity: number; // Standard 40 hrs
  currentLoad: number; // Current allocated hours
  baselineLoad: number; // Original workload before rebalancing
  skills: Record<string, SkillLevel>;
  avatarUrl?: string;
  bio?: string;
  // User Request 4 features:
  leaves?: EmployeeLeave[];
  isOnLeave?: boolean;
  leaveStatusText?: string;
  pastProjects?: string[];
  upcomingTasks?: UpcomingTask[];
  predictedNextWeekLoad?: number;
  weeklyMood?: number; // 1 to 5
}

export interface RequiredSkill {
  skill: string;
  minLevel: SkillLevel;
}

export interface ProjectDefinition {
  id: string;
  name: string;
  teamSize: number;
  skills: RequiredSkill[];
}

export interface CandidateEvaluation {
  employee: Employee;
  skillFitScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  availabilityScore: number; // 0 - 100
  totalMatchScore: number; // 60% skill + 15% exp + 25% avail
  coveredSkills: {
    skill: string;
    level: number;
    requiredLevel: number;
    meetsRequirement: boolean;
  }[];
  isSelected: boolean;
  matchReasons: string[];
  oneLineReason: string;
}

export interface CourseSuggestion {
  title: string;
  provider: string;
  duration: string;
  level: string;
  url?: string;
}

export interface RoadmapStep {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  durationWeeks: number;
  objective: string;
}

export interface AdvisorRecommendation {
  action: 'Train' | 'Hire' | 'Outsource';
  badgeColor: 'emerald' | 'indigo' | 'amber';
  headline: string;
  reason: string;
  candidateToTrain?: {
    id: string;
    name: string;
    role: string;
    currentLevel: number;
    targetLevel: number;
    hoursAvailable: number;
  };
  timeToClose: string;
  estimatedCost: string;
}

export interface SkillGapAlert {
  skill: string;
  requiredLevel: SkillLevel;
  teamBestLevel: number; // 0 if none has it
  gap: number; // requiredLevel - teamBestLevel
  course: CourseSuggestion;
  totalWeeksToClose: number;
  roadmap: RoadmapStep[];
  advisorRecommendation?: AdvisorRecommendation;
}

export interface TeamChemistryMetrics {
  overallScore: number; // 0 - 100
  skillDiversityScore: number; // 0 - 100
  workloadBalanceScore: number; // 0 - 100
  uniqueSkillsCount: number;
  averageLoad: number;
  loadStandardDeviation: number;
  assessment: string;
}

export interface RecommendedTeamResult {
  projectName: string;
  selectedMembers: CandidateEvaluation[];
  teamScore: number;
  skillCoveragePct: number;
  coveredSkillCount: number;
  totalRequiredSkillCount: number;
  skillGaps: SkillGapAlert[];
  allCandidates: CandidateEvaluation[];
  chemistry: TeamChemistryMetrics;
  compatibilityPairs: TeamCompatibilityPair[];
}

export interface RebalanceTransfer {
  id: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  fromEmployeeRole: string;
  fromLoadBefore: number;
  toEmployeeId: string;
  toEmployeeName: string;
  toEmployeeRole: string;
  toLoadBefore: number;
  hours: number;
  sharedSkills: string[];
  rationale: string;
}

export interface RebalancePlan {
  transfers: RebalanceTransfer[];
  overloadedCountBefore: number;
  underusedCountBefore: number;
  overloadedCountAfter: number;
  underusedCountAfter: number;
  totalHoursMoved: number;
}

// New Types for Hackathon Additions

export interface BusFactorRisk {
  skill: string;
  count: number;
  practitioners: { id: string; name: string; level: number }[];
  riskLevel: 'Critical (1 Holder)' | 'High (2 Holders)';
  suggestedCrossTrainCandidate: {
    id: string;
    name: string;
    role: string;
    currentLoad: number;
    reason: string;
  };
}

export interface SkillSupplyDemand {
  skill: string;
  supplyCount: number; // number of certified employees (L >= 2)
  demandCount: number; // number of active projects needing it
  deficit: number; // demand - supply (if positive)
  status: 'Critical Shortage' | 'Tight Supply' | 'Balanced' | 'Surplus';
}

export interface ProjectAssignmentConflict {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  conflictingProjects: string[];
  recommendedAlternates: {
    forProject: string;
    alternate: CandidateEvaluation;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredData?: {
    type: 'employees' | 'skills' | 'conflicts' | 'stats';
    items?: any[];
  };
}

export interface TeamCompatibilityPair {
  emp1Id: string;
  emp1Name: string;
  emp2Id: string;
  emp2Name: string;
  sharedProjects: string[];
  summary: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  category: 'employee' | 'project' | 'workload' | 'leave' | 'wellbeing';
  author?: string;
  badgeColor?: string;
}

