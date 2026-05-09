import { expect, test } from "@playwright/test";

test("shows password fields for the ready lessons on first load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("lesson-select")).toBeVisible();
  await expect(page.getByTestId("lesson-card-basic-gnome-gui")).toBeVisible();
  await expect(page.locator(".lesson-start-button")).toHaveCount(6);
  await expect(page.getByTestId("lesson-card-basic-gnome-gui").locator("button")).toBeEnabled();

  for (const lessonId of [
    "console-from-gui",
    "builtin-command-practice-1",
    "builtin-command-practice-2",
    "shell-shortcut-practice-1",
    "shell-shortcut-practice-2",
  ]) {
    await expect(page.getByTestId(`lesson-card-${lessonId}`).locator("button")).toBeEnabled();
    await expect(page.getByTestId(`lesson-password-${lessonId}`)).toBeVisible();
  }

  await expect(page.getByTestId("lesson-select")).toContainText("開始パスワード");
  await expect(page.getByText("builder: tksarah")).toBeVisible();
});

test("select a lesson, complete it, and return to the lesson list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("lesson-select")).toBeVisible();

  const firstLessonStartButton = page.getByTestId("lesson-card-basic-gnome-gui").locator("button");
  await firstLessonStartButton.scrollIntoViewIfNeeded();
  await firstLessonStartButton.click();
  await expect(page.getByTestId("gdm-login")).toBeVisible();

  await page.getByTestId("username-input").fill("student");
  await page.getByTestId("password-input").fill("wrong");
  await page.getByTestId("signin-button").click();
  await expect(page.getByTestId("gdm-login")).toBeVisible();

  await page.getByTestId("password-input").fill("student");
  await page.getByTestId("signin-button").click();
  await expect(page.getByTestId("desktop")).toBeVisible();

  await page.getByRole("button", { name: "Activities" }).click();
  await expect(page.getByTestId("overview")).toBeVisible();

  await page.locator(".app-tile").filter({ hasText: "Xeyes" }).dblclick();
  await expect(page.getByTestId("xeyes-window")).toBeVisible();
  await page.getByTestId("xeyes-window").locator(".window-close").click();
  await expect(page.getByTestId("xeyes-window")).toBeHidden();

  await page.getByRole("button", { name: "Activities" }).click();
  await page.locator(".app-tile").filter({ hasText: "Files" }).dblclick();
  await expect(page.getByTestId("files-window")).toBeVisible();
  await expect(page.getByRole("region", { name: "/home/student" })).toBeVisible();
  await expect(page.getByRole("button", { name: "README.txt" })).toBeVisible();
  await page.getByTestId("files-window").locator(".window-close").click();
  await expect(page.getByTestId("files-window")).toBeHidden();

  await page.locator(".topbar-icon-button").click();
  await expect(page.getByTestId("lesson-select")).toBeVisible();
  await expect(page.getByTestId("lesson-card-basic-gnome-gui")).toContainText("完了");
});
