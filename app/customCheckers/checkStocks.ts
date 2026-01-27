import axios from "axios";
type stockInfo = {
	Ticker: string;
	Name: string;
	Price: number;
	ChangeAmount: number;
	ChangePercentage: number;
};
export default async function checkStocks(stockName: string) {
	const response = await axios.get<string>(
		`https://stockprices.dev/api/stocks/${stockName}`,
		{
			timeout: 10000,
		},
	);
	const stockInfo = response.data as unknown as stockInfo;
	console.log(
		`${stockName} - price: $${stockInfo.Price}, change: ${stockInfo.ChangePercentage} %`,
	);
}
