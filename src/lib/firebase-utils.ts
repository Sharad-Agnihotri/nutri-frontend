import { db } from './firebase';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';

export async function syncUserProfile(preferences: any) {
  try {
    const username = preferences.username || 'anonymous';
    const docId = username.toLowerCase().replace(/[^a-z0-9]/g, '_');

    await setDoc(doc(db, 'users', docId), {
      uid: docId,
      username: preferences.username || 'User',
      dietType: preferences.dietType,
      city: preferences.city || '',
      state: preferences.state || '',
      country: preferences.country || '',
      lastActive: serverTimestamp(),
      isPublic: true
    }, { merge: true });

    return docId;
  } catch (error) {
    // Silently fail — app works offline too
    console.warn('Firebase sync skipped (offline or not configured):', (error as any)?.code || error);
    return null;
  }
}

export async function searchUsers(searchTerm: string) {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((user: any) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return results;
  } catch (error) {
    console.warn('User search failed (offline or not configured):', (error as any)?.code || error);
    return [];
  }
}
