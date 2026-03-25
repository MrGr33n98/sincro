import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { ClayCard } from "@/components/ui/clay-components";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";

export default function AIChat() {
  const [input, setInput] = useState("");
  const createConvMut = useCreateOpenaiConversation();
  
  // Create a conversation immediately if we don't have one
  useEffect(() => {
    if (!createConvMut.data && !createConvMut.isPending && !createConvMut.isSuccess) {
      createConvMut.mutate({ data: { title: "Chat Concierge" } });
    }
  }, [createConvMut]);

  const { messages, sendMessage, isStreaming } = useChatStream(createConvMut.data?.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/ai" className="p-2 bg-white rounded-full shadow-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl text-foreground">Assistente Sincronia</h1>
      </div>

      <ClayCard className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-white/60">
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground px-8">
              Estou aqui para ajudar com ideias de presentes, tirar dúvidas sobre relacionamento e dar conselhos!
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm' 
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content || "..."}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSend} className="shrink-0 pt-2 relative">
          <input
            type="text"
            className="w-full bg-background rounded-full pl-5 pr-12 py-4 text-sm text-foreground outline-none shadow-inner focus:ring-2 focus:ring-primary/20 border-2 border-transparent focus:border-white"
            placeholder="Pergunte algo..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming || !createConvMut.data}
          />
          <button 
            type="submit" 
            disabled={isStreaming || !input.trim() || !createConvMut.data}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </ClayCard>
    </div>
  );
}
