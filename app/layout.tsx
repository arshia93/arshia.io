import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "./book.css"
import "./arrival.css"

// Self-hosted (via Fontsource) rather than next/font/google: Turbopack fails to
// resolve some Google font URLs on Vercel's build machines.
const display = localFont({
  src: [
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--ff-display",
})
const serif = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2", weight: "400 800", style: "normal" },
    { path: "../node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--ff-serif",
})
const script = localFont({
  src: "../node_modules/@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2",
  weight: "400",
  variable: "--ff-script",
})

export const metadata: Metadata = {
  title: "Arshia Moghaddam — Product Builder",
  description: "Product builder, founder, and PM. I love building & growing products.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e3d8" },
    { media: "(prefers-color-scheme: dark)", color: "#14171f" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${serif.variable} ${script.variable}`}>
      <body className="font-serif antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
