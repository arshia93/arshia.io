import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Now } from "@/components/now"
import { Work } from "@/components/work"
import { Projects } from "@/components/projects"
import { Stack } from "@/components/stack"
import { Contact } from "@/components/contact"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Header />
        <Hero />
        <Now />
        <Work />
        <Projects />
        <Stack />
        <Contact />
      </div>
    </main>
  )
}
