# ProSkladAI — Frontend

AI-automation web app for marketplace sellers: generates SEO product copy and finds relevant infographics for product listings via neural networks, alongside a companion Telegram bot ([@ProskladaiBot](https://t.me/ProskladaiBot)). This repo is the React/TypeScript frontend (`proskladai-frontend`).

## Tech stack

- **React 18 + TypeScript**, built with **Vite 5**
- **React Router v6** — client-side routing
- **Zustand** — state management (with `persist` middleware for auth)
- **Axios** — API client
- **Tailwind CSS 3** — styling, driven by a token system in `tailwind.config.js`
- **Radix UI** (`react-dialog`, `react-dropdown-menu`) — accessible primitives for modals/menus
- `class-variance-authority`, `clsx` + `tailwind-merge` — component variants and class merging
- `lucide-react` — icons, `recharts` — charts, `framer-motion` — animation

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm run dev
```

The dev server runs Vite under the base path `/StartupFrontend/` (see `vite.config.ts`, set up for GitHub Pages deployment), so open it at the printed URL, e.g. `http://localhost:3000/StartupFrontend/` — the bare root URL 404s.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc`) + production build to `dist/` |
| `npm run lint` | ESLint (`--max-warnings 0`) |
| `npm run preview` | Serve the production build locally |
| `npm run deploy` | Build and publish `dist/` to GitHub Pages via `gh-pages` |

There is no automated test suite in this repo yet.

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL, used by the Axios client and the dev-server `/api` proxy | `http://localhost:8000` |

## Application structure

### Public / marketing (`src/pages/Landing/`)

`HomePage`, `FeaturesPage`, `PricingPage` — no shared layout; each renders its own `LandingHeader`/`LandingFooter` (`src/components/landing/`).

### Auth (`src/pages/Auth/`)

`LoginPage`, `RegisterPage`, wrapped in `AuthLayout`. Backed by `src/api/auth.ts` and the `useAuthStore` Zustand store.

### Dashboard (`src/pages/Dashboard/`, behind login)

Wrapped in `MainLayout` (sidebar navigation) and gated by a route guard that redirects unauthenticated users to `/login`:

- **Дашборд** (`DashboardPage`) — overview/landing page after login.
- **Товары** (`GoodsListPage`, `GoodsDetailPage`) — product catalog; detail page has tabs for info, SEO, infographics, and reports per product (`GoodsDetail/InfoTab`, `SeoTab`, `InfographicsTab`, `ReportsTab`).
- **SEO-генерация** (`SeoGenerationPage`) — AI-generated SEO copy for listings.
- **Инфографика** (`InfographicsPage`) — AI-sourced/generated product infographics.
- **Отчёты** (`ReportsPage`) — reporting.
- **Профиль** (`ProfilePage`) / **Настройки** (`SettingsPage`) — account management.

### API layer (`src/api/`)

A single Axios instance (`client.ts`) is shared by every API module (`auth.ts`, `goods.ts`, `infographics.ts`, `reports.ts`, `seo.ts`). It attaches the bearer token from `localStorage['access_token']` to every request and clears it on a `401` response. Types live in `api/types.ts` and `src/types/`.

### Auth state (`src/store/authStore.ts`)

A Zustand store, persisted to `localStorage` (`auth-storage`), tracking `user`/`isAuthenticated` and exposing `login`, `register`, `logout`, `loadUser`.

### Design system (`src/components/ui/`, `src/components/landing/`)

A shared "clean editorial" component library (`Button`, `Card`, `FormField`, `Alert`, `Badge`, `Switch`, `ConfirmDialog`, `Table`, `StatTile`, `SelectableImageGrid`, `Avatar`, `DropdownMenu`) is the single source of visual primitives — pages compose these rather than hand-rolling styled markup. Tokens (radius, shadow, spacing, color, focus rings) are defined in `tailwind.config.js` and `src/index.css`. Full rationale and the original migration plan are documented in `docs/superpowers/plans/2026-08-06-app-redesign.md`.

### Path alias

`@/*` resolves to `src/*` (see `tsconfig.json` / `vite.config.ts`).

## Deployment

`npm run deploy` builds and publishes `dist/` to GitHub Pages via `gh-pages`. A GitHub Actions workflow (`.github/workflows/deploy.yml`) also builds on push to `main` and deploys to GitHub Pages using `peaceiris/actions-gh-pages`.
