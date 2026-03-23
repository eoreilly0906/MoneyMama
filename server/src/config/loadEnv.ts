import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Load the first existing `.env` among common monorepo / cwd layouts.
 * Must be imported before any module reads `process.env` for DB/JWT.
 */
const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server", ".env"),
  path.resolve(__dirname, "../../.env"),
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
