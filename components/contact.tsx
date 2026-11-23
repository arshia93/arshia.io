import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react"
import { ChapterHeading } from "@/components/book/chapter-heading"
import { inkDelay } from "@/lib/ink"

const socials = [
  { icon: Linkedin, href: "https://linkedin.com/in/arshiamog", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/arshia93", label: "GitHub" },
  { icon: Mail, href: "mailto:arshiamoghaddam93@gmail.com", label: "Email" },
]

/** Chapter IV — closes with a signature that writes itself. */
export function Contact() {
  return (
    <section className="chapter chapter-contact">
      <ChapterHeading numeral="IV" title="Contact" />

      <p className="contact-lede ink ink-blur" style={inkDelay(420)}>
        Want to build something together?
      </p>
      <p className="contact-sub ink ink-rise" style={inkDelay(640)}>
        Let&apos;s share stories and make something special.
      </p>

      <ul className="contact-links">
        {socials.map((social, i) => (
          <li key={social.label} className="ink ink-rise" style={inkDelay(860 + i * 130)}>
            <a
              href={social.href}
              className="contact-link"
              {...(social.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <social.icon aria-hidden />
              <span className="contact-label">{social.label}</span>
              <ArrowUpRight className="contact-arrow" aria-hidden />
            </a>
          </li>
        ))}
      </ul>

      <div className="signature" aria-label="Signed, Arshia">
        <span className="signature-text ink ink-write" style={inkDelay(1350)} aria-hidden>
          Arshia
        </span>
        <svg className="signature-swash ink ink-draw-svg" style={inkDelay(2650)} viewBox="0 0 220 24" aria-hidden>
          <path pathLength={1} d="M4 16C40 10 92 6 150 8 178 9 200 12 214 17" />
        </svg>
      </div>

      <p className="colophon ink ink-fade" style={inkDelay(2200)}>
        © {new Date().getFullYear()} Arshia Moghaddam
        <span className="colophon-sep">·</span>
        <a href="/" className="book-link" data-replay-intro>
          Begin again
        </a>
      </p>
    </section>
  )
}
