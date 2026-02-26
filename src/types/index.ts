export type SessionType =
  | 'product'
  | 'marketing'
  | 'growth'
  | 'innovation'
  | 'cx'
  | 'ops'
  | 'dx'
  | 'design-system'
  | 'other';
export type Priority = 'High' | 'Medium' | 'Low';
export type Effort = 'High' | 'Medium' | 'Low';
export type Impact = 'High' | 'Medium' | 'Low';

export interface Issue {
  text: string;
  detail: string;
  sub: string[];
}

export type IssueTemplate = Issue;

export interface CompetitorEntry {
  name: string;
  url: string;
  note: string;
}

export interface KpiEntry {
  label: string;
  value: string;
}

export interface BrainstormForm {
  projectName: string;
  productService: string;
  teamGoals: string;
  sessionType: SessionType;
  customSession: string;
  issues: Issue[];
  serviceUrl: string;
  competitors: CompetitorEntry[];
  kpis: KpiEntry[];
}

export interface FeasibilityScore {
  total: number; // 0-100 総合スコア
  resource: number; // 0-100 リソース充足度
  techDifficulty: number; // 0-100 技術的実現容易性（高い = 容易）
  orgAcceptance: number; // 0-100 組織受容性
}

export interface Idea {
  title: string;
  description: string;
  priority: Priority;
  effort: Effort;
  impact: Impact;
  feasibility?: FeasibilityScore;
  subIdeas?: Idea[];
}

export interface DeepDiveEntry {
  question: string;
  answer: string;
}

export interface RefinementEntry {
  review: string;
  answer: string;
  results?: AIResults; // ブラッシュアップ後の構造的結果
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

export type LLMProvider = 'openai' | 'ollama' | 'lmstudio';

export interface MockScenario {
  label: string;
  prov: string;
  modelId: string;
  dep: number;
  form: BrainstormForm;
  results: AIResults;
}
