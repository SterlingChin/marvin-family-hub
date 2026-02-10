"use client";

import { useEffect, useState } from "react";
import { useFamily } from "../layout";

interface ContextEntry {
  id: string;
  key: string;
  value: string;
}

export default function SettingsPage() {
  const { family, refresh } = useFamily();
  const [familyName, setFamilyName] = useState("");
  const [contexts, setContexts] = useState<ContextEntry[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family) setFamilyName(family.name);
  }, [family]);

  useEffect(() => {
    fetch("/api/context").then(r => r.ok ? r.json() : { contexts: [] }).then(d => setContexts(d.contexts || [])).catch(() => {});
  }, []);

  const saveFamilyName = async () => {
    setSaving(true);
    await fetch("/api/family", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: familyName }) }).catch(() => {});
    refresh();
    setSaving(false);
  };

  const addContext = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const res = await fetch("/api/context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: newKey, value: newValue }) });
    if (res.ok) {
      const data = await res.json();
      setContexts(prev => [...prev, data.context || { id: Date.now().toString(), key: newKey, value: newValue }]);
      setNewKey("");
      setNewValue("");
    }
  };

  const deleteContext = async (id: string) => {
    await fetch(`/api/context/${id}`, { method: "DELETE" }).catch(() => {});
    setContexts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#F5F5F5]">Settings</h1>

      {/* Family Name */}
      <div className="glass-card p-6 space-y-3">
        <h2 className="font-semibold text-[#F5F5F5]">Family Name</h2>
        <div className="flex gap-2">
          <input
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            className="flex-1 px-4 py-2.5 glass-input text-sm"
          />
          <button onClick={saveFamilyName} disabled={saving} className="px-4 py-2 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Family Context */}
      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-[#F5F5F5]">Things Marvin Should Know</h2>
          <p className="text-sm text-[#A3A3A3] mt-1">Add context about your family so Marvin can give better answers.</p>
        </div>

        <div className="space-y-3">
          {contexts.map(ctx => (
            <div key={ctx.id} className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#F5F5F5]">{ctx.key}</p>
                <p className="text-sm text-[#A3A3A3] mt-0.5">{ctx.value}</p>
              </div>
              <button onClick={() => deleteContext(ctx.id)} className="text-[#A3A3A3]/40 hover:text-red-400 text-sm shrink-0">🗑️</button>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-4 space-y-2">
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Label (e.g., Dietary Preferences)" className="w-full px-4 py-2.5 glass-input text-sm" />
          <textarea value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Details..." rows={2} className="w-full px-4 py-2.5 glass-input text-sm resize-none" />
          <button onClick={addContext} disabled={!newKey.trim() || !newValue.trim()} className="px-4 py-2 bg-[#FB923C] text-white rounded-xl text-sm font-medium hover:bg-[#F97316] disabled:opacity-50 transition-colors">
            + Add Context
          </button>
        </div>
      </div>
      {/* Background */}
      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-[#F5F5F5]">Background</h2>
          <p className="text-sm text-[#A3A3A3] mt-1">Choose your dashboard background image.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-xl overflow-hidden border-2 border-[#818CF8] aspect-video">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60" alt="Mountains" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-white text-center">Mountains (Active)</div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video opacity-50">
            <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=60" alt="Forest" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-white text-center">Dark Forest</div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video opacity-50">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=60" alt="Cozy" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-white text-center">Cozy Evening</div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video opacity-50">
            <img src="https://images.unsplash.com/photo-1475274047050-1d0c55b0033a?w=400&q=60" alt="Night Sky" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-white text-center">Night Sky</div>
          </div>
        </div>
        <p className="text-xs text-[#A3A3A3]">More backgrounds coming soon.</p>
      </div>
    </div>
  );
}
