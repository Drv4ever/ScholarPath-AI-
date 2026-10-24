import React, { useState } from "react"
import type { ScoredResource } from "@/types"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconThumbUp,
  IconThumbDown,
  IconSparkles,
  IconGitCompare,
  IconExternalLink,
  IconCheck,
  IconLayersLinked,
  IconTag,
  IconStar,
  IconChevronDown,
  IconChevronUp,
  IconBookmark,
} from "@tabler/icons-react"

interface ResourceCardProps {
  item: ScoredResource
  onFeedback: (resourceId: string, type: "relevant" | "irrelevant") => void
  onOpenContrastive: (targetItem: ScoredResource) => void
}

const levelBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Introductory: "secondary",
  Intermediate: "outline",
  Advanced: "default",
  Research: "destructive",
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  item,
  onFeedback,
  onOpenContrastive,
}) => {
  const { resource, explanation, final_score, rank, session_feedback } = item
  const [xaiExpanded, setXaiExpanded] = useState<boolean>(false)

  return (
    <Card className="mb-4 border-border/80 shadow-xs transition-all duration-150 rounded-xl hover:border-border hover:shadow-sm bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-2 space-y-2.5">
        {/* Top Badges & Rank Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              #{rank}
            </span>
            <Badge variant={levelBadgeVariant[resource.level] || "outline"} className="text-xs font-semibold">
              {resource.level}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium text-foreground">
              {resource.subject}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {resource.resource_type}
            </span>
            {resource.access_type && (
              <span className="text-xs text-muted-foreground/75 font-normal">
                • {resource.access_type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <IconStar className="size-3.5 fill-current" />
              <span>{resource.quality_rating.toFixed(1)}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-foreground">
                Score {final_score.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Title & Author Info */}
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
            {resource.title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {resource.authors.join(", ")}{" "}
            {resource.publication_year ? `(${resource.publication_year})` : ""}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-5 py-2 space-y-3.5">
        {/* Abstract / Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {resource.abstract}
        </p>

        {/* Typography-Based Metadata Row (No nested boxes) */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <IconLayersLinked className="size-3.5 text-primary" />
            <span>
              <strong className="text-foreground font-medium">Prerequisites:</strong>{" "}
              {resource.prerequisites && resource.prerequisites.length > 0
                ? resource.prerequisites.join(", ")
                : "None (Self-contained)"}
            </span>
          </div>

          {resource.call_number && (
            <div className="flex items-center gap-1.5">
              <IconBookmark className="size-3.5 text-muted-foreground" />
              <span>
                <strong className="text-foreground font-medium">Shelf Call No:</strong>{" "}
                <span className="font-mono text-[11px]">{resource.call_number}</span>
              </span>
            </div>
          )}

          {resource.borrow_count !== undefined && (
            <div className="text-muted-foreground/80 text-[11px]">
              Circulation: {resource.borrow_count} borrows (Demonstration Proxy)
            </div>
          )}
        </div>

        {/* Interactive Explainability (XAI) Accordion */}
        <div className="rounded-lg border border-primary/20 bg-primary/[0.02] overflow-hidden">
          <button
            type="button"
            onClick={() => setXaiExpanded(!xaiExpanded)}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-primary/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <IconSparkles className="size-4 text-primary shrink-0" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Why was this recommended?
                </span>
                <span className="text-xs text-muted-foreground font-medium line-clamp-1">
                  {explanation.summary_sentence}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
                {explanation.semantic_match_pct}% Concept Alignment
              </Badge>
              {xaiExpanded ? (
                <IconChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <IconChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {xaiExpanded && (
            <div className="p-3.5 pt-1 space-y-2.5 border-t border-primary/10 text-xs text-muted-foreground">
              <p className="text-xs font-medium text-foreground leading-relaxed">
                {explanation.summary_sentence}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <IconCheck className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">Level fit:</strong>{" "}
                    {explanation.level_explanation}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <IconLayersLinked className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">Prerequisite fit:</strong>{" "}
                    {explanation.prerequisite_satisfaction}
                  </span>
                </div>
              </div>

              {/* Matched Keywords */}
              {explanation.matched_keywords && explanation.matched_keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-0.5">
                    <IconTag className="size-3 text-primary" /> Keyword attributions:
                  </span>
                  {explanation.matched_keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs font-medium px-2 py-0">
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Long-tail discovery note */}
              {explanation.discovery_bonus_applied > 0 && (
                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md font-medium">
                  🌟 Long-Tail Discovery Bonus (+{explanation.discovery_bonus_applied.toFixed(3)}): Promotes high-quality under-circulated scholarly materials.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-5 pt-2.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-border/80 bg-muted/10">
        {/* In-Session Active Feedback Loop Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Feedback:</span>
          <Button
            variant={session_feedback === "relevant" ? "default" : "outline"}
            size="xs"
            onClick={() => onFeedback(resource.id, "relevant")}
            className="gap-1 font-semibold text-xs h-7"
          >
            <IconThumbUp className="size-3" />
            <span>Helpful</span>
          </Button>

          <Button
            variant={session_feedback === "irrelevant" ? "destructive" : "outline"}
            size="xs"
            onClick={() => onFeedback(resource.id, "irrelevant")}
            className="gap-1 font-semibold text-xs h-7"
          >
            <IconThumbDown className="size-3" />
            <span>Not Relevant</span>
          </Button>
        </div>

        {/* Action Buttons: Contrastive Explanation & Official Catalogue Link */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onOpenContrastive(item)}
            className="gap-1.5 text-primary hover:text-primary font-semibold text-xs h-7"
          >
            <IconGitCompare className="size-3.5" />
            <span>Why this over another?</span>
          </Button>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-7 rounded-md px-2.5 text-xs border border-border bg-background hover:bg-muted hover:text-foreground font-medium transition-colors"
            >
              <span>Catalogue Record</span>
              <IconExternalLink className="size-3" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
