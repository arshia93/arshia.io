import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GitHubStreak } from "@/components/github-streak";

export function Now() {
  return (
    <section id="now" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">
        Now
      </h2>

      <div className="space-y-6 text-foreground">

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">
            Building
          </span>
          <p>
            <Link href="https://basiscoverage.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Basis Coverage</Link>, coverage recovery for hospitals and clinics.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Reading</span>
          <p>
            <em>Think Like a Rocket Scientist</em> by Ozan Varol · <em>Click</em> by Jake
            Knapp
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Coding</span>
          <div className="mt-1">
            <Suspense fallback={<div className="h-[88px] w-[205px] rounded bg-secondary/50 animate-pulse" />}>
              <GitHubStreak />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
