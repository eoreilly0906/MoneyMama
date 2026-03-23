import type { RequestHandler } from "express";
import * as subscriptionModel from "../models/subscription";
import { HttpError } from "../utils/httpError";

function parsePositiveInt(value: string | undefined, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return n;
}

function parseCreateBody(
  body: Record<string, unknown>
): subscriptionModel.SubscriptionInput {
  const { name, cost, billing_date, category } = body;

  if (typeof name !== "string" || !name.trim()) {
    throw new HttpError(400, "name is required");
  }
  if (typeof category !== "string" || !category.trim()) {
    throw new HttpError(400, "category is required");
  }
  if (typeof billing_date !== "string" || !billing_date.trim()) {
    throw new HttpError(400, "billing_date is required (YYYY-MM-DD)");
  }
  if (typeof cost !== "number" || Number.isNaN(cost) || cost < 0) {
    throw new HttpError(400, "cost must be a non-negative number");
  }

  const billingRaw = billing_date.trim();
  const d = new Date(billingRaw + "T12:00:00.000Z");
  if (Number.isNaN(d.getTime())) {
    throw new HttpError(400, "billing_date must be a valid date");
  }

  return {
    name: name.trim(),
    cost,
    billingDate: billingRaw,
    category: category.trim(),
  };
}

function toJson(row: subscriptionModel.SubscriptionRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    cost: Number(row.cost),
    billing_date: row.billing_date,
    category: row.category,
    created_at: row.created_at,
  };
}

export const createSubscription: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId === undefined) {
      throw new HttpError(500, "User context missing");
    }

    const input = parseCreateBody(req.body as Record<string, unknown>);
    const row = await subscriptionModel.createSubscription(userId, input);
    res.status(201).json(toJson(row));
  } catch (err) {
    next(err);
  }
};

export const listSubscriptions: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId === undefined) {
      throw new HttpError(500, "User context missing");
    }

    const rows = await subscriptionModel.listSubscriptionsByUser(userId);
    res.json(rows.map(toJson));
  } catch (err) {
    next(err);
  }
};

export const updateSubscription: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId === undefined) {
      throw new HttpError(500, "User context missing");
    }

    const id = parsePositiveInt(req.params.id, "subscription id");
    const body = req.body as Record<string, unknown>;

    const partial: Partial<subscriptionModel.SubscriptionInput> = {};
    if ("name" in body) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        throw new HttpError(400, "name must be a non-empty string");
      }
      partial.name = body.name.trim();
    }
    if ("category" in body) {
      if (typeof body.category !== "string" || !body.category.trim()) {
        throw new HttpError(400, "category must be a non-empty string");
      }
      partial.category = body.category.trim();
    }
    if ("cost" in body) {
      if (
        typeof body.cost !== "number" ||
        Number.isNaN(body.cost) ||
        body.cost < 0
      ) {
        throw new HttpError(400, "cost must be a non-negative number");
      }
      partial.cost = body.cost;
    }
    if ("billing_date" in body) {
      if (
        typeof body.billing_date !== "string" ||
        !body.billing_date.trim()
      ) {
        throw new HttpError(400, "billing_date must be a non-empty string");
      }
      const raw = body.billing_date.trim();
      const d = new Date(raw + "T12:00:00.000Z");
      if (Number.isNaN(d.getTime())) {
        throw new HttpError(400, "billing_date must be a valid date");
      }
      partial.billingDate = raw;
    }

    if (Object.keys(partial).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const row = await subscriptionModel.updateSubscription(
      userId,
      id,
      partial
    );
    if (!row) {
      throw new HttpError(404, "Subscription not found");
    }
    res.json(toJson(row));
  } catch (err) {
    next(err);
  }
};

export const deleteSubscription: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId === undefined) {
      throw new HttpError(500, "User context missing");
    }

    const id = parsePositiveInt(req.params.id, "subscription id");
    const deleted = await subscriptionModel.deleteSubscription(userId, id);
    if (!deleted) {
      throw new HttpError(404, "Subscription not found");
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
