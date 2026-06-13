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

- [ ] **Slice 3: Subscription Gate & Biometric Prompt**
  - **Type**: AFK
  - **Blocked by**: Slice 2
  - **Description**: Add `expo-local-authentication` (FaceID/TouchID), check subscription status against the `accounts` and `subscriptions` tables, and build the Blocked Screen for users without an active plan. *Must include Unit Tests for the gate logic.*

- [ ] **Slice 4: Income Entry & React Query Setup**
  - **Type**: AFK
  - **Blocked by**: Slice 2
  - **Description**: Set up TanStack React Query. Build the Add Income form and list view, reading/writing to `income_entries` and `finance_categories`.

- [ ] **Slice 5: Personal Expenses & Outflows**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Build the Expense and Outflow form + list view using `finance_entries` with category selection.

- [ ] **Slice 6: Dashboard Net Overview & Charts**
  - **Type**: AFK
  - **Blocked by**: Slices 4, 5
  - **Description**: Build the Dashboard landing page. Calculate the Ecosystem Net and add the Victory Native area/bar charts.

- [ ] **Slice 7: Credit Cards & Spends Tracker**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Add Credit Card management, Card Spends logging, and calculate credit utilization based on billing cycles.

- [ ] **Slice 8: Business Ledger (Multi-business)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Build the Business Switcher, record Business Income/Expenses, and calculate Business Net.

- [ ] **Slice 9: Loan Tracker & Amortization Engine**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Build the Add Loan form with EMI math (reducing/flat). Generate and insert the `loan_amortisation_schedule`. *Must include Unit Tests for the EMI and Amortization calculations.*

- [ ] **Slice 10: Loan Part Payments & Foreclosure**
  - **Type**: AFK
  - **Blocked by**: Slice 9
  - **Description**: Implement loan part payments (reduce EMI or tenure), recalculating the remaining schedule, and handle loan foreclosure.

- [ ] **Slice 11: Bills (Recurring Templates)**
  - **Type**: AFK
  - **Blocked by**: Slice 5
  - **Description**: Build the Recurring Templates view. Implement "Mark Paid" and auto-process active bills on app launch.

- [ ] **Slice 12: Credit Book (P2P Ledger)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Add Credit Parties (enforcing mobile uniqueness). Build the Add Transaction (gave/got) form and show net balances.

- [ ] **Slice 13: Credit Book (B2B Merchant Sync)**
  - **Type**: AFK
  - **Blocked by**: Slice 12
  - **Description**: Detect if a party mobile matches a BillZest org, fetch B2B transactions, and merge them as read-only into the ledger.

- [ ] **Slice 14: Expense Split (Groups & Penny Algorithm)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Create Split Groups and add Split Expenses using the penny-rounding algorithm (equal, percent, exact, shares). *Must include Unit Tests for the penny algorithm math.*

- [ ] **Slice 15: Split Settlements**
  - **Type**: AFK
  - **Blocked by**: Slice 14
  - **Description**: Implement "Settle Up" to record payments between group members in `split_settlements`.

- [ ] **Slice 16: Vault (Camera & Storage Upload)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Integrate camera/gallery. Upload receipt images to Supabase storage and create `vault_entries`.

- [ ] **Slice 17: Hub Extras (Rewards, Deals, Partner)**
  - **Type**: AFK
  - **Blocked by**: Slice 4
  - **Description**: Display Rewards (points/redemptions), active Flash Deals, and Partner Referral screens.

- [ ] **Slice 18: Profile, Settings, & Realtime Notifications**
  - **Type**: AFK
  - **Blocked by**: Slices 2, 6
  - **Description**: Edit user profile via RPC, implement the Privacy Mode toggle in `uiStore`, and add Realtime notifications to the Activity tab.

- [ ] **Slice 19: BOI AI Assistant (Voice to Intent)**
  - **Type**: HITL
  - **Blocked by**: Slices 5, 7, 12
  - **Description**: Build the Global FAB Bottom Sheet, integrate STT (`expo-speech`), and map intents to pre-fill various module forms.
