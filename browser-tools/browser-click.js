#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const selector = process.argv[2];
const options = process.argv.slice(3);

if (!selector) {
	console.log("Usage: browser-click.js <selector> [--double] [--right]");
	console.log("\nArguments:");
	console.log("  <selector>  CSS selector or :nth-child index");
	console.log("\nOptions:");
	console.log("  --double    Double click instead of single click");
	console.log("  --right     Right click (context menu)");
	console.log("\nExamples:");
	console.log("  browser-click.js '#submit-button'");
	console.log("  browser-click.js 'button:nth-child(2)'");
	console.log("  browser-click.js '.item' --double");
	process.exit(1);
}

const isDouble = options.includes("--double");
const isRight = options.includes("--right");

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

const element = await p.$(selector);

if (!element) {
	console.error(`✗ Element not found: ${selector}`);
	await b.disconnect();
	process.exit(1);
}

try {
	await element.scrollIntoViewIfNeeded();
	
	if (isDouble) {
		await element.click({ clickCount: 2 });
	} else if (isRight) {
		await element.click({ button: "right" });
	} else {
		await element.click();
	}
	
	console.log(`✓ Clicked: ${selector}`);
} catch (err) {
	console.error(`✗ Failed to click: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
