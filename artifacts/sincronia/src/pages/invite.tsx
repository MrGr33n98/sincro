import { useState } from "react";
import { useCreateInvite } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { Copy, HeartHandshake, LogOut } from "lucide-react";
import { setAuthToken } from "@/hooks/use-auth";

export default function Invite() {
  const [copied, setCopied] = useState(false);
  const inviteMut = useCreateInvite();

  const handleGenerate = () => {
    inviteMut.mutate({});
  };

  const handleCopy = () => {
    if (inviteMut.data?.inviteUrl) {
      navigator.clipboard.writeText(inviteMut.data.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        
        <div className="flex justify-between items-start w-full absolute top-6 left-0 px-6">
           <button onClick={() => setAuthToken(null)} className="text-muted-foreground hover:text-foreground">
             <LogOut className="w-6 h-6" />
           </button>
        </div>

        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <HeartHandshake className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl text-foreground">Convide seu par</h1>
          <p className="text-muted-foreground font-medium">Para começarem a jornada juntos, envie o link abaixo para o seu parceiro(a).</p>
        </div>

        <ClayCard className="space-y-6 flex flex-col items-center text-center">
          {!inviteMut.data ? (
            <ClayButton onClick={handleGenerate} isLoading={inviteMut.isPending} className="w-full">
              Gerar Link de Convite
            </ClayButton>
          ) : (
            <>
              <div className="bg-secondary/30 p-4 rounded-xl w-full break-all border-2 border-secondary/50">
                <p className="text-sm font-mono text-secondary-foreground">{inviteMut.data.inviteUrl}</p>
              </div>
              
              <ClayButton onClick={handleCopy} className="w-full bg-secondary text-secondary-foreground">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copiado!" : "Copiar Link"}
              </ClayButton>

              <p className="text-xs text-muted-foreground">Aguardando seu parceiro entrar pelo link...</p>
            </>
          )}
        </ClayCard>
      </div>
    </div>
  );
}
