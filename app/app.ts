import { Scheduler } from "./Scheduler.ts";
import { Sites } from "./Sites.ts";

import checkBtcBelowPrice from "./customCheckers/checkBtcBelowPrice.ts";

if (!Sites.getCount())
	console.log("Nothing to watch yet. Add website via 'npm run addSite'");

// Schedule a task to run every hour divisible by 4 throughout the day and every 5th minute - 00:05, 04:05, 08:05,...
Scheduler.addScheduler("5 */4 * * *", () => {
	Sites.checkAllSitesChanges();

	// you can write other custom watchers here or create new "Schedulers" with different timings
	checkBtcBelowPrice(100000, "🔔 BTC is under 100k USD");
});
