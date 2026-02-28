#!/usr/bin/env node

import puppeteer from "puppeteer-core";
import { Readability } from "@mozilla/readability";
import { TurndownService } from "turndown";

const url = process.argv[2];

if (!url) {
	console.log("Usage: browser-content.js <url>");
	console.log("\nExample:");
	console.log("  browser-content.js https://example.com/article");
	process.exit(1);
}

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

try {
	const p = await b.newPage();
	await p.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

	const content = await p.evaluate(() => {
		const article = new Readability(document).parse();
		return article ? article.content : document.body.innerHTML;
	});

	const turndown = new TurndownService();
	const markdown = turndown.turndown(content);

	console.log(markdown);

	await p.close();
} catch (err) {
	console.error(`✗ Failed to extract content: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
