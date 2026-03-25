import { useState } from "react";
import { useLocation } from "wouter";
import { useCheckInMood } from "@workspace/api-client-react";
import { ClayButton, ClayInput } from "@/components/ui/clay-components";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDashboardQueryKey, getGetTodayMoodsQueryKey } from "@workspace/api-client-react";

const MOODS = [
  { id: "happy", label: "Feliz", emoji: "😊", color: "bg-yellow-200" },
  { id: "excited", label: "Animado", emoji: "⚡", color: "bg-orange-300" },
  { id: "calm", label: "Calmo", emoji: "🌊", color: "bg-blue-200" },
  { id: "focused", label: "Focado", emoji: "🎯", color: "bg-indigo-300" },
  { id: "tired", label: "Cansado", emoji: "🔋", color: "bg-stone-300" },
  { id: "stressed", label: "Estressado", emoji: "😤", color: "bg-red-300" },
  { id: "sad", label: "Triste", emoji: "😢", color: "bg-blue-400" },
  { id: "anxious", label: "Ansioso", emoji: "😰", color: "bg-purple-300" },
  { id: "romantic", label: "Romântico", emoji: "💕", color: "bg-pink-300" },
  { id: "playful", label: "Divertido", emoji: "🎉", color: "bg-fuchsia-300" },
] as const;

export default function MoodCheckIn() {
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const checkInMut = useCheckInMood();

  const handleSubmit = () => {
    if (!selected) return;
    checkInMut.mutate(
      { data: { mood: selected.id, note: note || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodayMoodsQueryKey() });
          setLocation("/");
        }
      }
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-3xl text-foreground">Como você está?</h1>
        <p className="text-muted-foreground font-medium">Sincronize seu humor de hoje com seu par.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-2">
        {MOODS.map(mood => (
          <button
            key={mood.id}
            onClick={() => setSelected(mood)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-[2rem] transition-all duration-300 relative",
              "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]",
              selected?.id === mood.id 
                ? `scale-105 border-4 border-white ${mood.color} shadow-[0_10px_20px_rgba(0,0,0,0.1)]`
                : "bg-white border-2 border-transparent hover:scale-105"
            )}
          >
            <span className="text-4xl mb-2 filter drop-shadow-sm">{mood.emoji}</span>
            <span className="font-display font-semibold text-foreground/80">{mood.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <ClayInput 
            placeholder="Quer adicionar uma nota? (Opcional)" 
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <ClayButton className="w-full text-lg" onClick={handleSubmit} isLoading={checkInMut.isPending}>
            Sincronizar 🤍
          </ClayButton>
        </div>
      )}
    </div>
  );
}
