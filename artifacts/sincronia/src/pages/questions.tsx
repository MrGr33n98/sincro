import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, MessageCircleHeart, Send, Lock, Sparkles } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { toast } from "sonner";

interface QuestionData {
  question: { id: number; question: string; category: string };
  myAnswer: { answer: string } | null;
  partnerAnswer: { answer: string; userName: string } | null;
  bothAnswered: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  memory: { label: "Memória", color: "bg-pink-100 text-pink-700" },
  love: { label: "Amor", color: "bg-red-100 text-red-700" },
  dreams: { label: "Sonhos", color: "bg-purple-100 text-purple-700" },
  growth: { label: "Crescimento", color: "bg-green-100 text-green-700" },
  future: { label: "Futuro", color: "bg-blue-100 text-blue-700" },
  fun: { label: "Diversão", color: "bg-yellow-100 text-yellow-700" },
  general: { label: "Geral", color: "bg-gray-100 text-gray-700" },
};

export default function Questions() {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<QuestionData>({
    queryKey: ["questions", "today"],
    queryFn: () => customFetch("/api/questions/today").then(r => r.json()),
  });

  const answerMut = useMutation({
    mutationFn: (ans: string) =>
      customFetch("/api/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: data?.question.id, answer: ans }),
      }),
    onSuccess: () => {
      toast.success("Resposta enviada! 💕");
      qc.invalidateQueries({ queryKey: ["questions", "today"] });
      setSubmitted(true);
    },
  });

  const unlockMut = useMutation({
    mutationFn: () =>
      customFetch("/api/achievements/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "question_first" }),
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    answerMut.mutate(answer);
    unlockMut.mutate();
  };

  const cat = data?.question.category ? CATEGORY_LABELS[data.question.category] : CATEGORY_LABELS.general;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/app">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Pergunta do Dia</h1>
          <p className="text-xs text-muted-foreground">Conectem-se com uma pergunta especial</p>
        </div>
      </div>

      {isLoading ? (
        <ClayCard className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </ClayCard>
      ) : data ? (
        <AnimatePresence mode="wait">
          <motion.div key="question" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <ClayCard className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cat.color}`}>{cat.label}</span>
                <MessageCircleHeart className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground leading-snug text-center py-2">
                {data.question.question}
              </p>
            </ClayCard>

            {data.myAnswer ? (
              <ClayCard className="p-4 border-2 border-primary/20">
                <p className="text-xs font-semibold text-primary mb-2">Sua resposta:</p>
                <p className="text-sm text-foreground leading-relaxed">{data.myAnswer.answer}</p>
              </ClayCard>
            ) : (
              <ClayCard className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Sua resposta:</p>
                  <textarea
                    className="w-full bg-muted/30 rounded-2xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    placeholder="Escreva o que vier do coração..."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{answer.length}/500</span>
                    <button
                      type="submit"
                      disabled={!answer.trim() || answerMut.isPending}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                      Enviar
                    </button>
                  </div>
                </form>
              </ClayCard>
            )}

            {data.bothAnswered && data.partnerAnswer ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <ClayCard className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <p className="text-xs font-semibold text-purple-600">Resposta de {data.partnerAnswer.userName?.split(" ")[0]}:</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{data.partnerAnswer.answer}</p>
                </ClayCard>
              </motion.div>
            ) : data.myAnswer ? (
              <ClayCard className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <p className="text-sm">Aguardando seu par responder...</p>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  ))}
                </div>
              </ClayCard>
            ) : null}

            <ClayCard className="p-4 bg-primary/5 text-center">
              <p className="text-xs text-muted-foreground">
                🌟 Uma nova pergunta aparece a cada dia. Respondam juntos para fortalecer sua conexão!
              </p>
            </ClayCard>
          </motion.div>
        </AnimatePresence>
      ) : null}
    </div>
  );
}
