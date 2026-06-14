# BillZest FinTrack Mobile — React Native Project Context

> **Last updated**: 2026-06-13
> **Scope**: Finance tracking module (`fnance-tracker/`). This is a greenfield React Native (Expo) project that replaces the previous Flutter prototype.

---

## 1. Project Overview

| Item                    | Detail                                                                     |
| ----------------------- | -------------------------------------------------------------------------- |
| **Product**             | BillZest FinTrack Mobile                                                   |
| **Platform**            | iOS & Android (React Native — Expo Managed Workflow)                       |
| **Backend**             | Supabase: `https://jjewdwwvgsojvyqkehcx.supabase.co` (Shared with web app) |
| **Target App Location** | `fnance-tracker/app/` (The Expo project should be scaffolded here)         |
| **Goal**                | Build a full feature-parity mobile version of the `billzest_fin/` web app. |
| **Core Differentiator** | Merges personal P2P ledgers with B2B merchant transactions.                |

---

## 2. Source of Truth & Documentation

This project has strict authoritative documentation. **Do not hallucinate features or schema**. Always refer to these files:

1. **PRD & Specs**: `fnance-tracker/doc/billzest_fin_prd.md`
   - Contains all module specifications, DB table mappings, auth/subscription gate logic, and business rules.
2. **System Flows**: `fnance-tracker/doc/billzest_fin_flows.md`
   - Contains mermaid diagrams for architecture, data flow (Zustand + React Query), and complex business flows (Loan EMI generation, Split penny algorithm).
3. **Database Schema**: `fnance-tracker/doc/latest-sql-dump.sql`
   - The absolute source of truth for the Supabase database. Contains all B2B and Finance tables.
4. **Design System**: `fnance-tracker/doc/DESIGN.md`
   - Contains the color palette, typography rules (Inter), spacing guidelines, and component aesthetics. All UI implementations MUST adhere to these tokens.
5. **Design Screen Samples**: `fnance-tracker/doc/stitch_billzest_fintrack_design_system/`
   - Contains markdown samples of the screens. These are for rough conceptual ideas and layout inspiration; the actual implementation must follow `DESIGN.md`.

### Rule on Referencing Other Codebases

- **Web App (`billzest_fin/`)**: USE this as the primary reference for business logic. If you are unsure how an API call should look, check `billzest_fin/src/lib/supabase.ts`. If you are unsure about the subscription gate, check `billzest_fin/src/App.tsx`.
- **Old Flutter App (`billzest_fin_flutter/`)**: IGNORE this completely. The old Flutter prototype used a completely different architecture (Hive offline queues, Riverpod) and contained sync bugs. Looking at it will only confuse the AI with deprecated code.

### Rule on Tracking Issues

- **Implementation Tracker**: `fnance-tracker/doc/implementation_issues.md`
  - Once an issue or slice is completed, YOU MUST mark its status as completed (`[x]`) in the `implementation_issues.md` file. Always check this file first to know what is pending and what is completed, otherwise you would have to scan the entire codebase again.

### Rule on Agent Skills

- **Skill Usage**: This project contains specialized Agent Skills in the `.agents/skills/` directory (e.g., `add-app-clip`, `expo-ui`, `building-native-ui`).
  - When working on ANY task, YOU MUST check if a relevant skill exists.
  - If a skill is relevant, YOU MUST read its `SKILL.md` file before proceeding, and apply those patterns exactly as documented.

### Rule on Expo MCP Tools

- **Expo MCP**: This project uses Expo. Use Expo MCP tools whenever they provide a more accurate answer than static code analysis.

---

## 3. Tech Stack

| Layer                    | Technology                                                                |
| ------------------------ | ------------------------------------------------------------------------- |
| **Framework**            | React Native (Expo SDK, managed workflow)                                 |
| **Language**             | TypeScript                                                                |
| **Routing**              | React Navigation v6 (Bottom Tabs + Native Stack)                          |
| **Global UI/Auth State** | Zustand                                                                   |
| **Server State / API**   | TanStack React Query v5                                                   |
| **Backend Client**       | `@supabase/supabase-js` (v2)                                              |
| **Auth**                 | Supabase Auth (OTP via Twilio) + `expo-local-authentication` (Biometrics) |
| **Storage**              | AsyncStorage (Session persistence)                                        |
| **UI/Styling**           | StyleSheet + Custom theme variables (No NativeWind/Tailwind)              |

