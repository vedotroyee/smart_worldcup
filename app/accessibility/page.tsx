"use client";

import { useEffect, useState } from "react";
import Heatmap from "@/components/Heatmap";
import Skeleton from "@/components/Skeleton";
import type { CrowdSnapshot } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function AccessibilityPage() {
  const [data, setData] = useState<CrowdSnapshot | null>(null);
  const [needs, setNeeds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crowd")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const accessibleZones = data?.zones.filter((z) => z.accessible) ?? [];

  function toggle(need: string) {
    setNeeds((n) => (n.includes(need) ? n.filter((x) => x !== need) : [...n, need]));
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Map Panel */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
            ACCESSIBLE ROUTE MAP
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Steward posts, safety assembly spaces, and facilities marked wheelchair-accessible are highlighted.
        </p>

        <AnimatePresence mode="wait">
          {loading ? (
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Heatmap zones={accessibleZones} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Settings & Help Panel */}
      <motion.div variants={itemVariants} className="glass space-y-5 p-5 border-t border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-3">
              YOUR ACCESSIBILITY NEEDS
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Wheelchair", "Low vision", "Hearing", "Sensory-friendly", "Cognitive support"].map((n) => {
                const isSelected = needs.includes(n);
                return (
                  <motion.button
                    key={n}
                    onClick={() => toggle(n)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors duration-200 ${
                      isSelected
                        ? "border-accent bg-accent/20 text-accent shadow-[0_2px_10px_-2px_rgba(14,165,233,0.3)]"
                        : "border-white/5 bg-white/[0.01] text-slate-400 hover:bg-white/5 hover:text-slate-300"
                    }`}
                  >
                    {isSelected ? `✓ ${n}` : n}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.005] p-4 text-xs text-slate-300 space-y-3">
            <p className="font-bold font-display tracking-wide text-slate-200 uppercase">AVAILABLE ASSISTANCE</p>
            <ul className="list-inside list-disc space-y-2 text-slate-400 leading-relaxed">
              <li>Live sign-language video interpreter connects a volunteer video session.</li>
              <li>Voice commands &amp; screen-reader-friendly layouts throughout the app.</li>
              <li>Speech-to-text input, and automated text-to-speech for all concierge chat.</li>
              <li>Personalized routing avoiding stairs, long lines, and high-density spots.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-accent2/20 border border-accent2/35 px-4 py-3 text-xs font-bold tracking-wider uppercase text-accent2 hover:bg-accent2/30 hover:border-accent2/45 transition-colors font-display cursor-pointer shadow-[0_4px_15px_-4px_rgba(99,102,241,0.2)]"
          >
            Request sign-language interpreter
          </motion.button>
          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            Wired to a WebRTC session routed to the nearest available interpreter/volunteer.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
