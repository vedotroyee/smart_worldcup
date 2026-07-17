"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import Heatmap from "@/components/Heatmap";
import Skeleton from "@/components/Skeleton";
import AnimatedNumber from "@/components/AnimatedNumber";
import type { CrowdSnapshot, Volunteer } from "@/types";
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

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowed={["admin", "volunteer"]}>
      <DashboardBody />
    </RoleGuard>
  );
}

function DashboardBody() {
  const [crowd, setCrowd] = useState<CrowdSnapshot | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setCrowd(data.crowd);
      setVolunteers(data.volunteers);
      setSummary(data.aiSummary);
      setLoading(false);
    }
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Live Heatmap Grid */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-2 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase">
            LIVE CROWD HEATMAP
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          ) : (
            crowd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3"
              >
                <Heatmap zones={crowd.zones} />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right Column details */}
      <div className="space-y-6">
        {/* Operations Summary */}
        <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-turf/15 to-transparent" />
          
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turf opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-turf"></span>
            </span>
            <h3 className="font-bold font-display tracking-wider text-xs text-slate-200 uppercase">
              AI OPERATIONS SUMMARY
            </h3>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs text-slate-300 leading-relaxed"
              >
                {summary || "Calculating operational dashboard telemetry..."}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Volunteer Deployment */}
        <motion.div variants={itemVariants} className="glass p-5 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent2/15 to-transparent" />
          
          <h3 className="font-bold font-display tracking-wider text-xs text-slate-200 uppercase mb-4">
            VOLUNTEER DEPLOYMENT
          </h3>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {volunteers.map((v) => (
                  <motion.div
                    key={v.id}
                    variants={itemVariants}
                    className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-bold text-slate-200 font-display">{v.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {v.role} &middot; {v.zoneId}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold font-display uppercase tracking-wide border ${
                        v.status === "available"
                          ? "bg-accent/10 border-accent/20 text-accent"
                          : v.status === "deployed"
                          ? "bg-accent2/10 border-accent2/20 text-accent2"
                          : "bg-white/5 border-white/5 text-slate-500"
                      }`}
                    >
                      {v.status}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Grid Load Table */}
      <motion.div variants={itemVariants} className="glass p-5 lg:col-span-3 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        
        <h3 className="font-bold font-display tracking-wider text-sm text-slate-200 uppercase mb-4">
          ZONE TELEMETRY TABLE
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 font-display font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 pr-4">Zone Name</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Occupancy Load</th>
                <th className="pb-3 pr-4">Wait Time</th>
                <th className="pb-3">Accessible</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              {loading ? (
                <tbody>
                  {[...Array(6)].map((_, idx) => (
                    <tr key={idx} className="border-t border-white/5">
                      <td className="py-3" colSpan={5}>
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <motion.tbody
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  {crowd?.zones.map((z) => {
                    const ratio = z.currentLoad / z.capacity;
                    return (
                      <motion.tr
                        key={z.id}
                        variants={itemVariants}
                        className="border-t border-white/5 hover:bg-white/[0.01] transition-colors"
                      >
                        <td className="py-3 pr-4 font-bold text-slate-200 font-display">{z.name}</td>
                        <td className="py-3 pr-4 text-slate-400 capitalize">{z.kind}</td>
                        <td className={`py-3 pr-4 font-medium ${ratio > 0.9 ? "text-danger" : ratio > 0.75 ? "text-amber" : "text-slate-400"}`}>
                          <AnimatedNumber value={z.currentLoad} /> / {z.capacity} (
                          <AnimatedNumber value={Math.round(ratio * 100)} suffix="%" />)
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-300 font-display">
                          {z.waitMinutes != null ? (
                            <AnimatedNumber value={z.waitMinutes} suffix=" min" />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 text-slate-400">{z.accessible ? "Yes" : "No"}</td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              )}
            </AnimatePresence>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
