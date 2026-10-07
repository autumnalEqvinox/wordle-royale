import { test, expect, type Page } from "@playwright/test";

const password = "RoyalGuess!42";
const uniqueEmail = () => `royal-${crypto.randomUUID()}@example.com`;

async function createAccount(page: Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Player name").fill("Word Wizard");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(
    page.getByRole("heading", { name: "Welcome, Word Wizard." }),
  ).toBeVisible();
}

test("creates an account, persists across refresh, logs out, and logs back in", async ({
  page,
}) => {
  const email = uniqueEmail();
  await createAccount(page, email);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome, Word Wizard." }),
  ).toBeVisible();
  await page.goto("/login");
  await expect(page).toHaveURL(/\/play$/);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/play");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Let’s play" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await page.reload();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});

test("signed-out visitors cannot see the protected account page", async ({
  page,
}) => {
  await page.goto("/play");
  await expect(
    page.getByText("Your Wordle Royale account is ready."),
  ).not.toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});

test("validates required fields and matching passwords before signup", async ({
  page,
}) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(
    page.getByText("Enter a player name with at least 2 characters."),
  ).toBeVisible();
  await expect(page.getByLabel("Player name")).toBeFocused();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(
    page.getByText("Use at least 8 characters for your password."),
  ).toBeVisible();
  await page.getByLabel("Player name").fill("Word Wizard");
  await page.getByLabel("Email address").fill(uniqueEmail());
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill("Different!42");
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page.getByText("Your passwords don’t match.")).toBeVisible();
  await expect(page.getByLabel("Confirm password")).toBeFocused();
});

test("shows a useful error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(uniqueEmail());
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Let’s play" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "That email and password don’t match. Please try again.",
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("shows an error when an email is already registered", async ({ page }) => {
  const email = uniqueEmail();
  await createAccount(page, email);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/signup");
  await page.getByLabel("Player name").fill("Another Wizard");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "An account with this email already exists. Log in instead.",
  );
});

test("password reset requests succeed without exposing account existence", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(uniqueEmail());
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "If an account exists for this email, you’ll receive a link to reset your password.",
    ),
  ).toBeVisible();
});

test("session-only login persists on refresh without signing in a new tab", async ({
  page,
  context,
}) => {
  const email = uniqueEmail();
  await createAccount(page, email);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Keep me signed in").uncheck();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await page.reload();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto("/play");
  await expect(other).toHaveURL(/\/login$/);
  await other.close();
});

test("password visibility, navigation, and keyboard-accessible help work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Show passwords" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Hide passwords" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByRole("button", { name: "How to play" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "How to play" })).toBeFocused();
  await page.getByRole("link", { name: "Sign up", exact: true }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByLabel("Password", { exact: true })).toBeEmpty();
});

test("forms fit desktop, tablet, and small phone screens", async ({
  page,
}, testInfo) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/signup");
    await expect(
      page.getByRole("button", { name: "Create my account" }),
    ).toBeEnabled();
    const size = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(size.scroll).toBeLessThanOrEqual(size.viewport);
    if (testInfo.project.name === "chrome" && [1440, 390].includes(width)) {
      await page.screenshot({
        path: testInfo.outputPath(`signup-${width}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  if (testInfo.project.name === "chrome") {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Let’s play" }),
    ).toBeEnabled();
    await page.screenshot({
      path: testInfo.outputPath("login-desktop.png"),
      fullPage: true,
      animations: "disabled",
    });
  }
});
