import React, { useState, useEffect } from "react"
import type { EvaluationSummary, FailureCaseAnalysis } from "@/types"
import { api } from "@/services/api"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
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
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconRotateClockwise,
  IconAlertTriangle,
  IconAdjustments,
} from "@tabler/icons-react"

// Helper to render mathematically rigorous delta badges distinguishing relative % from percentage-points (pp)
function renderDeltaBadge(
  deltaPct: number = 0,
  deltaPts?: number,
  isPercentageMetric: boolean = true
) {
  if (Math.abs(deltaPct) < 0.05) {
    return (
      <Badge variant="outline" className="text-muted-foreground border-border bg-muted/30 font-medium text-[11px] gap-0.5">
        <IconMinus className="size-3" />
        <span>Tie (0.0%)</span>
      </Badge>
    )
  }

  if (deltaPct > 0) {
    return (
      <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-[11px] gap-0.5">
        <IconTrendingUp className="size-3" />
        <span>+{deltaPct.toFixed(1)}%</span>
        {deltaPts !== undefined && (
          <span className="text-[10px] font-normal opacity-85">
            ({deltaPts > 0 ? "+" : ""}{deltaPts.toFixed(1)}{isPercentageMetric ? " pp" : ""})
          </span>
        )}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-rose-600 border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 font-bold text-[11px] gap-0.5">
      <IconTrendingDown className="size-3" />
      <span>{deltaPct.toFixed(1)}%</span>
      {deltaPts !== undefined && (
        <span className="text-[10px] font-normal opacity-85">
          ({deltaPts.toFixed(1)}{isPercentageMetric ? " pp" : ""})
        </span>
      )}
    </Badge>
  )
}

function renderTableCellGain(
  proposed: number,
  baseline: number,
  isPercentageMetric: boolean = true
) {
  const diff = proposed - baseline
  const diffPts = isPercentageMetric ? diff * 100 : diff
  const denom = Math.max(baseline, 0.0001)
  const relGainPct = (diff / denom) * 100

  if (Math.abs(relGainPct) < 0.05) {
    return <span className="text-xs font-semibold text-muted-foreground">Tie (0.0%)</span>
  }

  if (relGainPct > 0) {
    return (
      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
        +{relGainPct.toFixed(1)}%
        <span className="text-[10px] font-normal text-muted-foreground ml-1">
          (+{diffPts.toFixed(1)}{isPercentageMetric ? " pp" : ""})
        </span>
      </span>
    )
  }

  return (
    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
      {relGainPct.toFixed(1)}%
      <span className="text-[10px] font-normal text-muted-foreground ml-1">
        ({diffPts.toFixed(1)}{isPercentageMetric ? " pp" : ""})
      </span>
    </span>
  )
}

export const EvaluationDashboard: React.FC = () => {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null)
  const [failures, setFailures] = useState<FailureCaseAnalysis[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvaluation = async () => {
    setLoading(true)
    setError(null)
    try {
      const [evalData, failData] = await Promise.all([
        api.runEvaluation(),
        api.fetchFailures(),
      ])
      setSummary(evalData)
      setFailures(failData)
    } catch (err: any) {
      setError(err.message || "Failed to load evaluation data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvaluation()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Research Header Banner */}
      <Card className="border-border shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 space-y-0 bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconChartBar className="size-5" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                Information Retrieval Benchmark & Baseline Comparison
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground font-medium">
              Live, reproducible IR evaluation computed over expert-annotated ground-truth test queries comparing ScholarPath against BM25Okapi.
            </CardDescription>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={loadEvaluation}
            disabled={loading}
            className="h-9 px-4 font-bold gap-2 shrink-0 shadow-xs"
          >
            <IconRotateClockwise className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Computing IR Metrics..." : "Re-run Benchmark"}</span>
          </Button>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
          <IconAlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !summary && (
        <div className="py-20 text-center space-y-3 rounded-xl border border-border/60 bg-card">
          <span className="size-8 inline-block animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-semibold">
            Computing IR metrics across test queries (Precision, Recall, NDCG, MRR)...
          </p>
        </div>
      )}

      {!loading && summary && (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border shadow-xs rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Precision@5 (Top-5 Accuracy)
                </span>
                <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                  <span className="text-3xl font-black text-foreground">
                    {(summary.hybrid_aggregate.precision_at_5 * 100).toFixed(1)}%
                  </span>
                  {renderDeltaBadge(
                    summary.improvement_percentages.precision_at_5_delta_pct,
                    summary.improvement_percentages.precision_at_5_delta_pts,
                    true
                  )}
                </div>
                <div className="pt-1 text-xs text-muted-foreground space-y-0.5">
                  <div>BM25 Baseline: <strong className="text-foreground font-semibold">{(summary.baseline_aggregate.precision_at_5 * 100).toFixed(1)}%</strong></div>
                  <div className="text-[11px] text-muted-foreground/80">Proportion of top-5 results directly relevant to goal.</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  NDCG@5 (Ranking Quality)
                </span>
                <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                  <span className="text-3xl font-black text-foreground">
                    {summary.hybrid_aggregate.ndcg_at_5.toFixed(3)}
                  </span>
                  {renderDeltaBadge(
                    summary.improvement_percentages.ndcg_at_5_delta_pct,
                    summary.improvement_percentages.ndcg_at_5_delta_pts,
                    false
                  )}
                </div>
                <div className="pt-1 text-xs text-muted-foreground space-y-0.5">
                  <div>BM25 Baseline: <strong className="text-foreground font-semibold">{summary.baseline_aggregate.ndcg_at_5.toFixed(3)}</strong></div>
                  <div className="text-[11px] text-muted-foreground/80">Graded gain measuring ranking order correctness.</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Mean Reciprocal Rank (MRR)
                </span>
                <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                  <span className="text-3xl font-black text-foreground">
                    {summary.hybrid_aggregate.mrr.toFixed(3)}
                  </span>
                  {summary.hybrid_aggregate.mrr >= 0.999 ? (
                    <Badge variant="secondary" className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                      Optimal Rank #1
                    </Badge>
                  ) : (
                    renderDeltaBadge(
                      summary.improvement_percentages.mrr_delta_pct,
                      summary.improvement_percentages.mrr_delta_pts,
                      false
                    )
                  )}
                </div>
                <div className="pt-1 text-xs text-muted-foreground space-y-0.5">
                  <div>BM25 Baseline: <strong className="text-foreground font-semibold">{summary.baseline_aggregate.mrr.toFixed(3)}</strong></div>
                  <div className="text-[11px] text-muted-foreground/80">First relevant book retrieved at highest rank position.</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Recall@5 (Curricular Coverage)
                </span>
                <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                  <span className="text-3xl font-black text-foreground">
                    {(summary.hybrid_aggregate.recall_at_5 * 100).toFixed(1)}%
                  </span>
                  {renderDeltaBadge(
                    summary.improvement_percentages.recall_at_5_delta_pct ?? 0,
                    summary.improvement_percentages.recall_at_5_delta_pts,
                    true
                  )}
                </div>
                <div className="pt-1 text-xs text-muted-foreground space-y-0.5">
                  <div>BM25 Baseline: <strong className="text-foreground font-semibold">{(summary.baseline_aggregate.recall_at_5 * 100).toFixed(1)}%</strong></div>
                  <div className="text-[11px] text-muted-foreground/80">Coverage of gold-standard references captured in top-5.</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Head-to-Head Comparison Table */}
          <Card className="border-border shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Head-to-Head Performance Benchmark (Hybrid Recommender vs BM25 Baseline)
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium">
                  {summary.total_test_queries} Ground-Truth Annotated Queries
                </span>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                    <TableHead className="text-xs font-bold text-foreground">Evaluation Metric</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Lexical Baseline (BM25)</TableHead>
                    <TableHead className="text-xs font-bold text-primary">ScholarPath AI (Proposed)</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Statistical Delta</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Pedagogical / IR Significance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs">Precision@3</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{(summary.baseline_aggregate.precision_at_3 * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {(summary.hybrid_aggregate.precision_at_3 * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {renderTableCellGain(summary.hybrid_aggregate.precision_at_3, summary.baseline_aggregate.precision_at_3, true)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Relevance density of immediate top-3 student suggestions.</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-muted/30 bg-primary/[0.01]">
                    <TableCell className="font-bold text-xs text-foreground">Precision@5</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{(summary.baseline_aggregate.precision_at_5 * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {(summary.hybrid_aggregate.precision_at_5 * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {renderTableCellGain(summary.hybrid_aggregate.precision_at_5, summary.baseline_aggregate.precision_at_5, true)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Primary metric: quality across the immediate student recommendation window.</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs">NDCG@5</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{summary.baseline_aggregate.ndcg_at_5.toFixed(4)}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {summary.hybrid_aggregate.ndcg_at_5.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {renderTableCellGain(summary.hybrid_aggregate.ndcg_at_5, summary.baseline_aggregate.ndcg_at_5, false)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Graded ranking quality under discounted logarithmic positional gain.</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs">Mean Reciprocal Rank (MRR)</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{summary.baseline_aggregate.mrr.toFixed(4)}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {summary.hybrid_aggregate.mrr.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {summary.hybrid_aggregate.mrr >= 0.999 && summary.baseline_aggregate.mrr >= 0.999 ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Optimal (1.0000)
                        </span>
                      ) : (
                        renderTableCellGain(summary.hybrid_aggregate.mrr, summary.baseline_aggregate.mrr, false)
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">First highly relevant scholarly resource retrieved at Rank #1.</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs">Recall@5</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{(summary.baseline_aggregate.recall_at_5 * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {(summary.hybrid_aggregate.recall_at_5 * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {renderTableCellGain(summary.hybrid_aggregate.recall_at_5, summary.baseline_aggregate.recall_at_5, true)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Coverage of gold-standard academic references captured.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Ablation Study Table */}
          <Card className="border-border shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20">
              <div className="flex items-center gap-2">
                <IconAdjustments className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Ablation Study: Quantifying Pedagogical Novelty Contributions
                </CardTitle>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                    <TableHead className="text-xs font-bold text-foreground">System Configuration</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">P@5</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">NDCG@5</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">MRR</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Empirical Pedagogical Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(summary.ablation_study).map(([configName, metrics], idx) => (
                    <TableRow key={idx} className={configName.includes("ScholarPath") ? "bg-primary/[0.02]" : "hover:bg-muted/30"}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {configName.includes("ScholarPath") ? (
                          <span className="text-primary font-bold">{configName}</span>
                        ) : (
                          configName
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{(metrics.precision_at_5 * 100).toFixed(1)}%</TableCell>
                      <TableCell className="font-mono text-xs font-medium">{metrics.ndcg_at_5.toFixed(3)}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">{metrics.mrr.toFixed(3)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {configName.includes("ScholarPath")
                          ? "Optimal cognitive fit; suppresses inaccessible monographs for beginners while retaining cross-disciplinary breadth."
                          : configName.includes("Ablation")
                          ? "Suffers from cognitive overload: recommends impenetrable research papers to introductory undergraduates."
                          : "Vocabulary mismatch: misses conceptual synonyms and cross-disciplinary topic relationships."}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Documented Failure-Case Analysis & Technical Limitations */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 px-1">
              <IconAlertTriangle className="size-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Documented Failure-Case Analysis & Technical Limitations
              </h3>
            </div>
            <p className="text-xs text-muted-foreground px-1 -mt-1">
              Transparent IR failure mode analysis and boundary diagnostic logging under cold-start conditions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {failures.map((fail) => (
                <Card
                  key={fail.id}
                  className="rounded-xl border border-border shadow-xs bg-card p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted-foreground">{fail.id}</span>
                      <Badge variant="outline" className="text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800">
                        {fail.failure_type}
                      </Badge>
                    </div>

                    <p className="font-bold text-sm text-foreground">"{fail.query}"</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{fail.description}</p>

                    <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-destructive uppercase tracking-wider block">
                          Baseline Failure:
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{fail.lexical_baseline_result}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          ScholarPath Mitigation:
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{fail.mitigation_strategy}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/80 text-[11px] text-muted-foreground italic leading-relaxed">
                    Remaining boundary: {fail.remaining_limitation}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
