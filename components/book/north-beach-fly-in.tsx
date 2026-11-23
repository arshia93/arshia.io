"use client"

import { preload } from "react-dom"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import type OpenSeadragon from "openseadragon"
import map from "@/lib/north-beach-map.json"

const LOAD_TIMEOUT_MS = 4400
const OPENING_SETTLE_MS = 350
const FLIGHT_MS = 4900
const WINDOW_PASS_MS = 680
const WINDOW_ROOM_OVERLAP_MS = 360
const DESK_GLIDE_MS = 1000
const COVER_OPEN_LEAD_MS = 200
const ROOM_ART = "/arrival/room.webp"

type Outcome = "arrived" | "skipped" | "failed"
type Phase = "loading" | "flying" | "window" | "room"

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount
const smooth = (amount: number) => amount * amount * (3 - 2 * amount)
const clamp = (amount: number) => Math.max(0, Math.min(1, amount))
const portraitScale = (aspect: number) => Math.min(1, aspect / 1.45)
const windowSpan = (aspect: number) => 108 * portraitScale(aspect)

// Corners of the lit pane in the same image coordinates as the map tiles.
const [upperLeft, upperRight, lowerRight] = map.window
const windowX = (upperLeft[0] + lowerRight[0]) / 2
const windowY = (upperLeft[1] + lowerRight[1]) / 2
const paneWidth = upperRight[0] - upperLeft[0]
const paneHeight = lowerRight[1] - upperRight[1]
const paneSlope = (upperLeft[1] - upperRight[1]) / paneWidth
const FRAME_WIDTH = .28

