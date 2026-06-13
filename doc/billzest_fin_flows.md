# BillZest FinTrack — React Native System & UI Flows
> **Version**: 2.0  
> **Date**: 2026-06-13  
> **Source of Truth**: `billzest_fin/` web app + `latest-sql-dump.sql`

---

## 1. Product Architecture Flow

```mermaid
graph TD
    User([Mobile User]) --> AppLaunch{Expo App Load}
    AppLaunch --> SessionCheck{Supabase Session?}
    
    SessionCheck -->|No Session| LoginScreen[Login Screen - Phone OTP]
    SessionCheck -->|Session Found| BiometricPrompt[Biometric Prompt]
    
    BiometricPrompt -->|Pass| SubCheck
    BiometricPrompt -->|Fail 3x| LoginScreen
    LoginScreen -->|OTP Verified| SubCheck
    
    SubCheck{hasActiveSubscription?}
    SubCheck -->|Level >= 1 via accounts/subscriptions| ZustandStore[Zustand Global Store]
    SubCheck -->|No valid plan| BlockedScreen[Active Plan Required Screen]
    
    ZustandStore --> ReactQuery[React Query - Supabase Fetches]
    ReactQuery --> Navigation[React Navigation Bottom Tabs]
    Navigation --> Tab1[Tab 1: Home]
    Navigation --> Tab2[Tab 2: Credit Book]
    Navigation --> Tab3[Tab 3: Split]
    Navigation --> Tab4[Tab 4: Hub / More]
```

---

## 2. Subscription Gate Logic Flow

```mermaid
flowchart TD
    Start([User authenticated]) --> FetchAccount[Fetch accounts WHERE auth_id = user.id]
    
    FetchAccount --> AccExists{Account row exists?}
    AccExists -->|No| Block([BLOCKED])
    
    AccExists -->|Yes| CheckStatus{plan_status = active OR trialing?}
    CheckStatus -->|No| CheckOrg[Check organization_members for user]
    
    CheckStatus -->|Yes| FetchPlan[Fetch plans WHERE id = account.plan_id]
    FetchPlan --> CheckLevel{plan.level >= 1 OR name includes level/premium?}
    CheckLevel -->|Yes| Allow([ALLOWED])
    CheckLevel -->|No| CheckOrg
    
    CheckOrg --> OrgFound{org membership found?}
    OrgFound -->|No| Block
    OrgFound -->|Yes| FetchSub[Fetch subscriptions WHERE org_id = ... AND status active/trialing]
    FetchSub --> OrgSubLevel{org plan.level >= 1?}
    OrgSubLevel -->|Yes| Allow
    OrgSubLevel -->|No| Block
```

---

## 3. Navigational Architecture

```mermaid
mindmap
  root((FinTrack Mobile))
    Auth Stack
      Login - Phone OTP
      OTP Verification
      Biometric Setup
      Subscription Block Screen
    Tab 1: Home
      Dashboard - Ecosystem Net + Charts
      Income Entry + Sources
      Expenses - Personal + Outflow
      Business - Multi-business P and L
      Credit Cards - Spends + Utilization
      Loans - Add + Amortization + Payments
      Bills - Recurring templates
      Activity - Notifications
    Tab 2: Credit Book
      Party List - Net Balances
      Party Detail - P2P + B2B Merged Ledger
      Add Transaction - Gave or Got
    Tab 3: Split
      Group List
      Create Group
      Group Detail - Expenses + Who Owes Whom
      Add Split Expense - Penny Algorithm
      Settle Up
    Tab 4: Hub
      Vault - Camera + OCR + Storage
      Rewards and Offers
      Flash Deals
      Partner - Refer and Earn
      Profile and Settings
    Global Overlay
      BOI AI Assistant - Bottom Sheet FAB
      Privacy Mode - Masks all numbers
```

---

## 4. Read Data Flow (Supabase -> UI)

```mermaid
flowchart TD
    Login([Login Success]) --> SubCheck[Subscription Check]
    SubCheck --> InitQueries[Initialize React Query]
    InitQueries --> Q1[useQuery: income_entries]
    InitQueries --> Q2[useQuery: finance_entries - expense + outflow]
    InitQueries --> Q3[useQuery: business_income + business_expenses]
    InitQueries --> Q4[useQuery: credit_cards + card_spends]
    InitQueries --> Q5[useQuery: loans + amortisation_schedule]
    InitQueries --> Q6[useQuery: personal_credit_parties + transactions]
    InitQueries --> Q7[useQuery: split_groups + expenses + settlements]
    InitQueries --> Q8[useQuery: recurring_templates]
    InitQueries --> Q9[useQuery: notifications - Realtime]
    
    Q1 & Q2 & Q3 & Q4 & Q5 & Q6 & Q7 & Q8 --> Cache[React Query Cache]
    Cache --> Dashboard[Dashboard - aggregates from cache]
    Cache --> ModuleScreens[Module Screens - filtered views]
    
    Q9 --> RealtimeSub[Supabase Realtime subscription]
    RealtimeSub --> NotificationBadge[Update unread count in Zustand]
```

