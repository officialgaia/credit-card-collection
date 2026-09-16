import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// サークル機関誌アプリ専用の Firebase App。既存の Supabase 構成とは独立させる。
const magazineApp = getApps().some((app) => app.name === "magazine")
  ? getApp("magazine")
  : initializeApp(firebaseConfig, "magazine");

export const magazineAuth = getAuth(magazineApp);
export const magazineDb = getFirestore(magazineApp);
export const magazineStorage = getStorage(magazineApp);
