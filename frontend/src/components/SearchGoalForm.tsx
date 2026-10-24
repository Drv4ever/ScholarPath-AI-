import React, { useState } from 'react';
import { Search, SlidersHorizontal, HelpCircle, Layers, Split, Flame } from 'lucide-react';
import { DifficultyLevel } from '../types';

interface SearchGoalFormProps {
  query: string;
  setQuery: (q: string) => void;
  knownPrereqs: string;
  setKnownPrereqs: (p: string) => void;
  targetLevel: DifficultyLevel | '';
  setTargetLevel: (l: DifficultyLevel | '') => void;
  enableAsymmetricPenalty: boolean;
  setEnableAsymmetricPenalty: (b: boolean) => void;
  enableIntentSeparation: boolean;
  setEnableIntentSeparation: (b: boolean) => void;
  enableDiscoveryBonus: boolean;
  setEnableDiscoveryBonus: (b: boolean) => void;
  onSearch: () => void;
  isLoading: boolean;
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
  isLoading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
      {/* Primary Goal Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search className="w-4 h-4 text-brand-600" />
            Student Learning Goal or Research Topic (Cold-Start Free Text)
          </span>
          <span className="text-xs text-slate-400 font-normal">No borrowing history needed</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Foundations of machine learning and intuitive linear algebra without heavy proofs..."
            className="w-full pl-4 pr-28 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 placeholder:text-slate-400 font-medium"
            required
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 px-5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Recommend</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Disentangled Prerequisite Input (Novelty Angle: Dual-Space Intent Decomposition) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-indigo-600" />
            Learner's Current Knowledge & Prerequisites (Intent Disentanglement)
          </label>
          <input
            type="text"
            value={knownPrereqs}
            onChange={(e) => setKnownPrereqs(e.target.value)}
            placeholder="e.g., High school algebra, Python basics (Prevents confusing prerequisites with learning goals)"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            Target Knowledge Tier (Cognitive Level Anchor)
          </label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value as DifficultyLevel | '')}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="">Any Difficulty Level (Unconstrained)</option>
            <option value="Introductory">Introductory (Undergrad Year 1 / Beginner)</option>
            <option value="Intermediate">Intermediate (Undergrad Year 2-3 / Applied)</option>
            <option value="Advanced">Advanced (Senior Undergrad / Master's)</option>
            <option value="Research">Research (Doctoral / Monograph / Specialist)</option>
          </select>
        </div>
      </div>

      {/* Proposed Novelty & Algorithm Toggles */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Algorithm Parameters' : 'Novelty & Ranking Controls'}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAsymmetricPenalty}
                onChange={(e) => setEnableAsymmetricPenalty(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Asymmetric Level Penalty</span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Severely penalizes over-difficult resources for beginners.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableIntentSeparation}
                onChange={(e) => setEnableIntentSeparation(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Intent / Prerequisite Separation</span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Separates target competency from prior knowledge space.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableDiscoveryBonus}
                onChange={(e) => setEnableDiscoveryBonus(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Long-Tail Discovery Bonus</span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Boosts high-quality under-circulated texts (Anti-popularity bias).
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </form>
  );
};
