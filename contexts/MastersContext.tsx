"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Mock interfaces for master data
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ClientGroup {
  id: string;
  name: string;
}

export interface MastersContextValue {
  tags: Tag[];
  clientGroups: ClientGroup[];
  paymentModes: string[];
  isLoading: boolean;
  refreshMasters: () => void;
}

const MastersContext = createContext<MastersContextValue | undefined>(
  undefined,
);

export function MastersProvider({ children }: { children: ReactNode }) {
  // In a real scenario, this would be populated by useGetMastersQuery() from RTK Query
  const [tags] = useState<Tag[]>([
    { id: "1", name: "VIP", color: "bg-purple-100 text-purple-800" },
    { id: "2", name: "New", color: "bg-blue-100 text-blue-800" },
  ]);

  const [clientGroups] = useState<ClientGroup[]>([
    { id: "g1", name: "Tech Startups" },
    { id: "g2", name: "Retail" },
  ]);

  const [paymentModes] = useState<string[]>([
    "Credit Card",
    "Bank Transfer",
    "Cash",
    "UPI",
  ]);

  const [isLoading] = useState(false);

  const refreshMasters = () => {
    // Placeholder for triggering a refetch of master data
  };

  return (
    <MastersContext.Provider
      value={{ tags, clientGroups, paymentModes, isLoading, refreshMasters }}
    >
      {children}
    </MastersContext.Provider>
  );
}

export function useMasters() {
  const context = useContext(MastersContext);
  if (!context) {
    throw new Error("useMasters must be used within a MastersProvider");
  }
  return context;
}
