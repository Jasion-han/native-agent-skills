#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const url = process.argv[2];

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

const p = (await b.pages()).at(-1);
const client = await p.target().createCDPSession();
const cookies = (await client.send("Network.getAllCookies")).cookies;

console.log(JSON.stringify(cookies, null, 2));

await b.disconnect();
