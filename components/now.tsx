import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Now() {
  return (
    <section id="now" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">
        Now
      </h2>

      <div className="space-y-6 text-foreground">
        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">
            Working
          </span>
          <p>
            Product at Adly, driving 0-to-1 ventures across a PE portfolio. Leading product strategy from $16.8M to $40.8M
            ARR.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">
            Building
          </span>
          <p>
            InReach, an AI tool for founders and growth teams to find and engage
            people looking for their product.{" "}
          </p>
        </div>

        <div className="flex items-start gap-4">
        <span className="text-muted-foreground text-sm mt-1 w-20 shrink-0">Reading</span>
          <p>
            <em>Think Like a Rocket Scientist</em> by Ozan Varol · <em>Click</em> by Jake
            Knapp
          </p>
        </div>
      </div>
    </section>
  );
}
