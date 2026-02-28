#!/usr/bin/env node

import { tmpdir } from "node:os";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

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
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const filename = `screenshot-${timestamp}.png`;
	const filepath = join(tmpdir(), filename);

	await p.screenshot({ path: filepath });

	console.log(filepath);
} catch (err) {
	console.error(`✗ Screenshot failed: ${err.message}`);
	await b.disconnect();
	process.exit(1);
}

await b.disconnect();
