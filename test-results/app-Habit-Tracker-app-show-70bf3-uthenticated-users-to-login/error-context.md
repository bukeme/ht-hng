# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Habit Tracker app >> shows the splash screen and redirects unauthenticated users to /login
- Location: tests/e2e/app.spec.ts:8:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Habit Tracker app", () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto("/");
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  6   |   });
  7   | 
  8   |   test("shows the splash screen and redirects unauthenticated users to /login", async ({
  9   |     page,
  10  |   }) => {
  11  |     await expect(page.getByTestId("splash-screen")).toBeVisible();
  12  |     await expect(page).toHaveURL(/\/login$/);
  13  |   });
  14  | 
  15  |   test("redirects authenticated users from / to /dashboard", async ({
  16  |     page,
  17  |   }) => {
  18  |     await page.goto("/signup");
  19  |     await page.getByTestId("auth-signup-email").fill("e2e@example.com");
  20  |     await page.getByTestId("auth-signup-password").fill("password123");
  21  |     await page.getByTestId("auth-signup-submit").click();
  22  | 
  23  |     await expect(page).toHaveURL(/\/dashboard$/);
  24  | 
  25  |     await page.goto("/");
  26  |     await expect(page).toHaveURL(/\/dashboard$/);
  27  |   });
  28  | 
  29  |   test("prevents unauthenticated access to /dashboard", async ({ page }) => {
  30  |     await page.goto("/dashboard");
  31  |     await expect(page).toHaveURL(/\/login$/);
  32  |   });
  33  | 
  34  |   test("signs up a new user and lands on the dashboard", async ({ page }) => {
  35  |     await page.goto("/signup");
  36  |     await page.getByTestId("auth-signup-email").fill("newuser@example.com");
  37  |     await page.getByTestId("auth-signup-password").fill("password123");
  38  |     await page.getByTestId("auth-signup-submit").click();
  39  | 
  40  |     await expect(page).toHaveURL(/\/dashboard$/);
  41  |     await expect(page.getByTestId("dashboard-page")).toBeVisible();
  42  |   });
  43  | 
  44  |   test("logs in an existing user and loads only that user's habits", async ({
  45  |     page,
  46  |   }) => {
  47  |     await page.goto("/signup");
  48  |     await page.getByTestId("auth-signup-email").fill("owner1@example.com");
  49  |     await page.getByTestId("auth-signup-password").fill("password123");
  50  |     await page.getByTestId("auth-signup-submit").click();
  51  | 
  52  |     await page.getByTestId("create-habit-button").click();
  53  |     await page.getByTestId("habit-name-input").fill("User One Habit");
  54  |     await page.getByTestId("habit-save-button").click();
  55  | 
  56  |     await page.getByTestId("auth-logout-button").click();
  57  |     await expect(page).toHaveURL(/\/login$/);
  58  | 
  59  |     await page.goto("/signup");
  60  |     await page.getByTestId("auth-signup-email").fill("owner2@example.com");
  61  |     await page.getByTestId("auth-signup-password").fill("password123");
  62  |     await page.getByTestId("auth-signup-submit").click();
  63  | 
  64  |     await expect(page.getByText("User One Habit")).toHaveCount(0);
  65  |   });
  66  | 
  67  |   test("creates a habit from the dashboard", async ({ page }) => {
  68  |     await page.goto("/signup");
  69  |     await page.getByTestId("auth-signup-email").fill("create@example.com");
  70  |     await page.getByTestId("auth-signup-password").fill("password123");
  71  |     await page.getByTestId("auth-signup-submit").click();
  72  | 
  73  |     await page.getByTestId("create-habit-button").click();
  74  |     await page.getByTestId("habit-name-input").fill("Drink Water");
  75  |     await page
  76  |       .getByTestId("habit-description-input")
  77  |       .fill("Drink enough water");
  78  |     await page.getByTestId("habit-save-button").click();
  79  | 
  80  |     await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
  81  |   });
  82  | 
  83  |   test("completes a habit for today and updates the streak", async ({
  84  |     page,
  85  |   }) => {
  86  |     await page.goto("/signup");
  87  |     await page.getByTestId("auth-signup-email").fill("streak@example.com");
  88  |     await page.getByTestId("auth-signup-password").fill("password123");
  89  |     await page.getByTestId("auth-signup-submit").click();
  90  | 
  91  |     await page.getByTestId("create-habit-button").click();
  92  |     await page.getByTestId("habit-name-input").fill("Read Books");
  93  |     await page.getByTestId("habit-save-button").click();
  94  | 
  95  |     const slug = "read-books";
  96  |     await expect(page.getByTestId(`habit-streak-${slug}`)).toContainText("0");
  97  | 
  98  |     await page.getByTestId(`habit-complete-${slug}`).click();
  99  | 
  100 |     await expect(page.getByTestId(`habit-streak-${slug}`)).toContainText("1");
  101 |   });
  102 | 
  103 |   test("persists session and habits after page reload", async ({ page }) => {
  104 |     await page.goto("/signup");
  105 |     await page.getByTestId("auth-signup-email").fill("persist@example.com");
```