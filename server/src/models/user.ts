import type { QueryResult } from "pg";
import { pool } from "../utils/db";

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
};

export async function findUserByEmail(
  email: string
): Promise<UserRow | null> {
  const result: QueryResult<UserRow> = await pool.query(
    `SELECT id, email, password_hash, created_at FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  return result.rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<UserRow> {
  const result: QueryResult<UserRow> = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, created_at`,
    [email.toLowerCase().trim(), passwordHash]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Failed to create user");
  return row;
}
