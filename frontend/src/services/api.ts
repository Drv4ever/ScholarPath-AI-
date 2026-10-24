import {
  RecommendResponse,
  ContrastiveExplanationResponse,
  EvaluationSummary,
  FailureCaseAnalysis,
  SampleGoal,
  SessionFeedbackItem,
  DifficultyLevel,
  ResourceType
} from '../types';

const API_BASE = '/api';

export interface RecommendParams {
  query: string;
  known_prerequisites?: string;
  target_level?: DifficultyLevel | '';
  subject_filter?: string;
  resource_type_filter?: ResourceType | '';
  enable_asymmetric_penalty?: boolean;
  enable_intent_separation?: boolean;
  enable_discovery_bonus?: boolean;
  top_k?: number;
  session_feedback?: SessionFeedbackItem[];
}

export const api = {
  async fetchHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async fetchSubjects(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async fetchSampleGoals(): Promise<SampleGoal[]> {
    const res = await fetch(`${API_BASE}/sample-goals`);
    if (!res.ok) throw new Error('Failed to fetch sample goals');
    return res.json();
  },

  async getRecommendations(params: RecommendParams): Promise<RecommendResponse> {
    const payload = {
      query: params.query,
      known_prerequisites: params.known_prerequisites || null,
      target_level: params.target_level ? params.target_level : null,
      subject_filter: params.subject_filter ? params.subject_filter : null,
      resource_type_filter: params.resource_type_filter ? params.resource_type_filter : null,
      enable_asymmetric_penalty: params.enable_asymmetric_penalty ?? true,
      enable_intent_separation: params.enable_intent_separation ?? true,
      enable_discovery_bonus: params.enable_discovery_bonus ?? true,
      top_k: params.top_k || 10,
      session_feedback: params.session_feedback || []
    };

    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(err.detail || 'Recommendation request failed');
    }

    return res.json();
  },

  async getContrastiveExplanation(
    targetId: string,
    altId: string,
    query: string,
    targetLevel?: DifficultyLevel | '',
    knownPrereqs?: string
  ): Promise<ContrastiveExplanationResponse> {
    const payload = {
      target_resource_id: targetId,
      alternative_resource_id: altId,
      query,
      target_level: targetLevel || null,
      known_prerequisites: knownPrereqs || null
    };

    const res = await fetch(`${API_BASE}/explain/contrastive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(err.detail || 'Failed to generate contrastive explanation');
    }

    return res.json();
  },

  async runEvaluation(): Promise<EvaluationSummary> {
    const res = await fetch(`${API_BASE}/evaluate`);
    if (!res.ok) throw new Error('Failed to run benchmark evaluation');
    return res.json();
  },

  async fetchFailures(): Promise<FailureCaseAnalysis[]> {
    const res = await fetch(`${API_BASE}/evaluation/failures`);
    if (!res.ok) throw new Error('Failed to fetch failure case analysis');
    return res.json();
  }
};
