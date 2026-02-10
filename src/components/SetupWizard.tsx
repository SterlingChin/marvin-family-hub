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
      // First GET to trigger auto-creation of family
      await fetch("/api/family");
      // Then PUT to set the family name
      await fetch("/api/family", {
        method: "PUT",
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF8F0]">
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(180,140,100,0.12)] p-8 w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s === step ? "bg-[#6366F1]" : s < step ? "bg-[#86EFAC]" : "bg-[#E7E5E4]"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-2">🤖</div>
            <h1 className="text-2xl font-bold text-[#292524]">Hi there! I&apos;m Marvin.</h1>
            <p className="text-[#78716C] leading-relaxed">
              I&apos;m your family&apos;s AI assistant. I help with schedules, reminders,
              meal planning, and more — like a helpful friend who never forgets anything.
            </p>
            <div className="bg-[#FFFBF5] rounded-xl p-4 text-sm text-[#78716C] border border-[#F5F0EB]">
              <p className="font-medium text-[#292524] mb-1">🔒 Your data is yours</p>
              <p>Everything is stored securely and privately. You&apos;re always in control.</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#5558E6] transition-colors"
            >
              Nice to meet you! Let&apos;s go →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <h2 className="text-xl font-bold text-[#292524]">What should I call your family?</h2>
              <p className="text-sm text-[#78716C] mt-1">This is how I&apos;ll greet you.</p>
            </div>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., The Johnsons"
              className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-3 text-[#78716C] rounded-xl font-medium hover:bg-[#F5F0EB] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!familyName.trim()}
                className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#5558E6] disabled:opacity-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">✨</div>
              <h2 className="text-xl font-bold text-[#292524]">Who&apos;s in the family?</h2>
              <p className="text-sm text-[#78716C] mt-1">I&apos;ll remember everyone by name.</p>
            </div>
            {members.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => updateMember(i, "role", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
                    >
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                    </select>
                    <input
                      type="number"
                      value={m.age}
                      onChange={(e) => updateMember(i, "age", e.target.value)}
                      placeholder="Age"
                      className="w-20 px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
                    />
                  </div>
                </div>
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} className="text-[#A8A29E] hover:text-red-500 mt-2">✕</button>
                )}
              </div>
            ))}
            <button onClick={addMember} className="text-sm text-[#6366F1] hover:underline">+ Add another member</button>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 text-[#78716C] rounded-xl font-medium hover:bg-[#F5F0EB] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!members.some((m) => m.name.trim())}
                className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#5558E6] disabled:opacity-50 transition-colors"
              >
                Almost done →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-[#292524]">You&apos;re all set, {familyName}!</h2>
            <p className="text-[#78716C]">Here&apos;s what I can help with:</p>
            <div className="text-left space-y-3 bg-[#FFFBF5] rounded-xl p-4 border border-[#F5F0EB]">
              <div className="flex items-start gap-3">
                <span className="text-lg">💬</span>
                <div>
                  <p className="font-medium text-[#292524] text-sm">Chat anytime</p>
                  <p className="text-xs text-[#78716C]">Ask me anything — meal ideas, homework help, scheduling</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⏰</span>
                <div>
                  <p className="font-medium text-[#292524] text-sm">Reminders</p>
                  <p className="text-xs text-[#78716C]">I&apos;ll help you keep track of what&apos;s coming up</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🧹</span>
                <div>
                  <p className="font-medium text-[#292524] text-sm">Chores</p>
                  <p className="text-xs text-[#78716C]">Assign and track household tasks together</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="font-medium text-[#292524] text-sm">Family memory</p>
                  <p className="text-xs text-[#78716C]">I learn about your family to give better advice</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#5558E6] disabled:opacity-50 transition-colors"
            >
              {loading ? "Setting things up..." : "Take me to the hub! 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
