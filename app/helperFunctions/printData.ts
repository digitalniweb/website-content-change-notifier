import truncate from "./truncate.ts";
export default function printRows<T extends Record<any, any>>(
	rows: T[],
	columns: (keyof T)[] | undefined = undefined
) {
	rows.forEach((row) => {
		if (typeof row.url === "string")
			(row.url as string) = row.url.replace(
				/^(https?:\/\/)?(www\.)?/,
				""
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
