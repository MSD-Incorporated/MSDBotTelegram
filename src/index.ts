import { config } from "dotenv";
import { resolve } from "path";
import { Client } from "./structures/client";

config({ path: resolve(process.cwd(), ".env") });
const client = new Client();

client.init();
