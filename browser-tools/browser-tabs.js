#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const action = args[0];
const param = args[1];

if (!action) {
	console.log("Usage: browser-tabs.js <action> [param]");
	console.log("\nActions:");
	console.log("  list                           List all tabs");
	console.log("  switch <index>                Switch to tab by index (0-based)");
	console.log("  switch-url <url>              Switch to tab containing URL");
	console.log("  new <url>                    Open new tab with URL");
	console.log("  active                        Show current active tab");
	console.log("\nExamples:");
	console.log("  browser-tabs.js list");
	console.log("  browser-tabs.js switch 2");
	console.log("  browser-tabs.js switch-url 'github.com'");
	console.log("  browser-tabs.js new https://google.com");
	process.exit(1);
}

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

try {
	const pages = await b.pages();

	switch (action) {
		case "list":
			console.log("Available tabs:");
			for (let i = 0; i < pages.length; i++) {
				const url = pages[i].url();
				const title = await pages[i].title().catch(() => "(loading)");
				const marker = i === pages.length - 1 ? "→" : " ";
				console.log(`${marker} [${i}] ${title}`);
				console.log(`    ${url}`);
			}
			break;

		case "switch":
			const index = parseInt(param);
			if (isNaN(index) || index < 0 || index >= pages.length) {
				console.error(`✗ Invalid tab index: ${param}. Valid range: 0-${pages.length - 1}`);
				await b.disconnect();
				process.exit(1);
			}
			const targetPage = pages[index];
			await targetPage.bringToFront();
			const targetUrl = targetPage.url();
			const targetTitle = await targetPage.title().catch(() => "(loading)");
			console.log(`✓ Switched to tab [${index}]: ${targetTitle}`);
			console.log(`  ${targetUrl}`);
			break;

		case "switch-url":
			if (!param) {
				console.error("✗ URL parameter required for switch-url");
				await b.disconnect();
				process.exit(1);
			}
			let found = false;
			for (let i = 0; i < pages.length; i++) {
				const url = pages[i].url();
				if (url.includes(param)) {
					await pages[i].bringToFront();
					const title = await pages[i].title().catch(() => "(loading)");
					console.log(`✓ Switched to tab [${i}] containing: ${param}`);
					console.log(`  ${title}`);
					found = true;
					break;
				}
			}
			if (!found) {
				console.error(`✗ No tab found containing: ${param}`);
				await b.disconnect();
				process.exit(1);
			}
			break;

		case "new":
			const newUrl = param || "about:blank";
			const newPage = await b.newPage();
			await newPage.goto(newUrl, { waitUntil: "domcontentloaded" });
			const allPages = await b.pages();
			const newIndex = allPages.length - 1;
			const newTitle = await newPage.title().catch(() => "(loading)");
			console.log(`✓ Opened new tab [${newIndex}]: ${newTitle}`);
			console.log(`  ${newUrl}`);
			break;

		case "active":
			const activePage = pages.at(-1);
			const activeUrl = activePage.url();
			const activeTitle = await activePage.title().catch(() => "(loading)");
			const activeIndex = pages.length - 1;
			console.log(`Active tab [${activeIndex}]: ${activeTitle}`);
			console.log(`  ${activeUrl}`);
			break;

		default:
			console.error(`✗ Unknown action: ${action}`);
			console.error("Valid actions: list, switch, switch-url, new, active");
			await b.disconnect();
			process.exit(1);
	}
} catch (err) {
	console.error(`✗ Error: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}
