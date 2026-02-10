"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFamily } from "../layout";
import FamilyMemberCard from "@/components/FamilyMemberCard";
import type { FamilyMember } from "@/components/FamilyMemberCard";
import ReminderItem from "@/components/ReminderItem";
import type { Reminder } from "@/components/ReminderItem";
import QuickAsk from "@/components/QuickAsk";

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

  useEffect(() => {
    if (!loading && !family) {
      router.push("/setup");
    }
  }, [loading, family, router]);

  useEffect(() => {
    if (family) {
      fetch("/api/members").then(r => r.ok ? r.json() : { members: [] }).then(d => setMembers(d.members || [])).catch(() => {});
      fetch("/api/reminders").then(r => r.ok ? r.json() : { reminders: [] }).then(d => setReminders((d.reminders || []).filter((r: Reminder) => !r.completed).slice(0, 5))).catch(() => {});
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

  if (loading || !family) return null;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">{getGreeting()}, {family.name}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">{today}</p>
      </div>

      {/* Family Members */}
      <div>
        <h2 className="font-semibold text-[#1F2937] mb-3">👨‍👩‍👧‍👦 Family</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.length > 0
            ? members.map((m, i) => <FamilyMemberCard key={m.id} member={m} index={i} compact />)
            : <p className="text-sm text-gray-400 col-span-full">No family members yet. <a href="/family" className="text-[#3B82F6] hover:underline">Add some!</a></p>
          }
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <h2 className="font-semibold text-[#1F2937] mb-3">⏰ Upcoming Reminders</h2>
        <div className="space-y-2">
          {reminders.length > 0
            ? reminders.map(r => <ReminderItem key={r.id} reminder={r} onToggle={toggleReminder} />)
            : <p className="text-sm text-gray-400">No upcoming reminders. <a href="/reminders" className="text-[#3B82F6] hover:underline">Create one!</a></p>
          }
        </div>
      </div>

      {/* Quick Ask */}
      <QuickAsk />
    </div>
  );
}
