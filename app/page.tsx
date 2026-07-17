"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const MODULES = [
  {
    href: "/concierge",
    title: "AI Stadium Concierge",
    desc: "Multilingual RAG chat: navigation, FAQs, schedules, ticket help, emergency guidance.",
    icon: "💬",
  },
  {
    href: "/crowd",
    title: "Smart Crowd Intelligence",
    desc: "Live heatmap, congestion prediction, queue estimates, overcrowding alerts.",
    icon: "📊",
  },
  {
    href: "/transport",
    title: "AI Transportation Planner",
    desc: "Transit, parking, shuttles, rideshare, walking routes, live traffic.",
    icon: "🚇",
  },
  {
    href: "/accessibility",
    title: "Accessibility Assistant",
    desc: "Wheelchair routing, sign-language/video help, voice & speech interaction.",
    icon: "♿",
  },
  {
    href: "/sustainability",
    title: "Sustainability Engine",
    desc: "Green transport nudges, reuse stations, carbon tracking, green rewards.",
    icon: "♻️",
  },
  {
    href: "/matchday",
    title: "AI Match Experience",
    desc: "Food, merch, activities, shortest queues, personalized itinerary.",
    icon: "⚽",
  },
  {
    href: "/admin/dashboard",
    title: "Operations Command Dashboard",
    desc: "Heatmaps, incident alerts, volunteer deployment, staffing insights.",
    icon: "🖥️",
    restricted: true,
  },
  {
    href: "/admin/emergency",
    title: "Emergency Decision Support",
    desc: "Abnormal-situation detection, AI evacuation plans, multilingual alerts.",
    icon: "🚨",
    restricted: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <section className="glass px-6 py-10 md:px-10 md:py-14 border-t border-white/10 relative overflow-hidden">
        {/* Pitch light beam overlay */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <span className="signage-label text-[11px] text-accent/80 tracking-widest">
          FIFA WORLD CUP 2026 &middot; PROTOTYPE
        </span>
        <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight md:text-5xl font-display text-white">
          One GenAI platform for the whole stadium — fans, volunteers, security, transport, and ops.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-sm leading-relaxed">
          RAG-grounded LLM reasoning over live crowd, weather, transport and IoT data. Switch roles
          in the top bar (Fan / Volunteer / Admin) to explore different permissions and dashboard surfaces.
        </p>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {MODULES.map((m) => (
          <motion.div
            key={m.href}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link
              href={m.href}
              className="glass glass-hover block p-6 h-full flex flex-col justify-between relative group border-t border-white/5"
            >
              {/* Highlight top border color shift on hover */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-accent/20 transition-all duration-300" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl mb-3 block">{m.icon}</span>
                  {m.restricted && (
                    <span className="text-[9px] signage-label text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      🔒 Ops Only
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-200 group-hover:text-accent transition-colors duration-200 font-display">
                  {m.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-accent transition-colors duration-200 font-display">
                <span>EXPLORE MODULE</span>
                <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
