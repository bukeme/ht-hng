import { test, expect } from "@playwright/test";

test.describe("Habit Tracker app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the splash screen and redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects authenticated users from / to /dashboard", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("e2e@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("newuser@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("owner1@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("User One Habit");
    await page.getByTestId("habit-save-button").click();

    await page.getByTestId("auth-logout-button").click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("owner2@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await expect(page.getByText("User One Habit")).toHaveCount(0);
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("create@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Drink Water");
    await page
      .getByTestId("habit-description-input")
      .fill("Drink enough water");
    await page.getByTestId("habit-save-button").click();

    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("streak@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Read Books");
    await page.getByTestId("habit-save-button").click();

    const slug = "read-books";
    await expect(page.getByTestId(`habit-streak-${slug}`)).toContainText("0");

    await page.getByTestId(`habit-complete-${slug}`).click();

    await expect(page.getByTestId(`habit-streak-${slug}`)).toContainText("1");
  });

  test("persists session and habits after page reload", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("persist@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Morning Walk");
    await page.getByTestId("habit-save-button").click();

    await page.reload();
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("habit-card-morning-walk")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("logout@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await page.getByTestId("auth-logout-button").click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("offline@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();
    console.log("URL after reload 1:", page.url());

    await page.waitForLoadState("networkidle");
    await context.setOffline(true);

    await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
    console.log("URL after reload 2:", page.url());
    await page.screenshot({ path: "after-reload.png", fullPage: true });
    await expect(page.getByTestId("dashboard-page")).toBeVisible();

    await context.close();
  });
});
