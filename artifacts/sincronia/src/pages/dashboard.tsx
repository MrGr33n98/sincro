import { useGetDashboard, useGetTodayMoods } from "@workspace/api-client-react";
import { ClayCard } from "@/components/ui/clay-components";
import { getGreeting } from "@/lib/utils";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Flame, MessageCircleHeart, Calendar, Activity, SmilePlus,
  Sparkles, TrendingUp, Clock, ChevronRight, AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊", excited: "⚡", calm: "🌊", focused: "🎯", tired: "🔋",
  stressed: "😤", sad: "😢", anxious: "😰", romantic: "💕", playful: "🎉"
};

const MOOD_LABELS: Record<string, string> = {
  happy: "Feliz", excited: "Animado", calm: "Calmo", focused: "Focado",
  tired: "Cansado", stressed: "Estressado", sad: "Triste",
  anxious: "Ansioso", romantic: "Romântico", playful: "Divertido"
};

const COMM_LABELS: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta"
};

const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { data: todayMoods } = useGetTodayMoods();

  if (isLoading || !dashboard) {
    return (
      <div className="animate-pulse space-y-4 pt-2">
        <div className="h-10 bg-muted rounded-xl w-2/3"></div>
        <div className="h-40 bg-card rounded-3xl"></div>
        <div className="h-32 bg-card rounded-3xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-card rounded-3xl"></div>
          <div className="h-24 bg-card rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const rhs = dashboard.rhsScore.current;
  const rhsColor = rhs > 80 ? "#F472B6" : rhs > 60 ? "#FBBF24" : "#F87171";
  const rhsLabel = rhs > 80 ? "Excelente 💕" : rhs > 60 ? "Bom 😊" : rhs > 40 ? "Atenção ⚠️" : "Precisa de cuidado 💬";

  const myMood = (todayMoods as any)?.myMood ?? dashboard.moodSync?.user1;
  const partnerMood = (todayMoods as any)?.partnerMood ?? dashboard.moodSync?.user2;
  const bothCheckedIn = dashboard.moodSync?.bothCheckedIn;
  const aiInsight = dashboard.moodSync?.aiInsight;

  const suggestion = dashboard.aiConcierge?.suggestion;
  const nextDate = dashboard.aiConcierge?.nextDate;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-5 pb-4">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-3xl text-foreground">{getGreeting()}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>{dashboard.stats.streakDays} {dashboard.stats.streakDays === 1 ? "dia" : "dias"} de conexão</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-xl">
          💑
        </div>
      </motion.div>

      {/* RHS Score */}
      <motion.div variants={fadeUp}>
        <ClayCard className="flex flex-row items-center gap-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="w-24 h-24 shrink-0">
            <CircularProgressbar
              value={rhs}
              text={`${rhs}`}
              strokeWidth={12}
              styles={buildStyles({
                textSize: "28px",
                pathColor: rhsColor,
                textColor: "hsl(350, 30%, 25%)",
                trailColor: "rgba(0,0,0,0.06)",
                strokeLinecap: "round",
              })}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Saúde da Relação</p>
            <h2 className="text-xl text-foreground">{rhsLabel}</h2>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-white rounded-full text-xs font-bold text-foreground shadow-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {dashboard.rhsScore.trend === "up" ? "↗ Subindo" : dashboard.rhsScore.trend === "down" ? "↘ Caindo" : "→ Estável"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-bold text-muted-foreground">
              <span>💬 Comm. {dashboard.rhsScore.breakdown.communication}%</span>
              <span>😊 Humor {dashboard.rhsScore.breakdown.moodConsistency}%</span>
              <span>🔥 Streak {dashboard.rhsScore.breakdown.streak}%</span>
              <span>⏱️ Tempo {dashboard.rhsScore.breakdown.qualityTime}%</span>
            </div>
          </div>
        </ClayCard>
      </motion.div>

      {/* Mood Sync */}
      <motion.div variants={fadeUp}>
        <ClayCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <SmilePlus className="w-5 h-5 text-primary" />
              Humor de Hoje
            </h3>
            <Link href="/mood" className="text-primary text-sm font-bold flex items-center gap-0.5 hover:underline">
              {myMood ? "Atualizar" : "Registrar"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center text-3xl border-2 border-primary/10">
                {myMood ? MOOD_EMOJIS[myMood.mood] || "🙂" : "❓"}
              </div>
              <span className="text-xs font-bold text-center">
                Você{myMood ? <><br /><span className="text-primary font-normal">{MOOD_LABELS[myMood.mood]}</span></> : ""}
              </span>
            </div>

            <div className="flex-1 flex justify-center items-center relative">
              <div className="h-[2px] w-full max-w-[60px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              {bothCheckedIn && (
                <span className="absolute text-lg animate-pulse">💕</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center border-2 border-secondary/10">
                {bothCheckedIn && partnerMood
                  ? <span className="text-3xl">{MOOD_EMOJIS[partnerMood.mood] || "🙂"}</span>
                  : <span className="text-2xl opacity-30">🔒</span>}
              </div>
              <span className="text-xs font-bold text-center">
                {partnerMood?.userName ?? "Par"}{bothCheckedIn && partnerMood ? <><br /><span className="text-secondary-foreground font-normal">{MOOD_LABELS[partnerMood.mood]}</span></> : ""}
              </span>
            </div>
          </div>

          {!myMood && (
            <Link href="/mood">
              <div className="mt-4 p-3 bg-primary/10 rounded-xl text-sm text-primary font-bold text-center border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                Registre seu humor agora para sincronizar com seu par ✨
              </div>
            </Link>
          )}

          {bothCheckedIn && aiInsight && (
            <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl text-sm text-foreground/80 text-center font-medium">
              🤖 {aiInsight}
            </div>
          )}

          {myMood && !bothCheckedIn && (
            <div className="mt-4 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground text-center">
              Aguardando o humor do seu par... 🔒
            </div>
          )}
        </ClayCard>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        <ClayCard className="!p-4 flex flex-col items-center text-center gap-1">
          <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          <span className="text-xl font-black text-foreground">{dashboard.stats.streakDays}</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Streak</span>
        </ClayCard>
        <ClayCard className="!p-4 flex flex-col items-center text-center gap-1">
          <MessageCircleHeart className="w-5 h-5 text-primary" />
          <span className="text-xl font-black text-foreground capitalize">{COMM_LABELS[dashboard.stats.communicationLevel] ?? dashboard.stats.communicationLevel}</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Comm.</span>
        </ClayCard>
        <ClayCard className="!p-4 flex flex-col items-center text-center gap-1">
          <Clock className="w-5 h-5 text-accent" />
          <span className="text-xl font-black text-foreground">{dashboard.stats.weeklyQualityHours}h</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Juntos</span>
        </ClayCard>
      </motion.div>

      {/* AI Date Suggestion */}
      {(nextDate || suggestion) && (
        <motion.div variants={fadeUp}>
          <Link href="/ai/dates">
            <ClayCard className="bg-gradient-to-br from-accent/10 to-primary/10 border-primary/15 hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-base text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  {nextDate ? "Próximo Date Agendado" : "Sugestão de Date ✨"}
                </h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-bold text-foreground text-lg">
                {nextDate ? nextDate.title : suggestion?.title}
              </p>
              {nextDate ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(nextDate.scheduledAt).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{suggestion?.description}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {suggestion?.estimatedCost && (
                      <span className="text-xs bg-white/80 px-2.5 py-1 rounded-full font-bold text-muted-foreground shadow-sm">
                        💰 {suggestion.estimatedCost}
                      </span>
                    )}
                    {suggestion?.location && (
                      <span className="text-xs bg-white/80 px-2.5 py-1 rounded-full font-bold text-muted-foreground shadow-sm">
                        📍 {suggestion.location}
                      </span>
                    )}
                    {suggestion?.effortLevel && (
                      <span className="text-xs bg-white/80 px-2.5 py-1 rounded-full font-bold text-muted-foreground shadow-sm">
                        ⚡ {suggestion.effortLevel === "low" ? "Fácil" : suggestion.effortLevel === "medium" ? "Médio" : "Especial"}
                      </span>
                    )}
                  </div>
                </>
              )}
            </ClayCard>
          </Link>
        </motion.div>
      )}

      {/* AI Hub Quick Access */}
      <motion.div variants={fadeUp}>
        <ClayCard className="bg-gradient-to-br from-secondary/10 to-transparent">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">IA Concierge</p>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/ai/dates">
              <div className="flex flex-col items-center gap-2 p-3 bg-white/70 rounded-2xl hover:bg-white transition-colors cursor-pointer">
                <Calendar className="w-6 h-6 text-accent" />
                <span className="text-xs font-bold text-center text-foreground/80">Dates</span>
              </div>
            </Link>
            <Link href="/ai/mediation">
              <div className="flex flex-col items-center gap-2 p-3 bg-white/70 rounded-2xl hover:bg-white transition-colors cursor-pointer">
                <MessageCircleHeart className="w-6 h-6 text-secondary-foreground" />
                <span className="text-xs font-bold text-center text-foreground/80">Mediar</span>
              </div>
            </Link>
            <Link href="/ai/chat">
              <div className="flex flex-col items-center gap-2 p-3 bg-white/70 rounded-2xl hover:bg-white transition-colors cursor-pointer">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold text-center text-foreground/80">Chat</span>
              </div>
            </Link>
          </div>
        </ClayCard>
      </motion.div>

      {/* Conflict CTA */}
      <motion.div variants={fadeUp} className="flex justify-center pt-2 pb-6">
        <Link href="/ai/mediation">
          <button className="bg-white px-6 py-3 rounded-full shadow-[0_8px_20px_rgba(200,100,150,0.2)] font-bold text-secondary-foreground border border-secondary/20 flex items-center gap-2 hover:scale-105 transition-transform text-sm">
            <AlertCircle className="w-4 h-4 text-secondary-foreground" />
            Precisamos Conversar
          </button>
        </Link>
      </motion.div>

    </motion.div>
  );
}
