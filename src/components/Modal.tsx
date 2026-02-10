"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in-up" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '1rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#F5F5F5]">{title}</h2>
          <button onClick={onClose} className="text-[#A3A3A3] hover:text-white text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
