"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import AnimatedNumber from "@/components/AnimatedNumber";
import type { SustainabilityStats, TransportOption } from "@/types";
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

const statsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function SustainabilityPage() {
  const [stats, setStats] = useState<SustainabilityStats | null>(null);
  const [greenTransport, setGreenTransport] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sustainability")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setGreenTransport(d.greenTransport);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Green Impact Panel */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turf opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-turf"></span>
          </span>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
            YOUR GREEN IMPACT TODAY
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
              <Skeleton className="h-5 w-1/3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {stats && (
                <motion.div
                  variants={statsContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                >
                  {[
                    { label: "CO₂ saved", value: stats.co2SavedKg, suffix: " kg", precision: 1 },
                    { label: "Bottles reused", value: stats.bottlesReused, suffix: "", precision: 0 },
                    { label: "Green points", value: stats.greenPoints, suffix: "", precision: 0 },
                    { label: "Fan ranking", value: stats.ranking, prefix: "#", suffix: ` / ${stats.totalFans}`, precision: 0 },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      className="rounded-xl border border-white/5 bg-white/[0.005] p-4 text-center transition-colors"
                    >
                      <p className="text-2xl font-extrabold text-turf font-display tracking-tight">
                        {s.prefix}
                        <AnimatedNumber value={s.value} precision={s.precision} />
                        {s.suffix}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-500 font-display uppercase tracking-wider">{s.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div>
                <h4 className="text-xs font-bold font-display tracking-wider text-slate-200 uppercase mb-3">
                  RECOMMENDED LOW-CARBON TRANSPORT
                </h4>
                <div className="space-y-2">
                  {greenTransport.map((t) => (
                    <motion.div
                      key={t.id}
                      whileHover={{ x: 3 }}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.005] px-4 py-3 text-xs transition-colors"
                    >
                      <span className="text-slate-300 font-medium">{t.label}</span>
                      <span className="text-turf font-semibold font-display tracking-wider uppercase">
                        SAVES ~<AnimatedNumber value={t.co2SavedGrams / 1000} precision={1} /> KG CO₂
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Rewards Rules Panel */}
      <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
        
        <div>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-4">
            GREEN REWARDS
          </h3>
          <ul className="space-y-3.5 text-xs text-slate-400">
            <motion.li whileHover={{ x: 2 }} className="flex items-start gap-3">
              <span className="text-base select-none">♻️</span>
              <div>
                <p className="font-semibold text-slate-300 font-display">Refill Bottle</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Refill at any concession: <span className="text-turf font-bold">+10 points</span></p>
              </div>
            </motion.li>
            <motion.li whileHover={{ x: 2 }} className="flex items-start gap-3 border-t border-white/5 pt-3">
              <span className="text-base select-none">🚇</span>
              <div>
                <p className="font-semibold text-slate-300 font-display">Public Transit</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Arrive via metro, shuttle, or bike: <span className="text-turf font-bold">+25 points</span></p>
              </div>
            </motion.li>
            <motion.li whileHover={{ x: 2 }} className="flex items-start gap-3 border-t border-white/5 pt-3">
              <span className="text-base select-none">🗑️</span>
              <div>
                <p className="font-semibold text-slate-300 font-display">Smart Waste Sorting</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Sort waste at a smart bin station: <span className="text-turf font-bold">+5 points</span></p>
              </div>
            </motion.li>
            <motion.li whileHover={{ x: 2 }} className="flex items-start gap-3 border-t border-white/5 pt-3">
              <span className="text-base select-none">🎟️</span>
              <div>
                <p className="font-semibold text-slate-300 font-display">Merchandise discount</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Redeem 1,500 points: <span className="text-accent2 font-bold">10% Off Official Merch</span></p>
              </div>
            </motion.li>
          </ul>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4">
          <p className="text-[9px] text-slate-500 leading-relaxed font-display uppercase tracking-wider">
            Carbon offsets verified by stadium IoT smart bin & ticket check-in logs.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
