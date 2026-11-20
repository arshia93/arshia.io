"use client"

import { useState, useCallback } from "react"
import { createPortal } from "react-dom"
import type { ContributionCell } from "@/lib/github-contributions"
import { inkDelay } from "@/lib/ink"

const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "var(--streak-0)",
  1: "var(--streak-1)",
  2: "var(--streak-2)",
  3: "var(--streak-3)",
  4: "var(--streak-4)",
}

// When its page turns into view the grid ripples in, one week (column) at a time.
const RIPPLE_START_MS = 820
const RIPPLE_WEEK_MS = 32
const RIPPLE_DAY_MS = 14

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
    <figure className="streak">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label="GitHub contributions over the last 16 weeks"
        className="streak-grid"
      >
        {grid.map((week, w) => (
          <div key={w} className="streak-week">
            {week.map((cell, d) => (
              <div
                key={d}
                className="streak-cell ink ink-pop"
                style={inkDelay(RIPPLE_START_MS + w * RIPPLE_WEEK_MS + d * RIPPLE_DAY_MS, {
                  background: cell.isFuture ? "transparent" : LEVEL_COLORS[cell.level],
                  cursor: cell.isFuture ? "default" : "pointer",
                })}
                onMouseEnter={cell.isFuture ? undefined : (e) => handleMouseEnter(cell, e)}
                onTouchStart={cell.isFuture ? undefined : (e) => handleTouchStart(cell, e)}
              />
            ))}
          </div>
        ))}
      </div>
      <figcaption className="streak-caption ink ink-fade" style={inkDelay(1500)}>
        Sixteen weeks on GitHub
      </figcaption>
      {/* The grid sits inside a 3D-transformed page, which would trap `position: fixed`,
          so the tooltip is portaled out to the document body. */}
      {tooltip &&
        createPortal(
          <>
            {tooltip.centered && <div className="fixed inset-0 z-40" onClick={() => setTooltip(null)} />}
            <div
              className="streak-tooltip"
              style={
                tooltip.centered
                  ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
                  : { left: tooltip.x + 12, top: tooltip.y - 28 }
              }
            >
              {tooltip.text}
            </div>
          </>,
          document.body
        )}
    </figure>
  )
}
