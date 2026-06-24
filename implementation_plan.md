# Implementation Plan - Landing Page Logged-In View & AI Agent Manager Button Removal

We will update the landing page (`/`) to be accessible to logged-in users (removing the automatic redirect to `/arena`), render the navigation Header and BottomNav for logged-in users, and remove the deprecated "AI Agent Manager" button from the main action layout.

## Proposed Changes

### Landing Page Updates

#### [MODIFY] [page.tsx](file:///c:/Users/araji/AI/SplitSmart/src/app/page.tsx)
- **Remove Redirect**: Remove the `router.push('/arena')` call in `useEffect` when `firebaseUser` is present.
- **Render Navigation for Logged-In Users**: Render the `<Header />` component at the top and the `<BottomNav />` component at the bottom of the page when `firebaseUser` is true, ensuring users can navigate the application.
- **Adjust Layout Padding**: Add top padding (`pt-16`) and bottom padding (`pb-24`) to the main container when logged in, to avoid overlaps with the Header and BottomNav.
- **Button Cleanup**:
  - Remove the "AI Agent Manager" button from the landing page.
  - Display the yellow action button (`INSERT COIN` if logged in, `START SYSTEM` if logged out) and the cyan action button (`Split Expenses`) side-by-side in a responsive flex layout.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify compiling works.

### Manual Verification
- Sign in and verify you land on `/` without being redirected to `/arena`.
- Verify the header and bottom navigation are visible on `/` when logged in.
- Verify the "AI Agent Manager" button is removed from `/`.
- Verify the remaining two buttons ("INSERT COIN" / "START SYSTEM" and "Split Expenses") render correctly side-by-side.
