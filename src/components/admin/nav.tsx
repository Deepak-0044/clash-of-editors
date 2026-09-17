"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  Crown,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Menu,
  SlidersHorizontal,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/components/ui";

const LINKS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/final-16", label: "Final 16", icon: BadgeCheck },
  { href: "/admin/leaders", label: "Leaders", icon: Crown },
  { href: "/admin/teams", label: "Teams", icon: UsersRound },
  { href: "/admin/timeline", label: "Timeline & Rules", icon: CalendarClock },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/results", label: "Results", icon: Trophy },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition",
              active
                ? "border border-gold/30 bg-gold/10 text-gold"
                : "border border-transparent text-mist/65 hover:bg-white/5 hover:text-white",
            )}
          >
            <link.icon size={15} />
            {link.label}
          </Link>
        );
      })}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/8 px-3 py-2.5 text-[10px] uppercase tracking-[0.18em] text-mist/45">
        <ListChecks size={13} />
        Role · {role}
      </div>
    </nav>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-mist/60">
          Organizer menu
        </span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      <div className={cn("lg:block", open ? "block" : "hidden")}>{nav}</div>
    </>
  );
}
