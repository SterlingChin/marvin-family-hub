"use client";

import { useEffect, useState } from "react";
import ReminderItem from "@/components/ReminderItem";
import type { Reminder } from "@/components/ReminderItem";
import Modal from "@/components/Modal";
import type { FamilyMember } from "@/components/FamilyMemberCard";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", due_date: "", assigned_to: "" });

  const fetchReminders = () => {
    fetch("/api/reminders").then(r => r.ok ? r.json() : { reminders: [] }).then(d => setReminders(d.reminders || [])).catch(() => {});
  };
  const fetchMembers = () => {
    fetch("/api/members").then(r => r.ok ? r.json() : { members: [] }).then(d => setMembers(d.members || [])).catch(() => {});
  };

  useEffect(() => { fetchReminders(); fetchMembers(); }, []);

  const upcoming = reminders.filter(r => !r.completed);
  const completed = reminders.filter(r => r.completed);

  const handleToggle = async (id: string, val: boolean) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: val } : r));
    await fetch(`/api/reminders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: val }) }).catch(() => {});
  };

  const handleDelete = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    await fetch(`/api/reminders/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const handleAdd = async () => {
    await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModalOpen(false);
    setForm({ title: "", due_date: "", assigned_to: "" });
    fetchReminders();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Reminders</h1>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] transition-colors">
          + Add Reminder
        </button>
      </div>

      <div>
        <h2 className="font-semibold text-[#F5F5F5] mb-3">Upcoming</h2>
        <div className="space-y-2">
          {upcoming.length > 0 ? upcoming.map(r => <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} onDelete={handleDelete} />)
            : <p className="text-sm text-[#A3A3A3]">No upcoming reminders.</p>}
        </div>
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#A3A3A3] mb-3">Completed</h2>
          <div className="space-y-2">
            {completed.map(r => <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Reminder">
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className="w-full px-4 py-2.5 glass-input text-sm" />
          <input type="datetime-local" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm" />
          <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="">Assign to...</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <button onClick={handleAdd} disabled={!form.title.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors">
            Add Reminder
          </button>
        </div>
      </Modal>
    </div>
  );
}
