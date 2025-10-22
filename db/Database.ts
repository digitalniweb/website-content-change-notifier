import sqliteDb from "better-sqlite3";
import fs from "fs";
import path from "path";

class Database {
	static #instance: Database;
	#file: string = "db/data.db";
	#db: InstanceType<typeof sqliteDb>;

	private constructor() {
		this.#db = new sqliteDb(this.#file);

		this.createDbFile();
		this.createTables();
	}

	static getInstance() {
		return (Database.#instance ??= new Database());
	}

	public getDb() {
		return this.#db;
	}

	private escapeTableName(table: string) {
		if (!/^[a-zA-Z0-9_]+$/.test(table)) {
			throw new Error("Invalid table name");
		}
	}

	public getTableRowsCount(table: string) {
		this.escapeTableName(table);
		const { count } = this.#db
			.prepare(`SELECT COUNT(*) as count FROM ${table}`)
			.get() as { count: number };
		return count;
	}

	public createDbFile() {
		let dbFile = path.resolve(process.cwd(), `db/data.db`);
		if (!fs.existsSync(dbFile)) {
			fs.writeFileSync(dbFile, "", "utf8");
		}
	}

	public async createTables() {
		let importSites = await import("../app/Sites.ts");
		importSites.Sites.createTable();
	}
}
export default Database.getInstance();
