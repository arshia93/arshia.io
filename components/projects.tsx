import { ArrowUpRight } from "lucide-react"
import { ChapterHeading } from "@/components/book/chapter-heading"
import { inkDelay } from "@/lib/ink"

const projects = [
  {
    name: "InReach",
    description:
      "AI tool for founders and growth teams to find and engage people looking for their product. Smart audience discovery powered by LLMs.",
    stack: ["Next.js", "Supabase", "Tailwind", "Plasmo"],
    url: "https://useinreach.com",
    status: "Live",
  },
  {
    name: "Blueprint",
    description:
      "TurboTax-style SSDI tool using AI to help disabled Americans get approved for benefits. Simplifying the complex disability application process.",
    stack: ["Next.js", "pgvector", "Supabase", "Tailwind"],
    url: "https://blueprintdisability.com",
    status: "Live",
  },
  {
    name: "Bite",
    description: "The first voice-based calorie tracker.",
    stack: ["TypeScript", "Whisper", "Supabase"],
    url: "https://bitemacros.com",
    status: "Live",
  },
  {
    name: "WhatMail",
    description:
      "Winner of Craft Venture's AI Hackathon. Chat with your mail in any language. Making email accessible across language barriers.",
    stack: ["Next.js", "OCR", "Tailwind"],
    url: "https://whatletter.com",
    status: "Live",
  },
]

/** Chapter III — entries are dealt onto the page like index cards. */
export function Projects() {
  return (
    <section className="chapter">
      <ChapterHeading numeral="III" title="Projects" />

      <ul className="projects">
        {projects.map((project, i) => (
          <li key={project.name} className="project ink ink-deal" style={inkDelay(420 + i * 170)}>
            <div className="project-head">
              <h3 className="project-name">{project.name}</h3>
              <span className="project-status">{project.status}</span>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="book-link project-link">
                Try it
                <ArrowUpRight aria-hidden />
              </a>
            </div>
            <p className="project-desc">{project.description}</p>
            <p className="project-stack">{project.stack.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
