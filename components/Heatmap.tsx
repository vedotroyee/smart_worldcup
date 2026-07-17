"use client";

import type { Zone } from "@/types";
import { motion } from "framer-motion";

function loadColor(load: number, capacity: number) {
  const pct = load / capacity;
  if (pct > 0.9) return "#ef4444"; // danger (red)
  if (pct > 0.75) return "#f59e0b"; // warn (amber)
  if (pct > 0.55) return "#6366f1"; // accent2 (indigo)
  return "#0ea5e9"; // accent (teal/sky)
}

export default function Heatmap({
  zones,
  onSelect,
}: {
  zones: Zone[];
  onSelect?: (z: Zone) => void;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/5 bg-[#05070c] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
      {/* Radar scanning line effect - matches the 6s refresh interval */}
      <motion.div
        className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/30 to-transparent shadow-[0_0_12px_1px_rgba(14,165,233,0.4)] pointer-events-none z-10"
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 12, // full roundtrip in 12s, single sweep in 6s
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Simplified stadium bowl outline */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-60">
        <ellipse cx="50" cy="50" rx="46" ry="42" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" />
        <ellipse cx="50" cy="50" rx="30" ry="26" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
        <ellipse cx="50" cy="50" rx="18" ry="14" fill="rgba(14, 165, 233, 0.02)" stroke="rgba(14, 165, 233, 0.06)" strokeWidth="0.75" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
      </svg>

      {/* Interactive Zones */}
      {zones.map((z) => {
        const pctVal = z.currentLoad / z.capacity;
        const pctText = Math.round(pctVal * 100);
        const color = loadColor(z.currentLoad, z.capacity);

        // Busiest zones pulse faster and brighter
        const pulseDuration = pctVal > 0.9 ? 1.0 : pctVal > 0.75 ? 1.6 : pctVal > 0.55 ? 2.4 : 3.2;

        return (
          <motion.button
            key={z.id}
            onClick={() => onSelect?.(z)}
            style={{
              left: `${z.x}%`,
              top: `${z.y}%`,
              borderColor: color,
            }}
            whileHover={{ scale: 1.12, zIndex: 30 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: [`${color}1a`, `${color}3d`, `${color}1a`],
              boxShadow: [
                `0 0 4px 0px ${color}20`,
                `0 0 12px 3px ${color}40`,
                `0 0 4px 0px ${color}20`,
              ],
            }}
            transition={{
              duration: pulseDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[10px] font-bold text-slate-100 shadow-md backdrop-blur-sm cursor-pointer z-20 font-display"
            title={`${z.name}: ${pctText}% capacity`}
          >
            {pctText}%
            <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 border border-white/10 px-2 py-1 text-[10px] text-slate-200 group-hover:block font-medium">
              {z.name} {z.waitMinutes ? `· ${z.waitMinutes}m wait` : ""}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
