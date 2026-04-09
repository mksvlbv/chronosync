import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 412, height: 915 },
];

const DIR = "e2e/screenshots";

async function screenshotAll(
  page: import("@playwright/test").Page,
  label: string
) {
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: `${DIR}/${label}-${vp.name}.png`,
      fullPage: true,
    });
  }
}

async function checkNoHorizontalOverflow(
  page: import("@playwright/test").Page,
  label: string
) {
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (overflow) {
      console.log(`⚠️  OVERFLOW on ${label} @ ${vp.name} (${vp.width}px)`);
    }
    expect(overflow, `Horizontal overflow on ${label} @ ${vp.name}`).toBe(
      false
    );
  }
}

async function checkMobileBottomNav(
  page: import("@playwright/test").Page,
  label: string
) {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.waitForTimeout(300);
  const navItems = await page.locator("nav.fixed a").count();
  console.log(`📱 Mobile nav items on ${label}: ${navItems}`);
  expect(navItems, `Bottom nav should have 3 items on ${label}`).toBe(3);

  // Check all 3 items are visible within viewport
  const items = page.locator("nav.fixed a");
  for (let i = 0; i < 3; i++) {
    const box = await items.nth(i).boundingBox();
    expect(box, `Nav item ${i} should be visible on ${label}`).not.toBeNull();
    if (box) {
      expect(
        box.x + box.width,
        `Nav item ${i} should not overflow right on ${label}`
      ).toBeLessThanOrEqual(412);
      expect(
        box.x,
        `Nav item ${i} should not overflow left on ${label}`
      ).toBeGreaterThanOrEqual(0);
    }
  }
}

// ─── TIMER PAGE ───

test.describe("Timer Page", () => {
  test("idle state - all viewports", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await screenshotAll(page, "timer-idle");
    await checkNoHorizontalOverflow(page, "timer-idle");
    await checkMobileBottomNav(page, "timer-idle");
  });

  test("input focused with dropdown - all viewports", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Stop timer if running from another test
    const stopBtn = page.locator("button", { hasText: "Stop" });
    if (await stopBtn.isVisible()) {
      await stopBtn.click();
      await page.waitForTimeout(1000);
    }

    const input = page.locator('input[placeholder="What are you working on?"]');
    // Wait for input to be enabled
    await expect(input).toBeEnabled({ timeout: 5000 });
    await input.click();
    await page.waitForTimeout(500);
    await screenshotAll(page, "timer-input-focused");

    // Check dropdown renders above Start button
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await input.click();
      await page.waitForTimeout(300);
      const dropdown = page.locator(".absolute.top-full.z-50").first();
      const startBtn = page.locator("button", { hasText: "Start" });
      if ((await dropdown.isVisible()) && (await startBtn.isVisible())) {
        const dropBox = await dropdown.boundingBox();
        const btnBox = await startBtn.boundingBox();
        if (dropBox && btnBox) {
          console.log(
            `🔍 Dropdown z-index check @ ${vp.name}: dropdown bottom=${Math.round(dropBox.y + dropBox.height)}, button top=${Math.round(btnBox.y)}`
          );
        }
      }
    }
  });

  test("timer running state - all viewports", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Start the timer
    const startBtn = page.locator("button", { hasText: "Start" });
    if (await startBtn.isEnabled()) {
      await startBtn.click();
      await page.waitForTimeout(1500);
      await screenshotAll(page, "timer-running");

      // Stop it
      const stopBtn = page.locator("button", { hasText: "Stop" });
      if (await stopBtn.isVisible()) {
        await stopBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log("⚠️  Start button disabled — no project selected");
      await screenshotAll(page, "timer-running-disabled");
    }
  });

  test("entries list section - all viewports", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Scroll to entries
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await screenshotAll(page, "timer-entries");
  });
});

// ─── PROJECTS PAGE ───

test.describe("Projects Page", () => {
  test("projects list - all viewports", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await screenshotAll(page, "projects-list");
    await checkNoHorizontalOverflow(page, "projects-list");
    await checkMobileBottomNav(page, "projects-list");
  });

  test("add project modal - all viewports", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Open modal
    await page.locator("button", { hasText: "Add Project" }).click();
    await page.waitForTimeout(300);
    await screenshotAll(page, "projects-modal-add");

    // Check modal is centered and within viewport
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);
      const modal = page.locator(".fixed.inset-0 .relative");
      if (await modal.isVisible()) {
        const box = await modal.boundingBox();
        if (box) {
          expect(
            box.x,
            `Modal left edge should be >= 0 @ ${vp.name}`
          ).toBeGreaterThanOrEqual(0);
          expect(
            box.x + box.width,
            `Modal right edge should be <= ${vp.width} @ ${vp.name}`
          ).toBeLessThanOrEqual(vp.width + 1);
        }
      }
    }
  });

  test("delete confirmation - all viewports", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Click first delete button
    const deleteBtn = page.locator('button[title="Delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(300);
      await screenshotAll(page, "projects-delete-confirm");
    } else {
      console.log("⚠️  No projects to delete");
    }
  });
});

// ─── REPORTS PAGE ───

test.describe("Reports Page", () => {
  test("week view - all viewports", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await screenshotAll(page, "reports-week");
    await checkNoHorizontalOverflow(page, "reports-week");
    await checkMobileBottomNav(page, "reports-week");
  });

  test("day view - all viewports", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Day" }).click();
    await page.waitForTimeout(1000);
    await screenshotAll(page, "reports-day");
    await checkNoHorizontalOverflow(page, "reports-day");
  });

  test("month view - all viewports", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Month" }).click();
    await page.waitForTimeout(1000);
    await screenshotAll(page, "reports-month");
    await checkNoHorizontalOverflow(page, "reports-month");
  });

  test("reports scrolled to table - all viewports", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await screenshotAll(page, "reports-table");
  });
});

// ─── CROSS-CUTTING CHECKS ───

test.describe("Cross-cutting", () => {
  test("no horizontal overflow on any page - mobile", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });

    for (const path of ["/", "/projects", "/reports"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth
      );
      console.log(
        `📏 ${path} @ mobile: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`
      );
      expect(
        scrollWidth,
        `${path} should not have horizontal scroll on mobile`
      ).toBeLessThanOrEqual(clientWidth + 1);
    }
  });

  test("header timer indicator visible when running", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const startBtn = page.locator("button", { hasText: "Start" });
    if (await startBtn.isEnabled()) {
      await startBtn.click();
      await page.waitForTimeout(1500);

      // Navigate away and check header shows timer
      await page.goto("/projects");
      await page.waitForTimeout(500);
      await screenshotAll(page, "header-timer-running");

      // Go back and stop
      await page.goto("/");
      await page.waitForTimeout(500);
      const stopBtn = page.locator("button", { hasText: "Stop" });
      if (await stopBtn.isVisible()) {
        await stopBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("toast appears on actions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Start and stop timer to trigger toast
    const startBtn = page.locator("button", { hasText: "Start" });
    if (await startBtn.isEnabled()) {
      await startBtn.click();
      await page.waitForTimeout(1000);
      const stopBtn = page.locator("button", { hasText: "Stop" });
      await stopBtn.click();
      await page.waitForTimeout(500);

      // Check toast appeared
      await screenshotAll(page, "toast-success");
    }
  });
});
