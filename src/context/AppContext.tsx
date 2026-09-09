import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, initializeDatabase } from '../db/database';
import { User } from '../types';

interface AppContextType {
  db: SQLiteDatabase | null;
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  refreshDb: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  db: null,
  currentUser: null,
  isLoading: true,
  setCurrentUser: () => {},
  refreshDb: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function setup() {
      const database = await getDatabase();
      await initializeDatabase(database);
      setDb(database);

      const savedUser = await database.getFirstAsync<{ id: number; name: string; email: string; role: string; pin: string; signatureData: string | null; status: string; createdAt: string }>(
        "SELECT * FROM users WHERE status = 'active' LIMIT 1"
      );
      if (savedUser) {
        setCurrentUser(savedUser as User);
      }
      setIsLoading(false);
    }
    setup();
  }, []);

  const refreshDb = useCallback(async () => {
    const database = await getDatabase();
    setDb({ ...database } as SQLiteDatabase);
  }, []);

  return (
    <AppContext.Provider value={{ db, currentUser, isLoading, setCurrentUser, refreshDb }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
