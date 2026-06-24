"use client";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "../lib/store";
import { AuthProvider } from "../contexts/AuthContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { MastersProvider } from "../contexts/MastersContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <PermissionsProvider>
          <MastersProvider>{children}</MastersProvider>
        </PermissionsProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
