import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm.cmd run dev -- --port 4275",
    url: "http://127.0.0.1:4275",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://127.0.0.1:4275",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-1366",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
    },
    {
      name: "desktop-1920",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
