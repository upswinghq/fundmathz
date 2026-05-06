import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""
};

export function getFirebaseConfigError() {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => value.length === 0)
    .map(([key]) => key);

  if (missingKeys.length === 0) {
    return null;
  }

  return `Missing Firebase environment variables: ${missingKeys.join(", ")}.`;
}

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

export function formatFirebaseError(
  error: unknown,
  fallbackMessage = "Something went wrong."
) {
  const firebaseError = error as FirebaseLikeError;

  if (firebaseError?.code === "permission-denied") {
    return "Firestore rejected this action. Check your Firestore security rules.";
  }

  if (firebaseError?.code === "unavailable") {
    return "Firestore is temporarily unavailable. Please try again.";
  }

  if (firebaseError?.message) {
    return firebaseError.message;
  }

  return fallbackMessage;
}

let app: FirebaseApp | null = null;

export function getFirebaseApp() {
  const configError = getFirebaseConfigError();

  if (configError) {
    return null;
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    return null;
  }

  return getAuth(firebaseApp);
}

export function getFirestoreDb() {
  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    return null;
  }

  return getFirestore(firebaseApp);
}
