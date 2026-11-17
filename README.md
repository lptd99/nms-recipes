# Orbit Pantry (nms-recipes)

Fan-made No Man's Sky recipe browser: refining, cooking, crafting, catalogs, and quantity calculators.

Built with **Vite + React + TypeScript**. Recipe JSON is normalized by a **Node** ingest script from community game-file dumps (NMS-Handbook tables).

This is an original implementation. It is not affiliated with Hello Games or nomansskyrecipes.com.

## Setup

```bash
npm install
npm run ingest
npm run dev
```

## Scripts

- `npm run ingest` — read `data/source/*.json`, write `public/data/*.json`
- `npm run dev` — Vite dev server
- `npm run build` — ingest + production build
- `npm run preview` — preview production build

## Updating game data

Replace files under `data/source/` with newer NMS-Handbook `JSON_Files` exports, then run `npm run ingest`.

## License note

Game data facts come from No Man's Sky files via community extractors. Site code in this repo is original. Hello Games owns No Man's Sky trademarks and assets.
