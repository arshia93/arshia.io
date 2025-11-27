import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function Hero() {
  return (
    <section id="about" className="mb-24 md:mb-32">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight text-balance mb-6">
          I love building and growing products.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
        Product Manager by trade, builder at heart. I love solving hard problems through
        <span className="text-foreground"> active experimentation</span>. 
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
        <span>Previously shipped products at</span>
        <Link href="https://adly.com" className="text-foreground hover:text-primary transition-colors inline-flex items-center">
          Adly
          <ArrowUpRight className="w-3 h-3" />
        </Link>
        <span>,</span>
        <Link href="https://scratchpad.com" className="text-foreground hover:text-primary transition-colors inline-flex items-center">
          Scratchpad
          <ArrowUpRight className="w-3 h-3" />
        </Link>
        <span>,</span>
        <Link href="https://outdoorsy.com" className="text-foreground hover:text-primary transition-colors inline-flex items-center">
          Outdoorsy
          <ArrowUpRight className="w-3 h-3" />
        </Link>
        <span>· Founded</span>
        <Link href="https://trymcuts.com" className="text-foreground hover:text-primary transition-colors inline-flex items-center">
          Trym
          <ArrowUpRight className="w-3 h-3" />
        </Link>

      </div>
    </section>
  )
}
