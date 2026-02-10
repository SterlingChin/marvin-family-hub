"use client";

import { useState } from "react";

const categories = {
  Animals: ["🐻", "🦊", "🐱", "🐶", "🐼", "🦁", "🐨", "🐸", "🦉", "🐙"],
  Sports: ["⚽", "🏀", "🎾", "🏈", "⚾", "🎯", "🏄", "🚴", "🎿", "🤿"],
  Fun: ["🎸", "🎨", "🎮", "🎭", "🎤", "🚀", "⭐", "🌈", "🎪", "🦄"],
  People: ["👩", "👨", "👧", "👦", "🧑", "👶", "🧓", "💃", "🕺", "🦸"],
};

interface Props {
  selected: string;
  onSelect: (emoji: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("Animals");

  return (
    <div className="space-y-3">
      {/* Selected preview */}
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-[#818CF8] flex items-center justify-center text-3xl glow-ring">
          {selected}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-[#818CF8]/20 text-[#A5B4FC]"
                : "text-[#A3A3A3] hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-5 gap-2">
        {categories[activeCategory as keyof typeof categories].map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
              selected === emoji
                ? "bg-[#818CF8]/20 border-2 border-[#818CF8] scale-110"
                : "bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
