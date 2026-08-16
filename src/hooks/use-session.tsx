import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import auth from "@/lib/shared/kliv-auth.js";
import type { KlivUser } from "@/lib/shared/kliv-auth.js";

interface SessionValue {
  user: KlivUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KlivUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await auth.getCurrentUser(true));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
