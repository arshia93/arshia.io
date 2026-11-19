import { ThemeToggle } from "@/components/theme-toggle"

// Plain anchors on purpose: the book listens for `hashchange` and turns to the
// matching page, so these links work as a table of contents.
const navItems = [
  { label: "Now", href: "#now" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
]

export function Header() {
  return (
    <header className="book-header">
      <a href="#about" className="book-header-name">
        Arshia Moghaddam
      </a>
      <div className="book-header-end">
        <nav className="book-header-nav" aria-label="Contents">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
