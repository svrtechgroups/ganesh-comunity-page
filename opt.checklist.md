# MITRA Website — Optimization Checklist

> Build is **passing** ✅ as of 2026-09-25. Use this checklist to guide ongoing improvements.
> Priority: 🔴 High · 🟡 Medium · 🟢 Low

---

## 1. API Pagination & Performance

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 1.1 | ✅ | 🔴 | `GET /api/admin/members` — **no pagination**, loads all members in one query | [`api/admin/members/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/members/route.ts) |
| 1.2 | ✅ | 🔴 | `GET /api/admin/leadership` — **no pagination**, loads all leadership members | [`api/admin/leadership/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/leadership/route.ts) |
| 1.3 | ✅ | 🔴 | `GET /api/admin/events` — **no pagination**, loads full event list including `mediaItems` (heavy join) | [`api/admin/events/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/events/route.ts) |
| 1.4 | ☐ | 🟡 | `GET /api/admin/charity-cases` — no pagination | [`api/admin/charity-cases/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/charity-cases/route.ts) |
| 1.5 | ☐ | 🟡 | `GET /api/admin/sponsors` — no pagination | [`api/admin/sponsors/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/sponsors/route.ts) |
| 1.6 | ☐ | 🟡 | `GET /api/admin/telugu-business` — pagination not enforced on DB-side | [`api/admin/telugu-business/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/telugu-business/route.ts) |
| 1.7 | ☐ | 🔴 | `GET /api/admin/rsvps` — first parallel query fetches **all RSVPs** for stats, then re-fetches for display (double-query; use `groupBy` instead) | [`api/admin/rsvps/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/rsvps/route.ts) |
| 1.8 | ☐ | 🟡 | `GET /api/admin/payments` — fetches **all events** as a dropdown on every single request | [`api/admin/payments/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/payments/route.ts) |
| 1.9 | ☐ | 🟢 | `GET /api/admin/logs` — HTTP logs sub-query hardcodes `take: 300` with no configurable limit | [`api/admin/logs/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/logs/route.ts) |
| 1.10 | ☐ | 🟢 | `GET /api/admin/events` — includes `mediaItems` even when admin list view doesn't need it | [`api/admin/events/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/events/route.ts) |

---

