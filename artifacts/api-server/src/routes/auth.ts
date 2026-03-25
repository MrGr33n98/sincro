import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { name, email, password } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    res.status(400).json({ error: "email_taken", message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash }).returning();

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coupleId: user.coupleId,
      isPro: user.isPro,
      createdAt: user.createdAt,
    },
  });
});

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coupleId: user.coupleId,
      isPro: user.isPro,
      createdAt: user.createdAt,
    },
  });
});

router.get("/me", requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    coupleId: user.coupleId,
    isPro: user.isPro,
    createdAt: user.createdAt,
  });
});

export default router;
