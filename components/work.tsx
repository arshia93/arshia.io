import { ArrowUpRight } from "lucide-react"

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

export function Work() {
  return (
    <section id="work" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">Work</h2>

      <div className="space-y-10">
        {work.map((item, index) => (
          <div key={index} className="group">
            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-2">
              <span className="text-sm text-muted-foreground shrink-0">{item.period}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-foreground font-medium hover:text-primary transition-colors"
              >
                {item.role} · {item.company}
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <p className="text-muted-foreground mb-2">{item.description}</p>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{item.metrics}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
