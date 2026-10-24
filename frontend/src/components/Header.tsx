import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconBook,
  IconShieldCheck,
  IconBolt,
  IconChartBar,
  IconWorld,
} from "@tabler/icons-react"

interface HeaderProps {
  activeTab: "search" | "evaluation" | "responsible_ai"
  setActiveTab: (tab: "search" | "evaluation" | "responsible_ai") => void
  retrievalMode?: string
  catalogueSize?: number
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  catalogueSize = 20,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => setActiveTab("search")}
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <IconBook className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                ScholarPath AI
              </span>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                VIT Hackathon
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Explainable Cold-Start Library Recommender
            </p>
          </div>
        </div>

        {/* Cold-Start System Status Indicators */}
        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="outline" className="gap-1 text-xs font-medium">
            <IconShieldCheck className="size-3.5 text-emerald-600" />
            Cold-Start (Zero User Logs)
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs font-medium">
            <IconBolt className="size-3.5 text-amber-500" />
            In-Session Vector Steering
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium">
            {catalogueSize} Resources
          </Badge>
        </div>

        {/* Primary View Navigation Buttons */}
        <nav className="flex items-center gap-1.5">
          <Button
            variant={activeTab === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("search")}
            className="gap-1.5"
          >
            <IconBook className="size-4" />
            <span>Discovery</span>
          </Button>

          <Button
            variant={activeTab === "evaluation" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("evaluation")}
            className="gap-1.5"
          >
            <IconChartBar className="size-4" />
            <span>IR Evaluation</span>
          </Button>

          <Button
            variant={activeTab === "responsible_ai" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("responsible_ai")}
            className="gap-1.5"
          >
            <IconWorld className="size-4" />
            <span>SDGs & Novelty</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
