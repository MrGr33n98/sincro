import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useJoinCouple } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Join() {
  const [, params] = useRoute("/join/:token");
  const [, setLocation] = useLocation();
  const joinMut = useJoinCouple();

  const handleJoin = () => {
    if (params?.token) {
      joinMut.mutate({ data: { token: params.token } }, {
        onSuccess: () => {
          setTimeout(() => setLocation("/app"), 2000);
        }
      });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl text-foreground">Convite Especial</h1>
          <p className="text-muted-foreground font-medium">Alguém muito especial quer se conectar com você no Sincronia.</p>
        </div>

        <ClayCard className="space-y-6 flex flex-col items-center text-center">
          {joinMut.isSuccess ? (
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="flex flex-col items-center"
             >
               <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4 animate-bounce">
                 <Heart className="text-white w-12 h-12 fill-current" />
               </div>
               <h2 className="text-2xl font-bold text-primary">Match Realizado!</h2>
               <p className="text-muted-foreground mt-2">Preparando o ambiente de vocês...</p>
             </motion.div>
          ) : (
            <>
              <ClayButton onClick={handleJoin} isLoading={joinMut.isPending} className="w-full">
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Aceitar Convite e Conectar
              </ClayButton>
              {joinMut.isError && <p className="text-destructive text-sm">Convite inválido ou expirado. Tente gerar um novo.</p>}
            </>
          )}
        </ClayCard>
      </div>
    </div>
  );
}
