"use client";

import { useEffect, useState, useRef } from "react";
import ConversationList from "@/components/ConversationList";
import type { Conversation } from "@/components/ConversationList";
import ChatMessage from "@/components/ChatMessage";
import type { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = () => {
    fetch("/api/conversations")
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(d => setConversations(d.conversations || []))
      .catch(() => {});
  };

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/conversations/${selectedId}`)
        .then(r => r.ok ? r.json() : { messages: [] })
        .then(d => setMessages(d.messages || []))
        .catch(() => setMessages([]));
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileView("chat");
  };

  const handleNew = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const data = await res.json();
        const newConv = data.conversation;
        if (newConv) {
          setConversations(prev => [newConv, ...prev]);
          setSelectedId(newConv.id);
          setMessages([]);
          setMobileView("chat");
        }
      }
    } catch {}
  };

  const handleSend = async (message: string) => {
    if (!selectedId || sending) return;
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, message }),
      });
      const data = await res.json();
      if (data.response) {
        const assistantMsg: Message = {
          id: `resp-${Date.now()}`,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
      fetchConversations();
    } catch {} finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-73px)] flex rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      {/* Conversation list */}
      <div className={`w-full md:w-72 border-r border-gray-100 shrink-0 ${mobileView === "chat" ? "hidden md:flex md:flex-col" : "flex flex-col"}`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedId || undefined}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
        {selectedId ? (
          <>
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden text-[#3B82F6] text-sm font-medium"
              >
                ← Back
              </button>
              <span className="text-sm font-medium text-[#1F2937]">
                {conversations.find(c => c.id === selectedId)?.title || "Chat"}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => <ChatMessage key={m.id} message={m} />)}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSend} disabled={sending} placeholder="Message Marvin..." />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}
