#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);

if (args.length === 0) {
	console.log("Usage: browser-scroll.js <direction> [amount] [options]");
	console.log("\nArguments:");
	console.log("  <direction>  Scroll direction: up, down, top, bottom, or element");
	console.log("  [amount]    Pixels to scroll (default: 500 for up/down)");
	console.log("\nOptions:");
	console.log("  --smooth    Use smooth scrolling animation");
	console.log("\nExamples:");
	console.log("  browser-scroll.js down");
	console.log("  browser-scroll.js down 1000");
	console.log("  browser-scroll.js up 500");
	console.log("  browser-scroll.js top");
	console.log("  browser-scroll.js bottom");
	console.log("  browser-scroll.js element '#footer'");
	process.exit(1);
}

const direction = args[0];
const amount = parseInt(args[1]) || 500;
const useSmooth = args.includes("--smooth");

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

const scrollBehavior = useSmooth ? "smooth" : "auto";

let result;

try {
	switch (direction) {
		case "up":
			result = await p.evaluate((px, behavior) => {
				window.scrollBy({ top: -px, behavior });
				return { direction: "up", pixels: px };
			}, amount, scrollBehavior);
			console.log(`✓ Scrolled up ${amount}px`);
			break;

		case "down":
			result = await p.evaluate((px, behavior) => {
				window.scrollBy({ top: px, behavior });
				return { direction: "down", pixels: px };
			}, amount, scrollBehavior);
			console.log(`✓ Scrolled down ${amount}px`);
			break;

		case "top":
			result = await p.evaluate((behavior) => {
				window.scrollTo({ top: 0, behavior });
				return { direction: "top" };
			}, scrollBehavior);
			console.log("✓ Scrolled to top");
			break;

		case "bottom":
			result = await p.evaluate((behavior) => {
				window.scrollTo({ top: document.body.scrollHeight, behavior });
				return { direction: "bottom" };
			}, scrollBehavior);
			console.log("✓ Scrolled to bottom");
			break;

		case "element":
			const selector = args[1];
			if (!selector) {
				console.error("✗ Element selector required for 'element' direction");
				await b.disconnect();
				process.exit(1);
			}
			result = await p.evaluate((sel, behavior) => {
				const el = document.querySelector(sel);
				if (!el) return { error: `Element not found: ${sel}` };
				el.scrollIntoView({ behavior });
				return { direction: "element", selector: sel };
			}, selector, scrollBehavior);
			if (result.error) {
				console.error(`✗ ${result.error}`);
				await b.disconnect();
				process.exit(1);
			}
			console.log(`✓ Scrolled to element: ${selector}`);
			break;

		default:
			console.error(`✗ Unknown direction: ${direction}`);
			console.error("Valid directions: up, down, top, bottom, element");
			await b.disconnect();
			process.exit(1);
	}
} catch (err) {
	console.error(`✗ Scroll failed: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
