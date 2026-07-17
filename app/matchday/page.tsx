"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import AnimatedNumber from "@/components/AnimatedNumber";
import type { Recommendation, MatchInfo } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const INTEREST_OPTIONS = ["Food", "Merchandise", "Family activities", "Photo spots", "Quiet spaces"];

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

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function MatchDayPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/matchexperience")
      .then((r) => r.json())
      .then((d) => {
        setRecs(d.recommendations);
        setMatches(d.matches);
        setLoading(false);
      });
  }, []);

  function toggle(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  async function generatePlan() {
    setGenerating(true);
    setItinerary("");
    try {
      const res = await fetch("/api/matchexperience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests, timeBudgetMinutes: 45 }),
      });
      const data = await res.json();
      setItinerary(data.itinerary);
    } catch {
      setItinerary("Could not generate your itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Matches & Recs Panel */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
            TODAY'S FIXTURES
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-6 w-1/3 mt-6" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
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
              <div className="space-y-2">
                {matches.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.005 }}
                    className="rounded-xl border border-white/5 bg-white/[0.005] px-4 py-3 text-xs flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-200 font-display">{m.home} vs {m.away}</span>
                    <span className="text-slate-500 font-display text-[10px] uppercase">
                      {m.stadium} &middot; {new Date(m.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-bold font-display tracking-wider text-slate-200 uppercase mb-3">
                  PERSONALIZED RECOMMENDATIONS
                </h4>
                <motion.div
                  variants={gridVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {recs.map((r) => (
                    <motion.div
                      key={r.id}
                      variants={itemVariants}
                      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.1)" }}
                      className="rounded-xl border border-white/5 bg-white/[0.005] p-4 flex flex-col justify-between transition-colors"
                    >
                      <div>
                        <p className="text-[9px] signage-label text-accent2 mb-1.5">{r.category}</p>
                        <p className="font-bold text-slate-200 text-xs font-display">{r.title}</p>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{r.description}</p>
                      </div>
                      <p className="mt-3 border-t border-white/5 pt-2 text-[10px] text-slate-500 font-display uppercase tracking-wider flex justify-between">
                        <span>~<AnimatedNumber value={r.etaMinutes} /> min away</span>
                        <span className="text-accent">Match score <AnimatedNumber value={Math.round(r.matchScore * 100)} suffix="%" /></span>
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Itinerary Panel */}
      <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
        
        <div>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-4">
            PRE-MATCH ITINERARY
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Select your interests to generate a customized 45-minute timeline leading up to kickoff.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {INTEREST_OPTIONS.map((i) => {
              const isSelected = interests.includes(i);
              return (
                <motion.button
                  key={i}
                  onClick={() => toggle(i)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? "border-accent bg-accent/20 text-accent shadow-[0_2px_10px_-2px_rgba(14,165,233,0.3)]"
                      : "border-white/5 bg-white/[0.01] text-slate-400 hover:bg-white/5 hover:text-slate-300"
                  }`}
                >
                  {i}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={generatePlan}
            disabled={generating || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-accent/20 border border-accent/30 px-4 py-3 text-xs font-bold tracking-wider uppercase text-accent hover:bg-accent/30 hover:border-accent/40 disabled:opacity-50 transition-colors font-display cursor-pointer shadow-[0_4px_15px_-4px_rgba(14,165,233,0.2)]"
          >
            {generating ? "Generating Plan..." : "Generate AI itinerary"}
          </motion.button>

          <AnimatePresence mode="wait">
            {generating ? (
              <div className="mt-5 space-y-3.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : itinerary ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 rounded-xl border border-white/5 bg-white/[0.005] p-4 text-xs text-slate-300 leading-relaxed"
              >
                <span className="signage-label text-[9px] text-accent block mb-2">GENERATED SCHEDULE</span>
                <p>{itinerary}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto uppercase font-display tracking-wider">
            Plan factors in live queue times near your seating zone.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
