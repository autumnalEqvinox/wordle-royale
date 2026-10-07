import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
  ],
  webServer: [
    {
      command: process.env.FIREBASE_CLI_PATH
        ? `node "${process.env.FIREBASE_CLI_PATH}" emulators:start --only auth --project demo-wordle-royale`
        : "npm exec --yes --package=firebase-tools@15.32.1 -- firebase emulators:start --only auth --project demo-wordle-royale",
      url: "http://127.0.0.1:9099",
      timeout: 180_000,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-wordle-royale.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-wordle-royale",
        NEXT_PUBLIC_FIREBASE_APP_ID: "demo-wordle-royale-app",
        NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: "http://127.0.0.1:9099",
      },
    },
  ],
});
