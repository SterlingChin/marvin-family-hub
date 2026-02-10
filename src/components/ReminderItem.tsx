"use client";

interface Reminder {
  id: string;
  title: string;
  due_date: string;
  assigned_to?: string;
  completed: boolean;
}

interface Props {
  reminder: Reminder;
  onToggle: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function ReminderItem({ reminder, onToggle, onDelete }: Props) {
  const due = new Date(reminder.due_date);
  const isPast = due < new Date() && !reminder.completed;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
      reminder.completed
        ? "bg-white/5 border-white/5 opacity-60"
        : isPast
          ? "bg-[#FB923C]/10 border-[#FB923C]/20"
          : "glass-card hover:bg-white/10"
    }`}>
      <input
        type="checkbox"
        checked={reminder.completed}
        onChange={() => onToggle(reminder.id, !reminder.completed)}
        className="w-5 h-5 rounded-md accent-[#818CF8] shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${reminder.completed ? "line-through text-[#A3A3A3]" : "text-[#F5F5F5]"}`}>
          {reminder.title}
        </p>
        <p className="text-xs text-[#A3A3A3]">
          {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {reminder.assigned_to && ` · ${reminder.assigned_to}`}
        </p>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(reminder.id)} className="text-[#A3A3A3]/40 hover:text-red-400 text-sm">🗑️</button>
      )}
    </div>
  );
}

export type { Reminder };
