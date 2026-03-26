import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Send, Sparkles, RefreshCw } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_PROMPTS = [
  "Que presente especial posso dar para meu parceiro?",
  "Como posso surpreender meu par esta semana?",
  "Dicas para manter a chama acesa no relacionamento",
  "Como melhorar nossa comunicação?",
];

export default function AIChat() {
  const [input, setInput] = useState("");
  const [conversationKey, setConversationKey] = useState(0);
  const createConvMut = useCreateOpenaiConversation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!createConvMut.data && !createConvMut.isPending && !createConvMut.isSuccess) {
      createConvMut.mutate({ data: { title: "Chat Concierge" } });
    }
  }, [conversationKey]);

  const { messages, sendMessage, isStreaming } = useChatStream(createConvMut.data?.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent | null, override?: string) => {
    e?.preventDefault();
    const text = override ?? input;
    if (!text.trim() || isStreaming) return;
    sendMessage(text);
    setInput("");
  };

  const handleReset = () => {
    setConversationKey(k => k + 1);
    createConvMut.reset();
  };

  return (
    <div className="h-[calc(100dvh-140px)] flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/ai">
          <button className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Assistente Sincronia</h1>
            <p className="text-xs text-green-500 font-semibold">
              {isStreaming ? "Digitando..." : "Online"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors"
            title="Novo chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat area */}
      <ClayCard className="flex-1 flex flex-col p-0 overflow-hidden bg-white/60">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Welcome message */}
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="text-sm leading-relaxed">
                    Olá! 💕 Sou o assistente do Sincronia. Posso ajudar com ideias de presentes, dicas de relacionamento, como lidar com conflitos e muito mais. Como posso ajudar vocês hoje?
                  </p>
                </div>
              </div>

              {/* Quick prompts */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold pl-1">Sugestões:</p>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSend(null, prompt)}
                    disabled={isStreaming || !createConvMut.data}
                    className="w-full text-left text-sm text-primary bg-primary/5 border border-primary/10 px-4 py-2.5 rounded-2xl hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {m.content || (m.role === "assistant" && isStreaming && i === messages.length - 1
                      ? <span className="inline-flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: "0.15s" }}>.</span><span className="animate-bounce" style={{ animationDelay: "0.3s" }}>.</span></span>
                      : "..."
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="shrink-0 p-3 border-t border-border/30 relative flex gap-2"
        >
          <input
            type="text"
            className="flex-1 bg-background rounded-full pl-5 pr-4 py-3 text-sm text-foreground outline-none shadow-inner focus:ring-2 focus:ring-primary/20 border-2 border-transparent focus:border-white"
            placeholder="Pergunte algo..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming || !createConvMut.data}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim() || !createConvMut.data}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </ClayCard>
    </div>
  );
}
