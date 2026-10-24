import React from 'react';
import { Globe, Shield, HeartHandshake, BookCheck, Eye, Sparkles } from 'lucide-react';

export const ResponsibleAiSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Globe className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Responsible AI & Sustainable Development Goals (SDGs)
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl">
          Addressing algorithmic fairness, student privacy by design, and alignment with the United Nations Sustainable Development Goals.
        </p>
      </div>

      {/* UN SDG Alignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              4
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">SDG 4: Quality Education</h3>
              <p className="text-xs text-slate-500">Ensure inclusive and equitable quality education for all</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed space-y-2">
            ScholarPath AI levels the academic playing field by eliminating the borrowing cold-start barrier.
            Whether a student is a first-generation freshman or transitioning into an unfamiliar elective,
            the system delivers pedagogically sequenced, prerequisite-aware learning resources without requiring prior catalogue fluency.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-pink-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              10
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">SDG 10: Reduced Inequalities</h3>
              <p className="text-xs text-slate-500">Reduce inequality within and among institutions</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed space-y-2">
            Traditional collaborative filtering creates popularity monopolies—only heavily borrowed textbooks get recommended,
            leaving high-quality niche monographs and open-access resources buried. Our quality-controlled discovery bonus deliberately
            surfaces under-circulated scholarly materials, ensuring equitable catalogue exposure.
          </p>
        </div>
      </div>

      {/* Responsible AI Framework Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          Responsible AI Architecture Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Eye className="w-4 h-4 text-brand-600" />
              <span>Privacy by Design & Zero Persistent Tracking</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Recommendation decisions are computed strictly from the active session's query and metadata.
              No student profiles, borrowing history logs, or tracking cookies are created or stored on disk.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Human Agency & Oversight (XAI)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Students retain total oversight through contrastive explanations ("Why A over B?"), explicit score breakdowns,
              and real-time feedback buttons that steer rankings without black-box opaqueness.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <BookCheck className="w-4 h-4 text-purple-600" />
              <span>Cognitive Safety & Scaffolding</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              The asymmetric difficulty penalty protects introductory students from cognitive discouragement
              by penalizing advanced texts, while still allowing manual override if the student desires advanced research.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Anti-Popularity Fairness & Accessibility</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Incorporates Open-Access digital textbooks alongside library shelf resources to ensure zero-cost accessibility
              for economically constrained learners.
            </p>
          </div>
        </div>
      </div>

      {/* Research Disclosure Notice */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed">
        <span className="font-bold text-slate-700 block mb-1">Academic Integrity & Scope Statement:</span>
        The algorithmic innovations demonstrated in ScholarPath AI (asymmetric cognitive penalization, intent/prerequisite separation,
        session-based Rocchio vector steering, and contrastive feature explanation) are presented as proposed engineering design contributions
        and functional prototypes for university library systems.
      </div>
    </div>
  );
};
