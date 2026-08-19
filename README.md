# Performance Monitor (React SPA)

Statische React-SPA (Vite + React Router + TanStack Query) mit Supabase als Backend.

## Voraussetzungen

- Node.js 20+
- npm
- Supabase-URL und Publishable Key

## Environment

Lege lokal eine Datei `.env.local` an:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Entwicklung

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run format
npm run build
```

## Supabase-Typen

Typen koennen lokal aus der Supabase-Konfiguration generiert werden:

```bash
npm run supabase:types
```

## Deployment (GitHub Pages)

- Build mit `vite build`
- Deployment via GitHub Actions Workflow in `.github/workflows/deploy-pages.yml`
- In den Repository-Settings muss GitHub Pages auf **GitHub Actions** stehen
