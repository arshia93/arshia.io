# arshia.io

Source code for my personal site — [arshia.io](https://arshia.io).

A single-page portfolio built with the Next.js App Router, presented as a
cloth-bound book: it opens on landing, and each section — an intro, what I'm
working on now (with a live GitHub contribution grid), work history, projects,
and a way to get in touch — is a page with its own entrance animation.
Server-rendered, statically deployed to Vercel, no database and no backend.

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

The book and San Francisco intro run as-is after `npm install`. OpenSeadragon
loads the original city illustrations from local tiles. The fly-in plays on
each homepage load: it opens on the whole city, dives into North Beach, and
flies through an apartment window to the book. Chapter links and reduced-motion visits open directly to
the book.

## San Francisco artwork

Two orthographic illustrations share one projection: a citywide drawing
(`public/arrival/san-francisco-tiles/`) and a finer North Beach drawing
(`public/arrival/north-beach-tiles/`) that crossfades in once it fills the
screen. `lib/north-beach-map.json` places both in the same image coordinates.
They use real building footprints, LiDAR-derived
building heights, street geometry, and street-tree locations from [DataSF](https://data.sf.gov/).
The shoreline, piers, paths, and parks are based on [OpenStreetMap](https://www.openstreetmap.org/copyright).
Elevation is from USGS 3DEP via [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/).
Roof palettes were informed by USDA [NAIP imagery](https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer).
Façades, rooftop details, and the apartment interior are illustrated interpretations.

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
  book.css           The book: binding, paper, page turns, page animations
components/          Page sections and UI components
  book/book.tsx      Page-turn engine (spread / single-page, keys, swipe, deep links)
  book/cover.tsx     Front cover and endpaper
  hero.tsx           Intro (title page)
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

Pages are listed in `app/page.tsx` — adding, removing, or reordering one is a
single edit there. Each page's `id` is its deep link (`arshia.io/#work`).

## The book

Wide screens show a two-page spread; phones and portrait tablets show one page
at a time. Turn pages with the arrow keys, the page edge, the controls, a swipe,
or the header links. Elements with an `ink ink-*` class (see `app/book.css`)
animate when their page turns into view; `inkDelay()` in `lib/ink.ts` staggers
them. With `prefers-reduced-motion`, pages change instantly and nothing animates.

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
