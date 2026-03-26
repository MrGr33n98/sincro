import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { toast } from "sonner";

const TONES = [
  { id: "romantic", label: "💕 Romântico", desc: "Apaixonado e poético" },
  { id: "playful", label: "😄 Divertido", desc: "Leve e carinhoso" },
  { id: "nostalgic", label: "🥹 Nostálgico", desc: "Sentimental e especial" },
  { id: "passionate", label: "🔥 Intenso", desc: "Apaixonado e profundo" },
];

export default function AILoveLetter() {
  const [partnerName, setPartnerName] = useState("");
  const [feelings, setFeelings] = useState("");
  const [memories, setMemories] = useState("");
  const [tone, setTone] = useState("romantic");
  const [result, setResult] = useState<{ letter: string; subject: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const genMut = useMutation({
    mutationFn: () =>
      customFetch("/api/ai/love-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerName, feelings, memories, tone }),
      }).then(r => r.json()),
    onSuccess: (data) => {
      setResult(data);
      customFetch("/api/achievements/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "love_letter" }) });
    },
    onError: () => toast.error("Erro ao gerar carta. Tente novamente."),
  });

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.letter);
    setCopied(true);
    toast.success("Carta copiada! 💌");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!result) return;
    if (navigator.share) {
      navigator.share({ title: result.subject, text: result.letter });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Link href="/ai">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Carta de Amor com IA</h1>
          <p className="text-xs text-muted-foreground">Uma declaração única e especial</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <ClayCard className="p-5 bg-gradient-to-br from-pink-50 to-red-50">
              <div className="text-center mb-4">
                <span className="text-4xl">💌</span>
                <p className="text-sm text-muted-foreground mt-2">Conte seus sentimentos e a IA criará uma carta personalizada e emocionante</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Nome do(a) parceiro(a)</label>
                  <input
                    className="w-full mt-1 bg-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                    placeholder="Ex: Ana, João, Meu amor..."
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">O que você sente? *</label>
                  <textarea
                    className="w-full mt-1 bg-white rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 shadow-sm min-h-[100px]"
                    placeholder="Ex: Sinto que ela me faz uma pessoa melhor, que o amor dela é meu porto seguro..."
                    value={feelings}
                    onChange={e => setFeelings(e.target.value)}
                    maxLength={400}
                  />
                  <span className="text-xs text-muted-foreground">{feelings.length}/400</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Memórias especiais (opcional)</label>
                  <textarea
                    className="w-full mt-1 bg-white rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 shadow-sm min-h-[70px]"
                    placeholder="Ex: Nossa primeira viagem juntos, a noite que ficamos olhando para as estrelas..."
                    value={memories}
                    onChange={e => setMemories(e.target.value)}
                    maxLength={300}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Tom da carta:</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {TONES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${tone === t.id ? "border-primary bg-primary/5" : "border-transparent bg-white"}`}
                      >
                        <p className="text-sm font-semibold">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => genMut.mutate()}
                  disabled={!feelings.trim() || genMut.isPending}
                  className="w-full bg-gradient-to-r from-primary to-purple-500 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {genMut.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Escrevendo com amor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Carta de Amor
                    </>
                  )}
                </button>
              </div>
            </ClayCard>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <ClayCard className="p-5 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="text-center mb-4">
                <span className="text-3xl">💌</span>
                <p className="text-sm font-semibold text-foreground mt-1">{result.subject}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-inner">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-serif italic">
                  {result.letter}
                </p>
              </div>
            </ClayCard>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-white py-3 rounded-2xl text-sm font-semibold shadow-md text-foreground"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-2xl text-sm font-semibold shadow-md"
              >
                <Mail className="w-4 h-4" />
                Compartilhar
              </button>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-3 bg-white rounded-2xl shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar nova carta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
