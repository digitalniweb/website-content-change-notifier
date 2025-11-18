import { Scheduler } from "./Scheduler.ts";
import { Sites } from "./Sites.ts";

import checkBtcBelowPrice from "./customCheckers/checkBtcBelowPrice.ts";

// terminal setup
process.title = process.env.APP_NAME ?? "Website Checker";
console.clear();
console.log("Notification logs:");

if (!Sites.getCount())
	console.log("Nothing to watch yet. Add website via 'npm run addSite'");

// Schedule a task to run every hour divisible by 4 throughout the day and every 5th minute - 00:05, 04:05, 08:05,...
Scheduler.addScheduler("5 */4 * * *", async () => {
	await Sites.checkAllSitesChanges();
	console.log(`Sites were checked at: ${new Date().toLocaleString()}`);

	// you can write other custom watchers here or create new "Schedulers" with different timings
	checkBtcBelowPrice(80000, "🔔 BTC is under 80k USD!");
});
