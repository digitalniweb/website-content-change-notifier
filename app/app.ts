import cron from "node-cron";
import Sites from "./Sites.ts";

if (!Sites.getCount()) console.log("Nothing to watch");

// check on start
Sites.checkAllSites();

// Schedule a task to run every hour divisible by 4 throughout the day - 00:00, 04:00, 08:00,...
cron.schedule("0 */4 * * *", () => {
	Sites.checkAllSites();
});
