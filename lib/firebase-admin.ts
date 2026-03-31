import * as admin from 'firebase-admin';

let adminAuth: any = null;
let adminDb: any = null;

// Only initialize if we have credentials (skip during build in some environments)
const isProduction = process.env.NODE_ENV === 'production';
const hasCredentials = process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

if (hasCredentials) {
  // Validate and format the private key
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  // Handle different private key formats
  if (privateKey) {
    // Remove quotes if present
    privateKey = privateKey.replace(/^"|"$/g, '');
    
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Ensure proper key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('Invalid Firebase private key format');
      privateKey = undefined;
    }
  }

  if (privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
    const firebaseAdminConfig = {
      projectId: "fixr-f0e28",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(firebaseAdminConfig as any),
        });
        adminAuth = admin.auth();
        adminDb = admin.firestore();
        console.log('Firebase Admin initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        // Fallback to no-op implementations
        adminAuth = {
          verifyIdToken: async () => ({ uid: '', email: '' }),
        };
        adminDb = null;
      }
    } else {
      adminAuth = admin.auth();
      adminDb = admin.firestore();
    }
  } else {
    console.warn('Firebase Admin credentials not properly configured');
    // Provide no-op implementations
    adminAuth = {
      verifyIdToken: async () => ({ uid: '', email: '' }),
    };
    adminDb = null;
  }
} else {
  // Provide no-op implementations for build time
  console.warn('Firebase Admin credentials missing - using fallback implementations');
  adminAuth = {
    verifyIdToken: async () => ({ uid: '', email: '' }),
  };
  adminDb = null;
}

export { adminAuth, adminDb };
