import { useState, useRef, useEffect } from "react";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export function useChatStream(conversationId: number | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendMessage = async (content: string) => {
    if (!conversationId) return;
    
    const token = localStorage.getItem("sincronia_token");
    setIsStreaming(true);
    setError(null);
    
    // Add user message optimistically
    setMessages(prev => [...prev, { role: "user", content }]);
    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error("Falha ao enviar mensagem");
      if (!res.body) throw new Error("Sem resposta do servidor");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.trim().startsWith("data: "));
        
        for (const line of lines) {
          const dataStr = line.replace(/^data: /, "").trim();
          if (!dataStr || dataStr === "[DONE]") continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.done) break;
            if (data.content) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  last.content += data.content;
                }
                return updated;
              });
            }
          } catch (e) {
            console.error("SSE parse error", e, dataStr);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, setMessages, sendMessage, isStreaming, error };
}
