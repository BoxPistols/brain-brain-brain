export type SessionType = 'product' | 'marketing' | 'growth' | 'innovation' | 'cx' | 'ops' | 'dx' | 'design-system' | 'other';
export type Priority = 'High' | 'Medium' | 'Low';
export type Effort = 'High' | 'Medium' | 'Low';
export type Impact = 'High' | 'Medium' | 'Low';

export interface Issue {
  text: string;
  detail: string;
  sub: string[];
}

export type IssueTemplate = Issue;

export interface BrainstormForm {
  projectName: string;
  productService: string;
  teamGoals: string;
  sessionType: SessionType;
  customSession: string;
  tlMode: 'period' | 'deadline';
  tlStart: string;
  tlEnd: string;
  tlDead: string;
  issues: Issue[];
}

export interface Idea {
  title: string;
  description: string;
  priority: Priority;
  effort: Effort;
  impact: Impact;
}

export interface AIResults {
  understanding: string;
  ideas: Idea[];
  suggestions?: string[]; // AI生成の文脈に即した深掘り質問
  deepDive?: string;
  refinement?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  projectName: string;
  model: string;
  depth: number;
  form: BrainstormForm;
  query?: string;
  results?: AIResults;
}

export interface Settings {
  logMode: 'all' | 'answers' | 'off';
  autoSave: boolean;
}

export interface ModelInfo {
  id: string;
  label: string;
  t: string;
  cost: string;
}

export interface MockScenario {
  label: string;
  prov: string;
  modelId: string;
  dep: number;
  form: BrainstormForm;
  results: AIResults;
}
