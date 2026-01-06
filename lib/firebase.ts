import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase設定 - 環境変数またはハードコード値を使用（trim()で改行除去）
const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBqSzA1wFGTRd2yFQyBdGyct9tl_zNceOQ").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cc-insight.firebaseapp.com").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cc-insight").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cc-insight.firebasestorage.app").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "359311670016").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:359311670016:web:998b8236071c672f46d1e5").trim(),
};

// デバッグ用ログ（本番環境でも表示）
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Config Debug:', {
    apiKey: firebaseConfig.apiKey ? `✓ ${firebaseConfig.apiKey.substring(0, 10)}...` : '✗ Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? `✓ ${firebaseConfig.appId.substring(0, 20)}...` : '✗ Missing',
  });
  console.log('🌍 Environment Check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasEnvVars: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  });
}

// Firebase初期化（重複防止）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
