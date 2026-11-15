# Astragen AI: Plan v3 (Builder.io-Inspired Design System, Dark + Light)

Scope: the whole platform, except `app/page.tsx` (landing page stays untouched).
Reference: the Builder.io design guide (dark canvas, purple action color, cyan eyebrow labels, Poppins, pill buttons, glass AI input).
Goal: a distinctive, product-grade look in **both dark and light mode**, with smooth performance.

This plan replaces the design sections of v2. The performance and work-order sections are kept and updated at the end.

---

## 1. How we use the reference (and how we avoid a copy)

We adopt the **system**: near-black canvas, purple as the single action color, cyan as a rare secondary, Poppins, full-pill buttons, glass AI prompt input, and the type and spacing scales.
We do **not** copy the Builder.io marketing page. Astragen is an app, so the hero, trust bar and newsletter patterns map to the Dashboard and Studio instead.

To keep it from looking like a generic template:
- Purple appears only on actions, active states and category labels. Never as a page-wide gradient.
- The purple glow is used in **one** place per screen at most (Studio empty state, Dashboard search area). No glow on cards or in content sections.
- Real product content (actual generated outputs, real template names and counts) fills the screens. No placeholder-looking sections.
- Cyan is limited to eyebrow labels and status dots, as in the reference.
- Copy is short and specific ("Generate", "37 / 100 credits"), no generic marketing lines.

---

## 2. Design tokens (dark + light)

Dark values come straight from the reference. Light values are our own adaptation, chosen to keep the same hierarchy and to pass contrast.

```css
:root {                         /* LIGHT */
  --canvas:           #FAFAFA;
  --surface:          #FFFFFF;
  --surface-elevated: #F4F4F5;
  --action:           #9333EA;  /* darker than dark-mode purple so white text passes AA */
  --action-hover:     #7E22CE;
  --action-ink:       #FFFFFF;
  --accent-cyan:      #0E7490;  /* cyan-700, readable as small text on white */
  --ink:              #09090B;
  --ink-muted:        #52525B;
  --ink-dim:          #71717A;
  --border:           #E4E4E7;
  --border-subtle:    #D4D4D8;
  --glow:             rgba(147, 51, 234, 0.10);
}

.dark {                         /* DARK (Builder.io values) */
  --canvas:           #000000;
  --surface:          #151515;
  --surface-elevated: #1A1A1A;
  --action:           #A855F7;
  --action-hover:     #9333EA;
  --action-ink:       #FFFFFF;
  --accent-cyan:      #06B6D4;
  --ink:              #FFFFFF;
  --ink-muted:        #A1A1AA;
  --ink-dim:          #71717A;
  --border:           #27272A;
  --border-subtle:    #3F3F46;
  --glow:             rgba(168, 85, 247, 0.22);
}
```

This also replaces the old fragmented dark hex codes (`#07080B`, `#090A0C`, `#0E131F`, `#121418`). Every component reads from these variables only. No hardcoded hex values in components.

**Theme mechanics**
- `next-themes` with `attribute="class"`, `defaultTheme="system"`, and a toggle (Light / Dark / System) in the header and Settings.
- No flash of wrong theme on load (inline script from `next-themes`, `suppressHydrationWarning` on `<html>`).
- Tailwind colors map to the variables (`canvas`, `surface`, `surface-elevated`, `action`, `ink`, `ink-muted`, `border`, and so on) so classes like `bg-surface text-ink border-border` work in both themes with no `dark:` pairs.

**Light-mode rules** (the reference only defines dark)
- Canvas is off-white `#FAFAFA`, cards are white, so depth comes from the 1px border, not from shadow.
- Glass input in light mode: white surface, `--border`, a very soft shadow (`0 1px 2px rgba(0,0,0,0.04)`), no blur needed.
- Purple glow becomes a faint lavender radial tint (`--glow`), limited to the same single spot per screen.
- Primary buttons stay purple with white text in both themes. Secondary buttons are bordered pills.
- Code blocks stay dark in both themes (editor-like contrast, and it keeps syntax colors consistent).
- Test every screen in both themes before calling it done.

---

## 3. Typography

