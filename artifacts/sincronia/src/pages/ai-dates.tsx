import { useState } from "react";
import { useGenerateDateSuggestions } from "@workspace/api-client-react";
import { ClayCard, ClayButton, ClayInput } from "@/components/ui/clay-components";
import { ArrowLeft, MapPin, DollarSign, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function AIDates() {
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState<"free" | "low" | "medium" | "high">("low");
  const generateMut = useGenerateDateSuggestions();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMut.mutate({ data: { city, budget, count: 3 } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ai" className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl text-foreground">Gerador de Dates</h1>
      </div>

      {!generateMut.data ? (
        <ClayCard>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 pl-2">Onde vocês estão?</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <ClayInput required value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: São Paulo, SP" className="pl-12" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 pl-2">Orçamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "free", label: "De graça", icon: "🍃" },
                  { id: "low", label: "Baixo", icon: "☕" },
                  { id: "medium", label: "Médio", icon: "🍷" },
                  { id: "high", label: "Alto", icon: "✨" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBudget(opt.id as any)}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${budget === opt.id ? "bg-primary/10 border-primary text-primary" : "bg-white border-transparent text-muted-foreground shadow-sm hover:scale-105"}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <ClayButton type="submit" className="w-full" isLoading={generateMut.isPending}>
              Gerar Ideias Mágicas
            </ClayButton>
          </form>
        </ClayCard>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-display font-semibold text-lg text-foreground">Resultados em {city}</h2>
            <button onClick={() => generateMut.reset()} className="text-primary text-sm font-bold">Refazer</button>
          </div>
          
          {generateMut.data.suggestions.map((sug, i) => (
            <ClayCard key={i} className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-primary">{sug.title}</h3>
                <span className="text-xs bg-white px-2 py-1 rounded-full font-bold uppercase text-muted-foreground shadow-sm">{sug.type}</span>
              </div>
              <p className="text-foreground/80">{sug.description}</p>
              
              <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground pt-2">
                {sug.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {sug.location}</span>}
                {sug.estimatedCost && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4"/> {sug.estimatedCost}</span>}
              </div>
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  );
}
