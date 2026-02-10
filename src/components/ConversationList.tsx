"use client";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface Props {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export default function ConversationList({ conversations, selectedId, onSelect, onNew }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <button
          onClick={onNew}
          className="w-full py-2 px-4 bg-[#3B82F6] text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          + New Conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="p-4 text-sm text-gray-400 text-center">No conversations yet</p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
              selectedId === conv.id ? "bg-blue-50" : ""
            }`}
          >
            <p className="text-sm font-medium text-[#1F2937] truncate">{conv.title || "New Chat"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(conv.updated_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Conversation };
