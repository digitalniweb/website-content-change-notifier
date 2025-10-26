<h1>Disclaimer</h1>
This is personal project to watch for changes on websites by scraping their content periodically and getting notified if changes in specified html element occur.

That said I am not optimizing this app in any way. It is meant for my personal use.

**I am not responsible for any problems caused by using this app.**

Used on Windows 11. Other platforms not tested.

<h2>How it works</h2>

_Works for rendered pages only. Not for dynamically loaded pages via js. The elements must be on the site on load!_

-   Specify element via its selector on page you want to check.
    It will get the first element if there is multiple elements with the same selector, e.g.: `.super-important-stuff`
-   It will periodically check if the text content of this element differs from the last time it was checked.
-   On change:
    -   you will get system notification
    -   temporary info is printed in opened terminal which runs the app
    -   values are saved in `sqlite db` (For manual changes to database I am using vscode plugin: `SQLite3 Editor`)

You can get notified about anything, not just from scraped content. You can create custom notifiers and use APIs like in `app/customCheckers/checkBtcBelowPrice.ts`

<h2>Usage</h2>

Using node 24+ with types striping - no need to compile the project

-   `npm run start` - main script to be executed - starts the checking, don't close terminal.
-   `npm run addSite -- --url="https://example.com" --selector=".title" --name="Example" --description="Checks title" --last_value="Initial" --active=1` - edit and run in `cmd` (vscode uses powershell in default which won't work) to add a site to check. `url`,`name`,`selector` are required
-   `npm run listSites` - prints out quick info about all Sites

<h2>Automation</h2>

<h3>Windows</h3>

Change location in `notifier-start.bat` which you can use to start automatically on PC start

-   Press `Win + R` to open `Run`
-   Type `shell:startup`
-   Copy .bat file or its shortcut (better) to opened folder

<h2>GUI</h2>

There is no GUI
