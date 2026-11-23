"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { Book, type BookPage } from "./book"
import { NorthBeachFlyIn } from "./north-beach-fly-in"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

type Landing = "checking" | "flight" | "opening" | "room" | "book"

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
  const [edition, setEdition] = useState(0)
  const root = useRef<HTMLElement>(null)
  const flying = landing === "flight" || landing === "opening"

  // Decide once on entry. A later chapter or motion preference can dismiss the
  // flight, but turning pages or clearing a chapter link can't start it again.
  if (landing === "checking" && eligible !== null) {
    setLanding(eligible ? "flight" : "book")
  } else if (flying && eligible === false) {
    setLanding("book")
  }

  const openCover = useCallback(() => {
    setLanding((current) => current === "flight" ? "opening" : current)
  }, [])

  const completeFlight = useCallback((outcome: "arrived" | "skipped" | "failed") => {
    setLanding((current) => {
      if (current !== "flight" && current !== "opening") return current
      return outcome === "arrived" ? "room" : "book"
    })
  }, [])

  const moveThroughRoom = useCallback((lookDown: number, deskGlide: number) => {
    root.current?.style.setProperty("--room-entry", String(lookDown))
    root.current?.style.setProperty("--desk-approach", String(deskGlide))
  }, [])

  // "Begin again" replays the whole arrival with a freshly closed book.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest?.("a[data-replay-intro]")
      if (!link) return
      event.preventDefault()
      if (window.matchMedia(REDUCED_MOTION).matches) {
        window.location.hash = "about"
        return
      }
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search)
      root.current?.style.removeProperty("--room-entry")
      root.current?.style.removeProperty("--desk-approach")
      setEdition((current) => current + 1)
      setLanding("flight")
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".fly-in-skip")?.focus())
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  const showRoom = flying || landing === "room"
  return (
    <>
      <main
        ref={root}
        className="book-root"
        data-room={showRoom || undefined}
        data-arriving={flying || undefined}
        inert={flying}
      >
        {showRoom && <div className="arrival-room" aria-hidden><div className="arrival-room-art" /></div>}
        {header}
        <Book
          key={edition}
          pages={pages}
          active={landing === "book" || landing === "room"}
          openingOnArrival={landing === "opening" || landing === "room"}
        />
      </main>
      {flying && <NorthBeachFlyIn onRoomFrame={moveThroughRoom} onOpenCover={openCover} onFinish={completeFlight} />}
    </>
  )
}
