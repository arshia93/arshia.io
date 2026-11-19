import { inkDelay } from "@/lib/ink"

export function ChapterHeading({ numeral, title }: { numeral: string; title: string }) {
  return (
    <header className="chapter-head">
      <span className="chapter-numeral ink ink-fade" style={inkDelay(0)}>
        Chapter {numeral}
      </span>
      <h2 className="chapter-title ink ink-blur" style={inkDelay(90)}>
        {title}
      </h2>
      <span className="chapter-rule ink ink-draw" style={inkDelay(320)} aria-hidden />
    </header>
  )
}
