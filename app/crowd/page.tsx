"use client";

import { useEffect, useState } from "react";
import Heatmap from "@/components/Heatmap";
import Skeleton from "@/components/Skeleton";
import AnimatedNumber from "@/components/AnimatedNumber";
import type { CrowdSnapshot, Zone } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const RISK_COLOR: Record<CrowdSnapshot["overallRisk"], string> = {
  low: "text-accent",
  moderate: "text-accent2",
  high: "text-warn",
  critical: "text-danger",
};

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

export default function CrowdPage() {
  const [data, setData] = useState<CrowdSnapshot | null>(null);
  const [selected, setSelected] = useState<Zone | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/crowd");
      const json = await res.json();
      setData(json);
      // Keep selected zone reference updated when live data refreshes
      if (selected) {
        const updated = json.zones.find((z: Zone) => z.id === selected.id);
        if (updated) setSelected(updated);
      }
    }
    load();
    const id = setInterval(load, 6000); // simulated real-time IoT refresh
    return () => clearInterval(id);
  }, [selected]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Heatmap Panel */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turf opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-turf"></span>
            </span>
            <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
              LIVE CROWD HEATMAP
            </h3>
          </div>
          <AnimatePresence mode="wait">
            {!data ? (
              <Skeleton className="h-5 w-24 rounded-full" />
            ) : (
              <motion.span
                key={data.overallRisk}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`text-xs font-bold font-display tracking-widest ${RISK_COLOR[data.overallRisk]}`}
              >
                RISK: {data.overallRisk.toUpperCase()}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {!data ? (
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        ) : (
          <Heatmap zones={data.zones} onSelect={setSelected} />
        )}

        <p className="mt-4 text-[10px] text-slate-500 font-display uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡ UPDATES EVERY 6S FROM TURNSTILE/IOT SENSORS</span>
          <span>&middot;</span>
          <span>TAP ZONE FOR LIVE INSIGHTS</span>
        </p>
      </motion.div>

      {/* Details Panel */}
      <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden flex flex-col justify-between h-full">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
        
        <div>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-4">
            ZONE DETAIL
          </h3>
          
          <AnimatePresence mode="wait">
            {!data ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : !selected ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-400 py-6 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]"
              >
                Select a zone on the map to review capacity, wait estimates, and safety advisories.
              </motion.p>
            ) : (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-slate-100 font-display">{selected.name}</p>
                  <span className={`text-[10px] font-bold font-display px-2 py-0.5 rounded border ${
                    selected.currentLoad / selected.capacity > 0.8
                      ? "bg-danger/10 border-danger/20 text-danger"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}>
                    {selected.kind.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 rounded-xl bg-white/[0.02] border border-white/5 p-3.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Occupancy load</span>
                    <span className="font-semibold text-slate-200">
                      <AnimatedNumber value={selected.currentLoad} /> / {selected.capacity} (
                      <AnimatedNumber value={Math.round((selected.currentLoad / selected.capacity) * 100)} suffix="%" />)
                    </span>
                  </div>

                  {selected.waitMinutes != null && (
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                      <span>Estimated Wait</span>
                      <span className="font-semibold text-slate-200">
                        <AnimatedNumber value={selected.waitMinutes} suffix=" min" />
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                    <span>Wheelchair Accessible</span>
                    <span className="font-semibold text-slate-200">
                      {selected.accessible ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {selected.currentLoad / selected.capacity > 0.8 && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-xl border border-warn/20 bg-warn/5 p-4 text-xs text-warn leading-relaxed flex gap-2.5"
                  >
                    <span className="text-sm">⚠️</span>
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[9px] mb-0.5 font-display">AI SUGGESTION</p>
                      <p>
                        This zone is nearing capacity. Consider{" "}
                        <span className="underline">
                          {selected.kind === "gate" ? "an alternate gate" : "a nearby lower-traffic option"}
                        </span>{" "}
                        to save time.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Interactive RAG is wired directly to this crowd data feed to contextualize fan navigation advice.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
