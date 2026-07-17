"use client";

import { useAuth } from "@/lib/auth";
import type { Role } from "@/types";
import { motion } from "framer-motion";

export default function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!allowed.includes(user.role)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass p-10 text-center max-w-xl mx-auto border-t border-amber/20 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1.5px] bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber/10 border border-amber/20 text-amber text-xl mb-4">
          🔒
        </div>
        <h4 className="text-base font-bold font-display tracking-wider text-slate-200 uppercase mb-2">
          RESTRICTED AREA
        </h4>
        <p className="text-sm text-slate-300 mb-2">
          This operations module is restricted to authorized personnel:{" "}
          <span className="font-semibold text-amber font-display uppercase">{allowed.join(", ")}</span>.
        </p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Please toggle your role selector in the navigation bar to simulate and review volunteer or administrator credentials.
        </p>
      </motion.div>
    );
  }

  return <>{children}</>;
}
