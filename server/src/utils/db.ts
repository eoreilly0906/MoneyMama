import "../config/loadEnv";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy server/.env.example to server/.env and set DATABASE_URL (and JWT_SECRET)."
  );
}

export const pool = new pg.Pool({ connectionString });
