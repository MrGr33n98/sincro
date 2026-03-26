import { Router } from "express";
import { db, loveLanguageResultsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [result] = await db.select().from(loveLanguageResultsTable)
    .where(eq(loveLanguageResultsTable.userId, user.id)).limit(1);

  if (!result) {
    res.json({ completed: false, result: null, partnerResult: null });
    return;
  }

  const scores = {
    wordsOfAffirmation: result.wordsOfAffirmation,
    actsOfService: result.actsOfService,
    receivingGifts: result.receivingGifts,
    qualityTime: result.qualityTime,
    physicalTouch: result.physicalTouch,
  };

  const topLanguage = (Object.entries(scores) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  let partnerResult = null;
  if (user.coupleId) {
    const partnerUser = await db.select().from(usersTable)
      .where(eq(usersTable.coupleId, user.coupleId)).limit(2);
    const partner = partnerUser.find(u => u.id !== user.id);
    if (partner) {
      const [pr] = await db.select().from(loveLanguageResultsTable)
        .where(eq(loveLanguageResultsTable.userId, partner.id)).limit(1);
      if (pr) {
        const ps = {
          wordsOfAffirmation: pr.wordsOfAffirmation,
          actsOfService: pr.actsOfService,
          receivingGifts: pr.receivingGifts,
          qualityTime: pr.qualityTime,
          physicalTouch: pr.physicalTouch,
        };
        const ptop = (Object.entries(ps) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
        partnerResult = { scores: ps, topLanguage: ptop, name: partner.name };
      }
    }
  }

  res.json({ completed: true, result: { scores, topLanguage }, partnerResult });
});

router.post("/submit", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { wordsOfAffirmation, actsOfService, receivingGifts, qualityTime, physicalTouch } = req.body;

  const existing = await db.select().from(loveLanguageResultsTable)
    .where(eq(loveLanguageResultsTable.userId, user.id)).limit(1);

  if (existing.length > 0) {
    await db.update(loveLanguageResultsTable)
      .set({ wordsOfAffirmation, actsOfService, receivingGifts, qualityTime, physicalTouch, updatedAt: new Date() })
      .where(eq(loveLanguageResultsTable.userId, user.id));
  } else {
    await db.insert(loveLanguageResultsTable).values({
      userId: user.id,
      wordsOfAffirmation: wordsOfAffirmation ?? 0,
      actsOfService: actsOfService ?? 0,
      receivingGifts: receivingGifts ?? 0,
      qualityTime: qualityTime ?? 0,
      physicalTouch: physicalTouch ?? 0,
    });
  }

  res.json({ ok: true });
});

export default router;
