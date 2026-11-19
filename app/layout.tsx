import type React from "react"
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, EB_Garamond, Mrs_Saint_Delafield } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "./book.css"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--ff-display",
})
const serif = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--ff-serif",
})
const script = Mrs_Saint_Delafield({
  subsets: ["latin"],
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
