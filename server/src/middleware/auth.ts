import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new HttpError(500, "Server misconfiguration"));
    return;
  }

  if (!header?.startsWith("Bearer ")) {
    next(new HttpError(401, "Missing or invalid authorization header"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new HttpError(401, "Missing token"));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { sub?: string };
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id < 1) {
      next(new HttpError(401, "Invalid token"));
      return;
    }
    req.userId = id;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};
