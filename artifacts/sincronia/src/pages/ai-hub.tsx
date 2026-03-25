import { Link } from "wouter";
import { ClayCard } from "@/components/ui/clay-components";
import { Map, MessageCircleHeart, Sparkles } from "lucide-react";

export default function AIHub() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl text-foreground">IA Concierge</h1>
        <p className="text-muted-foreground font-medium">Deixe a inteligência cuidar dos detalhes da sua relação.</p>
      </div>

      <div className="grid gap-5">
        <Link href="/ai/dates">
          <ClayCard className="hover:cursor-pointer group flex items-center gap-5">
            <div className="w-14 h-14 bg-accent/30 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Map className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-xl">Ideias de Date</h2>
              <p className="text-sm text-muted-foreground mt-1">Roteiros personalizados na sua cidade de acordo com seu budget.</p>
            </div>
          </ClayCard>
        </Link>

        <Link href="/ai/mediation">
          <ClayCard className="hover:cursor-pointer group flex items-center gap-5">
            <div className="w-14 h-14 bg-secondary/40 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircleHeart className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl">Mediação de Conflitos</h2>
              <p className="text-sm text-muted-foreground mt-1">Não sabe como falar? A IA te ajuda a expressar sentimentos com empatia.</p>
            </div>
          </ClayCard>
        </Link>

        <Link href="/ai/chat">
          <ClayCard className="hover:cursor-pointer group flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl">Chat Livre</h2>
              <p className="text-sm text-muted-foreground mt-1">Conselhos diários e dicas de presentes com nosso assistente virtual.</p>
            </div>
          </ClayCard>
        </Link>
      </div>
    </div>
  );
}
