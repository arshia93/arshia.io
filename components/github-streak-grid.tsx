"use client"

import { useState, useCallback } from "react"
import type { ContributionCell } from "@/lib/github-contributions"

const LEVEL_COLORS: Record<number, string> = {
  0: "oklch(0.22 0.02 260)",
  1: "oklch(0.32 0.08 175)",
  2: "oklch(0.48 0.11 175)",
  3: "oklch(0.62 0.13 175)",
  4: "oklch(0.75 0.15 175)",
}

type TooltipState = {
  text: string
  x: number
  y: number
} | null

export function GitHubStreakGrid({ grid }: { grid: ContributionCell[][] }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const handleMouseEnter = useCallback(
    (cell: ContributionCell, e: React.MouseEvent) => {
      const date = new Date(cell.date + "T00:00:00")
      const dateStr = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      const text =
        cell.count > 0
          ? `${cell.count} contribution${cell.count !== 1 ? "s" : ""} on ${dateStr}`
          : `No contributions on ${dateStr}`
      setTooltip({ text, x: e.clientX, y: e.clientY })
    },
    []
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
  }, [])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="flex gap-[3px]">
        {grid.map((week, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {week.map((cell, d) => (
              <div
                key={d}
                className="w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: LEVEL_COLORS[cell.level] }}
                onMouseEnter={(e) => handleMouseEnter(cell, e)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 text-xs rounded-md border border-border bg-card text-card-foreground shadow-md pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
