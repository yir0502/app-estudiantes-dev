import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import * as authExports from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

import { ENV } from "../config/env";

const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const { getAuth, initializeAuth } = authExports;
const getReactNativePersistence = (authExports as any).getReactNativePersistence;

// When running on the web, getReactNativePersistence is undefined and throws an error if called.
// So we use getAuth for web, which automatically handles standard web persistence.
export const auth = Platform.OS === "web"
  ? getAuth(app)
  : initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;