import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const socials = [
  { icon: XLogo, href: "https://x.com/arshiagm", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/in/arshiamog", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/arshia93", label: "GitHub" },
  { icon: Mail, href: "mailto:arshiamoghaddam93@gmail.com", label: "Email" },
]

export function Contact() {
  return (
    <section id="contact" className="pt-8 border-t border-border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wider">Contact</h2>
          <p className="text-foreground mb-1">Want to build something together?</p>
          <p className="text-sm text-muted-foreground">Let's share stories and make something special.</p>
        </div>

        <div className="flex items-center gap-4">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <social.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-12">© {new Date().getFullYear()} Arshia Moghaddam</p>
    </section>
  )
}
