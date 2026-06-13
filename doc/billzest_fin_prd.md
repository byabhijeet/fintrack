# BillZest FinTrack — React Native Mobile App PRD
> **Version**: 2.0  
> **Date**: 2026-06-13  
> **Source of Truth**: `billzest_fin/` (React web app) + `latest-sql-dump.sql`  
> **Reference Prototype**: `billzest_fin_flutter/` (basic Flutter build — not the target)  
> **Target**: New React Native (Expo managed) app inside `fnance-tracker/`

---

## 1. Executive Summary

| Item | Detail |
|------|--------|
| **Product** | BillZest FinTrack Mobile |
| **Platform** | iOS & Android (React Native — Expo Managed Workflow) |
| **Backend** | Supabase: `https://jjewdwwvgsojvyqkehcx.supabase.co` (shared with web app) |
| **Goal** | Full feature-parity mobile version of `billzest_fin/` web app |
| **Users** | Individual consumers AND BillZest merchant customers (both use same app) |
| **Offline Support** | v1 = online-only. Offline queue deferred to future sprint. |

**Core Differentiator**: Merges personal P2P ledgers with B2B merchant transactions. A BillZest store customer automatically sees their merchant credit book alongside personal finances.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native (Expo SDK, managed workflow) |
| **Language** | TypeScript |
| **Navigation** | React Navigation v6 (Bottom Tabs + Native Stack) |
| **Global State** | Zustand (auth session, privacy mode, UI state) |
| **Server State** | TanStack React Query v5 (Supabase fetches, caching, background refetch) |
| **Backend** | Supabase JS Client v2 (`@supabase/supabase-js`) |
| **Auth** | Supabase Auth (Phone/OTP via Twilio + Biometric via `expo-local-authentication`) |
| **Camera/OCR** | `expo-camera` + `expo-image-picker` (Vault receipts) |
| **Push Notifications** | Expo Push Notifications + `user_device_tokens` table |
| **Storage** | AsyncStorage (session persistence) |
| **Styling** | StyleSheet + custom theme tokens (no NativeWind/Tailwind) |
| **Icons** | `@expo/vector-icons` (MaterialCommunityIcons) |
| **Charts** | Victory Native (Dashboard charts) |
| **PDF/Share** | `expo-sharing` + `expo-print` |

---

## 3. Project Location

```
fnance-tracker/
├── doc/
│   ├── billzest_fin_prd.md          <- This file
│   ├── billzest_fin_flows.md        <- System flows & data flow maps
│   └── latest-sql-dump.sql          <- Supabase schema source of truth
└── app/                             <- NEW React Native Expo project lives here
    ├── src/
    ├── app.json
    ├── package.json
    └── ...
```

---

## 4. Authentication & Subscription Gate

### 4.1. Auth Flow
```
App Launch
  -> Supabase session check (AsyncStorage)
  -> [No session] -> Login Screen (Phone OTP)
  -> [Session found] -> Biometric prompt (expo-local-authentication)
  -> [Authenticated] -> hasActiveSubscription() check
  -> [Valid] -> Main App (Bottom Tabs)
  -> [Invalid] -> Blocked Screen ("Active Plan Required")
```

### 4.2. Login Screen
- Phone number input (India +91 default, country selector optional)
- "Send OTP" -> `supabase.auth.signInWithOtp({ phone })`
- OTP field (6-digit) -> `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`
- On success -> run subscription check -> navigate to Main App or Block screen

### 4.3. Subscription Gate Logic
The gate mirrors the web app `hasActiveSubscription()` function exactly.

**Check 1 — Personal user (individual plan)**:
```
accounts WHERE auth_id = user.id
  -> if plan_status IN ('active', 'trialing') AND plan_id exists:
      -> plans WHERE id = plan_id
        -> return plan.level >= 1 OR plan.name includes 'level'/'premium'
```

**Check 2 — Org staff user (merchant employee)**:
```
organization_members WHERE user_id = user.id AND is_active = true
  -> subscriptions WHERE organization_id = ... AND status IN ('active','trialing')
    -> plans -> return plan.level >= 1 OR name includes 'level'/'premium'
```

**Block Screen**: If both checks fail -> show lock screen with "Open BillZest App" button. No navigation possible (except sign out).

### 4.4. Biometric Setup
- Post first login: prompt user to enable FaceID/TouchID
- Store token in `expo-secure-store`
- On subsequent launches: biometric prompt skips OTP

---

## 5. Navigation Architecture

### 5.1. 4-Tab Bottom Layout

