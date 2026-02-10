"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MemberInput {
  name: string;
  role: string;
  age: string;
}

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<MemberInput[]>([{ name: "", role: "parent", age: "" }]);
  const [loading, setLoading] = useState(false);

  const addMember = () => setMembers([...members, { name: "", role: "child", age: "" }]);
  const updateMember = (i: number, field: keyof MemberInput, value: string) => {
    const updated = [...members];
    updated[i] = { ...updated[i], [field]: value };
    setMembers(updated);
  };
  const removeMember = (i: number) => {
    if (members.length > 1) setMembers(members.filter((_, idx) => idx !== i));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create family
      await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName }),
      });
      // Add members
      for (const m of members) {
        if (m.name.trim()) {
          await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: m.name, role: m.role, age: m.age ? parseInt(m.age) : null }),
          });
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {step === 0 && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🤖</div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Welcome to Marvin!</h1>
            <p className="text-gray-500">Let&apos;s set up your family hub.</p>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1F2937]">What&apos;s your family name?</h2>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., The Johnsons"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!familyName.trim()}
              className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1F2937]">Add your family members</h2>
            {members.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => updateMember(i, "role", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                    </select>
                    <input
                      type="number"
                      value={m.age}
                      onChange={(e) => updateMember(i, "age", e.target.value)}
                      placeholder="Age"
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} className="text-gray-400 hover:text-red-500 mt-2">✕</button>
                )}
              </div>
            ))}
            <button onClick={addMember} className="text-sm text-[#3B82F6] hover:underline">+ Add another member</button>
            <button
              onClick={handleFinish}
              disabled={loading || !members.some((m) => m.name.trim())}
              className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Setting up..." : "Done! Meet Marvin 🤖"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
