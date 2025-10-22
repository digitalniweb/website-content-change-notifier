import axios from "axios";

const response = await axios.get<string>(
	"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
	{
		timeout: 10000,
	}
);
console.log(
	(response.data as unknown as { bitcoin: { usd: number } })?.bitcoin?.usd
);

// if (fs.existsSync(assocFile)) {
// 	let assocFileUrl = pathToFileURL(assocFile);
// 	let associationsGlobalData = await import(
// 		assocFileUrl.href
// 	);
// 	associationsGlobalData.createAssociationsGlobalData();
// }
