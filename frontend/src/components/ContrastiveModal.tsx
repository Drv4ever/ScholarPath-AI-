import React, { useState, useEffect } from 'react';
import { X, GitCompare, Trophy, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { ScoredResource, ContrastiveExplanationResponse } from '../types';
import { api } from '../services/api';

interface ContrastiveModalProps {
  targetItem: ScoredResource;
  availableItems: ScoredResource[];
  query: string;
  onClose: () => void;
}

export const ContrastiveModal: React.FC<ContrastiveModalProps> = ({
  targetItem,
  availableItems,
  query,
  onClose
}) => {
  const alternatives = availableItems.filter((i) => i.resource.id !== targetItem.resource.id);
  const [selectedAltId, setSelectedAltId] = useState<string>(alternatives[0]?.resource.id || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<ContrastiveExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAltId) return;

    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.getContrastiveExplanation(
          targetItem.resource.id,
          selectedAltId,
          query,
          targetItem.resource.level,
          ''
        );
        setExplanation(resp);
      } catch (err: any) {
        setError(err.message || 'Failed to generate contrastive explanation');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [selectedAltId, targetItem.resource.id, query]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Contrastive Explanation: Why X over Y?
              </h3>
              <p className="text-xs text-slate-500">
                Causal feature attribution comparing two candidate resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Resource Selector Comparison Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block mb-1">
                Target Selected Resource (# {targetItem.rank})
              </span>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{targetItem.resource.title}</p>
              <span className="text-xs text-slate-500 font-medium">
                {targetItem.resource.level} • {targetItem.resource.subject}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Compare Against Alternative
              </span>
              <select
                value={selectedAltId}
                onChange={(e) => setSelectedAltId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:ring-2 focus:ring-brand-500"
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
            <div className="py-12 text-center space-y-2">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-brand-600 border-t-transparent" />
              <p className="text-xs text-slate-500 font-medium">Computing contrastive feature attribution...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && explanation && (
            <>
              {/* Narrative Synthesis */}
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Trophy className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                    Comparative Ranking Synthesis
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {explanation.narrative_explanation}
                </p>
              </div>

              {/* Factors Comparison Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Criterion-by-Criterion Factor Breakdown
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Evaluation Criterion</th>
                        <th className="py-2.5 px-3">Target Resource</th>
                        <th className="py-2.5 px-3">Alternative Resource</th>
                        <th className="py-2.5 px-3">Advantage</th>
                        <th className="py-2.5 px-3">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {explanation.factors.map((factor, idx) => {
                        const isTargetAdv = factor.advantage === 'Target';
                        const isAltAdv = factor.advantage === 'Alternative';
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-slate-800">{factor.criterion}</td>
                            <td className="py-2 px-3 text-slate-700">{factor.target_value}</td>
                            <td className="py-2 px-3 text-slate-700">{factor.alternative_value}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isTargetAdv
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isAltAdv
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {factor.advantage}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-medium">{factor.impact}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
