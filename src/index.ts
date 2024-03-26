import { config } from "dotenv";
import { Client } from "./structures";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
const client = new Client();

client.init();
