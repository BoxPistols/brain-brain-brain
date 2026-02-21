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
  issues: Issue[];
}

export interface Idea {
  title: string;
  description: string;
  priority: Priority;
  effort: Effort;
  impact: Impact;
}

export interface DeepDiveEntry {
  question: string;
  answer: string;
}

export interface RefinementEntry {
  review: string;
  answer: string;
}

export interface AIResults {
  understanding: string;
  ideas: Idea[];
  suggestions?: string[];
  keyIssue?: string;
  funnelStage?: string;
  deepDive?: string;
  deepDives?: DeepDiveEntry[];
  refinement?: string;
  refinements?: RefinementEntry[];
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

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConnStatus {
  status: 'idle' | 'testing' | 'ok' | 'error';
  msg: string;
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
