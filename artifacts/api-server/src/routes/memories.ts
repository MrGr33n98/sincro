import { Router } from "express";
import { db, memoriesTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.json([]);
    return;
  }

  const items = await db.select({
    id: memoriesTable.id,
    title: memoriesTable.title,
    description: memoriesTable.description,
    emoji: memoriesTable.emoji,
    memoryDate: memoriesTable.memoryDate,
    createdAt: memoriesTable.createdAt,
    userId: memoriesTable.userId,
    userName: usersTable.name,
  })
    .from(memoriesTable)
    .leftJoin(usersTable, eq(memoriesTable.userId, usersTable.id))
    .where(eq(memoriesTable.coupleId, user.coupleId))
    .orderBy(desc(memoriesTable.memoryDate));

  res.json(items.map(m => ({ ...m, userName: m.userName ?? "Você" })));
});

router.post("/", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.status(400).json({ error: "no_couple" });
    return;
  }

  const { title, description, emoji, memoryDate } = req.body;
  if (!title?.trim() || !memoryDate) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const [memory] = await db.insert(memoriesTable).values({
    coupleId: user.coupleId,
    userId: user.id,
    title: title.trim(),
    description: description?.trim() ?? null,
    emoji: emoji ?? "💕",
    memoryDate,
  }).returning();

  res.status(201).json(memory);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);

  await db.delete(memoriesTable)
    .where(and(eq(memoriesTable.id, id), eq(memoriesTable.userId, user.id)));

  res.json({ ok: true });
});

export default router;
