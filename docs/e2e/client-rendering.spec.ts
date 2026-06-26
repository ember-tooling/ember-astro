import { test, expect } from "@playwright/test";

/**
 * These tests guard the core promise of ember-astro: that an Ember component
 * placed in an Astro page with `client:only="ember"` actually mounts and
 * renders in the browser. Each assertion targets output that ONLY the Ember
 * component produces (not the surrounding static Astro markup), so if client
 * rendering breaks, the island stays empty and the test fails.
 */

test("props: component renders with passed-in args", async ({ page }) => {
	await page.goto("/examples/props");

	// <Static greeting="Hello" who="World" /> renders `{{@props.greeting}}, {{@props.who}}`
	await expect(page.getByText("Hello, World")).toBeVisible();
});

test("default block content: default slot renders as raw HTML", async ({ page }) => {
	await page.goto("/examples/default-block-content");

	// Demo renders `{{{@slots.default}}}` — the block content incl. a <strong>.
	const island = page.locator("astro-island[component-export='Demo']");
	await expect(island).toContainText("block content here");
	await expect(island.locator("strong", { hasText: "here" })).toBeVisible();
});

test("named slots: each named slot renders into its fieldset", async ({ page }) => {
	await page.goto("/examples/named-slots");

	// The .container element only exists once the Ember component has rendered.
	const container = page.locator(".container");
	await expect(container).toBeVisible();

	// Legends come from the .gjs template; slot bodies come from Astro slots
	// (Astro strips the `slot="…"` attribute, so we match the rendered text).
	for (const legend of ["@slots.one", "@slots.two", "@slots.three"]) {
		await expect(container.locator("legend", { hasText: legend })).toBeVisible();
	}
	for (const body of ["one", "two", "three"]) {
		await expect(container.getByText(body, { exact: true })).toBeVisible();
	}
});

test("nested components: Outer renders and contains Inner", async ({ page }) => {
	await page.goto("/examples/nested-components");

	// Each component template renders its own fieldset+legend. Scope to the
	// fieldset whose *direct* legend is "Outer" so we don't also match the
	// static Astro wrapper <fieldset><legend>Demo</legend>.
	const outer = page.locator('fieldset:has(> legend:text-is("Outer"))');
	await expect(outer).toBeVisible();

	// The Inner island must have rendered nested inside Outer.
	await expect(outer.locator('legend:text-is("Inner")')).toBeVisible();
});
