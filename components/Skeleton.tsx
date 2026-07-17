"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "rect";
}

export default function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const baseStyle = "relative overflow-hidden bg-white/[0.03] border border-white/[0.04]";

  const variantStyles = {
    text: "h-4 w-full rounded",
    card: "h-36 w-full rounded-2xl",
    circle: "rounded-full",
    rect: "rounded-xl",
  };

  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {/* Glass shimmer overlay */}
      <motion.div
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
        style={{ skewX: "-20deg" }}
        animate={{
          left: ["-100%", "200%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
