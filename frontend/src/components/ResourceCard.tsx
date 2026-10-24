import React from 'react';
import {
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Sparkles,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Tag,
  Star
} from 'lucide-react';
import { ScoredResource } from '../types';

interface ResourceCardProps {
  item: ScoredResource;
  onFeedback: (resourceId: string, type: 'relevant' | 'irrelevant') => void;
  onOpenContrastive: (targetItem: ScoredResource) => void;
}

const levelBadgeColor: Record<string, string> = {
  Introductory: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-sky-50 text-sky-700 border-sky-200',
  Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  Research: 'bg-rose-50 text-rose-700 border-rose-200'
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  item,
  onFeedback,
  onOpenContrastive
}) => {
  const { resource, explanation, final_score, rank, session_feedback } = item;

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 mb-4 relative overflow-hidden">
      {/* Top Banner & Rank */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand-600 text-white font-black text-xs shadow-sm">
            #{rank}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${levelBadgeColor[resource.level] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {resource.level}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {resource.subject}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-50 text-slate-500 border border-slate-200">
            {resource.resource_type}
          </span>
        </div>

        {/* Score & Rating */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{resource.quality_rating.toFixed(1)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Composite Score</span>
            <span className="text-xs font-black text-slate-800">{final_score.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Resource Title & Authors */}
      <div className="mb-2">
        <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {resource.title}
        </h4>
        <p className="text-xs text-slate-600 font-medium mt-0.5">
          {resource.authors.join(', ')} {resource.publication_year ? `(${resource.publication_year})` : ''}
        </p>
      </div>

      {/* Abstract */}
      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
        {resource.abstract}
      </p>

      {/* Prerequisite & Catalogue Metadata */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Prerequisites
          </span>
          <span className="text-slate-800 font-medium text-xs">
            {resource.prerequisites.length > 0 ? resource.prerequisites.join(', ') : 'None (Self-contained)'}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Library Call Number
          </span>
          <span className="text-slate-800 font-mono text-xs font-semibold">
            {resource.call_number || 'Digital Resource'}
          </span>
        </div>
      </div>

      {/* Explicit Explainability Box (XAI) */}
      <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-3.5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Why was this recommended? (Metadata & XAI)
          </span>
          <span className="text-xs font-bold text-brand-700 bg-white px-2 py-0.5 rounded-full border border-brand-200">
            {explanation.semantic_match_pct}% Semantic Fit
          </span>
        </div>

        {/* Narrative Summary Sentence */}
        <p className="text-xs text-brand-950 font-semibold mb-2 leading-relaxed">
          {explanation.summary_sentence}
        </p>

        {/* Component-Wise Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-brand-100">
          <div className="flex items-start gap-1.5 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{explanation.level_explanation}</span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-700">
            <Layers className="w-3.5 h-3.5 text-brand-600 mt-0.5 flex-shrink-0" />
            <span>{explanation.prerequisite_satisfaction}</span>
          </div>
        </div>

        {/* Matched Keywords */}
        {explanation.matched_keywords && explanation.matched_keywords.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-brand-100 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> Matched Keywords:
            </span>
            {explanation.matched_keywords.map((kw) => (
              <span
                key={kw}
                className="bg-white text-slate-800 font-semibold px-2 py-0.5 rounded-md border border-brand-200 text-[11px]"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Discovery or Long-tail notice */}
        {explanation.discovery_bonus_applied > 0 && (
          <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
            🌟 Long-Tail Discovery Bonus (+{explanation.discovery_bonus_applied}): Promotes high-quality under-circulated scholarship.
          </div>
        )}
      </div>

      {/* Card Footer: Active Feedback & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* In-Session Relevance Steering */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Session Feedback:</span>
          <button
            onClick={() => onFeedback(resource.id, 'relevant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              session_feedback === 'relevant'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Relevant</span>
          </button>

          <button
            onClick={() => onFeedback(resource.id, 'irrelevant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              session_feedback === 'irrelevant'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-rose-300'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Irrelevant</span>
          </button>
        </div>

        {/* Action Links */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenContrastive(item)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all flex items-center gap-1.5"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare vs Alternative</span>
          </button>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1.5"
            >
              <span>Library / DOI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
