import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function Now() {
  return (
    <section id="now" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">Now</h2>

      <div className="space-y-6 text-foreground">
        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Building</span>
          <p>
            An AI-powered tool for product managers to synthesize user research.{" "}
            <Link href="#" className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-0.5">
              Early access
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Learning</span>
          <p>
            Going deeper on AI agents and building with LLMs. Exploring what "product management" looks like when half
            your team is AI.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Reading</span>
          <p>
            <em>Think Like a Rocket Scientist</em> by Ozan Varol · <em>Click</em> by Jake Knapp
          </p>
        </div>
      </div>
    </section>
  )
}
