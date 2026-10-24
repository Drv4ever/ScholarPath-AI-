import React from 'react';
import { Filter, RotateCcw, ThumbsUp, ThumbsDown, Sparkles, BookMarked } from 'lucide-react';
import { DifficultyLevel, ResourceType } from '../types';

interface FilterSidebarProps {
  subjects: string[];
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  selectedLevel: DifficultyLevel | '';
  setSelectedLevel: (l: DifficultyLevel | '') => void;
  selectedType: ResourceType | '';
  setSelectedType: (t: ResourceType | '') => void;
  sessionFeedbackCount: number;
  onResetFeedback: () => void;
  totalCatalogueSize: number;
  matchedCount: number;
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
  matchedCount
}) => {
  const hasActiveFilters = Boolean(selectedSubject || selectedLevel || selectedType);

  const clearAllFilters = () => {
    setSelectedSubject('');
    setSelectedLevel('');
    setSelectedType('');
  };

  return (
    <aside className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Catalogue Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Catalogue Match Stats */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex justify-between items-center text-slate-600 mb-1">
          <span>Active Catalogue:</span>
          <span className="font-bold text-slate-900">{totalCatalogueSize} Items</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Ranked Candidates:</span>
          <span className="font-bold text-brand-700">{matchedCount} Matches</span>
        </div>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Academic Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
        >
          <option value="">All Subjects (Cross-Disciplinary)</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Academic Level Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Difficulty Level Filter
        </label>
        <div className="space-y-1.5">
          {(['', 'Introductory', 'Intermediate', 'Advanced', 'Research'] as const).map((lvl) => {
            const isChecked = selectedLevel === lvl;
            return (
              <label
                key={lvl || 'all'}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border ${
                  isChecked
                    ? 'bg-brand-50 border-brand-300 text-brand-800 font-bold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium'
                }`}
              >
                <span>{lvl || 'All Difficulty Levels'}</span>
                <input
                  type="radio"
                  name="difficulty"
                  checked={isChecked}
                  onChange={() => setSelectedLevel(lvl as DifficultyLevel | '')}
                  className="text-brand-600 focus:ring-brand-500"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Format / Resource Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Material Format
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ResourceType | '')}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
        >
          <option value="">All Formats</option>
          <option value="Textbook">Textbook</option>
          <option value="Monograph">Monograph</option>
          <option value="Survey Paper">Survey Paper</option>
          <option value="Lecture Notes">Lecture Notes</option>
          <option value="Open-Access Resource">Open-Access Resource</option>
        </select>
      </div>

      {/* In-Session Active Learning State */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Session Feedback Loop
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-brand-100 text-brand-800">
            {sessionFeedbackCount} Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          Thumbs up (👍) or down (👎) steer the session vector in real time. Zero data is persisted to disks or user accounts.
        </p>
        {sessionFeedbackCount > 0 && (
          <button
            onClick={onResetFeedback}
            className="w-full py-1.5 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Session Steering
          </button>
        )}
      </div>
    </aside>
  );
};
