import axios from "axios";
import * as cheerio from "cheerio";
import notifier from "node-notifier";

export default async function checkBtcUnder100k() {
	const response = await axios.get<string>(
		"https://www.cnbc.com/quotes/BTC.CM=",
		{
			timeout: 10000,
		}
	);
	const $ = cheerio.load(response.data);
	const value = $(".QuoteStrip-lastPrice").eq(0).text().trim();
	if (!value) {
		console.log(`⚠️ BTC checker failed`);
		notifier.notify({
			title: `BTC checker failed`,
			message: `No BTC value detected!`,
			wait: false,
			open: "https://www.cnbc.com/quotes/BTC.CM=",
			// icon: path.resolve(cwd(), "images/mark-red.jpg"), // doesnt work
		});
		return;
	}
	const btcPrice = parseInt(value.replace(/,/g, ""), 10);
	if (btcPrice < 100000) {
		console.log(`🔔 BTC is under 100k`);
		notifier.notify({
			title: `🔔 BTC is under 100k`,
			// icon: path.resolve(cwd(), "images/mark-green.jpg"), // doesnt work
		});
	}
}
