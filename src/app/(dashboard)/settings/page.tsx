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
      <h1 className="text-2xl font-bold text-[#1F2937]">⚙️ Settings</h1>

      {/* Family Name */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
        <h2 className="font-semibold text-[#1F2937]">Family Name</h2>
        <div className="flex gap-2">
          <input
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button onClick={saveFamilyName} disabled={saving} className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Family Context */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-[#1F2937]">Things Marvin Should Know</h2>
          <p className="text-sm text-gray-400 mt-1">Add context about your family so Marvin can give better answers.</p>
        </div>

        <div className="space-y-3">
          {contexts.map(ctx => (
            <div key={ctx.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1F2937]">{ctx.key}</p>
                <p className="text-sm text-gray-500 mt-0.5">{ctx.value}</p>
              </div>
              <button onClick={() => deleteContext(ctx.id)} className="text-gray-400 hover:text-red-500 text-sm shrink-0">🗑️</button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Label (e.g., Dietary Preferences)" className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          <textarea value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Details..." rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
          <button onClick={addContext} disabled={!newKey.trim() || !newValue.trim()} className="px-4 py-2 bg-[#F59E0B] text-white rounded-xl text-sm font-medium hover:bg-amber-500 disabled:opacity-50 transition-colors">
            + Add Context
          </button>
        </div>
      </div>
    </div>
  );
}
