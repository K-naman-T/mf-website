# Hero Background Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the initial hero background image fade in while rising from below, without replaying or changing later background transitions.

**Architecture:** Reuse `SeamlessBackgrounds`' existing Motion `animate()` call for layer zero. Add only an initial vertical transform to that mount-time animation; active-index transitions remain opacity-only. The existing reduced-motion handling remains unchanged because the component already uses Motion's runtime animation path and the page's intro/accessibility behavior.

**Tech Stack:** Next.js 15, React 19, TypeScript, Motion v12, CSS Modules.

## Global Constraints

- Animate only the first background layer on initial mount.
- Preserve the existing section crossfade behavior for `activeIndex` changes.
- Use transform and opacity rather than layout properties.
- Keep the change limited to the existing background component.

---

### Task 1: Animate Initial Hero Background Reveal

**Files:**
- Modify: `src/components/home/SeamlessBackgrounds.tsx:23-29`

**Interfaces:**
- Consumes: the existing `layersRef` first layer and Motion `animate` helper.
- Produces: a first-layer mount animation from `{ opacity: 0, y: 48 }` to `{ opacity: 1, y: 0 }`; later `activeIndex` animations remain unchanged.

- [ ] **Step 1: Update the mount animation target**

Change the mount effect's target from opacity-only:

```ts
animate(firstLayer, { opacity: 1 }, { duration: 1.4, ease: [0.16, 1, 0.3, 1] })
```

to:

```ts
animate(firstLayer, { opacity: 1, y: 0 }, { duration: 1.4, ease: [0.16, 1, 0.3, 1] })
```

Set the initial layer transform in the same effect before starting the animation:

```ts
firstLayer.style.transform = "translateY(48px)";
```

- [ ] **Step 2: Run verification**

Run: `npm run typecheck`

Expected: TypeScript exits with code 0.

Run: `npm run build`

Expected: Next.js production build exits with code 0; existing lint warnings may remain.
