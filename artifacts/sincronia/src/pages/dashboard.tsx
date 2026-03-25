import { useGetDashboard } from "@workspace/api-client-react";
import { ClayCard } from "@/components/ui/clay-components";
import { getGreeting } from "@/lib/utils";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Flame, MessageCircleHeart, Calendar, ArrowRight, Activity, SmilePlus } from "lucide-react";
import { Link } from "wouter";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊", excited: "⚡", calm: "🌊", focused: "🎯", tired: "🔋",
  stressed: "😤", sad: "😢", anxious: "😰", romantic: "💕", playful: "🎉"
};

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading || !dashboard) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-muted rounded-xl w-1/2"></div>
      <div className="h-64 bg-card rounded-3xl"></div>
      <div className="h-32 bg-card rounded-3xl"></div>
    </div>;
  }

  const rhsColor = dashboard.rhsScore.current > 80 ? "#F9A8D4" : dashboard.rhsScore.current > 60 ? "#FCD34D" : "#FCA5A5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground">{getGreeting()}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            {dashboard.stats.streakDays} dias de conexão
          </p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-primary/20">
           <img src={`${import.meta.env.BASE_URL}images/couple-placeholder.png`} className="w-full h-full object-cover" alt="Couple" />
        </div>
      </div>

      {/* RHS Score */}
      <ClayCard className="flex flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>
        <div className="w-28 h-28 shrink-0">
          <CircularProgressbar 
            value={dashboard.rhsScore.current} 
            text={`${dashboard.rhsScore.current}`}
            strokeWidth={12}
            styles={buildStyles({
              textSize: '28px',
              pathColor: rhsColor,
              textColor: 'hsl(350, 30%, 25%)',
              trailColor: 'rgba(0,0,0,0.05)',
              strokeLinecap: 'round',
            })}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl">Saúde da Relação</h2>
          <div className="mt-2 flex items-center gap-2">
             <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-foreground shadow-sm flex items-center gap-1">
               {dashboard.rhsScore.trend === 'up' ? '↗' : dashboard.rhsScore.trend === 'down' ? '↘' : '→'}
               {dashboard.rhsScore.variation}%
             </span>
             <span className="text-sm text-muted-foreground">esta semana</span>
          </div>
        </div>
      </ClayCard>

      {/* Mood Sync Widget */}
      <ClayCard className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <SmilePlus className="w-5 h-5 text-primary" />
            Sincronia de Humor
          </h3>
          {!dashboard.moodSync.bothCheckedIn && (
            <Link href="/mood" className="text-primary text-sm font-bold hover:underline">Atualizar</Link>
          )}
        </div>
        
        <div className="flex items-center justify-around px-2">
           <div className="flex flex-col items-center gap-2">
             <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center text-3xl">
               {dashboard.moodSync.user1 ? MOOD_EMOJIS[dashboard.moodSync.user1.mood] || "🙂" : "❓"}
             </div>
             <span className="text-sm font-bold">Você</span>
           </div>
           
           <div className="flex-1 flex justify-center">
             <div className="h-[2px] w-full max-w-[50px] bg-gradient-to-r from-transparent via-primary/30 to-transparent relative">
                {dashboard.moodSync.bothCheckedIn && <HeartPulse />}
             </div>
           </div>

           <div className="flex flex-col items-center gap-2">
             <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center text-3xl">
               {dashboard.moodSync.user2 ? MOOD_EMOJIS[dashboard.moodSync.user2.mood] || "🙂" : "❓"}
             </div>
             <span className="text-sm font-bold">Par</span>
           </div>
        </div>
        {dashboard.moodSync.bothCheckedIn && dashboard.moodSync.aiInsight && (
          <div className="mt-4 p-3 bg-secondary/20 rounded-xl text-sm text-secondary-foreground text-center font-medium">
            {dashboard.moodSync.aiInsight}
          </div>
        )}
      </ClayCard>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 gap-4">
         <ClayCard className="!p-5 flex flex-col justify-center text-center gap-1">
           <MessageCircleHeart className="w-6 h-6 text-primary mx-auto mb-1" />
           <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Comunicação</span>
           <span className="text-lg font-display text-foreground capitalize">{dashboard.stats.communicationLevel}</span>
         </ClayCard>
         <ClayCard className="!p-5 flex flex-col justify-center text-center gap-1">
           <Activity className="w-6 h-6 text-accent mx-auto mb-1" />
           <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tempo Juntos</span>
           <span className="text-lg font-display text-foreground">{dashboard.stats.weeklyQualityHours} hrs</span>
         </ClayCard>
      </div>

      {/* Next Date Idea */}
      {dashboard.aiConcierge.nextDate && (
        <ClayCard className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex justify-between items-start mb-2">
             <h3 className="font-display text-lg text-foreground flex items-center gap-2">
               <Calendar className="w-5 h-5 text-primary" />
               Próximo Date
             </h3>
          </div>
          <p className="font-bold text-foreground text-lg">{dashboard.aiConcierge.nextDate.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{new Date(dashboard.aiConcierge.nextDate.scheduledAt).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </ClayCard>
      )}

      {/* Floating Action / Emergency */}
      <div className="pt-4 flex justify-center">
        <Link href="/ai/mediation" className="bg-white px-6 py-3 rounded-full shadow-[0_8px_16px_rgba(200,200,200,0.5)] font-bold text-secondary-foreground border border-secondary/20 flex items-center gap-2 hover:scale-105 transition-transform">
          <MessageCircleHeart className="w-5 h-5" />
          Precisamos Conversar
        </Link>
      </div>
      
    </div>
  );
}

function HeartPulse() {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-primary animate-pulse">
      💕
    </div>
  )
}