---

## 5. Write Data Flow (UI -> Supabase)

```mermaid
flowchart TD
    UserAction([User taps Save]) --> FormValidation{Form Valid?}
    FormValidation -->|No| ShowError[Show inline validation error]
    FormValidation -->|Yes| MutationFn[React Query useMutation]
    
    MutationFn --> SupabaseWrite[supabase.from table .insert / update / delete]
    SupabaseWrite -->|Success| InvalidateQuery[queryClient.invalidateQueries for affected table]
    InvalidateQuery --> Refetch[React Query auto-refetch]
    Refetch --> UIUpdate[UI updates from fresh cache]
    
    SupabaseWrite -->|Error| ToastError[Toast: Failed to save. Check connection.]
    
    MutationFn --> OptimisticUI{Optimistic update needed?}
    OptimisticUI -->|Yes - for list items| OptimisticUpdate[Update cache before server confirms]
```

---

## 6. Module Flows

### 6.1. Add Income Flow
```
IncomePage
  -> Tap Add (+)
  -> IncomeFormSheet opens
  -> Select source from finance_categories WHERE context='income'
  -> Enter amount, date, notes
  -> Tap Save
  -> supabase.from('income_entries').insert({source_id, entry_date, amount, notes})
  -> Invalidate income_entries query
  -> Sheet closes, list refreshes, toast "Income added"
```

### 6.2. Add Personal Expense Flow
```
ExpensesPage
  -> Tap Add
  -> ExpenseFormSheet opens
  -> Select category from finance_categories WHERE context='expense'
  -> Enter amount, date, label, optional receipt (camera/gallery)
  -> If receipt: upload to fintrack_vault, get URL
  -> supabase.from('finance_entries').insert({context:'expense', category_id, entry_date, amount, receipt_url, ...})
  -> Invalidate finance_entries query
  -> Dashboard Ecosystem Net re-calculates
```

### 6.3. Add Loan + Generate Amortization
```mermaid
flowchart TD
    AddLoan[User fills Loan Form] --> CalcEMI{Interest Type?}
    CalcEMI -->|Reducing| ReducingEMI["EMI = P×r×(1+r)^n / ((1+r)^n - 1)"]
    CalcEMI -->|Flat| FlatEMI["EMI = (P + P×r×n/12) / n"]
    
    ReducingEMI --> GenSchedule[Loop tenure months - generate installment array]
    FlatEMI --> GenSchedule
    
    GenSchedule --> InsertLoan[INSERT INTO loans]
    InsertLoan --> BulkInsert[Bulk INSERT INTO loan_amortisation_schedule]
    BulkInsert --> NavDetail[Navigate to LoanDetailScreen]
    NavDetail --> ShowSchedule[Display amortization table + upcoming EMIs]
```

### 6.4. Part Payment Flow
```
LoanDetailScreen -> Tap Part Payment
  -> Enter amount, payment mode, date
  -> Choose impact: reduce_emi OR reduce_tenure
  -> Recalculate remaining schedule from current month onward
  -> INSERT INTO loan_part_payments
  -> UPDATE remaining loan_amortisation_schedule rows
  -> Invalidate loan queries
  -> Show updated schedule + "Months saved: X, Interest saved: Rs.Y"
```

### 6.5. Credit Book — Add Transaction
```mermaid
flowchart TD
    OpenCreditBook([Open Credit Book Tab]) --> FetchParties[Fetch personal_credit_parties]
    FetchParties --> CheckMerchant{Any party.mobile matches org via account_relationships?}
    CheckMerchant -->|Yes| FetchB2B[Fetch credit_transactions for that org]
    CheckMerchant -->|No| ShowPartyList
    FetchB2B --> MergeTransactions[Merge B2B + P2P in PartyDetailScreen]
    
    MergeTransactions --> ShowPartyList[Show party list with net balances]
    ShowPartyList --> SelectParty[Tap party]
    SelectParty --> PartyDetail[PartyDetailScreen - combined ledger]
    
    PartyDetail --> TapGave[Tap I Gave]
    PartyDetail --> TapGot[Tap I Got]
    
    TapGave --> TransactionForm[Enter amount, date, note]
    TapGot --> TransactionForm
    
    TransactionForm --> InsertTxn["INSERT INTO personal_credit_transactions (type, amount, party_id, txn_date)"]
    InsertTxn --> RecalcBalance[Recalculate net balance in-memory]
    RecalcBalance --> UpdateList[Refresh party list balance badge]
```

