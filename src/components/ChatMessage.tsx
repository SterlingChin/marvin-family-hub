"use client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm shrink-0">
          🤖
        </div>
      )}
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
        isUser
          ? "bg-[#3B82F6] text-white rounded-br-md"
          : "bg-gray-100 text-[#1F2937] rounded-bl-md"
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isUser ? "text-blue-200" : "text-gray-400"}`}>{time}</p>
      </div>
    </div>
  );
}

export type { Message };
