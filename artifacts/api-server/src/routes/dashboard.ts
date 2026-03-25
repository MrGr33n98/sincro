import { Router } from "express";
import { db, usersTable, moodsTable, subscriptionsTable } from "@workspace/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;

  if (!user.coupleId) {
    res.json({
      coupleId: null,
      rhsScore: { current: 0, trend: "stable", variation: 0 },
      moodSync: { user1: null, user2: null, bothCheckedIn: false, aiInsight: null },
      aiConcierge: { nextDate: null, suggestion: null },
      stats: { streakDays: 0, communicationLevel: "low", unresolvedConflicts: 0, weeklyQualityHours: 0 },
      isPro: user.isPro,
    });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const coupleUsers = await db.select().from(usersTable)
    .where(eq(usersTable.coupleId, user.coupleId)).limit(2);

  const recentMoods = await db.select({
    id: moodsTable.id,
    userId: moodsTable.userId,
    userName: usersTable.name,
    mood: moodsTable.mood,
    note: moodsTable.note,
    createdAt: moodsTable.createdAt,
  })
    .from(moodsTable)
    .leftJoin(usersTable, eq(moodsTable.userId, usersTable.id))
    .where(and(eq(moodsTable.coupleId, user.coupleId), gte(moodsTable.createdAt, weekAgo)))
    .orderBy(desc(moodsTable.createdAt));

  const todayMoods = recentMoods.filter(m => new Date(m.createdAt) >= today);
  const u1 = coupleUsers[0];
  const u2 = coupleUsers[1];
  const m1 = todayMoods.find(m => m.userId === u1?.id);
  const m2 = todayMoods.find(m => m.userId === u2?.id);
  const bothCheckedIn = !!(m1 && m2);

  let aiInsight: string | null = null;
  if (bothCheckedIn) {
    const map: Record<string, string> = {
      "happy+happy": "Que energia incrível! Aproveitem esse momento juntos. 🌟",
      "tired+tired": "Momento de recarregar as energias juntos. Um café e uma série? 🔋",
      "romantic+romantic": "A noite promete! Planejem algo especial. 💕",
    };
    const key = `${m1!.mood}+${m2!.mood}`;
    aiInsight = map[key] ?? "Um bom momento para estar presente um para o outro. 💞";
  }

  const uniqueDays = new Set(recentMoods.map(m => new Date(m.createdAt).toDateString())).size;
  const streakDays = uniqueDays;

  const positiveMoods = ["happy", "excited", "calm", "focused", "romantic", "playful"];
  const positiveCount = recentMoods.filter(m => positiveMoods.includes(m.mood)).length;
  const total = recentMoods.length || 1;
  const positiveRatio = positiveCount / total;

  const rhsCurrent = Math.round(40 + positiveRatio * 40 + Math.min(streakDays, 7) * 2 + (bothCheckedIn ? 5 : 0));
  const clampedRhs = Math.min(100, Math.max(0, rhsCurrent));

  const communicationLevel = recentMoods.length > 10 ? "high" : recentMoods.length > 4 ? "medium" : "low";

  const suggestions = [
    {
      title: "Pôr do sol em Santos",
      description: "Assistam ao pôr do sol na orla de Santos com um lanche especial. 🌅",
      type: "outdoor",
      effortLevel: "low",
      estimatedCost: "Gratuito",
      location: "Santos, SP",
    },
    {
      title: "Jantar íntimo em casa",
      description: "Preparem juntos um jantar especial com velas e música suave. 🕯️",
      type: "romantic",
      effortLevel: "low",
      estimatedCost: "R$ 50-100",
      location: "Em casa",
    },
    {
      title: "Trilha no Parque Estadual",
      description: "Uma caminhada leve pela natureza para recarregar as energias juntos. 🌿",
      type: "outdoor",
      effortLevel: "medium",
      estimatedCost: "R$ 20",
      location: "Parque local",
    },
  ];

  res.json({
    coupleId: user.coupleId,
    rhsScore: {
      current: clampedRhs,
      trend: streakDays > 3 ? "up" : "stable",
      variation: streakDays > 3 ? 5 : 0,
      breakdown: {
        communication: Math.round(communicationLevel === "high" ? 90 : communicationLevel === "medium" ? 60 : 30),
        moodConsistency: Math.round(positiveRatio * 100),
        qualityTime: Math.round(streakDays * 10),
        streak: Math.min(100, streakDays * 10),
      },
    },
    moodSync: {
      user1: m1 ? { ...m1, userName: m1.userName ?? u1?.name } : null,
      user2: bothCheckedIn && m2 ? { ...m2, userName: m2.userName ?? u2?.name } : null,
      bothCheckedIn,
      aiInsight,
    },
    aiConcierge: {
      nextDate: null,
      suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
    },
    stats: {
      streakDays,
      communicationLevel,
      unresolvedConflicts: 0,
      weeklyQualityHours: Math.round(streakDays * 0.5 * 10) / 10,
    },
    isPro: user.isPro,
  });
});

export default router;
