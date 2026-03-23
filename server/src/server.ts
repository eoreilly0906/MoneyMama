import "./config/loadEnv";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { subscriptionRoutes } from "./routes/subscriptionRoutes";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Add it to server/.env (see server/.env.example)."
  );
}
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is required. Add it to server/.env (see server/.env.example)."
  );
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/subscriptions", subscriptionRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
