import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

const work = [
  {
    period: "2023 — Present",
    role: "Product Manager",
    company: "Scratchpad",
    url: "#",
    description:
      "Leading growth initiatives for a sales workspace. Shipped AI features that increased weekly active usage by 40%.",
    metrics: "40% WAU increase",
  },
  {
    period: "2021 — 2023",
    role: "Product Manager",
    company: "Outdoorsy",
    url: "#",
    description:
      "Owned activation and retention for the world's largest RV marketplace. Built the guest onboarding flow from scratch.",
    metrics: "$50M+ in bookings influenced",
  },
  {
    period: "2019 — 2021",
    role: "Founder",
    company: "Trym",
    url: "#",
    description:
      "Built a lawn care marketplace from zero to acquisition. Wrote the first 10k lines of code, closed first 100 customers.",
    metrics: "Acquired",
  },
]

export function Work() {
  return (
    <section id="work" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">Work</h2>

      <div className="space-y-10">
        {work.map((item, index) => (
          <div key={index} className="group">
            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-2">
              <span className="text-sm text-muted-foreground shrink-0">{item.period}</span>
              <Link
                href={item.url}
                className="inline-flex items-center gap-1 text-foreground font-medium hover:text-primary transition-colors"
              >
                {item.role} · {item.company}
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
            <p className="text-muted-foreground mb-2">{item.description}</p>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{item.metrics}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
