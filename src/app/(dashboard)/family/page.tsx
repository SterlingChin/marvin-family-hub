"use client";

import { useEffect, useState } from "react";
import FamilyMemberCard from "@/components/FamilyMemberCard";
import type { FamilyMember } from "@/components/FamilyMemberCard";
import AvatarPicker from "@/components/AvatarPicker";
import Modal from "@/components/Modal";

const emptyMember = { name: "", role: "parent", age: "", school: "", work: "", notes: "", avatar: "👤" };

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyMember);

  const fetchMembers = () => {
    fetch("/api/members").then(r => r.ok ? r.json() : { members: [] }).then(d => setMembers(d.members || [])).catch(() => {});
  };

  useEffect(() => { fetchMembers(); }, []);

  const openAdd = () => { setForm(emptyMember); setEditingId(null); setModalOpen(true); };
  const openEdit = (m: FamilyMember) => {
    setForm({ name: m.name, role: m.role, age: m.age?.toString() || "", school: m.school || "", work: m.work || "", notes: m.notes || "", avatar: m.avatar || "👤" });
    setEditingId(m.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const body = { ...form, age: form.age ? parseInt(form.age) : null };
    if (editingId) {
      await fetch(`/api/members/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setModalOpen(false);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this family member?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    fetchMembers();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Family Members</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] transition-colors press-scale touch-target animate-fade-in">
          + Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m, i) => (
          <div key={m.id} className={`stagger-item animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <FamilyMemberCard member={m} index={i} onEdit={openEdit} onDelete={handleDelete} />
          </div>
        ))}
      </div>
      {members.length === 0 && <p className="text-[#A3A3A3] text-center py-8">No family members yet. Add your first!</p>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Member" : "Add Member"}>
        <div className="space-y-4">
          <AvatarPicker selected={form.avatar} onSelect={(emoji) => setForm({ ...form, avatar: emoji })} />
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-4 py-2.5 glass-input text-sm" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 glass-input text-sm">
            <option value="parent">Parent</option>
            <option value="child">Child</option>
          </select>
          <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" className="w-full px-4 py-2.5 glass-input text-sm" />
          <input value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} placeholder="School" className="w-full px-4 py-2.5 glass-input text-sm" />
          <input value={form.work} onChange={e => setForm({ ...form, work: e.target.value })} placeholder="Work" className="w-full px-4 py-2.5 glass-input text-sm" />
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={3} className="w-full px-4 py-2.5 glass-input text-sm resize-none" />
          <button onClick={handleSave} disabled={!form.name.trim()} className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors">
            {editingId ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
