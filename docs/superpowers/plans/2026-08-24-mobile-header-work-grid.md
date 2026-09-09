# Mobile Header and Work Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (inline execution selected).

**Goal:** Center the mobile hero, reduce the mobile header to a centered logo plus hamburger, and replace the work content with an equal-cell frame system.

**Architecture:** Keep the existing `AppNavbar` and Motion scene structure. Use a mobile-only CSS grid for the header and hero positioning. Render the five existing service icons as a data-driven equal-cell work grid, preserving the current service data source while adding concise descriptions in the component.

**Tech Stack:** Next.js 15, React 19, TypeScript, Motion, CSS Modules.

## Global Constraints

- Desktop header and hero layout remain unchanged.
- Mobile header shows only logo and hamburger in the closed state.
- Work grid uses straight borders, equal cells, oversized icons, labels, and descriptions.
- Existing active-section Motion states remain intact.

---

### Task 1: Mobile Header and Hero

**Files:** `src/components/layout/AppNavbar.tsx`, `src/components/layout/app-navbar.module.css`, `src/components/home/ofy-art-home.module.css`

- Add mobile-only left spacer and center logo grid placement.
- Hide `.navCenter`, theme button, and CTA at mobile widths while retaining the hamburger and drawer.
- Set mobile `.heroContent` to centered vertical alignment with a small downward translate.

### Task 2: Work Frame Grid

**Files:** `src/components/home/OfyArtHome.tsx`, `src/components/home/ofy-art-home.module.css`

- Replace the paragraph and icon rail with five equal cells for CRAFT, SPEED, SHAPE, AI, and SCALE.
- Use concise descriptions: `precision before polish`, `shorten the distance from idea to launch`, `make the system feel inevitable`, `build intelligence into the workflow`, and `make the good thing hold under pressure`.
- Give each cell straight borders, a large icon area, label, and description; use two columns on mobile.

### Task 3: Verify

- Run `npm run typecheck` after any build completes.
- Run `npm run build`.
- Run `git diff --check` on changed source files.
