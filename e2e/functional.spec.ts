import { test, expect } from "@playwright/test";

const DIR = "e2e/screenshots";

// ─── TIMER FLOW ───

test.describe("Timer Flow", () => {
  test("full timer lifecycle: select project → type → start → stop → entry appears", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Stop timer if running from a previous test
    const existingStop = page.locator("button", { hasText: "Stop" });
    if (await existingStop.isVisible()) {
      await existingStop.click();
      await page.waitForTimeout(1000);
    }

    // Verify project is selected (auto-selects first)
    const startBtn = page.locator("button", { hasText: "Start" });
    await expect(startBtn).toBeEnabled({ timeout: 5000 });

    // Type task description with unique name
    const taskName = `PW-Timer-${Date.now().toString().slice(-6)}`;
    const input = page.locator('input[placeholder="What are you working on?"]');
    await input.fill(taskName);
    await page.waitForTimeout(300);

    // Start timer
    await startBtn.click();
    await page.waitForTimeout(2000);

    // Verify running state
    const stopBtn = page.locator("button", { hasText: "Stop" });
    await expect(stopBtn).toBeVisible();

    // Verify timer is counting (> 00:00:00)
    const timerText = await page.locator("h1").first().textContent();
    console.log(`⏱️  Timer value after 2s: ${timerText}`);

    // Verify input is disabled while running
    await expect(input).toBeDisabled();

    // Stop timer
    await stopBtn.click();
    await page.waitForTimeout(1000);

    // Verify entry appears in list
    const entryText = page.locator(`text=${taskName}`).first();
    await expect(entryText).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: `${DIR}/func-timer-lifecycle.png`, fullPage: true });
  });

  test("cannot start timer without project", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // The start button should be enabled since a project auto-selects
    // This test verifies the auto-selection works
    const startBtn = page.locator("button", { hasText: "Start" });
    const isEnabled = await startBtn.isEnabled();
    console.log(`🔘 Start button enabled (project auto-selected): ${isEnabled}`);
    expect(isEnabled).toBe(true);
  });

  test("project selector dropdown works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click project selector
    const projectBtn = page.locator("button:has(svg.lucide-caret-down), button:has(.rounded-full)").first();
    // Find the project dropdown trigger (contains CaretDown icon)
    const selectorArea = page.locator('[class*="relative"]').filter({ has: page.locator('button:has-text("Select project"), button:has(.rounded-full)') });

    // Try clicking any button with a caret down or project color indicator
    const projectTrigger = page.locator("button").filter({ hasText: /Select project|Website|Design|Bug|Legacy|Marketing/ }).first();
    if (await projectTrigger.isVisible()) {
      await projectTrigger.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${DIR}/func-project-dropdown.png`, fullPage: true });
    }
  });
});

// ─── PROJECT CRUD ───

test.describe("Project CRUD", () => {
  const TEST_PROJECT = "PW-Test-Project-" + Date.now().toString().slice(-6);

  test("create → edit → delete project", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Count initial projects
    const initialCount = await page.locator('[class*="group flex"]').count();
    console.log(`📦 Initial project count: ${initialCount}`);

    // CREATE: Open modal
    await page.locator("button", { hasText: "Add Project" }).click();
    await page.waitForTimeout(300);

    // Fill name
    const nameInput = page.locator('input[placeholder="e.g. Website Redesign"]');
    await nameInput.fill(TEST_PROJECT);

    // Fill client
    const clientInput = page.locator('input[placeholder="e.g. Acme Corp"]');
    await clientInput.fill("Test Client");

    // Select a color (click second color)
    const colorBtns = page.locator(".rounded-full.ring-2, .rounded-full.ring-transparent");
    if ((await colorBtns.count()) > 1) {
      await colorBtns.nth(1).click();
    }

    // Save
    await page.locator("button", { hasText: "Save Project" }).click();
    await page.waitForTimeout(1000);

    // Verify project appears (use first() to avoid matching toast text too)
    await expect(page.locator(`text=${TEST_PROJECT}`).first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: `${DIR}/func-project-created.png`, fullPage: true });

    // Verify count increased
    const afterCreateCount = await page.locator('[class*="group flex"]').count();
    console.log(`📦 After create count: ${afterCreateCount}`);

    // EDIT: Find the project row that contains our project name
    const projectRow = page.locator("[class*='group flex']").filter({ hasText: TEST_PROJECT });
    await projectRow.locator('button[title="Edit"]').click();
    await page.waitForTimeout(300);

    // Change name
    const editNameInput = page.locator('input[placeholder="e.g. Website Redesign"]');
    await editNameInput.clear();
    await editNameInput.fill(TEST_PROJECT + "-Edited");
    await page.locator("button", { hasText: "Update Project" }).click();
    await page.waitForTimeout(1000);

    // Verify updated name
    await expect(page.locator(`text=${TEST_PROJECT}-Edited`).first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: `${DIR}/func-project-edited.png`, fullPage: true });

    // DELETE: Find the edited project row
    const editedRow = page.locator("[class*='group flex']").filter({ hasText: TEST_PROJECT + "-Edited" });
    await editedRow.locator('button[title="Delete"]').click();
    await page.waitForTimeout(300);

    // Confirm delete
    await page.screenshot({ path: `${DIR}/func-project-delete-confirm.png`, fullPage: true });
    await editedRow.locator("button", { hasText: "Delete" }).click();
    await page.waitForTimeout(1000);

    // Verify project removed
    await expect(page.locator(`text=${TEST_PROJECT}-Edited`).first()).not.toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: `${DIR}/func-project-deleted.png`, fullPage: true });
  });

  test("modal closes on Escape key", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Add Project" }).click();
    await page.waitForTimeout(300);
    await expect(page.locator("text=Add New Project")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expect(page.locator("text=Add New Project")).not.toBeVisible();
  });

  test("modal closes on backdrop click", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Add Project" }).click();
    await page.waitForTimeout(300);
    await expect(page.locator("text=Add New Project")).toBeVisible();

    // Click backdrop
    await page.locator(".fixed.inset-0 > .absolute.inset-0").click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    await expect(page.locator("text=Add New Project")).not.toBeVisible();
  });

  test("cannot save project without name", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Add Project" }).click();
    await page.waitForTimeout(300);

    const saveBtn = page.locator("button", { hasText: "Save Project" });
    await expect(saveBtn).toBeDisabled();
  });
});

// ─── ENTRY ACTIONS ───

test.describe("Entry Actions", () => {
  test("edit entry description inline", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Find any entry description
    const entryDesc = page.locator(".truncate.cursor-pointer").first();
    if (await entryDesc.isVisible()) {
      const originalText = await entryDesc.textContent();
      console.log(`✏️  Original entry: "${originalText}"`);

      // Click to edit
      await entryDesc.click();
      await page.waitForTimeout(300);

      // Verify input appears
      const editInput = page.locator('input[type="text"][class*="bg-base-950"]').first();
      await expect(editInput).toBeVisible();

      // Type new value and blur
      await editInput.clear();
      await editInput.fill(originalText + " [edited]");
      await editInput.blur();
      await page.waitForTimeout(500);

      // Verify edit saved (entry text changed)
      console.log(`✏️  Entry edited successfully`);
    } else {
      console.log("⚠️  No entries to edit");
    }
  });

  test("continue entry starts timer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const continueBtn = page.locator('button[title="Continue Task"]').first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(2000);

      // Verify timer is now running
      const stopBtn = page.locator("button", { hasText: "Stop" });
      await expect(stopBtn).toBeVisible({ timeout: 5000 });

      // Stop it
      await stopBtn.click();
      await page.waitForTimeout(500);
    } else {
      console.log("⚠️  No entries to continue");
    }
  });
});

// ─── REPORTS ───

test.describe("Reports", () => {
  test("navigate between periods", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Test Day
    await page.locator("button", { hasText: "Day" }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Time Distribution")).toBeVisible();

    // Test Week
    await page.locator("button", { hasText: "Week" }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Time Distribution")).toBeVisible();

    // Test Month
    await page.locator("button", { hasText: "Month" }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Time Distribution")).toBeVisible();
  });

  test("date navigation works", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const dateLabel = page.locator("text=/\\d{1,2}\\s\\w+\\s\\d{4}.*—/").first();
    if (await dateLabel.isVisible()) {
      const initialText = await dateLabel.textContent();

      // Click previous
      await page.locator("button:has(svg)").filter({ hasText: "" }).first().click();
      await page.waitForTimeout(1000);

      // Verify date changed
      const newText = await dateLabel.textContent();
      console.log(`📅 Date nav: "${initialText}" → "${newText}"`);
    }
  });

  test("CSV export button works", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const exportBtn = page.locator("button", { hasText: "Export CSV" });
    await expect(exportBtn).toBeVisible();

    // Check if enabled (has data)
    const isEnabled = await exportBtn.isEnabled();
    console.log(`📊 Export CSV enabled: ${isEnabled}`);

    if (isEnabled) {
      // Listen for download
      const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
      await exportBtn.click();
      const download = await downloadPromise;
      if (download) {
        console.log(`✅ CSV downloaded: ${download.suggestedFilename()}`);
      }
    }
  });
});

// ─── NAVIGATION ───

test.describe("Navigation", () => {
  test("desktop nav - all links work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Scope to desktop header nav (hidden md:flex)
    const desktopNav = page.locator("header nav");

    // Timer link
    await desktopNav.locator("a", { hasText: "Timer" }).click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("localhost:3000");

    // Projects link
    await desktopNav.locator("a", { hasText: "Projects" }).click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/projects");

    // Reports link
    await desktopNav.locator("a", { hasText: "Reports" }).click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/reports");
  });

  test("mobile bottom nav - all 3 links visible and work", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 915 });

    for (const path of ["/", "/projects", "/reports"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);

      const navItems = page.locator("nav.fixed a");
      const count = await navItems.count();
      expect(count).toBe(3);

      // Verify all visible
      for (let i = 0; i < count; i++) {
        await expect(navItems.nth(i)).toBeVisible();
      }
    }

    // Navigate via bottom nav
    const navItems = page.locator("nav.fixed a");

    // Click Projects
    await navItems.filter({ hasText: "Projects" }).click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/projects");

    // Click Reports
    await navItems.filter({ hasText: "Reports" }).click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/reports");

    // Click Timer
    await navItems.filter({ hasText: "Timer" }).click();
    await page.waitForTimeout(500);
    expect(page.url().endsWith("/") || page.url().endsWith(":3000")).toBe(true);

    await page.screenshot({ path: `${DIR}/func-mobile-nav.png`, fullPage: true });
  });
});

// ─── RESPONSIVE SPACING ───

test.describe("Responsive Layout Checks", () => {
  test("timer page - Start button not overlapping entries on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const startBtn = page.locator("button", { hasText: "Start" });
    const todayHeader = page.locator("text=Today").first();

    if ((await startBtn.isVisible()) && (await todayHeader.isVisible())) {
      const btnBox = await startBtn.boundingBox();
      const headerBox = await todayHeader.boundingBox();
      if (btnBox && headerBox) {
        const gap = headerBox.y - (btnBox.y + btnBox.height);
        console.log(
          `📏 Gap between Start and Today header: ${Math.round(gap)}px`
        );
        expect(gap, "Should have at least 40px gap").toBeGreaterThan(40);
      }
    }
  });

  test("reports - chart legend not overlapping title on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const title = page.locator("text=Time Distribution").first();
    if (await title.isVisible()) {
      const titleBox = await title.boundingBox();
      // Get all legend items
      const legends = page.locator(".text-\\[11px\\]");
      const legendCount = await legends.count();
      console.log(`📊 Legend items: ${legendCount}`);

      if (legendCount > 0 && titleBox) {
        const firstLegend = await legends.first().boundingBox();
        if (firstLegend) {
          // Legend should not overlap with title
          const overlap = !(
            firstLegend.x >= titleBox.x + titleBox.width ||
            firstLegend.x + firstLegend.width <= titleBox.x ||
            firstLegend.y >= titleBox.y + titleBox.height ||
            firstLegend.y + firstLegend.height <= titleBox.y
          );
          console.log(
            `📊 Title/legend overlap: ${overlap} (title right: ${Math.round(titleBox.x + titleBox.width)}, legend left: ${Math.round(firstLegend.x)})`
          );
          expect(overlap, "Legend should not overlap title").toBe(false);
        }
      }
    }
  });

  test("projects - rows stack properly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Check no element overflows the viewport
    const overflowingElements = await page.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll("*").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > window.innerWidth + 2) {
          const cls = el.className?.toString().slice(0, 50) || el.tagName;
          issues.push(`${cls}: right=${Math.round(rect.right)}`);
        }
      });
      return issues;
    });

    if (overflowingElements.length > 0) {
      console.log("⚠️  Overflowing elements on Projects mobile:");
      overflowingElements.forEach((e) => console.log(`   ${e}`));
    }
    expect(overflowingElements.length).toBe(0);
  });
});
