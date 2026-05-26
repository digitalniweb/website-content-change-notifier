import type { virtualCoinCheckOptions } from "../types/virtulaCoins.ts";
import checkStocks from "./customCheckers/checkStocks.ts";
import checkVirtualCoinPrice from "./customCheckers/checkVirtualCoinPrice.ts";
import { Scheduler } from "./Scheduler.ts";
import { Sites } from "./Sites.ts";

// terminal setup
process.title = process.env.APP_NAME ?? "Website Checker";
console.clear();
console.log("Notification logs:");

if (!Sites.getCount())
	console.log("Nothing to watch yet. Add website via 'npm run addSite'");

// Schedule a task to run every hour divisible by 4 throughout the day and every 5th minute - 00:05, 04:05, 08:05,...
Scheduler.addScheduler("5 */4 * * *", async () => {
	console.log(
		`Checking sites by scraping starting at ${new Date().toLocaleString()}`,
	);
	await Sites.checkAllSitesChanges();
	console.log(`Sites were checked.`);

	// you can write other custom watchers here

	console.log("-----------------------");
});

// you can create other "Schedulers" with different timings - Every hour
Scheduler.addScheduler("0 * * * *", async () => {
	console.log(
		`Checking virtual coins values via API starting at ${new Date().toLocaleString()}`,
	);
	let virtualCoins = [
		{
			name: "bitcoin",
			customName: "BTC",
			watchPriceBelow: 60000,
		},
		{
			name: "dogecoin",
			customName: "DOGECOIN",
			watchPriceBelow: 0.09,
		},
	] as virtualCoinCheckOptions[];
	let coinsCheck = [] as Promise<string>[];
	virtualCoins.forEach((coin) => {
		coinsCheck.push(
			checkVirtualCoinPrice({
				name: coin.name,
				watchPriceBelow: coin.watchPriceBelow,
				customName: coin.customName,
				customNotification: coin.customNotification ?? "",
			}),
		);
	});
	let results = await Promise.all(coinsCheck);
	console.log("-----------------------");
	console.log("Virtual coins values:");

	results.forEach((r) => console.log(r));
	console.log("-----------------------");
});

// you can create other "Schedulers" with different timings - Every hour
Scheduler.addScheduler("0 * * * *", async () => {
	console.log(
		`Checking stock values via API starting at ${new Date().toLocaleString()}`,
	);
	let stocksCheck = [] as Promise<string>[];

	stocksCheck.push(checkStocks({ name: "IONQ", watchPriceBelow: 20 }));
	stocksCheck.push(checkStocks({ name: "INFQ", watchPriceBelow: 10 }));
	stocksCheck.push(checkStocks({ name: "HMC", watchPriceBelow: 20 }));
	stocksCheck.push(checkStocks({ name: "PFE", watchPriceBelow: 20 }));
	stocksCheck.push(checkStocks({ name: "GIS", watchPriceBelow: 25 }));
	let results = await Promise.all(stocksCheck);
	console.log(`TICKER  ${"PRICE".padEnd(11)} WATCH THRESHOLD`);
	results.forEach((r) => console.log(r));
	console.log("-----------------------");
});
