import axios from "axios";
import * as cheerio from "cheerio";
import { exec } from "child_process";
import notifier from "node-notifier";
import path from "path";
import { cwd } from "process";
import db from "../db/Database.ts";
import type { Site } from "../types/Site.ts";
export class Sites {
	constructor() {}

	static async checkAllSitesChanges(): Promise<string[]> {
		const sites = Sites.getAll();
		let promises = [];
		for (const site of sites) {
			promises.push(Sites.checkSiteChange(site));
		}
		return Promise.all(promises);
	}

	static printRows() {
		db.printRows<Site>(Sites.getAll(false), [
			"id",
			"url",
			"selector",
			"name",
			"last_value",
			"last_changed",
			"active",
		]);
	}

	static toggleActive(id: number): number | null {
		return db.toggleDbBoolean<Site, "active">("sites", id, "active");
	}

	static async checkSiteChange(site: Site): Promise<string> {
		try {
			const response = await axios.get<string>(site.url, {
				timeout: 10000,
			});
			const $ = cheerio.load(response.data);
			const value = $(site.selector).eq(0).text().trim();

			if (!value) {
				notifier.notify(
					{
						title: `No value detected - ${site.name}`,
						message: `The value might not exist anymore.
					Last value: ${site.last_value}`,
						wait: false,
						open: site.url, // "open" doesn't work so use callback instead
						icon: path.resolve(cwd(), "images/mark-red.ico"),
					},
					function (error, response, metadata) {
						// "open" doesn't work so use callback instead
						// This works on immediate clicks only. Clicks in history of notifications don't work.
						if (metadata?.activationType === "clicked")
							exec(`start "" "${site.url}"`);
					},
				);
				return `⚠️ No match for ${site.name}`;
			}

			let changed = false;

			if (site.last_value !== value) {
				changed = true;
			}
			Sites.update(value, changed, site.id);
			if (changed) {
				notifier.notify(
					{
						title: `${site.name}`,
						message: `${site.description}
						New value: ${value}`,
						wait: false,
						open: site.url, // "open" doesn't work so use callback instead
						icon: path.resolve(cwd(), "images/mark-green.ico"),
					},
					function (error, response, metadata) {
						// "open" doesn't work so use callback instead
						// This works on immediate clicks only. Clicks in history of notifications don't work.
						if (metadata?.activationType === "clicked")
							exec(`start "" "${site.url}"`);
					},
				);
				return `🔔 Change detected on ${site.name}`;
			}
			return "";
		} catch (err) {
			if (axios.isAxiosError(err)) {
				return `❌ Error on ${site.name}: ${err.message}`;
			} else {
				console.log(`Unknown error on ${site.name}:`, err);

				return `❌ Unknown error on ${site.name}`;
			}
		}
	}

	static getCount(): number {
		return db.getTableRowsCount("sites");
	}

	static add(
		url: Site["url"],
		selector: Site["selector"],
		name: Site["name"],
		description: Site["description"],
		last_value: Site["last_value"],
		active: Site["active"] = 1,
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

		stmt.run(
			url,
			selector,
			name,
			description ?? "",
			last_value ?? "",
			active ?? 1,
		);
		console.log("✅ Site added!");
	}

	static getAll(activeOnly = true) {
		let query = "SELECT * FROM sites";
		if (activeOnly) query += " WHERE active=1";
		return db.getDb().prepare(query).all() as Site[];
	}
	static update(value: string, changed: boolean, siteId: number) {
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
                `,
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
                `,
			)
			.run();
	}
}
