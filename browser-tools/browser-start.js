#!/usr/bin/env node

import { spawn, execSync } from "node:child_process";
import puppeteer from "puppeteer-core";

const useProfile = process.argv[2] === "--profile";

if (process.argv[2] && process.argv[2] !== "--profile") {
	console.log("Usage: browser-start.js [--profile]");
	console.log("\nOptions:");
	console.log("  --profile  Copy your default Chrome profile (cookies, logins)");
	console.log("\nExamples:");
	console.log("  browser-start.js            # Start with fresh profile");
	console.log("  browser-start.js --profile  # Start with your Chrome profile");
	process.exit(1);
}

try {
	execSync("killall 'Google Chrome'", { stdio: "ignore" });
} catch {}

await new Promise((r) => setTimeout(r, 1000));

execSync("mkdir -p ~/.cache/scraping", { stdio: "ignore" });

if (useProfile) {
	execSync(
		'rsync -a --delete "$HOME/Library/Application Support/Google/Chrome/" ~/.cache/scraping/',
		{ stdio: "pipe" },
	);
}

spawn(
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	["--remote-debugging-port=9222", `--user-data-dir=${process.env["HOME"]}/.cache/scraping`],
	{ detached: true, stdio: "ignore" },
).unref();

let connected = false;
for (let i = 0; i < 30; i++) {
	try {
		const browser = await puppeteer.connect({
			browserURL: "http://localhost:9222",
			defaultViewport: null,
		});
		await browser.disconnect();
		connected = true;
		break;
	} catch {
		await new Promise((r) => setTimeout(r, 500));
	}
}

if (!connected) {
	console.error("✗ Failed to connect to Chrome");
	process.exit(1);
}

console.log(`✓ Chrome started on :9222${useProfile ? " with your profile" : ""}`);
