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
	console.log("  --append   Append text (don't clear first)");
	console.log("  --typing   Simulate real typing (character by character)");
	console.log("\nExamples:");
	console.log("  browser-type.js '#search-input' 'hello world'");
	console.log("  browser-type.js '#search-input' 'hello' --clear");
	console.log("  browser-type.js '#search-input' 'extra text' --append");
	console.log("  browser-type.js '#search-input' 'slow typing' --typing");
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

const element = await p.$(selector);

if (!element) {
	console.error(`✗ Element not found: ${selector}`);
	await b.disconnect();
	process.exit(1);
}

	try {
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
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
