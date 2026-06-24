# Unified Token Balance & Unique Username Onboarding Plan

We will ensure that logging out and logging in with a different email address isolates user profiles. Brand-new logins (such as Google Sign-In users without an existing Firestore document) will be redirected to a dedicated `/setup-profile` screen to choose a unique username. New profiles will receive a starting balance of `500` tokens, which will be unified between the bill split/user profile store and the stock trading store. A real-time token balance indicator will also be shown in the navigation header (visible on Insights and Dashboard pages).

## Proposed Changes

### Firebase Service
#### [MODIFY] [firebaseService.ts](file:///c:/Users/araji/AI/SplitSmart/src/services/firebaseService.ts)
- **Starting Balance**: Update `registerWithEmail` to write `pacTokens: 500` instead of `100`.
- **Google Sign-In**: Remove automatic user document creation from `loginWithGoogle`. Google Sign-In will only authenticate the user; `AuthGuard` will detect that they have no Firestore profile document and redirect them to `/setup-profile` to choose a unique username.
- **Uniqueness Check & Creation**: Expose `createUserDocument` or add a function `setupNewUserProfile(uid, username, email)` to initialize the user document with `pacTokens: 500`.

### Authentication Guard
#### [MODIFY] [AuthGuard.tsx](file:///c:/Users/araji/AI/SplitSmart/src/components/layout/AuthGuard.tsx)
- **Path Exceptions**: Allow `/setup-profile` and `/auth` routes without auth redirects.
- **Redirection Logic**:
  - If NOT logged in (`!firebaseUser`): redirect to `/auth` (if not already there).
  - If logged in (`firebaseUser`) but the Firestore document does not exist yet (`!user`): redirect to `/setup-profile` (if not already there).
  - If logged in and profile is complete: redirect to `/` if trying to access `/auth` or `/setup-profile`.

### Profile Setup Onboarding
#### [NEW] [page.tsx](file:///c:/Users/araji/AI/SplitSmart/src/app/setup-profile/page.tsx)
- Create a beautiful retro-cyberpunk styled onboarding page.
- Input a unique username, verify uniqueness in Firestore, and call `setupNewUserProfile` with `pacTokens: 500` to create their user profile.

### Zustand Stores
#### [MODIFY] [userStore.ts](file:///c:/Users/araji/AI/SplitSmart/src/store/userStore.ts)
- Update `DEFAULT_USER` to have `pacTokens: 500`.
- Maintain reactive state syncing with Firestore.

#### [MODIFY] [stockStore.ts](file:///c:/Users/araji/AI/SplitSmart/src/store/stockStore.ts)
- Update the default balance value to `500`.
- Refactor `buyStock` and `sellStock` to deduct/add tokens using the `useUserStore` actions (`spendTokens`, `addTokens`).
- Subscribe to `useUserStore` changes to keep `stockStore`'s `balance` property reactive and synchronized in real-time.

### Navigation Header
#### [MODIFY] [Header.tsx](file:///c:/Users/araji/AI/SplitSmart/src/components/layout/Header.tsx)
- Add a beautiful glowing token balance badge (e.g. `500 PAC`) next to the profile badge pill, ensuring it is visible on both the Insights (`/arena`) and Dashboard (`/profile`) pages.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify there are no compilation or TypeScript errors.

### Manual Verification
1. **Google Sign-In Onboarding**: Log in with a new Google account, verify that it redirects to `/setup-profile`, blocks duplicate usernames, sets username, gives `500` tokens, and initializes correctly.
2. **Profile Isolation**: Log out, log in with another email/account, and verify that the name and stats update correctly.
3. **Unified Token Balance**: Go to the Insights page (`/arena`), buy a stock, and verify that the tokens are deducted from both the trading panel and the header pill.
4. **Header Token Display**: Verify that the token balance is displayed clearly in the navigation header across all pages.
