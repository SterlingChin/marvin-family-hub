"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import MarvinPanel from "@/components/MarvinPanel";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";

interface Family {
  id: string;
  name: string;
}

interface FamilyContextType {
  family: Family | null;
  loading: boolean;
  refresh: () => void;
}

const FamilyContext = createContext<FamilyContextType>({ family: null, loading: true, refresh: () => {} });
export const useFamily = () => useContext(FamilyContext);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchFamily = () => {
    fetch("/api/family")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setFamily(data?.family || null))
      .catch(() => setFamily(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isLoaded && user) fetchFamily();
    else if (isLoaded) setLoading(false);
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-[#A3A3A3] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <FamilyContext.Provider value={{ family, loading, refresh: fetchFamily }}>
      <div className="min-h-screen flex relative">
        {/* Background Image */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')" }}
        />
        {/* Dark overlay for readability */}
        <div className="fixed inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="glass-header px-6 py-3 flex items-center justify-between shrink-0">
              <div className="ml-12 md:ml-0">
                <h2 className="font-semibold text-[#F5F5F5]">{family?.name || "Marvin Family Hub"}</h2>
              </div>
              <UserButton afterSignOutUrl="/" />
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
              {children}
            </main>
          </div>

          {/* Floating Marvin Button */}
          <button
            onClick={() => setPanelOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#818CF8] text-white text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:bg-[#6366F1] transition-colors hover:scale-105 active:scale-95"
            aria-label="Open Marvin"
          >
            🤖
          </button>

          {/* Marvin Slide-out Panel */}
          <MarvinPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
        </div>
      </div>
    </FamilyContext.Provider>
  );
}