## 2. API Architecture & Redundancy

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 2.1 | ✅ | 🔴 | `console.log` debug statements left in production API routes | [`api/admin/rsvps/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/rsvps/route.ts), [`api/admin/payments/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/payments/route.ts) |
| 2.2 | ✅ | 🟡 | `GET /api/admin/members` error handler returns `success: true` on DB failure with empty array — hides real errors | [`api/admin/members/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/members/route.ts) |
| 2.3 | ☐ | 🟡 | `/api/admin/events` and `/api/events` are separate routes with largely duplicated Prisma queries | [`api/admin/events/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/events/route.ts), [`api/events/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/events/route.ts) |
| 2.4 | ☐ | 🟡 | Leadership fetched by two separate routes (`/api/admin/leadership` and `/api/leadership`) with identical logic | [`api/admin/leadership/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/leadership/route.ts), [`api/leadership/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/leadership/route.ts) |
| 2.5 | ✅ | 🟢 | Every API route sets identical `Cache-Control: no-store` headers — extract into a shared `noCacheHeaders` constant | Multiple route files |
| 2.6 | ☐ | 🟢 | `force-dynamic` / `revalidate = 0` repeated at the top of every admin route — consider a shared wrapper | All `/api/admin/*` routes |

---

## 3. Static / Hardcoded Data

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 3.1 | ☐ | 🔴 | News/blog data hardcoded in `src/data/news.ts` — should be stored in DB and served via API | [`data/news.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/news.ts) |
| 3.2 | ☐ | 🔴 | Charity cases fall back to static file if DB fails — real DB records may never appear | [`data/charity.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/charity.ts), [`api/admin/charity-cases/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/charity-cases/route.ts) |
| 3.3 | ☐ | 🟡 | Ganesh festival daily schedule, darshan times, and venue address hardcoded in EventDetailsSection | [`EventDetailsSection.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/EventDetailsSection.tsx) |
| 3.4 | ☐ | 🟡 | Pooja category prices (£21, £51, £116, £316) hardcoded in PoojaBookingModal — should come from admin config or DB | [`PoojaBookingModal.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/PoojaBookingModal.tsx) |
| 3.5 | ☐ | 🟡 | WhatsApp group URL hardcoded in multiple components — should come from site settings | Multiple components |
| 3.6 | ☐ | 🟢 | Unsplash placeholder images used for news cover images — replace with real MITRA media | [`data/news.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/news.ts) |
| 3.7 | ☐ | 🟢 | Default Ganesh schedule duplicated between `event-schedule.ts` and `PoojaBookingModal.tsx` | [`lib/event-schedule.ts`](file:///Users/venkey/Documents/svr/UKTA/src/lib/event-schedule.ts), [`PoojaBookingModal.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/PoojaBookingModal.tsx) |

---

## 4. Code Reusability — Duplicate Logic

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 4.1 | ✅ | — | `RSVPRecord.event` now uses `Pick<EventItem, ...>` — no more inline re-declaration | [`admin/events/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/events/page.tsx) |
| 4.2 | ✅ | — | `CustomScheduleConfig` moved to `lib/types.ts` — single source of truth | [`lib/types.ts`](file:///Users/venkey/Documents/svr/UKTA/src/lib/types.ts) |
| 4.3 | ✅ | 🔴 | `fetchEvent` logic exists in both `EventDetailsSection.tsx` and `events/[id]/page.tsx` — extract into `useEvent(id)` hook | [`EventDetailsSection.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/EventDetailsSection.tsx), [`events/[id]/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/events/%5Bid%5D/page.tsx) |
| 4.4 | ✅ | 🟡 | `isGanesh` flag derived identically in `EventDetailsSection`, `Ganesha3DHero`, `EventLandingTemplate` — extract into `isGaneshEvent(event)` utility | 3 files |
| 4.5 | ☐ | 🟡 | CSV export logic duplicated: `handleExportAllCSV` and `exportSingleEventCSV` share ~80% identical code | [`admin/events/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/events/page.tsx) |
| 4.6 | ☐ | 🟡 | `reconstructEventConfig` has a long manual field list — could auto-map from `PREFERENCES.event` | [`lib/config-preferences.ts`](file:///Users/venkey/Documents/svr/UKTA/src/lib/config-preferences.ts) |
| 4.7 | ☐ | 🟢 | Membership status badge rendered independently in multiple admin pages — create `<StatusBadge />` | Admin pages |
| 4.8 | ☐ | 🟢 | Loading spinners (`Loader2 + animate-spin`) rendered ad-hoc everywhere — extract into `<Spinner />` | Admin pages |

---

## 5. Component Extraction (UI Reuse)

| # | Status | Priority | Suggested Component | Used In |
|---|--------|----------|---------------------|---------|
| 5.1 | ☐ | 🔴 | `<AdminDataTable />` — search bar + filters + table + pagination | Events, Members, Payments, Logs, RSVPs |
| 5.2 | ☐ | 🟡 | `<StatCard label icon value trend />` — summary stat cards at top of admin pages | Dashboard, Events, Payments |
| 5.3 | ☐ | 🟡 | `<Modal title onClose>` — standard modal shell (overlay + header + scrollable body) | All 6 modals |
| 5.4 | ☐ | 🟡 | `<FormField label error>` — label + input + error message pattern | All admin forms |
| 5.5 | ☐ | 🟡 | `<ExportCsvButton onClick loading />` — export button with loading state | Events, Payments, RSVPs |
| 5.6 | ☐ | 🟢 | `<AdminPageHeader title actions />` — page title + breadcrumb + action buttons | All admin pages |
| 5.7 | ☐ | 🟢 | `<EmptyState icon message />` — consistent "no results" state | All admin tables |

---

## 6. TypeScript Hygiene

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 6.1 | ✅ | — | `primaryCta`/`secondaryCta` made optional in `EventHeroConfig` | [`types/event-template.ts`](file:///Users/venkey/Documents/svr/UKTA/src/types/event-template.ts) |
| 6.2 | ✅ | — | `HeroCTA` properly imported where used | [`EventHero.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/EventHero.tsx) |
| 6.3 | ☐ | 🟡 | Types split across `src/lib/types.ts` and `src/types/event-template.ts` — consolidate all shared types into `lib/types.ts` | Both files |
| 6.4 | ✅ | 🟡 | Several API routes cast error to `any` internally — use a shared `getErrorMessage(err: unknown): string` utility | Multiple routes |
| 6.5 | ☐ | 🟢 | Remaining `as any` casts in admin forms — replace with proper union types | [`admin/events/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/events/page.tsx) |

---

## 7. Performance & UX

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 7.1 | ☐ | 🔴 | `admin/events/page.tsx` is **2,390 lines** — split into `EventsTab`, `RsvpsTab`, `AnalyticsTab` sub-components | [`admin/events/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/events/page.tsx) |
| 7.2 | ☐ | 🔴 | `EventHero.tsx` is **1,221 lines** — split by hero type into `EventHero3D`, `EventHeroImage`, `EventHeroVideo` | [`EventHero.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/EventHero.tsx) |
| 7.3 | ✅ | 🔴 | `EventRSVPModal.tsx` (44 kB) and `PoojaBookingModal.tsx` (57 kB) not using `next/dynamic` — add lazy loading | Both modals |
| 7.4 | ☐ | 🟡 | Admin pages refetch all data on every mount with no caching — implement SWR or React Query | Admin pages |
| 7.5 | ☐ | 🟡 | `usePreferences` uses manual `fetchedRef` dedup — migrate to SWR `dedupingInterval` | [`hooks/usePreferences.ts`](file:///Users/venkey/Documents/svr/UKTA/src/hooks/usePreferences.ts) |
| 7.6 | ☐ | 🟡 | `DonationModal.tsx` (30 kB) loaded eagerly even when `enablePooja` is false for the event | [`DonationModal.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/DonationModal.tsx) |
| 7.7 | ☐ | 🟢 | Three.js imported statically — should be dynamic import only when `heroType === '3d-model'` | [`EventHero.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/EventHero.tsx), [`Ganesha3DHero.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/Ganesha3DHero.tsx) |
| 7.8 | ☐ | 🟢 | Most admin pages missing `useMemo` for filtered/sorted lists | Admin pages |

---

## 8. Security & Reliability

| # | Status | Priority | Issue | File(s) |
|---|--------|----------|-------|---------|
| 8.1 | ☐ | 🔴 | `/api/admin/*` routes have **no in-handler auth check** — rely only on middleware which can be bypassed | All admin API routes |
| 8.2 | ☐ | 🟡 | Members API silently returns `success: true` with empty data on Prisma failure — misleads the UI | [`api/admin/members/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/members/route.ts) |
| 8.3 | ☐ | 🟡 | Upload route has no MIME type or file size validation | [`api/upload/`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/upload) |
| 8.4 | ☐ | 🟢 | Stripe webhook route missing raw body size limit check | [`api/payments/webhook/`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/payments/webhook) |

---

## Summary Counter

| Category | Total | Done | Remaining |
|---|---|---|---|
| API Pagination | 10 | 3 | **7** |
| API Architecture | 6 | 3 | **3** |
| Static Data | 7 | 0 | **7** |
| Code Reusability | 8 | 4 | **4** |
| UI Components | 7 | 0 | **7** |
| TypeScript Hygiene | 5 | 3 | **2** |
| Performance & UX | 8 | 1 | **7** |
| Security | 4 | 0 | **4** |
| **Total** | **55** | **14** | **41** |

---

> Just tell me which items to work on next and I'll fix them. 
> You can also use `/goal` to run a batch of these overnight.
