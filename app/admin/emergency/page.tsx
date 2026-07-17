"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";
import type { Incident } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_COLOR: Record<Incident["severity"], string> = {
  low: "text-accent",
  medium: "text-accent2",
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

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function EmergencyPage() {
  return (
    <RoleGuard allowed={["admin", "volunteer"]}>
      <EmergencyBody />
    </RoleGuard>
  );
}

function EmergencyBody() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [plan, setPlan] = useState<{ plan: string; notify: string[]; languages: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/emergency");
    const data = await res.json();
    setIncidents(data.incidents);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function simulate() {
    setBusy(true);
    setPlan(null);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate" }),
      });
      const data = await res.json();
      setPlan({ plan: data.plan, notify: data.notify, languages: data.languages });
      await load();
    } catch {
      alert("Failed to simulate emergency telemetry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resolve(id: string) {
    await fetch("/api/emergency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", id }),
    });
    await load();
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Incident Feed Panel */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-danger/15 to-transparent" />
        
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
            </span>
            <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
              ACTIVE INCIDENT FEED
            </h3>
          </div>
          <motion.button
            onClick={simulate}
            disabled={busy || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-danger hover:bg-danger/20 hover:border-danger/45 transition-colors disabled:opacity-50 font-display cursor-pointer"
          >
            {busy ? "Analyzing Feed..." : "Simulate new incident"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence initial={false}>
                {incidents.map((i) => {
                  const isActive = i.status !== "resolved";
                  
                  return (
                    <motion.div
                      key={i.id}
                      variants={itemVariants}
                      exit={{ opacity: 0, height: 0 }}
                      animate={
                        isActive
                          ? {
                              borderColor: ["rgba(239, 68, 68, 0.08)", "rgba(239, 68, 68, 0.25)", "rgba(239, 68, 68, 0.08)"],
                              boxShadow: [
                                "0 4px 15px -4px rgba(0,0,0,0.6)",
                                "0 4px 20px -2px rgba(239, 68, 68, 0.08)",
                                "0 4px 15px -4px rgba(0,0,0,0.6)",
                              ],
                            }
                          : {}
                      }
                      transition={isActive ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                      className={`rounded-xl border p-4 transition-colors ${
                        isActive ? "bg-white/[0.005] border-white/5" : "bg-black/25 border-white/5 opacity-55"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-display tracking-widest uppercase ${SEVERITY_COLOR[i.severity]}`}>
                          {i.type.toUpperCase()} &middot; {i.severity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-display">
                          {new Date(i.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-medium">{i.aiSummary}</p>
                      
                      <div className="mt-3.5 border-t border-white/5 pt-2.5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-display uppercase tracking-wider">
                          Zone: {i.zoneId} &middot; Status: {i.status}
                        </span>
                        {isActive && (
                          <motion.button
                            onClick={() => resolve(i.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[10px] font-bold font-display tracking-wider uppercase text-accent hover:underline cursor-pointer"
                          >
                            Mark resolved
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI response plan panel */}
      <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
        
        <div>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-4">
            AI RESPONSE PLAN
          </h3>

          <AnimatePresence mode="wait">
            {busy ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : !plan ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-400 py-8 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]"
              >
                Simulate or click an incident to generate real-time AI decision-support diagnostics.
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-xs"
              >
                <div className="rounded-xl border border-white/5 bg-white/[0.005] p-4 text-slate-300 leading-relaxed">
                  <span className="signage-label text-[9px] text-amber block mb-2">DIAGNOSTIC PROTOCOL</span>
                  <p>{plan.plan}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.005] p-4 space-y-3">
                  <div>
                    <span className="signage-label text-[9px] text-slate-500 block mb-1">STAKEHOLDERS DISPATCHED</span>
                    <ul className="list-inside list-disc text-slate-400 space-y-1 mt-1 leading-relaxed">
                      {plan.notify.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-white/5 pt-2.5">
                    <span className="signage-label text-[9px] text-slate-500 block mb-1">BROADCAST LANGUAGES</span>
                    <p className="text-slate-400 font-semibold uppercase font-display tracking-wide mt-1">
                      {plan.languages.join(", ")}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto uppercase font-display tracking-wider">
            Plan synced with municipal disaster networks.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
