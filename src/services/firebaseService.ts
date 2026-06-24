import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Transaction, Mission, Badge, StockTransaction, MarketEvent } from '../types';

// Collection names
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';
const MISSIONS_COLLECTION = 'missions';
const BADGES_COLLECTION = 'badges';
const STOCK_TRANSACTIONS_COLLECTION = 'stock_transactions';
const MARKET_EVENTS_COLLECTION = 'market_events';

// Auth functions
export const registerWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });

  await createUserDocument(userCredential.user.uid, {
    id: userCredential.user.uid,
    name,
    email,
    xp: 0,
    level: 1,
    pacTokens: 100,
    behaviorScore: 50,
    streakDays: 0,
    longestStreak: 0,
    joinedAt: new Date(),
    isPremium: false,
  });

  return userCredential.user;
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);

  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userCredential.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(userCredential.user.uid, {
      id: userCredential.user.uid,
      name: userCredential.user.displayName || 'User',
      email: userCredential.user.email || '',
      xp: 0,
      level: 1,
      pacTokens: 100,
      behaviorScore: 50,
      streakDays: 0,
      longestStreak: 0,
      joinedAt: new Date(),
      isPremium: false,
    });
  }

  return userCredential.user;
};

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User document functions
const createUserDocument = async (uid: string, userData: Omit<User, 'avatar'>): Promise<void> => {
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    ...userData,
    joinedAt: serverTimestamp(),
  });
};

export const getUserData = async (uid: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      joinedAt: data.joinedAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

export const updateUserData = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToUserData = (
  uid: string,
  callback: (data: User | null) => void
) => {
  return onSnapshot(doc(db, USERS_COLLECTION, uid), (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date(),
      } as User);
    } else {
      callback(null);
    }
  });
};

// Transactions functions
export const addTransaction = async (
  uid: string,
  transaction: Omit<Transaction, 'id'>
): Promise<string> => {
  const docRef = doc(collection(db, USERS_COLLECTION, uid, TRANSACTIONS_COLLECTION));
  await setDoc(docRef, {
    ...transaction,
    date: serverTimestamp(),
  });
  return docRef.id;
};

export const getTransactions = async (uid: string): Promise<Transaction[]> => {
  const q = query(
    collection(db, USERS_COLLECTION, uid, TRANSACTIONS_COLLECTION),
    orderBy('date', 'desc'),
    limit(100)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
  })) as Transaction[];
};

// Missions functions
export const getMissions = async (uid: string): Promise<Mission[]> => {
  const q = query(
    collection(db, USERS_COLLECTION, uid, MISSIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    deadline: doc.data().deadline?.toDate(),
  })) as Mission[];
};

export const updateMission = async (
  uid: string,
  missionId: string,
  data: Partial<Mission>
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, uid, MISSIONS_COLLECTION, missionId), data);
};

// Stock Transactions functions
export const addStockTransaction = async (
  uid: string,
  transaction: Omit<StockTransaction, 'id'>
): Promise<string> => {
  const docRef = doc(collection(db, USERS_COLLECTION, uid, STOCK_TRANSACTIONS_COLLECTION));
  await setDoc(docRef, {
    ...transaction,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

// Market Events (global collection)
export const subscribeToMarketEvents = (
  callback: (events: MarketEvent[]) => void
) => {
  const q = query(
    collection(db, MARKET_EVENTS_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as MarketEvent[];
    callback(events);
  });
};

// Portfolio sync functions
export const syncPortfolioToFirestore = async (
  uid: string,
  portfolioData: {
    balance: number;
    holdings: Array<{
      symbol: string;
      shares: number;
      avgBuyPrice: number;
    }>;
  }
): Promise<void> => {
  await setDoc(doc(db, USERS_COLLECTION, uid, 'portfolio', 'main'), portfolioData);
};

export const getPortfolioFromFirestore = async (uid: string): Promise<{
  balance: number;
  holdings: Array<{
    symbol: string;
    shares: number;
    avgBuyPrice: number;
  }>;
} | null> => {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid, 'portfolio', 'main'));
  if (docSnap.exists()) {
    return docSnap.data() as any;
  }
  return null;
};