function cameraAt(progress: number, aspect: number) {
  const portrait = portraitScale(aspect)
  const whole = Math.min(map.width * .96, map.height * aspect * .96)
  const shots = [
    { time: 0, x: lerp(map.neighborhood[0], map.width * .51, portrait), y: map.height * .50, span: whole },
    { time: .34, x: map.neighborhood[0], y: map.neighborhood[1], span: 3150 * portrait },
    { time: .75, x: windowX + 10, y: windowY + 9, span: 520 * portrait },
    { time: 1, x: windowX, y: windowY, span: windowSpan(aspect) },
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

export function NorthBeachFlyIn({ onRoomFrame, onOpenCover, onFinish }: {
  onRoomFrame: (lookDown: number, deskGlide: number) => void
  onOpenCover: () => void
  onFinish: (outcome: Outcome) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const mapLayer = useRef<HTMLDivElement>(null)
  const frameLayer = useRef<SVGSVGElement>(null)
  const pane = useRef<SVGPolygonElement>(null)
  const skipButton = useRef<HTMLButtonElement>(null)
  const finished = useRef(false)
  const [phase, setPhase] = useState<Phase>("loading")
  const paneId = useId()

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
    const exterior = mapLayer.current
    const windowFrame = frameLayer.current
    const windowPane = pane.current
    if (!host || !exterior || !windowFrame || !windowPane) return

    preload(ROOM_ART, { as: "image" })
    const room = new Image()
    room.src = ROOM_ART
    let roomReady = false
    void room.decode().then(() => { roomReady = true }, () => {})

    let viewer: OpenSeadragon.Viewer | undefined
    let detail: OpenSeadragon.TiledImage | undefined
    let cancelled = false
    let started = false
    let frame = 0
    let settleTimer = 0
    const loadTimer = window.setTimeout(() => finish("failed"), LOAD_TIMEOUT_MS)

    const initialize = async (element: HTMLDivElement) => {
      const { default: Seadragon } = await import("openseadragon")
      if (cancelled || finished.current) return
      // OpenSeadragon calls console.assert on every animation frame. In dev,
      // Next.js captures each call (even passing ones) and ships them over the
      // HMR socket, which overflows it and stalls the fly-in. Give OSD its own
      // console with a no-op assert instead of touching the global one.
      const osd = Seadragon as unknown as { console: Console }
      if (osd.console === window.console) {
        osd.console = Object.assign(Object.create(window.console), { assert() {} })
      }
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

      function moveCamera(x: number, y: number, span: number) {
        mapViewer.viewport.panTo(new Seadragon.Point(x / map.width, y / map.width), true)
        mapViewer.viewport.zoomTo(map.width / span, undefined, true)
      }

      function move(progress: number) {
        const { x: width, y: height } = mapViewer.viewport.getContainerSize()
        const camera = cameraAt(progress, Math.max(.1, width / Math.max(1, height)))
        moveCamera(camera.x, camera.y, camera.span)
        detail?.setOpacity(smooth(clamp((progress - .66) / .14)))
      }

      const passWindow = (progress: number) => {
        const { x: width, y: height } = mapViewer.viewport.getContainerSize()
        const startScale = width / windowSpan(Math.max(.1, width / Math.max(1, height)))
        // The frame must clear the corners of the screen at any aspect ratio.
        const endScale = Math.max(
          (width + 4) / (paneWidth - FRAME_WIDTH),
          (height + width * paneSlope + 4) / (paneHeight - FRAME_WIDTH * Math.hypot(1, paneSlope)),
        )
        const scaleAt = (amount: number) => startScale * (endScale / startScale) ** amount
        const scale = scaleAt(progress)
        const points = map.window.map(([x, y]) => [
          width / 2 + (x - windowX) * scale,
          height / 2 + (y - windowY) * scale,
        ])
        const aperture = [...points, points[0]].map(([x, y]) => `${x}px ${y}px`).join(", ")
        exterior.style.clipPath = `polygon(evenodd, 0 0, ${width}px 0, ${width}px ${height}px, 0 ${height}px, 0 0, ${aperture})`
        exterior.style.setProperty("--wall-opacity", `${smooth(clamp((progress - .31) / .39))}`)
        windowPane.setAttribute("points", points.map(([x, y]) => `${x},${y}`).join(" "))
        windowFrame.style.setProperty("--frame-width", `${FRAME_WIDTH * scale}px`)
        windowFrame.style.setProperty("--frame-opacity", `${smooth(clamp(progress / .4))}`)
        windowFrame.style.setProperty("--glass-opacity", `${1 - smooth(clamp(progress / .46))}`)

        // Keep the foreground moving with the pane until the drawn frame
        // takes over, before the underlying tile pixels become visible.
        moveCamera(windowX, windowY, width / scaleAt(Math.min(progress, .7)))
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
          let currentPhase: Phase = "flying"
          let coverStarted = false
          const enter = (next: Phase) => {
            if (currentPhase === next) return
            currentPhase = next
            setPhase(next)
          }
          const advance = (now: number) => {
            if (cancelled || finished.current) return
            const elapsed = now - start
            if (elapsed < FLIGHT_MS) {
              move(clamp(elapsed / FLIGHT_MS))
            } else {
              if (currentPhase === "flying" && (!roomReady || !detail?.getFullyLoaded())) {
                finish("failed")
                return
              }

              const windowElapsed = elapsed - FLIGHT_MS
              const roomElapsed = windowElapsed - (WINDOW_PASS_MS - WINDOW_ROOM_OVERLAP_MS)
              const progress = clamp(roomElapsed / DESK_GLIDE_MS)
              // Start looking down while the window frame is still passing.
              if (progress > 0) {
                onRoomFrame(smooth(clamp(progress / .58)), smooth(clamp((progress - .28) / .72)))
              }
              if (windowElapsed < WINDOW_PASS_MS) {
                passWindow(windowElapsed / WINDOW_PASS_MS)
                enter("window")
              } else {
                enter("room")
              }
              if (!coverStarted && roomElapsed >= DESK_GLIDE_MS - COVER_OPEN_LEAD_MS) {
                coverStarted = true
                onOpenCover()
              }
              if (progress === 1) {
                finish("arrived")
                return
              }
            }
            frame = requestAnimationFrame(advance)
          }
          frame = requestAnimationFrame(advance)
        }
        const overview = mapViewer.world.getItemAt(0)
        let overviewDrawn = false
        overview.addHandler("fully-loaded-change", ({ fullyLoaded }) => {
          if (fullyLoaded && overviewDrawn) startFlight()
        })
        const onOverviewDrawn = ({ tiledImage }: OpenSeadragon.TileEvent) => {
          if (tiledImage !== overview) return
          overviewDrawn = true
          mapViewer.removeHandler("tile-drawn", onOverviewDrawn)
          if (overview.getFullyLoaded()) startFlight()
          else if (!started) settleTimer = window.setTimeout(startFlight, OPENING_SETTLE_MS)
        }
        mapViewer.addHandler("tile-drawn", onOverviewDrawn)

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
      window.clearTimeout(settleTimer)
      cancelAnimationFrame(frame)
      viewer?.destroy()
    }
  }, [finish, onOpenCover, onRoomFrame])

  return (
    <section className="fly-in" data-phase={phase} aria-label="Arrival in North Beach">
      <div className="fly-in-map" ref={mapLayer} aria-hidden>
        <div className="fly-in-camera" ref={container} />
        <div className="fly-in-wall" />
      </div>
      <div className="fly-in-fog" aria-hidden />
      <svg className="fly-in-window" ref={frameLayer} width="100%" height="100%" aria-hidden>
        <defs><polygon id={paneId} ref={pane} /></defs>
        <use href={`#${paneId}`} className="fly-in-glass" />
        <use href={`#${paneId}`} className="fly-in-casing" />
        <use href={`#${paneId}`} className="fly-in-trim" />
      </svg>
      {phase === "loading" && <p className="fly-in-loading" role="status">Loading North Beach…</p>}
      {(phase === "flying" || phase === "window") && (
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
