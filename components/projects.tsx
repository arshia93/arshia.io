import { ArrowUpRight, Github } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    name: "Research Sync",
    description:
      "AI tool that synthesizes user interviews into actionable insights. Built for PMs who drown in research notes.",
    stack: ["Next.js", "OpenAI", "Supabase"],
    url: "#",
    github: "#",
    status: "Building",
  },
  {
    name: "Waitlist Kit",
    description: "Open-source waitlist template with referral tracking. 500+ stars on GitHub.",
    stack: ["React", "Tailwind", "Resend"],
    url: "#",
    github: "#",
    status: "Live",
  },
  {
    name: "Metric Bot",
    description: "Slack bot that pulls key metrics into your channels. No more digging through dashboards.",
    stack: ["Node.js", "Slack API", "Amplitude"],
    url: "#",
    github: null,
    status: "Live",
  },
  {
    name: "Roadmap.fyi",
    description: "Public roadmaps for indie hackers. Share what you're building with your audience.",
    stack: ["Next.js", "Prisma", "Vercel"],
    url: "#",
    github: "#",
    status: "Shipped",
  },
]

export function Projects() {
  return (
    <section id="projects" className="mb-24 md:mb-32">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider">Projects</h2>
        <Link
          href="#"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          View all on GitHub
          <Github className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid gap-6">
        {projects.map((project, index) => (
          <div key={index} className="group p-5 -mx-5 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    project.status === "Live"
                      ? "bg-primary/20 text-primary"
                      : project.status === "Building"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {project.github && (
                  <Link href={project.github} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href={project.url}
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 text-sm"
                >
                  Try it
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-3">{project.description}</p>

            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span key={tech} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
