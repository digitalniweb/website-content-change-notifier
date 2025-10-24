import { exec } from "child_process";
import notifier from "node-notifier";
import path from "path";
import { cwd } from "process";
notifier.notify(
	{
		title: `icon test and open url`,
		message: `test`,
		wait: true,
		open: "https://www.youtube.com/",
		icon: path.resolve(cwd(), "images/ok.ico"), // doesnt work
	},
	function (error, response, metadata) {
		if (metadata?.activationType === "clicked")
			exec(`start "" "https://www.youtube.com/"`);
	}
);
notifier.on("click", (a, b, c) => {
	console.log(a);
	console.log(b);
	console.log(c);

	exec(`start "" "https://www.youtube.com/"`); // Windows-safe open
});
