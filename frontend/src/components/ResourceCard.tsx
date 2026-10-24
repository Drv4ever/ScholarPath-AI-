import React from "react"
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

  return (
    <Card className="mb-4 border-border shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="p-4 pb-2 space-y-2">
        {/* Top Badges & Rank */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className="size-6 p-0 flex items-center justify-center font-bold text-xs">
              #{rank}
            </Badge>
            <Badge variant={levelBadgeVariant[resource.level] || "outline"}>
              {resource.level}
            </Badge>
            <Badge variant="outline">{resource.subject}</Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {resource.resource_type}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
              <IconStar className="size-3.5 fill-current" />
              <span>{resource.quality_rating.toFixed(1)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Score</span>
              <span className="font-mono font-bold text-foreground">
                {final_score.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Title & Authors */}
        <div>
          <CardTitle className="text-base font-bold text-foreground leading-snug">
            {resource.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {resource.authors.join(", ")}{" "}
            {resource.publication_year ? `(${resource.publication_year})` : ""}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-3">
        {/* Abstract */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {resource.abstract}
        </p>

        {/* Prerequisites & Library Call Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Prerequisites
            </span>
            <span className="font-medium text-foreground">
              {resource.prerequisites.length > 0
                ? resource.prerequisites.join(", ")
                : "None (Self-contained)"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Call Number
            </span>
            <span className="font-mono font-semibold text-foreground">
              {resource.call_number || "Digital Academic Resource"}
            </span>
          </div>
        </div>

        {/* Explicit Explainability Box (XAI) */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <IconSparkles className="size-3.5" />
              Why was this recommended? (XAI)
            </span>
            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
              {explanation.semantic_match_pct}% Concept Match
            </Badge>
          </div>

          <p className="text-xs font-medium text-foreground leading-relaxed">
            {explanation.summary_sentence}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-primary/10 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <IconCheck className="size-3 text-emerald-600 flex-shrink-0" />
              <span>{explanation.level_explanation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconLayersLinked className="size-3 text-primary flex-shrink-0" />
              <span>{explanation.prerequisite_satisfaction}</span>
            </div>
          </div>

          {/* Matched Keywords */}
          {explanation.matched_keywords && explanation.matched_keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1 mr-1">
                <IconTag className="size-3" /> Keywords:
              </span>
              {explanation.matched_keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                  {kw}
                </Badge>
              ))}
            </div>
          )}

          {/* Discovery bonus alert */}
          {explanation.discovery_bonus_applied > 0 && (
            <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-medium">
              🌟 Discovery Bonus (+{explanation.discovery_bonus_applied}): Under-circulated high-quality resource.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border">
        {/* Active In-Session Feedback Steering Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Feedback:</span>
          <Button
            variant={session_feedback === "relevant" ? "default" : "outline"}
            size="xs"
            onClick={() => onFeedback(resource.id, "relevant")}
            className="gap-1 font-bold"
          >
            <IconThumbUp className="size-3" />
            <span>Relevant</span>
          </Button>

          <Button
            variant={session_feedback === "irrelevant" ? "destructive" : "outline"}
            size="xs"
            onClick={() => onFeedback(resource.id, "irrelevant")}
            className="gap-1 font-bold"
          >
            <IconThumbDown className="size-3" />
            <span>Irrelevant</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onOpenContrastive(item)}
            className="gap-1 text-primary hover:text-primary font-semibold"
          >
            <IconGitCompare className="size-3.5" />
            <span>Compare vs Alternative</span>
          </Button>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 h-6 rounded-[min(var(--radius-md),10px)] px-2 text-xs border border-border bg-background hover:bg-muted hover:text-foreground font-medium transition-colors"
            >
              <span>Catalogue DOI</span>
              <IconExternalLink className="size-3" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
