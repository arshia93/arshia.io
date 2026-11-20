import { ArrowUpRight } from "lucide-react"
import { Suspense, type ReactNode } from "react"
import { ChapterHeading } from "@/components/book/chapter-heading"
import { GitHubStreak } from "@/components/github-streak"
import { inkDelay } from "@/lib/ink"

function CodingRow({ children }: { children: ReactNode }) {
  return (
    <div className="ledger-row ink ink-rise" style={inkDelay(700)}>
      <dt>Coding</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** Chapter I — rows slide in, then the contribution grid ripples in week by week. */
export function Now() {
  return (
    <section className="chapter">
      <ChapterHeading numeral="I" title="Now" />

      <dl className="ledger">
        <div className="ledger-row ink ink-rise" style={inkDelay(420)}>
          <dt>Building</dt>
          <dd>
            Agents for Medicaid renewal
            <br />
            <a href="https://www.basiscoverage.com" className="book-link ledger-company">
              Basis Coverage
              <ArrowUpRight aria-hidden />
            </a>
          </dd>
        </div>

        <div className="ledger-row ink ink-rise" style={inkDelay(560)}>
          <dt>Reading</dt>
          <dd>
            <em>Think Like a Rocket Scientist</em> by Ozan Varol
            <br />
            <em>Click</em> by Jake Knapp
          </dd>
        </div>

        <Suspense fallback={<CodingRow><div className="streak-skeleton" /></CodingRow>}>
          <GitHubStreak frame={(grid) => <CodingRow>{grid}</CodingRow>} />
        </Suspense>
      </dl>
    </section>
  )
}