### 6.6. Expense Split — Penny Algorithm
```mermaid
flowchart TD
    AddExp[User submits split expense] --> SelectMode{Split Mode?}
    
    SelectMode --> Equal[Equal]
    SelectMode --> Percent[Percent]
    SelectMode --> Manual[Manual / Exact]
    
    Equal --> CalcBase["base = floor(total / count * 100) / 100"]
    CalcBase --> CalcRemainder["remainder = total - (base * count)"]
    CalcRemainder --> AssignFirst["participants[0].share += remainder"]
    AssignFirst --> Validate
    
    Percent --> CalcPct["share_i = round(total * pct_i / 100 * 100) / 100"]
    CalcPct --> PctRemainder["remainder = total - SUM(shares)"]
    PctRemainder --> AssignLast["participants[last].share += remainder"]
    AssignLast --> Validate
    
    Manual --> Validate{SUM(shares) == total?}
    Validate -->|No| BlockError[Block Save - show validation error]
    Validate -->|Yes| InsertExpense["INSERT INTO split_expenses"]
    InsertExpense --> InsertParticipants["Bulk INSERT INTO split_expense_participants"]
    InsertParticipants --> RecalcDebts[Recalculate who owes whom in-memory]
```

### 6.7. Split Settlement Flow
```
GroupDetailScreen -> Tap Settle Up
  -> Calculate simplified debts (minimized transactions algorithm)
  -> Show list: "Rahul pays You Rs.500"
  -> User confirms one settlement
  -> Validate: amount <= amount owed
  -> INSERT INTO split_settlements (payer_id, receiver_id, receiver_mob, amount, method, group_id)
  -> Recalculate group balance
  -> Toast "Settlement recorded"

NOTE: settlements go to split_settlements ONLY - NOT to personal_credit_transactions
```

### 6.8. Vault — Receipt Upload
```mermaid
flowchart TD
    VaultScreen --> TapAdd[Tap Add Receipt]
    TapAdd --> PickSource{Source?}
    PickSource --> Camera[expo-camera - snap photo]
    PickSource --> Gallery[expo-image-picker - choose from gallery]
    
    Camera --> TryOCR[On-device text recognition]
    Gallery --> TryOCR
    
    TryOCR -->|OCR success| PreFill[Pre-fill amount, date, vendor]
    TryOCR -->|OCR fail| BlankForm[Open form with blank fields]
    
    PreFill --> UserConfirm[User reviews + confirms data]
    BlankForm --> UserConfirm
    
    UserConfirm --> Upload["storage.from('fintrack_vault').upload(path, file)"]
    Upload -->|Success| GetURL["createSignedUrl(path, 31536000)"]
    GetURL --> InsertDB["INSERT INTO vault_entries (name, bill_date, receipt_url, notes)"]
    InsertDB --> Success[Toast: Receipt saved]
    
    Upload -->|Error| UploadFail[Toast: Upload failed. Retry.]
```

### 6.9. BOI AI Assistant Flow
```mermaid
flowchart TD
    TapFAB([User taps FAB]) --> OpenSheet[Open Bottom Sheet]
    
    OpenSheet --> InputMethod{Input Method?}
    InputMethod --> TypeText[User types text]
    InputMethod --> HoldMic[User holds mic button]
    
    HoldMic --> STT[expo-speech - native Speech-to-Text]
    STT --> TextString[Convert to string]
    TypeText --> TextString
    
    TextString --> IntentParser[Local NLP intent parser]
    IntentParser --> ParseResult{Intent found?}
    
    ParseResult -->|Clear intent| ShowConfirmation[Show parsed data for confirmation]
    ParseResult -->|Ambiguous| PartialFill[Show manual form with partial pre-fills - disable Save]
    
    ShowConfirmation --> UserApprove{User taps Save?}
    UserApprove -->|Yes| SupabaseInsert[Execute appropriate Supabase insert]
    UserApprove -->|No| EditForm[Allow user to edit before saving]
    
    SupabaseInsert --> InvalidateQuery[Invalidate relevant React Query]
    InvalidateQuery --> CloseSheet[Close sheet + show success toast]
```

---

## 7. CRUD Flows Matrix

