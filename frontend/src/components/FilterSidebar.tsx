import React, { useState } from "react"
import type { DifficultyLevel, ResourceType } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconFilter,
  IconRotateClockwise,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
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
  const [mobileExpanded, setMobileExpanded] = useState<boolean>(false)
  const hasActiveFilters = Boolean(selectedSubject || selectedLevel || selectedType)

  const clearAllFilters = () => {
    setSelectedSubject("")
    setSelectedLevel("")
    setSelectedType("")
  }

  return (
    <div className="space-y-3">
      {/* Mobile/Tablet Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <IconFilter className="size-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Filters & Session
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-[10px] font-bold text-primary">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary hover:underline mr-1"
            >
              Reset
            </button>
          )}
          <Button
            variant="outline"
            size="xs"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="gap-1 font-semibold text-xs"
          >
            <span>{mobileExpanded ? "Hide" : "Show"}</span>
            {mobileExpanded ? (
              <IconChevronUp className="size-3.5" />
            ) : (
              <IconChevronDown className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Sidebar Card (Always visible on desktop, toggleable on mobile) */}
      <Card className={`border-border shadow-xs rounded-xl overflow-hidden ${mobileExpanded ? "block" : "hidden lg:block"}`}>
        <CardHeader className="p-4 border-b border-border/80 flex flex-row items-center justify-between space-y-0 bg-muted/20">
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
              className="text-xs h-6 px-2 gap-1 text-primary hover:text-primary font-semibold"
            >
              <IconRotateClockwise className="size-3" />
              Reset
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Subtle Candidate Count Summary */}
          <div className="flex items-center justify-between text-xs py-1 px-1 border-b border-border/60 text-muted-foreground">
            <span>Library Scope:</span>
            <span className="font-semibold text-foreground">
              <strong className="text-primary">{matchedCount}</strong> / {totalCatalogueSize} items
            </span>
          </div>

          {/* Academic Subject Filter */}
          <div className="space-y-1.5">
            <label htmlFor="filter-subject-select" className="block text-xs font-semibold text-foreground">
              Academic Faculty / Field
            </label>
            <select
              id="filter-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">All Faculties (Cross-Disciplinary)</option>
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Tier Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Difficulty Tier Filter
            </label>
            <div className="space-y-1">
              {(["", "Introductory", "Intermediate", "Advanced", "Research"] as const).map((lvl) => {
                const isChecked = selectedLevel === lvl
                return (
                  <button
                    key={lvl || "all"}
                    type="button"
                    onClick={() => setSelectedLevel(lvl as DifficultyLevel | "")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isChecked
                        ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                        : "border border-border/70 bg-transparent text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{lvl || "All Difficulty Levels"}</span>
                    {isChecked && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resource Material Format */}
          <div className="space-y-1.5">
            <label htmlFor="filter-type-select" className="block text-xs font-semibold text-foreground">
              Resource Format
            </label>
            <select
              id="filter-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ResourceType | "")}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">All Formats (Textbooks, Surveys...)</option>
              <option value="Textbook">Textbook</option>
              <option value="Monograph">Monograph</option>
              <option value="Survey Paper">Survey Paper</option>
              <option value="Lecture Notes">Lecture Notes</option>
              <option value="Open-Access Resource">Open-Access Resource</option>
            </select>
          </div>

          {/* In-Session Vector Feedback Panel */}
          <div className="border-t border-border/80 pt-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <IconSparkles className="size-3.5 text-primary" />
                Session Feedback Steering
              </span>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {sessionFeedbackCount} {sessionFeedbackCount === 1 ? "Click" : "Clicks"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Real-time in-session vector updates without cookies or persistent storage.
            </p>
            {sessionFeedbackCount > 0 && (
              <Button
                variant="destructive"
                size="xs"
                onClick={onResetFeedback}
                className="w-full gap-1.5 font-bold h-7 text-xs"
              >
                <IconRotateClockwise className="size-3" />
                <span>Reset Feedback State</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
