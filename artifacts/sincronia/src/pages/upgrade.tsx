import { useState } from "react";
import { useUpgradeToPro } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { Crown, CheckCircle2, ArrowLeft, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function Upgrade() {
  const upgradeMut = useUpgradeToPro();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  const handleUpgrade = () => {
    upgradeMut.mutate({ data: { plan: selectedPlan } });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/couple" className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl text-foreground flex items-center gap-2">
          <Crown className="text-amber-400" /> Sincronia Pro
        </h1>
      </div>

      {!upgradeMut.data ? (
        <>
          <ClayCard className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Desbloqueie o máximo do seu relacionamento</h2>
            <ul className="space-y-3 mb-6">
              {[
                "Ideias de Date Ilimitadas",
                "Mediação de Conflitos Avançada",
                "Insights Detalhados de Humor",
                "Evolução do Relationship Score",
                "Zero Anúncios",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-amber-800 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => setSelectedPlan("monthly")}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${selectedPlan === 'monthly' ? 'bg-amber-100 border-amber-400' : 'bg-white border-transparent shadow-sm'}`}
              >
                <div className="text-sm text-muted-foreground font-bold">Mensal</div>
                <div className="text-xl font-display font-bold text-amber-900 mt-1">R$ 19</div>
              </button>
              <button 
                onClick={() => setSelectedPlan("annual")}
                className={`p-3 rounded-2xl border-2 text-center relative transition-all ${selectedPlan === 'annual' ? 'bg-amber-100 border-amber-400' : 'bg-white border-transparent shadow-sm'}`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Save 40%</div>
                <div className="text-sm text-muted-foreground font-bold">Anual</div>
                <div className="text-xl font-display font-bold text-amber-900 mt-1">R$ 139</div>
              </button>
            </div>

            <ClayButton className="w-full bg-amber-500 text-white hover:bg-amber-600" onClick={handleUpgrade} isLoading={upgradeMut.isPending}>
              Assinar via PIX
            </ClayButton>
          </ClayCard>
        </>
      ) : (
        <ClayCard className="text-center space-y-5 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-foreground">Pagamento PIX</h2>
          <p className="text-muted-foreground text-sm">Escaneie o QR Code abaixo ou copie o código PIX Copia e Cola para ativar seu plano Pro imediatamente.</p>
          
          <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-dashed border-border w-48 h-48 flex items-center justify-center">
            <QrCode className="w-32 h-32 text-muted-foreground opacity-50" />
            {/* In a real app we'd display the actual base64 qrcode image from upgradeMut.data.pixQrCode */}
          </div>
          
          <div className="w-full space-y-2">
            <div className="bg-secondary/20 p-3 rounded-xl break-all text-xs font-mono border border-secondary/40 text-left">
              {upgradeMut.data.pixCode}
            </div>
            <ClayButton variant="secondary" className="w-full text-sm" onClick={() => navigator.clipboard.writeText(upgradeMut.data.pixCode)}>
              Copiar Código PIX
            </ClayButton>
          </div>
          <p className="text-xs text-muted-foreground font-bold animate-pulse">Aguardando confirmação de pagamento...</p>
        </ClayCard>
      )}
    </div>
  );
}
