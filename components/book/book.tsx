"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type TouchEvent as ReactTouchEvent,
  type ReactNode,
} from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BookCover, Endpaper } from "@/components/book/cover"

export type BookPage = {
  /** Deep-link hash, e.g. "work" for arshia.io/#work */
  id: string
  /** Running head and navigation label */
  title: string
  content: ReactNode
  /** Title page: no running head or folio */
  bare?: boolean
}

type Mode = "spread" | "single"
type Face = { kind: "cover" } | { kind: "endpaper" } | { kind: "blank" } | { kind: "page"; index: number }
type Leaf = { front: Face; back: Face }
/** `spread` = how many leaves are turned. 0 is the closed book. */
type View = { mode: Mode; spread: number; from: number }
type Ink = { pages: number[]; phase: "pre" | "in" }
type Source = "user" | "link" | "intro"

// Two facing pages on wide screens, one page at a time elsewhere. Must match the
// media query in app/book.css that sizes the book.
const SPREAD_QUERY = "(min-width: 960px) and (min-height: 560px)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const TURN_MS = 1100
const COVER_MS = 1500
const STAGGER_MS = 150
const COVER_LEAD_MS = 420
const OPEN_DELAY_MS = 850
const DESK_SETTLE_MS = 570

const subscribeMode = (onChange: () => void) => {
  const mq = window.matchMedia(SPREAD_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
const getMode = (): Mode => (window.matchMedia(SPREAD_QUERY).matches ? "spread" : "single")
const getServerMode = (): Mode => "spread"

/* ------------------------------------------------------------------ geometry */

/**
 * Leaf 0 is the front cover. In spread mode each later leaf carries two pages
 * (front = right-hand page, back = the left-hand page of the next spread); in
 * single mode each leaf carries one page and a blank back.
 */
function buildLeaves(mode: Mode, count: number): Leaf[] {
  const leaves: Leaf[] = [{ front: { kind: "cover" }, back: { kind: "endpaper" } }]
  if (mode === "spread") {
    for (let i = 0; i < count; i += 2) {
      leaves.push({
        front: { kind: "page", index: i },
        back: i + 1 < count ? { kind: "page", index: i + 1 } : { kind: "blank" },
      })
    }
  } else {
    for (let i = 0; i < count; i++) leaves.push({ front: { kind: "page", index: i }, back: { kind: "blank" } })
  }
  return leaves
}

const lastSpread = (mode: Mode, count: number) => (mode === "spread" ? Math.ceil((count + 1) / 2) : count)

const spreadOfPage = (mode: Mode, index: number) =>
  mode === "spread" ? Math.floor((index + 1) / 2) + 1 : index + 1

function pagesOnSpread(mode: Mode, spread: number, count: number): number[] {
  if (spread <= 0) return []
  const pages = mode === "spread" ? [2 * spread - 3, 2 * spread - 2] : [spread - 1]
  return pages.filter((i) => i >= 0 && i < count)
}

/* -------------------------------------------------------------------- timing */

const leafDuration = (k: number) => (k === 0 ? COVER_MS : TURN_MS)

/** Leaves turned in one go fan out: forwards in order, backwards in reverse. */
function leafDelay(k: number, from: number, to: number) {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  if (k < lo || k >= hi) return 0
  if (to > from) return (k - lo) * STAGGER_MS + (lo === 0 && k > 0 ? COVER_LEAD_MS : 0)
  return (hi - 1 - k) * STAGGER_MS
}

/** When the destination pages come into view: just before the last leaf passes upright. */
function revealDelay(from: number, to: number) {
  const last = to > from ? to - 1 : to
  return leafDelay(last, from, to) + leafDuration(last) * 0.42
}

/** When the last leaf of a turn from `from` to `to` comes to rest. */
function turnEnd(from: number, to: number) {
  let end = 0
  for (let k = Math.min(from, to); k < Math.max(from, to); k++) {
    end = Math.max(end, leafDelay(k, from, to) + leafDuration(k))
  }
  return end
}

/** Fore-edge of the page block: a few hairlines per leaf on that side. */
function stackShadow(leaves: number, dir: 1 | -1) {
  if (leaves <= 0) return "none"
  const layers = leaves * 3
  const out: string[] = []
  for (let i = 1; i <= layers; i++) {
    out.push(`${dir * i}px ${i * 0.6}px 0 0 var(${i % 2 === 0 ? "--paper-edge" : "--paper-deep"})`)
  }
  out.push(`${dir * (layers + 2)}px ${layers + 3}px 6px -2px rgb(var(--shadow) / 0.18)`)
  return out.join(", ")
}

/** Whether a page's own text can still scroll in that direction. */
function canScroll(el: HTMLElement, direction: number, top = el.scrollTop) {
  return direction > 0 ? top + el.clientHeight < el.scrollHeight - 1 : top > 0
}

function writeHash(id?: string) {
  const url = id ? `#${id}` : window.location.pathname + window.location.search
  window.history.replaceState(window.history.state, "", url)
}

/* ----------------------------------------------------------------- component */

export function Book({ pages, active = true, arrived = false }: { pages: BookPage[]; active?: boolean; arrived?: boolean }) {
  const count = pages.length
  const mode = useSyncExternalStore(subscribeMode, getMode, getServerMode)
  const [view, setView] = useState<View>({ mode, spread: 0, from: 0 })
  const [ink, setInk] = useState<Ink | null>(null)
  const [announcement, setAnnouncement] = useState("")

  // Switching between one and two pages keeps the reader on the same page.
  let current = view
  if (view.mode !== mode) {
    const primary = pagesOnSpread(view.mode, view.spread, count)[0]
    const spread = primary === undefined ? 0 : spreadOfPage(mode, primary)
    current = { mode, spread, from: spread }
    setView(current)
  }

  const viewRef = useRef(current)
  const reducedRef = useRef(false)
  const inkTimer = useRef<number | undefined>(undefined)
  const swipe = useRef<{
    id: number
    x: number
    y: number
    t: number
    body: HTMLElement | null
    scrollTop: number
  } | null>(null)
  const wheel = useRef({ acc: 0, last: 0, locked: false, turnedAt: 0 })

  useEffect(() => {
    viewRef.current = current
  })

  const goTo = useCallback(
    (target: number, source: Source) => {
      const cur = viewRef.current
      const to = Math.max(0, Math.min(lastSpread(cur.mode, count), target))
      if (to === cur.spread) return
      const nextView: View = { mode: cur.mode, spread: to, from: cur.spread }
      viewRef.current = nextView
      setView(nextView)

      // Destination pages start blank and ink in as they come into view.
      const visible = pagesOnSpread(cur.mode, to, count)
      window.clearTimeout(inkTimer.current)
      if (reducedRef.current) {
        setInk({ pages: visible, phase: "in" })
      } else {
        setInk({ pages: visible, phase: "pre" })
        inkTimer.current = window.setTimeout(
          () => setInk({ pages: visible, phase: "in" }),
          revealDelay(cur.spread, to),
        )
      }

      setAnnouncement(
        visible.length === 0
          ? to === 0
            ? "Cover"
            : "End of book"
          : `${visible.length > 1 ? "Pages" : "Page"} ${visible.map((i) => i + 1).join(" and ")} of ${count}: ${visible
              .map((i) => pages[i].title)
              .join(", ")}`,
      )

      if (source === "user") {
        const primary = visible[0]
        writeHash(primary === undefined || primary === 0 ? undefined : pages[primary].id)
      }
    },
    [count, pages],
  )

  const next = useCallback(() => goTo(viewRef.current.spread + 1, "user"), [goTo])
  const prev = useCallback(() => goTo(viewRef.current.spread - 1, "user"), [goTo])
  const goToPage = useCallback(
    (index: number, source: Source) => goTo(spreadOfPage(viewRef.current.mode, index), source),
    [goTo],
  )

  const pageFromHash = useCallback(() => {
    try {
      const id = decodeURIComponent(window.location.hash.slice(1))
      return Math.max(0, pages.findIndex((page) => page.id === id))
    } catch {
      return 0
    }
  }, [pages])

  // Let the exterior finish before opening the cover. Chapter links and
  // reduced motion reach their destination without a cover animation.
  useEffect(() => {
    if (!active) return
    const motion = window.matchMedia(REDUCED_MOTION_QUERY)
    reducedRef.current = motion.matches
    const target = pageFromHash()
    const openDirectly = motion.matches || target > 0
    const timer = window.setTimeout(() => {
      if (viewRef.current.spread !== 0) return
      if (openDirectly) {
        const mode = viewRef.current.mode
        const spread = spreadOfPage(mode, target)
        const destination = { mode, spread, from: spread }
        // The initial destination is already open. Later page turns animate normally.
        viewRef.current = destination
        setView(destination)
      } else {
        goTo(1, "intro")
      }
    }, openDirectly ? 0 : arrived ? DESK_SETTLE_MS : OPEN_DELAY_MS)
    const updateMotion = () => { reducedRef.current = motion.matches }
    motion.addEventListener("change", updateMotion)
    return () => {
      window.clearTimeout(timer)
      motion.removeEventListener("change", updateMotion)
    }
  }, [active, arrived, goTo, pageFromHash])

  useEffect(() => () => window.clearTimeout(inkTimer.current), [])

  // In-page links (#now, #work, …) turn to that page instead of scrolling.
  useEffect(() => {
    if (!active) return
    const onHashChange = () => {
      const index = pageFromHash()
      goToPage(index, "link")
      if (index === 0) writeHash()
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [active, goToPage, pageFromHash])

  useEffect(() => {
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          next()
          break
        case "ArrowLeft":
        case "PageUp":
          prev()
          break
        case "Home":
          goTo(1, "user")
          break
        case "End":
          goTo(lastSpread(viewRef.current.mode, count), "user")
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, count, goTo, next, prev])

  // Scrolling turns pages: down/right for the next page, up/left for the previous.
  // A page whose text overflows scrolls first; it turns once you reach its end.
  // One gesture (including trackpad momentum) turns one page.
  useEffect(() => {
    if (!active) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      const w = wheel.current
      const now = performance.now()
      const gap = now - w.last
      w.last = now
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      const delta = e.deltaMode === 1 ? raw * 16 : e.deltaMode === 2 ? raw * 400 : raw
      if (delta === 0) return

      const body = (e.target as Element | null)?.closest?.(".page-body") as HTMLElement | null
      if (body && canScroll(body, delta)) {
        w.acc = 0
        return
      }
      if (w.locked) {
        if (gap > 180 && now - w.turnedAt > 600) w.locked = false
        else return
      }
      if (gap > 180) w.acc = 0
      w.acc += delta
      if (Math.abs(w.acc) >= 40) {
        if (w.acc > 0) next()
        else prev()
        w.acc = 0
        w.locked = true
        w.turnedAt = now
      }
    }
    window.addEventListener("wheel", onWheel, { passive: true })
    return () => window.removeEventListener("wheel", onWheel)
  }, [active, next, prev])

  // Touch: swipe left/right, or up/down like scrolling. Touch events (not pointer
  // events) so the gesture still ends cleanly when the browser scrolls a page.
  const onTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length !== 1) {
      swipe.current = null
      return
    }
    const t = e.touches[0]
    const body = (e.target as Element).closest?.(".page-body") as HTMLElement | null
    swipe.current = {
      id: t.identifier,
      x: t.clientX,
      y: t.clientY,
      t: performance.now(),
      body,
      scrollTop: body?.scrollTop ?? 0,
    }
  }
  const onTouchEnd = (e: ReactTouchEvent) => {
    const start = swipe.current
    swipe.current = null
    const t = e.changedTouches[0]
    if (!start || !t || start.id !== t.identifier || performance.now() - start.t > 900) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) next()
      else prev()
    } else if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.3) {
      const forward = dy < 0
      const { body } = start
      // A long page scrolls to its end before the swipe turns it. If the browser
      // didn't scroll it natively, scroll it ourselves so the reader never gets stuck.
      if (body && body.scrollTop !== start.scrollTop) return
      if (body && canScroll(body, forward ? 1 : -1)) {
        body.scrollBy({ top: (forward ? 1 : -1) * body.clientHeight * 0.8, behavior: "smooth" })
        return
      }
      if (forward) next()
      else prev()
    }
  }

  /* ----------------------------------------------------------------- render */

  const leaves = useMemo(() => buildLeaves(mode, count), [mode, count])
  const { spread, from } = current
  const max = lastSpread(mode, count)
  const visiblePages = pagesOnSpread(mode, spread, count)
  const pagesRight = Math.max(0, leaves.length - Math.max(spread, 1))
  const pagesLeft = Math.max(0, spread - 1)

  const renderFace = (face: Face, side: "front" | "back", k: number) => {
    const visible = side === "front" ? k === spread : mode === "spread" && k === spread - 1
    const className = `face face-${side}`

    if (face.kind === "cover") {
      return (
        <div key={side} className={`${className} cover`} inert={!visible}>
          <BookCover />
          <button type="button" className="cover-open" aria-label="Open the book" onClick={() => goTo(1, "user")} />
        </div>
      )
    }
    if (face.kind === "endpaper") {
      return (
        <div key={side} className={`${className} endpaper-face`} aria-hidden>
          <Endpaper />
        </div>
      )
    }

    const onScreen = mode === "spread" && side === "back" ? "left" : "right"
    if (face.kind === "blank") {
      return <div key={side} className={`${className} paper`} data-side={onScreen} aria-hidden />
    }

    const page = pages[face.index]
    const anim = ink?.pages.includes(face.index) ? ink.phase : undefined
    return (
      <div
        key={side}
        className={`${className} paper`}
        data-side={onScreen}
        data-anim={anim}
        inert={!visible}
        aria-hidden={visible ? undefined : true}
      >
        <div className="page-inner">
          {!page.bare && (
            <p className="running-head" aria-hidden>
              {onScreen === "left" ? "Arshia Moghaddam" : page.title}
            </p>
          )}
          <div className="page-body">{page.content}</div>
          {page.bare ? (
            <button type="button" className="turn-hint" onClick={next}>
              Turn the page
              <ArrowRight aria-hidden />
            </button>
          ) : (
            <p className="folio" aria-hidden>
              {face.index + 1}
            </p>
          )}
        </div>
      </div>
    )
  }

  const label =
    spread === 0
      ? "Cover"
      : visiblePages.length === 0
        ? "Endpaper"
        : visiblePages.map((i) => pages[i].title).join(" & ")
  const numbers =
    visiblePages.length === 0
      ? null
      : `${visiblePages.map((i) => i + 1).join("–")} / ${count}`

  return (
    <>
      <div
        className="book-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => (swipe.current = null)}
      >
        <section
          className="book"
          data-mode={mode}
          data-open={spread > 0 || undefined}
          data-spread={spread}
          data-jump={(spread > 0 && from === spread) || undefined}
          aria-roledescription="book"
          aria-label="Arshia Moghaddam"
        >
          <div className="book-body">
            <div className="ribbon" aria-hidden />
            <div className="board-shadow-left" aria-hidden />
            <div className="board-back" aria-hidden>
              <div className="endpaper endpaper-back">
                <div className="endpaper-pattern" />
              </div>
            </div>
            <div
              className="stack stack-right"
              aria-hidden
              data-empty={spread >= leaves.length || undefined}
              style={{ boxShadow: stackShadow(pagesRight, 1) }}
            />
            <div
              className="stack stack-left"
              aria-hidden
              data-empty={spread < 2 || undefined}
              style={{ boxShadow: stackShadow(pagesLeft, -1) }}
            />

            {leaves.map((leaf, k) => {
              const flipped = k < spread
              const style = {
                "--angle": flipped ? -180 : 0,
                "--z": 10 + (flipped ? k : leaves.length - k),
                "--delay": `${leafDelay(k, from, spread)}ms`,
                "--dur": `${leafDuration(k)}ms`,
              } as CSSProperties
              return (
                <div
                  key={`${mode}-${k}`}
                  className={k === 0 ? "leaf leaf-cover" : "leaf"}
                  data-flipped={flipped || undefined}
                  style={style}
                >
                  {renderFace(leaf.front, "front", k)}
                  {renderFace(leaf.back, "back", k)}
                </div>
              )
            })}

            {spread > 0 && spread < max && (
              <button
                // Remounts on every turn so the one-page dog-ear tucks away and folds back in
                // once the turning leaf has landed (see .book[data-mode="single"] .curl).
                key={spread}
                type="button"
                className="edge edge-next"
                tabIndex={-1}
                aria-hidden
                onClick={next}
                style={{ "--fold-delay": `${turnEnd(from, spread)}ms` } as CSSProperties}
              >
                <span className="curl" />
              </button>
            )}
            {spread > 1 && mode === "spread" && (
              <button type="button" className="edge edge-prev" tabIndex={-1} aria-hidden onClick={prev}>
                <span className="curl" />
              </button>
            )}
          </div>
        </section>
      </div>

      <nav className="book-controls" aria-label="Pages">
        <button type="button" className="ctrl-btn" onClick={prev} disabled={spread === 0} aria-label="Previous page">
          <ArrowLeft aria-hidden />
        </button>
        <div className="ctrl-center">
          <p className="ctrl-label">
            <span className="ctrl-title">{label}</span>
            {numbers && <span className="ctrl-pages">{numbers}</span>}
          </p>
          <ol className="ctrl-dots">
            {pages.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="ctrl-dot"
                  data-current={visiblePages.includes(i) || undefined}
                  aria-current={visiblePages.includes(i) ? "page" : undefined}
                  aria-label={`${p.title}, page ${i + 1}`}
                  onClick={() => goToPage(i, "user")}
                />
              </li>
            ))}
          </ol>
        </div>
        <button type="button" className="ctrl-btn" onClick={next} disabled={spread === max} aria-label="Next page">
          <ArrowRight aria-hidden />
        </button>
      </nav>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  )
}
