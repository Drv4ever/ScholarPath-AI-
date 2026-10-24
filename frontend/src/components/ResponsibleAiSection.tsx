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
} from "@tabler/icons-react"

export const ResponsibleAiSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Title Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <IconWorld className="size-5" />
            </div>
            <CardTitle className="text-lg font-bold">
              Responsible AI & United Nations Sustainable Development Goals (SDGs)
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Algorithmic fairness, privacy by design, and alignment with UN SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities).
          </CardDescription>
        </CardHeader>
      </Card>

      {/* UN SDG Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-red-600 text-white font-black text-sm">
                4
              </div>
              <div>
                <CardTitle className="text-sm font-bold">SDG 4: Quality Education</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ensure inclusive and equitable quality education for all learners.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed">
            ScholarPath AI levels the academic playing field by eliminating the cold-start borrowing barrier.
            Whether a student is a first-generation freshman or transitioning into an unfamiliar elective,
            the system delivers pedagogically sequenced, prerequisite-aware learning resources without requiring prior catalogue fluency.
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-pink-600 text-white font-black text-sm">
                10
              </div>
              <div>
                <CardTitle className="text-sm font-bold">SDG 10: Reduced Inequalities</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Reduce inequality within academic institutions and student populations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed">
            Traditional collaborative filtering creates popularity monopolies—only heavily borrowed textbooks get recommended,
            leaving high-quality niche monographs and open-access resources buried. Our quality-controlled discovery bonus deliberately
            surfaces under-circulated scholarly materials, ensuring equitable catalogue exposure.
          </CardContent>
        </Card>
      </div>

      {/* Responsible AI Framework Checklist */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <IconShield className="size-4 text-primary" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              Responsible AI Architecture Checklist
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <IconEye className="size-4 text-primary" />
              <span>Privacy by Design & Zero Persistent Tracking</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Recommendation decisions are computed strictly from the active session's query and metadata.
              No student profiles, borrowing history logs, or tracking cookies are created or stored on disk.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <IconHeartHandshake className="size-4 text-emerald-600" />
              <span>Human Agency & Oversight (XAI)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Students retain total oversight through contrastive explanations ("Why A over B?"), explicit score breakdowns,
              and real-time feedback buttons that steer rankings without black-box opaqueness.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <IconBookmark className="size-4 text-purple-600" />
              <span>Cognitive Safety & Scaffolding</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              The asymmetric difficulty penalty protects introductory students from cognitive discouragement
              by penalizing advanced texts, while still allowing manual override if the student desires advanced research.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <IconSparkles className="size-4 text-amber-500" />
              <span>Anti-Popularity Fairness & Accessibility</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Incorporates Open-Access digital textbooks alongside library shelf resources to ensure zero-cost accessibility
              for economically constrained learners.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Implemented Safeguards vs Future University Integrations */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
            Current Prototype Safeguards vs. Campus Production Roadmap
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Transparent boundary between validated hackathon capabilities and institutional deployment prerequisites.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider text-[10px]">
              Validated & Implemented in Prototype
            </span>
            <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
              <li>Stateless cold-start retrieval requiring zero student borrowing records</li>
              <li>Asymmetric cognitive distance penalty protecting beginners from overload</li>
              <li>Intent vs. prerequisite separation isolating goals from current knowledge</li>
              <li>Session-scoped Rocchio vector steering with immediate reset</li>
              <li>White-box contrastive explainability derived directly from ranking scores</li>
            </ul>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
            <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">
              Campus Enterprise Integration Roadmap
            </span>
            <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
              <li>SAML 2.0 / Shibboleth SSO integration with granular student privacy consent</li>
              <li>ILS / Alma / Koha SIP2/NCIP connector for real-time physical stack availability</li>
              <li>LMS (Canvas/Blackboard) syllabus ingestion for automated course reserves</li>
              <li>Institutional bias audits across under-represented interdisciplinary collections</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Academic Integrity Notice */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
        <span className="font-bold text-foreground block mb-0.5">Academic Integrity & Scope Disclosure:</span>
        The algorithmic techniques demonstrated in ScholarPath AI (asymmetric cognitive penalization, intent/prerequisite separation,
        session-based Rocchio vector steering, and contrastive feature explanation) are presented as proposed engineering design contributions
        and functional prototypes for university library systems.
      </div>
    </div>
  )
}