| Entity | Create | Read | Update | Delete | Validations |
|--------|--------|------|--------|--------|-------------|
| **Income Entry** | Form + source select | List sorted by date | Edit amount/date/source | Delete by id | amount > 0, source required |
| **Personal Expense** | Form + category select + receipt | List by date | Edit all fields | Delete by id | amount > 0, category required |
| **Business** | Name + description | Switcher list | Edit name | Soft delete (is_active=false) | Name required |
| **Business Income/Expense** | Form per business | Filtered by business_id | Edit | Delete | amount > 0 |
| **Credit Card** | Form: name, bank, last4, limit | Card list | Edit details | Delete card | last4 <= 4 chars |
| **Card Spend** | Form: card, date, merchant, amount | Filtered by card + billing cycle | Edit | Delete | amount > 0, card required |
| **Loan** | Full form + EMI calculation + schedule generation | List + detail with schedule | Log payments only | Mark closed | Formula validation |
| **Recurring Template** | Title + amount + frequency + next_due | Sorted by next_due | Edit | is_active=false | frequency required |
| **Credit Party** | Name + mobile | List with net balances | Edit name/notes | Soft delete | Mobile unique per user |
| **Credit Transaction** | Gave or Got + amount | Party detail ledger | Not supported | Not supported | amount > 0 |
| **Split Group** | Name + type + members | Group list | Add/remove members | Archive | Min 1 member |
| **Split Expense** | Full form + penny algorithm | Group ledger | Not supported after create | Delete group expense | SUM(shares) == total |
| **Split Settlement** | Confirm amount + method | Included in balance calc | Not supported | Not supported | amount <= owed |
| **Vault Entry** | Camera + upload + DB insert | Grid thumbnail view | Edit name/notes | Delete (and storage object) | Upload must succeed first |

---

## 8. State Flows

### 8.1. Loan Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Active: Loan Created
    Active --> Active: EMI Payments logged
    Active --> Active: Part Payment made
    Active --> Foreclosed: Foreclosure submitted
    Active --> Closed: All EMIs paid
    Foreclosed --> [*]
    Closed --> [*]
```

### 8.2. Privacy Mode
```mermaid
stateDiagram-v2
    [*] --> Visible: App launch default
    Visible --> Masked: User taps eye icon
    Masked --> Visible: User taps eye icon again
    
    note right of Masked
      All monetary Text components
      render as *** from uiStore.privacyMode
    end note
```

### 8.3. Split Expense Participant
```mermaid
stateDiagram-v2
    [*] --> Unpaid: Expense created, share assigned
    Unpaid --> PartiallySettled: Partial settlement recorded
    PartiallySettled --> Settled: Full settlement recorded
    Unpaid --> Settled: Full settlement in one go
```

---

## 9. Error & Edge Case Flows

| Module | Edge Case | Handling |
|--------|----------|---------|
| Auth | OTP not received | Resend button active after 30s countdown |
| Auth | Biometric fails 3 times | Fall back to OTP screen |
| Auth | Plan expired mid-session | On next launch: show block screen |
| Split | Equal split with rounding | Penny to participants[0] (first in list) |
| Split | Manual split doesn't equal total | Block Save button, show error per participant |
| Split | Member removed with balance | OPEN QUESTION: soft-delete or block? |
| Loans | Part payment > outstanding balance | Validate: amount <= outstanding_principal |
| Credit Book | Same mobile added twice | Toast "Contact exists" + link to existing party |
| Vault | Image > 10MB | Show file size error before attempting upload |
| Vault | Upload fails mid-way | Do NOT insert DB row. Toast + retry button. |
| Dashboard | No data (new user) | Show onboarding tips / empty state with add CTAs |
| Bills | Recurring template overdue | Auto-process on app open, show overdue badge |
| BOI | Voice command unclear | Partial pre-fill, disable Save until user completes form |

---

## 10. Development Dependency Graph

```mermaid
graph TD
    subgraph Phase1["Phase 1: Foundation"]
        A1[Expo project setup + navigation shell] --> A2[Supabase client + auth]
        A2 --> A3[Zustand stores: auth + ui]
        A3 --> A4[Subscription gate]
        A4 --> A5[Login + Biometric screen]
    end

    subgraph Phase2["Phase 2: Core Finance - Critical Path"]
        A5 --> B1[React Query setup + income CRUD]
        B1 --> B2[Expenses CRUD - expense + outflow]
        B2 --> B3[Dashboard math + Victory charts]
    end

    subgraph Phase3["Phase 3: Financial Instruments"]
        B3 --> C1[Credit Cards + Spends]
        B3 --> C2[Business Ledger - multi-business]
        B3 --> C3[Loan Tracker + Amortization engine]
        B3 --> C4[Bills - Recurring templates]
    end

    subgraph Phase4["Phase 4: Network Features"]
        C1 & C2 & C3 --> D1[Credit Book P2P - add party + transactions]
        D1 --> D2[Credit Book B2B merchant sync]
        D1 --> D3[Split Groups + Expense + Penny algorithm]
        D3 --> D4[Split Settlements]
    end

    subgraph Phase5["Phase 5: Tools + Ecosystem"]
        D2 & D4 --> E1[Receipt Vault - camera + OCR + storage]
        D2 & D4 --> E2[Activity - Realtime notifications]
        D2 & D4 --> E3[Rewards + Offers + Flash Deals]
        D2 & D4 --> E4[Partner - Refer and Earn]
        D2 & D4 --> E5[BOI AI Assistant - NLP + voice]
    end
```
