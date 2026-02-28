#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const url = process.argv[2];
const newTab = process.argv[3] === "--new";

if (!url) {
	console.log("Usage: browser-nav.js <url> [--new]");
	console.log("\nExamples:");
	console.log("  browser-nav.js https://example.com       # Navigate current tab");
	console.log("  browser-nav.js https://example.com --new # Open in new tab");
	process.exit(1);
}

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

const pages = await b.pages();
const p = pages.at(-1);

if (!p) {
	console.error("✗ No active tab found");
	await b.disconnect();
	process.exit(1);
}

try {
	if (newTab) {
		const newPage = await b.newPage();
		await newPage.goto(url, { waitUntil: "domcontentloaded" });
		console.log("✓ Opened:", url);
	} else {
		await p.goto(url, { waitUntil: "domcontentloaded" });
		console.log("✓ Navigated to:", url);
	}
} catch (err) {
	console.error(`✗ Navigation failed: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
