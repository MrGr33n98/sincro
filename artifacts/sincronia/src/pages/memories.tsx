import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Trash2, Camera, X } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EMOJIS = ["💕", "🌅", "🎉", "🍕", "✈️", "🌊", "🏠", "🎂", "💃", "🎸", "🌸", "⛄", "🎄", "🎆", "🐾", "☕"];

interface Memory {
  id: number;
  title: string;
  description: string | null;
  emoji: string | null;
  memoryDate: string;
  userId: number;
  userName: string;
  createdAt: string;
}

export default function Memories() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("💕");
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().slice(0, 10));
  const qc = useQueryClient();

  const { data: memories = [], isLoading } = useQuery<Memory[]>({
    queryKey: ["memories"],
    queryFn: () => customFetch("/api/memories").then(r => r.json()),
  });

  const addMut = useMutation({
    mutationFn: () =>
      customFetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, emoji, memoryDate }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      customFetch("/api/achievements/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "memory_first" }) });
      toast.success("Memória salva! 📸");
      setShowForm(false);
      setTitle(""); setDescription(""); setEmoji("💕");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => customFetch(`/api/memories/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memories"] }); toast.success("Memória removida"); },
  });

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Link href="/couple">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Mural de Memórias</h1>
          <p className="text-xs text-muted-foreground">A história de vocês dois</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ClayCard className="p-5 space-y-4 border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Nova Memória</p>
                <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Escolha um emoji:</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${emoji === e ? "bg-primary/20 scale-110" : "hover:bg-muted"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Título *</label>
                <input
                  className="w-full mt-1 bg-muted/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Primeira viagem juntos"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Data da memória</label>
                <input
                  type="date"
                  className="w-full mt-1 bg-muted/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={memoryDate}
                  onChange={e => setMemoryDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Descrição (opcional)</label>
                <textarea
                  className="w-full mt-1 bg-muted/30 rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  placeholder="Conte um pouco sobre essa memória..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={300}
                />
              </div>

              <button
                onClick={() => addMut.mutate()}
                disabled={!title.trim() || addMut.isPending}
                className="w-full bg-primary text-white py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
              >
                Salvar Memória
              </button>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : memories.length === 0 ? (
        <ClayCard className="p-10 text-center">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">Nenhuma memória ainda</p>
          <p className="text-sm text-muted-foreground">Registrem os momentos especiais da história de vocês!</p>
        </ClayCard>
      ) : (
        <div className="space-y-3">
          {memories.map((memory, i) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ClayCard className="p-4 flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  {memory.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{memory.title}</p>
                  {memory.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{memory.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-primary">
                      {format(new Date(memory.memoryDate + "T12:00:00"), "dd 'de' MMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-xs text-muted-foreground">• por {memory.userName?.split(" ")[0]}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteMut.mutate(memory.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </ClayCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