```
+--------------------------------------------------+
|              Bottom Tab Bar                       |
+----------+----------+----------+------------------+
|  Home    | Credit   |  Split   |    Hub / More    |
| (Tab 1)  |  Book    | (Tab 3)  |    (Tab 4)       |
|          | (Tab 2)  |          |                  |
+----------+----------+----------+------------------+
```

### 5.2. Screen Hierarchy

```
AuthStack (not logged in)
  -> LoginScreen

MainTabs (logged in + valid subscription)
  ├── Tab 1: Home Stack
  │     ├── DashboardScreen          <- landing
  │     ├── IncomeScreen
  │     ├── ExpensesScreen
  │     ├── BusinessScreen
  │     │     -> AddBusinessScreen
  │     ├── CreditCardsScreen
  │     │     -> CardSpendListScreen
  │     ├── LoansScreen
  │     │     -> AddLoanScreen
  │     │     -> LoanDetailScreen   <- amortization schedule
  │     ├── BillsScreen
  │     └── ActivityScreen
  │
  ├── Tab 2: CreditBook Stack
  │     ├── CreditBookListScreen     <- party list + net balances
  │     ├── PartyDetailScreen        <- gave/got ledger
  │     └── AddTransactionScreen
  │
  ├── Tab 3: Split Stack
  │     ├── SplitGroupListScreen
  │     ├── CreateGroupScreen
  │     ├── GroupDetailScreen        <- expense list + balances
  │     ├── AddSplitExpenseScreen    <- split type selection + penny logic
  │     └── SettleUpScreen
  │
  └── Tab 4: Hub Stack (More)
        ├── HubMenuScreen            <- grid of shortcuts
        ├── VaultScreen
        │     -> VaultAddScreen      <- camera + optional OCR
        ├── RewardsScreen
        ├── FlashDealsScreen
        ├── PartnerScreen            <- Refer & Earn
        ├── ProfileScreen
        └── SettingsScreen

Global Overlay (above all tabs)
  -> BOI Bottom Sheet                <- voice/text AI assistant FAB
```

---

## 6. Global App State (Zustand Stores)

### authStore
```typescript
{
  user: SupabaseUser | null,
  profile: Account | null,        // from accounts table
  hasValidSubscription: boolean,
  biometricEnabled: boolean,
  signIn: () => void,
  signOut: () => void,
  refreshProfile: () => void,
}
```

### uiStore
```typescript
{
  privacyMode: boolean,           // masks all monetary values with ***
  togglePrivacyMode: () => void,
  boiOpen: boolean,
  openBOI: () => void,
  closeBOI: () => void,
}
```

### notificationStore
```typescript
{
  unreadCount: number,
  setUnreadCount: (n: number) => void,
}
```

---

## 7. Module Specifications

### 7.1. Dashboard (Home Tab Landing)
**Purpose**: Unified financial health overview  
**Data**: Aggregated from React Query cache across all modules  

**Ecosystem Net Formula**:
```
Ecosystem Net =
  (Personal Income + Business Income + Credit Receivables)
  - (Personal Expenses + Card Spends + Business Expenses + Loan EMIs + Credit Payables)
```

**UI Components**:
- Net summary card (large number + privacy mask toggle)
- 12-month area/bar chart — Inflow vs Outflow (Victory Native)
- Quick stat widgets: Income, Expenses, Business Net, Network Balance
- Quick action grid -> Add Expense, Add Income, Credit Book shortcuts
- Recent transactions feed (last 10 across all categories)

**Edge Cases**:
- Null months in chart -> render 0, never crash
- Loading state -> skeleton cards while React Query fetches

---

### 7.2. Income
**DB Table**: `income_entries` (joined with `finance_categories` WHERE `context = 'income'`)

**CRUD**:
- Create: `INSERT INTO income_entries (source_id, entry_date, amount, notes, meta)`
- Read: `SELECT * FROM income_entries WHERE user_id = auth.uid() ORDER BY entry_date DESC`
- Update: `UPDATE income_entries SET ... WHERE id = ? AND user_id = auth.uid()`
- Delete: `DELETE FROM income_entries WHERE id = ? AND user_id = auth.uid()`

**Form Fields**: Amount*, Date* (date picker), Source* (from `finance_categories` context=income), Notes  
**Validations**: Amount > 0, Date <= today, Source required

---

### 7.3. Personal Expenses
**DB Table**: `finance_entries` WHERE `context = 'expense'`

