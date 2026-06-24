# Implementation Plan - Unique Username Validation, Cloud Sync & Session Isolation

We will implement username uniqueness verification in Firestore during email sign-up, ensure Google Sign-In automatically resolves username collisions, isolate local sessions on logout, and keep the local Zustand game state in sync with the Firestore user documents.

## Proposed Changes

### Unique Username Checks & Firestore Integration

#### [MODIFY] [firebaseService.ts](file:///c:/Users/araji/AI/SplitSmart/src/services/firebaseService.ts)
- Add a helper function `isUsernameUnique(username: string)` to query Firestore and check if a username is already taken.
- Update `registerWithEmail` to check for username uniqueness first; if it's already taken, throw a clear error: `"Username is already taken. Please choose another."`
- Update `loginWithGoogle` to check for username uniqueness. If the Google display name is already taken, append a random 4-digit number (e.g. `Name_1234`) to make it unique before creating the document.

#### [MODIFY] [authStore.ts](file:///c:/Users/araji/AI/SplitSmart/src/store/authStore.ts)
- Import `useUserStore`.
- Inside `initialize()`, when the Firestore user document is loaded/updated, sync the data directly to the local game store using `useUserStore.getState().setUser(userData)`.
- Update the `logout` action to clear the specific `localStorage` keys (`splitsmart-user-storage`, `splitsmart-stocks-v2`, `splitsmart-split-storage`) so a new user signing in starts fresh and doesn't see cached data from the previous account.

#### [MODIFY] [userStore.ts](file:///c:/Users/araji/AI/SplitSmart/src/store/userStore.ts)
- Import `auth` and `updateUserData` from Firebase modules.
- Update state-mutating actions (`addXP`, `addTokens`, `spendTokens`, `updateBehaviorScore`, `incrementStreak`, `resetStreak`, `setPremium`) to also write the updated values to Firestore if a user is authenticated (`auth.currentUser` is present).

## Verification Plan

### Automated Tests
- Run `npm run build` to verify compiling works.

### Manual Verification
- Attempt to register a new user with an existing username and check if it shows the "Username is already taken" validation error.
- Sign in with a new Google account and verify it creates a unique username (appending random digits if there is a collision).
- Log out and log in with a different email; verify that all stats, balance, and split groups are cleared/updated to match the new profile instead of displaying cached data.
