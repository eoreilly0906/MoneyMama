import type { QueryResult } from "pg";
import { pool } from "../utils/db";

export type SubscriptionRow = {
  id: number;
  user_id: number;
  name: string;
  cost: string;
  billing_date: string;
  category: string;
  created_at: Date;
};

export type SubscriptionInput = {
  name: string;
  cost: number;
  billingDate: string;
  category: string;
};

export async function createSubscription(
  userId: number,
  input: SubscriptionInput
): Promise<SubscriptionRow> {
  const result: QueryResult<SubscriptionRow> = await pool.query(
    `INSERT INTO subscriptions (user_id, name, cost, billing_date, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, name, cost::text, billing_date::text, category, created_at`,
    [userId, input.name, input.cost, input.billingDate, input.category]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Failed to create subscription");
  return row;
}

export async function listSubscriptionsByUser(
  userId: number
): Promise<SubscriptionRow[]> {
  const result: QueryResult<SubscriptionRow> = await pool.query(
    `SELECT id, user_id, name, cost::text, billing_date::text, category, created_at
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY billing_date ASC, id ASC`,
    [userId]
  );
  return result.rows;
}

export async function updateSubscription(
  userId: number,
  subscriptionId: number,
  input: Partial<SubscriptionInput>
): Promise<SubscriptionRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(input.name);
  }
  if (input.cost !== undefined) {
    fields.push(`cost = $${i++}`);
    values.push(input.cost);
  }
  if (input.billingDate !== undefined) {
    fields.push(`billing_date = $${i++}`);
    values.push(input.billingDate);
  }
  if (input.category !== undefined) {
    fields.push(`category = $${i++}`);
    values.push(input.category);
  }

  if (fields.length === 0) {
    const existing = await getSubscriptionForUser(userId, subscriptionId);
    return existing;
  }

  values.push(subscriptionId, userId);
  const result: QueryResult<SubscriptionRow> = await pool.query(
    `UPDATE subscriptions
     SET ${fields.join(", ")}
     WHERE id = $${i++} AND user_id = $${i}
     RETURNING id, user_id, name, cost::text, billing_date::text, category, created_at`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteSubscription(
  userId: number,
  subscriptionId: number
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM subscriptions WHERE id = $1 AND user_id = $2`,
    [subscriptionId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

async function getSubscriptionForUser(
  userId: number,
  subscriptionId: number
): Promise<SubscriptionRow | null> {
  const result: QueryResult<SubscriptionRow> = await pool.query(
    `SELECT id, user_id, name, cost::text, billing_date::text, category, created_at
     FROM subscriptions
     WHERE id = $1 AND user_id = $2`,
    [subscriptionId, userId]
  );
  return result.rows[0] ?? null;
}
