# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Habit Tracker app >> loads the cached app shell when offline after the app has been loaded once
- Location: tests/e2e/app.spec.ts:128:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('dashboard-page')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('dashboard-page')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - main [ref=e12]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: Log in
        - generic [ref=e17]: Use your email and password to continue.
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]: Email
            - textbox "Email" [ref=e22]:
              - /placeholder: name@example.com
          - generic [ref=e23]:
            - generic [ref=e24]: Password
            - textbox "Password" [ref=e25]:
              - /placeholder: ••••••••
          - button "Log in" [ref=e26] [cursor=pointer]
        - paragraph [ref=e27]:
          - text: Don't have an account?
          - link "Sign up" [ref=e28] [cursor=pointer]:
            - /url: /signup
```

# Test source

```ts
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
  106 |     await page.getByTestId("auth-signup-password").fill("password123");
  107 |     await page.getByTestId("auth-signup-submit").click();
  108 | 
  109 |     await page.getByTestId("create-habit-button").click();
  110 |     await page.getByTestId("habit-name-input").fill("Morning Walk");
  111 |     await page.getByTestId("habit-save-button").click();
  112 | 
  113 |     await page.reload();
  114 |     await expect(page.getByTestId("dashboard-page")).toBeVisible();
  115 |     await expect(page.getByTestId("habit-card-morning-walk")).toBeVisible();
  116 |   });
  117 | 
  118 |   test("logs out and redirects to /login", async ({ page }) => {
  119 |     await page.goto("/signup");
  120 |     await page.getByTestId("auth-signup-email").fill("logout@example.com");
  121 |     await page.getByTestId("auth-signup-password").fill("password123");
  122 |     await page.getByTestId("auth-signup-submit").click();
  123 | 
  124 |     await page.getByTestId("auth-logout-button").click();
  125 |     await expect(page).toHaveURL(/\/login$/);
  126 |   });
  127 | 
  128 |   test("loads the cached app shell when offline after the app has been loaded once", async ({
  129 |     browser,
  130 |   }) => {
  131 |     const context = await browser.newContext();
  132 |     const page = await context.newPage();
  133 | 
  134 |     await page.goto("/signup");
  135 |     await page.getByTestId("auth-signup-email").fill("offline@example.com");
  136 |     await page.getByTestId("auth-signup-password").fill("password123");
  137 |     await page.getByTestId("auth-signup-submit").click();
  138 |     console.log("URL after reload 1:", page.url());
  139 | 
  140 |     await page.waitForLoadState("networkidle");
  141 |     await context.setOffline(true);
  142 | 
  143 |     await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
  144 |     console.log("URL after reload 2:", page.url());
  145 |     await page.screenshot({ path: "after-reload.png", fullPage: true });
> 146 |     await expect(page.getByTestId("dashboard-page")).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  147 | 
  148 |     await context.close();
  149 |   });
  150 | });
  151 | 
```