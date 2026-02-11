"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFamily } from "../layout";
import MarvinInput from "@/components/MarvinInput";
import Modal from "@/components/Modal";
import ScheduleCard from "@/components/ScheduleCard";
import type { FamilyMember } from "@/components/FamilyMemberCard";
import type { Reminder } from "@/components/ReminderItem";

interface Chore {
  id: string;
  title: string;
  assigned_to?: string;
  frequency: string;
  completed: boolean;
}

interface FeedItem {
  id: string;
  type: "chore" | "reminder";
  title: string;
  assigned_to?: string;
  completed: boolean;
  time?: Date | null;
  frequency?: string;
  isPast?: boolean;
}

const PROACTIVE_MESSAGES = [
  "No events tomorrow — good day to catch up on things.",
  "Taylor's science project is due Thursday.",
  "The weather looks clear for a family walk this evening.",
  "Everyone's chores are on track this week. Nice job! 🎉",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const { family, loading } = useFamily();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [choreModalOpen, setChoreModalOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState({ title: "", due_date: "", assigned_to: "" });
  const [choreForm, setChoreForm] = useState({ title: "", assigned_to: "", frequency: "daily" });
  const [shrinkingIds, setShrinkingIds] = useState<Set<string>>(new Set());
  const [proactiveIdx, setProactiveIdx] = useState(0);
  const [proactiveFading, setProactiveFading] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  // Rotate proactive messages
  useEffect(() => {
    const interval = setInterval(() => {
      setProactiveFading(true);
      setTimeout(() => {
        setProactiveIdx(prev => (prev + 1) % PROACTIVE_MESSAGES.length);
        setProactiveFading(false);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && !family) router.push("/setup");
  }, [loading, family, router]);

  const fetchData = useCallback(() => {
    if (!family) return;
    fetch("/api/members").then(r => r.ok ? r.json() : { members: [] }).then(d => setMembers(d.members || [])).catch(() => {});
    fetch("/api/reminders").then(r => r.ok ? r.json() : { reminders: [] }).then(d => setReminders((d.reminders || []).filter((r: Reminder) => !r.completed).slice(0, 5))).catch(() => {});
    fetch("/api/chores?status=active").then(r => r.ok ? r.json() : { chores: [] }).then(d => setChores((d.chores || []).filter((c: Chore) => !c.completed).slice(0, 8))).catch(() => {});
  }, [family]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleChore = async (id: string) => {
    setShrinkingIds(prev => new Set(prev).add(id));
    await fetch(`/api/chores/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true }) }).catch(() => {});
    setTimeout(() => {
      setChores(prev => prev.filter(c => c.id !== id));
      setShrinkingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 300);
  };

  const toggleReminder = async (id: string, completed: boolean) => {
    if (completed) {
      setShrinkingIds(prev => new Set(prev).add(id));
      await fetch(`/api/reminders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) }).catch(() => {});
      setTimeout(() => {
        setReminders(prev => prev.filter(r => r.id !== id));
        setShrinkingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      }, 300);
    } else {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
      await fetch(`/api/reminders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) }).catch(() => {});
    }
  };

  const handleSelectMember = (id: string | null) => {
    setSelectedMember(id);
    setContentKey(prev => prev + 1);
  };

  const handleAddReminder = async () => {
    await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reminderForm) });
    setReminderModalOpen(false);
    setReminderForm({ title: "", due_date: "", assigned_to: "" });
    fetchData();
  };

  const handleAddChore = async () => {
    await fetch("/api/chores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(choreForm) });
    setChoreModalOpen(false);
    setChoreForm({ title: "", assigned_to: "", frequency: "daily" });
    fetchData();
  };

  if (loading || !family) return null;

  const selectedMemberData = selectedMember ? members.find(m => m.id === selectedMember) : null;
  const filteredChores = selectedMember ? chores.filter(c => c.assigned_to === selectedMemberData?.name) : chores;
  const filteredReminders = selectedMember ? reminders.filter(r => r.assigned_to === selectedMemberData?.name) : reminders;

  const getMemberAvatar = (name?: string) => {
    const m = members.find(mem => mem.name === name);
    return (m as FamilyMember & { avatar?: string })?.avatar || "👤";
  };

  const feedItems: FeedItem[] = [
    ...filteredChores.map(c => ({
      id: c.id,
      type: "chore" as const,
      title: c.title,
      assigned_to: c.assigned_to,
      completed: c.completed,
      time: null,
      frequency: c.frequency,
    })),
    ...filteredReminders.map(r => {
      const due = r.due_date ? new Date(r.due_date) : null;
      return {
        id: r.id,
        type: "reminder" as const,
        title: r.title,
        assigned_to: r.assigned_to,
        completed: r.completed,
        time: due,
        isPast: due ? due < new Date() : false,
      };
    }),
  ].sort((a, b) => {
    if (a.time && b.time) return a.time.getTime() - b.time.getTime();
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-6 lg:px-12">
      {/* Greeting */}
      {selectedMember && selectedMemberData ? (
        <div className="pt-6 pb-4 animate-fade-in">
          <button onClick={() => handleSelectMember(null)} className="text-sm text-[#818CF8] hover:text-[#A5B4FC] mb-3 flex items-center gap-1 press-scale touch-target">
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl glow-ring transition-transform duration-300 scale-110">
              {(selectedMemberData as FamilyMember & { avatar?: string }).avatar || "👤"}
            </div>
            <div>
              <p className="text-lg text-[#F5F5F5]">{selectedMemberData.name}</p>
              <p className="text-[#A3A3A3] text-sm capitalize">{selectedMemberData.role}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-6 pb-4 animate-fade-in">
          <p className="text-sm text-[#A3A3A3]">{getGreeting()}.</p>
          <p className="text-sm text-[#A3A3A3]">{formatDate()}</p>
        </div>
      )}

      {/* Family Members Row */}
      {!selectedMember && members.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4 swipeable">
          <button
            onClick={() => handleSelectMember(null)}
            className="flex flex-col items-center gap-1.5 shrink-0 stagger-item animate-bounce-in stagger-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-[#818CF8] flex items-center justify-center text-xs font-medium text-[#818CF8]">
              All
            </div>
            <span className="text-xs text-[#A3A3A3]">Everyone</span>
          </button>
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => handleSelectMember(m.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 group stagger-item animate-bounce-in stagger-${Math.min(i + 2, 8)}`}
            >
              <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl transition-all ${
                selectedMember === m.id ? "glow-ring border-2 border-[#818CF8] scale-110" : "border border-white/10 group-hover:border-white/20"
              }`}>
                {(m as FamilyMember & { avatar?: string }).avatar || m.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-[#A3A3A3] group-hover:text-[#F5F5F5] transition-colors">{m.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Two-column grid */}
      <div key={contentKey} className="flex-1 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Today's items */}
        <div className="stagger-item animate-fade-in-up stagger-3">
          <div className="glass-card p-2 glow-card">
            <div className="px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#A3A3A3]">Today</h3>
              <span className="text-xs text-[#A3A3A3]">{feedItems.length} items</span>
            </div>
            {feedItems.length > 0 ? feedItems.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5 rounded-lg press-scale ${
                  item.isPast ? "bg-[#FB923C]/5" : ""
                } ${i < feedItems.length - 1 ? "border-b border-white/5" : ""} ${
                  shrinkingIds.has(item.id) ? "animate-shrink-out" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => item.type === "chore" ? toggleChore(item.id) : toggleReminder(item.id, !item.completed)}
                  className="w-5 h-5 rounded accent-[#818CF8] shrink-0 touch-target"
                />
                <p className="flex-1 text-sm text-[#F5F5F5]">{item.title}</p>
                {item.assigned_to && !selectedMember && (
                  <span className="text-sm shrink-0">{getMemberAvatar(item.assigned_to)}</span>
                )}
                {item.time && (
                  <span className={`text-xs shrink-0 ${item.isPast ? "text-[#FB923C]" : "text-[#A3A3A3]"}`}>
                    {item.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            )) : (
              <p className="text-sm text-[#A3A3A3] py-8 text-center">Nothing for today.</p>
            )}
          </div>
        </div>

        {/* Right: Schedule + Marvin's proactive card + input */}
        <div className="flex flex-col gap-4 stagger-item animate-fade-in-up stagger-5">
          {/* Google Calendar Events */}
          <ScheduleCard />

          {/* Proactive insight */}
          <div className="glass-card p-5 glow-card">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">🤖</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#818CF8] mb-1">Marvin says</p>
                <p
                  className={`text-sm text-[#F5F5F5] leading-relaxed transition-opacity duration-300 ${
                    proactiveFading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {PROACTIVE_MESSAGES[proactiveIdx]}
                </p>
              </div>
            </div>
          </div>

          {/* Marvin Input */}
          <MarvinInput />
        </div>
      </div>

      {/* Modals */}
      <Modal open={reminderModalOpen} onClose={() => setReminderModalOpen(false)} title="Add Reminder">
        <div className="space-y-3">
          <input value={reminderForm.title} onChange={e => setReminderForm({ ...reminderForm, title: e.target.value })} placeholder="What needs to be done?" className="w-full px-4 py-2.5 glass-input text-sm" />
          <input type="datetime-local" value={reminderForm.due_date} onChange={e => setReminderForm({ ...reminderForm, due_date: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm" />
          <select value={reminderForm.assigned_to} onChange={e => setReminderForm({ ...reminderForm, assigned_to: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="">Assign to...</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <button onClick={handleAddReminder} disabled={!reminderForm.title.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors press-scale">
            Add Reminder
          </button>
        </div>
      </Modal>

      <Modal open={choreModalOpen} onClose={() => setChoreModalOpen(false)} title="Add Chore">
        <div className="space-y-3">
          <input value={choreForm.title} onChange={e => setChoreForm({ ...choreForm, title: e.target.value })} placeholder="What needs to be done?" className="w-full px-4 py-2.5 glass-input text-sm" />
          <select value={choreForm.assigned_to} onChange={e => setChoreForm({ ...choreForm, assigned_to: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="">Assign to...</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <select value={choreForm.frequency} onChange={e => setChoreForm({ ...choreForm, frequency: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="one-time">One-time</option>
          </select>
          <button onClick={handleAddChore} disabled={!choreForm.title.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors press-scale">
            Add Chore
          </button>
        </div>
      </Modal>
    </div>
  );
}
