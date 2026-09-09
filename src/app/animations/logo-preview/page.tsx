import Image from "next/image";
import { LogoMark } from "@/components/brand/LogoMark";
import { FullLogo } from "@/components/brand/FullLogo";
import { OfyGtaShortLogo } from "@/components/brand/OfyGtaShortLogo";
import { OfyViceCityNeon } from "@/components/brand/OfyViceCityNeon";
import { OfyShortLogo } from "@/components/brand/OfyShortLogo";
import { LogoPfp } from "@/components/brand/LogoPfp";

export default function LogoPreviewPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF003C] font-mono">
            Brand Identity Lab — GTA Vice City Edition
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mt-2">
            OddFromYou — Animated Vice City Neon Mark
          </h1>
          <p className="text-neutral-400 max-w-3xl mt-2 text-sm md:text-base">
            Featuring OddFromYou&apos;s dual star-in-oval eyes above &quot;Ofy&quot; in the iconic 1980s flowing cursive script of the <strong>GTA Vice City</strong> logo. Styled in alternating red and obsidian black with an authentic, living neon animation (gas hum, micro-flicker, ignition startup, and spark surge).
          </p>
        </div>

        {/* HERO: Animated Vice City Neon Sign with Interactive Playground */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Animated Vice City Neon Logo (Live Interactive Sign)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/40 animate-pulse">
              ● LIVE ANIMATION
            </span>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-[#06060A] p-8 md:p-12 flex flex-col items-center justify-center overflow-hidden shadow-2xl relative">
            <div className="w-full max-w-[540px] py-4">
              <OfyViceCityNeon
                className="w-full h-auto drop-shadow-[0_0_35px_rgba(255,0,60,0.35)]"
                showControls={true}
                interactive={true}
                animated={true}
              />
            </div>

            <div className="mt-8 text-center text-xs text-neutral-400 max-w-lg space-y-1 font-mono">
              <p className="text-neutral-300 font-bold">⚡ Features Real Electric Neon Characteristics</p>
              <p>Continuous low-frequency gas hum · Intermittent micro-flicker on the black &apos;f&apos; · 3D drop-shadows · Interactive spark surge on click/hover · Realistic startup ignition on power toggle</p>
            </div>
          </div>
        </section>


        {/* NEW: Official Studio Short Mark with Dual Star Os + Traced Letters */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Official Studio Short Mark (Dual Star Os + Traced OFY)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF002B]/20 text-[#FF002B] border border-[#FF002B]/40">
              Traced Vector Mark
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bicolor Variant */}
            <div className="rounded-2xl border border-neutral-800 bg-[#0A0A0E] p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-mono text-[#FF002B] font-bold">Studio Bicolor</span>
                <span className="text-[10px] text-neutral-400 font-mono">variant=&quot;bicolor&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyShortLogo variant="bicolor" className="w-full max-w-[220px] h-auto drop-shadow-[0_4px_20px_rgba(255,0,0,0.15)]" />
              </div>
              <p className="text-xs text-neutral-400">
                OddFromYou signature alternating palette: Red &amp; White star Os above alternating Red/White/Red OFY letters.
              </p>
            </div>

            {/* Red Variant */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-mono text-[#FF002B] font-bold">Pure Red Monolith</span>
                <span className="text-[10px] text-neutral-400 font-mono">variant=&quot;red&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyShortLogo variant="red" className="w-full max-w-[220px] h-auto drop-shadow-[0_4px_20px_rgba(255,0,0,0.2)]" />
              </div>
              <p className="text-xs text-neutral-400">
                Vivid brand #FF0000 red across all star Os and traced chunky letterforms.
              </p>
            </div>

            {/* White on Dark */}
            <div className="rounded-2xl border border-neutral-800 bg-[#0D0D11] p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-mono text-white font-bold">Clean White</span>
                <span className="text-[10px] text-neutral-400 font-mono">variant=&quot;white&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyShortLogo variant="white" className="w-full max-w-[220px] h-auto opacity-90" />
              </div>
              <p className="text-xs text-neutral-400">
                High-contrast monochrome white for dark editorial pages and video overlays.
              </p>
            </div>

            {/* Dark on Light */}
            <div className="rounded-2xl border border-neutral-800 bg-[#F4F4F6] text-black p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-300">
                <span className="text-xs font-mono text-black font-bold">Obsidian Dark</span>
                <span className="text-[10px] text-neutral-600 font-mono">variant=&quot;dark&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyShortLogo variant="dark" className="w-full max-w-[220px] h-auto" />
              </div>
              <p className="text-xs text-neutral-600">
                Pure deep black for light mode surfaces, white background plates, and print.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Live Scalable Vector SVG Implementations */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Live Vector Components (React + SVG)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF002B]/20 text-[#FF002B] border border-[#FF002B]/40">
              Production Vector
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Neon Glowing Vector */}
            <div className="rounded-2xl border border-neutral-800 bg-[#070709] p-6 flex flex-col justify-between overflow-hidden shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-mono text-[#FF002B] font-bold">GTA Neon (Vector Glow)</span>
                <span className="text-[10px] text-neutral-400 font-mono">variant=&quot;neon&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyGtaShortLogo variant="neon" className="w-full max-w-[280px] h-auto drop-shadow-[0_0_25px_rgba(255,0,43,0.35)]" />
              </div>
              <p className="text-xs text-neutral-400">
                SVG filters with multi-tier glow, transparent tube fills, and hot-core filaments.
              </p>
            </div>

            {/* Solid Flat Red/Black Alternates */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-mono text-neutral-300 font-bold">Solid Alternates (Brutalist)</span>
                <span className="text-[10px] text-neutral-400 font-mono">variant=&quot;solid&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyGtaShortLogo variant="solid" className="w-full max-w-[280px] h-auto" />
              </div>
              <p className="text-xs text-neutral-400">
                High-contrast flat vector: Red / Black alternating fills for navbars, icons &amp; print.
              </p>
            </div>

            {/* All Red Variant */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-mono text-[#FF002B] font-bold">Oxide Red Monolith</span>
                <span className="text-[10px] text-neutral-400 font-mono">variant=&quot;red&quot;</span>
              </div>
              <div className="py-8 flex items-center justify-center">
                <OfyGtaShortLogo variant="red" className="w-full max-w-[280px] h-auto" />
              </div>
              <p className="text-xs text-neutral-400">
                Solid #FF0000 brand red across all letterforms and star-eyes.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Visual Concept Renders */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              GTA VI Neon Visual Concept Renders
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
              High Resolution Artwork
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden group">
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                <Image
                  src="/brand/gta-neon/concept-1-neon-sign.jpg"
                  alt="Concept 1: Authentic Neon Sign"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="font-bold text-sm text-white">Concept 1: Neon Sign Tubes</div>
                <div className="text-xs text-neutral-400">Glass tubes with glowing red &amp; obsidian black backing</div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden group">
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                <Image
                  src="/brand/gta-neon/concept-2-neon-classic.jpg"
                  alt="Concept 2: Neon Sign with 4-Point Star Cutouts"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="font-bold text-sm text-white">Concept 2: GTA Vice Night</div>
                <div className="text-xs text-neutral-400">Pricedown font contours with floor reflection and hot tube glow</div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden group">
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                <Image
                  src="/brand/gta-neon/concept-3-gta-vi-bevel.jpg"
                  alt="Concept 3: GTA VI Beveled 3D Metallic Neon"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="font-bold text-sm text-white">Concept 3: 3D Beveled Metallic</div>
                <div className="text-xs text-neutral-400">GTA VI title-card style with heavy beveled chrome and neon channels</div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden group">
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                <Image
                  src="/brand/gta-neon/concept-4-flat-vector-neon.jpg"
                  alt="Concept 4: Flat 2D Vector Neon"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="font-bold text-sm text-white">Concept 4: 2D Graphic Neon</div>
                <div className="text-xs text-neutral-400">Minimal vector sticker styling with vibrant outline illumination</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Comparison with Existing Studio Marks */}
        <section className="space-y-6 pt-4 border-t border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Existing Studio Marks (Comparison)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between">
              <span className="text-xs font-mono text-neutral-400 mb-4">Original Short Mark (Red)</span>
              <div className="py-6 flex items-center justify-center">
                <LogoMark theme="red" className="w-48 h-auto" />
              </div>
              <span className="text-xs text-neutral-500 font-mono">brand/ofy-short-logo-red.svg</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between">
              <span className="text-xs font-mono text-neutral-400 mb-4">Original Short Mark (Dark)</span>
              <div className="py-6 flex items-center justify-center">
                <LogoMark theme="dark" className="w-48 h-auto" />
              </div>
              <span className="text-xs text-neutral-500 font-mono">brand/ofy-short-logo.svg</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between">
              <span className="text-xs font-mono text-neutral-400 mb-4">Full Logo Wordmark (Red)</span>
              <div className="py-6 flex items-center justify-center">
                <FullLogo variant="red" className="w-56 h-auto" />
              </div>
              <span className="text-xs text-neutral-500 font-mono">public/brand/ofy-full-logo-red.svg</span>
            </div>
          </div>
        </section>

        {/* Section 4: PFP / Profile Picture Suite */}
        <section className="space-y-8 pt-6 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  PFP / Profile Picture Suite (1:1 Ratio)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/40">
                  Circle-Crop Safe
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-2xl">
                Standard social platforms (Twitter/X, Discord, GitHub, Slack, Instagram) crop square avatars into circles. The PFP version of the short logo is calibrated to a 1:1 canvas with a generous ~25% radial safety buffer so the mark remains prominent without clipping against circular rims.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
              <span>512×512 &amp; 1024×1024</span>
            </div>
          </div>

          {/* Colorway Grid (Circle Avatar Crop) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Core Colorways (Circular Avatar Crop)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Bicolor Flagship */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 flex flex-col items-center text-center gap-3">
                <LogoPfp variant="bicolor" shape="circle" size={120} showSafeZone={true} />
                <div>
                  <div className="text-xs font-bold text-white">Signature Bicolor</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Red &amp; White on Black</div>
                </div>
              </div>

              {/* Red on Black */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 flex flex-col items-center text-center gap-3">
                <LogoPfp variant="red" shape="circle" size={120} showSafeZone={true} />
                <div>
                  <div className="text-xs font-bold text-white">Oxide Red</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">#FF0000 on Black</div>
                </div>
              </div>

              {/* White on Black */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 flex flex-col items-center text-center gap-3">
                <LogoPfp variant="white" shape="circle" size={120} showSafeZone={true} />
                <div>
                  <div className="text-xs font-bold text-white">Monochrome White</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">#FFFFFF on Black</div>
                </div>
              </div>

              {/* Black on White */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 flex flex-col items-center text-center gap-3">
                <LogoPfp variant="dark" shape="circle" size={120} showSafeZone={true} />
                <div>
                  <div className="text-xs font-bold text-white">Brutalist Inverted</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">#000000 on White</div>
                </div>
              </div>

              {/* Black on Red */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 flex flex-col items-center text-center gap-3">
                <LogoPfp variant="black-on-red" shape="circle" size={120} showSafeZone={true} />
                <div>
                  <div className="text-xs font-bold text-white">Brutalist Red</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">#000000 on Red</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shape Adaptations */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Shape Adaptations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 flex flex-col items-center text-center gap-4">
                <LogoPfp variant="bicolor" shape="circle" size={140} showSafeZone={true} />
                <div>
                  <div className="text-xs font-bold text-white">Circle Avatar</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Twitter/X, Discord, GitHub, Slack</div>
                  <div className="text-[10px] text-[#00FF66] font-mono mt-1">● Green ring: circle boundary (zero clipping)</div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 flex flex-col items-center text-center gap-4">
                <LogoPfp variant="bicolor" shape="squircle" size={140} />
                <div>
                  <div className="text-xs font-bold text-white">Squircle</div>
                  <div className="text-[11px] text-neutral-400 mt-1">iOS App Icon, macOS Dock, Telegram</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Smooth 22% continuous curvature</div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 flex flex-col items-center text-center gap-4">
                <LogoPfp variant="bicolor" shape="square" size={140} />
                <div>
                  <div className="text-xs font-bold text-white">Raw 1:1 Square</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Master file, YouTube Channel, LinkedIn</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Full 512×512 / 1024×1024 frame</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scale Ladder & Layout Variants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scale Ladder */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Legibility Scale Ladder</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Maintains high star-pupil clarity across large avatars and tiny header chips.
                </p>
              </div>

              <div className="flex items-end gap-5 py-4 overflow-x-auto">
                <div className="flex flex-col items-center gap-1.5">
                  <LogoPfp variant="bicolor" shape="circle" size={96} />
                  <span className="text-[10px] text-neutral-500 font-mono">96px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <LogoPfp variant="bicolor" shape="circle" size={64} />
                  <span className="text-[10px] text-neutral-500 font-mono">64px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <LogoPfp variant="bicolor" shape="circle" size={48} />
                  <span className="text-[10px] text-neutral-500 font-mono">48px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <LogoPfp variant="bicolor" shape="circle" size={32} />
                  <span className="text-[10px] text-neutral-500 font-mono">32px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <LogoPfp variant="bicolor" shape="circle" size={24} />
                  <span className="text-[10px] text-neutral-500 font-mono">24px</span>
                </div>
              </div>
            </div>

            {/* Layout Variants: Composite OFY vs Minimal Oo */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Layout Options (OFY Mark with Stars vs Minimal Oo)</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Default canonical PFP uses the full OFY mark with star-eyes. Alternate minimal eye-pair also supported.
                </p>
              </div>

              <div className="flex items-center gap-6 py-2">
                <div className="flex flex-col items-center gap-2">
                  <LogoPfp variant="bicolor" layout="composite" shape="circle" size={96} showSafeZone={true} />
                  <span className="text-[10px] text-neutral-400 font-mono">OFY with Stars</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <LogoPfp variant="bicolor" layout="horizontal" shape="circle" size={96} showSafeZone={true} />
                  <span className="text-[10px] text-neutral-400 font-mono">Horizontal Oo</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <LogoPfp variant="bicolor" layout="stacked" shape="circle" size={96} showSafeZone={true} />
                  <span className="text-[10px] text-neutral-400 font-mono">Stacked Oo</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-[96px] h-[96px] rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2">
                    <LogoPfp variant="bicolor" layout="composite" bg="transparent" shape="circle" size={80} />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">Transparent BG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference Inventory */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Generated Assets Inventory (OFY Logo with Stars)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-neutral-300">
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 space-y-1">
                <div className="text-neutral-400 font-bold">Vector SVGs (1:1 Square 512×512)</div>
                <div className="text-neutral-300">public/brand/ofy-short-logo-pfp.svg (Canonical Bicolor)</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-short-logo-pfp-bicolor.svg</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-short-logo-pfp-red.svg</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-short-logo-pfp-black-red.svg</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-short-logo-pfp-white.svg</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-short-logo-pfp-transparent.svg</div>
              </div>
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 space-y-1">
                <div className="text-neutral-400 font-bold">Raster PNGs (1024×1024, 512×512, 256×256, 128×128)</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-pfp-composite-bicolor-1024.png</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-pfp-composite-red-1024.png</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-pfp-composite-black-red-1024.png</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-pfp-composite-white-1024.png</div>
                <div className="text-neutral-300">public/brand/pfp/ofy-pfp-composite-transparent-1024.png</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

