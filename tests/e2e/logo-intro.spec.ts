import { test, expect } from "@playwright/test";

test.describe("LogoIntro with Short Logo", () => {
  test("renders short logo intro in dark theme and performs flight transition on click", async ({ page }) => {
    // Set theme to dark in localStorage before load
    await page.addInitScript(() => {
      localStorage.setItem("mf-theme", "dark");
    });

    await page.goto("/");

    // The logo intro overlay should be visible
    const intro = page.locator(".mf-logo-intro");
    await expect(intro).toBeVisible({ timeout: 5000 });

    // In dark theme, logo paths should have fill #FF0000
    const leftPath = page.locator("#intro-piece-o-left path");
    const rightPath = page.locator("#intro-piece-o-right path");
    const letterOPath = page.locator("#intro-piece-letter-o path");
    const letterFPath = page.locator("#intro-piece-letter-f path");
    const letterYPath = page.locator("#intro-piece-letter-y path");
    await expect(leftPath).toHaveAttribute("fill", "#FF0000");
    await expect(rightPath).toHaveAttribute("fill", "#FF0000");
    await expect(letterOPath).toHaveAttribute("fill", "#FF0000");
    await expect(letterFPath).toHaveAttribute("fill", "#FF0000");
    await expect(letterYPath).toHaveAttribute("fill", "#FF0000");

    // Click to start flying O's transition
    await intro.click();

    // After flight finishes, the intro should unmount and navbar brand logo should be visible
    await expect(intro).not.toBeVisible({ timeout: 6000 });
    const navBrand = page.locator("[data-mf-nav-brand]").first();
    await expect(navBrand).toBeVisible();
  });

  test("renders short logo intro in red theme with black logo", async ({ page }) => {
    // Set theme to red in localStorage before load
    await page.addInitScript(() => {
      localStorage.setItem("mf-theme", "red");
    });

    await page.goto("/");

    // The logo intro overlay should be visible
    const intro = page.locator(".mf-logo-intro");
    await expect(intro).toBeVisible({ timeout: 5000 });

    // In red theme, logo paths should have fill #000000
    const leftPath = page.locator("#intro-piece-o-left path");
    const rightPath = page.locator("#intro-piece-o-right path");
    const letterOPath = page.locator("#intro-piece-letter-o path");
    const letterFPath = page.locator("#intro-piece-letter-f path");
    const letterYPath = page.locator("#intro-piece-letter-y path");
    await expect(leftPath).toHaveAttribute("fill", "#000000");
    await expect(rightPath).toHaveAttribute("fill", "#000000");
    await expect(letterOPath).toHaveAttribute("fill", "#000000");
    await expect(letterFPath).toHaveAttribute("fill", "#000000");
    await expect(letterYPath).toHaveAttribute("fill", "#000000");

    // Ensure click to start prompt is removed
    await expect(page.locator(".mf-intro-prompt")).toHaveCount(0);

    // Press Escape to dismiss/flight
    await page.keyboard.press("Escape");

    // Intro should disappear quickly
    await expect(intro).not.toBeVisible({ timeout: 4000 });
  });

  test("auto-triggers flight without requiring user click", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator(".mf-logo-intro");
    await expect(intro).toBeVisible({ timeout: 5000 });

    // Ensure prompt does not exist
    await expect(page.locator(".mf-intro-prompt")).toHaveCount(0);

    // After brief hold, auto-flight should trigger and finish
    await expect(intro).not.toBeVisible({ timeout: 8000 });
    const navBrand = page.locator("[data-mf-nav-brand]").first();
    await expect(navBrand).toBeVisible();
  });
});
