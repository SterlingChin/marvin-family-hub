"use client";

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-teal-500",
];

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  school?: string;
  work?: string;
  notes?: string;
}

interface Props {
  member: FamilyMember;
  index?: number;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function FamilyMemberCard({ member, index = 0, onEdit, onDelete, compact }: Props) {
  const color = avatarColors[index % avatarColors.length];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1F2937] truncate">{member.name}</p>
          <p className="text-xs text-gray-400 capitalize">{member.role}{member.age ? `, ${member.age}` : ""}</p>
        </div>
        {!compact && onEdit && onDelete && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(member)} className="text-gray-400 hover:text-blue-500 text-sm p-1">✏️</button>
            <button onClick={() => onDelete(member.id)} className="text-gray-400 hover:text-red-500 text-sm p-1">🗑️</button>
          </div>
        )}
      </div>
      {!compact && (
        <div className="mt-2 text-sm text-gray-500 space-y-0.5">
          {member.school && <p>🏫 {member.school}</p>}
          {member.work && <p>💼 {member.work}</p>}
          {member.notes && <p className="text-gray-400 italic">{member.notes}</p>}
        </div>
      )}
    </div>
  );
}

export type { FamilyMember };
