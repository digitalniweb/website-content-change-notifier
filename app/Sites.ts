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
		url: string,
		selector: string,
		name: string,
		description: string,
		last_value: string
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
            INSERT INTO sites (url, selector, name, description, last_value)
            VALUES (?, ?, ?, ?, ?)
        `);

		stmt.run(url, selector, name, description, last_value);
		console.log("✅ Site added!");
	}

	static getAllSites() {
		return db.getDb().prepare("SELECT * FROM sites").all() as Site[];
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
                    last_changed TEXT
                )
                `
			)
			.run();
	}
}
