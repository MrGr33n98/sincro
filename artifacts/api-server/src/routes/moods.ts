import { Router } from "express";
import { db, usersTable, moodsTable } from "@workspace/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { CheckInMoodBody } from "@workspace/api-zod";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.status(400).json({ error: "no_couple", message: "Must be in a couple to track moods" });
    return;
  }

  const parsed = CheckInMoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { mood, note } = parsed.data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.select().from(moodsTable)
    .where(and(eq(moodsTable.userId, user.id), gte(moodsTable.createdAt, today)))
    .limit(1);

  let entry;
  if (existing.length > 0) {
    [entry] = await db.update(moodsTable)
      .set({ mood, note: note ?? null })
      .where(eq(moodsTable.id, existing[0].id))
      .returning();
  } else {
    [entry] = await db.insert(moodsTable).values({
      userId: user.id,
      coupleId: user.coupleId,
      mood,
      note: note ?? null,
    }).returning();
  }

  res.status(201).json({
    id: entry.id,
    userId: entry.userId,
    userName: user.name,
    mood: entry.mood,
    note: entry.note,
    createdAt: entry.createdAt,
  });
});

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.json([]);
    return;
  }

  const days = parseInt(req.query.days as string) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const entries = await db.select({
    id: moodsTable.id,
    userId: moodsTable.userId,
    userName: usersTable.name,
    mood: moodsTable.mood,
    note: moodsTable.note,
    createdAt: moodsTable.createdAt,
  })
    .from(moodsTable)
    .leftJoin(usersTable, eq(moodsTable.userId, usersTable.id))
    .where(and(eq(moodsTable.coupleId, user.coupleId), gte(moodsTable.createdAt, since)))
    .orderBy(desc(moodsTable.createdAt));

  res.json(entries.map(e => ({ ...e, userName: e.userName ?? "Unknown" })));
});

router.get("/today", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.json({ user1: null, user2: null, bothCheckedIn: false, aiInsight: null });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const coupleUsers = await db.select().from(usersTable)
    .where(eq(usersTable.coupleId, user.coupleId)).limit(2);

  const todayMoods = await db.select({
    id: moodsTable.id,
    userId: moodsTable.userId,
    userName: usersTable.name,
    mood: moodsTable.mood,
    note: moodsTable.note,
    createdAt: moodsTable.createdAt,
  })
    .from(moodsTable)
    .leftJoin(usersTable, eq(moodsTable.userId, usersTable.id))
    .where(and(eq(moodsTable.coupleId, user.coupleId), gte(moodsTable.createdAt, today)));

  const u1 = coupleUsers[0];
  const u2 = coupleUsers[1];

  const m1 = todayMoods.find(m => m.userId === u1?.id);
  const m2 = todayMoods.find(m => m.userId === u2?.id);
  const bothCheckedIn = !!(m1 && m2);

  let aiInsight: string | null = null;
  if (bothCheckedIn) {
    const insights: Record<string, string> = {
      "happy+happy": "Que energia incrível! Aproveitem esse momento juntos. 🌟",
      "tired+tired": "Momento de recarregar as energias juntos. Um café e uma série? 🔋",
      "stressed+calm": "Um dos dois pode ajudar o outro a relaxar hoje. 🌿",
      "calm+stressed": "Um dos dois pode ajudar o outro a relaxar hoje. 🌿",
      "romantic+romantic": "A noite promete! Planejem algo especial. 💕",
      "focused+tired": "Respeitem o espaço um do outro hoje. Equilíbrio é tudo.",
    };
    const key = `${m1!.mood}+${m2!.mood}`;
    aiInsight = insights[key] ?? "Um bom momento para estar presente um para o outro. 💞";
  }

  res.json({
    user1: m1 ? { ...m1, userName: m1.userName ?? u1?.name ?? "Partner 1" } : null,
    user2: bothCheckedIn && m2 ? { ...m2, userName: m2.userName ?? u2?.name ?? "Partner 2" } : null,
    bothCheckedIn,
    aiInsight,
  });
});

export default router;
