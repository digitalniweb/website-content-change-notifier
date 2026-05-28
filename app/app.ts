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
	let results = await Sites.checkAllSitesChanges();
	console.log(`Sites were checked`);

	let noChanges = true;
	results.forEach((r) => {
		if (r) {
			noChanges = false;
			console.log(r);
		}
	});
	if (noChanges) console.log("No changes");

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
	console.log(
		`${"NAME".padEnd(10)} ${"PRICE".padEnd(8)} ${"WATCH".padEnd(8)} CURRENCY`,
	);
	results.forEach((r) => console.log(r));
	console.log("-----------------------");
});

// you can create other "Schedulers" with different timings - Every hour
Scheduler.addScheduler("0 * * * *", async () => {
	let dayIndex = new Date().getDay();
	if (dayIndex % 6 === 0) {
		console.log("It's weekend my dude. Stock market is closed.");
		return;
	}

	console.log(
		`Checking stock values via API starting at ${new Date().toLocaleString()}`,
	);

	let stocksCheck = [] as Promise<string>[];

	let stocksToCheck = [
		{ name: "IONQ", watchPriceBelow: 20 },
		{ name: "INFQ", watchPriceBelow: 10 },
		{ name: "HMC", watchPriceBelow: 20 },
		{ name: "PFE", watchPriceBelow: 20 },
		{ name: "GIS", watchPriceBelow: 25 },
		{ name: "NOK", watchPriceBelow: 10 },
		{ name: "SMR", watchPriceBelow: 9 },
		{ name: "QS", watchPriceBelow: 7 },
		{ name: "CSG.AS", watchPriceBelow: 10 },
	];

	stocksToCheck.forEach((stock) => stocksCheck.push(checkStocks(stock)));

	let results = await Promise.all(stocksCheck);
	console.log(`TICKER  ${"PRICE".padEnd(9)} WATCH  CURRENCY CURRENTLY`);
	results.forEach((r) => console.log(r));
	console.log("-----------------------");
});
