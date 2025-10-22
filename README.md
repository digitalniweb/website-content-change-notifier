<h1>Disclaimer</h1>
This is personal project to watch for changes on websites by scraping their content periodically and getting notified if changes in specified html element occur.

That said I am not optimizing this app in any way. It is meant for my personal use.

**I am not responsible for any problems caused by using this app.**

Used on Windows 11. Other platforms not tested.

<h2>Usage</h2>

Using node 24+ with types striping - no need to compile the project

-   "npm run start" - main script to be executed - starts the checking, don't close terminal.
-   "npm run add-site" - edit "app/addSite.ts" file and execute this command to add a site to check

**For automatic start on Windows**

Change location in "notifier-start.bat" which you can use to start automatically on PC start

-   Press `Win + R` to open `Run`
-   Type `shell:startup`
-   Copy .bat file or its shortcut (better) to opened folder
