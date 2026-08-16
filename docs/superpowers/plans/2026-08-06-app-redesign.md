# ProSkladAI App-Wide Redesign & Code Quality Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the app's ad-hoc, duplicated styling with a single "clean editorial" token system and a real shared-component library, applied consistently to every page, while fixing the accessibility, state-management-duplication, and dead-code issues found in the prior audit — without touching backend contracts or working business logic.

**Architecture:** Tokens live in `tailwind.config.js` + `src/index.css` (global base layer only — no more `@layer components` utility classes standing in for real components). All visual primitives (Button, Card, Input/FormField, Alert, Badge, Switch, ConfirmDialog, Table, SelectableImageGrid, LandingHeader/Footer) live in `src/components/ui/` and `src/components/landing/` and are the *only* source of truth pages may style from — no page hand-rolls a card/button/badge className again. Pages are migrated one at a time, each ending in its own commit.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, `class-variance-authority`, `clsx`/`tailwind-merge`, Zustand, Radix UI primitives (adding `@radix-ui/react-dialog`), `lucide-react`.

## Global Constraints

- No backend/API contract changes. Any UI improvement that would require a new/changed backend endpoint is **not implemented** — it is listed in the final summary instead.
- No new dependencies beyond `@radix-ui/react-dialog` (justification: accessible focus-trap/portal/ESC-close modal, same family as the already-used `@radix-ui/react-dropdown-menu`; hand-rolling this correctly is error-prone and this is the only primitive in scope that genuinely needs it). Any other new dependency must be listed with reason in the final summary, not silently added.
- Do not rewrite working business logic (API call sequencing, validation rules, data shapes). This is a design + code-quality pass. Where a "fix" would actually be a product/business decision (e.g., a stub save action that fakes success), leave the behavior as-is, apply tokens/accessibility only, and flag it explicitly in the final summary as a judgment call.
- One commit per task (matches "one per section").
- Verify every redesigned page at three viewport widths: 375px (mobile), 768px (tablet), 1440px (desktop).
- Text contrast must meet WCAG AA (4.5:1 normal text, 3:1 large text/UI components).
- Every list/data view: loading, empty, and error states. Every form: inline validation + accessible error display. Every async action (save/delete/generate/etc.): visible pending state (disabled control + spinner or equivalent).
- Semantic HTML first (`button`, `a`, `label`, `table`, headings in order); ARIA only to fill real gaps (custom widgets like the Switch). All interactive elements keyboard-operable with a visible focus ring.
- **STOP GATE:** Task 13 (auth state consolidation) modifies how authentication state flows through the app. Per your instruction to always stop before auth-related changes, execution pauses before Task 13 specifically for a go/no-ahead, even though the rest of the plan runs autonomously. No other task touches auth logic, tokens, storage, or the API layer.
- Design source of truth for all tokens below was approved in-conversation (Approach B, "grid-based editorial") — this plan is also the design spec; no separate spec doc.
- **Judgment call on "CSS variables":** tokens are implemented via `tailwind.config.js` `theme.extend` (Task 2), not literal CSS custom properties. This is the idiomatic mechanism for a Tailwind project — adding parallel `--css-vars` that just mirror the Tailwind config would be redundant (YAGNI) since nothing in this codebase consumes raw CSS outside Tailwind's utility layer. Flagged for the final summary.

## Design Tokens (locked in — apply verbatim everywhere)

| Token | Old convention (inconsistent) | New value |
|---|---|---|
| Button/input/card radius | `rounded-lg` / `rounded-2xl` / `rounded-full` mixed | `rounded-md` (buttons, inputs, badges, small cards); `rounded-lg` max (large containers: modals, hero panels). Avatar keeps `rounded-full` (circular avatars are a deliberate, noted exception). |
| Shadow | `shadow-sm` → `shadow-2xl` mixed, heavy | Static: none (border only). Hover-interactive surfaces: `shadow-sm` max. No `shadow-lg`/`shadow-xl`/`shadow-2xl` anywhere. |
| Section vertical padding | `py-16`–`py-20` mixed | `py-16 md:py-24` for marketing sections. |
| H1 | `font-extrabold` | `font-semibold` (confident through scale, not weight) |
| Card padding | `p-5`/`p-6` mixed | `p-6` uniformly (via `<Card>`) |
| Accent color | blue-600 (keep) | unchanged: `blue-600` primary accent; `red-600` destructive; `green-600` success — now only expressed through component variants, never raw classes at call sites |
| Focus ring | inconsistent/missing on hand-rolled buttons | global: every focusable element gets `outline-none ring-2 ring-blue-500 ring-offset-2` on `:focus-visible`, applied once in base layer |

## Migration Rules (apply by reference from every page task — do not re-derive per page)

1. Any container matching the pattern `bg-white dark:bg-gray-800 ... rounded-xl|rounded-2xl shadow-sm border border-gray-100|200 dark:border-gray-700 p-5|p-6` → replace with `<Card>` (Task 5).
2. Any hand-rolled primary/secondary/destructive/ghost/outline button (raw `<button className="inline-flex ... bg-blue-600 ...">` or `<a>` styled the same way) → replace with `<Button variant="...">` (Task 3). Preserve the exact existing `onClick`/`href`/`disabled`/`type` behavior.
3. Any error/success banner (`bg-red-50 ... AlertCircle` / `bg-green-50 ... CheckCircle`) → replace with `<Alert variant="error|success">` (Task 6), which owns `role="alert" aria-live="polite"` internally.
4. Any `<div>`/`<label>` + `<input|select|textarea>` pair → replace with `<FormField>` (Task 4), which owns label association (`htmlFor`/`id`), error text, and `aria-invalid`/`aria-describedby` internally. Generate a stable `id` from the field name.
5. Any `<div onClick=...>` acting as a clickable control (selectable image tile, custom toggle) → either becomes a real `<button>`, or — if it must stay a `div` for layout reasons — gets `role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handler()}`.
6. Any icon-only button → keep `title` (mouse tooltip) but add `aria-label` with the same text (screen readers don't reliably expose `title`).
7. Any delete-confirmation modal → replace with `<ConfirmDialog>` (Task 9).
8. Any stat number / count display in a colored box → `<StatTile>` (Task 7).
9. Any inline "badge" pill (feature-included checkmark, "popular" flag, category tag) → `<Badge variant="...">` (Task 7).
10. Any `<table>` markup → wrap via `<Table>` (Task 10), which owns the `overflow-x-auto` wrapper and header `scope="col"`.
11. Delete every unused import discovered in the prior audit as part of touching that file (list is in each page task).
12. Replace `any`-typed state with the real type from `@/api/types` where the audit flagged it.

---

### Task 1: ESLint config (verification tooling)

**Files:**
- Create: `.eslintrc.cjs`

**Interfaces:** none (standalone tooling file).

- [ ] **Step 1: Create the config**

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
```

- [ ] **Step 2: Run it**

Run: `npm run lint`
Expected: completes (warnings are fine — the goal is that the command runs at all; it will currently show a large number of `no-unused-vars`/`no-explicit-any` warnings from existing files, which later tasks reduce). If it errors out instead of completing, fix the config (most likely cause: a plugin version mismatch — check `package.json` devDependencies match what's `extends`ed).

- [ ] **Step 3: Commit**

```bash
git add .eslintrc.cjs
git commit -m "chore: add missing eslint config so npm run lint works"
```

---

### Task 2: Design tokens — Tailwind config + global CSS

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Produces: global `:focus-visible` ring (no component needs to add its own focus-ring classes going forward — Task 3+ components still include `focus-visible:` classes explicitly for editor clarity, but the base-layer rule is the safety net for anything hand-rolled that's missed).

- [ ] **Step 1: Update `tailwind.config.js`** — add explicit `borderRadius` and `boxShadow` scale entries so the tokens above are named, not just used as raw utilities:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        gray: {
          50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af',
          500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712',
        },
      },
      borderRadius: {
        DEFAULT: '0.375rem', // rounded-md — buttons, inputs, badges, small cards
        lg: '0.5rem',        // large containers only: modals, hero panels
      },
      boxShadow: {
        DEFAULT: '0 1px 2px rgba(0, 0, 0, 0.04)', // hover-only, applied via component, never static
      },
    },
  },
  plugins: [],
};
```

Note: this deliberately removes the old `2xl`/`3xl` radius overrides, the `apple`/`apple-lg` shadow tokens, and the `fade-in`/`appear` keyframes/animation entries — none are referenced once Task 2's `index.css` rewrite (next step) removes the `.animate-fade-in`/`.animate-appear` classes that used them. Confirm with `grep -rn "animate-fade-in\|animate-appear\|shadow-apple\|rounded-3xl\|rounded-2xl" src/` before deleting — if any page still references them, that page's redesign task (Tasks 15–27) must remove the reference in the same commit as that page, not here. Since Tasks 15-27 run after this one and are required to migrate off these classes as part of applying tokens, it's fine for the classes to be visually "wrong" (falling back to Tailwind's built-in `rounded-2xl`/`rounded-3xl` utilities, which still exist as core Tailwind utilities, not custom ones — only the *custom* `apple`/`fade-in` tokens actually disappear) in the interim.

