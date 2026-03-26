import { Router } from "express";
import { db, dailyQuestionsTable, questionAnswersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const QUESTIONS = [
  { q: "Qual memória nossa você mais ama?", cat: "memory" },
  { q: "Se pudéssemos viajar agora, para onde iríamos?", cat: "dreams" },
  { q: "O que eu faço que te deixa mais feliz?", cat: "love" },
  { q: "Qual foi o nosso date mais especial até hoje?", cat: "memory" },
  { q: "O que você quer conquistar juntos nos próximos 5 anos?", cat: "future" },
  { q: "Quando você percebeu que estava apaixonado(a) por mim?", cat: "love" },
  { q: "Qual é a coisa que mais admira em mim?", cat: "love" },
  { q: "Se hoje fosse o último dia do mundo, o que faria comigo?", cat: "fun" },
  { q: "O que podemos melhorar juntos no nosso relacionamento?", cat: "growth" },
  { q: "Qual é o seu lugar favorito para estar comigo?", cat: "memory" },
  { q: "O que eu faço que sempre te arranca um sorriso?", cat: "love" },
  { q: "Se você pudesse mudar uma coisa em você mesma(o), o que seria?", cat: "growth" },
  { q: "Qual música te faz lembrar de mim?", cat: "fun" },
  { q: "Qual foi a coisa mais corajosa que já fizemos juntos?", cat: "memory" },
  { q: "O que você sonha em fazer antes de envelhecer?", cat: "dreams" },
  { q: "Como você se sente quando passamos tempo juntos?", cat: "love" },
  { q: "Qual é a sua comida favorita para comermos juntos?", cat: "fun" },
  { q: "O que você gostaria que eu soubesse, mas nunca perguntou?", cat: "growth" },
  { q: "Qual é a característica nossa que mais nos une?", cat: "love" },
  { q: "Se ganhássemos na loteria amanhã, o que faríamos primeiro?", cat: "dreams" },
  { q: "Qual foi o momento mais difícil que superamos juntos?", cat: "growth" },
  { q: "O que você mais gosta de fazer nas nossas noites em casa?", cat: "fun" },
  { q: "Qual é o seu segredo mais bobo que nunca contou pra mim?", cat: "fun" },
  { q: "O que eu faço que te deixa se sentindo amada(o)?", cat: "love" },
  { q: "Onde você se imagina daqui a 10 anos?", cat: "future" },
  { q: "Qual é a coisa mais engraçada que já aconteceu com a gente?", cat: "fun" },
  { q: "Como posso ser um parceiro(a) melhor para você?", cat: "growth" },
  { q: "Qual é o seu maior sonho que ainda não realizou?", cat: "dreams" },
  { q: "O que você mais ama no nosso jeito de ser casal?", cat: "love" },
  { q: "Se pudesse me dar um presente perfeito, o que seria?", cat: "fun" },
  { q: "O que te faz sentir mais conectada(o) a mim?", cat: "love" },
];

async function seedQuestions() {
  const existing = await db.select().from(dailyQuestionsTable).limit(1);
  if (existing.length > 0) return;
  await db.insert(dailyQuestionsTable).values(
    QUESTIONS.map(q => ({ question: q.q, category: q.cat }))
  );
}

seedQuestions().catch(console.error);

function getTodayQuestionId(): number {
  const dayOfYear = Math.floor(Date.now() / 86400000);
  return (dayOfYear % QUESTIONS.length) + 1;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

router.get("/today", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.status(400).json({ error: "no_couple" });
    return;
  }

  let questions = await db.select().from(dailyQuestionsTable).limit(31);
  if (questions.length === 0) {
    await seedQuestions();
    questions = await db.select().from(dailyQuestionsTable).limit(31);
  }

  const idx = Math.floor(Date.now() / 86400000) % questions.length;
  const question = questions[idx];

  const date = todayStr();
  const allAnswers = await db.select({
    id: questionAnswersTable.id,
    userId: questionAnswersTable.userId,
    answer: questionAnswersTable.answer,
    userName: usersTable.name,
  })
    .from(questionAnswersTable)
    .leftJoin(usersTable, eq(questionAnswersTable.userId, usersTable.id))
    .where(and(
      eq(questionAnswersTable.coupleId, user.coupleId),
      eq(questionAnswersTable.questionId, question.id),
      eq(questionAnswersTable.date, date),
    ));

  const myAnswer = allAnswers.find(a => a.userId === user.id);
  const partnerAnswer = allAnswers.find(a => a.userId !== user.id);

  res.json({
    question: { id: question.id, question: question.question, category: question.category },
    myAnswer: myAnswer ? { answer: myAnswer.answer } : null,
    partnerAnswer: myAnswer && partnerAnswer ? { answer: partnerAnswer.answer, userName: partnerAnswer.userName } : null,
    bothAnswered: !!(myAnswer && partnerAnswer),
  });
});

router.post("/answer", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.coupleId) {
    res.status(400).json({ error: "no_couple" });
    return;
  }

  const { questionId, answer } = req.body;
  if (!questionId || !answer?.trim()) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const date = todayStr();
  const existing = await db.select().from(questionAnswersTable)
    .where(and(
      eq(questionAnswersTable.userId, user.id),
      eq(questionAnswersTable.questionId, questionId),
      eq(questionAnswersTable.date, date),
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.update(questionAnswersTable).set({ answer }).where(eq(questionAnswersTable.id, existing[0].id));
  } else {
    await db.insert(questionAnswersTable).values({
      userId: user.id,
      coupleId: user.coupleId,
      questionId,
      answer,
      date,
    });
  }

  res.json({ ok: true });
});

export default router;
