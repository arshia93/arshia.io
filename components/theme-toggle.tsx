"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

const CYCLE = ["system", "light", "dark"] as const

const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

const LABELS = {
  system: "following system",
  light: "light",
  dark: "dark",
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // `theme` is "system" | "light" | "dark"; anything unexpected falls back to system.
  const current = CYCLE.includes(theme as (typeof CYCLE)[number]) ? (theme as (typeof CYCLE)[number]) : "system"
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]
  const Icon = ICONS[current]

  return (
    <button
      type="button"
      aria-label={mounted ? `Theme: ${LABELS[current]}. Switch to ${LABELS[next]}.` : "Toggle theme"}
      onClick={() => setTheme(next)}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* The active state lives in localStorage, which the server can't read, so the icon
          only renders after mount. The button keeps its size either way. */}
      {mounted && <Icon className="w-4 h-4" />}
    </button>
  )
}
