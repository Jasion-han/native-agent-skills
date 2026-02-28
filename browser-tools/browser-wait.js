#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const options = args.filter(arg => arg.startsWith("--"));
const inputs = args.filter(arg => !arg.startsWith("--"));

const mode = inputs[0];
const selector = inputs[1];
const timeout = parseInt(options.find(o => o.startsWith("--timeout="))?.split("=")[1]) || 10000;

if (!mode || !selector) {
	console.log("Usage: browser-wait.js <mode> <selector> [options]");
	console.log("\nArguments:");
	console.log("  <mode>      wait-for or wait-gone");
	console.log("  <selector>  CSS selector");
	console.log("\nOptions:");
	console.log("  --timeout=N  Timeout in ms (default: 10000)");
	console.log("\nExamples:");
	console.log("  browser-wait.js wait-for 'body'");
	console.log("  browser-wait.js wait-gone '.loading'");
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
	const p = pages.at(-1);

	if (!p) {
		console.error("✗ No active tab found");
		await safeDisconnect();
		process.exit(1);
	}

	if (mode === "wait-for") {
		await p.waitForSelector(selector, { timeout });
		console.log("✓ Element found: " + selector);
	} else if (mode === "wait-gone") {
		await p.waitForSelector(selector, { hidden: true, timeout });
		console.log("✓ Element gone: " + selector);
	} else {
		console.error("✗ Unknown mode: " + mode);
		await safeDisconnect();
		process.exit(1);
	}
} catch (err) {
	if (err.name === "TimeoutError") {
		console.error("✗ Timeout: " + selector);
	} else {
		console.error("✗ Error: " + err.message);
	}
	await safeDisconnect();
	process.exit(1);
}

await safeDisconnect();
