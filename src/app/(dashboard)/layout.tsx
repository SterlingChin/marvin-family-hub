"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <FamilyContext.Provider value={{ family, loading, refresh: fetchFamily }}>
      <div className="min-h-screen flex bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="ml-12 md:ml-0">
              <h2 className="font-semibold text-[#1F2937]">{family?.name || "Marvin Family Hub"}</h2>
            </div>
            <UserButton afterSignOutUrl="/" />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </FamilyContext.Provider>
  );
}
