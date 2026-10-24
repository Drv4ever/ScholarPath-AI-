import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SampleGoalsPicker } from './components/SampleGoalsPicker';
import { SearchGoalForm } from './components/SearchGoalForm';
import { FilterSidebar } from './components/FilterSidebar';
import { ResourceCard } from './components/ResourceCard';
import { ContrastiveModal } from './components/ContrastiveModal';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { ResponsibleAiSection } from './components/ResponsibleAiSection';
import { api } from './services/api';
import {
  ScoredResource,
  RecommendResponse,
  SampleGoal,
  DifficultyLevel,
  ResourceType,
  SessionFeedbackItem
} from './types';
import { AlertCircle, BookOpen, Sparkles, SlidersHorizontal } from 'lucide-react';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'search' | 'evaluation' | 'responsible_ai'>('search');

  // Search & Filter State
  const [query, setQuery] = useState<string>('Foundations of machine learning and intuitive linear algebra');
  const [knownPrereqs, setKnownPrereqs] = useState<string>('Basic Python and high school algebra');
  const [targetLevel, setTargetLevel] = useState<DifficultyLevel | ''>('Introductory');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ResourceType | ''>('');

  // Algorithm Flags
  const [enableAsymmetricPenalty, setEnableAsymmetricPenalty] = useState<boolean>(true);
  const [enableIntentSeparation, setEnableIntentSeparation] = useState<boolean>(true);
  const [enableDiscoveryBonus, setEnableDiscoveryBonus] = useState<boolean>(true);

  // In-Session Feedback State (Stateless on server; preserved per session on client)
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedbackItem[]>([]);

  // Metadata & Catalogs
  const [subjects, setSubjects] = useState<string[]>([]);
  const [sampleGoals, setSampleGoals] = useState<SampleGoal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>('GOAL-01');
  const [healthInfo, setHealthInfo] = useState<any>(null);

  // Results & UI State
  const [recommendResponse, setRecommendResponse] = useState<RecommendResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Contrastive Modal State
  const [contrastiveTarget, setContrastiveTarget] = useState<ScoredResource | null>(null);

  // Load Initial Metadata
  useEffect(() => {
    const init = async () => {
      try {
        const [subjs, goals, health] = await Promise.all([
          api.fetchSubjects(),
          api.fetchSampleGoals(),
          api.fetchHealth()
        ]);
        setSubjects(subjs);
        setSampleGoals(goals);
        setHealthInfo(health);
      } catch (err: any) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  // Execute Recommendation
  const fetchRecommendations = useCallback(
    async (feedbackOverride?: SessionFeedbackItem[]) => {
      if (!query.trim()) return;
      setIsLoading(true);
      setError(null);
      try {
        const resp = await api.getRecommendations({
          query,
          known_prerequisites: knownPrereqs,
          target_level: targetLevel,
          subject_filter: selectedSubject,
          resource_type_filter: selectedType,
          enable_asymmetric_penalty: enableAsymmetricPenalty,
          enable_intent_separation: enableIntentSeparation,
          enable_discovery_bonus: enableDiscoveryBonus,
          session_feedback: feedbackOverride !== undefined ? feedbackOverride : sessionFeedback,
          top_k: 10
        });
        setRecommendResponse(resp);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch recommendations');
      } finally {
        setIsLoading(false);
      }
    },
    [
      query,
      knownPrereqs,
      targetLevel,
      selectedSubject,
      selectedType,
      enableAsymmetricPenalty,
      enableIntentSeparation,
      enableDiscoveryBonus,
      sessionFeedback
    ]
  );

  // Initial recommendation run once sample goals are ready
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Preset Goal Selection
  const handleSelectGoal = (goal: SampleGoal) => {
    setSelectedGoalId(goal.id);
    setQuery(goal.query);
    setTargetLevel(goal.target_level);
    setSelectedSubject(goal.subject_filter);
    setKnownPrereqs(goal.known_prerequisites);
    // Reset feedback on switching goals
    setSessionFeedback([]);

    // Trigger recommendation with fresh state
    api
      .getRecommendations({
        query: goal.query,
        known_prerequisites: goal.known_prerequisites,
        target_level: goal.target_level,
        subject_filter: goal.subject_filter,
        resource_type_filter: '',
        enable_asymmetric_penalty: true,
        enable_intent_separation: true,
        enable_discovery_bonus: true,
        session_feedback: [],
        top_k: 10
      })
      .then((resp) => {
        setRecommendResponse(resp);
        setError(null);
      })
      .catch((err) => setError(err.message));
  };

  // Handle Active Feedback
  const handleFeedback = (resourceId: string, type: 'relevant' | 'irrelevant') => {
    // If user clicked the same feedback button, toggle it off; otherwise update
    const existing = sessionFeedback.find((f) => f.resource_id === resourceId);
    let updated: SessionFeedbackItem[];

    if (existing && existing.feedback_type === type) {
      updated = sessionFeedback.filter((f) => f.resource_id !== resourceId);
    } else {
      updated = [
        ...sessionFeedback.filter((f) => f.resource_id !== resourceId),
        { resource_id: resourceId, feedback_type: type }
      ];
    }

    setSessionFeedback(updated);
    // Immediately re-rank with updated feedback
    fetchRecommendations(updated);
  };

  const handleResetFeedback = () => {
    setSessionFeedback([]);
    fetchRecommendations([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        retrievalMode={healthInfo?.retrieval_mode}
        catalogueSize={healthInfo?.catalogue_size}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'search' && (
          <>
            {/* Curated Sample Goal Presets */}
            <SampleGoalsPicker
              goals={sampleGoals}
              onSelectGoal={handleSelectGoal}
              selectedGoalId={selectedGoalId}
            />

            {/* Freeform Search & Novelty Controls */}
            <SearchGoalForm
              query={query}
              setQuery={(q) => {
                setQuery(q);
                setSelectedGoalId(undefined);
              }}
              knownPrereqs={knownPrereqs}
              setKnownPrereqs={setKnownPrereqs}
              targetLevel={targetLevel}
              setTargetLevel={setTargetLevel}
              enableAsymmetricPenalty={enableAsymmetricPenalty}
              setEnableAsymmetricPenalty={setEnableAsymmetricPenalty}
              enableIntentSeparation={enableIntentSeparation}
              setEnableIntentSeparation={setEnableIntentSeparation}
              enableDiscoveryBonus={enableDiscoveryBonus}
              setEnableDiscoveryBonus={setEnableDiscoveryBonus}
              onSearch={() => fetchRecommendations()}
              isLoading={isLoading}
            />

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Layout: Sidebar + Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filter Sidebar */}
              <div className="lg:col-span-1">
                <FilterSidebar
                  subjects={subjects}
                  selectedSubject={selectedSubject}
                  setSelectedSubject={(s) => {
                    setSelectedSubject(s);
                  }}
                  selectedLevel={targetLevel}
                  setSelectedLevel={(l) => {
                    setTargetLevel(l);
                  }}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  sessionFeedbackCount={sessionFeedback.length}
                  onResetFeedback={handleResetFeedback}
                  totalCatalogueSize={recommendResponse?.total_catalogue_size || 20}
                  matchedCount={recommendResponse?.matched_count || 0}
                />
              </div>

              {/* Recommendation List */}
              <div className="lg:col-span-3">
                {/* Latency & Status Header */}
                <div className="flex items-center justify-between mb-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>
                      Found <strong className="text-slate-900">{recommendResponse?.matched_count || 0}</strong>{' '}
                      relevant academic resources
                    </span>
                  </div>
                  <div className="text-slate-400 font-medium">
                    Engine Latency:{' '}
                    <strong className="text-slate-700 font-mono">
                      {recommendResponse?.latency_ms || 0} ms
                    </strong>
                  </div>
                </div>

                {/* Empty State */}
                {recommendResponse?.results.length === 0 && !isLoading && (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No catalogue resources match your filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try relaxing the subject or difficulty filter to allow cross-disciplinary discovery.
                    </p>
                  </div>
                )}

                {/* Resource Cards */}
                {recommendResponse?.results.map((item) => (
                  <ResourceCard
                    key={item.resource.id}
                    item={item}
                    onFeedback={handleFeedback}
                    onOpenContrastive={(target) => setContrastiveTarget(target)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'evaluation' && <EvaluationDashboard />}

        {activeTab === 'responsible_ai' && <ResponsibleAiSection />}
      </main>

      {/* Contrastive Explanation Modal */}
      {contrastiveTarget && recommendResponse && (
        <ContrastiveModal
          targetItem={contrastiveTarget}
          availableItems={recommendResponse.results}
          query={query}
          onClose={() => setContrastiveTarget(null)}
        />
      )}
    </div>
  );
}

export default App;
