import { useState } from "react";
import { useStartMediation } from "@workspace/api-client-react";
import { ClayCard, ClayButton } from "@/components/ui/clay-components";
import { ArrowLeft, Heart, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const EXAMPLES = [
  "Me sinto ignorado(a) quando você fica no celular durante o jantar...",
  "Fico triste quando nossos planos são cancelados de última hora...",
  "Me sinto sobrecarregado(a) quando preciso fazer tudo sozinho(a)...",
];

export default function AIMediation() {
  const [concern, setConcern] = useState("");
  const [copied, setCopied] = useState(false);
  const medMut = useStartMediation();

  const handleSend = () => {
    if (!concern.trim()) return;
    medMut.mutate({ data: { concern } });
  };

  const handleCopy = () => {
    if (medMut.data?.reframedMessage) {
      navigator.clipboard.writeText(medMut.data.reframedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/ai">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mediação de Conflito</h1>
          <p className="text-xs text-muted-foreground">Comunicação Não-Violenta com IA 💬</p>
        </div>
      </div>

      {!medMut.data ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* CNV Explanation */}
          <ClayCard className="bg-secondary/10 border-secondary/20">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-secondary-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-secondary-foreground">Como funciona a CNV</p>
                <p className="text-xs text-secondary-foreground/80 leading-relaxed">
                  A Comunicação Não-Violenta (CNV) transforma críticas em expressões de sentimentos e necessidades. 
                  Escreva o que te incomoda como desabafo — a IA reescreve em primeira pessoa, sem acusações.
                </p>
              </div>
            </div>
          </ClayCard>

          {/* Input */}
          <ClayCard className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80">O que está te incomodando?</label>
              <textarea
                className="w-full h-36 bg-white/50 rounded-2xl p-4 outline-none border-2 border-transparent focus:border-secondary/50 shadow-inner resize-none text-foreground text-sm leading-relaxed"
                placeholder="Escreva como um desabafo — sem se preocupar com as palavras certas. A IA vai cuidar disso."
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{concern.length} caracteres</p>
            </div>

            {/* Examples */}
            {!concern && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Exemplos:</p>
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setConcern(ex)}
                    className="w-full text-left text-xs text-muted-foreground bg-muted/30 hover:bg-muted/60 px-3 py-2 rounded-xl transition-colors italic"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            )}

            <ClayButton
              variant="secondary"
              className="w-full"
              onClick={handleSend}
              isLoading={medMut.isPending}
              disabled={!concern.trim()}
            >
              Reescrever com Empatia ✨
            </ClayButton>
          </ClayCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5"
        >

          {/* Original */}
          <ClayCard className="bg-muted/30">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Você escreveu</p>
            <p className="text-sm text-foreground/70 italic">"{concern}"</p>
          </ClayCard>

          {/* Reframed */}
          <ClayCard className="bg-secondary/10 border-secondary/30 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-secondary-foreground fill-current" />
              <p className="text-sm font-bold text-secondary-foreground">Mensagem Reformulada (CNV)</p>
            </div>
            <p className="text-base italic text-foreground leading-relaxed">
              "{medMut.data.reframedMessage}"
            </p>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-secondary-foreground border-2 border-secondary/30 rounded-2xl hover:bg-secondary/20 transition-colors"
            >
              {copied
                ? <><CheckCircle2 className="w-4 h-4" /> Copiado!</>
                : <><Copy className="w-4 h-4" /> Copiar mensagem</>}
            </button>
          </ClayCard>

          {/* Tips */}
          {medMut.data.tips && medMut.data.tips.length > 0 && (
            <ClayCard className="space-y-3">
              <p className="text-sm font-bold text-foreground">💡 Dicas de comunicação</p>
              <ul className="space-y-2">
                {medMut.data.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-snug">
                    <span className="text-secondary-foreground mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </ClayCard>
          )}

          <ClayButton
            variant="secondary"
            className="w-full"
            onClick={() => { medMut.reset(); setConcern(""); }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nova Mediação
          </ClayButton>
        </motion.div>
      )}
    </div>
  );
}
