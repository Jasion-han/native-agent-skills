#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const options = args.filter(arg => arg.startsWith("--"));
const inputs = args.filter(arg => !arg.startsWith("--"));

const selector = inputs[0];
const text = inputs.slice(1).join(" ");

const shouldClear = options.includes("--clear");
const shouldAppend = options.includes("--append");
const useTyping = options.includes("--typing");

if (!selector || text === undefined) {
	console.log("Usage: browser-type.js <selector> <text> [options]");
	console.log("\nArguments:");
	console.log("  <selector>  CSS selector for the input element");
	console.log("  <text>     Text to type");
	console.log("\nOptions:");
	console.log("  --clear    Clear input before typing");
	console.log("  --append   Append text");
	console.log("  --typing   Simulate real typing");
	console.log("\nExamples:");
	console.log("  browser-type.js '#search-input' 'hello world'");
	console.log("  browser-type.js '#search-input' 'hello' --clear");
	process.exit(1);
}

let browser;
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
		await browser.disconnect();
		process.exit(1);
	}

	const element = await p.$(selector);

	if (!element) {
		console.error(`✗ Element not found: ${selector}`);
		await browser.disconnect();
		process.exit(1);
	}

	await element.scrollIntoViewIfNeeded();
	await element.focus();

	if (useTyping) {
		await element.type(text, { delay: 50 });
	} else {
		await element.evaluate((el, value, shouldClear, shouldAppend) => {
			if (shouldClear || (!shouldAppend && el.value !== "")) {
				el.value = "";
			}
			el.value = el.value + value;
			el.dispatchEvent(new Event("input", { bubbles: true }));
			el.dispatchEvent(new Event("change", { bubbles: true }));
		}, text, shouldClear, shouldAppend);
	}

	console.log(`✓ Typed: "${text}" into ${selector}`);
} catch (err) {
	console.error(`✗ Failed to type: ${err.message}`);
	if (browser) await browser.disconnect();
	process.exit(1);
}

if (browser) await browser.disconnect();
