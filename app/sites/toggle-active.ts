import console from "console";
import { Sites } from "../Sites.ts";

const args = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		const [key, value = ""] = arg.replace(/^--/, "").split("=");
		return [key, value];
	})
);

if (!args.id) {
	console.error("Usage: npm run sites-toggle-active -- --id=<number>");
	process.exit(1);
}
let id = Number(args.id);
if (!id) {
	console.error("'id' must be number");
	process.exit(1);
}

Sites.toggleActive(id);
