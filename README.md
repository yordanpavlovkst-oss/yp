
# Sofia Rentals — Yordan Pavlov

A simple, fast Vite + React + Tailwind website to showcase rental opportunities in Sofia.

## Local dev
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to Vercel
1. Create an account at vercel.com and install the Vercel CLI (optional).
2. Push this folder to a new GitHub repo **or** drag-and-drop the folder in Vercel's "New Project" flow.
3. Framework preset: **Vite** (Vercel usually autodetects it).
4. Build command: `vite build` (default). Output directory: `dist` (default).
5. Deploy.

You can customize listings in `src/data.js`. Contact info is in the same file.


---

## Live feed via Google Sheets (CSV)
1. Create a Google Sheet with columns: `id, title, district, price, beds, size, address, tags`.
2. File → **Share** → **Publish to web** → select the sheet → **Comma‑separated values (.csv)**.
3. Copy the CSV link and paste it into `src/config.js` -> `SHEET_CSV_URL`.
4. In `src/config.js`, set `DATA_SOURCE = 'sheet'`.
5. Deploy again.

*Tip:* You can keep a hidden column for images and later extend cards to show them.

