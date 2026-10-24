import React from 'react';
import { BookOpen, ShieldCheck, Zap, Award, BarChart3, Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: 'search' | 'evaluation' | 'responsible_ai';
  setActiveTab: (tab: 'search' | 'evaluation' | 'responsible_ai') => void;
  retrievalMode?: string;
  catalogueSize?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  retrievalMode = 'Hybrid Vector + BM25',
  catalogueSize = 20
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('search')}>
            <div className="bg-brand-600 p-2 rounded-xl text-white shadow-md shadow-brand-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">ScholarPath AI</span>
                <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-brand-200">
                  VIT AI Innovate-A-Thon
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Explainable Cold-Start Library Recommender</p>
            </div>
          </div>

          {/* Quick System Indicators */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cold-Start (Zero Borrow History)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-medium">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              In-Session Vector Steering
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              Catalogue: {catalogueSize} Resources
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-brand-50 text-brand-700 border border-brand-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Discovery</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'evaluation'
                  ? 'bg-brand-50 text-brand-700 border border-brand-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>IR Evaluation & Baseline</span>
            </button>

            <button
              onClick={() => setActiveTab('responsible_ai')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'responsible_ai'
                  ? 'bg-brand-50 text-brand-700 border border-brand-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>SDGs & Novelty</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
