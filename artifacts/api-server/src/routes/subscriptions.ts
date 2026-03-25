import { Router } from "express";
import { randomBytes } from "crypto";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { UpgradeToProBody } from "@workspace/api-zod";

const router = Router();

router.get("/status", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const freeFeatures = [
    "3 sugestões de date por mês",
    "Mood tracker básico",
    "Dashboard do casal",
    "Connection streak",
  ];

  const proFeatures = [
    "Sugestões de date ilimitadas",
    "Mediação de conflitos por IA",
    "AI Concierge completo",
    "Timeline emocional avançada",
    "Relationship Health Score detalhado",
    "Push notifications personalizadas",
    ...freeFeatures,
  ];

  res.json({
    isPro: user.isPro,
    plan: user.isPro ? "pro" : "free",
    expiresAt: user.proExpiresAt,
    features: user.isPro ? proFeatures : freeFeatures,
  });
});

router.post("/upgrade", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = UpgradeToProBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { plan } = parsed.data;
  const amount = plan === "annual" ? 199.90 : 19.90;
  const paymentId = `sincronia_${randomBytes(12).toString("hex")}`;

  const pixKey = "00020126580014BR.GOV.BCB.PIX0136";
  const pixAmount = amount.toFixed(2).replace(".", "");
  const pixCode = `${pixKey}${pixAmount}${paymentId}`;
  const pixQrCode = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCI+UUZSIFBJWCBTTVVMQURPPC90ZXh0Pjwvc3ZnPg==`;

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const proExpiresAt = plan === "annual"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(subscriptionsTable).values({
    userId: user.id,
    plan,
    paymentId,
    pixCode,
    amount: amount.toString(),
    status: "pending",
    expiresAt: proExpiresAt,
  });

  await db.update(usersTable).set({ isPro: true, proExpiresAt }).where(eq(usersTable.id, user.id));

  res.json({ pixCode, pixQrCode, amount, expiresAt, paymentId });
});

export default router;
