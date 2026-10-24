import React from "react"
import type { SampleGoal } from "@/types"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconSparkles, IconArrowRight, IconCheck } from "@tabler/icons-react"

interface SampleGoalsPickerProps {
  goals: SampleGoal[]
  onSelectGoal: (goal: SampleGoal) => void
  selectedGoalId?: string
}

export const SampleGoalsPicker: React.FC<SampleGoalsPickerProps> = ({
  goals,
  onSelectGoal,
  selectedGoalId,
}) => {
  if (!goals || goals.length === 0) return null

  return (
    <div className="mb-6 space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Prepared Learner Presets
          </span>
          <p className="text-xs text-muted-foreground/80 font-medium">
            1-click realistic cold-start scenarios across faculties
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-xs font-medium text-muted-foreground border-border/80">
          <IconSparkles className="size-3 text-amber-500" />
          <span>Cold-Start Presets</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {goals.map((goal, idx) => {
          const isSelected = selectedGoalId === goal.id
          return (
            <Card
              key={goal.id}
              onClick={() => onSelectGoal(goal)}
              className={`cursor-pointer transition-all duration-150 rounded-xl hover:border-primary/50 hover:shadow-xs ${
                isSelected
                  ? "border-primary bg-primary/[0.03] ring-1 ring-primary/30 shadow-xs"
                  : "border-border/80 bg-card hover:bg-muted/20"
              }`}
            >
              <CardHeader className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-primary">
                    Preset {idx + 1} • {goal.subject_filter}
                  </span>
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {goal.target_level}
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-sm font-bold text-foreground leading-snug line-clamp-1">
                    {goal.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                    {goal.description}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-semibold">
                  <span className={isSelected ? "text-primary font-bold flex items-center gap-1" : "text-muted-foreground group-hover:text-primary"}>
                    {isSelected ? (
                      <>
                        <IconCheck className="size-3.5" />
                        <span>Active Preset</span>
                      </>
                    ) : (
                      "Apply Preset"
                    )}
                  </span>
                  <IconArrowRight className={`size-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"}`} />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
