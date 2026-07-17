"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/types";
import { motion } from "framer-motion";

const FAN_LINKS = [
  { href: "/concierge", label: "Concierge" },
  { href: "/crowd", label: "Crowd" },
  { href: "/transport", label: "Transport" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/matchday", label: "Match Day" },
];

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Command Dashboard" },
  { href: "/admin/emergency", label: "Emergency" },
];

export default function Navbar() {
  const { user, setRole } = useAuth();
  const pathname = usePathname();
  const links =
    user.role === "admin" || user.role === "volunteer"
      ? [...FAN_LINKS, ...ADMIN_LINKS]
      : FAN_LINKS;

  return (
    <header className="glass sticky top-3 z-40 mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-white/10">
      <Link href="/" className="font-semibold tracking-tight text-accent font-display text-lg flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turf opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-turf"></span>
        </span>
        WC26<span className="text-slate-300 font-light">Stadium AI</span>
      </Link>

      <nav className="flex flex-wrap gap-1.5 text-sm font-medium">
        {links.map((l) => {
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative rounded-lg px-3 py-1.5 text-slate-300 transition-colors duration-200 hover:text-white ${
                isActive ? "text-white" : "hover:text-slate-100"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavTab"
                  className="absolute inset-0 rounded-lg bg-white/5 border border-white/10 shadow-[0_2px_10px_-3px_rgba(14,165,233,0.2)]"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span className="relative z-10">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-400 font-display">
        <span className="signage-label text-[10px] text-slate-400">ROLE</span>
        <select
          value={user.role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-lg border border-white/5 bg-panel/80 px-2.5 py-1 text-slate-200 outline-none hover:border-white/10 transition-colors cursor-pointer"
        >
          <option value="fan">Fan</option>
          <option value="volunteer">Volunteer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </header>
  );
}
