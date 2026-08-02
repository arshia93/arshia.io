export type ContributionCell = {
  date: string // "YYYY-MM-DD"
  count: number
  level: 0 | 1 | 2 | 3 | 4
  isFuture: boolean
}

type ApiContribution = {
  date: string
  count: number
  level: number
}

export async function fetchContributions(): Promise<ApiContribution[] | null> {
  try {
    // `y=last` scopes the response to the trailing 365 days. Without it the API
    // returns every year since 2016 and buckets `level` per-year, so the same
    // count lands on a different shade depending on how busy that year was —
    // which is why the grid drifted out of sync with github.com/arshia93.
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/arshia93?y=last",
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
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      const contrib = map.get(dateStr)
      const isFuture = date > todayCopy
      week.push({
        date: dateStr,
        count: contrib?.count ?? 0,
        level: (Math.min(4, Math.max(0, contrib?.level ?? 0))) as 0 | 1 | 2 | 3 | 4,
        isFuture,
      })
    }
    grid.push(week)
  }
  return grid
}
