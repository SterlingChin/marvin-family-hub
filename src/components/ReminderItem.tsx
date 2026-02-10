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
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${reminder.completed ? "bg-gray-50 border-gray-100" : isPast ? "bg-red-50 border-red-100" : "bg-white border-gray-100"}`}>
      <input
        type="checkbox"
        checked={reminder.completed}
        onChange={() => onToggle(reminder.id, !reminder.completed)}
        className="w-5 h-5 rounded-md accent-[#3B82F6] shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${reminder.completed ? "line-through text-gray-400" : "text-[#1F2937]"}`}>
          {reminder.title}
        </p>
        <p className="text-xs text-gray-400">
          {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {reminder.assigned_to && ` · ${reminder.assigned_to}`}
        </p>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(reminder.id)} className="text-gray-300 hover:text-red-500 text-sm">🗑️</button>
      )}
    </div>
  );
}

export type { Reminder };
