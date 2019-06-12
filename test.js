"use strict";
const {after, before, it} = require("mocha");
const puppeteer = require("puppeteer");
const puppeteerCoverage = require("puppeteer-to-istanbul");

const runInBrowser = func => () => page.evaluate(func);

let browser, page;



// @todo also use npmjs.com/puppeteer-firefox
before(async () =>
{
	browser = await puppeteer.launch({ args: ["--no-sandbox"] });
	page = await browser.newPage();

	page.on("console", async msg => console[msg._type](...await Promise.all(msg.args().map(arg => arg.jsonValue()))));
	page.on("pageerror", console.error);

	await Promise.all(
	[
		page.addScriptTag({ path: "node_modules/chai/chai.js" }),
		page.addScriptTag({ path: "demo/build.js" }),

		// @todo https://github.com/istanbuljs/puppeteer-to-istanbul/issues/18
		// @todo https://github.com/GoogleChrome/puppeteer/issues/3570
		page.coverage.startJSCoverage({ reportAnonymousScripts: true })
	]);

	await page.evaluate(() =>
	{
		// For awaiting asynchronous behavior
		window.delay = () => new Promise(resolve => setTimeout(() => resolve(), 10));

		// Alias for MutationObserver
		window.asyncMutation = delay;

		window.expect = chai.expect;
		delete window.chai; // cleanup
	});
});



after(async () =>
{
	let coverage = await page.coverage.stopJSCoverage();

	// Exclude tools
	coverage = coverage.filter(({url}) => !url.includes("chai"));

	puppeteerCoverage.write(coverage);

	browser.close();
});



it("is a (bundled) function", runInBrowser(() =>
{
	expect(window.VirtualList).to.be.a("function");
}));