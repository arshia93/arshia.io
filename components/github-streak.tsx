import { fetchContributions, buildHeatmapGrid } from "@/lib/github-contributions"
import { GitHubStreakGrid } from "@/components/github-streak-grid"

export async function GitHubStreak() {
  const contributions = await fetchContributions()
  if (!contributions) return null

  const grid = buildHeatmapGrid(contributions)
  return <GitHubStreakGrid grid={grid} />
}
