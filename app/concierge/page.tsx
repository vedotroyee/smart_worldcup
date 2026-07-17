"use client";

import ChatWidget from "@/components/ChatWidget";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function ConciergePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <ChatWidget />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="glass p-6 border-t border-white/5 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        
        <div>
          <h3 className="font-bold text-slate-200 font-display tracking-wider text-sm uppercase mb-4">
            HOW THIS WORKS (RAG)
          </h3>
          <ol className="space-y-4 text-xs text-slate-400 leading-relaxed">
            <li className="flex gap-2.5">
              <span className="text-accent font-bold font-display">01.</span>
              <p>Your question is embedded and matched against the stadium knowledge base (policies, FAQs, gate info).</p>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold font-display">02.</span>
              <p>Live context - crowd levels, weather, your zone - is pulled in alongside the matched documents.</p>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold font-display">03.</span>
              <p>The LLM answers grounded only in that retrieved context, and cites its sources.</p>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold font-display">04.</span>
              <p>Replies are read aloud (text-to-speech) and you can speak instead of typing.</p>
            </li>
          </ol>
        </div>

        <div className="mt-6 border-t border-white/5 pt-4">
          <span className="signage-label text-[9px] text-slate-500 block mb-1">PROTOTYPE GROUNDING</span>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Swap the mock retrieval in <code className="text-slate-400 font-mono">lib/rag.ts</code> for Pinecone/Weaviate/Chroma and the mock LLM in
            <code className="text-slate-400 font-mono"> lib/ai.ts</code> for Gemini/GPT-5 without changing any UI page code.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
