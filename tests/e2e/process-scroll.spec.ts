import { test, expect, type Page } from "@playwright/test";

/**
 * Homepage process section = one tall in-flow "how we work" ribbon between
 * the manifesto and contact scenes. A wavy rail draws down the left as the
 * page scrolls; each step row (numbered title + glyph + body) reveals as the
 * ink tip passes it.
 */

async function skipIntro(page: Page) {
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, 40);
  await page.waitForSelector(".mf-logo-intro", { state: "detached", timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
}

function ribbon(page: Page) {
  return page.locator("[data-process-ribbon]");
}

function rows(page: Page) {
  return page.locator("[data-process-ribbon] [data-row]");
}

test.describe("process ribbon (motion OK)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("mf-cookie-choice", "essential");
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
  });

  test("ribbon holds the five step rows with titles in order", async ({ page }) => {
    await skipIntro(page);

    await expect(ribbon(page)).toHaveCount(1);
    await expect(rows(page)).toHaveCount(5);

    const titles = await rows(page)
      .locator("h3")
      .evaluateAll((els) => els.map((el) => el.textContent?.trim()));
    expect(titles).toEqual(["map", "cut", "build", "ship", "stay"]);

    const nums = await rows(page)
      .locator("article span")
      .evaluateAll((els) => els.map((el) => el.textContent?.trim()).filter(Boolean));
    // Each row carries its step number ("01".."05") — assert count not exact
    // text to stay resilient to the number's container. (Rows also carry an
    // aria-hidden ghost numeral, so scope to the visible text card only.)
    expect(nums.filter((t) => /^0[1-5]$/.test(t ?? ""))).toHaveLength(5);

    // Each row renders exactly one glyph on the rail.
    for (let i = 0; i < 5; i++) {
      await expect(rows(page).nth(i).locator("svg")).toHaveCount(1);
    }
  });

  test("ribbon rows reveal as the section scrolls through the viewport", async ({ page }) => {
    await skipIntro(page);

    const main = page.locator("main");
    const section = ribbon(page);
    // Scroll the ribbon's top to the top of the viewport.
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    // With the top of the section at the top of the viewport, the first row is
    // on/near the viewport midline and revealed; later rows are still hidden.
    const readOpacities = () =>
      rows(page).evaluateAll((els) =>
        els.map((el) => {
          const target = el.querySelector("[class*='textCard'], h3") as HTMLElement | null;
          return target ? parseFloat(getComputedStyle(target).opacity) : 0;
        }),
      );

    const top = await rows(page).first().evaluate((el) => (el as HTMLElement).getBoundingClientRect().top);
    // The ribbon is tall (multiple viewports) — scrolling its top into view
    // parks the first rows near the top of the viewport, not yet at the
    // midline, so wait until we've scrolled far enough that row 0 crosses.
    await main.evaluate((el, sectionTop) => {
      const m = el as HTMLElement;
      // Move so row 0's center sits at the viewport middle (fast scrub).
      m.scrollTop = sectionTop + m.clientHeight * 0.35;
    }, await section.evaluate((el) => (el as HTMLElement).offsetTop));
    await page.waitForTimeout(1200);

    const opacities = await readOpacities();
    // The first row should be fully revealed, the last row still hidden.
    // (The ink-tip spring can leave a row a few percent short of 1.0.)
    expect(opacities[0]!).toBeGreaterThan(0.82);
    expect(opacities[4]!).toBeLessThan(0.5);
  });

  test("scrolling to the ribbon bottom reveals all rows", async ({ page }) => {
    await skipIntro(page);

    const main = page.locator("main");
    const section = ribbon(page);

    await main.evaluate((el) => {
      const m = el as HTMLElement;
      const s = m.querySelector("[data-process-ribbon]") as HTMLElement;
      // Bottom of the ribbon (minus one viewport) — final row fully revealed.
      m.scrollTop = s.offsetTop + s.offsetHeight - m.clientHeight;
    });
    await page.waitForTimeout(1200);

    const opacities = await section
      .locator("[data-row] [class*='textCard']")
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).opacity)));
    expect(opacities.length).toBe(5);
    for (const o of opacities) {
      expect(o).toBeGreaterThan(0.9);
    }
  });
});

test.describe("process ribbon static under reduced motion", () => {
  test("ribbon stacks naturally and every row is readable without scroll choreography", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("mf-cookie-choice", "essential");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(300);

    // Reduced motion: the ribbon is not a 380vh scrubbing range — it's a
    // normal-height stack. Verify the section exists with all rows.
    const section = ribbon(page);
    await expect(section).toHaveCount(1);
    await expect(rows(page)).toHaveCount(5);

    // All rows are visible at full opacity (no scroll-gated reveal).
    const opacities = await rows(page)
      .locator("[class*='textCard']")
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).opacity)));
    expect(opacities).toHaveLength(5);
    for (const o of opacities) {
      expect(o).toBeGreaterThan(0.9);
    }
  });
});
