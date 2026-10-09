import { test, expect } from "@playwright/test";

test("Google signup, refresh, logout, and returning login work", async ({
  page,
}) => {
  const email = `google-${crypto.randomUUID()}@gmail.com`;
  await page.goto("/signup");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await popup.getByRole("button", { name: "Add new account" }).click();
  await popup.locator("#email-input").fill(email);
  await popup.locator("#display-name-input").fill("Google Player");
  await popup.getByRole("button", { name: "Sign in with Google.com" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(
    page.getByRole("heading", { name: "Welcome, Google Player." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  const returningPopup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  const loginPopup = await returningPopup;
  await loginPopup.waitForLoadState();
  await loginPopup.getByText(email, { exact: true }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});

test("closing Google popup allows retry", async ({ page }) => {
  await page.goto("/signup");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await popup.getByRole("button", { name: "Add new account" }).waitFor();
  await popup.close();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Google sign-in was canceled.",
    { timeout: 30000 },
  );
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Create my account" }),
  ).toBeEnabled();
  await expect(page).toHaveURL(/\/signup$/);
});

test("blocked Google popups show recovery instructions", async ({ page }) => {
  await page.addInitScript(() => {
    window.open = () => null;
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Allow pop-ups for this site",
  );
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeEnabled();
});
