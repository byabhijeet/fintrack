# Implementation Issues & Vertical Slices

> **Status Tracking**: Once an issue/slice is completed, YOU MUST mark it with `[x]`. Leave pending issues as `[ ]`. Always check this file to know what is pending and what is completed.

- [x] **Slice 0: Setup Testing Environment**
  - **Type**: AFK
  - **Blocked by**: None
  - **Description**: Configure Jest and `@testing-library/react-native`.

- [x] **Slice 1: Expo Setup & Basic Navigation Shell**
  - **Type**: AFK
  - **Blocked by**: None
  - **Description**: Scaffold the Expo managed React Native project and configure the React Navigation bottom tabs (Home, Credit Book, Split, Hub) with placeholder screens.

- [x] **Slice 2: Supabase Auth & Phone Login**
  - **Type**: AFK
  - **Blocked by**: Slice 1
  - **Description**: Build the Login Screen, configure Supabase Auth (OTP), and set up the `authStore` in Zustand.

- [x] **Slice 3: Subscription Gate & Biometric Prompt**
  - **Type**: AFK
  - **Blocked by**: Slice 2
  - **Description**: Add `expo-local-authentication` (FaceID/TouchID), check subscription status against the `accounts` and `subscriptions` tables, and build the Blocked Screen for users without an active plan. *Must include Unit Tests for the gate logic.*

- [x] **Slice 4: Income Entry & React Query Setup**
  - **Type**: AFK
  - **Blocked by**: Slice 2
  - **Description**: Set up TanStack React Query. Build the Add Income form and list view, reading/writing to `income_entries` and `finance_categories`.  

- [x] **Slice 5: Personal Expenses & Outflows**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Build the Expense and Outflow form + list view using `finance_entries` with category selection.

- [x] **Slice 6: Dashboard Net Overview & Charts**
  - **Type**: AFK
  - **Blocked by**: Slices 4, 5
  - **Description**: Build the Dashboard landing page. Calculate the Ecosystem Net and add the Victory Native area/bar charts.
  - **Note**: UI, charts, Income, Expenses, Business, Cards, Loans, and Credit Book all integrated into the Ecosystem Net formula.

- [x] **Slice 7: Credit Cards & Spends Tracker**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Add Credit Card management, Card Spends logging, and calculate credit utilization based on billing cycles.

- [x] **Slice 8: Business Ledger (Multi-business)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Build the Business Switcher, record Business Income/Expenses, and calculate Business Net.

- [x] **Slice 9: Loan Tracker & Amortization Engine**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Build the Add Loan form with EMI math (reducing/flat). Generate and insert the `loan_amortisation_schedule`. *Must include Unit Tests for the EMI and Amortization calculations.*

- [x] **Slice 10: Loan Part Payments & Foreclosure**
  - **Type**: AFK
  - **Blocked by**: Slice 9
  - **Description**: Implement loan part payments (reduce EMI or tenure), recalculating the remaining schedule, and handle loan foreclosure.

- [x] **Slice 11: Bills (Recurring Templates)**
  - **Type**: AFK
  - **Blocked by**: Slice 5
  - **Description**: Build the Recurring Templates view. Implement "Mark Paid" and auto-process active bills on app launch.

- [x] **Slice 12: Credit Book (P2P Ledger)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Add Credit Parties (enforcing mobile uniqueness). Build the Add Transaction (gave/got) form and show net balances.

- [x] **Slice 13: Credit Book (B2B Merchant Sync)**
  - **Type**: AFK
  - **Blocked by**: Slice 12
  - **Description**: Detect if a party mobile matches a BillZest org, fetch B2B transactions, and merge them as read-only into the ledger.

- [x] **Slice 14: Expense Split (Groups & Penny Algorithm)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Create Split Groups and add Split Expenses using the penny-rounding algorithm (equal, percent, exact, shares). *Must include Unit Tests for the penny algorithm math.*
  - **Note**: Implemented split groups, split expenses, participant management, and penny-perfect splitting algorithm with equal, percent, exact, and shares-based splitting.

- [x] **Slice 15: Split Settlements**
  - **Type**: AFK
  - **Blocked by**: Slice 14
  - **Description**: Implement "Settle Up" to record payments between group members in `split_settlements`.
  - **Note**: Implemented settlement mutations, queries for outstanding debts, and SettleUpScreen with payment method selection.

- [ ] **Slice 16: Vault (Camera & Storage Upload)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Integrate camera/gallery. Upload receipt images to Supabase storage and create `vault_entries`.

- [x] **Slice 17: Hub Extras (Rewards, Deals, Partner)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Display Rewards (points/redemptions), active Flash Deals, and Partner Referral screens.
  - **Note**: Implemented rewards display, flash deals carousel, redemption system with points calculation, and partner referral invitations with email/phone tracking.

- [x] **Slice 18: Profile, Settings, & Realtime Notifications**
  - **Type**: AFK
  - **Blocked by**: Slices 2, 6
  - **Description**: Edit user profile via RPC, implement the Privacy Mode toggle in `uiStore`, and add Realtime notifications to the Activity tab.

- [x] **Slice 19: BOI AI Assistant (Voice to Intent)**
  - **Type**: HITL
  - **Blocked by**: Slices 5, 7, 12
  - **Description**: Build the Global FAB Bottom Sheet, integrate STT (`expo-speech`), and map intents to pre-fill various module forms.

