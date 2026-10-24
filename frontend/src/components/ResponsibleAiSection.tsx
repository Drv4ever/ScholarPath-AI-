import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  IconWorld,
  IconShield,
  IconHeartHandshake,
  IconEye,
  IconSparkles,
  IconBookmark,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react"

export const ResponsibleAiSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Title Card */}
      <Card className="border-border shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 sm:p-6 bg-card">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <IconWorld className="size-5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              Responsible AI & United Nations Sustainable Development Goals (SDGs)
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground font-medium">
            Algorithmic fairness, privacy by design, and alignment with UN SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities).
          </CardDescription>
        </CardHeader>
      </Card>

      {/* UN SDG Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-red-600 text-white font-black text-sm shrink-0">
                4
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">SDG 4: Quality Education</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ensure inclusive and equitable quality education for all learners.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              ScholarPath AI eliminates the cold-start borrowing barrier in academic libraries. First-generation students and cross-disciplinary researchers receive pedagogically sequenced, prerequisite-aware recommendations without requiring prior catalogue fluency or borrowing logs.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-pink-600 text-white font-black text-sm shrink-0">
                10
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">SDG 10: Reduced Inequalities</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Reduce inequality within academic institutions and student populations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Traditional collaborative filtering reinforces popularity monopolies where only historical bestsellers are surfaced. Our quality-controlled discovery bonus actively counters this Matthew Effect by elevating high-quality, under-circulated scholarly monographs and open-access resources.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Responsible AI Framework Checklist */}
      <Card className="border-border shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2">
            <IconShield className="size-4 text-primary" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              Responsible AI Architectural Principles
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <IconEye className="size-4 text-primary shrink-0" />
              <span>Privacy by Design & Zero Persistent Tracking</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              All recommendation and feedback calculations operate strictly in volatile session memory. No student profiles, borrowing history logs, or tracking cookies are created or written to persistent storage.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <IconHeartHandshake className="size-4 text-emerald-600 shrink-0" />
              <span>Human Agency & Explainable AI (XAI)</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Students retain full oversight through counterfactual explanations ("Why Resource A over B?"), explicit score breakdowns, and reversible in-session feedback controls that steer rankings without opacity.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <IconBookmark className="size-4 text-purple-600 shrink-0" />
              <span>Cognitive Safety & Pedagogical Scaffolding</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The asymmetric difficulty penalty protects introductory students from cognitive discouragement by penalizing advanced monographs, while allowing senior scholars to access research-tier materials unhindered.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <IconSparkles className="size-4 text-amber-500 shrink-0" />
              <span>Anti-Popularity Diversity & Accessibility</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Open-access digital textbooks are integrated directly alongside university subscription materials, ensuring free, unhindered accessibility for economically constrained learners across all faculties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Implemented Safeguards vs Future University Integrations */}
      <Card className="border-border shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
            Current Prototype Safeguards vs. Campus Production Roadmap
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-medium">
            Transparent distinction between validated prototype capabilities and institutional enterprise prerequisites.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider text-xs">
              Validated in Hackathon Prototype
            </span>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <IconCheck className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Stateless cold-start retrieval requiring zero user borrowing records</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconCheck className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Asymmetric cognitive distance penalty protecting beginners from overload</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconCheck className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Intent vs. prerequisite separation isolating goals from current knowledge</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconCheck className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>In-session Rocchio vector feedback steering with immediate state reset</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconCheck className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>White-box contrastive explainability derived directly from ranking scores</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-2">
            <span className="font-bold text-primary block uppercase tracking-wider text-xs">
              Campus Production Integration Roadmap
            </span>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <IconArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>SAML 2.0 / Shibboleth Single Sign-On (SSO) with granular student privacy consent</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>ILS / Alma / Koha SIP2/NCIP connector for real-time physical stack availability</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>LMS (Canvas/Blackboard) syllabus ingestion for automated course reserves</span>
              </li>
              <li className="flex items-start gap-1.5">
                <IconArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Continuous multi-faculty audit for syllabus representation across minoritized disciplines</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Academic Integrity Notice */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground font-semibold block mb-1">Academic Integrity & Scope Disclosure:</strong>
        The algorithmic techniques demonstrated in ScholarPath AI (asymmetric cognitive penalization, intent/prerequisite separation,
        session-based Rocchio vector steering, and contrastive feature explanation) are presented as proposed engineering design contributions
        and functional prototypes for university library systems.
      </div>
    </div>
  )
}
