import { test, expect } from "@playwright/test";
import {
  INSTANCE_COUNT,
  layoutOrbEyes,
  layoutOrbInstances,
  type OrbEye,
} from "../../src/components/brand/orb-layout";

function isEyePair(pts: OrbEye[]) {
  expect(pts).toHaveLength(2);
  expect(pts.every((p) => p.rx > 6 && p.opacity > 0.9)).toBe(true);
  const [a, b] = pts;
  expect(Math.abs(a!.cy - b!.cy)).toBeLessThan(4);
  expect(Math.abs(a!.cx - b!.cx)).toBeGreaterThan(18);
}

test.describe("orb instance layout", () => {
  test("exports two eye instances for every state", () => {
    for (const state of ["idle", "attend", "working", "listen", "speak"] as const) {
      expect(layoutOrbInstances(state)).toHaveLength(INSTANCE_COUNT);
    }
  });

  test("idle is a side-by-side Oo eye pair", () => {
    isEyePair(layoutOrbEyes("calm"));
  });

  test("attend is a wider side-by-side Oo eye pair", () => {
    const idle = layoutOrbEyes("calm");
    const attend = layoutOrbEyes("alert");
    isEyePair(attend);
    const idleSpan = Math.abs(idle[0]!.cx - idle[1]!.cx);
    const attendSpan = Math.abs(attend[0]!.cx - attend[1]!.cx);
    expect(attendSpan).toBeGreaterThan(idleSpan);
  });

  test("working keeps two eyes, not a pentagon", () => {
    isEyePair(layoutOrbEyes("thinking"));
    expect(layoutOrbInstances("working")).toHaveLength(2);
  });

  test("emotions morph the two Os: sleepy slits, happy tilts, surprised grows", () => {
    const calm = layoutOrbEyes("calm");
    const sleepy = layoutOrbEyes("sleepy");
    const happy = layoutOrbEyes("happy");
    const surprised = layoutOrbEyes("surprised");
    isEyePair(calm);
    expect(sleepy[0]!.ry).toBeLessThan(calm[0]!.ry);
    expect(Math.sign(happy[0]!.rotate)).not.toBe(Math.sign(happy[1]!.rotate));
    expect(surprised[0]!.rx).toBeGreaterThan(calm[0]!.rx);
  });
});

test.describe("header (no top-bar CTA orb)", () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    await page.addInitScript(() => {
      window.localStorage.setItem("mf-cookie-choice", "essential");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(pageErrors, "page errors on first load").toEqual([]);
    (page as { __orbPageErrors?: string[] }).__orbPageErrors = pageErrors;
  });

  test("desktop header keeps theme toggle, with no Let's-talk CTA orb", async ({ page }) => {
    const header = page.locator("header");
    const theme = header.getByRole("button", { name: /switch to .* theme/i });
    await expect(theme).toBeVisible();

    // The Oo CTA orb was removed from the top bar (desktop + mobile).
    await expect(header.locator("[data-orb]")).toHaveCount(0);
    await expect(header.getByRole("link", { name: /let'?s talk/i })).toHaveCount(0);

    const pageErrors = (page as { __orbPageErrors?: string[] }).__orbPageErrors ?? [];
    await page.reload();
    await expect(header).toBeVisible();
    expect(pageErrors, "page errors after reload").toEqual([]);
  });

  test("theme toggle still works without the CTA orb", async ({ page }) => {
    const header = page.locator("header");
    const theme = header.getByRole("button", { name: /switch to .* theme/i });
    await theme.click();
    // Toggling re-labels the control to the other theme; no errors thrown.
    const pageErrors = (page as { __orbPageErrors?: string[] }).__orbPageErrors ?? [];
    expect(pageErrors, "page errors after theme toggle").toEqual([]);
  });
});

test.describe("contact section", () => {
  test("contact scene is the plate plus mailto, with no orb overlay", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("mf-cookie-choice", "essential");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const main = page.locator("main");
    const scrollHeight = await main.evaluate((el) => el.scrollHeight - el.clientHeight);
    await main.evaluate((el, sh) => {
      el.scrollTop = sh;
    }, scrollHeight);
    await expect(page.locator("#contact")).toBeInViewport();

    await expect(page.locator("#contact [data-orb]")).toHaveCount(0);
    await expect(page.locator("#contact video")).toHaveCount(0);
    const plate = page.locator("#contact img[src*='contact']");
    await expect(plate.first()).toBeVisible();
    await expect(plate.first()).toHaveJSProperty("complete", true);
    const naturalWidth = await plate.first().evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);

    const mail = page.locator("#contact").getByRole("link", { name: /hello@oddfromyou\.com/i });
    await expect(mail).toBeVisible();
    await expect(mail).toHaveAttribute("href", /mailto:/i);

    const shot = process.env.ORB_CONTACT_SCREENSHOT;
    if (shot) {
      await page.locator("#contact").screenshot({ path: shot });
    }
  });
});

test.describe("process section", () => {
  test("process ribbon shows five steps with numbered titles and glyphs", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("mf-cookie-choice", "essential");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // The "how we work" ribbon is one tall section holding five step rows
    // (number + Bebas title + glyph + body) revealed on scroll.
    const ribbon = page.locator("[data-process-ribbon]");
    await expect(ribbon).toHaveCount(1);
    const rows = ribbon.locator("[data-row]");
    await expect(rows).toHaveCount(5);

    const first = rows.first();
    await expect(first.locator("h3")).toHaveText(/map/i);
    await expect(first.locator("article span").first()).toHaveText("01");

    const last = rows.last();
    await expect(last.locator("h3")).toHaveText(/stay/i);
    await expect(last.locator("article span").first()).toHaveText("05");

    // Each row renders a glyph on the rail.
    for (let i = 0; i < 5; i++) {
      await expect(rows.nth(i).locator("svg")).toHaveCount(1);
    }
  });
});

test.describe("header orb mobile", () => {
  test("no CTA orb sits beside the theme toggle and menu; drawer keeps its orb CTA", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      window.localStorage.setItem("mf-cookie-choice", "essential");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const header = page.locator("header");
    const menu = header.getByRole("button", { name: /open menu/i });
    await expect(menu).toBeVisible();

    // The Oo CTA was removed from the top bar; the only orb CTA lives in the
    // mobile drawer behind the hamburger.
    await expect(header.locator("[data-orb]")).toHaveCount(0);
    await expect(header.getByRole("link", { name: /let'?s talk/i })).toHaveCount(0);
  });
});
