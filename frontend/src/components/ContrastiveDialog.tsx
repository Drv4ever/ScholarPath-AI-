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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <IconGitCompare className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Contrastive Explanation: Why X over Y?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Causal feature attribution comparing two candidate resources under current query constraints.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target & Alternative Selector Header */}
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">
                Selected Resource (#{targetItem.rank})
              </span>
              <p className="text-xs font-bold text-foreground line-clamp-1">
                {targetItem.resource.title}
              </p>
              <span className="text-[11px] text-muted-foreground">
                {targetItem.resource.level} • {targetItem.resource.subject}
              </span>
            </div>

            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Compare Against Alternative
              </span>
              <select
                value={selectedAltId}
                onChange={(e) => setSelectedAltId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {alternatives.map((alt) => (
                  <option key={alt.resource.id} value={alt.resource.id}>
                    #{alt.rank} - {alt.resource.title} ({alt.resource.level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="py-8 text-center space-y-2">
              <span className="size-6 inline-block animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground">Computing causal factor attribution...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <IconAlertTriangle className="size-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && explanation && (
            <>
              {/* Narrative Synthesis */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <IconTrophy className="size-4" />
                  <span>Comparative Ranking Synthesis</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {explanation.narrative_explanation}
                </p>
              </div>

              {/* Criterion-by-Criterion Table */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Feature-Level Breakdown
                </h4>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-bold">Criterion</TableHead>
                        <TableHead className="text-xs font-bold">Target</TableHead>
                        <TableHead className="text-xs font-bold">Alternative</TableHead>
                        <TableHead className="text-xs font-bold">Advantage</TableHead>
                        <TableHead className="text-xs font-bold">Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {explanation.factors.map((factor, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs font-semibold">{factor.criterion}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{factor.target_value}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{factor.alternative_value}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                factor.advantage === "Target"
                                  ? "default"
                                  : factor.advantage === "Alternative"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[10px]"
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

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
