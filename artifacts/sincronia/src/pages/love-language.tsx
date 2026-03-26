import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, ChevronRight, RefreshCw } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { toast } from "sonner";

const LANGUAGES = {
  wordsOfAffirmation: { label: "Palavras de Afirmação", emoji: "💬", color: "bg-blue-100 text-blue-700", desc: "Elogios, declarações e palavras encorajadoras" },
  actsOfService: { label: "Atos de Serviço", emoji: "🤝", color: "bg-green-100 text-green-700", desc: "Ajudar, facilitar a vida e fazer coisas pelo outro" },
  receivingGifts: { label: "Presentes", emoji: "🎁", color: "bg-yellow-100 text-yellow-700", desc: "Gestos tangíveis que mostram pensamento e cuidado" },
  qualityTime: { label: "Tempo de Qualidade", emoji: "⏰", color: "bg-purple-100 text-purple-700", desc: "Atenção plena e momentos compartilhados" },
  physicalTouch: { label: "Toque Físico", emoji: "🤗", color: "bg-pink-100 text-pink-700", desc: "Abraços, carinhos e presença física" },
};

type LangKey = keyof typeof LANGUAGES;

const QUIZ = [
  {
    question: "Quando você se sente mais amado(a)?",
    options: [
      { text: "Quando meu par me elogia ou diz que me ama", key: "wordsOfAffirmation" },
      { text: "Quando meu par faz algo por mim sem eu pedir", key: "actsOfService" },
      { text: "Quando recebo um presente surpresa", key: "receivingGifts" },
      { text: "Quando passamos tempo juntos de qualidade", key: "qualityTime" },
      { text: "Quando meu par me abraça ou me toca com carinho", key: "physicalTouch" },
    ],
  },
  {
    question: "O que te deixa mais chateado(a) no relacionamento?",
    options: [
      { text: "Falta de elogios e palavras de incentivo", key: "wordsOfAffirmation" },
      { text: "Meu par não me ajuda com as tarefas do dia a dia", key: "actsOfService" },
      { text: "Esquecem datas especiais ou não me dão presentes", key: "receivingGifts" },
      { text: "Passamos pouco tempo realmente juntos", key: "qualityTime" },
      { text: "Falta de contato físico e carinhos", key: "physicalTouch" },
    ],
  },
  {
    question: "Como você prefere demonstrar amor?",
    options: [
      { text: "Dizendo 'te amo', enviando mensagens carinhosas", key: "wordsOfAffirmation" },
      { text: "Fazendo coisas que facilitam a vida do meu par", key: "actsOfService" },
      { text: "Comprando ou fazendo presentes especiais", key: "receivingGifts" },
      { text: "Planejando momentos especiais juntos", key: "qualityTime" },
      { text: "Com abraços, beijos e demonstrações físicas", key: "physicalTouch" },
    ],
  },
  {
    question: "Qual gesto te faz mais feliz?",
    options: [
      { text: "Uma mensagem de bom dia carinhosa", key: "wordsOfAffirmation" },
      { text: "Meu par arrumar a casa antes de eu chegar", key: "actsOfService" },
      { text: "Uma flor ou chocolatinho inesperado", key: "receivingGifts" },
      { text: "Uma tarde sem celular só nós dois", key: "qualityTime" },
      { text: "Acordar com um abraço longo", key: "physicalTouch" },
    ],
  },
  {
    question: "Quando você está triste, o que mais conforta?",
    options: [
      { text: "Palavras de apoio e encorajamento", key: "wordsOfAffirmation" },
      { text: "Meu par resolver o problema por mim", key: "actsOfService" },
      { text: "Ganhar algo especial para animar", key: "receivingGifts" },
      { text: "Ficar junto conversando sem distração", key: "qualityTime" },
      { text: "Um abraço apertado que não tem fim", key: "physicalTouch" },
    ],
  },
];

