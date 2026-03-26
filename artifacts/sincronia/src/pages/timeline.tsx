import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { useGetMoods } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const MOOD_SCORE: Record<string, number> = {
  happy: 10, romantic: 9, calm: 8, grateful: 8, excited: 9,
  focused: 7, playful: 8, tired: 4, stressed: 3, sad: 2,
};

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", romantic: "💕", calm: "😌", grateful: "🙏", excited: "🤩",
  focused: "🎯", playful: "😄", tired: "😴", stressed: "😤", sad: "😢",
};

const PERIOD_OPTIONS = [
  { label: "7 dias", days: 7 },
  { label: "14 dias", days: 14 },
  { label: "30 dias", days: 30 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
          <span>{p.name}:</span>
          <span className="font-bold">{p.value}/10</span>
        </p>
      ))}
    </div>
  );
};

export default function Timeline() {
  const { user } = useAuth();
  const [days, setDays] = useState(14);
  const { data: rawMoods = [], isLoading } = useGetMoods({ days });

  const myName = user?.name?.split(" ")[0] ?? "Você";
  const partnerName = rawMoods.find((m: any) => m.userId !== user?.id)?.userName?.split(" ")[0] ?? "Parceiro(a)";

  const dateMap: Record<string, { me: number | null; partner: number | null }> = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, "dd/MM");
    dateMap[key] = { me: null, partner: null };
  }

  (rawMoods as any[]).forEach((m: any) => {
    const key = format(new Date(m.createdAt), "dd/MM");
    if (!dateMap[key]) return;
    const score = MOOD_SCORE[m.mood] ?? 5;
    if (m.userId === user?.id) {
      dateMap[key].me = score;
    } else {
      dateMap[key].partner = score;
    }
  });

  const chartData = Object.entries(dateMap).map(([date, v]) => ({
    date,
    [myName]: v.me,
    [partnerName]: v.partner,
  }));

  const avgMe = (rawMoods as any[]).filter((m: any) => m.userId === user?.id).reduce((s: number, m: any) => s + (MOOD_SCORE[m.mood] ?? 5), 0) / Math.max(1, (rawMoods as any[]).filter((m: any) => m.userId === user?.id).length);
  const avgPartner = (rawMoods as any[]).filter((m: any) => m.userId !== user?.id).reduce((s: number, m: any) => s + (MOOD_SCORE[m.mood] ?? 5), 0) / Math.max(1, (rawMoods as any[]).filter((m: any) => m.userId !== user?.id).length);

  const moodFreq: Record<string, number> = {};
  (rawMoods as any[]).filter((m: any) => m.userId === user?.id).forEach((m: any) => {
    moodFreq[m.mood] = (moodFreq[m.mood] ?? 0) + 1;
  });
  const topMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Link href="/app">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Timeline Emocional</h1>
          <p className="text-xs text-muted-foreground">Histórico de humores do casal</p>
        </div>
      </div>

      <div className="flex gap-2">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.days}
            onClick={() => setDays(opt.days)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${days === opt.days ? "bg-primary text-white shadow-md" : "bg-white text-muted-foreground"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: `Média ${myName}`, value: avgMe ? avgMe.toFixed(1) : "—", emoji: "😊", color: "text-primary" },
          { label: `Média ${partnerName}`, value: avgPartner ? avgPartner.toFixed(1) : "—", emoji: "💜", color: "text-purple-500" },
          { label: "Humor top", value: topMood ? MOOD_EMOJI[topMood[0]] : "—", emoji: "", color: "text-foreground" },
        ].map((stat, i) => (
          <ClayCard key={i} className="p-3 text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </ClayCard>
        ))}
      </div>

      <ClayCard className="p-4">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Humor ao longo do tempo
        </h2>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="meGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e879f9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e879f9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="partnerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ff" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={days > 14 ? 4 : 1} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey={myName} stroke="#e879f9" strokeWidth={2.5} fill="url(#meGrad)" dot={false} connectNulls />
              <Area type="monotone" dataKey={partnerName} stroke="#a855f7" strokeWidth={2.5} fill="url(#partnerGrad)" dot={false} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ClayCard>

      <ClayCard className="p-4">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Distribuição dos humores
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(moodFreq).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
            <span key={mood} className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full text-sm">
              <span>{MOOD_EMOJI[mood]}</span>
              <span className="font-semibold text-primary capitalize">{mood}</span>
              <span className="text-muted-foreground">×{count}</span>
            </span>
          ))}
        </div>
        {Object.keys(moodFreq).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro neste período</p>
        )}
      </ClayCard>
    </div>
  );
}
