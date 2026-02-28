#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const url = process.argv[2];

if (!url) {
	console.log("Usage: browser-content.js <url>");
	console.log("\nExample:");
	console.log("  browser-content.js https://example.com/article");
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

	const p = await browser.newPage();
	await p.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

	const content = await p.evaluate(() => {
		return document.body.innerText.substring(0, 5000);
	});

	console.log(content);

	await p.close();
} catch (err) {
	console.error("✗ Failed: " + err.message);
	await safeDisconnect();
	process.exit(1);
}

await safeDisconnect();
