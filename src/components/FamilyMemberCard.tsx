"use client";

const avatarColors = [
  "bg-[#6366F1]", "bg-[#86EFAC]", "bg-[#FB923C]", "bg-[#F472B6]", "bg-[#38BDF8]", "bg-[#A78BFA]",
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
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(180,140,100,0.08)] p-4 border border-[#F5F0EB]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#292524] truncate">{member.name}</p>
          <p className="text-xs text-[#A8A29E] capitalize">{member.role}{member.age ? `, ${member.age}` : ""}</p>
        </div>
        {!compact && onEdit && onDelete && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(member)} className="text-[#A8A29E] hover:text-[#6366F1] text-sm p-1">✏️</button>
            <button onClick={() => onDelete(member.id)} className="text-[#A8A29E] hover:text-red-500 text-sm p-1">🗑️</button>
          </div>
        )}
      </div>
      {!compact && (
        <div className="mt-2 text-sm text-[#78716C] space-y-0.5">
          {member.school && <p>🏫 {member.school}</p>}
          {member.work && <p>💼 {member.work}</p>}
          {member.notes && <p className="text-[#A8A29E] italic">{member.notes}</p>}
        </div>
      )}
    </div>
  );
}

export type { FamilyMember };
