"use client"

import { preload } from "react-dom"
import { useCallback, useEffect, useRef, useState } from "react"
import type OpenSeadragon from "openseadragon"
import map from "@/lib/north-beach-map.json"

const LOAD_TIMEOUT_MS = 4400
const OPENING_SETTLE_MS = 350
const FLIGHT_MS = 5400
const WINDOW_CUT_MS = 470

type Outcome = "arrived" | "skipped" | "failed"
type Phase = "loading" | "flying" | "window"

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount
const smooth = (amount: number) => amount * amount * (3 - 2 * amount)

function cameraAt(progress: number, aspect: number) {
  const portrait = Math.min(1, aspect / 1.45)
  const whole = Math.min(map.width * .96, map.height * aspect * .96)
  const [windowX, windowY] = map.window
  const shots = [
    { time: 0, x: lerp(map.neighborhood[0], map.width * .51, portrait), y: map.height * .50, span: whole },
    { time: .34, x: map.neighborhood[0], y: map.neighborhood[1], span: 3150 * portrait },
    { time: .75, x: windowX + 10, y: windowY + 9, span: 520 * portrait },
    { time: 1, x: windowX, y: windowY, span: 108 * portrait },
  ]
  const index = shots.findIndex((shot) => shot.time >= progress && shot.time > 0)
  const from = shots[index - 1]
  const to = shots[index]
  const amount = smooth((progress - from.time) / (to.time - from.time))
  return {
    x: lerp(from.x, to.x, amount),
    y: lerp(from.y, to.y, amount),
    span: from.span * (to.span / from.span) ** amount,
  }
}

export function NorthBeachFlyIn({ onFinish }: { onFinish: (outcome: Outcome) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const skipButton = useRef<HTMLButtonElement>(null)
  const finished = useRef(false)
  const [phase, setPhase] = useState<Phase>("loading")

  const finish = useCallback((outcome: Outcome) => {
    if (finished.current) return
    finished.current = true
    const restoreFocus = document.activeElement === skipButton.current
    onFinish(outcome)
    if (restoreFocus) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".book-header-name")?.focus())
    }
  }, [onFinish])

  useEffect(() => {
    const host = container.current
    if (!host) return
    preload("/arrival/room.webp", { as: "image" })

    let viewer: OpenSeadragon.Viewer | undefined
    let detail: OpenSeadragon.TiledImage | undefined
    let cancelled = false
    let started = false
    let frame = 0
    let cutTimer = 0
    let settleTimer = 0
    const loadTimer = window.setTimeout(() => finish("failed"), LOAD_TIMEOUT_MS)

    async function initialize(element: HTMLDivElement) {
      const { default: Seadragon } = await import("openseadragon")
      if (cancelled || finished.current) return
      const mapViewer = Seadragon({
        element,
        drawer: "canvas",
        showNavigationControl: false,
        mouseNavEnabled: false,
        blendTime: 0.1,
        maxTilesPerFrame: 4,
        maxZoomPixelRatio: 5,
        minPixelRatio: 0.65,
      })
      viewer = mapViewer

      function move(progress: number) {
        const { x: width, y: height } = mapViewer.viewport.getContainerSize()
        const camera = cameraAt(progress, Math.max(.1, width / Math.max(1, height)))
        mapViewer.viewport.panTo(new Seadragon.Point(camera.x / map.width, camera.y / map.width), true)
        mapViewer.viewport.zoomTo(map.width / camera.span, undefined, true)
        detail?.setOpacity(smooth(Math.min(1, Math.max(0, (progress - .66) / .14))))
      }

      mapViewer.addOnceHandler("open-failed", () => finish("failed"))
      mapViewer.addOnceHandler("open", () => {
        move(0)
        const startFlight = () => {
          if (cancelled || started || finished.current) return
          started = true
          window.clearTimeout(loadTimer)
          window.clearTimeout(settleTimer)
          setPhase("flying")
          const start = performance.now()
          const advance = (now: number) => {
            if (cancelled || finished.current) return
            const progress = Math.min(1, (now - start) / FLIGHT_MS)
            move(progress)
            if (progress < 1) {
              frame = requestAnimationFrame(advance)
            } else {
              setPhase("window")
              cutTimer = window.setTimeout(() => finish("arrived"), WINDOW_CUT_MS)
            }
          }
          frame = requestAnimationFrame(advance)
        }
        const overview = mapViewer.world.getItemAt(0)
        overview.addHandler("fully-loaded-change", ({ fullyLoaded }) => {
          if (fullyLoaded) startFlight()
        })
        mapViewer.addOnceHandler("tile-drawn", () => {
          if (overview.getFullyLoaded()) startFlight()
          else if (!started) settleTimer = window.setTimeout(startFlight, OPENING_SETTLE_MS)
        })

        // A second drawing of the same block uses the same coordinates at a
        // finer scale, so the bay window holds its detail during the last push.
        mapViewer.addTiledImage({
          tileSource: { type: "image", url: "/arrival/north-beach-detail.webp" },
          x: map.detail[0] / map.width,
          y: map.detail[1] / map.width,
          width: map.detail[2] / map.width,
          opacity: 0,
          preload: true,
          success: () => { detail = mapViewer.world.getItemAt(1) },
        })
      })

      mapViewer.open({ tileSource: new Seadragon.DziTileSource({
        width: map.width,
        height: map.height,
        tileSize: map.tileSize,
        tileOverlap: 1,
        tilesUrl: "/arrival/north-beach-tiles/",
        fileFormat: "webp",
        minLevel: 8,
      }) })
    }

    void initialize(host).catch(() => {
      if (!cancelled) finish("failed")
    })
    return () => {
      cancelled = true
      window.clearTimeout(loadTimer)
      window.clearTimeout(cutTimer)
      window.clearTimeout(settleTimer)
      cancelAnimationFrame(frame)
      viewer?.destroy()
    }
  }, [finish])

  return (
    <section className="fly-in" data-phase={phase} aria-label="Arrival in North Beach">
      <div className="fly-in-map" ref={container} aria-hidden />
      <div className="fly-in-fog" aria-hidden />
      <div className="fly-in-window" aria-hidden><span /></div>
      {phase === "loading" && <p className="fly-in-loading" role="status">Loading North Beach…</p>}
      {phase === "flying" && (
        <div className="fly-in-credit">
          <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>
          <span aria-hidden> · </span>
          <a href="https://data.sf.gov/">DataSF</a>
          <span aria-hidden> · </span>
          <a href="https://registry.opendata.aws/terrain-tiles/">USGS / Mapzen</a>
        </div>
      )}
      <button type="button" className="fly-in-skip" ref={skipButton} onClick={() => finish("skipped")}>
        Open book
      </button>
    </section>
  )
}
