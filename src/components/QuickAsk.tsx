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
      setResponse(data.response || data.error || "No response");
    } catch {
      setResponse("Couldn't reach Marvin right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-[#1F2937] mb-3">🤖 Ask Marvin</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask Marvin anything..."
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={handleAsk}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
      {response && (
        <div className="mt-3 p-3 bg-purple-50 rounded-xl text-sm text-[#1F2937]">
          <span className="mr-1">🤖</span>{response}
        </div>
      )}
    </div>
  );
}
