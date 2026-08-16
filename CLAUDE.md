# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps
npm run dev           # Vite dev server (port 3000, falls back to next free port)
npm run build          # tsc typecheck + vite production build
npm run lint            # eslint, zero-warnings gate (--max-warnings 0)
npm run preview          # serve the built dist/ locally
npm run deploy            # build + publish dist/ to GitHub Pages (gh-pages)
```

There is no test suite/runner configured in this repo (no test script, no test files).

Note: `vite.config.ts` sets `base: '/StartupFrontend/'` for GitHub Pages deployment, so the local dev server is served under that path, e.g. `http://localhost:3000/StartupFrontend/` — the bare root URL 404s.

## Architecture

React 18 + TypeScript + Vite SPA, client-side routed with `react-router-dom`. State is Zustand, API access is a single Axios instance, styling is Tailwind with a token system enforced via a shared component library.

### Routing & layouts (`src/App.tsx`)

Three route groups, each with a different shell:
- **Landing pages** (`/`, `/features`, `/pricing`) — no shared layout; each page renders its own header/footer via `src/components/landing/`.
- **Auth pages** (`/login`, `/register`) — wrapped in `AuthLayout`.
- **Dashboard pages** (`/dashboard`, `/goods`, `/seo`, `/infographics`, `/reports`, `/profile`, `/settings`) — wrapped in `MainLayout` (sidebar nav) and gated by a `ProtectedRoute` that checks `useAuthStore().isAuthenticated`, redirecting to `/login` when not authenticated.

`App` calls `useAuthStore().loadUser()` on mount and blocks rendering behind a full-screen spinner until that resolves.

### Auth state (`src/store/authStore.ts`)

Single Zustand store (`useAuthStore`), persisted to `localStorage` under `auth-storage` (only `user` and `isAuthenticated` are persisted — the JWT itself lives separately in `localStorage` under `access_token`, read directly by the Axios client, not by the store). `loadUser()` treats a missing/invalid token as logged-out rather than erroring.

### API layer (`src/api/`)

`client.ts` is the single Axios instance every API module (`auth.ts`, `goods.ts`, `infographics.ts`, `reports.ts`, `seo.ts`) imports and calls through — don't instantiate Axios elsewhere. It:
- injects `Authorization: Bearer <token>` from `localStorage['access_token']` on every request,
- on a `401` response, clears the stored token (but does not redirect — callers/store handle that).

Base URL comes from `VITE_API_BASE_URL` (see `.env.example`), defaulting to `http://localhost:8000`. In dev, `vite.config.ts` also proxies `/api` to that same backend to avoid CORS.

Request/response shapes are typed in `src/api/types.ts` and `src/types/*.ts` — reuse those rather than redefining ad hoc interfaces per page.

### Design system & component library (`src/components/ui/`, `src/components/landing/`)

This app went through a deliberate "clean editorial" design-token pass (see `docs/superpowers/plans/2026-08-06-app-redesign.md` for the full rationale/history). The rules that came out of it still govern how UI code should be written here:

- **Tokens live in `tailwind.config.js` (`theme.extend`) and the base layer of `src/index.css`** — not as scattered raw utility classes, and not as parallel CSS custom properties (Tailwind config is the single source of truth).
- **`src/components/ui/` (barrelled via `index.ts`) is the only source of visual primitives**: `Button`, `Card`, `FormField`, `Alert`, `Badge`, `Switch`, `ConfirmDialog`, `Table`, `StatTile`, `SelectableImageGrid`, `Avatar`, `DropdownMenu`. Pages must compose these rather than hand-rolling equivalent markup/classNames (e.g. a raw `<button className="bg-blue-600 ...">` should be `<Button variant="...">`; a raw error banner should be `<Alert variant="error">`). `src/components/landing/` holds the marketing-only `LandingHeader`/`LandingFooter`.
- Locked-in tokens: `rounded-md` for buttons/inputs/badges/small cards, `rounded-lg` max for large containers (modals, hero panels — avatars keep `rounded-full` as a deliberate exception); no static shadows (border only; `shadow-sm` max on hover-interactive surfaces, never `shadow-lg`/`xl`/`2xl`); `py-16 md:py-24` for marketing section padding; `font-semibold` for H1 (not `font-extrabold`); `p-6` uniform card padding; accent colors `blue-600` (primary) / `red-600` (destructive) / `green-600` (success) expressed only through component variants, never raw classes at call sites; every focusable element gets a `:focus-visible` ring globally.
- Class merging goes through `src/utils/cn.ts` (`clsx` + `tailwind-merge`), and variant-based components use `class-variance-authority`. Radix UI (`react-dialog`, `react-dropdown-menu`) backs `ConfirmDialog` and `DropdownMenu` for accessible focus-trap/portal behavior.

### Path alias

`@/*` resolves to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`) — use it instead of relative `../../` imports.

### Language note

UI copy, comments, and commit-adjacent docs in this codebase are predominantly in Russian (the product's target market). Match existing language conventions per file rather than translating wholesale.
