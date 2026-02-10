"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFamily } from "../layout";
import FamilyMemberCard from "@/components/FamilyMemberCard";
import type { FamilyMember } from "@/components/FamilyMemberCard";
import ReminderItem from "@/components/ReminderItem";
import type { Reminder } from "@/components/ReminderItem";
import QuickAsk from "@/components/QuickAsk";

interface Chore {
  id: string;
  title: string;
  assigned_to?: string;
  frequency: string;
  completed: boolean;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const { family, loading } = useFamily();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);

  useEffect(() => {
    if (!loading && !family) {
      router.push("/setup");
    }
  }, [loading, family, router]);

  useEffect(() => {
    if (family) {
      fetch("/api/members").then(r => r.ok ? r.json() : { members: [] }).then(d => setMembers(d.members || [])).catch(() => {});
      fetch("/api/reminders").then(r => r.ok ? r.json() : { reminders: [] }).then(d => setReminders((d.reminders || []).filter((r: Reminder) => !r.completed).slice(0, 5))).catch(() => {});
      fetch("/api/chores?status=active").then(r => r.ok ? r.json() : { chores: [] }).then(d => setChores((d.chores || []).filter((c: Chore) => !c.completed).slice(0, 5))).catch(() => {});
    }
  }, [family]);

  const toggleReminder = async (id: string, completed: boolean) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    } catch {}
  };

  const toggleChore = async (id: string) => {
    setChores(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/chores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
    } catch {}
  };

  if (loading || !family) return null;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[#292524]">{getGreeting()}, {family.name}! 👋</h1>
        <p className="text-[#A8A29E] text-sm mt-1">{today}</p>
      </div>

      {/* Family Members */}
      <div>
        <h2 className="font-semibold text-[#292524] mb-3">👨‍👩‍👧‍👦 Family</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.length > 0
            ? members.map((m, i) => <FamilyMemberCard key={m.id} member={m} index={i} compact />)
            : <p className="text-sm text-[#A8A29E] col-span-full">No family members yet. <a href="/family" className="text-[#6366F1] hover:underline">Add some!</a></p>
          }
        </div>
      </div>

      {/* Today's Chores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#292524]">🧹 Today&apos;s Chores</h2>
          <a href="/chores" className="text-sm text-[#6366F1] hover:underline">View all →</a>
        </div>
        <div className="space-y-2">
          {chores.length > 0 ? chores.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#F5F0EB] shadow-[0_1px_3px_rgba(180,140,100,0.08)]">
              <input
                type="checkbox"
                onChange={() => toggleChore(c.id)}
                className="w-5 h-5 rounded-md accent-[#6366F1] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#292524]">{c.title}</p>
                {c.assigned_to && <p className="text-xs text-[#A8A29E]">{c.assigned_to}</p>}
              </div>
              <span className="text-xs text-[#A8A29E] capitalize">{c.frequency}</span>
            </div>
          )) : (
            <p className="text-sm text-[#A8A29E]">No chores for today. <a href="/chores" className="text-[#6366F1] hover:underline">Add some!</a></p>
          )}
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <h2 className="font-semibold text-[#292524] mb-3">⏰ Upcoming Reminders</h2>
        <div className="space-y-2">
          {reminders.length > 0
            ? reminders.map(r => <ReminderItem key={r.id} reminder={r} onToggle={toggleReminder} />)
            : <p className="text-sm text-[#A8A29E]">No upcoming reminders. <a href="/reminders" className="text-[#6366F1] hover:underline">Create one!</a></p>
          }
        </div>
      </div>

      {/* Quick Ask */}
      <QuickAsk />
    </div>
  );
}
