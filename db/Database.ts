import sqliteDb from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Site } from "../types/Site";

class Database {
	static #instance: Database;
	#file: string = "db/data.db";
	#db: InstanceType<typeof sqliteDb>;

	private constructor() {
		this.#db = new sqliteDb(this.#file);

		this.createDbFile();
		this.createSiteTable();
	}

	static getInstance() {
		return (Database.#instance ??= new Database());
	}

	public getDb() {
		return this.#db;
	}

	public getAllSites() {
		return this.#db.prepare("SELECT * FROM sites").all() as Site[];
	}

	public getTableRowsCount(table: string) {
		if (!/^[a-zA-Z0-9_]+$/.test(table)) {
			throw new Error("Invalid table name");
		}
		const { count } = this.#db
			.prepare(`SELECT COUNT(*) as count FROM ${table}`)
			.get() as { count: number };
		return count;
	}

	public updateSite(value: string, changed: boolean, siteId: number) {
		// const now = new Date().toISOString();
		this.#db
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

	public createDbFile() {
		let dbFile = path.resolve(process.cwd(), `db/data.db`);
		if (!fs.existsSync(dbFile)) {
			fs.writeFileSync(dbFile, "", "utf8");
		}
	}

	public createSiteTable() {
		this.#db
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

	public addSite(
		url: string,
		selector: string,
		name: string,
		description: string,
		last_value: string
	) {
		const stmtSelect = this.#db.prepare(`
            SELECT * FROM sites WHERE url=? AND selector=? AND name=?
        `);

		const row = stmtSelect.get(url, selector, name);
		if (row) {
			console.log(`This record already exists!`);
			return;
		}

		const stmt = this.#db.prepare(`
            INSERT INTO sites (url, selector, name, description, last_value)
            VALUES (?, ?, ?, ?, ?)
        `);

		stmt.run(url, selector, name, description, last_value);
		console.log("✅ Site added!");
	}
}
export default Database.getInstance();
