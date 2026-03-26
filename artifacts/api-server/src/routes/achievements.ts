import { Router } from "express";
import { db, achievementsTable, moodsTable } from "@workspace/db";
import { eq, and, gte, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const ACHIEVEMENT_DEFS = [
  { type: "first_mood", label: "Primeira Emoção", description: "Registrou o primeiro humor", emoji: "🌱", points: 10 },
  { type: "streak_3", label: "3 Dias Seguidos", description: "3 dias de check-in consecutivos", emoji: "🔥", points: 30 },
  { type: "streak_7", label: "Uma Semana de Amor", description: "7 dias de check-in seguidos", emoji: "💜", points: 70 },
  { type: "streak_30", label: "Um Mês Juntos", description: "30 dias de check-ins seguidos", emoji: "🏆", points: 300 },
  { type: "both_checkin", label: "Em Sintonia", description: "Ambos fizeram check-in no mesmo dia", emoji: "💑", points: 20 },
  { type: "question_first", label: "Abre o Coração", description: "Respondeu à primeira pergunta do dia", emoji: "💬", points: 15 },
  { type: "question_both", label: "Diálogo Aberto", description: "Ambos responderam a mesma pergunta", emoji: "🗣️", points: 30 },
  { type: "love_language", label: "Se Conhecendo", description: "Completou o quiz de linguagem do amor", emoji: "❤️", points: 25 },
  { type: "memory_first", label: "Guardando Lembranças", description: "Adicionou a primeira memória", emoji: "📸", points: 20 },
  { type: "memory_10", label: "Álbum do Casal", description: "10 memórias registradas", emoji: "📚", points: 100 },
  { type: "mediation_first", label: "Comunicação CNV", description: "Usou a mediação pela primeira vez", emoji: "🕊️", points: 25 },
  { type: "love_letter", label: "Declaração de Amor", description: "Gerou uma carta de amor com IA", emoji: "💌", points: 20 },
];

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const unlocked = await db.select().from(achievementsTable)
    .where(eq(achievementsTable.userId, user.id));

  const unlockedTypes = new Set(unlocked.map(a => a.type));

  const result = ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    unlocked: unlockedTypes.has(def.type),
    unlockedAt: unlocked.find(u => u.type === def.type)?.unlockedAt ?? null,
  }));

  const totalPoints = result.filter(r => r.unlocked).reduce((sum, r) => sum + r.points, 0);

  res.json({ achievements: result, totalPoints, unlockedCount: unlocked.length, totalCount: ACHIEVEMENT_DEFS.length });
});

router.post("/unlock", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { type } = req.body;

  const valid = ACHIEVEMENT_DEFS.find(d => d.type === type);
  if (!valid) {
    res.status(400).json({ error: "invalid_type" });
    return;
  }

  const existing = await db.select().from(achievementsTable)
    .where(and(eq(achievementsTable.userId, user.id), eq(achievementsTable.type, type)))
    .limit(1);

  if (existing.length > 0) {
    res.json({ alreadyUnlocked: true });
    return;
  }

  await db.insert(achievementsTable).values({ userId: user.id, type });
  res.json({ unlocked: true, achievement: valid });
});

export default router;