- [x] **Slice 20: Fix Credit Book Math Bug [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Invert the net balance calculation logic in the Credit Book queries/UI. Currently, money you `got` adds to a positive net balance which the UI calls a Receivable ("You get back"). It should be inverted: money you `gave` is a Receivable (they owe you), and money you `got` is a Payable (you owe them).
  - **Acceptance criteria**:
    - [ ] `computeNetBalance` logic accurately reflects that `gave` is a receivable and `got` is a payable.
    - [ ] The UI correctly updates the text colors and labels ("You owe" vs "You'll get") based on the inverted math.

- [x] **Slice 21: Show/Hide Password Toggle [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Add an eye-icon toggle to the password input field on the login screen (web and mobile).
  - **Acceptance criteria**:
    - [ ] Tapping the eye icon toggles the `secureTextEntry` state of the password field.
    - [ ] The icon visually changes between open-eye and closed-eye states.

- [x] **Slice 22: Disable Biometric Login Setting [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Add a preference toggle in the Settings screen to bypass the biometric prompt on app startup.
  - **Acceptance criteria**:
    - [ ] The state is persisted locally (e.g., in AsyncStorage or UI store).
    - [ ] If disabled, the app skips `expo-local-authentication` during the subscription/auth gate flow and proceeds straight to the dashboard.

- [x] **Slice 23: Standardize "Add Items" Button Placement [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Move the primary "Add Item" button (e.g., adding an expense, income, party) from inconsistent bottom-screen placements to the Top Right of the screen header.
  - **Acceptance criteria**:
    - [ ] The action button is placed in the navigation header (using `headerRight`).
    - [ ] The layout looks consistent on both Web and Mobile without overlapping the bottom edge.

- [x] **Slice 24: Infinite Scroll & Pull-to-Refresh [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Add `onEndReached` (infinite scrolling) and `refreshControl` (pull-to-refresh) to primary long lists such as Transactions and Credit Book Parties.
  - **Acceptance criteria**:
    - [ ] Swiping down triggers a manual refresh of the React Query data.
    - [ ] Reaching the bottom of the list attempts to fetch the next page (assuming backend support or simply handles standard UX).

- [x] **Slice 25: Web Alert Modal Fallback [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Replace native `Alert.alert` calls with a custom cross-platform modal (or a web polyfill) because `Alert.alert` silently fails on the web platform.
  - **Acceptance criteria**:
    - [ ] Alerts display correctly with their title, message, and buttons when running via `npm run web`.

- [x] **Slice 26: Edit Salary Entries [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Add an update flow (modal or form) to modify existing salary records alongside the current delete option.
  - **Acceptance criteria**:
    - [ ] Users can trigger an "Edit" action on a salary entry.
    - [ ] The edit modal correctly populates existing data and updates the DB via a TanStack mutation.

- [x] **Slice 27: Import Contacts to Supabase [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Use `expo-contacts` to fetch the device's address book and create a mechanism to sync those contacts to Supabase (e.g., the `parties` or a new `contacts` table) for cross-device support.
  - **Acceptance criteria**:
    - [ ] Requests contact permissions gracefully.
    - [ ] Batch inserts/upserts imported contacts to Supabase.
    - [ ] The imported contacts are selectable when adding a new Credit Book party.

- [x] **Slice 28: Recurring Transactions Core & Schema [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Set up the `recurring_transactions` Supabase schema, pg_cron daily evaluation script, and scaffold an empty "Bills/Recurring" tab in the app's navigation.
  - **Acceptance criteria**:
    - [ ] `recurring_transactions` table exists in Supabase.
    - [ ] `pg_cron` function is written to automatically insert records into `transactions` when due.
    - [ ] A new navigation tab is visible on mobile and web.

- [x] **Slice 29: Recurring Transactions Management UI [jules]**
  - **Type**: AFK
  - **Blocked by**: Slice 28
  - **What to build**: Implement the UI to manage the recurrences. Allow users to add, edit, or pause recurring bills.
  - **Acceptance criteria**:
    - [ ] The "Bills" tab displays all active/paused recurring templates.
    - [ ] The Add/Edit form correctly submits frequency, amount, and category to the Supabase table.

- [ ] **Slice 30: Auth Store Decoupling & Subscription Query [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Refactor checkSubscription from the Zustand store (authStore.ts) into a new React Query hook (useSubscriptionCheck). Update the AuthGate in app/_layout.tsx to handle gating using the new query state.
  - **Acceptance criteria**:
    - [ ] Zustand store only contains synchronous session and biometric state.
    - [ ] useSubscriptionCheck is implemented as a React Query hook using Supabase.
    - [ ] AuthGate properly blocks/redirects users based on the query status (including loading states).

- [ ] **Slice 31: Dashboard Data Fetching & Business Logic Refactor [jules]**
  - **Type**: AFK
  - **Blocked by**: None
  - **What to build**: Unify data fetching for loans and credit transactions using new React Query hooks in queries/loans.ts and queries/creditBook.ts. Extract the Ecosystem Net useMemo computation out of HomeScreen.tsx into a new useDashboardData custom hook. Introduce a DashboardSkeleton loading state.
  - **Acceptance criteria**:
    - [ ] HomeScreen.tsx has no raw useEffect calls for data fetching.
    - [ ] The heavy useMemo aggregation is moved to useDashboardData.ts.
    - [ ] DashboardSkeleton is rendered while useDashboardData is loading.
