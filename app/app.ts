import { Scheduler } from "./Scheduler.ts";
import { Sites } from "./Sites.ts";

if (!Sites.getCount()) console.log("Nothing to watch");

// Schedule a task to run every hour divisible by 4 throughout the day - 00:00, 04:00, 08:00,...
Scheduler.addScheduler("0 */4 * * *", () => {
	Sites.checkAllSitesChanges();
});
