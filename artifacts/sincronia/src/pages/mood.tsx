import { useState } from "react";
import { useLocation } from "wouter";
import { useCheckInMood, useGetTodayMoods } from "@workspace/api-client-react";
import { ClayButton, ClayInput } from "@/components/ui/clay-components";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDashboardQueryKey, getGetTodayMoodsQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const MOODS = [
  { id: "happy",    label: "Feliz",       emoji: "😊", color: "bg-yellow-200" },
  { id: "excited",  label: "Animado",     emoji: "⚡", color: "bg-orange-300" },
  { id: "calm",     label: "Calmo",       emoji: "🌊", color: "bg-blue-200"   },
  { id: "focused",  label: "Focado",      emoji: "🎯", color: "bg-indigo-300" },
  { id: "tired",    label: "Cansado",     emoji: "🔋", color: "bg-stone-300"  },
  { id: "stressed", label: "Estressado",  emoji: "😤", color: "bg-red-300"    },
  { id: "sad",      label: "Triste",      emoji: "😢", color: "bg-blue-400"   },
  { id: "anxious",  label: "Ansioso",     emoji: "😰", color: "bg-purple-300" },
  { id: "romantic", label: "Romântico",   emoji: "💕", color: "bg-pink-300"   },
  { id: "playful",  label: "Divertido",   emoji: "🎉", color: "bg-fuchsia-300"},
] as const;

type MoodId = typeof MOODS[number]["id"];

export default function MoodCheckIn() {
  const [selected, setSelected] = useState<typeof MOODS[number] | null>(null);
  const [note, setNote] = useState("");
  const [didSubmit, setDidSubmit] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const checkInMut = useCheckInMood();
  const { data: todayMoods } = useGetTodayMoods();

  const myMood = (todayMoods as any)?.myMood;
  const partnerMood = (todayMoods as any)?.partnerMood;
  const alreadyCheckedIn = !!myMood && !didSubmit;

  const handleSubmit = () => {
    if (!selected) return;
    checkInMut.mutate(
      { data: { mood: selected.id, note: note || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodayMoodsQueryKey() });
          setDidSubmit(true);
          setTimeout(() => setLocation("/app"), 1800);
        },
      }
    );
  };

  // Success state
  if (checkInMut.isSuccess && selected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4"
      >
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-5xl">{selected.emoji}</span>
        </div>
        <div className="space-y-2">
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Humor registrado!</h2>
          <p className="text-muted-foreground">
            {partnerMood
              ? "Ambos já fizeram check-in! Veja a sincronia no dashboard. 💕"
              : "Aguardando o humor do seu par..."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Voltando ao início...</p>
      </motion.div>
    );
  }

  // Already checked in today state
  if (alreadyCheckedIn) {
    const currentMood = MOODS.find(m => m.id === myMood.mood);
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pb-10"
      >
        <div className="text-center space-y-2 mt-4">
          <h1 className="text-3xl text-foreground">Humor de Hoje</h1>
          <p className="text-muted-foreground font-medium">Você já registrou seu humor hoje.</p>
        </div>

        <div className={`mx-auto w-32 h-32 rounded-full flex flex-col items-center justify-center ${currentMood?.color ?? "bg-pink-200"} shadow-xl`}>
          <span className="text-5xl">{currentMood?.emoji ?? "🙂"}</span>
          <span className="text-sm font-bold mt-1 text-foreground/80">{currentMood?.label}</span>
        </div>

        {myMood.note && (
          <div className="bg-white/70 rounded-2xl p-4 text-sm text-foreground/80 text-center shadow-inner italic">
            "{myMood.note}"
          </div>
        )}

        {partnerMood ? (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 text-center space-y-1">
            <p className="font-bold text-foreground">💕 Sintonia do casal</p>
            <p className="text-sm text-muted-foreground">
              {partnerMood.userName} está se sentindo {MOODS.find(m => m.id === partnerMood.mood)?.label?.toLowerCase() ?? partnerMood.mood}
            </p>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-2xl p-4 text-center text-sm text-muted-foreground">
            🔒 Aguardando o humor do seu par para revelar a sincronia...
          </div>
        )}

        <ClayButton
          onClick={() => setDidSubmit(true)}
          className="w-full"
          variant="secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar meu humor
        </ClayButton>

        <ClayButton onClick={() => setLocation("/app")} className="w-full">
          Voltar ao início
        </ClayButton>
      </motion.div>
    );
  }

  // Normal check-in flow
  return (
    <div className="space-y-8 pb-10">
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-3xl text-foreground">Como você está?</h1>
        <p className="text-muted-foreground font-medium">Sincronize seu humor de hoje com seu par.</p>
        <p className="text-xs text-primary font-semibold">
          🔒 O humor do seu par só é revelado quando ambos fizerem check-in
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-2"
      >
        {MOODS.map(mood => (
          <motion.button
            key={mood.id}
            onClick={() => setSelected(mood)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-[2rem] transition-all duration-200 relative",
              "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]",
              selected?.id === mood.id
                ? `border-4 border-white ${mood.color} shadow-[0_10px_24px_rgba(0,0,0,0.12)]`
                : "bg-white border-2 border-transparent hover:shadow-md"
            )}
          >
            {selected?.id === mood.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
            <span className="text-4xl mb-2 filter drop-shadow-sm">{mood.emoji}</span>
            <span className="font-semibold text-sm text-foreground/80">{mood.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-3xl">{selected.emoji}</span>
            <span className="font-bold text-lg text-foreground">{selected.label}</span>
          </div>
          <ClayInput
            placeholder="Quer adicionar uma nota? (Opcional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <ClayButton className="w-full text-lg" onClick={handleSubmit} isLoading={checkInMut.isPending}>
            Sincronizar 🤍
          </ClayButton>
        </motion.div>
      )}
    </div>
  );
}
