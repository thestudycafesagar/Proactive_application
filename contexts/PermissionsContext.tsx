import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type Permission =
  | "clients.view"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"
  | "tasks.view"
  | "tasks.create"
  | "tasks.edit"
  | "invoices.view"
  | "invoices.create"
  | "invoices.edit"
  | "settings.view"
  | "settings.manage_users";

const RBAC: Record<string, Permission[]> = {
  Admin: [
    "clients.view",
    "clients.create",
    "clients.edit",
    "clients.delete",
    "tasks.view",
    "tasks.create",
    "tasks.edit",
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "settings.view",
    "settings.manage_users",
  ],
  "Team Leader": [
    "clients.view",
    "clients.create",
    "clients.edit",
    "tasks.view",
    "tasks.create",
    "tasks.edit",
    "invoices.view",
    "invoices.create",
    "settings.view",
  ],
  Accountant: [
    "clients.view",
    "clients.edit",
    "tasks.view",
    "tasks.edit",
    "invoices.view",
  ],
  Staff: ["clients.view", "tasks.view"],
};

interface PermissionsContextValue {
  can: (perm: Permission) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const perms = user ? (RBAC[user.role] ?? []) : [];
  const can = (perm: Permission) => perms.includes(perm);
  return (
    <PermissionsContext.Provider value={{ can }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx)
    throw new Error("usePermissions must be used within PermissionsProvider");
  return ctx;
}
