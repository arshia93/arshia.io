"use client"

import { useState, useCallback } from "react"
import type { ContributionCell } from "@/lib/github-contributions"

const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "var(--streak-0)",
  1: "var(--streak-1)",
  2: "var(--streak-2)",
  3: "var(--streak-3)",
  4: "var(--streak-4)",
}

type TooltipState = {
  text: string
  centered: boolean
  x: number
  y: number
} | null

export function GitHubStreakGrid({ grid }: { grid: ContributionCell[][] }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const buildTooltipText = useCallback((cell: ContributionCell) => {
    const date = new Date(cell.date + "T00:00:00")
    const dateStr = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    return cell.count > 0
      ? `${cell.count} contribution${cell.count !== 1 ? "s" : ""} on ${dateStr}`
      : `No contributions on ${dateStr}`
  }, [])

  const handleMouseEnter = useCallback(
    (cell: ContributionCell, e: React.MouseEvent) => {
      setTooltip({ text: buildTooltipText(cell), centered: false, x: e.clientX, y: e.clientY })
    },
    [buildTooltipText]
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
  }, [])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  const handleTouchStart = useCallback(
    (cell: ContributionCell, e: React.TouchEvent) => {
      e.preventDefault()
      setTooltip((t) =>
        t?.centered && t.text === buildTooltipText(cell)
          ? null
          : { text: buildTooltipText(cell), centered: true, x: 0, y: 0 }
      )
    },
    [buildTooltipText]
  )

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="GitHub contributions over the last 16 weeks"
    >
      <div className="flex gap-[3px]">
        {grid.map((week, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {week.map((cell, d) => (
              <div
                key={d}
                className="w-[10px] h-[10px] rounded-[2px] transition-opacity"
                style={{
                  background: cell.isFuture ? "transparent" : LEVEL_COLORS[cell.level],
                  cursor: cell.isFuture ? "default" : "pointer",
                }}
                onMouseEnter={cell.isFuture ? undefined : (e) => handleMouseEnter(cell, e)}
                onTouchStart={cell.isFuture ? undefined : (e) => handleTouchStart(cell, e)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <>
          {tooltip.centered && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setTooltip(null)}
            />
          )}
          <div
            className="fixed z-50 px-2.5 py-1.5 text-xs rounded-md border border-border bg-card text-card-foreground shadow-md whitespace-nowrap"
            style={
              tooltip.centered
                ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }
                : { left: tooltip.x + 12, top: tooltip.y - 28, pointerEvents: "none" }
            }
          >
            {tooltip.text}
          </div>
        </>
      )}
    </div>
  )
}
