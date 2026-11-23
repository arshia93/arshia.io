"use client"

import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react"
import { Book, type BookPage } from "./book"
import { NorthBeachFlyIn } from "./north-beach-fly-in"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

type Landing = "checking" | "flight" | "room" | "book"

function canPlayIntro() {
  return !window.location.hash && !window.matchMedia(REDUCED_MOTION).matches
}

function subscribeToEntrancePreferences(callback: () => void) {
  const motion = window.matchMedia(REDUCED_MOTION)
  motion.addEventListener("change", callback)
  window.addEventListener("hashchange", callback)
  return () => {
    motion.removeEventListener("change", callback)
    window.removeEventListener("hashchange", callback)
  }
}

const readServerEntrancePreferences = () => null

export function BookLanding({ pages, header }: { pages: BookPage[]; header: ReactNode }) {
  const eligible = useSyncExternalStore(subscribeToEntrancePreferences, canPlayIntro, readServerEntrancePreferences)
  const [landing, setLanding] = useState<Landing>("checking")

  // Decide once on entry. A later chapter or motion preference can dismiss the
  // flight, but turning pages or clearing a chapter link can't start it again.
  if (landing === "checking" && eligible !== null) {
    setLanding(eligible ? "flight" : "book")
  } else if (landing === "flight" && eligible === false) {
    setLanding("book")
  }

  const completeFlight = useCallback((outcome: "arrived" | "skipped" | "failed") => {
    setLanding((current) => current === "flight" ? (outcome === "arrived" ? "room" : "book") : current)
  }, [])

  const flying = landing === "flight"
  return (
    <>
      <main className="book-root" data-room={landing === "room" || undefined} inert={flying}>
        {header}
        <Book pages={pages} active={landing === "book" || landing === "room"} arrived={landing === "room"} />
      </main>
      {flying && <NorthBeachFlyIn onFinish={completeFlight} />}
    </>
  )
}
