import axios from "axios";
import * as cheerio from "cheerio";
import notifier from "node-notifier";
import db from "../db/Database.ts";
import type { Site } from "../types/Site.ts";
export class Sites {
	constructor() {}

	static checkAllSitesChanges(): void {
		const sites = Sites.getAllSites();
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
				notifier.notify({
					title: `No value detected - ${site.name}`,
					message: `The value might not exist anymore.
					Last value: ${site.last_value}`,
					wait: false,
					open: site.url,
					// icon: path.resolve(cwd(), "images/mark-red.jpg"), // doesnt work
				});
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
			Sites.updateSite(value, changed, site.id);
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

	static addSite(
		url: Site["url"],
		selector: Site["selector"],
		name: Site["name"],
		description: Site["description"],
		last_value: Site["last_value"],
		active: Site["active"] = 1
	) {
		const stmtSelect = db.getDb().prepare(`
            SELECT * FROM sites WHERE url=? AND selector=? AND name=?
        `);

		const row = stmtSelect.get(url, selector, name);
		if (row) {
			console.log(`This record already exists!`);
			return;
		}

		const stmt = db.getDb().prepare(`
            INSERT INTO sites (url, selector, name, description, last_value, active)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

		stmt.run(url, selector, name, description, last_value, active);
		console.log("✅ Site added!");
	}

	static getAllSites(activeOnly = true) {
		let query = "SELECT * FROM sites";
		if (activeOnly) query += " WHERE active=1";
		return db.getDb().prepare(query).all() as Site[];
	}
	static updateSite(value: string, changed: boolean, siteId: number) {
		// const now = new Date().toISOString();
		db.getDb()
			.prepare(
				`
                UPDATE sites
                SET last_value = ?,
                    last_checked = CURRENT_TIMESTAMP,
                    last_changed = 	CASE 
                                        WHEN ? 
                                        THEN CURRENT_TIMESTAMP 
                                        ELSE last_changed 
                                    END
                WHERE id = ?
                `
			)
			.run(value, changed ? 1 : 0, siteId);
	}

	static createTable() {
		db.getDb()
			.prepare(
				`
                CREATE TABLE IF NOT EXISTS sites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT,
                    selector TEXT,
                    name TEXT,
                    description TEXT,
                    last_value TEXT,
                    last_checked TEXT,
                    last_changed TEXT,
   					active INTEGER DEFAULT 1
                )
                `
			)
			.run();
	}
}