**CRUD**:
- Create: `INSERT INTO finance_entries (category_id, context='expense', entry_date, amount, label, description, receipt_url, tags, meta)`
- Read/Update/Delete: standard by user_id

**Form Fields**: Amount*, Date*, Category* (from `finance_categories` context=expense), Label, Description, Receipt (camera/gallery), Tags  
**Validations**: Amount > 0, Category required

**Outflow** (same table, `context = 'outflow'`):
Same form and behavior, categories from `finance_categories WHERE context = 'outflow'`

---

### 7.4. Business Ledger
**DB Tables**: `businesses`, `business_income`, `business_expenses`

**Business Switcher**: Picker at top if user has multiple businesses.

**Business CRUD**: `INSERT/UPDATE/DELETE FROM businesses WHERE user_id = auth.uid()`  
**Business Income CRUD**: Linked to `business_id`. Fields: `amount`, `entry_date`, `source_description`, `notes`  
**Business Expense CRUD**: Linked to `business_id`. Fields: `amount`, `entry_date`, `category` (text), `description`, `receipt_url`

**Business Net** (in-memory):
```
Net = SUM(business_income.amount) - SUM(business_expenses.amount)
```
Filtered by `business_id` and selected date range.

---

### 7.5. Credit Cards
**DB Tables**: `credit_cards`, `card_spends`

> WARNING: `credit_cards.last4` is `character` type (single char) in DB. Store only the last 4 digits displayed as text, mapped to this column.

**Credit Card CRUD**: `card_name`, `bank`, `last4`, `credit_limit`, `billing_day`  
**Card Spend CRUD**: `card_id`, `spend_date`, `merchant`, `category`, `amount`, `notes`, `receipt_url`  
**Utilization**: `SUM(card_spends for current cycle) / credit_limit * 100`  
**Billing Cycle**: Determined by `billing_day`. Current cycle = last billing_day to today.

---

### 7.6. Loan Tracker
**DB Tables**: `loans`, `loan_emi_payments`, `loan_amortisation_schedule`, `loan_part_payments`, `loan_foreclosures`

**Loan Types**: `Home Loan | Car Loan | Personal Loan | Education Loan | Business Loan | Gold Loan | Mortgage | Other`  
**Interest Types**: `reducing` (diminishing balance) | `flat`

**EMI Calculation**:
```
Reducing Balance: EMI = P x r x (1+r)^n / ((1+r)^n - 1)
  where r = annual_rate / 12 / 100,  n = tenure_months

Flat Rate: EMI = (P + P x annual_rate/100 x n/12) / n
```

**Amortization Schedule Generation** (on Add Loan):
- Loop tenure_months iterations
- Each month: calculate interest_component, principal_component, closing_balance
- Bulk insert into `loan_amortisation_schedule`

**Add Loan Form Fields**: Lender Name*, Loan Type*, Principal*, Interest Rate*, Interest Type*, Tenure months*, Start Date*, EMI Day, Account Number, Foreclosure Charge %, Notes

**Payment Actions**:
- **Log EMI**: `INSERT INTO loan_emi_payments` -> mark matching schedule row as 'paid'
- **Part Payment**: User selects `reduce_emi` or `reduce_tenure` -> recalculate remaining schedule from current month -> update `loan_amortisation_schedule`
- **Foreclosure**: Calculate charge, `INSERT INTO loan_foreclosures`, set `loans.status = 'foreclosed'`

---

### 7.7. Bills (My Bills)
**DB Table**: `recurring_templates`

**Fields**: `title`, `amount`, `frequency` (daily/weekly/monthly/yearly), `category_id`, `next_due`, `last_run`, `is_active`

**Display**: Sorted by `next_due`. Overdue = red highlight.  
**"Mark Paid"**: Update `last_run = today`, calculate new `next_due` based on frequency.  
**Auto-process on open**: If `next_due <= today AND is_active = true` -> auto-create finance_entries.

---

### 7.8. Credit Book (Tab 2)
**DB Tables**: `personal_credit_parties`, `personal_credit_transactions`, `credit_transactions` (B2B read-only), `organizations`, `account_relationships`

**Unified Ledger Modes**:
1. **P2P**: Personal parties added by user
2. **B2B Merchant Sync**: If party mobile matches a BillZest org via `account_relationships`, fetch `credit_transactions` for that org and display merged (read-only)

**Party List**: Shows net balance per party.  
```
Net balance = SUM(got transactions) - SUM(gave transactions)  [in-memory reducer]
Green = receivable, Red = payable
```

