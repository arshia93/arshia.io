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
        level: (Math.min(4, Math.max(0, contrib?.level ?? 0))) as 0 | 1 | 2 | 3 | 4,
      })
    }
    grid.push(week)
  }
  return grid
}
