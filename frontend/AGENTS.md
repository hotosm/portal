# AGENTS.md (frontend)

Guidance for AI coding agents working in `frontend/`.
Read the root `AGENTS.md` first. The rules below apply on top of it.

## Scope

This file covers `frontend/` only. For backend or cross-stack changes, follow the root `AGENTS.md`.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 3.4, using HOT design tokens
- Web Awesome (`@awesome.me/webawesome`, pinned version in `package.json`)
- `@hotosm/ui` for shared components
- Biome (lint and format), Vitest (tests), Paraglide / inlang (i18n)

## Design tokens (HOT)

- HOT design tokens come from the `hotosm-ui-design` package (`hot.css`),
  imported once in `src/main.tsx`. This is the only token source for Portal.
- Use the tokens, never raw values. Colors use `var(--hot-color-*)` or the
  Tailwind names mapped to them (`hot-red-900`, etc.). Spacing uses
  `var(--hot-spacing-*)`.
- Do not hardcode hex colors, pixel spacing, or font values in components.
- Do not edit `hot.css` from this repo. Token changes go through the design
  package.

## Web Awesome

- Use Web Awesome components (`wa-*`) when they cover the need. Check the
  installed version's docs before using a component.
- Use `--wa-*` variables for theming. Do not override them inline.
- Overrides to Web Awesome internals go in `src/styles/hot-wa-portal.css`,
  using `::part()` selectors. Do not scatter overrides across components.

## Shared components

- Check `@hotosm/ui` first. Reuse before writing a new component.
- Components used by more than one page go in `web-components/`
  (currently: `tool-menu`).
- Do not copy a component between page folders. Move it to a shared location.

## Tailwind

- Use utility classes for layout and spacing, built on the HOT tokens.
- Do not add a second CSS framework or global stylesheet.
- Keep custom CSS in `src/styles/`, not in component files.

## Icons

- **Bootstrap Icons only**, used as `<i class="bi bi-*">`.
- Do not add another icon library or inline SVG icon sets.
- `web-components/` keeps its current icons. Do not change them in this scope.
- Existing `wa-icon` usage is pending migration to Bootstrap Icons. Migrate
  a `wa-icon` only when the task already touches that file. Do not run
  migrations as a side task.

## Structure

```text
src/portal-*/        # one folder per page area (field, imagery, mapping, plans, org-profile, user-profile)
src/styles/          # global and override CSS
src/types/           # shared TypeScript types, including web-awesome.d.ts
web-components/      # shared components used across pages
messages/            # inlang translation messages
```

## Coding standards

- No `any` to silence the compiler.
- User-facing strings go in `messages/`. No hardcoded text in components.
- Keep layout and visual changes separate from logic changes in a PR.

## Testing and commands

- `make dev-standalone` runs the frontend at http://localhost:5173.
- `make test-frontend` runs Vitest. New behaviour needs a test.
- `make lint` runs Biome. Run `make lint-fix` only on files you changed.
