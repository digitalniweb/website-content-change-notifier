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
				currency: string;
				regularMarketPrice: number;
				currentTradingPeriod: {
					regular: {
						start: number;
						end: number;
					};
				};
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
		// currencyName = "USD",
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
		const tradeStart =
			stockInfo.chart.result[0].meta.currentTradingPeriod.regular.start;
		const tradeEnd =
			stockInfo.chart.result[0].meta.currentTradingPeriod.regular.end;
		const now = Math.floor(Date.now() / 1000);
		const tradeStarted = now >= tradeStart && now < tradeEnd;
		let openingHours = "";
		if (tradeStarted) {
			let date = new Date(tradeEnd * 1000);
			openingHours = `(closing: ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")})`;
		} else {
			let date = new Date(tradeStart * 1000);
			openingHours = `(opening: ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")})`;
		}

		const currency = stockInfo.chart.result[0].meta.currency;

		if (watchPriceBelow && price < watchPriceBelow) {
			let notification =
				customNotification ||
				`🔔 ${customName ?? name} is under ${formatMagnitudeFull(
					watchPriceBelow,
				)} ${currency}!`;
			console.log(notification);
			notifier.notify({
				title: notification,
				message: "Wooohooo 🎉", // in Windows 'message' is required to show the notification
				wait: false,
				icon: path.resolve(cwd(), "images/mark-green.ico"),
			});
		}
		return `${name.padEnd(7)} ${price.toString().padEnd(9)} ${watchPriceBelow.toString().padEnd(6)} ${currency.padEnd(8)} ${(tradeStarted ? "OPENED" : "close").padEnd(6)} ${openingHours}`;
	} catch (e: any) {
		return `⚠️ Error stocks: ${name} - status: ${e.status} - message: ${e.message}`;
	}
}
