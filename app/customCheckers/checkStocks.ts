import axios from "axios";
import console from "console";
import notifier from "node-notifier";
import path from "path";
import { cwd } from "process";
import { formatMagnitudeFull } from "../helperFunctions/formatMagnitudeFull.ts";
type stockInfo = {
	Ticker: string;
	Name: string;
	Price: number;
	ChangeAmount: number;
	ChangePercentage: number;
};
type stockOptions = {
	name: string;
	watchPriceBelow?: number;
	customNotification?: string;
	customName?: string; // name to show, default will be `name`
	currency?: string;
	currencyName?: string;
};
export default async function checkStocks(options: stockOptions) {
	let {
		name,
		customName,
		watchPriceBelow = 0,
		customNotification,
		currencyName = "USD",
	} = options;
	if (!customName) customName = name;
	try {
		const response = await axios.get<string>(
			`https://stockprices.dev/api/stocks/${name}`,
			{
				timeout: 10000,
			},
		);
		const stockInfo = response.data as unknown as stockInfo;

		if (watchPriceBelow && stockInfo.Price < watchPriceBelow) {
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
		console.log(
			`${name} - price: $${stockInfo.Price}, change: ${stockInfo.ChangePercentage} %`,
		);
	} catch (e: any) {
		console.error(
			`⚠️ Error stocks: ${name} - status: ${e.status} - message: ${e.message}`,
		);
	}
}
