import { ArrowUpRight } from "lucide-react"
import { ChapterHeading } from "@/components/book/chapter-heading"
import { inkDelay } from "@/lib/ink"

const work = [
  {
    period: "2024 — Present",
    role: "Product Lead",
    company: "Adly",
    url: "https://adly.com",
    description:
      "Leading product strategy for a PE portfolio of 5 SaaS companies. Drove portfolio ARR growth from $16.8M to $40.8M by identifying opportunities across acquisition, activation, and retention.",
    metrics: "$16.8M → $40.8M ARR",
  },
  {
    period: "2022 — 2023",
    role: "Product Manager",
    company: "Scratchpad",
    url: "https://scratchpad.com",
    description:
      "Managed 0-1 product development at the AI-powered B2B SaaS platform serving revenue teams. Increased customer seat utilization by 5% and saved the internal GTM team 300 hours.",
    metrics: "5% seat utilization increase",
  },
  {
    period: "2017 — 2022",
    role: "Head of Product & Founder",
    company: "Trym",
    url: "https://trymcuts.com",
    description:
      "Founded a two-sided subscription marketplace to increase net revenue for barbers. Owned product strategy end-to-end, growing repeat purchase rate 3x and ARR from $0 to $180k in 6 months.",
    metrics: "$0 → $180k ARR in 6 months",
  },
]

/** Chapter II — the timeline draws itself down the page; each result is highlighted in turn. */
export function Work() {
  return (
    <section className="chapter">
      <ChapterHeading numeral="II" title="Work" />

      <ol className="timeline">
        <span className="timeline-line ink ink-draw-y" style={inkDelay(380)} aria-hidden />
        {work.map((item, i) => (
          <li key={item.company} className="timeline-item ink ink-rise" style={inkDelay(460 + i * 240)}>
            <span className="timeline-dot ink ink-pop" style={inkDelay(640 + i * 240)} aria-hidden />
            <p className="timeline-period">{item.period}</p>
            <h3 className="timeline-role">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="book-link">
                {item.role} <span className="timeline-sep">·</span> {item.company}
                <ArrowUpRight aria-hidden />
              </a>
            </h3>
            <p className="timeline-desc">{item.description}</p>
            <span className="metric" style={inkDelay(900 + i * 240)}>
              {item.metrics}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
