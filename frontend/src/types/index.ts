export type DifficultyLevel = 'Introductory' | 'Intermediate' | 'Advanced' | 'Research';

export type ResourceType = 'Textbook' | 'Monograph' | 'Survey Paper' | 'Lecture Notes' | 'Open-Access Resource';

export interface AcademicResource {
  id: string;
  title: string;
  authors: string[];
  subject: string;
  subfields: string[];
  keywords: string[];
  level: DifficultyLevel;
  resource_type: ResourceType;
  abstract: string;
  prerequisites: string[];
  call_number?: string;
  url?: string;
  publication_year?: number;
  borrow_count: number;
  quality_rating: number;
}

export interface ExplanationBreakdown {
  semantic_match_pct: number;
  semantic_explanation: string;
  matched_keywords: string[];
  subject_fit_score: number;
  subject_explanation: string;
  level_fit_score: number;
  level_penalty_applied: number;
  level_explanation: string;
  prerequisite_satisfaction: string;
  discovery_bonus_applied: number;
  feedback_boost_applied: number;
  summary_sentence: string;
}

export interface ScoredResource {
  resource: AcademicResource;
  final_score: number;
  rank: number;
  raw_scores: Record<string, number>;
  explanation: ExplanationBreakdown;
  session_feedback?: 'relevant' | 'irrelevant' | null;
}

export interface RecommendResponse {
  query: string;
  target_level?: string | null;
  applied_filters: Record<string, any>;
  total_catalogue_size: number;
  matched_count: number;
  results: ScoredResource[];
  latency_ms: number;
  retrieval_mode: string;
  intent_decomposition?: Record<string, any> | null;
}

export interface SessionFeedbackItem {
  resource_id: string;
  feedback_type: 'relevant' | 'irrelevant';
}

export interface ContrastiveFactor {
  criterion: string;
  target_value: string;
  alternative_value: string;
  advantage: 'Target' | 'Alternative' | 'Tie';
  impact: 'High' | 'Medium' | 'Low';
}

export interface ContrastiveExplanationResponse {
  target_id: string;
  alternative_id: string;
  target_title: string;
  alternative_title: string;
  winner: string;
  factors: ContrastiveFactor[];
  narrative_explanation: string;
}

export interface IRMetrics {
  precision_at_3: number;
  precision_at_5: number;
  recall_at_5: number;
  ndcg_at_5: number;
  mrr: number;
}

export interface BenchmarkEvaluationResult {
  query_id: string;
  goal: string;
  hybrid_metrics: IRMetrics;
  baseline_metrics: IRMetrics;
  hybrid_top5_titles: string[];
  baseline_top5_titles: string[];
}

export interface EvaluationSummary {
  total_test_queries: number;
  hybrid_aggregate: IRMetrics;
  baseline_aggregate: IRMetrics;
  improvement_percentages: {
    precision_at_5_delta_pct: number;
    ndcg_at_5_delta_pct: number;
    mrr_delta_pct: number;
  };
  query_results: BenchmarkEvaluationResult[];
  ablation_study: Record<string, IRMetrics>;
  timestamp: string;
}

export interface FailureCaseAnalysis {
  id: string;
  query: string;
  failure_type: string;
  description: string;
  lexical_baseline_result: string;
  proposed_system_result: string;
  mitigation_strategy: string;
  remaining_limitation: string;
}

export interface SampleGoal {
  id: string;
  title: string;
  description: string;
  query: string;
  target_level: DifficultyLevel;
  subject_filter: string;
  known_prerequisites: string;
  rationale: string;
}