export default function LoveLanguage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<LangKey, number>>({
    wordsOfAffirmation: 0, actsOfService: 0, receivingGifts: 0, qualityTime: 0, physicalTouch: 0,
  });
  const [completed, setCompleted] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<any>({
    queryKey: ["love-language"],
    queryFn: () => customFetch("/api/love-language").then(r => r.json()),
  });

  const submitMut = useMutation({
    mutationFn: (s: typeof scores) =>
      customFetch("/api/love-language/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["love-language"] });
      customFetch("/api/achievements/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "love_language" }) });
      toast.success("Resultado salvo! 💕");
    },
  });

  const handleAnswer = (key: string) => {
    const newScores = { ...scores, [key]: (scores[key as LangKey] ?? 0) + 1 };
    setScores(newScores as typeof scores);
    if (step < QUIZ.length - 1) {
      setStep(s => s + 1);
    } else {
      submitMut.mutate(newScores as typeof scores);
      setCompleted(true);
    }
  };

  const topLang = completed
    ? (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as LangKey)
    : data?.result?.topLanguage as LangKey | undefined;

  const showResults = data?.completed || completed;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/couple">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Linguagem do Amor</h1>
          <p className="text-xs text-muted-foreground">Descubra como vocês se amam</p>
        </div>
      </div>

      {!showResults ? (
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="flex gap-1 mb-4">
              {QUIZ.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>

            <ClayCard className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <p className="text-xs font-semibold text-primary mb-2">Pergunta {step + 1} de {QUIZ.length}</p>
              <p className="text-lg font-bold text-foreground leading-snug mb-6">{QUIZ[step].question}</p>
              <div className="space-y-3">
                {QUIZ[step].options.map((opt) => {
                  const lang = LANGUAGES[opt.key as LangKey];
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswer(opt.key)}
                      className="w-full text-left flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-primary/30 border-2 border-transparent transition-all"
                    >
                      <span className="text-xl shrink-0">{lang.emoji}</span>
                      <span className="text-sm text-foreground">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </ClayCard>
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {topLang && (
            <ClayCard className="p-6 text-center bg-gradient-to-br from-pink-50 to-purple-50">
              <p className="text-5xl mb-3">{LANGUAGES[topLang].emoji}</p>
              <p className="text-xs text-muted-foreground mb-1">Sua principal linguagem do amor</p>
              <p className="text-2xl font-bold text-foreground">{LANGUAGES[topLang].label}</p>
              <p className="text-sm text-muted-foreground mt-2">{LANGUAGES[topLang].desc}</p>
            </ClayCard>
          )}

          <ClayCard className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Seus resultados:</p>
            <div className="space-y-2.5">
              {(Object.entries(completed ? scores : (data?.result?.scores ?? {})) as [LangKey, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([key, val]) => {
                  const lang = LANGUAGES[key];
                  const total = completed ? QUIZ.length : 5;
                  const pct = Math.round((val / total) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5"><span>{lang.emoji}</span><span className="font-medium">{lang.label}</span></span>
                        <span className="font-semibold text-primary">{pct}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-2 bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </ClayCard>

          {data?.partnerResult && (
            <ClayCard className="p-4 bg-purple-50">
              <p className="text-sm font-semibold text-foreground mb-1">
                {data.partnerResult.name?.split(" ")[0]} ama principalmente com:
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{LANGUAGES[data.partnerResult.topLanguage as LangKey]?.emoji}</span>
                <span className="font-semibold text-purple-700">{LANGUAGES[data.partnerResult.topLanguage as LangKey]?.label}</span>
              </div>
            </ClayCard>
          )}

          <button
            onClick={() => { setStep(0); setScores({ wordsOfAffirmation: 0, actsOfService: 0, receivingGifts: 0, qualityTime: 0, physicalTouch: 0 }); setCompleted(false); }}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-3 bg-white rounded-2xl shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refazer o quiz
          </button>
        </motion.div>
      )}
    </div>
  );
}
