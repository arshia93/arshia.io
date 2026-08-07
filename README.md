# arshia.io

Source code for my personal site — [arshia.io](https://arshia.io).

A single-page portfolio built with the Next.js App Router: an intro, what I'm
working on now (with a live GitHub contribution grid), work history, projects,
and a way to get in touch. Server-rendered, statically deployed to Vercel, no
database and no backend.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Components | Radix UI primitives + [shadcn/ui](https://ui.shadcn.com) |
| Icons | lucide-react |
| Theming | next-themes (system / light / dark) |
| Analytics | Vercel Analytics |
| Hosting | Vercel |

## Getting started

Requires Node.js 20 or newer (developed on Node 22).

```bash
git clone https://github.com/arshia93/arshia.io.git
cd arshia.io
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

There are no environment variables or secrets — the app runs as-is after
`npm install`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
app/                 App Router entry — layout, page, global styles
components/          Page sections and UI components
  hero.tsx           Intro
  now.tsx            Current focus + GitHub activity
  work.tsx           Experience
  projects.tsx       Projects
  stack.tsx          Tools (currently not rendered)
  contact.tsx        Links
  theme-*.tsx        Theme provider and toggle
lib/
  github-contributions.ts   Fetches and shapes the contribution heatmap
docs/                Design notes and implementation plans
```

Sections are composed in `app/page.tsx` — adding, removing, or reordering one
is a single edit there.

## GitHub contribution grid

`lib/github-contributions.ts` pulls the trailing 365 days from the public
[github-contributions-api](https://github-contributions-api.jogruber.de), then
builds a 16-week grid rendered by `components/github-streak-grid.tsx`. No GitHub
token is needed. The fetch is cached for an hour (`revalidate: 3600`) and fails
soft — if the API is unreachable, the section is simply omitted rather than
breaking the page.

If you fork this, change the username in the API URL in
`lib/github-contributions.ts`.

## Deployment

Every push to `main` deploys automatically to Vercel. `npm run build` reproduces
the production build locally.

## Notes for visitors

This is a personal site, so the copy, links, and projects are specific to me.
You're welcome to read the code, borrow patterns from it, or fork it as a
starting point — just swap out the personal content (name, bio, work history,
GitHub handle, and the metadata in `app/layout.tsx`) before publishing.

Issues and PRs about bugs or accessibility problems are welcome. Feature
requests for a personal portfolio, less so.

No license file is included, so the code is under default copyright — please
don't republish it as-is under your own name.
