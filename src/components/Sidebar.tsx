"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { href: "/chores", label: "Chores", icon: "🧹" },
  { href: "/reminders", label: "Reminders", icon: "⏰" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

interface SidebarProps {
  onMarvinOpen: () => void;
}

export default function Sidebar({ onMarvinOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop icon rail */}
      <aside className="hidden md:flex fixed z-40 top-0 left-0 h-full w-16 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex-col items-center py-4 gap-1">
        {/* User avatar */}
        <div className="mb-4">
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group w-11 h-11 flex items-center justify-center rounded-xl text-lg transition-colors ${
                  active
                    ? "bg-white/15 shadow-sm shadow-white/5"
                    : "hover:bg-white/10"
                }`}
                aria-label={item.label}
              >
                {item.icon}
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-black/80 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Marvin button at bottom */}
        <button
          onClick={onMarvinOpen}
          className="w-11 h-11 flex items-center justify-center rounded-xl text-lg hover:bg-white/10 transition-colors relative group"
          aria-label="Open Marvin"
        >
          🤖
          <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-black/80 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            Marvin
          </span>
        </button>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-11 h-11 flex items-center justify-center rounded-xl text-lg transition-colors ${
                active ? "bg-white/15" : ""
              }`}
              aria-label={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
        <button
          onClick={onMarvinOpen}
          className="w-11 h-11 flex items-center justify-center rounded-xl text-lg hover:bg-white/10 transition-colors"
          aria-label="Open Marvin"
        >
          🤖
        </button>
      </nav>
    </>
  );
}
