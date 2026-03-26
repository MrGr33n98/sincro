import { Link } from "wouter";
import { ArrowLeft, Trophy, Lock, Star } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AchievementItem {
  type: string;
  label: string;
  description: string;
  emoji: string;
  points: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementsData {
  achievements: AchievementItem[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
}

export default function Achievements() {
  const { data, isLoading } = useQuery<AchievementsData>({
    queryKey: ["achievements"],
    queryFn: () => customFetch("/api/achievements").then(r => r.json()),
  });

  const pct = data ? Math.round((data.unlockedCount / data.totalCount) * 100) : 0;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Link href="/couple">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Conquistas</h1>
          <p className="text-xs text-muted-foreground">Medalhas e marcos do seu amor</p>
        </div>
      </div>

      {!isLoading && data && (
        <>
          <ClayCard className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-bold text-foreground">{data.totalPoints}</p>
                <p className="text-xs text-muted-foreground">pontos de amor</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{data.unlockedCount} de {data.totalCount} conquistas</span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="w-full bg-yellow-100 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              />
            </div>
          </ClayCard>

          <div className="grid grid-cols-1 gap-3">
            {data.achievements.map((ach, i) => (
              <motion.div
                key={ach.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ClayCard className={`p-4 flex items-center gap-4 ${!ach.unlocked ? "opacity-50" : ""}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${ach.unlocked ? "bg-yellow-50 shadow-inner" : "bg-muted"}`}>
                    {ach.unlocked ? ach.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{ach.label}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ach.unlocked ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}>
                        +{ach.points}pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                    {ach.unlocked && ach.unlockedAt && (
                      <p className="text-xs text-primary mt-1">
                        ✓ {format(new Date(ach.unlockedAt), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                  {ach.unlocked && (
                    <Star className="w-5 h-5 text-yellow-500 shrink-0" fill="currentColor" />
                  )}
                </ClayCard>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
