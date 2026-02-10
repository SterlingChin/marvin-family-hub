"use client";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  school?: string;
  work?: string;
  notes?: string;
  avatar?: string;
}

interface Props {
  member: FamilyMember;
  index?: number;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function FamilyMemberCard({ member, onEdit, onDelete, compact }: Props) {
  return (
    <div className="glass-card p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-2xl shrink-0">
          {member.avatar || member.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#F5F5F5] truncate">{member.name}</p>
          <p className="text-xs text-[#A3A3A3] capitalize">{member.role}{member.age ? `, ${member.age}` : ""}</p>
        </div>
        {!compact && onEdit && onDelete && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(member)} className="text-[#A3A3A3] hover:text-[#818CF8] text-sm p-1">✏️</button>
            <button onClick={() => onDelete(member.id)} className="text-[#A3A3A3] hover:text-red-400 text-sm p-1">🗑️</button>
          </div>
        )}
      </div>
      {!compact && (
        <div className="mt-2 text-sm text-[#A3A3A3] space-y-0.5">
          {member.school && <p>🏫 {member.school}</p>}
          {member.work && <p>💼 {member.work}</p>}
          {member.notes && <p className="text-[#A3A3A3]/60 italic">{member.notes}</p>}
        </div>
      )}
    </div>
  );
}

export type { FamilyMember };
