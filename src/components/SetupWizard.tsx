"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AvatarPicker from "./AvatarPicker";

interface MemberInput {
  name: string;
  role: string;
  age: string;
  avatar: string;
}

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<MemberInput[]>([{ name: "", role: "parent", age: "", avatar: "👤" }]);
  const [avatarStep, setAvatarStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const addMember = () => setMembers([...members, { name: "", role: "child", age: "", avatar: "👤" }]);
  const updateMember = (i: number, field: keyof MemberInput, value: string) => {
    const updated = [...members];
    updated[i] = { ...updated[i], [field]: value };
    setMembers(updated);
  };
  const removeMember = (i: number) => {
    if (members.length > 1) setMembers(members.filter((_, idx) => idx !== i));
  };

  const validMembers = members.filter(m => m.name.trim());

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch("/api/family");
      await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName }),
      });
      for (const m of members) {
        if (m.name.trim()) {
          await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: m.name, role: m.role, age: m.age ? parseInt(m.age) : null, avatar: m.avatar }),
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F0F0F]">
      <div className="glass-card p-8 w-full max-w-md bg-[#1A1A1A]/80">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s === step ? "bg-[#818CF8]" : s < step ? "bg-[#86EFAC]" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-2">🤖</div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Hi there! I&apos;m Marvin.</h1>
            <p className="text-[#A3A3A3] leading-relaxed">
              I&apos;m your family&apos;s AI assistant. I help with schedules, reminders,
              meal planning, and more — like a helpful friend who never forgets anything.
            </p>
            <div className="glass-card p-4 text-sm text-[#A3A3A3]">
              <p className="font-medium text-[#F5F5F5] mb-1">🔒 Your data is yours</p>
              <p>Everything is stored securely and privately. You&apos;re always in control.</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] transition-colors"
            >
              Nice to meet you! Let&apos;s go →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <h2 className="text-xl font-bold text-[#F5F5F5]">What should I call your family?</h2>
              <p className="text-sm text-[#A3A3A3] mt-1">This is how I&apos;ll greet you.</p>
            </div>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., The Johnsons"
              className="w-full px-4 py-3 glass-input text-sm"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="px-4 py-3 text-[#A3A3A3] rounded-xl font-medium hover:bg-white/5 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!familyName.trim()}
                className="flex-1 py-3 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors"
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
              <h2 className="text-xl font-bold text-[#F5F5F5]">Who&apos;s in the family?</h2>
              <p className="text-sm text-[#A3A3A3] mt-1">I&apos;ll remember everyone by name.</p>
            </div>
            {members.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 glass-input text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => updateMember(i, "role", e.target.value)}
                      className="flex-1 px-3 py-2 glass-input text-sm"
                    >
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                    </select>
                    <input
                      type="number"
                      value={m.age}
                      onChange={(e) => updateMember(i, "age", e.target.value)}
                      placeholder="Age"
                      className="w-20 px-3 py-2 glass-input text-sm"
                    />
                  </div>
                </div>
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} className="text-[#A3A3A3] hover:text-red-400 mt-2">✕</button>
                )}
              </div>
            ))}
            <button onClick={addMember} className="text-sm text-[#818CF8] hover:text-[#A5B4FC]">+ Add another member</button>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-3 text-[#A3A3A3] rounded-xl font-medium hover:bg-white/5 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => { setAvatarStep(0); setStep(3); }}
                disabled={!members.some((m) => m.name.trim())}
                className="flex-1 py-3 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors"
              >
                Pick avatars →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-[#F5F5F5]">
                Pick an avatar for {validMembers[avatarStep]?.name || "member"}
              </h2>
              <p className="text-sm text-[#A3A3A3] mt-1">
                {avatarStep + 1} of {validMembers.length}
              </p>
            </div>

            <AvatarPicker
              selected={validMembers[avatarStep]?.avatar || "👤"}
              onSelect={(emoji) => {
                const memberIndex = members.findIndex(m => m.name === validMembers[avatarStep]?.name);
                if (memberIndex >= 0) updateMember(memberIndex, "avatar", emoji);
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => avatarStep > 0 ? setAvatarStep(avatarStep - 1) : setStep(2)}
                className="px-4 py-3 text-[#A3A3A3] rounded-xl font-medium hover:bg-white/5 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (avatarStep < validMembers.length - 1) {
                    setAvatarStep(avatarStep + 1);
                  } else {
                    setStep(4);
                  }
                }}
                className="flex-1 py-3 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] transition-colors"
              >
                {avatarStep < validMembers.length - 1 ? "Next →" : "Almost done →"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">You&apos;re all set, {familyName}!</h2>
            <p className="text-[#A3A3A3]">Here&apos;s your family:</p>

            <div className="flex justify-center gap-4 py-4">
              {validMembers.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-2xl">
                    {m.avatar}
                  </div>
                  <span className="text-xs text-[#A3A3A3]">{m.name}</span>
                </div>
              ))}
            </div>

            <div className="text-left space-y-3 glass-card p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">🏠</span>
                <div>
                  <p className="font-medium text-[#F5F5F5] text-sm">Ambient dashboard</p>
                  <p className="text-xs text-[#A3A3A3]">Marvin IS your dashboard — intelligent and proactive</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⏰</span>
                <div>
                  <p className="font-medium text-[#F5F5F5] text-sm">Reminders & Chores</p>
                  <p className="text-xs text-[#A3A3A3]">Track tasks and assignments for everyone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="font-medium text-[#F5F5F5] text-sm">Family memory</p>
                  <p className="text-xs text-[#A3A3A3]">Marvin learns about your family over time</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full py-3 bg-[#818CF8] text-white rounded-xl font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors"
            >
              {loading ? "Setting things up..." : "Take me to the hub! 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
