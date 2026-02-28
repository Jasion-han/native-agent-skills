#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);

if (args.length === 0) {
	console.log("Usage: browser-scroll.js <direction> [amount]");
	console.log("\nArguments:");
	console.log("  <direction>  up, down, top, bottom, or element");
	console.log("  [amount]    Pixels (default: 500)");
	console.log("\nExamples:");
	console.log("  browser-scroll.js down");
	console.log("  browser-scroll.js down 1000");
	console.log("  browser-scroll.js top");
	console.log("  browser-scroll.js bottom");
	process.exit(1);
}

const direction = args[0];
const amount = parseInt(args[1]) || 500;

let browser;
let disconnected = false;

async function safeDisconnect() {
	if (browser && !disconnected) {
		disconnected = true;
		await browser.disconnect();
	}
}

process.on("SIGINT", safeDisconnect);
process.on("SIGTERM", safeDisconnect);

try {
	browser = await puppeteer.connect({
		browserURL: "http://localhost:9222",
		defaultViewport: null,
		timeout: 5000,
	});

	const pages = await browser.pages();
	const p = pages.at(-1);

	if (!p) {
		console.error("✗ No active tab found");
		await safeDisconnect();
		process.exit(1);
	}

	switch (direction) {
		case "up":
			await p.evaluate((px) => window.scrollBy({ top: -px, behavior: "instant" }), amount);
			console.log("✓ Scrolled up " + amount + "px");
			break;

		case "down":
			await p.evaluate((px) => window.scrollBy({ top: px, behavior: "instant" }), amount);
			console.log("✓ Scrolled down " + amount + "px");
			break;

		case "top":
			await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
			console.log("✓ Scrolled to top");
			break;

		case "bottom":
			await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
			console.log("✓ Scrolled to bottom");
			break;

		default:
			console.error("✗ Unknown direction: " + direction);
			await safeDisconnect();
			process.exit(1);
	}
} catch (err) {
	console.error("✗ Error: " + err.message);
	await safeDisconnect();
	process.exit(1);
}

await safeDisconnect();
