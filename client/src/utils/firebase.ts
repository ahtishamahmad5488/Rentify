/**
 * Firebase entry point for Rentify mobile.
 *
 * NOTE: We use @react-native-firebase/* (native modules), so credentials are
 * loaded automatically from:
 *   - android/app/google-services.json
 *   - ios/GoogleService-Info.plist
 *
 * Drop those files in once your Firebase project is created. No JS keys here.
 */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const firebaseAuth = auth;
export const firebaseDb = firestore;

// Helper: build a deterministic chatId for a 1-to-1 conversation
// between two userIds (sorted so both directions resolve to the same room).
export const buildChatId = (a: string, b: string) => {
  return [a, b].sort().join('_');
};

// ─── Auth helpers ────────────────────────────────────────────────────────────

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  const cred = await auth().createUserWithEmailAndPassword(email, password);
  if (cred.user) {
    await cred.user.updateProfile({ displayName: name });
  }
  return cred.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const cred = await auth().signInWithEmailAndPassword(email, password);
  return cred.user;
};

export const signOutFirebase = async () => {
  await auth().signOut();
};

export const getCurrentFirebaseUser = () => auth().currentUser;
