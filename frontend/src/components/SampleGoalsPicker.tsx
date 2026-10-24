import React from "react"
import type { SampleGoal } from "@/types"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconCompass, IconSparkles, IconArrowRight } from "@tabler/icons-react"

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
    <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconCompass className="size-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Prepared Learner Goals (Cold-Start Benchmark Presets)
          </h3>
        </div>
        <Badge variant="outline" className="gap-1 text-[11px] font-semibold text-primary">
          <IconSparkles className="size-3 text-amber-500" />
          1-Click Preset
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {goals.map((goal, idx) => {
          const isSelected = selectedGoalId === goal.id
          return (
            <Card
              key={goal.id}
              onClick={() => onSelectGoal(goal)}
              className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-xs"
                  : "border-border/80"
              }`}
            >
              <CardHeader className="p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Goal {idx + 1}: {goal.subject_filter}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {goal.target_level}
                  </Badge>
                </div>
                <CardTitle className="text-xs font-bold text-foreground line-clamp-1">
                  {goal.title}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {goal.description}
                </CardDescription>
                <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-primary">
                  <span>Load Preset</span>
                  <IconArrowRight className="size-3.5" />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
