"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import AnimatedNumber from "@/components/AnimatedNumber";
import type { TransportOption, ParkingLot } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const MODE_ICON: Record<TransportOption["mode"], string> = {
  metro: "🚇",
  bus: "🚌",
  shuttle: "🚐",
  rideshare: "🚗",
  walk: "🚶",
  bike: "🚲",
  car: "🚘",
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

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export default function TransportPage() {
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [parking, setParking] = useState<ParkingLot[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transport")
      .then((r) => r.json())
      .then((d) => {
        setOptions(d.options);
        setParking(d.parking);
        setWeather(d.weather);
        setLoading(false);
      });
  }, []);

  const best = [...options].sort((a, b) => a.etaMinutes - b.etaMinutes)[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Route & Options Panel */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
              TRANSIT PLANNER & OPTIONS
            </h3>
          </div>
          <AnimatePresence mode="wait">
            {loading ? (
              <Skeleton className="h-5 w-32 rounded-full" />
            ) : (
              weather && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] signage-label text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded"
                >
                  ⛅ {weather.condition} &middot; {weather.tempC}°C &middot; {weather.windKph}km/h
                </motion.span>
              )
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <div className="space-y-2.5">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {best && (
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs text-accent leading-relaxed flex gap-2.5 items-center"
                >
                  <span className="text-xl">{MODE_ICON[best.mode]}</span>
                  <div>
                    <span className="font-bold font-display tracking-wider text-[9px] block mb-0.5">AI TRANSIT RECOMMENDATION</span>
                    <p>
                      Take the <span className="font-bold underline">{best.label}</span> — fastest route right now. ETA is approximately <span className="font-bold"><AnimatedNumber value={best.etaMinutes} /> minutes</span>.
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-2.5"
              >
                {options.map((o) => (
                  <motion.div
                    key={o.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, borderColor: "rgba(255, 255, 255, 0.12)", background: "rgba(255,255,255,0.015)" }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.005] px-4 py-3.5 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{MODE_ICON[o.mode]}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-200 font-display">{o.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Crowd: <span className="text-slate-400 font-medium">{o.crowdLevel}</span> &middot; {o.cost} &middot;{" "}
                          <span className="text-turf">
                            saves <AnimatedNumber value={o.co2SavedGrams / 1000} precision={1} />kg CO₂
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-200 font-display">
                        <AnimatedNumber value={o.etaMinutes} />
                      </span>
                      <span className="text-[10px] text-slate-500 font-display block uppercase tracking-wide">MIN</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Parking Panel */}
      <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
        
        <div>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-4">
            PARKING STATUS
          </h3>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3.5"
              >
                {parking.map((p) => {
                  const percentUsed = Math.round((1 - p.spotsFree / p.spotsTotal) * 100);
                  const isFull = p.spotsFree === 0;

                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-xl border border-white/5 bg-white/[0.005] p-4 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-bold text-slate-200 font-display">{p.name}</p>
                        {p.evCharging && (
                          <span className="text-[9px] signage-label text-turf bg-turf/10 border border-turf/20 px-2 py-0.5 rounded">
                            ⚡ EV Available
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-display uppercase tracking-wide">
                        <AnimatedNumber value={p.distanceMeters} />m to nearest entrance
                      </p>
                      
                      {/* Interactive Progress Bar */}
                      <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${percentUsed > 85 ? "bg-danger" : percentUsed > 60 ? "bg-amber" : "bg-accent2"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentUsed}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                      
                      <div className="mt-2.5 flex justify-between text-xs text-slate-400">
                        <span>Utilization</span>
                        <span className={percentUsed > 85 ? "text-danger font-bold" : "text-slate-300 font-semibold"}>
                          <AnimatedNumber value={p.spotsFree} /> / {p.spotsTotal} free
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto uppercase font-display tracking-wider">
            🚨 Shuttle departs Lot P3 every 10 min
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
