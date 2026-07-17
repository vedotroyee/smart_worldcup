"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Mascot {
  id: number;
  player: "messi" | "ronaldo" | "haaland" | "yamal";
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  xKeyframes: any[];
  yKeyframes: any[];
  rotateKeyframes: any[];
  scaleKeyframes?: any[];
  duration: number;
  label: string;
}

export default function AmbientPlayers() {
  const [mascots, setMascots] = useState<Mascot[]>([]);
  const [enabled, setEnabled] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Load user settings preference
  useEffect(() => {
    const stored = localStorage.getItem("ambient_mascots_enabled");
    if (stored !== null) {
      setEnabled(stored === "true");
    }
  }, []);

  const toggleMascots = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("ambient_mascots_enabled", String(next));
    if (!next) {
      setMascots([]);
    }
  };

  // Silhouette spawn manager
  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    let timeoutId: NodeJS.Timeout;

    const spawn = () => {
      const players: Mascot["player"][] = ["messi", "ronaldo", "haaland", "yamal"];
      const colors = ["text-accent/25", "text-accent2/25", "text-turf/20"];
      const chosenPlayer = players[Math.floor(Math.random() * players.length)];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      const id = Date.now();

      let newMascot: Mascot;

      // Define specific iconic movement patterns and dimensions per player Mascot
      switch (chosenPlayer) {
        case "messi":
          // Small, low gravity, runs extremely fast and bobs frequently with ball close
          newMascot = {
            id,
            player: "messi",
            color: chosenColor,
            size: 38,
            initialX: "-10vw",
            initialY: "83vh",
            xKeyframes: ["-10vw", "15vw", "40vw", "65vw", "90vw", "110vw"],
            yKeyframes: ["83vh", "82vh", "83vh", "82vh", "83vh", "83vh"],
            rotateKeyframes: [5, -5, 5, -5, 5, 0],
            duration: 6,
            label: "Mascot: Leo",
          };
          break;

        case "ronaldo":
          // Sprints in, leaps high, rotates 180 degrees, lands in the SIUUU pose, then runs off
          newMascot = {
            id,
            player: "ronaldo",
            color: chosenColor,
            size: 55,
            initialX: "-10vw",
            initialY: "81vh",
            xKeyframes: ["-10vw", "30vw", "50vw", "50vw", "50vw", "65vw", "110vw"],
            yKeyframes: ["81vh", "81vh", "50vh", "81vh", "81vh", "81vh", "81vh"],
            rotateKeyframes: [0, 0, 180, 0, 0, 0, 0],
            scaleKeyframes: [1, 1, 1.25, 1, 1, 1, 1],
            duration: 8,
            label: "Mascot: Cris",
          };
          break;

        case "haaland":
          // Huge size, sprints to center, sits down in Zen pose, then gets up and sprints off
          newMascot = {
            id,
            player: "haaland",
            color: chosenColor,
            size: 68,
            initialX: "110vw",
            initialY: "78vh",
            xKeyframes: ["110vw", "75vw", "50vw", "50vw", "50vw", "20vw", "-10vw"],
            yKeyframes: ["78vh", "78vh", "80vh", "80vh", "80vh", "78vh", "78vh"],
            rotateKeyframes: [0, 0, 0, 0, 0, 0, 0],
            duration: 9,
            label: "Mascot: Erling",
          };
          break;

        case "yamal":
        default:
          // Quick zig-zags (winger dribble), does a 304 pose, then zooms off
          newMascot = {
            id,
            player: "yamal",
            color: chosenColor,
            size: 45,
            initialX: "-10vw",
            initialY: "82vh",
            xKeyframes: ["-10vw", "25vw", "40vw", "40vw", "40vw", "70vw", "110vw"],
            yKeyframes: ["82vh", "77vh", "84vh", "82vh", "82vh", "80vh", "82vh"],
            rotateKeyframes: [8, -8, 8, 0, 0, 8, 0],
            duration: 7,
            label: "Mascot: Lamine",
          };
          break;
      }

      setMascots((prev) => [...prev, newMascot]);

      // Remove mascot once travel completed
      setTimeout(() => {
        setMascots((prev) => prev.filter((m) => m.id !== id));
      }, newMascot.duration * 1000 + 500);

      // Spawn next mascot in 20-50 seconds (more frequent for user testing feedback)
      const nextDelay = (Math.random() * 30 + 20) * 1000;
      timeoutId = setTimeout(spawn, nextDelay);
    };

    // First spawn after 10 seconds
    timeoutId = setTimeout(spawn, 10000);

    return () => clearTimeout(timeoutId);
  }, [enabled, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      {/* Settings Corner Toggle */}
      <div className="fixed bottom-3 right-4 z-50 text-[10px] signage-label text-slate-500 hover:text-slate-400 bg-white/5 border border-white/5 rounded-full px-2.5 py-1 flex items-center gap-1.5 cursor-pointer select-none backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/10">
        <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-turf animate-pulse" : "bg-slate-600"}`} />
        <button onClick={toggleMascots} className="outline-none tracking-wider uppercase font-semibold">
          MASCOTS: {enabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Animation Canvas Layer */}
      <div className="pointer-events-none fixed inset-0 -z-40 overflow-hidden">
        <AnimatePresence>
          {enabled &&
            mascots.map((m) => (
              <motion.div
                key={m.id}
                initial={{ x: m.initialX, y: m.initialY, scale: 0.95, opacity: 0 }}
                animate={{
                  x: m.xKeyframes,
                  y: m.yKeyframes,
                  rotate: m.rotateKeyframes,
                  scale: m.scaleKeyframes ?? 1,
                  opacity: [0, 1, 1, 1, 1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: m.duration,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  width: m.size,
                  height: m.size,
                }}
                className={`${m.color} flex flex-col items-center`}
              >
                {/* Stylized Silhouette SVG Renders */}
                
                {/* 1. MESSI (Low gravity close-dribbler) */}
                {m.player === "messi" && (
                  <svg
                    viewBox="0 0 48 48"
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="16" cy="11" r="3" fill="currentColor" stroke="none" />
                    <path d="M16,14 L18,22 L13,31 M18,22 L22,30 M16,16 L10,18 M16,16 L22,18" />
                    {/* Ball close to foot */}
                    <circle cx="26" cy="33" r="2" fill="currentColor" stroke="none" />
                  </svg>
                )}

                {/* 2. RONALDO (SIUUU celebration stance) */}
                {m.player === "ronaldo" && (
                  <svg
                    viewBox="0 0 48 48"
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="24" cy="9" r="3.2" fill="currentColor" stroke="none" />
                    {/* Alternate between running body and landing SIUUU body depending on progress */}
                    {/* Simple representation that works dynamically: arms spread down/back, legs wide */}
                    <path d="M24,12.5 L24,24 L16,36 M24,24 L32,36 M24,15 L12,25 M24,15 L36,25" />
                    <circle cx="36" cy="36" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}

                {/* 3. HAALAND (Large body, yoga mudra pose) */}
                {m.player === "haaland" && (
                  <svg
                    viewBox="0 0 48 48"
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="24" cy="12" r="3.5" fill="currentColor" stroke="none" />
                    {/* Cross-legged meditation outline representation */}
                    <path d="M24,15.5 L24,25 M24,25 C20,25 15,29 15,33 M24,25 C28,25 33,29 33,33 M15,20 C18,20 20,22 20,24 M33,20 C30,20 28,22 28,24" />
                  </svg>
                )}

                {/* 4. YAMAL (Tricky zig-zag dribbler, 304 sign) */}
                {m.player === "yamal" && (
                  <svg
                    viewBox="0 0 48 48"
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="22" cy="10" r="3" fill="currentColor" stroke="none" />
                    <path d="M22,13 L22,23 L17,33 M22,23 L27,33 M22,16 L12,18 L10,12 M22,16 L31,18 L33,12" />
                    <circle cx="12" cy="33" r="2" fill="currentColor" stroke="none" />
                  </svg>
                )}

                {/* Subtle text label tag underneath the silhouette */}
                <span className="text-[7px] font-bold font-display uppercase tracking-widest opacity-40 mt-1 select-none">
                  {m.label}
                </span>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </>
  );
}
