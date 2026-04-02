# GitHub Streak Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Coding" row to the Now section displaying a 16-week GitHub contribution heatmap with styled hover tooltips showing date and contribution count.

**Architecture:** A pure data utility (`lib/github-contributions.ts`) handles fetching and grid construction. An async Server Component (`components/github-streak.tsx`) calls it and passes the result to a Client Component (`components/github-streak-grid.tsx`) that owns tooltip state. `now.tsx` imports the Server Component and renders it as a new "Coding" row.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, Tailwind v4, TypeScript, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/github-contributions.ts` | Create | API fetch + `buildHeatmapGrid` pure util |
| `components/github-streak-grid.tsx` | Create | Client component — renders grid, owns tooltip state |
| `components/github-streak.tsx` | Create | Async Server Component — fetches data, renders grid |
| `components/now.tsx` | Modify | Add "Coding" row with `<GitHubStreak />` |
| `vitest.config.ts` | Create | Vitest config for unit tests |
| `lib/github-contributions.test.ts` | Create | Tests for `buildHeatmapGrid` |

---

## Task 1: Set Up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

Expected: vitest added to `devDependencies` in `package.json`.

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
  },
})
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verify vitest works**

```bash
npm test
```

Expected output: `No test files found` (or similar — no errors).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

## Task 2: Create `lib/github-contributions.ts` (TDD)

**Files:**
- Create: `lib/github-contributions.ts`
- Create: `lib/github-contributions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/github-contributions.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { buildHeatmapGrid } from "./github-contributions"

describe("buildHeatmapGrid", () => {
  it("returns a 16×7 grid", () => {
    const grid = buildHeatmapGrid([], new Date("2026-04-01"))
    expect(grid).toHaveLength(16)
    grid.forEach((week) => expect(week).toHaveLength(7))
  })

  it("first cell is a Sunday", () => {
    const grid = buildHeatmapGrid([], new Date("2026-04-01"))
    // 2026-04-01 is a Wednesday (getDay() === 3)
    // Current week Sunday = 2026-03-29
    // 15 weeks back from that Sunday = 2025-12-21
    const firstDate = new Date(grid[0][0].date + "T00:00:00")
    expect(firstDate.getDay()).toBe(0) // Sunday
  })

  it("last cell is today or earlier", () => {
    const today = new Date("2026-04-01")
    const grid = buildHeatmapGrid([], today)
    const lastCell = grid[15][today.getDay()] // today's day of week in last week
    expect(lastCell.date).toBe("2026-04-01")
  })

  it("maps contribution data to correct cell", () => {
    const contributions = [{ date: "2026-04-01", count: 5, level: 3 }]
    const today = new Date("2026-04-01")
    const grid = buildHeatmapGrid(contributions, today)
    // 2026-04-01 is Wednesday (day 3) in the last week (week 15)
    const cell = grid[15][3]
    expect(cell.date).toBe("2026-04-01")
    expect(cell.count).toBe(5)
    expect(cell.level).toBe(3)
  })

  it("fills missing dates with count 0 and level 0", () => {
    const grid = buildHeatmapGrid([], new Date("2026-04-01"))
    const cell = grid[0][0]
    expect(cell.count).toBe(0)
    expect(cell.level).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 5 failing tests with "Cannot find module './github-contributions'".

- [ ] **Step 3: Implement `lib/github-contributions.ts`**

Create `lib/github-contributions.ts`:

```typescript
export type ContributionCell = {
  date: string // "YYYY-MM-DD"
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

type ApiContribution = {
  date: string
  count: number
  level: number
}

export async function fetchContributions(): Promise<ApiContribution[] | null> {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/arshia93",
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.contributions ?? null
  } catch {
    return null
  }
}

export function buildHeatmapGrid(
  contributions: ApiContribution[],
  today: Date = new Date()
): ContributionCell[][] {
  const map = new Map(contributions.map((c) => [c.date, c]))

  const todayCopy = new Date(today)
  todayCopy.setHours(0, 0, 0, 0)

  // Start of today's week (Sunday)
  const weekStart = new Date(todayCopy)
  weekStart.setDate(todayCopy.getDate() - todayCopy.getDay())

  // Go back 15 more weeks to get 16 total
  const start = new Date(weekStart)
  start.setDate(weekStart.getDate() - 15 * 7)

  const grid: ContributionCell[][] = []
  for (let w = 0; w < 16; w++) {
    const week: ContributionCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      const dateStr = date.toISOString().split("T")[0]
      const contrib = map.get(dateStr)
      week.push({
        date: dateStr,
        count: contrib?.count ?? 0,
        level: (contrib?.level ?? 0) as 0 | 1 | 2 | 3 | 4,
      })
    }
    grid.push(week)
  }
  return grid
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 5 passing tests.

- [ ] **Step 5: Commit**

```bash
git add lib/github-contributions.ts lib/github-contributions.test.ts
git commit -m "feat: add github contributions data utility"
```

---

## Task 3: Create `components/github-streak-grid.tsx`

**Files:**
- Create: `components/github-streak-grid.tsx`

- [ ] **Step 1: Create the client component**

Create `components/github-streak-grid.tsx`:

```typescript
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
    <div onMouseMove={handleMouseMove}>
      <div className="flex gap-[3px]">
        {grid.map((week, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {week.map((cell, d) => (
              <div
                key={d}
                className="w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: LEVEL_COLORS[cell.level] }}
                onMouseEnter={(e) => handleMouseEnter(cell, e)}
                onMouseLeave={handleMouseLeave}
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/github-streak-grid.tsx
git commit -m "feat: add GitHubStreakGrid client component with tooltip"
```

---

## Task 4: Create `components/github-streak.tsx`

**Files:**
- Create: `components/github-streak.tsx`

- [ ] **Step 1: Create the server component**

Create `components/github-streak.tsx`:

```typescript
import { fetchContributions, buildHeatmapGrid } from "@/lib/github-contributions"
import { GitHubStreakGrid } from "@/components/github-streak-grid"

export async function GitHubStreak() {
  const contributions = await fetchContributions()
  if (!contributions) return null

  const grid = buildHeatmapGrid(contributions)
  return <GitHubStreakGrid grid={grid} />
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/github-streak.tsx
git commit -m "feat: add GitHubStreak server component"
```

---

## Task 5: Add Coding Row to `now.tsx`

**Files:**
- Modify: `components/now.tsx`

- [ ] **Step 1: Update `now.tsx`**

Replace the contents of `components/now.tsx` with:

```typescript
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GitHubStreak } from "@/components/github-streak";

export function Now() {
  return (
    <section id="now" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">
        Now
      </h2>

      <div className="space-y-6 text-foreground">
        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">
            Working
          </span>
          <p>
            Product at Adly, driving 0-to-1 ventures across a PE portfolio. Leading product strategy from $16.8M to $40.8M
            ARR.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">
            Building
          </span>
          <p>
            InReach, an AI tool for founders and growth teams to find and engage
            people looking for their product.{" "}
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Reading</span>
          <p>
            <em>Think Like a Rocket Scientist</em> by Ozan Varol · <em>Click</em> by Jake
            Knapp
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Coding</span>
          <div className="mt-1">
            <Suspense>
              <GitHubStreak />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Run the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`. Check:
- "Coding" row appears at the bottom of the Now section
- 16-week heatmap grid is visible in teal tones
- Hovering a cell shows a tooltip: "N contributions on Month Day, Year" or "No contributions on Month Day, Year"
- No console errors

- [ ] **Step 4: Commit**

```bash
git add components/now.tsx
git commit -m "feat: add GitHub contribution heatmap to Now section"
```
