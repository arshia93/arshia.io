import type { ReactNode } from "react"
import { fetchContributions, buildHeatmapGrid } from "@/lib/github-contributions"
import { GitHubStreakGrid } from "@/components/github-streak-grid"

/**
 * Renders nothing if the contributions API is unreachable. `frame` wraps the
 * grid (e.g. in its labelled row) so the label disappears along with it.
 */
export async function GitHubStreak({ frame = (grid) => grid }: { frame?: (grid: ReactNode) => ReactNode }) {
  const contributions = await fetchContributions()
  if (!contributions) return null

  const grid = buildHeatmapGrid(contributions)
  return frame(<GitHubStreakGrid grid={grid} />)
}
