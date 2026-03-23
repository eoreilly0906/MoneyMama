import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userModel from "../models/user";
import { HttpError } from "../utils/httpError";

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRES = "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new HttpError(500, "Server misconfiguration");
  return secret;
}

function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES,
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };

    if (typeof email !== "string" || typeof password !== "string") {
      throw new HttpError(400, "email and password are required");
    }
    if (!isValidEmail(email)) {
      throw new HttpError(400, "Invalid email");
    }
    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
      const user = await userModel.createUser(email, passwordHash);
      const token = signToken(user.id);
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "23505"
      ) {
        throw new HttpError(409, "Email already registered");
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };

    if (typeof email !== "string" || typeof password !== "string") {
      throw new HttpError(400, "email and password are required");
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};
