"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  suffix?: string;
  precision?: number;
}

export default function AnimatedNumber({
  value,
  className = "",
  suffix = "",
  precision = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 35,
    stiffness: 70,
  });

  useEffect(() => {
    animate(motionValue, value, { duration: 1.2, ease: "easeOut" });
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toFixed(precision) + suffix;
      }
    });
  }, [springValue, suffix, precision]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(precision)}
      {suffix}
    </span>
  );
}
