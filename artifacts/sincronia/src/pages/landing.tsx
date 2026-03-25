import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Heart, Sparkles, Brain, Calendar, MessageCircleHeart,
  BarChart3, Bell, Shield, Smartphone, ChevronRight,
  Star, Check, Zap, Users, TrendingUp, Lock
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#2D1B33] overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-[#2D1B33]">Sincronia</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B4C7A]">
            <a href="#features" className="hover:text-pink-500 transition-colors">Funcionalidades</a>
            <a href="#how" className="hover:text-pink-500 transition-colors">Como funciona</a>
            <a href="#pricing" className="hover:text-pink-500 transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/login")}
              className="text-sm font-medium text-[#6B4C7A] hover:text-pink-500 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => setLocation("/register")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:scale-105 transition-all"
            >
              Começar grátis
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-rose-200/30 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-pink-200 rounded-full px-4 py-2 text-sm font-medium text-pink-600 mb-8 shadow-sm">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              O app que fortalece relacionamentos
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Seu relacionamento
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                merece cuidado
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-[#6B4C7A] max-w-2xl mx-auto mb-10 leading-relaxed">
              Sincronia é o assistente de relacionamento com IA para casais brasileiros. Alinhe humores, planeje dates perfeitos e resolva conflitos com amor — tudo em um só lugar.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setLocation("/register")}
                className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl shadow-pink-300 hover:shadow-pink-400 hover:scale-105 transition-all flex items-center gap-2"
              >
                Começar grátis agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setLocation("/login")}
                className="text-[#6B4C7A] font-semibold text-lg px-8 py-4 rounded-full border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                Já tenho conta
              </button>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-sm text-[#9B7BAD]">
              Grátis para sempre • Sem cartão de crédito • PIX disponível
            </motion.p>
          </motion.div>
        </div>

        {/* MOCK PHONES */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-5xl mx-auto mt-20 flex justify-center gap-6 px-4"
        >
          <div className="w-52 md:w-64 bg-white rounded-[2.5rem] shadow-2xl shadow-pink-200 border border-pink-100 overflow-hidden transform -rotate-3 hover:-rotate-1 transition-transform">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 h-32 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl font-black">85</div>
                <div className="text-sm opacity-80">Saúde do Casal</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 bg-pink-50 rounded-2xl p-3">
                <span className="text-2xl">😊</span>
                <div>
                  <div className="text-xs font-bold text-[#2D1B33]">Felipe</div>
                  <div className="text-xs text-pink-500">Animado</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3">
                <span className="text-2xl">💕</span>
                <div>
                  <div className="text-xs font-bold text-[#2D1B33]">Lari</div>
                  <div className="text-xs text-purple-500">Romântica</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-3 text-xs text-center font-medium text-[#6B4C7A]">
                ✨ A noite promete!
              </div>
            </div>
          </div>

          <div className="w-52 md:w-64 bg-white rounded-[2.5rem] shadow-2xl shadow-purple-200 border border-purple-100 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform mt-8">
            <div className="p-5 space-y-3">
              <div className="text-sm font-bold text-[#2D1B33] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500" />
                Sugestão IA
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
                <div className="font-bold text-sm text-[#2D1B33] mb-1">Pôr do sol em Santos 🌅</div>
                <div className="text-xs text-[#9B7BAD] mb-3">Romantismo + Gratuito + Baixo esforço</div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-pink-500 text-white text-xs font-bold py-2 rounded-xl">Aceitar</button>
                  <button className="flex-1 bg-white border border-pink-200 text-pink-500 text-xs font-bold py-2 rounded-xl">Gerar outra</button>
                </div>
              </div>
              <div className="flex justify-between text-center">
                <div className="bg-orange-50 rounded-xl p-2 flex-1 mx-1">
                  <div className="text-lg">🔥</div>
                  <div className="text-xs font-bold text-orange-500">12 dias</div>
                  <div className="text-[10px] text-gray-400">streak</div>
                </div>
                <div className="bg-green-50 rounded-xl p-2 flex-1 mx-1">
                  <div className="text-lg">💬</div>
                  <div className="text-xs font-bold text-green-500">Alta</div>
                  <div className="text-[10px] text-gray-400">comm.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-12 bg-white border-y border-pink-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-[#9B7BAD] mb-6">Amado por casais em todo o Brasil 💕</p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { n: "10k+", label: "Casais" },
              { n: "4.9★", label: "Avaliação" },
              { n: "98%", label: "Satisfação" },
              { n: "50k+", label: "Dates planejados" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">{n}</div>
                <div className="text-sm text-[#9B7BAD]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-pink-200 rounded-full px-4 py-2 text-sm font-medium text-pink-600 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Tudo que seu relacionamento precisa
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-4">
              Funcionalidades <span className="text-pink-500">poderosas</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#6B4C7A] max-w-2xl mx-auto">
              Desde o check-in diário de humor até a mediação de conflitos por IA — temos tudo o que um casal moderno precisa.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Heart className="w-6 h-6" />,
                color: "from-pink-400 to-rose-500",
                bg: "bg-pink-50",
                title: "Mood Tracker em Casal",
                desc: "Check-in diário com 10 humores visuais. Os humores do parceiro só são revelados quando ambos fazem o check-in — sem efeito manada!",
                badge: "Grátis",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                color: "from-purple-400 to-violet-500",
                bg: "bg-purple-50",
                title: "Relationship Health Score",
                desc: "Score de 0-100 calculado em tempo real com base na consistência de humor, streak, comunicação e tempo de qualidade.",
                badge: "Grátis",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                color: "from-orange-400 to-amber-500",
                bg: "bg-orange-50",
                title: "Gerador de Dates com IA",
                desc: "3 sugestões de dates personalizadas para a sua cidade no Brasil, com base no orçamento e preferências do casal.",
                badge: "Pro ilimitado",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                color: "from-teal-400 to-cyan-500",
                bg: "bg-teal-50",
                title: "Mediação de Conflitos",
                desc: "Conte para a IA o que está te incomodando e ela reescreve sua mensagem em linguagem não-violenta, em primeira pessoa.",
                badge: "Pro",
              },
              {
                icon: <MessageCircleHeart className="w-6 h-6" />,
                color: "from-blue-400 to-indigo-500",
                bg: "bg-blue-50",
                title: "AI Concierge Chat",
                desc: "Converse com a IA sobre qualquer aspecto do relacionamento. Contexto salvo, histórico completo, respostas em streaming.",
                badge: "Pro",
              },
              {
                icon: <Users className="w-6 h-6" />,
                color: "from-pink-400 to-purple-500",
                bg: "bg-pink-50",
                title: "Perfil do Casal",
                desc: "Pareamento via link de convite com animação de 'Match Realizado!'. Aniversário, tempo de relacionamento calculado automaticamente.",
                badge: "Grátis",
              },
              {
                icon: <Bell className="w-6 h-6" />,
                color: "from-green-400 to-emerald-500",
                bg: "bg-green-50",
                title: "Nudges de Carinho",
                desc: "Notificações inteligentes lembrando de demonstrar carinho com base no que seu parceiro(a) gosta. Conexão no dia a dia.",
                badge: "Pro",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                color: "from-violet-400 to-purple-500",
                bg: "bg-violet-50",
                title: "Timeline Emocional",
                desc: "Histórico de humores dos últimos 30 dias com gráficos de evolução. Identifique padrões e celebre conquistas juntos.",
                badge: "Pro",
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                color: "from-rose-400 to-pink-500",
                bg: "bg-rose-50",
                title: "PWA — App Nativo",
                desc: "Adicione à tela inicial do celular. Funciona como app nativo sem precisar de AppStore ou PlayStore. Offline-friendly.",
                badge: "Grátis",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="bg-white rounded-3xl p-6 shadow-lg shadow-pink-100/50 border border-pink-100 hover:shadow-xl hover:shadow-pink-200/50 hover:-translate-y-1 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-[#2D1B33] text-lg leading-tight">{f.title}</h3>
                  <span className={`ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${f.badge === "Grátis" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>
                    {f.badge}
                  </span>
                </div>
                <p className="text-sm text-[#6B4C7A] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-4">
              Como <span className="text-purple-500">funciona</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#6B4C7A]">
              Comece a usar em menos de 2 minutos
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            {[
              {
                step: "01",
                icon: "📱",
                title: "Cadastre-se e convide seu parceiro(a)",
                desc: "Crie sua conta em segundos. Gere um link de convite único e válido por 24h. Quando seu parceiro aceitar, o 'Match Realizado!' celebra a conexão!",
              },
              {
                step: "02",
                icon: "😊",
                title: "Faça o check-in de humor diário",
                desc: "Toda manhã, escolha como você está se sentindo entre 10 humores visuais. O humor do parceiro só aparece depois que ambos checam — sem influenciar um ao outro.",
              },
              {
                step: "03",
                icon: "✨",
                title: "Receba insights e sugestões personalizadas",
                desc: "A IA analisa os humores do casal e sugere o melhor date para o clima do dia. Receba sugestões localizadas para a sua cidade com base no seu orçamento.",
              },
              {
                step: "04",
                icon: "💬",
                title: "Resolva conflitos com apoio da IA",
                desc: "Quando precisar conversar sobre algo difícil, a IA te ajuda a estruturar a fala em linguagem não-violenta, em primeira pessoa. Comunicação mais saudável.",
              },
            ].map((s) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                className="bg-white rounded-3xl p-6 shadow-lg shadow-pink-100/50 border border-pink-100 flex gap-6 items-start"
              >
                <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-pink-400 mb-1">PASSO {s.step}</div>
                  <h3 className="font-bold text-xl text-[#2D1B33] mb-2">{s.title}</h3>
                  <p className="text-[#6B4C7A] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-4">
              O que casais <span className="text-pink-500">dizem</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                quote: "O Sincronia revolucionou nossa comunicação. A mediação de conflitos da IA nos ajudou a conversar sobre coisas difíceis sem brigar. Recomendo demais!",
                name: "Ana & Pedro",
                location: "São Paulo, SP",
                stars: 5,
              },
              {
                quote: "As sugestões de date são incríveis! A IA sugeriu um pôr do sol em Santos que a gente nunca teria pensado. Virou nosso programa favorito.",
                name: "Camila & Rafael",
                location: "Santos, SP",
                stars: 5,
              },
              {
                quote: "Usar o mood tracker todo dia virou ritual. Quando os dois estamos estressados, a IA já avisa: 'hora de cuidar um do outro'. Faz toda a diferença.",
                name: "Juliana & Marcos",
                location: "Curitiba, PR",
                stars: 5,
              },
            ].map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 border border-pink-100"
              >
                <div className="flex text-yellow-400 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[#2D1B33] italic mb-6 leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-[#2D1B33]">{t.name}</div>
                  <div className="text-sm text-[#9B7BAD]">{t.location}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-4">
              Planos <span className="text-pink-500">simples</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#6B4C7A]">
              Comece grátis. Evolua quando quiser. Cancele quando precisar.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {/* FREE */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 shadow-lg border border-pink-100">
              <div className="text-sm font-bold text-[#9B7BAD] mb-2">GRATUITO</div>
              <div className="text-5xl font-black text-[#2D1B33] mb-1">R$0</div>
              <div className="text-sm text-[#9B7BAD] mb-8">Para sempre grátis</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Mood tracker diário",
                  "Dashboard do casal",
                  "3 sugestões de date/mês",
                  "Relationship Health Score",
                  "Connection streak",
                  "Perfil do casal",
                  "Instalação como PWA",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#2D1B33]">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/register")}
                className="w-full py-3 rounded-2xl border-2 border-pink-200 text-pink-600 font-bold hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                Começar grátis
              </button>
            </motion.div>

            {/* PRO */}
            <motion.div variants={fadeUp} className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl shadow-pink-300 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                🔥 MAIS POPULAR
              </div>
              <div className="text-sm font-bold text-pink-200 mb-2">PRO</div>
              <div className="text-5xl font-black mb-1">R$19,90</div>
              <div className="text-sm text-pink-200 mb-8">por mês · Pague via PIX</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Tudo do plano Gratuito",
                  "Sugestões de date ilimitadas",
                  "Mediação de conflitos por IA",
                  "AI Concierge chat ilimitado",
                  "Timeline emocional avançada",
                  "Nudges de carinho personalizados",
                  "Dashboard com análise profunda",
                  "Suporte prioritário",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <Check className="w-4 h-4 text-yellow-300 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/register")}
                className="w-full py-3 rounded-2xl bg-white text-purple-600 font-black text-lg hover:bg-pink-50 transition-all shadow-xl"
              >
                Assinar Pro — R$19,90/mês
              </button>
              <p className="text-xs text-pink-200 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Pagamento seguro via PIX
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-5 py-2.5 text-sm font-medium text-green-600 shadow-sm">
              <Shield className="w-4 h-4" />
              Plano anual com 2 meses grátis — R$199,90/ano
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="max-w-2xl mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-6xl mb-6">💞</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-6">
              Seu relacionamento merece o melhor
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-pink-100 mb-10">
              Junte-se a milhares de casais que já usam Sincronia para se conectar mais, brigar menos e amar com mais intenção.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setLocation("/register")}
                className="group bg-white text-purple-600 font-black text-lg px-10 py-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
              >
                Começar grátis
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500 group-hover:scale-125 transition-transform" />
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex justify-center gap-8 mt-10 text-sm text-pink-200">
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Sem cartão</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> 100% seguro</span>
              <span className="flex items-center gap-1"><Smartphone className="w-4 h-4" /> Funciona como app</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A0F22] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">Sincronia</span>
            </div>
            <div className="flex gap-6 text-sm text-purple-300">
              <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
              <a href="#how" className="hover:text-white transition-colors">Como funciona</a>
              <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
              <button onClick={() => setLocation("/login")} className="hover:text-white transition-colors">Entrar</button>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-purple-400">
            <p>© 2026 Sincronia · Feito com 💕 para casais brasileiros · LGPD Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
