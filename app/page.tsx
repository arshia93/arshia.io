import type { BookPage } from "@/components/book/book"
import { BookLanding } from "@/components/book/book-landing"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Now } from "@/components/now"
import { Work } from "@/components/work"
import { Projects } from "@/components/projects"
import { Contact } from "@/components/contact"

// Each entry is one page of the book, in reading order. `id` is the deep link
// (arshia.io/#work) and `title` is the running head.
const pages: BookPage[] = [
  { id: "about", title: "Introduction", content: <Hero />, bare: true },
  { id: "now", title: "Now", content: <Now /> },
  { id: "work", title: "Work", content: <Work /> },
  { id: "projects", title: "Projects", content: <Projects /> },
  { id: "contact", title: "Contact", content: <Contact /> },
]

export default function Home() {
  return (
    <>
      <BookLanding pages={pages} header={<Header />} />
      <noscript>
        <style>{`.leaf-cover{--angle:-180!important}.book .book-body{transform:none!important}.book-controls{visibility:hidden}`}</style>
      </noscript>
    </>
  )
}
