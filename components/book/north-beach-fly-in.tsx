"use client"

import { preload } from "react-dom"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import type OpenSeadragon from "openseadragon"
import map from "@/lib/north-beach-map.json"

const LOAD_TIMEOUT_MS = 4400
const OPENING_SETTLE_MS = 350
// The camera opens on the whole city, dives to North Beach, then flies
// down the block to the lit window.
const NEIGHBORHOOD_MS = 4900
const APPROACH_MS = NEIGHBORHOOD_MS + 2000
const FLIGHT_MS = APPROACH_MS + 1230
const DETAIL_FADE_START_MS = NEIGHBORHOOD_MS + 1570
const DETAIL_FADE_MS = 690
const NORTH_BEACH_FADE_MS = 450
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

// The citywide drawing shares the North Beach image's coordinates.
const city = map.city
const cityHeight = city.span * city.height / city.width

function cameraAt(elapsed: number, aspect: number) {
  const portrait = portraitScale(aspect)
  const overview = {
    x: city.x + city.span / 2,
    y: city.y + cityHeight * .51,
    span: Math.min(city.span, cityHeight * aspect) * .98,
  }
  const shots = [
    { time: 0, ...overview },
    { time: NEIGHBORHOOD_MS, x: map.neighborhood[0], y: map.neighborhood[1], span: 3150 * portrait, dive: true },
    { time: APPROACH_MS, x: windowX + 10, y: windowY + 9, span: 520 * portrait },
    { time: FLIGHT_MS, x: windowX, y: windowY, span: windowSpan(aspect) },
  ]
  const index = Math.max(1, shots.findIndex((shot) => shot.time >= elapsed && shot.time > 0))
  const from = shots[index - 1]
  const to = shots[index]
  const eased = smooth(clamp((elapsed - from.time) / (to.time - from.time)))
  // The dive lingers over the city while the fog lifts, then speeds up.
  const amount = "dive" in to ? eased * eased : eased
  const span = from.span * (to.span / from.span) ** amount
  // Diving from the city, keep North Beach fixed on screen as it grows.
  const travel = "dive" in to ? (from.span - span) / (from.span - to.span) : amount
  return {
    x: lerp(from.x, to.x, travel),
    y: lerp(from.y, to.y, travel),
    span,
  }
}

function insideNorthBeach(x: number, y: number, span: number, aspect: number) {
  const halfWidth = span / 2
  const halfHeight = span / aspect / 2
  return x - halfWidth >= 0 && x + halfWidth <= map.width && y - halfHeight >= 0 && y + halfHeight <= map.height
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
    let northBeach: OpenSeadragon.TiledImage | undefined
    let detail: OpenSeadragon.TiledImage | undefined
    let northBeachAt: number | undefined
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

      function move(elapsed: number) {
        const { x: width, y: height } = mapViewer.viewport.getContainerSize()
        const aspect = Math.max(.1, width / Math.max(1, height))
        const camera = cameraAt(elapsed, aspect)
        moveCamera(camera.x, camera.y, camera.span)
        // Swap to the finer North Beach drawing once it fills the screen.
        if (northBeachAt === undefined && (elapsed >= NEIGHBORHOOD_MS || insideNorthBeach(camera.x, camera.y, camera.span, aspect))) {
          northBeachAt = elapsed
        }
        northBeach?.setOpacity(northBeachAt === undefined ? 0 : smooth(clamp((elapsed - northBeachAt) / NORTH_BEACH_FADE_MS)))
        detail?.setOpacity(smooth(clamp((elapsed - DETAIL_FADE_START_MS) / DETAIL_FADE_MS)))
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
              move(elapsed)
            } else {
              if (currentPhase === "flying" && (!roomReady || !northBeach || !detail?.getFullyLoaded())) {
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

        // North Beach is drawn again at a finer scale over the city.
        mapViewer.addTiledImage({
          tileSource: new Seadragon.DziTileSource({
            width: map.width,
            height: map.height,
            tileSize: map.tileSize,
            tileOverlap: 1,
            tilesUrl: "/arrival/north-beach-tiles/",
            fileFormat: "webp",
            minLevel: 8,
          }),
          index: 1,
          x: 0,
          y: 0,
          width: 1,
          opacity: 0,
          preload: true,
          success: (event) => { northBeach = (event as unknown as { item: OpenSeadragon.TiledImage }).item },
          error: () => finish("failed"),
        })
        // A third drawing of the same block uses the same coordinates at a
        // finer scale still, so the bay window holds its detail during the last push.
        mapViewer.addTiledImage({
          tileSource: { type: "image", url: "/arrival/north-beach-detail.webp" },
          index: 2,
          x: map.detail[0] / map.width,
          y: map.detail[1] / map.width,
          width: map.detail[2] / map.width,
          opacity: 0,
          preload: true,
          success: (event) => { detail = (event as unknown as { item: OpenSeadragon.TiledImage }).item },
        })
      })

      mapViewer.open({
        tileSource: new Seadragon.DziTileSource({
          width: city.width,
          height: city.height,
          tileSize: city.tileSize,
          tileOverlap: 1,
          tilesUrl: "/arrival/san-francisco-tiles/",
          fileFormat: "webp",
          minLevel: 8,
        }),
        x: city.x / map.width,
        y: city.y / map.width,
        width: city.span / map.width,
      })
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
    <section className="fly-in" data-phase={phase} aria-label="Arrival in San Francisco">
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
      {phase === "loading" && <p className="fly-in-loading" role="status">Loading San Francisco…</p>}
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
