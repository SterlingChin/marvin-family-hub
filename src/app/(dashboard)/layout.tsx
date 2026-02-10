"use client";

import { useUser } from "@clerk/nextjs";
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
          <Sidebar onMarvinOpen={() => setPanelOpen(true)} />

          {/* Main content: offset for rail on desktop, padding-bottom for tab bar on mobile */}
          <div className="flex-1 flex flex-col min-w-0 md:ml-16 pb-20 md:pb-0">
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
              {children}
            </main>
          </div>

          {/* Marvin Slide-out Panel */}
          <MarvinPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
        </div>
      </div>
    </FamilyContext.Provider>
  );
}
