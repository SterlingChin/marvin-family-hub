"use client";

import { useState } from "react";

interface Props {
  onResponse?: (response: string) => void;
}

export default function MarvinInput({ onResponse }: Props) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleAsk = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setResponse("");
    setVisible(false);
    try {
      // Create a conversation for dashboard queries
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Dashboard Query" }),
      });
      const convData = await convRes.json();
      const conversationId = convData.conversation?.id;

      if (!conversationId) {
        setResponse("Couldn't start a conversation. Please try again.");
        setVisible(true);
        return;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: q }),
      });
      const data = await res.json();
      const msg = data.message || data.error || "No response";
      setResponse(msg);
      setVisible(true);
      setQuery("");
      onResponse?.(msg);

      // Auto-dismiss after 30s
      setTimeout(() => setVisible(false), 30000);
    } catch {
      setResponse("Couldn't reach Marvin right now.");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input bar */}
      <div className="glass-card p-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask Marvin anything..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-transparent text-[#F5F5F5] placeholder-[#A3A3A3] text-sm focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleAsk}
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Ask"
          )}
        </button>
      </div>

      {/* Response card */}
      {visible && response && (
        <div className="glass-card p-4 border-l-2 border-l-[#818CF8] animate-fade-in-up">
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0">🤖</span>
            <p className="text-sm text-[#F5F5F5] leading-relaxed flex-1 whitespace-pre-wrap">{response}</p>
            <button
              onClick={() => setVisible(false)}
              className="text-[#A3A3A3] hover:text-white text-xs shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
