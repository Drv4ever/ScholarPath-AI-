import React from "react"
import type { DifficultyLevel, ResourceType } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconFilter,
  IconRotateClockwise,
  IconSparkles,
} from "@tabler/icons-react"

interface FilterSidebarProps {
  subjects: string[]
  selectedSubject: string
  setSelectedSubject: (s: string) => void
  selectedLevel: DifficultyLevel | ""
  setSelectedLevel: (l: DifficultyLevel | "") => void
  selectedType: ResourceType | ""
  setSelectedType: (t: ResourceType | "") => void
  sessionFeedbackCount: number
  onResetFeedback: () => void
  totalCatalogueSize: number
  matchedCount: number
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  subjects,
  selectedSubject,
  setSelectedSubject,
  selectedLevel,
  setSelectedLevel,
  selectedType,
  setSelectedType,
  sessionFeedbackCount,
  onResetFeedback,
  totalCatalogueSize,
  matchedCount,
}) => {
  const hasActiveFilters = Boolean(selectedSubject || selectedLevel || selectedType)

  const clearAllFilters = () => {
    setSelectedSubject("")
    setSelectedLevel("")
    setSelectedType("")
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <IconFilter className="size-4 text-primary" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
            Catalogue Filters
          </CardTitle>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearAllFilters}
            className="text-[11px] gap-1 text-primary hover:text-primary"
          >
            <IconRotateClockwise className="size-3" />
            Reset
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        {/* Status Indicator */}
        <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Catalogue Size:</span>
            <span className="font-bold text-foreground">{totalCatalogueSize} Items</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Ranked Candidates:</span>
            <span className="font-bold text-primary">{matchedCount} Matches</span>
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Academic Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All Subjects (Cross-Disciplinary)</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Level Radio Selector */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Difficulty Tier
          </label>
          <div className="space-y-1">
            {(["", "Introductory", "Intermediate", "Advanced", "Research"] as const).map((lvl) => {
              const isChecked = selectedLevel === lvl
              return (
                <button
                  key={lvl || "all"}
                  type="button"
                  onClick={() => setSelectedLevel(lvl as DifficultyLevel | "")}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isChecked
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-transparent text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span>{lvl || "All Difficulty Levels"}</span>
                  {isChecked && <span className="size-1.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Material Format */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resource Format
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ResourceType | "")}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All Formats</option>
            <option value="Textbook">Textbook</option>
            <option value="Monograph">Monograph</option>
            <option value="Survey Paper">Survey Paper</option>
            <option value="Lecture Notes">Lecture Notes</option>
            <option value="Open-Access Resource">Open-Access Resource</option>
          </select>
        </div>

        {/* Active Feedback Loop Status */}
        <div className="border-t border-border pt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
              <IconSparkles className="size-3.5 text-primary" />
              Session Feedback
            </span>
            <Badge variant="secondary" className="text-[10px] font-bold">
              {sessionFeedbackCount} Active
            </Badge>
          </div>
          <p className="mb-3 text-[11px] text-muted-foreground leading-relaxed">
            Relevance clicks dynamically steer the session vector in real time. Zero data is persisted to disk.
          </p>
          {sessionFeedbackCount > 0 && (
            <Button
              variant="destructive"
              size="xs"
              onClick={onResetFeedback}
              className="w-full gap-1.5 font-bold"
            >
              <IconRotateClockwise className="size-3.5" />
              Reset Session Feedback
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
