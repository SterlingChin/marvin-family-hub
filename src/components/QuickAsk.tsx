"use client";

import { useState } from "react";

export default function QuickAsk() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setResponse(data.message || data.error || "No response");
    } catch {
      setResponse("Couldn't reach Marvin right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(180,140,100,0.08)] border border-[#F5F0EB] p-4">
      <h3 className="font-semibold text-[#292524] mb-3">🤖 Ask Marvin</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask Marvin anything..."
          className="flex-1 px-4 py-2 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
        />
        <button
          onClick={handleAsk}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-medium hover:bg-[#5558E6] disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
      {response && (
        <div className="mt-3 p-3 bg-[#6366F1]/5 rounded-xl text-sm text-[#292524]">
          <span className="mr-1">🤖</span>{response}
        </div>
      )}
    </div>
  );
}