**Add Party**: `INSERT INTO personal_credit_parties (name, mobile, notes)`  
Unique constraint on (user_id, mobile) -> if conflict: show "Contact already exists" + link to party

**Transaction Types**: `gave` (you lent) | `got` (you received)  
**Fields**: `type*`, `amount*`, `txn_date*`, `note`, `counterparty_mob*`

**WhatsApp Reminder**: `whatsapp://send?phone=91{mobile}&text=Hi, you owe me Rs.{amount}`

**Merchant Sync Flow**:
```
Open Party Detail
  -> Check if party.mobile matches any org via account_relationships
  -> If match: fetch credit_transactions WHERE org_id = match AND party_id = user.account_id
  -> Merge B2B into P2P list (display only, not writable)
```

---

### 7.9. Expense Split (Tab 3)
**DB Tables**: `split_groups`, `split_group_members`, `split_expenses`, `split_expense_participants`, `split_settlements`

**Group Types**: `trip | home | office | couple | other`

**Add Split Expense Flow**:
1. Select group, enter amount, description, category, payer, date
2. Choose split type: `Equal | Percent | Manual | Share | Itemized`
3. Calculate participant shares (penny algorithm below)
4. Validate: SUM(shares) MUST === total amount — block submit if not
5. `INSERT INTO split_expenses`, then bulk `INSERT INTO split_expense_participants`

**CRITICAL — Penny Rounding Algorithm** (must produce exact totals):
```javascript
// Equal split
base = Math.floor(total / memberCount * 100) / 100
remainder = total - (base * memberCount)
participants[0].share_amount += remainder   // first participant absorbs penny

// Shares split
base = Math.floor(total / totalShares * shares_i * 100) / 100
remainder = total - SUM(all bases)
participants[last].share_amount += remainder  // last participant absorbs penny

// Manual/Exact
SUM must equal total -> block submit with validation error if not
```

**Settlement**: Write to `split_settlements` (NOT personal_credit_transactions)
```
INSERT INTO split_settlements (payer_id, receiver_id, receiver_mob, amount, method, group_id)
```

---

### 7.10. Receipt Vault (Hub)
**DB Table**: `vault_entries`  
**Supabase Storage Bucket**: `fintrack_vault`

**Add Entry Flow**:
1. expo-image-picker or expo-camera -> capture image
2. Optional: on-device OCR -> extract amount, date, vendor
3. If OCR fails -> pre-fill available fields, leave rest blank (manual override)
4. Upload: `storage.from('fintrack_vault').upload(path, file)`
5. Get signed URL: `storage.from('fintrack_vault').createSignedUrl(path, 31536000)` (1 year)
6. `INSERT INTO vault_entries (name, bill_date, receipt_url, notes)`
   - BLOCK insert if upload failed

**Vault List**: Grid thumbnail view. Tap to view full image.

---

### 7.11. Rewards & Offers (Hub)
**DB Tables**: `offers`, `bank_offers`, `user_points`, `redemptions`, `customer_vouchers`

**Display**: Fetch active offers + bank offers, show user point balance from `user_points`  
**Redeem**: `INSERT INTO redemptions (user_id, reward_title, points_spent, redemption_code)`

---

### 7.12. Flash Deals (Hub)
**DB Table**: `flash_deals`  
**Query**: `SELECT * FROM flash_deals WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())`  
**Filter**: `app_target IN ('all', 'fintrack')`  
**Action**: "Shop Now" -> `Linking.openURL(deal_url)`

---

### 7.13. Partner / Refer & Earn (Hub)
**DB Tables**: `partner_referrals`, `accounts`  
**Display**: User's `accounts.billzest_id` as referral code, referral list  
**Share**: `expo-sharing` native share sheet

---

### 7.14. Activity / Notifications (Hub)
**DB Table**: `notifications`  
**Query**: `SELECT * FROM notifications WHERE user_id = auth.uid() OR scope = 'platform' ORDER BY created_at DESC LIMIT 50`  
**Realtime**: Supabase Realtime subscription -> increment unread badge  
**Pagination**: Infinite scroll (50 per page)

---

### 7.15. Settings & Profile (Hub)
**DB Tables**: `accounts`, `account_consents`

**Profile**: Edit `full_name`, `upi_id`, `address`, `avatar_url` -> call `update_my_account_settings` RPC  
**Settings**: Privacy mode toggle, biometric toggle, consent preferences, sign out

---

