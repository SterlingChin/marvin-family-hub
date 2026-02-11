"use client";

import { useEffect, useState } from "react";

interface GoogleCalendar {
  id: string;
  name: string;
  description?: string;
  color?: string;
  enabled: boolean;
  assignedMember: string | null;
}

interface Props {
  members: { name: string }[];
}

export default function GoogleCalendarSettings({ members }: Props) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/google/status")
      .then(r => r.json())
      .then(d => {
        setConnected(d.connected);
        if (d.connected) fetchCalendars();
      })
      .finally(() => setLoading(false));
  }, []);

  // Check URL params for OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "success") {
      setConnected(true);
      fetchCalendars();
      setMessage("✅ Google Calendar connected!");
      window.history.replaceState({}, "", "/settings");
    } else if (params.get("google") === "error") {
      setMessage("❌ Failed to connect Google Calendar.");
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const fetchCalendars = () => {
    setLoadingCalendars(true);
    fetch("/api/google/calendars")
      .then(r => r.json())
      .then(d => setCalendars(d.calendars || []))
      .finally(() => setLoadingCalendars(false));
  };

  const connectGoogle = async () => {
    const res = await fetch("/api/google/auth", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const disconnectGoogle = async () => {
    await fetch("/api/google/status", { method: "DELETE" });
    setConnected(false);
    setCalendars([]);
    setMessage("Disconnected from Google Calendar.");
  };

  const toggleCalendar = (id: string) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const setAssignedMember = (id: string, member: string) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, assignedMember: member || null } : c));
  };

  const saveCalendars = async () => {
    setSaving(true);
    await fetch("/api/google/calendars/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calendars: calendars.map(c => ({
          calendarId: c.id,
          calendarName: c.name,
          enabled: c.enabled,
          assignedMember: c.assignedMember,
        })),
      }),
    });
    setSaving(false);
    setMessage("✅ Calendar settings saved!");
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return null;

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-[#F5F5F5] flex items-center gap-2">
          📅 Google Calendar
        </h2>
        <p className="text-sm text-[#A3A3A3] mt-1">
          Connect Google Calendar to see your family&apos;s schedule on the dashboard.
        </p>
      </div>

      {message && (
        <p className="text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10">{message}</p>
      )}

      {!connected ? (
        <button
          onClick={connectGoogle}
          className="px-4 py-2.5 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] transition-colors press-scale"
        >
          Connect Google Calendar
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-green-400">Connected</span>
            <button
              onClick={disconnectGoogle}
              className="ml-auto text-xs text-[#A3A3A3] hover:text-red-400 transition-colors"
            >
              Disconnect
            </button>
          </div>

          {loadingCalendars ? (
            <p className="text-sm text-[#A3A3A3]">Loading calendars...</p>
          ) : calendars.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-[#A3A3A3] font-medium uppercase tracking-wider">
                Select calendars to show on dashboard
              </p>
              {calendars.map(cal => (
                <div key={cal.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    checked={cal.enabled}
                    onChange={() => toggleCalendar(cal.id)}
                    className="w-4 h-4 rounded accent-[#818CF8]"
                  />
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cal.color || '#818CF8' }}
                  />
                  <span className="flex-1 text-sm text-[#F5F5F5] truncate">{cal.name}</span>
                  {cal.enabled && (
                    <select
                      value={cal.assignedMember || ""}
                      onChange={e => setAssignedMember(cal.id, e.target.value)}
                      className="px-2 py-1 glass-input text-xs rounded-lg"
                    >
                      <option value="">Family</option>
                      {members.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              <button
                onClick={saveCalendars}
                disabled={saving}
                className="w-full py-2.5 bg-[#818CF8] text-white rounded-xl text-sm font-medium hover:bg-[#6366F1] disabled:opacity-50 transition-colors press-scale"
              >
                {saving ? "Saving..." : "Save Calendar Settings"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#A3A3A3]">No calendars found.</p>
          )}
        </>
      )}
    </div>
  );
}
