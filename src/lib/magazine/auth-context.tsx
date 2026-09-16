"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { magazineAuth, magazineDb } from "@/lib/magazine/firebase";

interface MagazineAuthValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const MagazineAuthContext = createContext<MagazineAuthValue | null>(null);

async function checkIsAdmin(email: string | null): Promise<boolean> {
  if (!email) return false;
  const snap = await getDoc(doc(magazineDb, "config", "adminEmails"));
  if (!snap.exists()) return false;
  const list = snap.data().adminEmails as string[] | undefined;
  return Array.isArray(list) && list.includes(email);
}

export function MagazineAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(magazineAuth, async (nextUser) => {
      setUser(nextUser);
      setIsAdmin(await checkIsAdmin(nextUser?.email ?? null));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<MagazineAuthValue>(
    () => ({
      user,
      loading,
      isAdmin,
      signIn: async () => {
        await signInWithPopup(magazineAuth, new GoogleAuthProvider());
      },
      signOut: async () => {
        await firebaseSignOut(magazineAuth);
      },
    }),
    [user, loading, isAdmin],
  );

  return (
    <MagazineAuthContext.Provider value={value}>
      {children}
    </MagazineAuthContext.Provider>
  );
}

export function useMagazineAuth(): MagazineAuthValue {
  const ctx = useContext(MagazineAuthContext);
  if (!ctx) {
    throw new Error("useMagazineAuth は MagazineAuthProvider の内側でのみ使用できます");
  }
  return ctx;
}
