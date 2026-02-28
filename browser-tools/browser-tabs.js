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

	switch (action) {
		case "list":
			console.log("Available tabs:");
			for (let i = 0; i < pages.length; i++) {
				const url = pages[i].url();
				const marker = i === pages.length - 1 ? "→" : " ";
				console.log(marker + " [" + i + "] " + url);
			}
			break;

		case "switch":
			const index = parseInt(param);
			if (isNaN(index) || index < 0 || index >= pages.length) {
				console.error("✗ Invalid tab index: " + param + ". Valid range: 0-" + (pages.length - 1));
				await safeDisconnect();
				process.exit(1);
			}
			await pages[index].bringToFront();
			console.log("✓ Switched to tab [" + index + "]");
			break;

		case "switch-url":
			if (!param) {
				console.error("✗ URL parameter required for switch-url");
				await safeDisconnect();
				process.exit(1);
			}
			let found = false;
			for (let i = 0; i < pages.length; i++) {
				const url = pages[i].url();
				if (url.includes(param)) {
					await pages[i].bringToFront();
					console.log("✓ Switched to tab [" + i + "] containing: " + param);
					found = true;
					break;
				}
			}
			if (!found) {
				console.error("✗ No tab found containing: " + param);
				await safeDisconnect();
				process.exit(1);
			}
			break;

		case "new":
			const newUrl = param || "about:blank";
			const newPage = await browser.newPage();
			await newPage.goto(newUrl, { waitUntil: "domcontentloaded", timeout: 10000 });
			console.log("✓ Opened: " + newUrl);
			break;

		case "active":
			const activePage = pages.at(-1);
			console.log("Active tab: " + activePage.url());
			break;

		default:
			console.error("✗ Unknown action: " + action);
			console.error("Valid actions: list, switch, switch-url, new, active");
			await safeDisconnect();
			process.exit(1);
	}
} catch (err) {
	console.error("✗ Error: " + err.message);
	await safeDisconnect();
	process.exit(1);
}

await safeDisconnect();