---

## 4. Architecture Rules for AI Agents

When building or modifying this project, adhere strictly to these architectural patterns:

### 1. Data Fetching (Read Path)

- **Do not** use plain `useEffect` for data fetching.
- **Always** use `useQuery` from TanStack React Query.
- Supabase calls should be encapsulated in query functions.

### 2. Data Mutations (Write Path)

- **Always** use `useMutation` from TanStack React Query.
- Ensure you call `queryClient.invalidateQueries({ queryKey: [...] })` on success to trigger automatic UI updates.
- Handle errors gracefully using standard toasts.

### 3. Global State

- Use **Zustand** only for truly global UI state (e.g., `privacyMode`, `boiOpen`, `unreadCount`) and Authentication state (`user`, `profile`, `hasValidSubscription`).
- Do NOT put Supabase fetched data (lists of expenses, loans, etc.) into Zustand. That belongs in React Query cache.

### 4. Authentication & Subscription Gate

- The app requires an active subscription from the BillZest App ecosystem.
- The exact logic for `hasActiveSubscription()` is documented in the PRD. It must check both personal plans (`accounts.plan_status`) and org-level plans (`organization_members` -> `subscriptions`).
- If the user has no valid plan, they are hard-blocked from navigating past the gate screen.

### 5. Styling

- Use vanilla React Native `StyleSheet.create`.
- Adhere strictly to the design system defined in `fnance-tracker/doc/DESIGN.md`. Use the specific colors (e.g., Neon Green `#1ED760`), typography (Inter `display-lg`, `label-caps`), and fluid spacing grid documented there.
- Reference the sample screens in `fnance-tracker/doc/stitch_billzest_fintrack_design_system/` for layout inspiration, though `DESIGN.md` remains the authoritative source for styling rules.
- The aesthetic goal is a "Spotify for Finance" atmosphere. The application MUST support both **Dark and Light themes** (following the system preference or user toggle). Refer to `DESIGN.md` for the specific color inversions for light mode.
- **Icons**: NEVER use raw Unicode emojis or characters (e.g., 💰, 🏠) for icons. You MUST use proper SVGs or a robust icon library (like `lucide-react-native` or `@expo/vector-icons`) for all iconography to ensure consistent, professional rendering across both iOS and Android.

### 6. Testing Strategy

- **Unit Testing**: Mandatory for complex math, business logic (e.g., penny algorithm, EMI calculation), and the subscription gate. Use `Jest`.
- **Integration/Component Testing**: Mandatory for key UI flows and bindings to `useQuery`/`useMutation` or Zustand. Use `@testing-library/react-native` and mock API calls.
- **E2E Testing**: Explicitly skipped for v1 to maximize development speed.
- **Manual Testing**: Used for hardware integrations (Biometrics, Camera, OCR, Voice).

- Commands for testing

Run these commands to verify your work before opening a PR:

- **Type check:** `npx tsc --noEmit`
- **Lint:** `npm run lint`
- **Test:** `npm test`

---

## 5. Implementation Roadmap (Reference)

Refer to the PRD for complete details, but the general build order should be:

1. **Phase 1: Foundation**: Expo scaffolding, Navigation shell (4 tabs), Supabase Client, Zustand Auth Store, Subscription Gate.
2. **Phase 2: Core Finance**: React Query setup, Dashboard UI, Income CRUD, Expenses CRUD.
3. **Phase 3: Financial Instruments**: Credit Cards, Loans (with Amortization logic), Business Ledger, Bills.
4. **Phase 4: Network Features**: Credit Book (P2P + B2B merge), Split Expenses (with penny algorithm & settlements).
5. **Phase 5: Tools & Ecosystem**: Vault (Camera/OCR), Rewards, Flash Deals, Partner Referrals, BOI AI Assistant.
