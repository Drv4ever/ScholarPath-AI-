import React from "react"
import {
  IconBook,
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
  catalogueSize = 113,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => setActiveTab("search")}
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <IconBook className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground">
                ScholarPath AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Explainable Cold-Start Library Recommender
            </p>
          </div>
        </div>

        {/* Unified Cold-Start & Privacy Status Pill */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs text-muted-foreground border border-border/80 bg-muted/20 px-3 py-1 rounded-full">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            Cold-Start (Zero User Logs)
          </span>
          <span className="text-border select-none">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-amber-500 inline-block" />
            In-Session Feedback Steering
          </span>
          <span className="text-border select-none">•</span>
          <span className="font-semibold text-foreground">
            {catalogueSize} Resources
          </span>
        </div>

        {/* Primary View Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-lg bg-muted/60 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === "search"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            <IconBook className="size-3.5" />
            <span>Discovery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluation")}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === "evaluation"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            <IconChartBar className="size-3.5" />
            <span>IR Evaluation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("responsible_ai")}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === "responsible_ai"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            <IconWorld className="size-3.5" />
            <span className="hidden sm:inline">SDGs & Novelty</span>
            <span className="sm:hidden">SDGs</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
