export type virtualCoinCheckOptions = {
	name: string; // name in URL
	customName?: string; // name to show, default will be `name`
	watchPriceBelow?: number;
	customNotification?: string;
	currency?: string;
	currencyName?: string;
};

export type PriceResponse = Record<string, { [k in string]: number }>;
