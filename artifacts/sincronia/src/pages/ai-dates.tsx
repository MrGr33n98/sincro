import { useState } from "react";
import { useGenerateDateSuggestions } from "@workspace/api-client-react";
import { ClayCard, ClayButton, ClayInput } from "@/components/ui/clay-components";
import { ArrowLeft, MapPin, DollarSign, Zap, RefreshCw, Heart, Share2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const BUDGETS = [
  { id: "free",   label: "Gratuito",  icon: "🍃", sub: "R$0" },
  { id: "low",    label: "Econômico", icon: "☕", sub: "R$30-80" },
  { id: "medium", label: "Especial",  icon: "🍷", sub: "R$80-200" },
  { id: "high",   label: "Premium",   icon: "✨", sub: "R$200+" },
] as const;

const TYPE_EMOJI: Record<string, string> = {
  outdoor: "🌿", restaurant: "🍽️", activity: "🎭", cultural: "🎨",
  romantic: "💕", adventure: "🏄", home: "🏠", other: "✨",
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AIDates() {
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState<"free" | "low" | "medium" | "high">("low");
  const [saved, setSaved] = useState<number[]>([]);
  const generateMut = useGenerateDateSuggestions();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMut.mutate({ data: { city, budget, count: 3 } });
  };

  const toggleSave = (i: number) => {
    setSaved(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/ai">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerador de Dates</h1>
          <p className="text-xs text-muted-foreground">Personalizadas para você, no Brasil 🇧🇷</p>
        </div>
      </div>

      {!generateMut.data ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <ClayCard>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 pl-1">📍 Onde vocês estão?</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <ClayInput
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    className="pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 pl-1">💰 Orçamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGETS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBudget(opt.id)}
                      className={`py-3 px-4 rounded-2xl border-2 transition-all text-left ${
                        budget === opt.id
                          ? "bg-primary/10 border-primary"
                          : "bg-white border-transparent shadow-sm hover:border-primary/20"
                      }`}
                    >
                      <div className="text-xl mb-0.5">{opt.icon}</div>
                      <div className="font-bold text-sm text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <ClayButton type="submit" className="w-full" isLoading={generateMut.isPending}>
                <Zap className="w-4 h-4 mr-2" />
                Gerar 3 Ideias Mágicas
              </ClayButton>
            </form>
          </ClayCard>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
          <motion.div variants={fadeUp} className="flex justify-between items-center px-1">
            <div>
              <h2 className="font-bold text-lg text-foreground">Ideias para {city}</h2>
              <p className="text-xs text-muted-foreground">Toque no coração para salvar</p>
            </div>
            <button
              onClick={() => generateMut.reset()}
              className="flex items-center gap-1.5 text-primary text-sm font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              Refazer
            </button>
          </motion.div>

          {generateMut.data.suggestions.map((sug, i) => (
            <motion.div key={i} variants={fadeUp}>
              <ClayCard className="space-y-3 hover:scale-[1.01] transition-transform">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-2xl">{TYPE_EMOJI[sug.type] ?? "✨"}</span>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{sug.title}</h3>
                  </div>
                  <button
                    onClick={() => toggleSave(i)}
                    className="shrink-0 ml-2 p-2 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${saved.includes(i) ? "text-primary fill-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                </div>

                <p className="text-foreground/80 text-sm leading-relaxed">{sug.description}</p>

                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {sug.location && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                      <MapPin className="w-3 h-3" /> {sug.location}
                    </span>
                  )}
                  {sug.estimatedCost && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                      <DollarSign className="w-3 h-3" /> {sug.estimatedCost}
                    </span>
                  )}
                  {sug.effortLevel && (
                    <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full capitalize">
                      ⚡ {sug.effortLevel === "low" ? "Fácil" : sug.effortLevel === "medium" ? "Médio" : "Especial"}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const text = `💕 Ideia de date: ${sug.title}\n${sug.description}\n📍 ${sug.location ?? city}`;
                    if (navigator.share) navigator.share({ title: "Date no Sincronia", text });
                    else navigator.clipboard.writeText(text);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-primary border-2 border-primary/20 rounded-2xl hover:bg-primary/5 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Compartilhar ideia
                </button>
              </ClayCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
