import fs from "fs";
import path from "path";

console.log(process.cwd());

let dbFile = path.resolve(process.cwd(), `db/data.db`);
if (!fs.existsSync(dbFile)) {
	fs.writeFileSync(dbFile, "", "utf8");
}

// if (fs.existsSync(assocFile)) {
// 	let assocFileUrl = pathToFileURL(assocFile);
// 	let associationsGlobalData = await import(
// 		assocFileUrl.href
// 	);
// 	associationsGlobalData.createAssociationsGlobalData();
// }
