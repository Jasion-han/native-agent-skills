#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const options = args.filter(arg => arg.startsWith("--"));
const inputs = args.filter(arg => !arg.startsWith("--"));

const mode = inputs[0];
const selector = inputs[1];
const timeout = parseInt(options.find(o => o.startsWith("--timeout="))?.split("=")[1]) || 10000;

const waitForVisible = options.includes("--visible");
const waitForHidden = options.includes("--hidden");

if (!mode || !selector) {
	console.log("Usage: browser-wait.js <mode> <selector> [options]");
	console.log("\nArguments:");
	console.log("  <mode>      wait-for or wait-gone");
	console.log("  <selector>  CSS selector to wait for");
	console.log("\nOptions:");
	console.log("  --visible   Wait for element to be visible");
	console.log("  --hidden    Wait for element to be hidden/removed");
	console.log("  --timeout=N  Timeout in milliseconds (default: 10000)");
	console.log("\nExamples:");
	console.log("  browser-wait.js wait-for '#loading-spinner' --visible");
	console.log("  browser-wait.js wait-gone '.loading'");
	console.log("  browser-wait.js wait-for '.modal' --timeout=5000");
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
	let found = false;
	let visible = false;

	if (mode === "wait-for") {
		await p.waitForSelector(selector, { 
			visible: waitForVisible,
			hidden: waitForHidden,
			timeout 
		});
		console.log(`✓ Element found: ${selector}`);
	} else if (mode === "wait-gone") {
		await p.waitForSelector(selector, { 
			hidden: true, 
			timeout 
		});
		console.log(`✓ Element gone: ${selector}`);
	} else {
		console.error(`✗ Unknown mode: ${mode}`);
		console.error("Valid modes: wait-for, wait-gone");
		await b.disconnect();
		process.exit(1);
	}
} catch (err) {
	if (err.name === "TimeoutError") {
		console.error(`✗ Timeout waiting for: ${selector}`);
	} else {
		console.error(`✗ Wait failed: ${err.message}`);
	}
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