### 7.16. BOI AI Assistant (Global FAB)
**Trigger**: Floating Action Button pinned above bottom tab bar  
**Interface**: Bottom Sheet with text input + microphone button  
**Voice**: `expo-speech` (Speech-to-Text)  
**Parsing**: Local rules-based NLP (port from web `intentParser.ts`) + optional `llm-proxy` edge function

**Intent Map**:

| User Input | Intent | Action |
|-----------|--------|--------|
| "Spent 500 on lunch" | `add_expense` | Pre-fill ExpensesScreen form |
| "Got 2000 from Rahul" | `add_credit_got` | Pre-fill CreditBook add |
| "Gave 1500 to Priya" | `add_credit_gave` | Pre-fill CreditBook add |
| "Card spend 800 at Swiggy" | `add_card_spend` | Pre-fill CardSpend form |
| "Open loans" | `navigate` | Navigate to LoansScreen |
| "Add income 5000 salary" | `add_income` | Pre-fill IncomeScreen |

**Parse Failure**: If intent unclear -> show manual form with whatever fields were extracted, disable Save until all required fields are filled.

---

## 8. Database Schema — Finance Tables

| Table | Key Columns | Notes |
|-------|------------|-------|
| `accounts` | `auth_id`, `full_name`, `mobile`, `plan_id`, `plan_status`, `reward_points`, `upi_id`, `billzest_id` | User profile + plan gate |
| `plans` | `id`, `level`, `name`, `slug`, `price` | Level >= 1 = FinTrack access |
| `subscriptions` | `organization_id`, `status`, `plan_id` | Org-level check for merchant staff |
| `organization_members` | `user_id`, `organization_id`, `is_active` | View — used in sub gate |
| `finance_categories` | `id`, `name`, `context` (expense/outflow/income/business_expense), `monthly_budget` | Shared categories |
| `finance_entries` | `id`, `category_id`, `context`, `entry_date`, `amount`, `receipt_url`, `tags`, `meta` | Personal expenses + outflows |
| `income_entries` | `id`, `source_id` (-> finance_categories), `entry_date`, `amount`, `notes`, `meta` | Personal income |
| `businesses` | `id`, `user_id`, `name`, `description`, `is_active` | |
| `business_income` | `id`, `business_id`, `entry_date`, `amount`, `source_description` | |
| `business_expenses` | `id`, `business_id`, `entry_date`, `amount`, `category`, `description`, `receipt_url` | |
| `recurring_templates` | `id`, `title`, `amount`, `frequency`, `next_due`, `last_run`, `is_active` | Bills |
| `credit_cards` | `id`, `card_name`, `bank`, `last4` (char!), `credit_limit`, `billing_day` | WARNING: last4 is char type |
| `card_spends` | `id`, `card_id`, `spend_date`, `merchant`, `category`, `amount`, `receipt_url` | |
| `loans` | `id`, `lender_name`, `loan_type`, `principal_amount`, `interest_rate`, `interest_type`, `tenure_months`, `start_date`, `emi_amount`, `status` | |
| `loan_amortisation_schedule` | `loan_id`, `installment_no`, `emi_month`, `principal_component`, `interest_component`, `closing_balance`, `status` | |
| `loan_emi_payments` | `loan_id`, `payment_date`, `emi_month`, `principal_paid`, `interest_paid`, `total_paid` | |
| `loan_part_payments` | `loan_id`, `amount`, `impact_type` (reduce_emi/reduce_tenure), `new_emi`, `new_tenure_months` | |
| `loan_foreclosures` | `loan_id`, `foreclosure_date`, `outstanding_principal`, `foreclosure_charge_amount` | |
| `personal_credit_parties` | `id`, `name`, `mobile`, `friend_id`, `status` | P2P contacts. Unique (user_id, mobile) |
| `personal_credit_transactions` | `id`, `creator_id`, `party_id`, `type` (gave/got), `amount`, `txn_date`, `settled` | P2P ledger |
| `credit_transactions` | `id`, `organization_id`, `party_id`, `type` (received/given), `amount`, `date` | B2B — READ ONLY in FinTrack |
| `split_groups` | `id`, `creator_id`, `name`, `type`, `icon`, `cover_color` | |
| `split_group_members` | `group_id`, `user_id`, `role` (admin/member) | |
| `split_expenses` | `id`, `group_id`, `payer_id`, `amount`, `currency`, `category`, `description`, `expense_date` | |
| `split_expense_participants` | `id`, `expense_id`, `friend_mob`, `share_amount`, `share_percent`, `split_type` | |
| `split_settlements` | `id`, `payer_id`, `receiver_mob`, `amount`, `method`, `group_id` | NOT personal_credit_transactions |
| `vault_entries` | `id`, `user_id`, `name`, `bill_date`, `receipt_url`, `notes` | |
| `offers` | `id`, `title`, `points_required`, `store_type`, `partner_name`, `is_active` | |
| `bank_offers` | `id`, `category`, `company_name`, `offer_url`, `banner_image_url`, `is_enabled` | |
| `flash_deals` | `id`, `title`, `deal_url`, `expires_at`, `discount_percentage`, `is_active`, `app_target` | |
| `user_points` | `user_id`, `balance`, `total_earned` | |
| `redemptions` | `user_id`, `reward_title`, `points_spent`, `status` | |
| `notifications` | `user_id`, `scope`, `type`, `title`, `message`, `is_read` | Realtime subscribed |
| `partner_referrals` | `partner_id`, `referred_user_mobile`, `status`, `commission_earned` | |
| `user_device_tokens` | `user_id`, `device_token`, `platform` (android/ios) | Push notification registration |

