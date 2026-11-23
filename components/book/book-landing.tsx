"use client"

import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
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
          pages={pages}
          active={landing === "book" || landing === "room"}
          openingOnArrival={landing === "opening" || landing === "room"}
        />
      </main>
      {flying && <NorthBeachFlyIn onRoomFrame={moveThroughRoom} onOpenCover={openCover} onFinish={completeFlight} />}
    </>
  )
}
