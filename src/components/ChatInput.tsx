"use client";

import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder = "Type a message..." }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const msg = text.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setText("");
  };

  return (
    <div className="flex gap-2 p-3 bg-white border-t border-gray-100">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