---

## 9. Business Rules & Critical Constraints

| Rule | Screen |
|------|--------|
| Subscription Level >= 1 required | Auth gate — checked on every login |
| Amount > 0 (DB CHECK constraint) | All entry forms |
| Split shares must sum to total EXACTLY | AddSplitExpenseScreen |
| Penny remainder -> first participant (equal) or last (shares) | Penny algorithm |
| Loan EMI always formula-calculated, never hardcoded | AddLoanScreen |
| Part-payment recalculates full remaining amortization schedule | LoanDetailScreen |
| Credit party mobile unique per user — show existing on conflict | AddPartyScreen |
| Settlements go to `split_settlements` ONLY, NOT `personal_credit_transactions` | SettleUpScreen |
| B2B merchant transactions are READ-ONLY in FinTrack | PartyDetailScreen |
| Vault: DB insert blocked until image upload succeeds | VaultAddScreen |
| `credit_cards.last4` is char type — send as string, single char may truncate | CardFormScreen |

---

## 10. Error Handling Matrix

| Scenario | Response |
|---------|---------|
| OTP timeout / not received | "Resend OTP" button (enabled after 30s countdown) |
| No active plan | Hard block screen + "Open BillZest App" CTA |
| Network error on write | Toast: "Failed to save. Check your connection." |
| Split shares don't equal total | Block Save, show inline error per participant |
| OCR fails to extract amount | Pre-fill available fields, leave amount blank, allow manual entry |
| Credit party mobile duplicate | "Contact already exists" toast + link to existing party |
| Image upload fails (Vault) | Toast error, allow retry — do NOT insert DB row |
| BOI parse failure / ambiguous | Switch to manual form with pre-filled partial data |
| Biometric fails 3 times | Fall back to OTP screen |
| Part payment recalculation error | Show error toast, do not save — keep original schedule |

---

## 11. Testing Strategy

| Testing Level | Scope | Tools |
|---------------|-------|-------|
| **Unit Testing** | Mandatory for all complex math and logic (Penny Algorithm, EMI Engine, Subscription Gate, Dashboard Aggregations). | `Jest` |
| **Component / Integration** | Key UI flows, forms, and component bindings to React Query and Zustand. API calls are mocked. | `Jest` + `@testing-library/react-native` |
| **Manual / HITL** | Hard-to-automate native hardware integrations (Biometrics, Camera, OCR, BOI Voice Assistant, Share sheets). | Expo Go / Dev Builds |
| **E2E Testing** | Skipped for v1 to maximize development speed. | N/A |

---

## 12. Open Questions (Resolve Before Building)

> These items need a decision before the relevant sprint:

1. **Outflow vs Expenses on Mobile**: Web shows both as separate pages under Personal. Should mobile combine into one screen with a context toggle, or show as separate tab items?
2. **Split Group Member Deletion**: If a member with outstanding balance is removed — soft-delete to preserve history, or block removal entirely?
3. **Weekly Digest**: `weekly_digests` table exists with AI-generated summaries. Should the mobile app display these? (Dedicated screen or dashboard card?)
4. **Car Maintenance**: `car_maintenance` table exists. Is this in v1 scope?
5. **Multi-currency Split**: `split_expenses.currency` supports non-INR. Is multi-currency needed for v1?
6. **Push Notification Triggers**: Device token registered on login via `user_device_tokens`. What events trigger pushes? (Bill reminders? Deal alerts? Credit book reminders?)
