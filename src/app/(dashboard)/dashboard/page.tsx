"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFamily } from "../layout";
import MarvinInput from "@/components/MarvinInput";
import Modal from "@/components/Modal";
import type { FamilyMember } from "@/components/FamilyMemberCard";
import type { Reminder } from "@/components/ReminderItem";

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

const insights = [
  { icon: "💡", text: "No events scheduled for tomorrow — a great day to catch up!", accent: "border-l-[#818CF8]" },
  { icon: "📋", text: "3 chores are still open from yesterday. Want me to reassign them?", accent: "border-l-[#FB923C]" },
  { icon: "⭐", text: "Everyone completed their tasks last Friday. Great teamwork!", accent: "border-l-[#86EFAC]" },
];

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
    setChores(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/chores/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true }) }).catch(() => {});
  };

  const toggleReminder = async (id: string, completed: boolean) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
    await fetch(`/api/reminders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) }).catch(() => {});
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Greeting */}
      {selectedMember && selectedMemberData ? (
        <div className="animate-fade-in">
          <button onClick={() => setSelectedMember(null)} className="text-sm text-[#818CF8] hover:text-[#A5B4FC] mb-3 flex items-center gap-1">
            ← Back to Family
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl glow-ring">
              {(selectedMemberData as FamilyMember & { avatar?: string }).avatar || "👤"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F5]">{selectedMemberData.name}&apos;s Day</h1>
              <p className="text-[#A3A3A3] text-sm capitalize">{selectedMemberData.role}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm opacity-60">🤖</span>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">
              {getGreeting()}, {family.name}.
            </h1>
          </div>
          <p className="text-[#A3A3A3] text-sm">Here&apos;s what&apos;s happening today.</p>
        </div>
      )}

      {/* Marvin Input */}
      {!selectedMember && <MarvinInput />}

      {/* Family Members Row */}
      {!selectedMember && members.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider mb-3">Family</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedMember(null)}
              className={`flex flex-col items-center gap-2 shrink-0 group`}
            >
              <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-[#818CF8] flex items-center justify-center text-sm font-medium text-[#818CF8] glow-ring">
                All
              </div>
              <span className="text-xs text-[#A3A3A3]">Everyone</span>
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m.id)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className={`w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl transition-all ${
                  selectedMember === m.id ? "glow-ring border-2 border-[#818CF8]" : "border border-white/10 group-hover:border-white/20"
                }`}>
                  {(m as FamilyMember & { avatar?: string }).avatar || m.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-[#A3A3A3] group-hover:text-[#F5F5F5] transition-colors">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Marvin's Insights */}
      {!selectedMember && (
        <div>
          <h3 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider mb-3">Marvin&apos;s Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((insight, i) => (
              <div key={i} className={`glass-card p-4 border-l-2 ${insight.accent} animate-fade-in-up`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">{insight.icon}</span>
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chores */}
        <div className="glass-card p-5 glow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#F5F5F5] flex items-center gap-2">
              🧹 {selectedMember ? `${selectedMemberData?.name}'s Chores` : "Today's Chores"}
            </h3>
            <a href="/chores" className="text-xs text-[#818CF8] hover:text-[#A5B4FC]">View all →</a>
          </div>
          <div className="space-y-2">
            {filteredChores.length > 0 ? filteredChores.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <input
                  type="checkbox"
                  onChange={() => toggleChore(c.id)}
                  className="w-5 h-5 rounded-md accent-[#818CF8] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#F5F5F5]">{c.title}</p>
                  {c.assigned_to && !selectedMember && (
                    <p className="text-xs text-[#A3A3A3]">{getMemberAvatar(c.assigned_to)} {c.assigned_to}</p>
                  )}
                </div>
                <span className="text-xs text-[#A3A3A3] capitalize opacity-0 group-hover:opacity-100 transition-opacity">{c.frequency}</span>
              </div>
            )) : (
              <p className="text-sm text-[#A3A3A3] py-4 text-center">All done! 🎉</p>
            )}
          </div>
        </div>

        {/* Reminders */}
        <div className="glass-card p-5 glow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#F5F5F5] flex items-center gap-2">
              ⏰ {selectedMember ? `${selectedMemberData?.name}'s Reminders` : "Upcoming Reminders"}
            </h3>
            <a href="/reminders" className="text-xs text-[#818CF8] hover:text-[#A5B4FC]">View all →</a>
          </div>
          <div className="space-y-2">
            {filteredReminders.length > 0 ? filteredReminders.map(r => {
              const due = r.due_date ? new Date(r.due_date) : null;
              const isPast = due && due < new Date();
              return (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isPast ? "bg-[#FB923C]/10 border-[#FB923C]/20" : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}>
                  <input
                    type="checkbox"
                    checked={r.completed}
                    onChange={() => toggleReminder(r.id, !r.completed)}
                    className="w-5 h-5 rounded-md accent-[#818CF8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#F5F5F5]">{r.title}</p>
                    <p className="text-xs text-[#A3A3A3]">
                      {due ? `${due.toLocaleDateString()} ${due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "No date"}
                      {r.assigned_to && !selectedMember && ` · ${getMemberAvatar(r.assigned_to)} ${r.assigned_to}`}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-[#A3A3A3] py-4 text-center">No upcoming reminders 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setReminderModalOpen(true)} className="glass-card-hover px-5 py-2.5 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-2">
          ⏰ Add Reminder
        </button>
        <button onClick={() => setChoreModalOpen(true)} className="glass-card-hover px-5 py-2.5 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-2">
          🧹 Add Chore
        </button>
        <a href="/settings" className="glass-card-hover px-5 py-2.5 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-2">
          ⚙️ Family Settings
        </a>
      </div>

      {/* Add Reminder Modal */}
      <Modal open={reminderModalOpen} onClose={() => setReminderModalOpen(false)} title="Add Reminder">
        <div className="space-y-3">
          <input value={reminderForm.title} onChange={e => setReminderForm({ ...reminderForm, title: e.target.value })} placeholder="What needs to be done?" className="w-full px-4 py-2.5 glass-input text-sm" />
          <input type="datetime-local" value={reminderForm.due_date} onChange={e => setReminderForm({ ...reminderForm, due_date: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm" />
          <select value={reminderForm.assigned_to} onChange={e => setReminderForm({ ...reminderForm, assigned_to: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="">Assign to...</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <button onClick={handleAddReminder} disabled={!reminderForm.title.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors">
            Add Reminder
          </button>
        </div>
      </Modal>

      {/* Add Chore Modal */}
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
          <button onClick={handleAddChore} disabled={!choreForm.title.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors">
            Add Chore
          </button>
        </div>
      </Modal>
    </div>
  );
}
