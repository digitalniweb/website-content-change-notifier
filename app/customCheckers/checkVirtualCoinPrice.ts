import axios from "axios";
import { exec } from "child_process";
import notifier from "node-notifier";
import path from "path";
import { cwd } from "process";
import type {
	PriceResponse,
	virtualCoinCheckOptions,
} from "../../types/virtulaCoins.ts";
import { formatMagnitudeFull } from "../helperFunctions/formatMagnitudeFull.ts";

export default async function checkVirtualCoinPrice(
	options: virtualCoinCheckOptions,
) {
	let {
		name,
		customName,
		watchPriceBelow = 0,
		customNotification,
		currency = "usd",
		currencyName = "USD",
	} = options;
	if (!name) {
		console.log('"checkVirtualCoinPrice" name is required');
		return;
	}
	if (!customName) customName = name;
	try {
		// this actually uses free json api instead of scraping web
		// web with BTC price: 'https://www.cnbc.com/quotes/BTC.CM=' and selector '.QuoteStrip-lastPrice'
		const response = await axios.get<string>(
			`https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${currency}`,
			{
				timeout: 10000,
			},
		);

		const value = (response.data as unknown as PriceResponse)?.[name]?.[
			currency
		];
		if (!value) {
			console.log(`⚠️ ${customName} checker failed`);
			notifier.notify(
				{
					title: `${customName} checker failed`,
					message: `No ${customName} value detected!`,
					wait: false,
					open: `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${currency}`, // "open" doesn't work so use callback instead
					icon: path.resolve(cwd(), "images/mark-red.ico"),
				},
				function (error, response, metadata) {
					// "open" doesn't work so use callback instead
					// this works on immediate clicks, if clicked in history of notifications this doesn't work
					if (metadata?.activationType === "clicked")
						exec(
							`start "" "https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${currency}"`,
						);
				},
			);
			return;
		}

		if (watchPriceBelow && value < watchPriceBelow) {
			let notification =
				customNotification ||
				`🔔 ${customName ?? name} is under ${formatMagnitudeFull(
					watchPriceBelow,
				)} ${currencyName}!`;
			console.log(notification);
			notifier.notify({
				title: notification,
				message: "Wooohooo 🎉", // in Windows 'message' is required to show the notification
				wait: false,
				icon: path.resolve(cwd(), "images/mark-green.ico"),
			});
		}
		console.log(`${customName} price is ${value} ${currencyName}`);
	} catch (error: any) {
		console.log(`Get ${customName} price error: ${error.message}`);
	}
}
