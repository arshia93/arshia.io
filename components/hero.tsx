import { ArrowUpRight } from "lucide-react"
import { inkDelay } from "@/lib/ink"

const shipped = [
  { name: "Adly", href: "https://adly.com" },
  { name: "Scratchpad", href: "https://scratchpad.com" },
  { name: "Outdoorsy", href: "https://outdoorsy.com" },
]

const headline: { word: string; italic?: boolean }[] = [
  { word: "I" },
  { word: "love" },
  { word: "building", italic: true },
  { word: "and" },
  { word: "growing", italic: true },
  { word: "products." },
]

function Credit({ name, href }: { name: string; href: string }) {
  return (
    <a href={href} className="book-link">
      {name}
      <ArrowUpRight aria-hidden />
    </a>
  )
}

/** Page 1 — the title page. The headline inks in word by word. */
export function Hero() {
  return (
    <section className="title-page" aria-label="About">
      <p className="title-name ink ink-fade" style={inkDelay(80)}>
        Arshia Moghaddam
      </p>

      <svg className="fleuron ink ink-draw-svg" style={inkDelay(260)} viewBox="0 0 240 24" aria-hidden>
        <path pathLength={1} d="M112 12C96 12 90 3 80 5 72 7 73 17 80 16.5 85 16 85 10 80.5 10.5M76 12H18" />
        <path pathLength={1} d="M128 12C144 12 150 3 160 5 168 7 167 17 160 16.5 155 16 155 10 159.5 10.5M164 12H222" />
        <path pathLength={1} className="fleuron-diamond" d="M120 5 125 12 120 19 115 12Z" />
      </svg>

      <h1 className="title-headline">
        {headline.map(({ word, italic }, i) => (
          <span key={word} className={italic ? "word ink ink-blur word-italic" : "word ink ink-blur"} style={inkDelay(520 + i * 120)}>
            {word}
            {i < headline.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>

      <span className="title-rule ink ink-draw" style={inkDelay(1350)} aria-hidden />

      <p className="title-credits ink ink-rise" style={inkDelay(1500)}>
        Shipped products at{" "}
        {shipped.map((s, i) => (
          <span key={s.name}>
            <Credit {...s} />
            {i < shipped.length - 1 ? ", " : " "}
          </span>
        ))}
        <span className="title-dot">·</span> Founded <Credit name="Trym" href="https://trymcuts.com" />
      </p>
    </section>
  )
}
