import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { CreateOpenaiConversationBody, SendOpenaiMessageBody } from "@workspace/api-zod";

const router = Router();

router.get("/conversations", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const convs = await db.select().from(conversations)
    .where(eq(conversations.userId, user.id))
    .orderBy(eq(conversations.updatedAt, conversations.updatedAt));
  res.json(convs);
});

router.post("/conversations", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const [conv] = await db.insert(conversations).values({
    userId: user.id,
    title: parsed.data.title ?? null,
    context: parsed.data.context ?? null,
  }).returning();

  res.status(201).json(conv);
});

router.get("/conversations/:id", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);

  const [conv] = await db.select().from(conversations)
    .where(eq(conversations.id, id)).limit(1);

  if (!conv || conv.userId !== user.id) {
    res.status(404).json({ error: "not_found", message: "Conversation not found" });
    return;
  }

  const msgs = await db.select().from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  res.json({ ...conv, messages: msgs });
});

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);

  const [conv] = await db.select().from(conversations)
    .where(eq(conversations.id, id)).limit(1);

  if (!conv || conv.userId !== user.id) {
    res.status(404).json({ error: "not_found", message: "Conversation not found" });
    return;
  }

  const parsed = SendOpenaiMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { content } = parsed.data;

  await db.insert(messages).values({
    conversationId: id,
    role: "user",
    content,
  });

  const history = await db.select().from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  const systemPrompt = conv.context
    ? `Você é um assistente de relacionamento empático. Contexto: ${conv.context}`
    : `Você é Sincronia AI, um assistente de relacionamento empático para casais brasileiros. 
Você ajuda com comunicação, planejamento de momentos especiais e fortalecimento do vínculo afetivo.
Use linguagem calorosa, empática e em português brasileiro. Seja positivo e construtivo.`;

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const c = chunk.choices[0]?.delta?.content;
      if (c) {
        fullResponse += c;
        res.write(`data: ${JSON.stringify({ content: c })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "OpenAI chat error");
    res.write(`data: ${JSON.stringify({ error: "AI error" })}\n\n`);
    res.end();
  }
});

export default router;
