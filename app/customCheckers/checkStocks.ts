import axios from "axios";
import console from "console";
import notifier from "node-notifier";
import path from "path";
import { cwd } from "process";
import { formatMagnitudeFull } from "../helperFunctions/formatMagnitudeFull.ts";

// stockprices.dev - not working properly
type stockInfo = {
	Ticker: string;
	Name: string;
	Price: number;
	ChangeAmount: number;
	ChangePercentage: number;
};

type yahooChartStockInfo = {
	chart: {
		result: {
			meta: {
				regularMarketPrice: number;
			};
		}[];
		error: {} | null;
	};
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
			`https://query1.finance.yahoo.com/v8/finance/chart/${name}`,
			{
				headers: {
					"User-Agent": "Mozilla/5.0",
					Accept: "application/json",
				},
				timeout: 10000,
			},
		);
		const stockInfo = response.data as unknown as yahooChartStockInfo;
		const price = stockInfo.chart.result[0].meta.regularMarketPrice;
		if (watchPriceBelow && price < watchPriceBelow) {
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
		return `${name.padEnd(5)} - $${price.toString().padEnd(10)} $${watchPriceBelow}`;
	} catch (e: any) {
		return `⚠️ Error stocks: ${name} - status: ${e.status} - message: ${e.message}`;
	}
}
