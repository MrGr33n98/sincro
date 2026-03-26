import { Router } from "express";
import { requireAuth } from "../lib/auth.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateDateSuggestionsBody, StartMediationBody } from "@workspace/api-zod";

const router = Router();

router.post("/date-suggestions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = GenerateDateSuggestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { budget, city, preferences = [], count = 3 } = parsed.data;

  const budgetMap: Record<string, string> = {
    free: "gratuito (sem gastos)",
    low: "baixo (até R$50)",
    medium: "médio (R$50-200)",
    high: "alto (acima de R$200)",
  };

  const prompt = `Você é um especialista em relacionamentos e experiências românticas no Brasil.
Sugira exatamente ${count} ideias de "date" para um casal em ${city}, Brasil.
Orçamento: ${budgetMap[budget] || budget}
${preferences.length > 0 ? `Preferências do casal: ${preferences.join(", ")}` : ""}

Responda APENAS com JSON válido neste formato exato:
{
  "suggestions": [
    {
      "title": "Nome do date",
      "description": "Descrição envolvente de 1-2 frases com emoji",
      "type": "outdoor|indoor|cultural|gastronomic|adventure|romantic",
      "effortLevel": "low|medium|high",
      "estimatedCost": "Valor estimado em R$",
      "location": "Local específico em ${city}"
    }
  ]
}

Use referências culturais brasileiras, lugares reais em ${city}, e linguagem calorosa.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed2 = JSON.parse(content);
    res.json(parsed2);
  } catch (err) {
    req.log.error({ err }, "AI date suggestions error");
    res.status(500).json({ error: "ai_error", message: "Failed to generate suggestions" });
  }
});

router.post("/mediation", requireAuth, async (req, res) => {
  const parsed = StartMediationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { concern, context } = parsed.data;

  const prompt = `Você é um mediador de relacionamentos empático e neutro, especializado em comunicação não-violenta (CNV) para casais brasileiros.

Um parceiro quer expressar o seguinte incômodo:
"${concern}"
${context ? `Contexto adicional: "${context}"` : ""}

Sua resposta deve:
1. Reescrever a preocupação de forma construtiva usando linguagem em primeira pessoa ("Eu sinto...", "Eu preciso...")
2. Sugerir 3 frases para o parceiro expressar esse sentimento com amor
3. Dar 3 dicas práticas de comunicação
4. Identificar o tom emocional predominante

Responda APENAS com JSON válido:
{
  "reframedMessage": "Versão reescrita em primeira pessoa, suave e clara",
  "suggestions": [
    "Frase 1 para expressar o sentimento",
    "Frase 2 alternativa",
    "Frase 3 alternativa"
  ],
  "tips": [
    "Dica prática 1",
    "Dica prática 2", 
    "Dica prática 3"
  ],
  "tone": "vulnerable|assertive|loving|hurt|anxious"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "AI mediation error");
    res.status(500).json({ error: "ai_error", message: "Failed to generate mediation" });
  }
});

router.post("/love-letter", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { partnerName, feelings, memories: mem, tone = "romantic" } = req.body;

  if (!feelings?.trim()) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const toneMap: Record<string, string> = {
    romantic: "romântico e apaixonado",
    playful: "divertido e carinhoso",
    nostalgic: "nostálgico e sentimental",
    passionate: "intenso e apaixonado",
  };

  const prompt = `Você é um escritor especializado em cartas de amor para casais brasileiros.

Escreva uma carta de amor pessoal e genuína com as seguintes informações:
- Nome do parceiro(a): ${partnerName || "Meu amor"}
- Sentimentos que o remetente quer expressar: "${feelings}"
${mem ? `- Memórias especiais a mencionar: "${mem}"` : ""}
- Tom desejado: ${toneMap[tone] || "romântico"}

A carta deve:
1. Começar com uma saudação carinhosa personalizada
2. Ter 3-4 parágrafos fluidos e emocionantes
3. Usar linguagem brasileira natural e calorosa
4. Terminar com uma declaração poderosa
5. Ser autêntica, não genérica

Responda APENAS com JSON:
{
  "letter": "O texto completo da carta aqui",
  "subject": "Uma linha de assunto poética para a carta"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "AI love letter error");
    res.status(500).json({ error: "ai_error" });
  }
});

router.get("/rhs", requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({
    current: user.isPro ? 85 : 72,
    trend: "up",
    variation: 5,
    breakdown: {
      communication: 80,
      moodConsistency: 75,
      qualityTime: 70,
      streak: 65,
    },
  });
});

export default router;
