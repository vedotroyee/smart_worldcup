"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { newMessage } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
];

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    newMessage(
      "assistant",
      "Hi! I'm your Stadium Concierge. Ask me about gates, tickets, food, accessibility, or emergencies - in any of 100+ languages."
    ),
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = newMessage("user", text);
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await res.json();
      setMessages((m) => [...m, newMessage("assistant", data.reply, data.sources)]);
      speak(data.reply);
    } catch {
      setMessages((m) => [
        ...m,
        newMessage("assistant", "Sorry, I couldn't reach the concierge service. Please try again."),
      ]);
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    window.speechSynthesis.speak(utter);
  }

  function toggleVoiceInput() {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert("Voice input isn't supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      send(transcript);
    };
    recognition.start();
  }

  return (
    <div className="glass flex h-[560px] flex-col p-5 border-t border-white/10 relative overflow-hidden">
      {/* Glow highlight in header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="mb-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turf opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-turf"></span>
          </span>
          <h3 className="font-semibold font-display tracking-wide text-sm text-slate-200">
            AI STADIUM CONCIERGE
          </h3>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-white/5 bg-panel/85 px-2.5 py-1 text-xs text-slate-300 outline-none hover:border-white/10 transition-colors cursor-pointer"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Messages viewport */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pr-1 select-none scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-accent2/25 border border-accent2/35 text-slate-100 shadow-[0_4px_15px_-4px_rgba(99,102,241,0.2)]"
                    : "bg-white/5 border border-white/5 text-slate-200"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-1.5 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-400 font-display tracking-wider">
                      SOURCES:
                    </span>
                    {m.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "1s" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms", animationDuration: "1s" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms", animationDuration: "1s" }}
                />
              </div>
              <span className="text-[10px] signage-label text-slate-500">AI AGENT RESPONDING</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex items-center gap-2 z-10"
      >
        <motion.button
          type="button"
          onClick={toggleVoiceInput}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative rounded-xl border border-white/5 px-3.5 py-2.5 text-sm transition-colors ${
            listening ? "bg-danger/20 text-danger border-danger/30" : "bg-white/5 hover:bg-white/10"
          }`}
          title="Voice input"
        >
          {listening && (
            <span className="absolute inset-0 rounded-xl bg-danger/20 animate-ping pointer-events-none" />
          )}
          🎤
        </motion.button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about gates, tickets, food, accessibility..."
          className="flex-1 rounded-xl border border-white/5 bg-panel/75 px-4 py-2.5 text-sm outline-none focus:border-accent/40 focus:bg-panel/90 transition-all text-slate-200 placeholder:text-slate-500"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-xl bg-accent/20 border border-accent/30 px-5 py-2.5 text-sm font-semibold tracking-wide text-accent hover:bg-accent/30 hover:border-accent/40 transition-colors"
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
