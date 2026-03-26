import { Link } from "wouter";
import { ClayCard } from "@/components/ui/clay-components";
import { Map, MessageCircleHeart, Sparkles, Crown, Lock } from "lucide-react";
import { useGetSubscriptionStatus } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AIHub() {
  const { data: sub } = useGetSubscriptionStatus();
  const isPro = sub?.isPro ?? false;

  const items = [
    {
      href: "/ai/dates",
      icon: Map,
      iconBg: "bg-accent/30",
      iconColor: "text-accent-foreground",
      label: "Ideias de Date",
      desc: "Roteiros personalizados para a sua cidade com base no seu orçamento.",
      free: true,
      freeLimit: "3/mês grátis",
    },
    {
      href: "/ai/mediation",
      icon: MessageCircleHeart,
      iconBg: "bg-secondary/40",
      iconColor: "text-secondary-foreground",
      label: "Mediação de Conflitos",
      desc: "Não sabe como falar? A IA reescreve sua mensagem com Comunicação Não-Violenta.",
      free: false,
    },
    {
      href: "/ai/chat",
      icon: Sparkles,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      label: "Chat Livre com IA",
      desc: "Converse sobre relacionamento, peça conselhos ou ideias de presentes.",
      free: false,
    },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6 pb-4">

      <motion.div variants={fadeUp} className="space-y-1">
        <h1 className="text-3xl text-foreground">IA Concierge</h1>
        <p className="text-muted-foreground font-medium">
          Deixe a inteligência cuidar dos detalhes da sua relação.
        </p>
      </motion.div>

      {!isPro && (
        <motion.div variants={fadeUp}>
          <Link href="/upgrade">
            <div className="bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Upgrade para Pro</p>
                  <p className="text-xs text-amber-700">IA ilimitada por R$19,90/mês</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-500 text-white px-3 py-1 rounded-full">Ver planos</span>
            </div>
          </Link>
        </motion.div>
      )}

      <motion.div variants={stagger} className="grid gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const locked = !item.free && !isPro;

          return (
            <motion.div key={item.href} variants={fadeUp}>
              <Link href={item.href}>
                <ClayCard className={`hover:cursor-pointer group flex items-center gap-5 relative overflow-hidden transition-all hover:scale-[1.01] ${locked ? "opacity-80" : ""}`}>
                  <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-lg font-bold text-foreground">{item.label}</h2>
                      {locked ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                          <Crown className="w-2.5 h-2.5" />Pro
                        </span>
                      ) : item.freeLimit ? (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {item.freeLimit}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Grátis</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  {locked && (
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </ClayCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

    </motion.div>
  );
}
