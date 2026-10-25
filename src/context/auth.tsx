import { createContext, useContext, useMemo, type ReactNode } from "react";

export type AppUser = {
  id: string;
  email?: string;
};

type AuthState = {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthState>(
    () => ({
      user: null,
      loading: false,
      signOut: async () => {},
    }),
    [],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("AuthProvider missing");
  }

  return value;
}