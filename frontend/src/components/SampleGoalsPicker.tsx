import React from 'react';
import { SampleGoal } from '../types';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

interface SampleGoalsPickerProps {
  goals: SampleGoal[];
  onSelectGoal: (goal: SampleGoal) => void;
  selectedGoalId?: string;
}

export const SampleGoalsPicker: React.FC<SampleGoalsPickerProps> = ({
  goals,
  onSelectGoal,
  selectedGoalId
}) => {
  if (!goals || goals.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-brand-50 p-4 sm:p-5 rounded-2xl border border-sky-100 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Required Benchmark Learner Goals (Cold-Start Presets)
          </h3>
        </div>
        <span className="text-xs text-brand-700 bg-white/80 px-2.5 py-1 rounded-full font-medium border border-sky-200 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Load
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {goals.map((goal, idx) => {
          const isSelected = selectedGoalId === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => onSelectGoal(goal)}
              className={`text-left p-3.5 rounded-xl transition-all border ${
                isSelected
                  ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/20'
                  : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-brand-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                  Goal {idx + 1}: {goal.subject_filter}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {goal.target_level}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mb-1 line-clamp-1">{goal.title}</p>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                {goal.description}
              </p>
              <div className="flex items-center justify-between text-[11px] text-brand-600 font-semibold pt-1 border-t border-slate-100">
                <span>Load Goal & Parameters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
