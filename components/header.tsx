import Link from "next/link"

const navItems = [
  { label: "Now", href: "#now" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
]

export function Header() {
  return (
    <header className="flex items-center justify-between mb-20 md:mb-32">
      <Link href="/" className="text-lg font-medium tracking-tight text-foreground">
        Arshia Moghaddam
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
