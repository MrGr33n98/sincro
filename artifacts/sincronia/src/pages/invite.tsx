import { useState, useEffect } from "react";
import { useCreateInvite } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { Copy, HeartHandshake, LogOut, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { setAuthToken } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

function useCountdown(expiresAt: string | undefined) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expirado"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

export default function Invite() {
  const [copied, setCopied] = useState(false);
  const inviteMut = useCreateInvite();
  const [, setLocation] = useLocation();
  const countdown = useCountdown(inviteMut.data?.expiresAt);

  const handleGenerate = () => { inviteMut.mutate({}); };

  const handleCopy = () => {
    if (inviteMut.data?.inviteUrl) {
      navigator.clipboard.writeText(inviteMut.data.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setLocation("/login");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background relative">

      {/* Logout top-left */}
      <button
        onClick={handleLogout}
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <HeartHandshake className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl text-foreground">Convide seu par</h1>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Gere um link único e compartilhe com seu parceiro(a). O link é válido por 24h.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ClayCard className="space-y-6">
            {!inviteMut.data ? (
              <>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Gere o link de convite abaixo" },
                    { step: "2", text: "Envie para seu parceiro(a) pelo WhatsApp" },
                    { step: "3", text: "Quando ele(a) aceitar, vocês são pareados 💕" },
                  ].map(s => (
                    <div key={s.step} className="flex items-center gap-3 text-sm text-foreground/80">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                        {s.step}
                      </div>
                      {s.text}
                    </div>
                  ))}
                </div>
                <ClayButton onClick={handleGenerate} isLoading={inviteMut.isPending} className="w-full">
                  Gerar Link de Convite 💌
                </ClayButton>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                {/* Success indicator */}
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Link gerado com sucesso!
                </div>

                {/* URL box */}
                <div className="bg-secondary/20 p-4 rounded-2xl w-full break-all border-2 border-secondary/30">
                  <p className="text-xs font-mono text-secondary-foreground leading-relaxed">
                    {inviteMut.data.inviteUrl}
                  </p>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Expira em: <span className="font-mono font-bold text-foreground">{countdown}</span></span>
                </div>

                {/* Actions */}
                <ClayButton onClick={handleCopy} className="w-full">
                  {copied ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" />Copiado!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" />Copiar Link</>
                  )}
                </ClayButton>

                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground font-semibold py-2 hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Gerar novo link
                </button>

                {/* Waiting */}
                <div className="bg-primary/10 rounded-2xl p-4 text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-primary">
                    Aguardando seu parceiro(a) aceitar...
                  </p>
                </div>
              </motion.div>
            )}
          </ClayCard>
        </motion.div>

      </div>
    </div>
  );
}
