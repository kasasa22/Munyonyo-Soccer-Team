// Client-side Firebase authentication helpers
import { auth } from './firebase';
import { signInWithCustomToken, signOut } from 'firebase/auth';

export async function loginWithCustomToken(customToken: string): Promise<string> {
  try {
    const userCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Error signing in with custom token:', error);
    throw error;
  }
}

export async function getIdToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

export async function refreshIdToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken(true); // Force refresh
    return token;
  } catch (error) {
    console.error('Error refreshing ID token:', error);
    return null;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
