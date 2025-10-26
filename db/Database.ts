import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import path from "path";
import truncate from "../app/helperFunctions/truncate.ts";

class Database {
	static #instance: Database;
	#file: string = process.env.DATABASE_FILE ?? "db/data.db";
	#db: InstanceType<typeof DatabaseSync>;

	private constructor() {
		this.#db = new DatabaseSync(this.#file);

		this.createDbFile();
		this.createTables();
	}

	static getInstance() {
		return (Database.#instance ??= new Database());
	}

	public getDb() {
		return this.#db;
	}

	private escapeString(table: string) {
		if (!/^[a-zA-Z0-9_-]+$/.test(table)) {
			throw new Error(`Invalid string ${table}`);
		}
	}

	public getTableRowsCount(table: string) {
		this.escapeString(table);
		const { count } = this.#db
			.prepare(`SELECT COUNT(*) as count FROM ${table}`)
			.get() as { count: number };
		return count;
	}

	public createDbFile() {
		let dbFile = path.resolve(process.cwd(), this.#file);
		if (!fs.existsSync(dbFile)) {
			fs.writeFileSync(dbFile, "", "utf8");
		}
	}

	public async createTables() {
		let importSites = await import("../app/Sites.ts");
		importSites.Sites.createTable();
	}

	public toggleDbBoolean<T, U extends keyof T>(
		table: string,
		id: number,
		property: T[U] extends number | null | undefined ? U : never
	): number | null {
		this.escapeString(table);
		this.escapeString(property as string);

		let rowOld = this.#db
			.prepare(`SELECT ${property as string} FROM ${table} WHERE id = ?`)
			.get(id);
		if (!rowOld) {
			console.log(`id=${id} doesn't exist.`);
			return null;
		} else if (
			(rowOld as T)[property] !== 0 &&
			(rowOld as T)[property] !== 1
		)
			console.log(`Value of ${property as string} isn't boolean.`);

		let change = this.#db
			.prepare(
				`
						UPDATE ${table}
						SET ${property as string} = CASE WHEN ${
					property as string
				} = 1 THEN 0 ELSE 1 END
						WHERE id = ?
					`
			)
			.run(id);
		if (!change?.changes) {
			console.log(`id=${id} doesn't exist or database error occured.`);
			return null;
		}
		let rowNew = this.#db
			.prepare(`SELECT ${property as string} FROM ${table} WHERE id = ?`)
			.get(id);

		let newActive = (rowNew && (rowNew as T)[property]) ?? null;
		console.log(
			`New current ${
				property as string
			} value of id=${id} is: ${newActive}`
		);
		return newActive as number | null;
	}

	public printRows<T extends Record<any, any>>(
		rows: T[],
		columns: (keyof T)[] | undefined = undefined
	) {
		rows.forEach((row) => {
			if (typeof row.url === "string")
				(row.url as string) = row.url.replace(
					/^(https?:\/\/)?(www\.)?/,
					""
				);
			if (row.last_changed)
				(row.last_changed as string) = this.localizeTime(
					row.last_changed
				);

			let key: keyof T;
			for (key in row) {
				if (!Object.hasOwn(row, key)) continue;
				if (typeof row[key] === "string")
					// @ts-ignore
					row[key] = truncate(row[key] as string);
			}
		});
		console.table(rows, columns as string[]);
	}

	public localizeTime(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();

		const diffMs = date.getTime() - now.getTime();
		const diffSec = Math.round(diffMs / 1000);
		const diffMin = Math.round(diffSec / 60);
		const diffHr = Math.round(diffMin / 60);
		const diffDay = Math.round(diffHr / 24);

		const rtf = new Intl.RelativeTimeFormat(process.env.LANGUAGE ?? "en", {
			numeric: "auto",
		});

		let output;
		if (Math.abs(diffDay) >= 1) {
			output = rtf.format(diffDay, "day");
		} else if (Math.abs(diffHr) >= 1) {
			output = rtf.format(diffHr, "hour");
		} else if (Math.abs(diffMin) >= 1) {
			output = rtf.format(diffMin, "minute");
		} else {
			output = rtf.format(diffSec, "second");
		}
		return output;
	}
}
export default Database.getInstance();
