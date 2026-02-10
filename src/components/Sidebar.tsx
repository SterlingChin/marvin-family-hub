"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { href: "/reminders", label: "Reminders", icon: "⏰" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-xl shadow-md p-2 text-2xl"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white shadow-md flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#3B82F6]">🤖 Marvin</h1>
          <p className="text-xs text-gray-400 mt-1">Family Hub</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-[#3B82F6]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
