#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

try {
	const pages = await b.pages();
	const p = pages.at(-1);

	if (!p) {
		console.error("✗ No active tab found");
		await b.disconnect();
		process.exit(1);
	}

	const client = await p.target().createCDPSession();
	const cookies = (await client.send("Network.getAllCookies")).cookies;

	console.log(JSON.stringify(cookies, null, 2));
} catch (err) {
	console.error(`✗ Failed to get cookies: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
