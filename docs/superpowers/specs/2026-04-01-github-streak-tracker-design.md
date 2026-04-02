# GitHub Streak Tracker — Design Spec

**Date:** 2026-04-01  
**Status:** Approved

---

## Overview

Add a "Coding" row to the existing **Now** section on arshia.io that displays a GitHub contribution heatmap. The heatmap shows 16 weeks of contribution history with hover tooltips revealing the date and contribution count per cell — matching GitHub's native behavior.

No streak count chip. Heatmap only.

---

## Placement

Inside `components/now.tsx`, as a new row at the bottom of the existing list:

```
Working  → ...
Building → ...
Reading  → ...
Coding   → [heatmap grid]   ← new
```

The row uses the same `row-label / row-content` layout as the other rows.

---

## Data

**GitHub username:** `arshia93` (hardcoded — this is a personal site, no config needed)

**Source:** `https://github-contributions-api.jogruber.de/v4/arshia93`  
- Free, unauthenticated, no API key required  
- Returns daily contribution counts for the past year  
- Fetched **server-side** in a Next.js async Server Component  
- Cached with `next: { revalidate: 3600 }` — refreshes hourly, zero per-visitor cost

**Response shape (relevant fields):**
```json
{
  "contributions": [
    { "date": "2026-03-31", "count": 4, "level": 3 },
    ...
  ]
}
```

The `level` field (0–4) maps directly to heatmap intensity. The `count` is used in the tooltip.

---

## Components

### `components/github-streak.tsx` (new)

Async Server Component. Responsibilities:
1. Fetch contribution data from the API
2. Slice the last 16 weeks (112 days), aligned to Sunday
3. Render the heatmap grid (16 columns × 7 rows)
4. Pass cell metadata (date, count, level) to a thin Client Component for tooltip interactivity

### `components/github-streak-cell.tsx` (new, `"use client"`)

Renders a single cell with `onMouseEnter`, `onMouseMove`, `onMouseLeave` handlers that drive a shared tooltip. Receives `date`, `count`, and `level` as props.

### `components/now.tsx` (modified)

Converts to an async Server Component (it has no client-only code currently). Imports and renders `<GitHubStreak />` as the "Coding" row.

---

## Heatmap Grid

- **Dimensions:** 16 columns (weeks) × 7 rows (days, Sun–Sat)
- **Cell size:** 10×10px, 3px gap, 2px border-radius
- **Colors:** 5 intensity levels using the site's teal primary accent (`oklch(0.75 0.15 175)`):

| Level | Color |
|-------|-------|
| 0 (none) | `oklch(0.22 0.02 260)` — muted bg |
| 1 | `oklch(0.32 0.08 175)` |
| 2 | `oklch(0.48 0.11 175)` |
| 3 | `oklch(0.62 0.13 175)` |
| 4 | `oklch(0.75 0.15 175)` — full accent |

---

## Tooltip

- Appears on `mouseenter`, follows cursor via `mousemove`, hides on `mouseleave`
- Format: **"N contributions on Month Day, Year"** (e.g. "4 contributions on March 31, 2026")
- Zero-contribution days: **"No contributions on Month Day, Year"**
- Styled to match the site: dark background (`oklch(0.20 0.02 260)`), border, rounded, small shadow

A single tooltip element is shared across all cells (rendered once in `GitHubStreak`, positioned via fixed CSS).

---

## Error Handling

If the API fetch fails, `GitHubStreak` returns `null` — the "Coding" row is silently omitted. No error UI, no fallback skeleton. The Now section degrades gracefully.

---

## Files Changed

| File | Action |
|------|--------|
| `components/github-streak.tsx` | Create |
| `components/github-streak-cell.tsx` | Create |
| `components/now.tsx` | Modify — add server async, add Coding row |

No new dependencies required.
