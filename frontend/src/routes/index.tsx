import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/Header"
import { SampleGoalsPicker } from "@/components/SampleGoalsPicker"
import { SearchGoalForm } from "@/components/SearchGoalForm"
import { FilterSidebar } from "@/components/FilterSidebar"
import { ResourceCard } from "@/components/ResourceCard"
import { ContrastiveDialog } from "@/components/ContrastiveDialog"
import { EvaluationDashboard } from "@/components/EvaluationDashboard"
import { ResponsibleAiSection } from "@/components/ResponsibleAiSection"
import { api } from "@/services/api"
import type {
  ScoredResource,
  RecommendResponse,
  SampleGoal,
  DifficultyLevel,
  ResourceType,
  SessionFeedbackItem,
} from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  IconBook,
  IconSparkles,
  IconAlertTriangle,
} from "@tabler/icons-react"

export const Route = createFileRoute("/")({ component: ScholarPathApp })

function ScholarPathApp() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"search" | "evaluation" | "responsible_ai">("search")

  // Search & Filter State
  const [query, setQuery] = useState<string>("Foundations of machine learning and intuitive linear algebra")
  const [knownPrereqs, setKnownPrereqs] = useState<string>("Basic Python and high school algebra")
  const [targetLevel, setTargetLevel] = useState<DifficultyLevel | "">("Introductory")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedType, setSelectedType] = useState<ResourceType | "">("")

  // Algorithm Flags
  const [enableAsymmetricPenalty, setEnableAsymmetricPenalty] = useState<boolean>(true)
  const [enableIntentSeparation, setEnableIntentSeparation] = useState<boolean>(true)
  const [enableDiscoveryBonus, setEnableDiscoveryBonus] = useState<boolean>(true)

  // In-Session Active Feedback (Zero Server-Side User State)
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedbackItem[]>([])

  // Metadata
  const [subjects, setSubjects] = useState<string[]>([])
  const [sampleGoals, setSampleGoals] = useState<SampleGoal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>("GOAL-01")
  const [healthInfo, setHealthInfo] = useState<any>(null)

  // Recommendations & UI State
  const [recommendResponse, setRecommendResponse] = useState<RecommendResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Contrastive Dialog State
  const [contrastiveTarget, setContrastiveTarget] = useState<ScoredResource | null>(null)

  // Initialize Metadata
  useEffect(() => {
    const init = async () => {
      try {
        const [subjs, goals, health] = await Promise.all([
          api.fetchSubjects(),
          api.fetchSampleGoals(),
          api.fetchHealth(),
        ])
        setSubjects(subjs)
        setSampleGoals(goals)
        setHealthInfo(health)
      } catch (err: any) {
        console.error("Initialization error:", err)
      }
    }
    init()
  }, [])

  // Execute Recommendation
  const fetchRecommendations = useCallback(
    async (feedbackOverride?: SessionFeedbackItem[]) => {
      if (!query.trim()) return
      setIsLoading(true)
      setError(null)
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
          top_k: 10,
        })
        setRecommendResponse(resp)
      } catch (err: any) {
        setError(err.message || "Failed to fetch recommendations")
      } finally {
        setIsLoading(false)
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
      sessionFeedback,
    ]
  )

  // Trigger initial recommendations
  useEffect(() => {
    fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Preset Goal Selection
  const handleSelectGoal = (goal: SampleGoal) => {
    setSelectedGoalId(goal.id)
    setQuery(goal.query)
    setTargetLevel(goal.target_level)
    setSelectedSubject(goal.subject_filter)
    setKnownPrereqs(goal.known_prerequisites)
    setSessionFeedback([])

    api
      .getRecommendations({
        query: goal.query,
        known_prerequisites: goal.known_prerequisites,
        target_level: goal.target_level,
        subject_filter: goal.subject_filter,
        resource_type_filter: "",
        enable_asymmetric_penalty: true,
        enable_intent_separation: true,
        enable_discovery_bonus: true,
        session_feedback: [],
        top_k: 10,
      })
      .then((resp) => {
        setRecommendResponse(resp)
        setError(null)
      })
      .catch((err) => setError(err.message))
  }

  // Active Feedback Handler
  const handleFeedback = (resourceId: string, type: "relevant" | "irrelevant") => {
    const existing = sessionFeedback.find((f) => f.resource_id === resourceId)
    let updated: SessionFeedbackItem[]

    if (existing && existing.feedback_type === type) {
      updated = sessionFeedback.filter((f) => f.resource_id !== resourceId)
    } else {
      updated = [
        ...sessionFeedback.filter((f) => f.resource_id !== resourceId),
        { resource_id: resourceId, feedback_type: type },
      ]
    }

    setSessionFeedback(updated)
    fetchRecommendations(updated)
  }

  const handleResetFeedback = () => {
    setSessionFeedback([])
    fetchRecommendations([])
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        retrievalMode={healthInfo?.retrieval_mode}
        catalogueSize={healthInfo?.catalogue_size}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "search" && (
          <>
            {/* Prepared Sample Goal Presets */}
            <SampleGoalsPicker
              goals={sampleGoals}
              onSelectGoal={handleSelectGoal}
              selectedGoalId={selectedGoalId}
            />

            {/* Free-Text Search & Algorithmic Novelty Controls */}
            <SearchGoalForm
              query={query}
              setQuery={(q) => {
                setQuery(q)
                setSelectedGoalId(undefined)
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
              <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
                <IconAlertTriangle className="size-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Content Layout: Sidebar Filters + Recommendations List */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <FilterSidebar
                  subjects={subjects}
                  selectedSubject={selectedSubject}
                  setSelectedSubject={setSelectedSubject}
                  selectedLevel={targetLevel}
                  setSelectedLevel={setTargetLevel}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  sessionFeedbackCount={sessionFeedback.length}
                  onResetFeedback={handleResetFeedback}
                  totalCatalogueSize={recommendResponse?.total_catalogue_size || 20}
                  matchedCount={recommendResponse?.matched_count || 0}
                />
              </div>

              <div className="lg:col-span-3">
                {/* Results Header: Latency, Count & Mode (Borderless for clean hierarchy) */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <IconSparkles className="size-4 text-primary shrink-0" />
                    <span>
                      Found <strong className="text-foreground font-bold">{recommendResponse?.matched_count || 0}</strong>{" "}
                      academically relevant resources
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-xs">
                      Latency: <strong className="text-foreground">{recommendResponse?.latency_ms || 0} ms</strong>
                    </span>
                    {recommendResponse?.retrieval_mode && (
                      <Badge variant="outline" className="text-[11px] font-normal border-border/80 hidden sm:inline-flex">
                        {recommendResponse.retrieval_mode}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Empty State */}
                {recommendResponse?.results.length === 0 && !isLoading && (
                  <Card className="p-12 text-center border-border shadow-xs">
                    <CardContent className="space-y-2">
                      <IconBook className="size-10 text-muted-foreground mx-auto" />
                      <h3 className="text-sm font-bold text-foreground">No resources match your filters</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Relax the subject or difficulty tier filter to enable cross-disciplinary academic discovery.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Resource Cards */}
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

        {activeTab === "evaluation" && <EvaluationDashboard />}

        {activeTab === "responsible_ai" && <ResponsibleAiSection />}
      </main>

      {/* Contrastive Explanation Dialog */}
      {contrastiveTarget && recommendResponse && (
        <ContrastiveDialog
          targetItem={contrastiveTarget}
          availableItems={recommendResponse.results}
          query={query}
          onClose={() => setContrastiveTarget(null)}
        />
      )}
    </div>
  )
}
