import { ArrowUpRight, Github } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    name: "InReach",
    description: "AI tool for founders and growth teams to find and engage people looking for their product. Smart audience discovery powered by LLMs.",
    stack: ["Next.js", "Supabase", "Tailwind", "Plasmo"],
    url: "https://useinreach.com",
    github: null,
    status: "Building",
  },
  {
    name: "Blueprint",
    description:
      "TurboTax-style SSDI tool using AI to help disabled Americans get approved for benefits. Simplifying the complex disability application process.",
    stack: ["Next.js", "pgvector", "Supabase", "Tailwind"],
    url: "https://blueprintdisability.com",
    github: null,
    status: "Live",
  },
  {
    name: "Bite",
    description: "The first voice-based calorie tracker.",
    stack: ["TypeScript", "Whisper", "Supabase"],
    url: "https://bitemacros.com",
    github: null,
    status: "Live",
  },
  {
    name: "WhatMail",
    description: "Winner of Craft Venture's AI Hackathon. Chat with your mail in any language. Making email accessible across language barriers.",
    stack: ["Next.js", "OCR", "Tailwind"],
    url: "https://whatletter.com",
    github: null,
    status: "Live",
  },
]

export function Projects() {
  return (
    <section id="projects" className="mb-24 md:mb-32">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider">Projects</h2>
        {/* <Link
          href="#"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          View all on GitHub
          <Github className="w-3.5 h-3.5" />
        </Link> */}
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
                  target="_blank"
                  rel="noopener noreferrer"
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
