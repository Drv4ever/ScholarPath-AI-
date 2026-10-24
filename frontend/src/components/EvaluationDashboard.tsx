import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  FileText,
  Sliders,
  Layers,
  HelpCircle
} from 'lucide-react';
import { EvaluationSummary, FailureCaseAnalysis } from '../types';
import { api } from '../services/api';

export const EvaluationDashboard: React.FC = () => {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [failures, setFailures] = useState<FailureCaseAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvaluation = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evalData, failData] = await Promise.all([
        api.runEvaluation(),
        api.fetchFailures()
      ]);
      setSummary(evalData);
      setFailures(failData);
    } catch (err: any) {
      setError(err.message || 'Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluation();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title & Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Information Retrieval Benchmark & Baseline Comparison
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Live, reproducible evaluation computed over expert human-annotated ground-truth test queries.
            Directly benchmarks the proposed ScholarPath Hybrid against a standard Lexical (BM25) baseline.
          </p>
        </div>

        <button
          onClick={loadEvaluation}
          disabled={loading}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Evaluating...' : 'Re-run Benchmark'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !summary && (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-brand-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-semibold">Running multi-metric IR evaluation suite...</p>
        </div>
      )}

      {!loading && summary && (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Precision@5 (Top-5 Accuracy)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {(summary.hybrid_aggregate.precision_at_5 * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{summary.improvement_percentages.precision_at_5_delta_pct}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Baseline BM25: {(summary.baseline_aggregate.precision_at_5 * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                NDCG@5 (Ranking Quality)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {summary.hybrid_aggregate.ndcg_at_5.toFixed(3)}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{summary.improvement_percentages.ndcg_at_5_delta_pct}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Baseline BM25: {summary.baseline_aggregate.ndcg_at_5.toFixed(3)}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Mean Reciprocal Rank (MRR)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {summary.hybrid_aggregate.mrr.toFixed(3)}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{summary.improvement_percentages.mrr_delta_pct}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Baseline BM25: {summary.baseline_aggregate.mrr.toFixed(3)}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Recall@5 (Coverage)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {(summary.hybrid_aggregate.recall_at_5 * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {summary.total_test_queries} Test Queries
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Baseline BM25: {(summary.baseline_aggregate.recall_at_5 * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Head-to-Head Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Head-to-Head Performance Matrix
              </h3>
              <span className="text-xs text-slate-400">
                Evaluated at {new Date(summary.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Evaluation Metric</th>
                    <th className="py-3 px-4">Lexical Baseline (BM25 Only)</th>
                    <th className="py-3 px-4 text-brand-700 bg-brand-50/50">ScholarPath AI (Proposed Hybrid)</th>
                    <th className="py-3 px-4">Relative Improvement</th>
                    <th className="py-3 px-4">IR Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Precision@3</td>
                    <td className="py-3 px-4 font-mono">{(summary.baseline_aggregate.precision_at_3 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 bg-brand-50/30">
                      {(summary.hybrid_aggregate.precision_at_3 * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">
                      +{(((summary.hybrid_aggregate.precision_at_3 - summary.baseline_aggregate.precision_at_3) / Math.max(summary.baseline_aggregate.precision_at_3, 0.001)) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-slate-500">Proportion of top 3 suggestions that are directly relevant.</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Precision@5</td>
                    <td className="py-3 px-4 font-mono">{(summary.baseline_aggregate.precision_at_5 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 bg-brand-50/30">
                      {(summary.hybrid_aggregate.precision_at_5 * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">
                      +{summary.improvement_percentages.precision_at_5_delta_pct}%
                    </td>
                    <td className="py-3 px-4 text-slate-500">Quality of initial viewport recommendations.</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">NDCG@5</td>
                    <td className="py-3 px-4 font-mono">{summary.baseline_aggregate.ndcg_at_5.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 bg-brand-50/30">
                      {summary.hybrid_aggregate.ndcg_at_5.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">
                      +{summary.improvement_percentages.ndcg_at_5_delta_pct}%
                    </td>
                    <td className="py-3 px-4 text-slate-500">Penalizes highly relevant textbooks appearing at lower ranks.</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Mean Reciprocal Rank (MRR)</td>
                    <td className="py-3 px-4 font-mono">{summary.baseline_aggregate.mrr.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 bg-brand-50/30">
                      {summary.hybrid_aggregate.mrr.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">
                      +{summary.improvement_percentages.mrr_delta_pct}%
                    </td>
                    <td className="py-3 px-4 text-slate-500">Speed to student finding their first highly relevant book.</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Recall@5</td>
                    <td className="py-3 px-4 font-mono">{(summary.baseline_aggregate.recall_at_5 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 bg-brand-50/30">
                      {(summary.hybrid_aggregate.recall_at_5 * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {(summary.hybrid_aggregate.recall_at_5 >= summary.baseline_aggregate.recall_at_5 ? '+' : '')}
                      {(((summary.hybrid_aggregate.recall_at_5 - summary.baseline_aggregate.recall_at_5) / Math.max(summary.baseline_aggregate.recall_at_5, 0.001)) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-slate-500">Coverage of gold-standard references captured in top 5.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ablation Study Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Ablation Study: Quantifying Novelty Impact
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Demonstrates that the proposed asymmetric difficulty penalty and intent separation produce
              measurable gains beyond raw unconstrained semantic search.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">System Configuration</th>
                    <th className="py-2.5 px-3">P@5</th>
                    <th className="py-2.5 px-3">NDCG@5</th>
                    <th className="py-2.5 px-3">MRR</th>
                    <th className="py-2.5 px-3">Primary Impact Observed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(summary.ablation_study).map(([configName, metrics], idx) => (
                    <tr key={idx} className={configName.includes('ScholarPath') ? 'bg-brand-50/40 font-semibold' : ''}>
                      <td className="py-2.5 px-3 text-slate-900">{configName}</td>
                      <td className="py-2.5 px-3 font-mono">{(metrics.precision_at_5 * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 font-mono">{metrics.ndcg_at_5.toFixed(3)}</td>
                      <td className="py-2.5 px-3 font-mono">{metrics.mrr.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {configName.includes('ScholarPath')
                          ? 'Optimal cognitive alignment; suppresses inaccessible monographs for beginners.'
                          : configName.includes('Ablation')
                          ? 'Suffers from cognitive overload: recommends research papers to first-years.'
                          : 'Vocabulary mismatch: misses synonyms and conceptual relations.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failure-Case Analysis & Transparent Limitations */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Documented Failure-Case Analysis & Limitations
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with responsible academic engineering and hackathon submission guidelines, we analyze
              representative failure cases, disambiguation challenges, and boundary limitations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {failures.map((fail) => (
                <div
                  key={fail.id}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{fail.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {fail.failure_type}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 mb-1">"{fail.query}"</p>
                    <p className="text-slate-600 leading-relaxed text-[11px] mb-2">{fail.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 block uppercase">Baseline Failure:</span>
                        <span className="text-[11px] text-slate-600">{fail.lexical_baseline_result}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 block uppercase">Our Mitigation:</span>
                        <span className="text-[11px] text-slate-600">{fail.mitigation_strategy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium italic">
                    Remaining limitation: {fail.remaining_limitation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
