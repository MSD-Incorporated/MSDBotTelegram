import { Database } from "./structures/database";

const db = new Database();
const user = await db.resolveUser({ id: 946070039, first_name: "Mased" }, false, { dick: true });
console.log(user);
