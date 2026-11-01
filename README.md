# todsdev.github.io

One-page personal portfolio of Thiago Rodrigues (Android Developer), built with [Astro](https://astro.build) and served by GitHub Pages at <https://todsdev.github.io/>.

## Prerequisites

- Node 24 (pinned in `.nvmrc`; run `nvm use` if you use nvm)
- npm (ships with Node)

## Getting started

```sh
nvm use
npm ci
npm run dev
```

## Scripts

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the dev server at `http://localhost:4321` |
| `npm run build`        | Build the static site into `dist/`              |
| `npm run preview`      | Serve the built `dist/` locally                 |
| `npm run check`        | Type-check `.astro` and `.ts` files             |
| `npm run lint`         | Lint with ESLint                                |
| `npm run format`       | Format all files with Prettier                  |
| `npm run format:check` | Verify formatting without writing changes       |
