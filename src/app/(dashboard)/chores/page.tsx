"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import type { FamilyMember } from "@/components/FamilyMemberCard";

interface Chore {
  id: string;
  title: string;
  assigned_to?: string;
  frequency: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", assigned_to: "", frequency: "daily" });

  const fetchChores = () => {
    fetch("/api/chores").then(r => r.ok ? r.json() : { chores: [] }).then(d => setChores(d.chores || [])).catch(() => {});
  };
  const fetchMembers = () => {
    fetch("/api/members").then(r => r.ok ? r.json() : { members: [] }).then(d => setMembers(d.members || [])).catch(() => {});
  };

  useEffect(() => { fetchChores(); fetchMembers(); }, []);

  const todayChores = chores.filter(c => !c.completed && (c.frequency === "daily" || c.frequency === "one-time"));
  const weeklyChores = chores.filter(c => !c.completed && c.frequency === "weekly");
  const completedToday = chores.filter(c => {
    if (!c.completed || !c.completed_at) return false;
    const d = new Date(c.completed_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const toggleChore = async (id: string, completed: boolean) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, completed, completed_at: completed ? new Date().toISOString() : undefined } : c));
    await fetch(`/api/chores/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) }).catch(() => {});
  };

  const deleteChore = async (id: string) => {
    setChores(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/chores/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const handleAdd = async () => {
    await fetch("/api/chores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModalOpen(false);
    setForm({ title: "", assigned_to: "", frequency: "daily" });
    fetchChores();
  };

  const getMemberAvatar = (name?: string) => {
    const m = members.find(mem => mem.name === name);
    return m?.avatar || "👤";
  };

  const ChoreItem = ({ chore, staggerClass }: { chore: Chore; staggerClass?: string }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors press-scale ${
      chore.completed ? "bg-white/5 border-white/5 opacity-60" : "glass-card hover:bg-white/10"
    } ${staggerClass || ""}`}>
      <input
        type="checkbox"
        checked={chore.completed}
        onChange={() => toggleChore(chore.id, !chore.completed)}
        className="w-5 h-5 rounded-md accent-[#818CF8] shrink-0 touch-target"
      />
      {chore.assigned_to && (
        <span className="text-lg shrink-0">{getMemberAvatar(chore.assigned_to)}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${chore.completed ? "line-through text-[#A3A3A3]" : "text-[#F5F5F5]"}`}>
          {chore.title}
        </p>
        <p className="text-xs text-[#A3A3A3]">
          {chore.assigned_to && `${chore.assigned_to} · `}
          <span className="capitalize">{chore.frequency}</span>
          {chore.completed_at && ` · Done ${new Date(chore.completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        </p>
      </div>
      <button onClick={() => deleteChore(chore.id)} className="text-[#A3A3A3]/40 hover:text-red-400 text-sm">🗑️</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Chores</h1>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] transition-colors press-scale touch-target">
          + Add Chore
        </button>
      </div>

      <div>
        <h2 className="font-semibold text-[#F5F5F5] mb-3">Today&apos;s Chores</h2>
        <div className="space-y-2">
          {todayChores.length > 0 ? todayChores.map((c, i) => <ChoreItem key={c.id} chore={c} staggerClass={`stagger-item animate-fade-in-up stagger-${Math.min(i + 1, 8)}`} />) : (
            <p className="text-sm text-[#A3A3A3]">All done for today.</p>
          )}
        </div>
      </div>

      {weeklyChores.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#F5F5F5] mb-3">Weekly</h2>
          <div className="space-y-2">
            {weeklyChores.map((c, i) => <ChoreItem key={c.id} chore={c} staggerClass={`stagger-item animate-fade-in-up stagger-${Math.min(i + 1, 8)}`} />)}
          </div>
        </div>
      )}

      {completedToday.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#A3A3A3] mb-3">Completed Today</h2>
          <div className="space-y-2">
            {completedToday.map((c, i) => <ChoreItem key={c.id} chore={c} staggerClass={`stagger-item animate-fade-in-up stagger-${Math.min(i + 1, 8)}`} />)}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Chore">
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className="w-full px-4 py-2.5 glass-input text-sm" />
          <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="">Assign to...</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="one-time">One-time</option>
          </select>
          <button onClick={handleAdd} disabled={!form.title.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors">
            Add Chore
          </button>
        </div>
      </Modal>
    </div>
  );
}
