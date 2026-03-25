import { useState } from "react";
import { useStartMediation } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

export default function AIMediation() {
  const [concern, setConcern] = useState("");
  const medMut = useStartMediation();

  const handleSend = () => {
    if (!concern) return;
    medMut.mutate({ data: { concern } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ai" className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl text-foreground">Mediação de Conflito</h1>
      </div>

      {!medMut.data ? (
        <ClayCard className="space-y-4">
          <p className="text-foreground/80 font-medium leading-relaxed">
            Escreva o que está te incomodando como se estivesse desabafando. 
            A inteligência artificial vai ajudar a traduzir isso para uma comunicação não-violenta (CNV).
          </p>
          <textarea 
            className="w-full h-40 bg-white/50 rounded-2xl p-4 outline-none border-2 border-transparent focus:border-secondary/50 shadow-inner resize-none text-foreground"
            placeholder="Me sinto ignorado quando ele não responde minhas mensagens..."
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          />
          <ClayButton variant="secondary" className="w-full" onClick={handleSend} isLoading={medMut.isPending}>
            Reescrever com Empatia
          </ClayButton>
        </ClayCard>
      ) : (
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-400">
          <ClayCard className="bg-secondary/10 border-secondary/30">
            <h3 className="font-bold text-secondary-foreground mb-2 flex items-center gap-2">
              <Send className="w-4 h-4" /> Mensagem Reformulada
            </h3>
            <p className="text-lg italic text-foreground leading-relaxed">"{medMut.data.reframedMessage}"</p>
          </ClayCard>

          <ClayCard>
            <h3 className="font-bold text-foreground mb-3">Dicas de Comunicação</h3>
            <ul className="space-y-2">
              {medMut.data.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-foreground/80 text-sm">
                  <span className="text-primary mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
            <ClayButton variant="secondary" className="w-full mt-6" onClick={() => medMut.reset()}>
              Nova Mediação
            </ClayButton>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
