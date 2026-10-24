import React, { useState } from "react"
import type { DifficultyLevel } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  IconSearch,
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconChevronUp,
  IconGitFork,
  IconLayersLinked,
} from "@tabler/icons-react"

interface SearchGoalFormProps {
  query: string
  setQuery: (q: string) => void
  knownPrereqs: string
  setKnownPrereqs: (p: string) => void
  targetLevel: DifficultyLevel | ""
  setTargetLevel: (l: DifficultyLevel | "") => void
  enableAsymmetricPenalty: boolean
  setEnableAsymmetricPenalty: (b: boolean) => void
  enableIntentSeparation: boolean
  setEnableIntentSeparation: (b: boolean) => void
  enableDiscoveryBonus: boolean
  setEnableDiscoveryBonus: (b: boolean) => void
  onSearch: () => void
  isLoading: boolean
}

export const SearchGoalForm: React.FC<SearchGoalFormProps> = ({
  query,
  setQuery,
  knownPrereqs,
  setKnownPrereqs,
  targetLevel,
  setTargetLevel,
  enableAsymmetricPenalty,
  setEnableAsymmetricPenalty,
  enableIntentSeparation,
  setEnableIntentSeparation,
  enableDiscoveryBonus,
  setEnableDiscoveryBonus,
  onSearch,
  isLoading,
}) => {
  const [showNoveltyControls, setShowNoveltyControls] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    onSearch()
  }

  return (
    <Card className="mb-6 border-border shadow-xs rounded-xl overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Primary Learning-Goal Search Input */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <label htmlFor="learning-goal-input" className="text-sm font-bold text-foreground">
                Student Learning Goal
              </label>
              <span className="text-xs text-muted-foreground font-medium">
                Genuine cold-start search • No prior borrowing history required
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Input
                  id="learning-goal-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Foundations of machine learning and intuitive linear algebra without heavy proofs..."
                  className="h-12 text-sm sm:text-base font-medium pl-4 pr-4 rounded-xl border-border/90 shadow-2xs focus-visible:ring-primary/20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="h-12 px-6 rounded-xl font-bold text-sm gap-2 shadow-xs shrink-0"
              >
                {isLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <IconSearch className="size-4.5" />
                    <span>Recommend</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Secondary Balanced Row: Prerequisites & Academic Difficulty */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="prereqs-input" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <IconGitFork className="size-3.5 text-primary" />
                <span>Current Knowledge / Prerequisites (Optional)</span>
              </label>
              <Input
                id="prereqs-input"
                value={knownPrereqs}
                onChange={(e) => setKnownPrereqs(e.target.value)}
                placeholder="e.g., Basic Python and high school algebra"
                className="h-10 text-xs sm:text-sm rounded-lg"
              />
              <p className="text-[11px] text-muted-foreground leading-tight">
                Decoupled from learning goal to prevent prerequisite contamination of results.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="target-level-select" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <IconLayersLinked className="size-3.5 text-primary" />
                <span>Academic Difficulty Tier (Cognitive Anchor)</span>
              </label>
              <select
                id="target-level-select"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as DifficultyLevel | "")}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-xs sm:text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="">Any Difficulty Level (Unconstrained)</option>
                <option value="Introductory">Introductory (Year 1 Undergrad / Beginner)</option>
                <option value="Intermediate">Intermediate (Year 2-3 Undergrad / Applied)</option>
                <option value="Advanced">Advanced (Senior / Master's Level)</option>
                <option value="Research">Research (Doctoral / Monograph Specialist)</option>
              </select>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Calibrates asymmetric cognitive distance penalties under Bloom's Taxonomy.
              </p>
            </div>
          </div>

          {/* Collapsible Advanced Ranking Controls & Pedagogical Novelty */}
          <div className="border-t border-border/80 pt-3">
            <button
              type="button"
              onClick={() => setShowNoveltyControls(!showNoveltyControls)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <IconAdjustmentsHorizontal className="size-3.5 text-primary" />
              <span>Ranking Settings & Pedagogical Novelty</span>
              {showNoveltyControls ? (
                <IconChevronUp className="size-3.5 text-muted-foreground" />
              ) : (
                <IconChevronDown className="size-3.5 text-muted-foreground" />
              )}
            </button>

            {showNoveltyControls && (
              <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:grid-cols-3">
                <label className="flex items-start gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-muted/40 transition-colors">
                  <Checkbox
                    checked={enableAsymmetricPenalty}
                    onCheckedChange={(checked) => setEnableAsymmetricPenalty(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-foreground">
                      Asymmetric Difficulty Penalty
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-relaxed">
                      Penalizes overly advanced monographs for introductory learners to prevent cognitive overload.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-muted/40 transition-colors">
                  <Checkbox
                    checked={enableIntentSeparation}
                    onCheckedChange={(checked) => setEnableIntentSeparation(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-foreground">
                      Intent / Prerequisite Separation
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-relaxed">
                      Isolates what the learner wants to master from declared background knowledge.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-muted/40 transition-colors">
                  <Checkbox
                    checked={enableDiscoveryBonus}
                    onCheckedChange={(checked) => setEnableDiscoveryBonus(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-foreground">
                      Long-Tail Discovery Bonus
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-relaxed">
                      Surfaces high-quality, under-circulated scholarly materials to mitigate library popularity monopolies.
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
