"use client";

import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarName: string;
  assignedMember?: string;
  allDay: boolean;
}

export default function ScheduleCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.ok ? r.json() : { events: [] })
      .then(d => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (events.length === 0) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const todayEvents = events.filter(e => new Date(e.start) < startOfTomorrow);
  const tomorrowEvents = events.filter(e => new Date(e.start) >= startOfTomorrow);

  const formatTime = (dateStr: string, allDay: boolean) => {
    if (allDay) return "All day";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderEvent = (event: CalendarEvent) => (
    <div key={event.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-lg transition-colors">
      <span className="text-xs text-[#818CF8] font-mono w-16 shrink-0">
        {formatTime(event.start, event.allDay)}
      </span>
      <p className="flex-1 text-sm text-[#F5F5F5] truncate">{event.title}</p>
      {event.assignedMember && (
        <span className="text-xs text-[#A3A3A3] shrink-0">{event.assignedMember}</span>
      )}
    </div>
  );

  return (
    <div className="glass-card p-2 glow-card">
      {todayEvents.length > 0 && (
        <>
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#A3A3A3]">📅 Today&apos;s Schedule</h3>
            <span className="text-xs text-[#A3A3A3]">{todayEvents.length} events</span>
          </div>
          {todayEvents.map(renderEvent)}
        </>
      )}
      {tomorrowEvents.length > 0 && (
        <>
          <div className="px-4 py-2 flex items-center justify-between mt-2">
            <h3 className="text-sm font-semibold text-[#A3A3A3]">Tomorrow</h3>
            <span className="text-xs text-[#A3A3A3]">{tomorrowEvents.length} events</span>
          </div>
          {tomorrowEvents.map(renderEvent)}
        </>
      )}
    </div>
  );
}
