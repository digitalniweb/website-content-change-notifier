import Database from "../db/Database.ts";
import type { Site } from "../types/Site.ts";
console.log(Database.toggleDbBoolean<Site, "active">("sites", 3, "active"));
