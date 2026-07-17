"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function AmbientBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 60 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientWidth, clientHeight } = document.documentElement;
      // Map mouse position relative to center of screen, scaled down for subtle offset
      const x = (e.clientX / clientWidth - 0.5) * 80;
      const y = (e.clientY / clientHeight - 0.5) * 80;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#030408]">
      {/* Technical grid overlay for broadcast command vibe */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Stadium floodlight bleed spots */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% -20%, rgba(14, 165, 233, 0.08), transparent 70%)",
        }}
      />

      {/* Teal Floodlight Spot */}
      <motion.div
        className="absolute -left-[10%] -top-[10%] h-[70vw] w-[70vw] rounded-full bg-accent/5 blur-[120px] mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Indigo secondary glow */}
      <motion.div
        className="absolute -right-[10%] top-[20%] h-[60vw] w-[60vw] rounded-full bg-accent2/5 blur-[140px] mix-blend-screen"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Turf Green signature highlight (sparingly) */}
      <motion.div
        className="absolute bottom-[-15%] left-[25%] h-[50vw] w-[50vw] rounded-full bg-turf/5 blur-[120px] mix-blend-screen"
        animate={{
          scale: [1, 1.2, 0.85, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