- [ ] **Step 2: Rewrite `src/index.css`** — remove the entire "Apple-style" `@layer components` block (`.btn-apple`, `.btn-apple-ghost`, `.card-apple`, `.divider-apple`, `.badge-apple`, `.bg-apple-gradient`, `.shadow-apple`, `.animate-fade-in`) and the "shadcn overrides" block (`.btn-primary`, `.btn-outline`, `.btn-ghost`, `.card`, `.card-header`, `.card-content`, `.card-footer`, `.input`) — these are being replaced by real React components (Tasks 3–10) as the single source of truth. Keep and adjust the base layer:

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    @apply bg-white text-gray-900;
    line-height: 1.5;
  }

  h1 { @apply text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight; }
  h2 { @apply text-3xl md:text-4xl font-semibold tracking-tight; }
  h3 { @apply text-2xl md:text-3xl font-semibold tracking-tight; }
  h4 { @apply text-xl md:text-2xl font-semibold tracking-tight; }

  a { @apply text-blue-600 transition-colors duration-200; }
  a:hover { @apply text-blue-700; }

  /* Single global focus-visible treatment — the safety net for every interactive element */
  :focus-visible {
    @apply outline-none ring-2 ring-blue-500 ring-offset-2;
  }

  input, select, textarea {
    @apply border border-gray-200 rounded px-4 py-3 text-base transition-colors duration-200 bg-white;
  }
  input:focus, select:focus, textarea:focus {
    @apply border-blue-500;
  }

  button { @apply transition-colors duration-200; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c1c1c6; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #a0a0a5; }
  * { scrollbar-width: thin; scrollbar-color: #c1c1c6 transparent; }

  .dark body { @apply bg-gray-900 text-gray-100; }
  .dark input, .dark select, .dark textarea { @apply bg-gray-800 border-gray-700 text-white; }
  .dark ::-webkit-scrollbar-thumb { background: #4a4a4e; }
  .dark ::-webkit-scrollbar-thumb:hover { background: #5e5e62; }
  .dark * { scrollbar-color: #4a4a4e transparent; }
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds (visual regressions in pages are expected and fixed by Tasks 15–27, not this task — this task only needs to not break the build).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "feat(tokens): establish editorial design token system, remove ad-hoc Apple CSS classes"
```

---

### Task 3: Button primitive update

**Files:**
- Modify: `src/components/ui/button.tsx`

**Interfaces:**
- Produces: `<Button variant="default"|"destructive"|"outline"|"secondary"|"ghost"|"link" size="default"|"sm"|"lg"|"icon" isLoading?: boolean>` — same props as before, plus new `isLoading` which disables the button and swaps content for a spinner + preserves accessible label via `aria-busy`.

- [ ] **Step 1: Update the component**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-700",
        link: "text-blue-600 hover:underline",
      },
      size: {
        default: "h-10 py-2 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors (no existing callers pass `isLoading`, so this is additive).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat(ui): apply editorial tokens to Button, add isLoading state"
```

---

### Task 4: FormField primitive (Input, Textarea, Select + label wrapper)

**Files:**
- Create: `src/components/ui/form-field.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<FormField id: string, label: string, error?: string | null, hint?: string, required?: boolean, children: (fieldProps: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => React.ReactNode>` — render-prop so it works with `<input>`, `<select>`, or `<textarea>` alike.
- Produces: `<Input>`, `<Textarea>`, `<Select>` — thin styled wrappers around the native elements, tokens applied, forwardRef'd.

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/form-field.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: (fieldProps: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, error, hint, required, children }) => {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

const fieldClassName = "w-full border border-gray-200 dark:border-gray-700 rounded px-4 py-2.5 text-base bg-white dark:bg-gray-800 dark:text-white transition-colors focus:border-blue-500 aria-[invalid=true]:border-red-500";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClassName, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClassName, className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClassName, className)} {...props} />
  )
);
Select.displayName = "Select";
```

- [ ] **Step 2: Export from index**

Modify `src/components/ui/index.ts`, add: `export * from "./form-field";`

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/form-field.tsx src/components/ui/index.ts
git commit -m "feat(ui): add FormField/Input/Textarea/Select primitives with built-in label association"
```

---

### Task 5: Card primitive

**Files:**
- Create: `src/components/ui/card.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<Card className?>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>`, `<CardFooter>` — all plain `div`/`h3` wrappers, `className` passthrough via `cn`.

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/card.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow transition-shadow",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pt-6 pb-0", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pb-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
```

- [ ] **Step 2: Export** — add `export * from "./card";` to `src/components/ui/index.ts`

- [ ] **Step 3: Verify** — `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/card.tsx src/components/ui/index.ts
git commit -m "feat(ui): add Card primitive to replace ~20 duplicated card blocks"
```

---

### Task 6: Alert primitive

**Files:**
- Create: `src/components/ui/alert.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<Alert variant="error"|"success"|"info">{children}</Alert>` — internally sets `role="alert"` (error) or `role="status"` (success/info) and `aria-live="polite"`.

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/alert.tsx
import * as React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

const variantConfig = {
  error: { icon: AlertCircle, classes: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40", role: "alert" as const },
  success: { icon: CheckCircle, classes: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40", role: "status" as const },
  info: { icon: Info, classes: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40", role: "status" as const },
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: keyof typeof variantConfig;
}

export const Alert: React.FC<AlertProps> = ({ variant, className, children, ...props }) => {
  const { icon: Icon, classes, role } = variantConfig[variant];
  return (
    <div
      role={role}
      aria-live="polite"
      className={cn("flex items-start gap-3 p-4 rounded border text-sm", classes, className)}
      {...props}
    >
      <Icon size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
};
```

- [ ] **Step 2: Export** — add `export * from "./alert";` to `src/components/ui/index.ts`

- [ ] **Step 3: Verify** — `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/alert.tsx src/components/ui/index.ts
git commit -m "feat(ui): add Alert primitive with built-in aria-live, replaces 5 duplicated banners"
```

---

### Task 7: Badge + StatTile primitives

**Files:**
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/stat-tile.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<Badge variant="default"|"success"|"warning"|"neutral">{children}</Badge>`
- Produces: `<StatTile label: string, value: string | number, icon?: React.ReactNode>`

- [ ] **Step 1: Create `badge.tsx`**

```tsx
// src/components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        success: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        neutral: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant, className }))} {...props} />
);
```

- [ ] **Step 2: Create `stat-tile.tsx`**

```tsx
// src/components/ui/stat-tile.tsx
import * as React from "react";
import { Card, CardContent } from "./card";

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, icon }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      {icon && <div className="text-blue-600 dark:text-blue-400" aria-hidden="true">{icon}</div>}
    </CardContent>
  </Card>
);
```

- [ ] **Step 3: Export both** — add to `src/components/ui/index.ts`: `export * from "./badge";` and `export * from "./stat-tile";`

- [ ] **Step 4: Verify** — `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/badge.tsx src/components/ui/stat-tile.tsx src/components/ui/index.ts
git commit -m "feat(ui): add Badge and StatTile primitives"
```

---

### Task 8: Switch primitive

**Files:**
- Create: `src/components/ui/switch.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<Switch checked: boolean, onCheckedChange: (checked: boolean) => void, label: string, id: string>` — renders a real `<button role="switch">`, label is visually rendered and linked via `aria-labelledby` (not `aria-label`, so the visible text and accessible name stay in sync).

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/switch.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange, label, description }) => {
  const labelId = `${id}-label`;
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p id={labelId} className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Export** — add `export * from "./switch";` to `src/components/ui/index.ts`

- [ ] **Step 3: Verify** — `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/switch.tsx src/components/ui/index.ts
git commit -m "feat(ui): add accessible Switch primitive (role=switch, aria-checked)"
```

---

### Task 9: ConfirmDialog primitive (new dependency: @radix-ui/react-dialog)

**Files:**
- Modify: `package.json` (add dependency)
- Create: `src/components/ui/confirm-dialog.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<ConfirmDialog open: boolean, onOpenChange: (open: boolean) => void, title: string, description: string, confirmLabel?: string, onConfirm: () => void, isDestructive?: boolean>`

- [ ] **Step 1: Install the dependency**

Run: `npm install @radix-ui/react-dialog`
Expected: adds one entry to `dependencies` in `package.json` and `package-lock.json`.

- [ ] **Step 2: Create the component**

```tsx
// src/components/ui/confirm-dialog.tsx
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, onOpenChange, title, description, confirmLabel = "Подтвердить", onConfirm, isDestructive = true,
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3">
          {isDestructive && (
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle size={20} aria-hidden="true" />
            </div>
          )}
          <div>
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</Dialog.Description>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Dialog.Close asChild>
            <Button variant="outline">Отмена</Button>
          </Dialog.Close>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

