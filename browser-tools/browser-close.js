#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const param = args[0];

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

try {
	const pages = await b.pages();
	
	if (pages.length <= 1) {
		console.error("✗ Cannot close the last tab");
		await b.disconnect();
		process.exit(1);
	}

	if (!param) {
		const pageToClose = pages.at(-1);
		const url = pageToClose.url();
		const title = await pageToClose.title().catch(() => "(loading)");
		await pageToClose.close();
		console.log(`✓ Closed tab: ${title}`);
		console.log(`  ${url}`);
	} else {
		const index = parseInt(param);
		if (isNaN(index) || index < 0 || index >= pages.length) {
			console.error(`✗ Invalid tab index: ${param}. Valid range: 0-${pages.length - 1}`);
			await b.disconnect();
			process.exit(1);
		}
		const pageToClose = pages[index];
		const url = pageToClose.url();
		const title = await pageToClose.title().catch(() => "(loading)");
		await pageToClose.close();
		console.log(`✓ Closed tab [${index}]: ${title}`);
		console.log(`  ${url}`);
	}
} catch (err) {
	console.error(`✗ Error closing tab: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
