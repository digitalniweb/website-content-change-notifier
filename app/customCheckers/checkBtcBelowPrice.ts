import axios from "axios";
import notifier from "node-notifier";

/**
 * Checks whether the price of BTC is below `price`
 * @param price
 * @param customNotification
 * @returns Promise<void>
 */
export default async function checkBtcBelowPrice(
	price: number,
	customNotification = ""
) {
	// this actually uses free json api instead of scraping web
	// web with BTC price: https://www.cnbc.com/quotes/BTC.CM= and selector
	const response = await axios.get<string>(
		"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
		{
			timeout: 10000,
		}
	);
	const value = (response.data as unknown as { bitcoin: { usd: number } })
		?.bitcoin?.usd;
	if (!value) {
		console.log(`⚠️ BTC checker failed`);
		notifier.notify({
			title: `BTC checker failed`,
			message: `No BTC value detected!`,
			wait: false,
			open: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
			// icon: path.resolve(cwd(), "images/mark-red.jpg"), // doesnt work
		});
		return;
	}

	if (value < price) {
		let notification = customNotification || `🔔 BTC is under ${price} USD`;
		console.log(notification);
		notifier.notify({
			title: notification,
			// icon: path.resolve(cwd(), "images/mark-green.jpg"), // doesnt work
		});
	}
}
