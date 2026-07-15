"use client";

import * as React from "react";
import { Sparkles, X, Send, Loader2, MessageCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

const QUICK_QUESTIONS = [
  "Hangi pizza acılı?",
  "Teslimat süresi ne kadar?",
  "1 alana 1 bedava nasıl?",
  "Vejetaryen pizza var mı?",
  "Minimum sipariş?",
];

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Merhaba! Ben Demos Pizza AI asistanı. Sipariş, menü, teslimat — her konuda yardımcı olabilirim. Sana nasıl yardımcı olabilirim?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Üzgünüm, şu an yanıt veremiyorum. Lütfen sonra tekrar dene." }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Bağlantı hatası. Lütfen tekrar dene." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow btn-premium flex items-center justify-center"
        aria-label="AI Asistan"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-pink pulse-ring" />
        )}
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-40 w-[calc(100vw-2rem)] max-w-md max-h-[70vh] flex flex-col bg-paper rounded-2xl shadow-premium-lg border border-ink/10 overflow-hidden">
          {/* Header */}
          <div className="bg-ink p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                Demos AI Asistan
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="text-[11px] text-white/60">Genellikle anında yanıt verir</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white p-1"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3 bg-mist/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-pink text-white rounded-br-sm"
                      : "bg-white text-ink rounded-bl-sm border border-ink/8"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-ink/8">
                  <Loader2 className="h-4 w-4 animate-spin text-pink" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-mist/30">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-ink/10 text-ink/70 hover:bg-pink hover:text-white hover:border-pink transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-ink/10 bg-paper">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Bir soru sor..."
                disabled={loading}
                maxLength={300}
                className="flex-1 h-10"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                size="icon"
                className="bg-pink hover:bg-pink-hover text-white h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
