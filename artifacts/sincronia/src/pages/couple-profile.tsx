import { useGetCoupleProfile, useGetSubscriptionStatus } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { Crown, Heart, Settings, CalendarDays } from "lucide-react";
import { Link } from "wouter";

export default function CoupleProfile() {
  const { data: profile, isLoading: isProfileLoading } = useGetCoupleProfile();
  const { data: sub, isLoading: isSubLoading } = useGetSubscriptionStatus();

  if (isProfileLoading || isSubLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-40 bg-card rounded-3xl"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground mb-2">Perfil do Casal</h1>

      <ClayCard className="p-0 overflow-hidden relative">
        <div className="h-24 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="px-6 pb-6 pt-4 relative">
          
          <div className="flex justify-center -mt-16 mb-4">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full border-4 border-card shadow-lg bg-white overflow-hidden z-10">
                {profile?.user1.avatarUrl ? <img src={profile.user1.avatarUrl} alt="User 1"/> : <div className="w-full h-full bg-pink-100 flex items-center justify-center text-xl">👤</div>}
              </div>
              <div className="w-10 h-10 rounded-full bg-card -mx-4 z-20 flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-primary fill-current" />
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-card shadow-lg bg-white overflow-hidden z-10">
                {profile?.user2.avatarUrl ? <img src={profile.user2.avatarUrl} alt="User 2"/> : <div className="w-full h-full bg-blue-100 flex items-center justify-center text-xl">👤</div>}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-semibold text-foreground">
              {profile?.user1.name} & {profile?.user2.name}
            </h2>
            <p className="text-primary font-bold mt-1 flex items-center justify-center gap-1">
              <CalendarDays className="w-4 h-4"/> {profile?.relationshipDays} dias juntos
            </p>
          </div>
        </div>
      </ClayCard>

      <ClayCard className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sub?.isPro ? 'bg-amber-100' : 'bg-muted'}`}>
            <Crown className={`w-6 h-6 ${sub?.isPro ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{sub?.isPro ? 'Plano Premium' : 'Plano Grátis'}</h3>
            <p className="text-sm text-muted-foreground">{sub?.isPro ? 'Todas as features liberadas' : 'Limites de IA ativos'}</p>
          </div>
        </div>
        {!sub?.isPro && (
          <Link href="/upgrade">
            <ClayButton variant="secondary" className="px-4 py-2 text-sm h-auto">Upgrade</ClayButton>
          </Link>
        )}
      </ClayCard>
      
      <div className="flex justify-center pt-8">
        <button className="text-muted-foreground text-sm font-semibold flex items-center gap-2 hover:text-foreground" onClick={() => {
          localStorage.removeItem("sincronia_token");
          window.location.href = "/login";
        }}>
          <Settings className="w-4 h-4"/> Sair da Conta
        </button>
      </div>
    </div>
  );
}
