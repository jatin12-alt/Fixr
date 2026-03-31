import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyClTAy3HBAxQFsk9lYY5ZFFkRAOkw0hgbc",
  authDomain: "fixr-f0e28.firebaseapp.com",
  projectId: "fixr-f0e28",
  storageBucket: "fixr-f0e28.firebasestorage.app",
  messagingSenderId: "972380168221",
  appId: "1:972380168221:web:844c5c7566d2b2a15ee6f4",
  measurementId: "G-0S83WLCJXL"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics is only available in the browser
const analytics = typeof window !== "undefined" ? isSupported().then((yes: boolean) => yes ? getAnalytics(app) : null) : null;

export { app, auth, analytics };
