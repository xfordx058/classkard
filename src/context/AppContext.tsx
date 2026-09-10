import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { initOffline } from '../db/queries';
import { User } from '../types';

interface AppContextType {
  db: typeof supabase;
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  refreshDb: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  db: supabase,
  currentUser: null,
  isLoading: true,
  setCurrentUser: () => {},
  refreshDb: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessionUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const authId = data.session?.user?.id;
    if (!authId) {
      setCurrentUser(null);
      return;
    }
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();
    if (user) {
      setCurrentUser({
        id: Number(user.id),
        name: user.name ?? '',
        email: user.email ?? '',
        role: (user.role as User['role']) ?? 'teacher',
        pin: '',
        signatureData: user.signature_data ?? null,
        status: user.status === 'inactive' ? 'inactive' : 'active',
        createdAt: user.created_at ?? new Date().toISOString(),
      });
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    initOffline();
    async function setup() {
      await loadSessionUser();
      setIsLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        loadSessionUser();
      });
      return () => subscription.unsubscribe();
    }
    setup();
  }, [loadSessionUser]);

  const refreshDb = useCallback(async () => {
    await loadSessionUser();
  }, [loadSessionUser]);

  return (
    <AppContext.Provider value={{ db: supabase, currentUser, isLoading, setCurrentUser, refreshDb }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}