import React, { useState, useEffect } from "react"
import type { ScoredResource, ContrastiveExplanationResponse } from "@/types"
import { api } from "@/services/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconGitCompare,
  IconTrophy,
  IconAlertTriangle,
} from "@tabler/icons-react"

interface ContrastiveDialogProps {
  targetItem: ScoredResource | null
  availableItems: ScoredResource[]
  query: string
  onClose: () => void
}

export const ContrastiveDialog: React.FC<ContrastiveDialogProps> = ({
  targetItem,
  availableItems,
  query,
  onClose,
}) => {
  if (!targetItem) return null

  const alternatives = availableItems.filter((i) => i.resource.id !== targetItem.resource.id)
  const [selectedAltId, setSelectedAltId] = useState<string>(alternatives[0]?.resource.id || "")
  const [loading, setLoading] = useState<boolean>(false)
  const [explanation, setExplanation] = useState<ContrastiveExplanationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedAltId || !targetItem) return

    const fetchExplanation = async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await api.getContrastiveExplanation(
          targetItem.resource.id,
          selectedAltId,
          query,
          targetItem.resource.level,
          ""
        )
        setExplanation(resp)
      } catch (err: any) {
        setError(err.message || "Failed to generate contrastive explanation")
      } finally {
        setLoading(false)
      }
    }

    fetchExplanation()
  }, [selectedAltId, targetItem, query])

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconGitCompare className="size-4.5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Contrastive Explanation: Why Resource A over Resource B?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            Causal counterfactual feature comparison explaining why the higher-ranked resource was selected over a candidate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target & Alternative Comparison Header */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-primary">
                Selected Resource (#{targetItem.rank})
              </span>
              <p className="text-xs font-bold text-foreground line-clamp-1">
                {targetItem.resource.title}
              </p>
              <span className="text-xs text-muted-foreground block">
                {targetItem.resource.level} • {targetItem.resource.subject}
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-semibold text-muted-foreground">
                Compare Against Alternative:
              </span>
              <select
                value={selectedAltId}
                onChange={(e) => setSelectedAltId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {alternatives.map((alt) => (
                  <option key={alt.resource.id} value={alt.resource.id}>
                    #{alt.rank} — {alt.resource.title} ({alt.resource.level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="py-10 text-center space-y-2">
              <span className="size-6 inline-block animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground font-medium">Computing causal feature differences...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2">
              <IconAlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && explanation && (
            <>
              {/* Narrative Synthesis */}
              <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <IconTrophy className="size-4" />
                  <span>Causal Ranking Narrative</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                  {explanation.narrative_explanation}
                </p>
              </div>

              {/* Criterion-by-Criterion Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-0.5">
                  Feature-Level Attribution Matrix
                </h4>
                <div className="rounded-xl border border-border/80 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                        <TableHead className="text-xs font-bold text-foreground">Criterion</TableHead>
                        <TableHead className="text-xs font-bold text-muted-foreground">Target ({targetItem.resource.id})</TableHead>
                        <TableHead className="text-xs font-bold text-muted-foreground">Alternative</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Advantage</TableHead>
                        <TableHead className="text-xs font-bold text-muted-foreground">Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {explanation.factors.map((factor, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/20">
                          <TableCell className="text-xs font-semibold text-foreground">{factor.criterion}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{factor.target_value}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{factor.alternative_value}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs font-semibold ${
                                factor.advantage === "Target"
                                  ? "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20"
                                  : factor.advantage === "Alternative"
                                  ? "text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-950/20"
                                  : "text-muted-foreground border-border"
                              }`}
                            >
                              {factor.advantage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{factor.impact}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 font-semibold text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
