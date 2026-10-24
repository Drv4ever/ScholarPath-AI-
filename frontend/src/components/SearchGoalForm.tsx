import React, { useState } from "react"
import type { DifficultyLevel } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  IconSearch,
  IconAdjustmentsHorizontal,
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
    <Card className="mb-6 border-border shadow-xs">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Free-Text Query Input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <IconSearch className="size-4 text-primary" />
                Student Learning Goal (Cold-Start Free-Text Input)
              </label>
              <span className="text-[11px] text-muted-foreground">
                No borrowing history needed
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Foundations of machine learning and intuitive linear algebra without heavy proofs..."
                className="h-10 text-sm font-medium"
                required
              />
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="h-10 px-5 gap-1.5 font-bold"
              >
                {isLoading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <IconSearch className="size-4" />
                    <span>Recommend</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dual-Space Intent & Prerequisite Disentanglement */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <IconGitFork className="size-3.5 text-primary" />
                Learner Prerequisites (Intent Disentanglement)
              </label>
              <Input
                value={knownPrereqs}
                onChange={(e) => setKnownPrereqs(e.target.value)}
                placeholder="e.g., Basic Python and high school algebra (Prevents topic confusion)"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <IconLayersLinked className="size-3.5 text-primary" />
                Academic Difficulty Tier (Cognitive Anchor)
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as DifficultyLevel | "")}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Any Difficulty Level (Unconstrained)</option>
                <option value="Introductory">Introductory (Year 1 Undergrad / Beginner)</option>
                <option value="Intermediate">Intermediate (Year 2-3 Undergrad / Applied)</option>
                <option value="Advanced">Advanced (Senior / Master's Level)</option>
                <option value="Research">Research (Doctoral / Monograph Specialist)</option>
              </select>
            </div>
          </div>

          {/* Proposed Novelty & Algorithmic Controls Toggle */}
          <div className="border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setShowNoveltyControls(!showNoveltyControls)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconAdjustmentsHorizontal className="size-3.5" />
              <span>{showNoveltyControls ? "Hide Proposed Novelty Controls" : "Proposed Novelty & Ranking Weights"}</span>
            </button>

            {showNoveltyControls && (
              <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={enableAsymmetricPenalty}
                    onCheckedChange={(checked) => setEnableAsymmetricPenalty(Boolean(checked))}
                  />
                  <div>
                    <span className="block text-xs font-bold text-foreground">
                      Asymmetric Level Penalty
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-tight">
                      Penalizes over-difficult texts for beginners (Bloom's Taxonomy).
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={enableIntentSeparation}
                    onCheckedChange={(checked) => setEnableIntentSeparation(Boolean(checked))}
                  />
                  <div>
                    <span className="block text-xs font-bold text-foreground">
                      Intent/Prerequisite Separation
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-tight">
                      Isolates target objectives from prior competencies.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={enableDiscoveryBonus}
                    onCheckedChange={(checked) => setEnableDiscoveryBonus(Boolean(checked))}
                  />
                  <div>
                    <span className="block text-xs font-bold text-foreground">
                      Long-Tail Discovery Bonus
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-tight">
                      Boosts high-quality under-circulated books (Anti-popularity).
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