Poppins only, loaded through `next/font/google` (self-hosted, `display: swap`, weights 400/500/600 only to keep it light).

| token | size | weight | leading | tracking | use |
| :--- | ---: | ---: | ---: | ---: | :--- |
| page-title | 2rem | 600 | 1.2 | -0.01em | Page headings (Dashboard, History, Billing) |
| section-title | 1.25rem | 600 | 1.3 | -0.01em | Panel and section headings |
| body | 1rem | 400 | 1.6 | 0 | Descriptions, generated output |
| body-small | 0.875rem | 400 | 1.5 | 0 | Metadata, table rows, captions |
| label | 0.75rem | 500 | 1.4 | 0.05em, uppercase | Eyebrows, category tags, button text |
| nav | 0.875rem | 500 | 1 | 0 | Sidebar and header items |

Notes:
- The app uses smaller headings than the reference's 3rem hero, because app screens need density. 3rem is reserved for empty states only.
- Credits, counts and timestamps use `tabular-nums` so numbers don't jitter.
- Generated output and code blocks use a monospace font (`JetBrains Mono`) for code only. All other UI is Poppins.
- Verify Poppins licensing (open-source OFL via Google Fonts, so it's fine for production).

---

## 4. Shape, spacing, icons

- 4px base unit.
- Radius: **full pill (9999px)** for buttons, tags, chips, search field; `0.75rem-1rem` for cards and panels; `0.5rem` for form inputs and textareas.
- Section padding `6rem` only on marketing-style empty states. In-app panels use `1.5rem` internal padding and `1.5rem` gaps; label-to-content gaps use `1rem`.
- Borders are 1px `--border`; hover/focus uses `--border-subtle` or an `--action` ring.
- Icons: one set (`lucide-react`), line weight 1.5, mostly `--ink-muted`, `--ink` on hover, `--action` for active. Filled only for active states. This also removes the Flaticon PNGs (0 external requests, no CLS).
- Category identity: a small uppercase `label` tag (`BLOG`, `CODE`, `SOCIAL`). Cyan is used on the eyebrow labels only.

---

## 5. Components mapped to Astragen

**Header / top bar**
- Transparent or `--canvas` background, no visible border until scrolled (then a 1px `--border`).
- Left: logo. Center/left: search trigger styled as a pill ("Search templates… ⌘K"). Right: theme toggle, "Upgrade" bordered pill, user avatar.
- Primary action pill: filled `--action`. Secondary: bordered pill.

**Sidebar**
- `--surface` background, 1px right border. Collapsible from 260px to 72px (simple 150ms width transition).
- Active item: `--surface-elevated` background with a small `--action` indicator. No spring animation.
- Usage meter: `37 / 100 credits` in tabular numbers plus a thin bar in `--action`.

**Dashboard (the "hero prompt" pattern)**
- Top of the page: a large **glass-style prompt/search input** (the signature element from the reference). In Studio-adjacent use it filters templates; typing a goal ("write a blog about…") can suggest matching templates.
- Below it: **capability pills** (quick filters: Blog, YouTube, Code, Social, Marketing, Education), full-pill chips with an icon and label.
- Then the template list/grid. Cards: `--surface`, 1px `--border`, `1rem` radius, icon, name, one-line description, uppercase category tag. Hover changes only `border-color`.

**Studio (`[template-slug]`)**
- Two columns: form (left) and output (right), 1px divider.
- Form fields use `0.5rem` radius, `--surface-elevated` background, `--action` focus ring. Submit is a full-pill purple button.
- Output toolbar reduced to: **Copy, Export (menu), Refine (menu), View (toggle)**, plus a "…" menu for the rest. Pill-shaped buttons.
- Generation state: purple blinking block cursor. No pulsing glow.
- Code blocks: always dark, with a language label, a Copy button and instant "Copied" feedback.

**History**
- Right-side slide-over drawer (`--surface`, `1rem` radius on the inner edge), search pill at the top, grouped by date, re-run button.

**Billing**
- Free vs Pro side by side. Pro card gets a 1px `--action` border. Toggle switches (monthly/annual) use `--action` for the active state with explicit labels.

**Settings**
- Tabbed layout (Profile, Preferences, Appearance, Usage). Appearance holds the Light / Dark / System choice.

**Footer** (replaces the neobrutalist one)
- Canvas background, 1px top border, 4-column link grid. Category headers use the uppercase `label` token in `--action`; links use `body-small` in `--ink-muted`, going to `--ink` on hover. Legal row below a divider, social icons at the same stroke weight. Collapses 4 -> 2 -> 1 columns.
- `components/ui/neo.tsx` is retired or migrated so nothing neobrutalist remains.

---

## 6. Responsive and accessibility

- Mobile: sidebar becomes a drawer, header collapses to logo + menu button, Studio columns stack (form first, output second), capability pills wrap or scroll horizontally, touch targets at least 44px.
- Contrast: white on black and `--ink` on `--canvas` both exceed AAA; `--ink-muted` and the purple/cyan label colors are chosen to pass AA in both themes. Re-check with a contrast tool after tuning.
- Visible focus ring on every interactive element (`--action` ring, 2px, offset).
- `aria-label` on icon-only buttons (attach, submit, theme toggle, sidebar collapse).
- Respect `prefers-reduced-motion` (disable the cursor blink animation and any glow transition).
- Toggle switches expose their state (`role="switch"`, `aria-checked`).

---

## 7. Performance (kept from v2, still corrected)

Measure first. Packages that are never imported don't appear in the client bundle, so removing them mainly helps install size and build time. Real bundle gains come from removing `axios` and moving prompts out of `Templates.tsx`.

1. **Baseline**: `@next/bundle-analyzer`, Lighthouse, Chrome Performance panel. Save before/after numbers.
2. **Remove dead deps** after a `grep` confirms no imports: `html2canvas, moment, critters, react-contenteditable, styled-components, react-icons, @radix-ui/react-icons`.
3. **axios -> fetch** in billing.
4. **Split `Templates.tsx`**: `data/templates-meta.ts` (client) and `lib/ai/prompts.ts` (`import "server-only"`). Prompts must not ship to the browser.
5. **Remove Flaticon** (30-50 requests, layout shift). Replaced by the Lucide icon registry.
6. **Split `OutputSection`** after profiling with React Profiler: `OutputToolbar`, memoized `MarkdownRenderer`, `StreamingCursor`, `RefineDrawer`. Keep the existing 50ms stream throttle.
7. **Replace `transition-all`** with explicit `border-color`, `background-color`, `transform`. Use `will-change` only where jank is measured.
8. **Glass blur is expensive**: apply `backdrop-filter` to the prompt input only, never to scrolling lists or cards. In light mode, skip blur entirely.
9. **next.config**: `optimizePackageImports: ["lucide-react"]`, `removeConsole` (keeping error/warn). Keep `next/font` for Poppins.

---

## 8. Order of work

1. **Measure** baseline.
2. **Phase 1**: dead deps, axios, `Templates.tsx` split, orphaned folder cleanup.
3. **Phase 2 (foundation)**: tokens (dark + light), `next-themes`, Poppins, Tailwind color mapping, remove all hardcoded hex values.
4. **Phase 3**: shared components (buttons, pills, inputs, cards, toggles, header, sidebar, footer) built once against the tokens, checked in both themes.
5. **Phase 4**: Dashboard (prompt input, capability pills, template cards with Lucide icons).
6. **Phase 5**: Studio (form, output split, toolbar, cursor, code blocks).
7. **Phase 6**: History drawer, Billing, Settings, Cmd+K.
8. **Phase 7**: typecheck, tests, build, Lighthouse, contrast audit, mobile pass, light/dark pass.

Capture a before/after screenshot in both themes for each phase.

---

## 9. Definition of done

- Every screen works and looks intentional in **dark and light**, switchable and persisted, no flash on load.
- No hardcoded hex values in components; everything uses tokens.
- Purple is the only action color, cyan only on eyebrow labels, one glow spot per screen at most.
- Pill buttons, consistent radius scale, Poppins throughout (monospace for code only).
- 0 external icon requests, CLS near 0, prompts not in the client bundle.
- Contrast passes AA in both themes, with focus rings and aria-labels in place.
