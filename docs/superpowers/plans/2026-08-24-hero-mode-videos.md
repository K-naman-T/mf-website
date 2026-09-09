# Hero Mode Videos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upscale the supplied light and dark mode hero videos to 1920x1080 and use them for the home hero backgrounds.

**Architecture:** Keep the existing `SeamlessBackgrounds` video integration unchanged. Add two processed files under `public/video/` and update the theme-specific hero asset constants in `OfyArtHome.tsx`.

**Tech Stack:** FFmpeg, Next.js 15, React 19, TypeScript.

## Global Constraints

- Preserve the existing desktop-only video behavior and poster fallbacks.
- Keep mobile hero rendering on the existing image assets.
- Do not modify unrelated worktree changes.

---

### Task 1: Process Hero Videos

**Files:**
- Create: `public/video/hero-light-mode-1920.mp4`
- Create: `public/video/hero-dark-mode-1920.mp4`

- [ ] **Step 1: Upscale both 1280x720 inputs to 1920x1080**

Run FFmpeg with Lanczos scaling, H.264 encoding, AAC audio, and fast-start metadata:

```bash
ffmpeg -i "/home/knamant/Downloads/new_light_mode.mp4" -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart public/video/hero-light-mode-1920.mp4
ffmpeg -i "/home/knamant/Downloads/new_dark_mode.mp4" -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart public/video/hero-dark-mode-1920.mp4
```

- [ ] **Step 2: Verify output dimensions and playable streams**

Run:

```bash
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height -of default=noprint_wrappers=1 public/video/hero-light-mode-1920.mp4
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height -of default=noprint_wrappers=1 public/video/hero-dark-mode-1920.mp4
```

Expected: each file has a 1920x1080 H.264 video stream and an AAC audio stream.

### Task 2: Wire Theme Videos Into Hero

**Files:**
- Modify: `src/components/home/OfyArtHome.tsx:18-27`

- [ ] **Step 1: Replace only the desktop video paths**

Set the red/light theme video to `/video/hero-light-mode-1920.mp4` and the dark theme video to `/video/hero-dark-mode-1920.mp4`. Leave all image poster and mobile paths unchanged.

- [ ] **Step 2: Verify the source mapping**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits with code 0.

### Task 3: Production Verification

**Files:**
- No additional files.

- [ ] **Step 1: Build the site**

Run:

```bash
npm run build
```

Expected: Next.js production build exits successfully and the CSS manifest fix completes.
