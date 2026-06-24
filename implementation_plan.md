# Implementation Plan - Dedicated Profile Route & Premium Financial Dashboard

We will remove the "Dashboard" link from the header, redirect logged-in users landing on `/` to `/arena` (Insights), and build a dedicated, professional `/profile` page. The header design will be updated to match the second screenshot (gamepad icon and "SPLIT SMART" text without the underscore), and the settings gear icon will redirect to the profile/settings page. Additionally, we will update the floating chatbot's trigger button to match the user's screenshot.

## Proposed Changes

### Navigation & Header Updates

#### [MODIFY] [Header.tsx](file:///c:/Users/araji/AI/SplitSmart/src/components/layout/Header.tsx)
- **Logo Revamp**: Replace the Pacman "PACPAY" logo with the gamepad/controller icon (material icon `videogame_asset`) and the text "SPLIT SMART" (yellow, uppercase, no underscore) to match the second screenshot.
- **Font & Style Tuning**: Make the navigation font size smaller and more professional (`text-[12px] font-medium tracking-wide text-zinc-400 hover:text-white`) to look clean, compact, and premium.
- **Remove Dashboard**: Remove the "Dashboard" entry from `navLinks`.
- **Redirects**: 
  - Update the settings gear button so that clicking it navigates to `/profile`.
  - Ensure the user name/avatar pill also links to `/profile`.

#### [MODIFY] [page.tsx](file:///c:/Users/araji/AI/SplitSmart/src/app/page.tsx)
- Redirect authenticated users visiting `/` straight to `/arena` (Insights) so they start on the main finance/trading arena.

### Chatbot Trigger Style Update

#### [MODIFY] [FloatingChatbot.tsx](file:///c:/Users/araji/AI/SplitSmart/src/components/agent/FloatingChatbot.tsx)
- **Button Styling**: Update the trigger button to be a light blue (`bg-[#00abec]`) rounded square (`rounded-[18px]` or `rounded-2xl`) matching the screenshot.
- **Icon Styling**: Update the icon inside the trigger button to always display the white robot head (`smart_toy` material icon) when closed, and a close/expand icon when open.

### New Premium Profile Page

#### [NEW] [page.tsx](file:///c:/Users/araji/AI/SplitSmart/src/app/profile/page.tsx)
- A highly polished dashboard that renders when visiting `/profile`:
  - **Profile Hero Card**: Level badge (LVL x), KYC verification status, and name/email details with modern border animations.
  - **Dynamic Tab View**:
    - **Overview**: Rendering a PacPay Credit Card mockup showing Vault Balance, an interactive radial behavior score gauge, and key statistics.
    - **SplitSmart**: Overview of expenses, group debts (what you owe / are owed), and pending split bills.
    - **Portfolio**: Active stock investments, profit/loss percentage, and trading history.
    - **Quests & Levels**: Detailed XP circle, current level milestones, and a grid of unlocked/locked achievements.
    - **Preferences**: Manage account toggles, notifications, and reset statistics.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify compiling works and that all imports and props are correct.

### Manual Verification
- Access the app, sign in, and verify redirect to `/arena`.
- Verify the header logo shows the yellow game controller icon next to `SPLIT SMART`.
- Click the settings gear icon in the header and verify it opens `/profile`.
- Verify the chatbot icon matches the rounded square light blue button with the white robot head inside.
