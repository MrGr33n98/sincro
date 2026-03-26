import { useGetCoupleProfile, useGetSubscriptionStatus, useGetDashboard } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { Crown, Heart, LogOut, CalendarDays, Flame, TrendingUp, ChevronRight, Edit2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { setAuthToken } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CoupleProfile() {
  const { data: profile, isLoading: isProfileLoading } = useGetCoupleProfile();
  const { data: sub } = useGetSubscriptionStatus();
  const { data: dashboard } = useGetDashboard();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setAuthToken(null);
    setLocation("/login");
  };

  if (isProfileLoading) {
    return (
      <div className="animate-pulse space-y-4 pt-2">
        <div className="h-48 bg-card rounded-3xl" />
        <div className="h-20 bg-card rounded-3xl" />
        <div className="h-20 bg-card rounded-3xl" />
      </div>
    );
  }

  const rhs = dashboard?.rhsScore?.current ?? 0;
  const rhsColor = rhs > 80 ? "#F472B6" : rhs > 60 ? "#FBBF24" : "#F87171";

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-5 pb-6">

      {/* Cover + Avatar */}
      <motion.div variants={fadeUp}>
        <ClayCard className="p-0 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary via-secondary to-accent relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex justify-center -mt-14 mb-4">
              <div className="flex items-center gap-0">
                <div className="w-20 h-20 rounded-full border-4 border-card shadow-lg bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-2xl z-10">
                  {profile?.user1.avatarUrl
                    ? <img src={profile.user1.avatarUrl} className="w-full h-full object-cover rounded-full" alt="User 1" />
                    : "👤"}
                </div>
                <div className="w-10 h-10 rounded-full bg-card -mx-3 z-20 flex items-center justify-center shadow-md border-2 border-card">
                  <Heart className="w-5 h-5 text-primary fill-current" />
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-card shadow-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-2xl z-10">
                  {profile?.user2.avatarUrl
                    ? <img src={profile.user2.avatarUrl} className="w-full h-full object-cover rounded-full" alt="User 2" />
                    : "👤"}
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {profile?.user1.name} & {profile?.user2.name}
              </h2>
              <p className="text-primary font-bold mt-1 flex items-center justify-center gap-1.5 text-sm">
                <CalendarDays className="w-4 h-4" />
                {profile?.relationshipDays ?? 0} {profile?.relationshipDays === 1 ? "dia" : "dias"} juntos
              </p>
              {profile?.anniversaryDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  💍 Aniversário: {new Date(profile.anniversaryDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                </p>
              )}
            </div>
          </div>
        </ClayCard>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        <ClayCard className="!p-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 mb-1">
            <CircularProgressbar
              value={rhs}
              text={`${rhs}`}
              strokeWidth={14}
              styles={buildStyles({
                textSize: "32px",
                pathColor: rhsColor,
                textColor: "hsl(350,30%,25%)",
                trailColor: "rgba(0,0,0,0.05)",
              })}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Saúde</span>
        </ClayCard>
        <ClayCard className="!p-4 flex flex-col items-center text-center gap-1">
          <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
          <span className="text-xl font-black text-foreground">{dashboard?.stats?.streakDays ?? 0}</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Streak</span>
        </ClayCard>
        <ClayCard className="!p-4 flex flex-col items-center text-center gap-1">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <span className="text-xl font-black text-foreground capitalize">
            {dashboard?.rhsScore?.trend === "up" ? "↗" : dashboard?.rhsScore?.trend === "down" ? "↘" : "→"}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Tendência</span>
        </ClayCard>
      </motion.div>

      {/* RHS Breakdown */}
      {dashboard?.rhsScore?.breakdown && (
        <motion.div variants={fadeUp}>
          <ClayCard>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Breakdown da Saúde</p>
            <div className="space-y-3">
              {[
                { label: "Comunicação", value: dashboard.rhsScore.breakdown.communication, color: "#F472B6" },
                { label: "Sintonia de Humor", value: dashboard.rhsScore.breakdown.moodConsistency, color: "#A78BFA" },
                { label: "Streak", value: dashboard.rhsScore.breakdown.streak, color: "#FB923C" },
                { label: "Tempo de Qualidade", value: dashboard.rhsScore.breakdown.qualityTime, color: "#34D399" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-foreground/80">{label}</span>
                    <span style={{ color }}>{value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ClayCard>
        </motion.div>
      )}

      {/* Subscription */}
      <motion.div variants={fadeUp}>
        <ClayCard className={`flex items-center justify-between ${sub?.isPro ? "border-amber-200 bg-gradient-to-r from-amber-50 to-white" : ""}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sub?.isPro ? "bg-amber-100" : "bg-muted"}`}>
              <Crown className={`w-6 h-6 ${sub?.isPro ? "text-amber-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{sub?.isPro ? "Plano Pro 🔓" : "Plano Grátis"}</h3>
              <p className="text-sm text-muted-foreground">
                {sub?.isPro ? "Todas as features desbloqueadas" : "Upgrade para features ilimitadas"}
              </p>
            </div>
          </div>
          {!sub?.isPro && (
            <Link href="/upgrade">
              <button className="text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-2 rounded-full flex items-center gap-1 shadow-md">
                Pro <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          )}
        </ClayCard>
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} className="space-y-3">
        <Link href="/upgrade">
          <ClayCard className="flex items-center justify-between !py-4 cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <span className="font-semibold text-foreground">Ver planos e upgrade</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </ClayCard>
        </Link>

        <ClayCard className="flex items-center justify-between !py-4 cursor-pointer hover:scale-[1.01] transition-transform opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="font-semibold text-foreground">Editar perfil</span>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Em breve</span>
        </ClayCard>
      </motion.div>

      {/* Logout */}
      <motion.div variants={fadeUp} className="flex justify-center pt-4 pb-4">
        <button
          onClick={handleLogout}
          className="text-muted-foreground text-sm font-semibold flex items-center gap-2 hover:text-destructive transition-colors px-4 py-2 rounded-full"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </motion.div>

    </motion.div>
  );
}
