import axios from "axios";
import * as cheerio from "cheerio";
import notifier from "node-notifier";
import db from "../db/Database.ts";
import type { Site } from "../types/Site.ts";
export default class Sites {
	constructor() {}

	static checkAllSites(): void {
		const sites = db.getAllSites();
		for (const site of sites) {
			Sites.checkSiteChange(site);
		}
	}

	static async checkSiteChange(site: Site): Promise<void> {
		try {
			const response = await axios.get<string>(site.url, {
				timeout: 10000,
			});
			const $ = cheerio.load(response.data);
			const value = $(site.selector).eq(0).text().trim();

			if (!value) {
				console.log(`⚠️ No match for ${site.name}`);
				return;
			}

			let changed = false;

			if (site.last_value !== value) {
				changed = true;
				console.log(`🔔 Change detected on ${site.name}`);
				notifier.notify({
					title: `${site.name}`,
					message: `${site.description}
					New value: ${value}`,
					wait: false,
					open: site.url,
					// icon: path.resolve(cwd(), "images/mark-green.jpg"), // doesnt work
				});
			}
			db.updateSite(value, changed, site.id);
			// if (changed) return;
			// const now = new Date().toISOString();
			// console.log(`${site.name} checked now ${now} - No changes.`);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(`❌ Error on ${site.name}: ${err.message}`);
			} else {
				console.error(`❌ Unknown error on ${site.name}:`, err);
			}
		}
	}

	static getCount(): number {
		return db.getTableRowsCount("sites");
	}
}
