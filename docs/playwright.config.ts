import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against a production build served by `astro preview`.
 * This is the closest representation of what ships, and it exercises the
 * ember-astro integration's build pipeline (babel + @embroider/vite) — so a
 * regression that breaks client rendering of Ember components fails here.
 */
const PORT = 4321;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI
		? [["github"], ["html", { open: "never" }]]
		: "list",
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: "on-first-retry",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
	],
	webServer: {
		command: `pnpm build && pnpm preview --port ${PORT}`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
