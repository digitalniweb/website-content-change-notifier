import console from "console";
import { Sites } from "../Sites.ts";

const args = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		const [key, value = ""] = arg.replace(/^--/, "").split("=");
		return [key, value];
	})
);

if (!args.url || !args.selector || !args.name) {
	console.error(
		"Usage: npm run sites-add -- --url=<url> --selector=<selector> --name=<name> [--description=<desc>] [--last_value=<val>] [--active=<0|1>]"
	);
	process.exit(1);
}

Sites.add(
	args.url,
	args.selector,
	args.name,
	args.description ?? "",
	args.last_value ?? "",
	Number(args.active ?? 1)
);
