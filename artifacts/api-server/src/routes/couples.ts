import { Router } from "express";
import { randomBytes } from "crypto";
import { db, usersTable, couplesTable, invitesTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { JoinCoupleBody, UpdateCoupleProfileBody } from "@workspace/api-zod";

const router = Router();

async function getCoupleUsers(coupleId: number) {
  return db.select().from(usersTable).where(eq(usersTable.coupleId, coupleId)).limit(2);
}

function formatCouple(couple: any, users: any[]) {
  const user1 = users[0];
  const user2 = users[1];
  const createdDate = couple.anniversaryDate ? new Date(couple.anniversaryDate) : new Date(couple.createdAt);
  const relationshipDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: couple.id,
    user1: user1 ? { id: user1.id, name: user1.name, avatarUrl: user1.avatarUrl } : null,
    user2: user2 ? { id: user2.id, name: user2.name, avatarUrl: user2.avatarUrl } : null,
    anniversaryDate: couple.anniversaryDate,
    relationshipDays: Math.max(0, relationshipDays),
    coverPhotoUrl: couple.coverPhotoUrl,
    createdAt: couple.createdAt,
  };
}

router.post("/invite", requireAuth, async (req, res) => {
  const user = (req as any).user;

  let coupleId = user.coupleId;
  if (!coupleId) {
    const [couple] = await db.insert(couplesTable).values({}).returning();
    coupleId = couple.id;
    await db.update(usersTable).set({ coupleId }).where(eq(usersTable.id, user.id));
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(invitesTable).values({
    token,
    inviterId: user.id,
    coupleId,
    expiresAt,
  });

  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:80";

  res.status(201).json({
    token,
    expiresAt,
    inviteUrl: `${baseUrl}/join/${token}`,
  });
});

router.post("/join", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = JoinCoupleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { token } = parsed.data;
  const [invite] = await db.select().from(invitesTable).where(eq(invitesTable.token, token)).limit(1);

  if (!invite) {
    res.status(400).json({ error: "invalid_invite", message: "Invite not found" });
    return;
  }
  if (invite.used) {
    res.status(400).json({ error: "invite_used", message: "Invite already used" });
    return;
  }
  if (new Date(invite.expiresAt) < new Date()) {
    res.status(400).json({ error: "invite_expired", message: "Invite has expired" });
    return;
  }
  if (invite.inviterId === user.id) {
    res.status(400).json({ error: "self_invite", message: "Cannot join your own invite" });
    return;
  }

  const coupleId = invite.coupleId!;

  await db.update(usersTable).set({ coupleId }).where(eq(usersTable.id, user.id));
  await db.update(invitesTable).set({ used: true }).where(eq(invitesTable.token, token));

  const [couple] = await db.select().from(couplesTable).where(eq(couplesTable.id, coupleId)).limit(1);
  const users = await getCoupleUsers(coupleId);

  res.json(formatCouple(couple, users));
});

router.get("/profile", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.status(404).json({ error: "no_couple", message: "Not part of a couple yet" });
    return;
  }

  const [couple] = await db.select().from(couplesTable).where(eq(couplesTable.id, user.coupleId)).limit(1);
  if (!couple) {
    res.status(404).json({ error: "not_found", message: "Couple not found" });
    return;
  }

  const users = await getCoupleUsers(user.coupleId);
  res.json(formatCouple(couple, users));
});

router.patch("/profile", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.status(404).json({ error: "no_couple", message: "Not part of a couple yet" });
    return;
  }

  const parsed = UpdateCoupleProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const updates: Record<string, any> = {};
  if (parsed.data.anniversaryDate) updates.anniversaryDate = parsed.data.anniversaryDate;
  if (parsed.data.coverPhotoUrl) updates.coverPhotoUrl = parsed.data.coverPhotoUrl;

  await db.update(couplesTable).set(updates).where(eq(couplesTable.id, user.coupleId));

  const [couple] = await db.select().from(couplesTable).where(eq(couplesTable.id, user.coupleId)).limit(1);
  const users = await getCoupleUsers(user.coupleId);
  res.json(formatCouple(couple, users));
});

export default router;
