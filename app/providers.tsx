"use client";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "../lib/store";
import { AuthProvider } from "../contexts/AuthContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <PermissionsProvider>{children}</PermissionsProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