- [ ] **Step 3: Export** — add `export * from "./confirm-dialog";` to `src/components/ui/index.ts`

- [ ] **Step 4: Verify** — `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/ui/confirm-dialog.tsx src/components/ui/index.ts
git commit -m "feat(ui): add ConfirmDialog primitive using @radix-ui/react-dialog, replaces 2 duplicated delete modals"
```

---

### Task 10: Table primitive

**Files:**
- Create: `src/components/ui/table.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead scope="col">`, `<TableCell>` — thin semantic wrappers, `Table` owns the `overflow-x-auto` scroll container.

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/table.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full text-sm text-left", className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => (
  <thead className="border-b border-gray-200 dark:border-gray-700" {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => (
  <tbody className="divide-y divide-gray-100 dark:divide-gray-800" {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn("hover:bg-gray-50 dark:hover:bg-gray-700/50", className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th scope="col" className={cn("px-4 py-3 font-medium text-gray-500 dark:text-gray-400", className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn("px-4 py-3 text-gray-900 dark:text-gray-100", className)} {...props} />
);
```

- [ ] **Step 2: Export** — add `export * from "./table";` to `src/components/ui/index.ts`

- [ ] **Step 3: Verify** — `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/table.tsx src/components/ui/index.ts
git commit -m "feat(ui): add semantic Table primitive with overflow wrapper"
```

---

### Task 11: SelectableImageGrid primitive

**Files:**
- Create: `src/components/ui/selectable-image-grid.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `<SelectableImageGrid images: string[], selected: string[], onToggle: (url: string) => void, getAlt: (url: string) => string>` — each tile is a real `<button>` (fixes the keyboard-inaccessible `<div onClick>` pattern found in `GoodsDetailPage.tsx` and `InfographicsPage.tsx`).

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/selectable-image-grid.tsx
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectableImageGridProps {
  images: string[];
  selected: string[];
  onToggle: (url: string) => void;
  getAlt: (url: string) => string;
}

export const SelectableImageGrid: React.FC<SelectableImageGridProps> = ({ images, selected, onToggle, getAlt }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {images.map((url) => {
      const isSelected = selected.includes(url);
      return (
        <button
          key={url}
          type="button"
          onClick={() => onToggle(url)}
          aria-pressed={isSelected}
          className={cn(
            "relative aspect-square rounded overflow-hidden border-2 transition-colors",
            isSelected ? "border-blue-600" : "border-transparent hover:border-gray-300"
          )}
        >
          <img src={url} alt={getAlt(url)} className="w-full h-full object-cover" />
          {isSelected && (
            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Check size={14} aria-hidden="true" />
            </span>
          )}
        </button>
      );
    })}
  </div>
);
```

- [ ] **Step 2: Export** — add `export * from "./selectable-image-grid";` to `src/components/ui/index.ts`

- [ ] **Step 3: Verify** — `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/selectable-image-grid.tsx src/components/ui/index.ts
git commit -m "feat(ui): add keyboard-accessible SelectableImageGrid, fixes non-focusable image tiles"
```

---

### Task 12: LandingHeader + LandingFooter shared components

**Files:**
- Create: `src/components/landing/LandingHeader.tsx`
- Create: `src/components/landing/LandingFooter.tsx`

**Interfaces:**
- Produces: `<LandingHeader />` (no props — same on every marketing page), `<LandingFooter />` (no props).
- Fixes: the audit-confirmed inconsistent footer links (`Link to="#"` instead of `/features`/`/pricing` on Home and Features pages) by having exactly one implementation.

- [ ] **Step 1: Create `LandingHeader.tsx`**

```tsx
// src/components/landing/LandingHeader.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

const LandingHeader: React.FC = () => (
  <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-semibold text-lg">P</div>
        <span className="text-xl font-semibold text-gray-800 dark:text-white">Proskladai</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Возможности</Link>
        <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Цены</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Войти
        </Link>
        <Button asChild size="sm">
          <Link to="/register">Начать бесплатно</Link>
        </Button>
      </div>
    </div>
  </header>
);

export default LandingHeader;
```

Note: `Button asChild` renders a `<span>` per the existing implementation (Task 3 didn't change this) — with `asChild`, wrap the `<Link>` as the child so the click target is the router link and the styling comes from `Button`. This matches the existing `asChild` contract in `button.tsx`.

- [ ] **Step 2: Create `LandingFooter.tsx`**

```tsx
// src/components/landing/LandingFooter.tsx
import React from "react";
import { Link } from "react-router-dom";

const LandingFooter: React.FC = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-semibold">P</div>
            <span className="text-white text-lg font-semibold">Proskladai</span>
          </div>
          <p className="text-sm">Автоматизация SEO и инфографики для маркетплейсов.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Продукт</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/features" className="hover:text-white transition-colors">Возможности</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Цены</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Поддержка</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://t.me/ProskladaiBot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram-бот</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Юридическое</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Политика конфиденциальности</li>
            <li>Условия использования</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
        &copy; {new Date().getFullYear()} Proskladai. Все права защищены.
      </div>
    </div>
  </footer>
);

export default LandingFooter;
```

Note on the "Юридическое" column: the audit found `/privacy` and `/terms` are linked but not real routes (404). Rather than leave a broken link (frontend-only "fix" would just be removing the link, which is a product-content decision) or inventing new legal pages/routes (out of scope, not requested), this renders the labels as plain text instead of dead links. This removal-of-a-broken-link is noted in the final summary as a judgment call.

- [ ] **Step 3: Verify** — `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/LandingHeader.tsx src/components/landing/LandingFooter.tsx
git commit -m "feat(landing): extract shared LandingHeader/LandingFooter, fixes inconsistent footer links"
```

---

### ⚠️ STOP GATE — confirm before Task 13

Task 13 changes how authentication state flows through the app (consolidating two parallel systems). Per your rule, execution pauses here for explicit go-ahead even in autonomous mode. Everything above (Tasks 1–12) and everything from Task 14 onward does not touch auth and does not require a pause.

---

### Task 13: Consolidate auth state (remove duplicate `useAuth` hook)

**Files:**
- Modify: `src/layouts/MainLayout.tsx` (currently imports `useAuth` from `@/hooks/useAuth`)
- Modify: `src/pages/Dashboard/DashboardPage.tsx` (same)
- Modify: `src/pages/Dashboard/ProfilePage.tsx` (same)
- Delete: `src/hooks/useAuth.ts`

**Interfaces:**
- Consumes: `useAuthStore()` from `src/store/authStore.ts` — already produces `{ user, isLoading, error, isAuthenticated, login, register, logout, setUser, clearError, loadUser }` (unchanged, this task only changes which pages call it).
- Produces: nothing new — this task removes a duplicate, it doesn't add an interface.

Why this is safe: `App.tsx` already calls `loadUser()` from `useAuthStore` once on mount (`App.tsx:52-57`), so `user`/`isAuthenticated` are already populated in the store by the time any page under `ProtectedRoute` renders — the three files below currently re-fetch the same `/auth/me` independently via the `useAuth` hook's own `useEffect`, which this task removes as pure redundant duplication, not a behavior change to what the user sees.

- [ ] **Step 1: Update `MainLayout.tsx`**

Change:
```tsx
import { useAuth } from '@/hooks/useAuth';
```
to:
```tsx
import { useAuthStore } from '@/store/authStore';
```
Change the line `const { user, logout } = useAuth();` to `const { user, logout } = useAuthStore();`. No other line in this file references `useAuth`, so no further changes needed in this file.

- [ ] **Step 2: Update `DashboardPage.tsx`**

Find the `useAuth` import and destructure call (per the audit, at `DashboardPage.tsx:4,60`) and apply the same replacement as Step 1: import `useAuthStore` from `@/store/authStore` instead of `useAuth` from `@/hooks/useAuth`, and swap the hook call. If this file destructures anything beyond `user` from the hook (e.g. `loading`), confirm `useAuthStore` exposes an equivalent field (`isLoading`) and rename the destructured variable accordingly at the call site only — do not change how that variable is used elsewhere in the file.

- [ ] **Step 3: Update `ProfilePage.tsx`**

Same replacement as Step 1/2, per the audit at `ProfilePage.tsx:3,38`.

- [ ] **Step 4: Delete the dead hook**

Run: `rm "src/hooks/useAuth.ts"`

- [ ] **Step 5: Verify no remaining references**

Run: `grep -rn "hooks/useAuth" src/`
Expected: no output (zero matches).

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed.

- [ ] **Step 6: Manual check**

Start `npm run dev`, log in, confirm the header shows the logged-in user's name/email (MainLayout), confirm Dashboard and Profile pages still show the correct user, confirm logout still works and redirects to `/login`.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/MainLayout.tsx src/pages/Dashboard/DashboardPage.tsx src/pages/Dashboard/ProfilePage.tsx
git rm src/hooks/useAuth.ts
git commit -m "refactor: consolidate auth state onto useAuthStore, remove duplicate useAuth hook

Two unsynced sources of truth for the current user existed (Zustand
authStore vs a separate useAuth hook that independently re-fetched
/auth/me on every mount). Login flow and App.tsx already used
authStore; this migrates the remaining three consumers so there is
exactly one."
```

---

### Task 14: Remove dead `goodsStore.ts`

**Files:**
- Delete: `src/store/goodsStore.ts`

**Interfaces:** none — confirmed zero importers (`grep -rn "goodsStore\|useGoodsStore" src/` outside the file itself returns nothing per the audit). The actually-used implementation is `src/hooks/useGoods.ts`, which stays exactly as-is — this task removes only the unused parallel implementation, per "delete dead code," not a state-management migration.

- [ ] **Step 1: Confirm still unused**

Run: `grep -rn "goodsStore\|useGoodsStore" src/`
Expected: only matches inside `src/store/goodsStore.ts` itself (i.e., no importers). If anything else matches, stop and investigate before deleting — do not delete a file something now depends on.

- [ ] **Step 2: Delete**

Run: `rm "src/store/goodsStore.ts"`

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed (proves nothing referenced it).

- [ ] **Step 4: Commit**

```bash
git rm src/store/goodsStore.ts
git commit -m "chore: remove unused goodsStore.ts (dead code, no importers)"
```

---

### Task 15: Auth pages — AuthLayout, LoginPage, RegisterPage

**Files:**
- Modify: `src/layouts/AuthLayout.tsx`
- Modify: `src/pages/Auth/LoginPage.tsx`
- Modify: `src/pages/Auth/RegisterPage.tsx`

**Interfaces:**
- Consumes: `FormField`, `Input`, `Button`, `Alert` from `@/components/ui`.

- [ ] **Step 1: `AuthLayout.tsx`** — apply Migration Rules: reduce container rounding (`rounded-2xl`→`rounded-lg`, logo mark `rounded-2xl`→`rounded`), remove `shadow-2xl`→`shadow-sm`. Fix heading hierarchy: this layout currently renders "Proskladai" as `<h2>` (line 16) with no `<h1>` anywhere on `/login` or `/register` (audit finding). Change the "Proskladai" heading to `<h1>` here in the shared layout, which means the page-level "Вход в аккаунт"/"Регистрация" heading (in `LoginPage.tsx`/`RegisterPage.tsx`) must become `<h2>` (Step 2/3 below) to keep exactly one `<h1>` per page.

- [ ] **Step 2: `LoginPage.tsx`** — three changes:
  1. Replace the two `<div><label>...</label><input .../></div>` blocks with `<FormField id="email" label="Email" error={...}>{(f) => <Input type="email" {...f} .../>}</FormField>` (and the same for password with `id="password"`), using Migration Rule 4. This fixes the audit's confirmed missing `htmlFor`/`id` association.
  2. Change the page title element from `<h2>` to `<h3>` visually-styled-as-a-subheading (since `<h1>` now lives in `AuthLayout`) — keep the same visible text and font-size classes, just correct the semantic level so heading order is `h1` (site name) → `h3`... actually use `<h2>` here since it's the next level after the layout's new `<h1>` — do not skip a level.
  3. Change the error paragraph (`<p>{error}</p>`) to use `<Alert variant="error">{error}</Alert>` (Migration Rule 3) instead — this both fixes styling consistency and adds the `aria-live` the audit found missing.
  4. Replace the submit `<button>` with `<Button type="submit" isLoading={isLoading} className="w-full">Войти</Button>` (Migration Rule 2), removing the manual `Loader2` JSX now handled by `Button`.

- [ ] **Step 3: `RegisterPage.tsx`** — same four changes as Step 2, applied to all 4 fields (full name, email, password, confirm password), plus one bug fix required by the Global Constraints "every form gets validation and error display" rule: the audit found that when `password !== confirmPassword`, the handler currently does `return` with a comment "можно добавить локальную ошибку" (could add a local error) and shows nothing. Add local component state `const [localError, setLocalError] = useState<string | null>(null);`, set it to `'Пароли не совпадают'` in that branch instead of silently returning, clear it at the start of every submit attempt, and render it via the same `<Alert variant="error">` used for the API error (show whichever of `localError`/API `error` is set). This is a pure frontend validation-display fix, not a business-logic change — the validation rule (`password !== confirmPassword`) already existed and already blocked submission; only the missing user-facing message is added.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`

Start `npm run dev`. Using claude-in-chrome (or manual browser check if unavailable): navigate to `/login` and `/register` at viewport widths 375px, 768px, 1440px — confirm no horizontal overflow, form is usable, tab order goes logo → nav-less (no header nav on this layout) → email → password → submit → footer links. Confirm clicking the label text focuses the corresponding input (validates the `htmlFor`/`id` fix). Submit RegisterPage with mismatched passwords and confirm the error now displays.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/AuthLayout.tsx src/pages/Auth/LoginPage.tsx src/pages/Auth/RegisterPage.tsx
git commit -m "feat(auth-pages): apply editorial tokens, fix label association, heading hierarchy, and silent password-mismatch bug"
```

---

### Task 16: Home page full redesign

**Files:**
- Modify: `src/pages/Landing/HomePage.tsx`

**Interfaces:**
- Consumes: `LandingHeader`, `LandingFooter` from `@/components/landing`, `Button` from `@/components/ui`.

- [ ] **Step 1: Replace the header/footer** — delete the inline `<header>...</header>` block (old lines 20-45) and `<footer>...</footer>` block (old lines 216-258), replace with `<LandingHeader />` and `<LandingFooter />`.

- [ ] **Step 2: Redesign the hero** — remove the badge pill (`inline-flex ... rounded-full bg-blue-50 ...`), remove the gradient illustration panel and the two decorative blurred blobs (`absolute ... blur-3xl`) entirely (Approach B calls for flatter hero, no gradient decoration). Replace with:

```tsx
<section className="py-16 md:py-24 border-b border-gray-100 dark:border-gray-800">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 tracking-wide uppercase">
          AI-автоматизация для маркетплейсов
        </p>
        <h1 className="max-w-xl">
          Оптимизируйте карточки товаров{' '}
          <span className="text-blue-600 dark:text-blue-400">в 2 клика</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
          Генерация SEO-текстов и поиск релевантной инфографики с помощью нейросетей.
          Увеличьте продажи без лишних затрат.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link to="/register">Зарегистрироваться <ArrowRight size={20} className="ml-2" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://t.me/ProskladaiBot" target="_blank" rel="noopener noreferrer">
              Попробовать бота <ArrowRight size={20} className="ml-2" />
            </a>
          </Button>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-600" />Бесплатный пробный период</span>
          <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-600" />Без карты</span>
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">📦</div>
        <h3 className="text-xl">Proskladai Bot</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">SEO + инфографика за секунды</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Redesign the features section as a numbered editorial list** (Approach B: replace icon-in-colored-box cards with a numbered list, per the approved foundation direction), removing the `bg-gray-50` section background (flat, not banded):

```tsx
<section className="py-16 md:py-24">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="max-w-2xl mb-16">
      <h2>Всё, что нужно для идеальной карточки товара</h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        Нейросети и умные алгоритмы автоматизируют рутинные задачи, чтобы вы сосредоточились на развитии бизнеса.
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
      {features.map((feature, index) => (
        <div key={feature.title} className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <span className="text-sm font-medium text-gray-400">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="text-xl mt-2">{feature.title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```
Remove the now-unused `icon` field from the `features` data array (and its now-unused `ImageIcon`/`BarChart3`/`FileText` icon imports if nothing else in the file uses them — verify with `grep` before removing each import).

- [ ] **Step 4: Redesign "how it works"** — keep the 3-step structure, remove the filled blue circle number badges (`bg-blue-600 rounded-full`) and the connecting line, replace with the same numbered-label style as Step 3 for visual consistency:

```tsx
<section className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="max-w-2xl mb-16">
      <h2>Как это работает</h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Три простых шага до готовой оптимизированной карточки</p>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      {steps.map((step, index) => (
        <div key={step.title}>
          <span className="text-sm font-medium text-gray-400">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="text-xl mt-2">{step.title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Redesign stats** — replace the solid `bg-blue-600` band with inline typographic numbers on a plain background (Approach B: "stats band → inline typographic numbers"):

```tsx
<section className="py-16 border-t border-gray-100 dark:border-gray-800">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="text-4xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Redesign the CTA section** — remove the gradient box (`bg-gradient-to-r from-blue-50 to-indigo-50 ... rounded-3xl shadow-xl`), replace with a plain bordered block per tokens:

```tsx
<section className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div className="max-w-2xl mx-auto">
      <h2>Готовы оптимизировать свои товары?</h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Начните прямо сейчас – первые 3 товара бесплатно!</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg"><Link to="/register">Создать аккаунт <ArrowRight size={20} className="ml-2" /></Link></Button>
        <Button asChild variant="outline" size="lg"><a href="https://t.me/ProskladaiBot" target="_blank" rel="noopener noreferrer">Открыть бота</a></Button>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 7: Fix the dead code / import issues found by the audit while this file is open:** move the `import { FileText } from 'lucide-react';` (old line 308) up to the top import block with the other `lucide-react` imports (it only worked before due to hoisting — clean this up now that the file is being touched anyway); remove `Search`, `Users`, `Clock`, `Shield` from the top-level `lucide-react` import (confirmed unused by the audit) unless Step 3's rewrite still uses one of them (it doesn't — the numbered list has no icons).

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && npm run build`

Start `npm run dev`. Using claude-in-chrome (or manual if unavailable): load `/`, check 375px/768px/1440px for overflow or cramped text, confirm all CTA buttons and footer links navigate correctly, tab through the page confirming visible focus rings on every interactive element.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Landing/HomePage.tsx
git commit -m "feat(home): full editorial redesign — numbered feature/step lists, remove gradients and decorative blur, shared header/footer"
```

---

### Task 17: FeaturesPage redesign

**Files:**
- Modify: `src/pages/Landing/FeaturesPage.tsx`

**Interfaces:**
- Consumes: `LandingHeader`, `LandingFooter`, `Card`/`CardContent`, `Button`.

- [ ] **Step 1:** Replace inline header/footer with `<LandingHeader />`/`<LandingFooter />` (Migration Rule, same as Task 16 Step 1).

- [ ] **Step 2:** Replace every `bg-white dark:bg-gray-800 ... rounded-2xl shadow-sm border ...` feature-card block with `<Card><CardContent>...</CardContent></Card>` (Migration Rule 1) — apply to all three card groups referenced in the audit (`FeaturesPage.tsx:79-107,126-136,154-164`).

- [ ] **Step 3:** Fix the broken footer link found by the audit: this file's own inline footer previously had `Цены` pointing to `to="#"` (line 219) instead of `/pricing` — resolved automatically by Step 1's swap to the shared `LandingFooter`, which already links correctly (Task 12). No separate fix needed here beyond doing Step 1.

- [ ] **Step 4:** Remove the unused `Users` import and the leftover dev comment `Users,  // ← добавьте эту строку` found by the audit at `FeaturesPage.tsx:10`.

- [ ] **Step 5:** Apply token rounding/shadow reduction to any remaining hand-rolled containers per the token table (radius → `rounded`/`rounded-lg`, no `shadow-lg`+).

- [ ] **Step 6: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440 via claude-in-chrome or manual, confirm `/pricing` and `/` links in header/footer work.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Landing/FeaturesPage.tsx
git commit -m "feat(features): apply editorial tokens, shared header/footer, fix broken pricing link and dead code"
```

---

### Task 18: PricingPage redesign

**Files:**
- Modify: `src/pages/Landing/PricingPage.tsx`

**Interfaces:**
- Consumes: `LandingHeader`, `LandingFooter`, `Card`, `Badge`, `Button`.

- [ ] **Step 1:** Replace inline header/footer with shared components (same pattern as Tasks 16/17).

- [ ] **Step 2:** Replace the three pricing-tier cards (`PricingPage.tsx:80-140`) with `<Card>`, and the "Популярный" flag with `<Badge variant="default">Популярный</Badge>` (Migration Rules 1 and 9).

- [ ] **Step 3:** Fix the audit-flagged responsive risk at `PricingPage.tsx:89` (badge using `-mt-10` to float above the card, combined with `-mt-8` on the section) — remove both negative-margin hacks; render the "Популярный" badge as a normal `<Badge>` inside the card's `<CardHeader>` (above the plan name) instead of floating outside the card boundary. This removes the overflow risk entirely rather than just verifying it's fine.

- [ ] **Step 4:** Remove unused imports found by the audit: `Users`, `FileText`, `Image`, `BarChart3`, `MessageCircle`, `HelpCircle` from `PricingPage.tsx:11-16` (verify each is genuinely unused with `grep -n "<Users\|<FileText\|<Image \|<BarChart3\|<MessageCircle\|<HelpCircle" src/pages/Landing/PricingPage.tsx` before removing).

- [ ] **Step 5:** Do **not** attempt to fix the dead-end checkout flow (all three plans' CTAs route to generic `/register` with no plan carried through, and no billing/payment route exists anywhere in the app). This requires backend billing integration, which is out of scope per Global Constraints — record it in the final summary instead.

- [ ] **Step 6: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440, specifically confirm the "Популярный" badge no longer risks clipping at 375px now that Step 3 removed the negative-margin float.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Landing/PricingPage.tsx
git commit -m "feat(pricing): apply editorial tokens, shared header/footer, fix badge overflow risk and dead imports"
```

---

### Task 19: MainLayout redesign

**Files:**
- Modify: `src/layouts/MainLayout.tsx`

**Interfaces:**
- Consumes: `Button`, `Avatar`, `AvatarFallback`, `DropdownMenu*` (already imported, unchanged).

- [ ] **Step 1:** Apply token rounding (logo mark `rounded-lg`→`rounded`), remove any shadow beyond `shadow-sm` on the mobile hamburger button.

- [ ] **Step 2:** Fix the audit-flagged missing focus ring on the hamburger toggle button (`MainLayout.tsx:64-70`) and on the nav-adjacent icon buttons — Task 2's global `:focus-visible` base rule already covers this automatically since these are real `<button>` elements; no per-element class change is required here, but confirm it visually in Step 4.

- [ ] **Step 3:** No structural change to the nav item list or logout logic — this task is styling-token-only for the layout chrome.

- [ ] **Step 4: Verify** — `npx tsc --noEmit && npm run build`; browser check: at 375px confirm the sidebar correctly slides in/out via the hamburger and the overlay dismisses it; tab to the hamburger button with keyboard-only navigation and confirm a visible ring appears; confirm the same for the avatar dropdown trigger.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/MainLayout.tsx
git commit -m "feat(layout): apply editorial tokens to MainLayout chrome"
```

---

### Task 20: DashboardPage redesign

**Files:**
- Modify: `src/pages/Dashboard/DashboardPage.tsx`

**Interfaces:**
- Consumes: `Card`, `StatTile`, `Alert`.

- [ ] **Step 1:** Replace the stat-card blocks (`DashboardPage.tsx:193,224,262,300,346` per the audit) with `<StatTile label=... value=... icon=.../>` (Migration Rule 8). Note the audit found `DashboardPage.tsx:193` uses `p-5` while every other card in the app uses `p-6` — this inconsistency disappears automatically since `StatTile` always renders `p-6` internally.

- [ ] **Step 2:** Replace any remaining card containers (e.g., the recent-goods list wrapper) with `<Card>`/`<CardContent>` (Migration Rule 1).

- [ ] **Step 3:** Fix the audit-confirmed silent error-swallowing: currently, if `fetchGoods` throws inside this page's data-loading effect, the `catch` block only `console.error`s and the page renders as if the account is legitimately empty (no error UI path exists at all on this page, unlike `GoodsListPage.tsx` which has one). Add local `const [loadError, setLoadError] = useState<string | null>(null);`, set it in the catch block, and render `<Alert variant="error">{loadError}</Alert>` above the stats grid when set (Migration Rule 3 + Global Constraint "every list gets loading/empty/error states").

- [ ] **Step 4:** Fix the `any[]`-typed `recentGoods` state (audit finding) — change `useState<any[]>([])` to `useState<GoodsItem[]>([])`, importing `GoodsItem` from `@/api/types`.

- [ ] **Step 5:** Remove the unused `Clock`, `TrendingUp` imports found by the audit.

- [ ] **Step 6:** Do **not** alter the hardcoded `weeklyActivity`/`contentDistribution`/stat values themselves (audit found these are entirely fabricated, fed by a `setTimeout` stub with no real stats endpoint) — that is a backend-dependent business-logic gap, not a styling issue. Record it in the final summary as needing a real stats endpoint.

- [ ] **Step 7: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440, confirm stat tiles reflow to a sensible grid at each width; manually simulate an error (e.g., temporarily stop the backend or block the request in devtools) to confirm the new `Alert` error path renders instead of a blank/empty-looking dashboard, then revert.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Dashboard/DashboardPage.tsx
git commit -m "feat(dashboard): apply editorial tokens, add missing error state, fix any-typed state and unused imports"
```

---

### Task 21: GoodsListPage redesign

**Files:**
- Modify: `src/pages/Dashboard/GoodsListPage.tsx`

**Interfaces:**
- Consumes: `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`, `ConfirmDialog`, `Alert`, `Button`.

- [ ] **Step 1:** Replace the goods list markup with `<Table>` primitives (Migration Rule 10), preserving existing columns/data.

- [ ] **Step 2:** Replace the delete-confirmation modal (`GoodsListPage.tsx:289-323`) with `<ConfirmDialog>` (Migration Rule 7), wiring its existing delete handler into `onConfirm`.

- [ ] **Step 3:** Add `aria-label` to the icon-only view/edit/delete action buttons (`GoodsListPage.tsx:228-249`), matching their existing `title` text (Migration Rule 6).

- [ ] **Step 4:** Replace the primary "add goods" button and pagination controls with `<Button>` variants (Migration Rule 2), and confirm the pagination arrow buttons (`GoodsListPage.tsx:266-282`) are real `<button>` elements with `aria-label="Предыдущая страница"`/`"Следующая страница"` — they'll inherit the global focus ring automatically from Task 2.

- [ ] **Step 5:** This page's loading/empty/error states already exist per the audit (it's the one page with a full error branch) — apply token styling to those states (use `<Alert variant="error">` for the error branch, Migration Rule 3) without changing their logic.

- [ ] **Step 6: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440 confirming the table scrolls horizontally on narrow widths instead of breaking layout (via `Table`'s built-in `overflow-x-auto`); keyboard-tab through row actions confirming focus rings and that `Enter` activates the delete button and opens the dialog; confirm `Escape` closes the `ConfirmDialog` (built into Radix Dialog).

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard/GoodsListPage.tsx
git commit -m "feat(goods-list): apply editorial tokens, use Table/ConfirmDialog primitives, add icon-button aria-labels"
```

---

### Task 22: GoodsDetailPage redesign + tab-component split

**Files:**
- Modify: `src/pages/Dashboard/GoodsDetailPage.tsx`
- Create: `src/pages/Dashboard/GoodsDetail/InfoTab.tsx`
- Create: `src/pages/Dashboard/GoodsDetail/SeoTab.tsx`
- Create: `src/pages/Dashboard/GoodsDetail/InfographicsTab.tsx`
- Create: `src/pages/Dashboard/GoodsDetail/ReportsTab.tsx`

**Interfaces:**
- Each tab component receives `goodsItem: GoodsItem` as a prop and owns its own local state (SEO history, found images, selected images, etc.) instead of all four tabs' state living in the 593-line parent regardless of which tab is active (audit finding #14).
- Consumes: `SelectableImageGrid`, `Card`, `Alert`, `Button`, `FormField`/`Textarea` (for any editable text areas).

- [ ] **Step 1:** Read the current file in full and identify the tab boundary — the audit specifies `activeTab`-gated sections; the "info" tab already correctly uses a `<dl>` (`GoodsDetailPage.tsx:306-339`, called out by the audit as the *correct* pattern) — use that as the reference for `InfoTab.tsx`.

- [ ] **Step 2:** Create `InfoTab.tsx` — move the info-tab JSX (the `<dl>` block and surrounding goods metadata display) into this component, taking `goodsItem: GoodsItem` as its only prop. Pure presentational, no new state.

- [ ] **Step 3:** Create `SeoTab.tsx` — move the SEO-generation JSX and its local state (`seoHistory` and related) into this component. Fix the audit-flagged semantic misuse: `GoodsDetailPage.tsx:375,381,387` wrap plain read-only SEO title/description/keywords output in `<label>` tags — change these to `<dt>`/`<dd>` pairs inside a `<dl>` (matching the correct pattern from Step 2), since they aren't form controls (Migration principle, not a numbered rule, but consistent with Rule 4's spirit of "labels only label real form controls"). Also fix the fabricated-date display: do **not** attempt to show a real per-item date — the audit confirmed `SeoGenerationResponse` has no timestamp field, so there is no real date available on the frontend without a backend change. Instead, remove the misleading `formatDate(new Date().toISOString())` call (which always shows "now") and its visible date entirely from each history entry, rather than continuing to show a fabricated one. Record in the final summary that a real `created_at` field on this response would be needed to bring the date back correctly.

- [ ] **Step 4:** Create `InfographicsTab.tsx` — move the infographics search/select JSX and its local state (`foundImages`, `selectedImages`) into this component, replacing the hand-rolled selectable grid (`GoodsDetailPage.tsx:487-556` and the saved-images grid at `461-485`) with `<SelectableImageGrid>` (Migration Rule 5 / Task 11) — this fixes the audit's keyboard-inaccessible `<div onClick>` tiles.

- [ ] **Step 5:** Create `ReportsTab.tsx` — move the report-summary JSX into this component.

- [ ] **Step 5b: Fix silently-swallowed load errors (audit finding 27).** The parent's `loadSeoAndInfographics` currently only `console.error`s on failure for both the SEO-history and infographics-history fetches (old `GoodsDetailPage.tsx:88-90,96-98`), so a failed request looks identical to "this item genuinely has no SEO/infographics yet" — indistinguishable empty states. In `SeoTab.tsx` and `InfographicsTab.tsx`, add local `const [loadError, setLoadError] = useState<string | null>(null);`, set it in each tab's own data-loading catch block, and render `<Alert variant="error">{loadError}</Alert>` above that tab's content when set, instead of falling through to the empty-state UI.

- [ ] **Step 6:** Update `GoodsDetailPage.tsx` itself to: fetch `goodsItem` (unchanged logic), render the tab bar, and render `{activeTab === 'info' && <InfoTab goodsItem={goodsItem} />}` etc. for each of the four tabs — each tab's internal state now only exists while that tab is mounted, matching the audit's recommendation. Fix the `useState<any>(null)` for `goodsItem` (audit finding) to `useState<GoodsItem | null>(null)`. Remove the unused `RefreshCw`, `Download`, `ExternalLink` imports found by the audit (re-check after the split — some may now be used inside the new tab files instead, in which case import them there, not in the parent).

- [ ] **Step 7:** Apply Card/Alert/Button token migration (Migration Rules 1-3) throughout all four new tab files and the parent.

- [ ] **Step 8: Verify** — `npx tsc --noEmit && npm run build`; browser check: click through all four tabs confirming identical behavior to before the split (this is a structural refactor, not a behavior change); confirm switching tabs and back doesn't lose unsaved... actually confirm it's acceptable that switching away from a tab now resets that tab's transient state (e.g., an in-progress infographics search) since state no longer persists across tab switches — this is an intentional, disclosed consequence of moving state from the shared parent into each tab, not a bug. Note this behavior change explicitly in the final summary. Check 375/768/1440 for each tab; keyboard-test the new `SelectableImageGrid` tiles in `InfographicsTab`.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Dashboard/GoodsDetailPage.tsx src/pages/Dashboard/GoodsDetail/
git commit -m "refactor(goods-detail): split 593-line God component into per-tab components, fix keyboard-inaccessible image tiles and any-typed state

Each tab's state (SEO history, found/selected images, etc.) now lives
in that tab's own component instead of the shared parent, so it no
longer persists across tab switches -- see summary for details."
```

---

### Task 23: SeoGenerationPage redesign

**Files:**
- Modify: `src/pages/Dashboard/SeoGenerationPage.tsx`

**Interfaces:**
- Consumes: `Select` (goods picker), `Alert`, `Button`, `Card`.

- [ ] **Step 1:** Replace the goods-select dropdown pattern (`SeoGenerationPage.tsx:143-162`, duplicated with `ReportsPage`/`InfographicsPage`) with `<FormField>`+`<Select>` (Migration Rule 4).

- [ ] **Step 2:** Replace the error/success banner (`SeoGenerationPage.tsx:185-196`) with `<Alert>` (Migration Rule 3).

- [ ] **Step 3:** Fix the semantic misuse found by the audit at `SeoGenerationPage.tsx:229,235,241` — plain read-only output wrapped in `<label>` — change to `<dt>`/`<dd>` inside a `<dl>`, same fix as Task 22 Step 3.

- [ ] **Step 4:** Remove the same fabricated-date rendering pattern found here (`SeoGenerationPage.tsx:284`, `formatDate(new Date().toISOString())` always showing "now") — remove the visible date from history entries, same reasoning and same disclosure as Task 22 Step 3.

- [ ] **Step 5:** Remove unused `RefreshCw`, `Search` imports found by the audit.

- [ ] **Step 5b: Fix silently-swallowed load errors (audit finding 27).** `loadSeoHistory`'s catch block currently only `console.error`s (old `SeoGenerationPage.tsx:74-76`), rendering as an indistinguishable empty history list on failure. Add local `const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);`, set it in the catch block, and render `<Alert variant="error">{historyLoadError}</Alert>` above the history list when set.

- [ ] **Step 6:** Apply Card/Button token migration to any remaining hand-rolled containers.

- [ ] **Step 7: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440; confirm the goods-select field is keyboard-operable and its label is clickable.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Dashboard/SeoGenerationPage.tsx
git commit -m "feat(seo-generation): apply editorial tokens, fix label misuse and fabricated dates, remove dead imports"
```

---

### Task 24: InfographicsPage redesign

**Files:**
- Modify: `src/pages/Dashboard/InfographicsPage.tsx`

**Interfaces:**
- Consumes: `SelectableImageGrid`, `FormField`/`Select`, `Alert`, `Card`, `Button`.

- [ ] **Step 1:** Replace the found-images grid (`InfographicsPage.tsx:298-371`) and saved-images grid (`270-296`) with `<SelectableImageGrid>` (same fix as Task 22 Step 4, Migration Rule 5/Task 11) — this is the second of the two duplicated instances the audit found; both now share one implementation.

- [ ] **Step 2:** Replace the goods-select dropdown (`InfographicsPage.tsx:188-207`) with `<FormField>`+`<Select>`.

- [ ] **Step 3:** Replace the error/success banner (`InfographicsPage.tsx:257-268`) with `<Alert>`.

- [ ] **Step 4:** Remove the unused `X` import found by the audit.

- [ ] **Step 4b: Fix silently-swallowed load errors (audit finding 27).** `loadSavedImages`'s catch block currently only `console.error`s (old `InfographicsPage.tsx:80-82`), rendering as an indistinguishable empty-images state on failure. Add local `const [loadError, setLoadError] = useState<string | null>(null);`, set it in the catch block, and render `<Alert variant="error">{loadError}</Alert>` above the saved-images grid when set.

- [ ] **Step 5:** Apply Card/Button token migration to remaining containers.

- [ ] **Step 6: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440; keyboard-test image tile selection (Tab to a tile, press Enter/Space, confirm it toggles selected state and the visual checkmark appears).

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard/InfographicsPage.tsx
git commit -m "feat(infographics): apply editorial tokens, use shared SelectableImageGrid, remove dead imports"
```

---

### Task 25: ReportsPage redesign

**Files:**
- Modify: `src/pages/Dashboard/ReportsPage.tsx`

**Interfaces:**
- Consumes: `Table`, `ConfirmDialog`, `FormField`/`Select`, `Alert`, `Button`.

- [ ] **Step 1:** Replace the reports list with `<Table>` primitives (Migration Rule 10).

- [ ] **Step 2:** Replace the delete-confirmation modal (`ReportsPage.tsx:359-400`, the second of the two near-identical instances the audit found alongside `GoodsListPage`) with `<ConfirmDialog>`.

- [ ] **Step 3:** Add `aria-label` to the download/delete icon buttons (`ReportsPage.tsx:324-347`) matching their `title` text.

- [ ] **Step 4:** Replace the goods-select dropdown (`ReportsPage.tsx:169-188`) with `<FormField>`+`<Select>`.

- [ ] **Step 5:** Replace the error/success banner (`ReportsPage.tsx:215-226`) with `<Alert>`.

- [ ] **Step 6:** Remove unused `FileText`, `RefreshCw` imports found by the audit.

- [ ] **Step 7: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440; keyboard-test the download/delete icon buttons and the `ConfirmDialog` flow.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Dashboard/ReportsPage.tsx
git commit -m "feat(reports): apply editorial tokens, use Table/ConfirmDialog primitives, add icon-button aria-labels"
```

---

### Task 26: ProfilePage redesign

**Files:**
- Modify: `src/pages/Dashboard/ProfilePage.tsx`

**Interfaces:**
- Consumes: `FormField`, `Input`, `Alert`, `Button`, `Card`.

- [ ] **Step 1:** Replace all six unassociated `<label>`/`<input>` pairs found by the audit (`ProfilePage.tsx:210,230,250,273,293,313`) with `<FormField>`+`<Input>` (Migration Rule 4) — this fixes the confirmed missing `htmlFor`/`id` bug directly.

- [ ] **Step 2:** Replace the success/error banners (`ProfilePage.tsx:144-155`) with `<Alert>`.

- [ ] **Step 3:** Replace save/change-password buttons with `<Button isLoading={...}>` (Migration Rule 2).

- [ ] **Step 4: Judgment call — do not fix, only disclose.** The audit found `updateProfile`/`changePassword` (`ProfilePage.tsx:26-35`) are hardcoded stubs that `console.log` and resolve without calling the backend, yet the page shows a success toast afterward (misleading). Per Global Constraints ("don't rewrite working business logic," "don't change backend contracts," and "where a fix would be a product decision, leave behavior as-is and flag it"), this task does **not** change what happens when Save is clicked — it only restyles the existing (fake) success/error UI with `Alert`/`Button` tokens. This is recorded as a flagged judgment call in the final summary, not silently left unmentioned.

- [ ] **Step 5: Verify** — `npx tsc --noEmit && npm run build`; browser check at 375/768/1440; confirm clicking each label focuses its input (validates the `htmlFor` fix).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard/ProfilePage.tsx
git commit -m "feat(profile): apply editorial tokens, fix unassociated form labels via FormField"
```

---

### Task 27: SettingsPage redesign + real theme toggle

**Files:**
- Modify: `src/pages/Dashboard/SettingsPage.tsx`

**Interfaces:**
- Consumes: `Switch`, `FormField`/`Select`, `Alert`, `Button`, `Card`.

- [ ] **Step 1:** Replace the two custom unlabeled toggle buttons (`SettingsPage.tsx:295-306` email notifications, `317-328` autosave) with `<Switch>` (Migration Rule, Task 8) — this fixes the audit-confirmed missing `role="switch"`/`aria-checked`/label association in one move.

- [ ] **Step 2: Implement the theme toggle for real.** The audit found the theme selector (`SettingsPage.tsx:106-116`) is a `console.log` stub even though every page already uses `dark:` Tailwind classes throughout and `tailwind.config.js` has `darkMode: 'class'` — this is a pure frontend fix (toggling a class on `<html>`), not a backend/business-logic change, so it's in scope:
  1. Add to the top of the file: `const applyTheme = (theme: 'light' | 'dark' | 'system') => { const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.classList.toggle('dark', isDark); };`
  2. In the existing theme-select handler, replace the `console.log(...)` stub with a call to `applyTheme(selectedTheme)` and persist the choice to `localStorage` under a new key `'theme'` (the page already persists other settings to `localStorage` per the audit, so this matches the existing pattern in this file).
  3. Add a one-time effect in `App.tsx` (the app's true entry point) that reads `localStorage.getItem('theme')` on mount and calls the same `applyTheme` logic before first paint context — actually, to avoid a flash of wrong theme and to keep this fix contained to Settings as scoped, instead add the read-and-apply call inside `src/main.tsx` (before `ReactDOM.createRoot(...).render(...)`), since that runs once at true app startup regardless of which route loads first: `const savedTheme = (localStorage.getItem('theme') as 'light'|'dark'|'system') || 'system'; const isDark = savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.classList.toggle('dark', isDark);` — read `src/main.tsx` first to see its exact current contents before inserting this, so the insertion matches its existing structure exactly.

- [ ] **Step 3:** Fix the dead `loading` state found by the audit (`SettingsPage.tsx:48,118-124` — declared, never set `true`, unreachable branch) — either wire it to the (still-stubbed) save action's pending state via `<Button isLoading={...}>`, or remove the dead branch entirely if the save action truly has nothing async to wait on. Prefer wiring it to `Button isLoading` for consistency with Global Constraint "every async action gets a pending state," even though the underlying save is still a stub per Step 4 below.

- [ ] **Step 4: Judgment call — do not fix, only disclose.** Per the same reasoning as Task 26 Step 4, the audit found the "Save" action here fakes a network call via `setTimeout(800ms)` with a comment admitting a real API call should exist, and that the SEO-generation settings (model, variant counts) only live in `localStorage` with no evidence they're read by the actual SEO/infographics generation code. This task does not add a real backend call (none exists to call) — it only applies tokens and fixes the loading-state wiring from Step 3. Flagged in the final summary.

- [ ] **Step 5:** Fix the responsive risk found by the audit (`SettingsPage.tsx:157-180,186-207,221-242` — button groups using `flex gap-3` with no wrap, risking overflow under ~375px) — add `flex-wrap` to each of these three button groups.

- [ ] **Step 6: Verify** — `npx tsc --noEmit && npm run build`; browser check: toggle theme to "Тёмная" and confirm the whole app visibly switches to dark mode immediately (not just this page) and persists after a page reload; toggle back to "Светлая"; check 375px specifically for the button-group wrap fix; keyboard-test the new `Switch` components (Tab to one, press Space, confirm it toggles).

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard/SettingsPage.tsx src/main.tsx
git commit -m "feat(settings): apply editorial tokens, add accessible Switch, implement real theme toggle (frontend-only), fix responsive button-group overflow"
```

---

### Task 28: Global responsive + accessibility verification sweep

**Files:** none modified unless issues are found (in which case, fix in the relevant page's own file and note which task's commit it amends-by-follow-up — as a new commit, not amending prior task commits, per the "always create new commits" rule).

- [ ] **Step 1:** Start the dev server: `npm run dev`.

- [ ] **Step 2:** Using claude-in-chrome (preferred, since it can resize the viewport and inspect the DOM) or manual browser testing if unavailable: visit every route — `/`, `/features`, `/pricing`, `/login`, `/register`, `/dashboard`, `/goods`, `/goods/new`, `/goods/:id` (using a real ID from a test account), `/seo`, `/infographics`, `/reports`, `/profile`, `/settings` — at 375px, 768px, and 1440px. For each, check: no horizontal scroll on the page body itself, no visibly clipped/overlapping content, all text remains legible (no font shrinking below readable size).

- [ ] **Step 3:** Keyboard-only pass: on at least `/`, `/login`, `/dashboard`, `/goods`, and `/settings`, tab through the entire page using only the keyboard and confirm every interactive element (links, buttons, form fields, dropdown triggers, switches) receives a visible focus ring in the order a sighted user would expect, and that every action (opening the mobile sidebar, opening the avatar dropdown, opening a `ConfirmDialog`, toggling a `Switch`) is operable via Enter/Space without a mouse.

- [ ] **Step 4:** Spot-check contrast: for the recurring `text-gray-500 dark:text-gray-400` secondary-text pattern the audit flagged as borderline, and the `text-gray-400` footer-link-on-dark-background pattern, use the browser's accessibility inspector (or claude-in-chrome's DOM inspection) to read the actual computed foreground/background colors on at least one instance of each and confirm ≥4.5:1 contrast for body text. If any instance fails, darken that specific text color one Tailwind step (e.g., `gray-500`→`gray-600`) in that file, in a follow-up commit for this task.

- [ ] **Step 5:** Fix anything found in Steps 2–4 directly in the owning page's file.

- [ ] **Step 6: Commit** (only if fixes were needed; skip if the sweep found nothing)

```bash
git add -A
git commit -m "fix: address issues found in responsive/accessibility verification sweep"
```

---

### Task 29: Final cleanup pass

**Files:** any file still containing a repo-wide issue after the above (determined by the greps below).

- [ ] **Step 1:** Run a repo-wide check for anything the token migration should have eliminated:

```bash
grep -rn "shadow-lg\|shadow-xl\|shadow-2xl\|rounded-2xl\|rounded-3xl\|rounded-full" src/ --include="*.tsx" | grep -v "Avatar\|avatar"
```
Expected: no results outside of the deliberately-excepted `Avatar` component. Fix any stragglers found (apply the token table's replacement value) in the owning file.

- [ ] **Step 2:** Run `npm run lint` and address any remaining `no-unused-vars`/`no-explicit-any` warnings across the codebase that weren't already covered by a specific page task above (the `.eslintrc.cjs` from Task 1 only warns, doesn't error, so check the full output for stragglers).

- [ ] **Step 3:** Run the full verification suite one final time:

```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all three succeed cleanly.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: final cleanup pass — remove remaining token stragglers and lint warnings"
```

---

## Final Summary Requirements (produce after Task 29, do not skip)

The summary delivered at the end of execution must include, per your instructions:
1. Every judgment call flagged inline above (frontend-design skill unavailability, footer legal-link removal, ProfilePage/SettingsPage stub behavior left as-is, GoodsDetailPage tab-state-reset behavior change, SeoGenerationPage/SeoTab fabricated-date removal).
2. Every backend/API change that would be needed but wasn't made (real dashboard stats endpoint, real profile save/password-change endpoints, real settings persistence endpoint, real SEO-history timestamps, pricing→checkout/billing integration).
3. The one new dependency added (`@radix-ui/react-dialog`) with its reason.
4. Confirmation that all 29 tasks' verification steps passed, or a list of any that didn't and why.
