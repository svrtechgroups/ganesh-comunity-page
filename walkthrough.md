# Walkthrough: Merge Conflict Resolution & Database Migration Setup

## 1. Resolved Merge Conflicts

All 5 conflicted files from pulling `main` into `new-landing-design` were resolved without removing any production fields:

### 1. `prisma/schema.prisma`
- **Preserved all `main` fields on `Event`**:
  - `childTicketPrice`, `enableRsvp`, `enableSupportPayment`, `enablePooja`
  - `enforceCapacityLimit`, `capacityAlertSent`, `adultCapacity`, `childCapacity`
  - `availableDates`, `eventSchedule`, `mapUrl`, `customFields`
  - `mediaItems MediaItem[]`
- **Maintained Config relation**: Added `configs Config[]` to `Event`.
- **Maintained all models**: Kept both `Config` (for preferences/templates) and `EmailQueue` (from `main`).

### 2. `src/components/EventDetailsSection.tsx`
- Preserved `event?: EventItem | null` from `main` along with dynamic schedule days generation and date fetching.
- Preserved custom schedule display and theme styling props.
- Unified RSVP callbacks (`onOpenRSVP` and `onOpenRsvp`) so both components and modals trigger correctly.

### 3. `src/app/events/[id]/page.tsx`
- **Ganesh Chaturthi Event**: Preserved the dedicated production experience from `main` (`Ganesha3DHero`, `RitualCountdown`, `EventDetailsSection`, `IdolSpecsCard`, `MediaTeaserSection`, `EventRSVPModal`, `PoojaBookingModal`, `DonationModal`).
- **Template Events (`evt-*`)**: Renders `<EventLandingTemplate eventId={event.id || id} />` for all multi-variant template events (Diwali, Ugadi, Summit, Cricket Fest, Film Carnival).
- **Standard Events**: Preserves all production fields (`childTicketPrice`, capacity limit warnings, ICS downloads, etc.).

### 4. `src/app/ganesh-event-2026/page.tsx`
- Completely preserved the production layout and state management from `main` with all modals, booking buttons, and form states.

### 5. `src/app/admin/layout.tsx`
- Kept all navigation items from `main` (including `Email Queue Worker`, `Telugu Business Directory`, `Site Settings`, etc.).
- Maintained the admin link: `{ label: 'Event Hero & Templates', href: '/admin/event-hero', icon: Sparkles, roleAccess: ['Super Admin', 'Events Coordinator'] }`.

---

## 2. Database Migration Status

All 17 migrations in [`prisma/migrations`](file:///Users/venkey/Documents/svr/UKTA/prisma/migrations) are intact and ordered chronologically:
1. `20260827115451_initial_migration`
2. `20260829142352_updated_rsvp`
3. `20260829145421_added_new_field_in_event_rsvp`
4. `20260829175245_added_new_fields_in_payment`
5. `20260829190033_removed_the_constraint`
6. `20260831155508_added_leadership_details`
7. `20260901170900_adding_logs_to_db`
8. `20260909172500_add_pooja_category_to_payment`
9. `20260912100800_add_media_event_relation`
10. `20260913110000_add_home_and_event_featured_media`
11. `20260913170000_add_site_settings_and_sponsor_gradients`
12. `20260914181000_add_config_table` *(Creates Config table)*
13. `20260919100830_add_event_config` *(TeluguBusiness + Event flags)*
14. `20260919104500_add_available_dates` *(Event.availableDates)*
15. `20260919130000_add_rsvp_custom_fields_and_capacities` *(Capacities, mapUrl, customFields)*
16. `20260921185859_added_email_queue` *(Creates EmailQueue table)*
17. `20260923120000_add_event_schedule` *(Event.eventSchedule)*

No additional migration files are needed because every table and column in `schema.prisma` is already covered by these 17 migrations.

---

## 3. Next Steps (Terminal Commands)

Run the following commands in your terminal:

```bash
# 1. Apply all 17 migrations to the new database schema (mitra_website)
npx prisma migrate deploy

# 2. Regenerate the Prisma Client
npx prisma generate

# 3. Seed preferences and demo template events into the new DB
npx tsx scripts/seed-preferences.ts
```

---

## 4. Home Page `eventSlug` Routing Update (`/events/<eventId>`)

All links from the featured hero on the home page and throughout navigation now resolve to `https://www.mitrauk.com/events/<eventId>` (e.g. `/events/cmu8fbb720000141sx0p856rb` or `/events/evt-ganesh-chaturthi`):

1. **[`src/lib/config-preferences.ts`](file:///Users/venkey/Documents/svr/UKTA/src/lib/config-preferences.ts)**:
   - `reconstructEventConfig` automatically resolves `eventSlug` as `events/${eventId}` for both database events (e.g. `events/cmu8fbb720000141sx0p856rb`) and template events.
2. **[`src/app/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/page.tsx)**:
   - Computes `targetEventSlug` directly from `activeEventConfig?.id` so that the home page hero CTA always navigates to `/events/${activeEventConfig.id}`.
3. **[`src/components/EventHero.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/EventHero.tsx)**:
   - Added `resolvedEventHref` helper ensuring that the "View Event" button in home mode always routes cleanly to `/events/${cleanSlug}` without double slashes.
4. **[`src/app/events/[id]/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/events/[id]/page.tsx)**:
   - Enabled template hero rendering for all database event IDs (including CUIDs like `cmu8fbb720000141sx0p856rb`) when customized in the Admin Panel.
5. **[`next.config.js`](file:///Users/venkey/Documents/svr/UKTA/next.config.js)** & Header components:
   - Added server-side 307 redirect from `/ganesh-event-2026` to `/events/evt-ganesh-chaturthi`, unifying all event URLs under `/events/<eventId>`.

---

## 5. Complete Removal of `event-hero-config.json` & Pure Database Architecture

The file [`src/data/event-hero-config.json`](file:///Users/venkey/Documents/svr/UKTA/src/data/event-hero-config.json) has been completely retired from the project:

1. **[`src/lib/config-preferences.ts`](file:///Users/venkey/Documents/svr/UKTA/src/lib/config-preferences.ts)**:
   - Removed `fs` and `path` imports entirely.
   - Initial bootstrap configuration (`DEFAULT_GANESH_EVENT_CONFIG`) is embedded directly in TypeScript code.
   - `seedDefaultPreferences()` seeds directly into the PostgreSQL `Config` table and `Event` table.
   - All preference retrieval (`getPreferencesForEvent`, `getFeaturedEventPreferences`) and mutations (`saveEventPreferences`, `setActiveHomeEventId`) execute 100% against PostgreSQL via Prisma.

2. **[`src/app/api/admin/event-hero-config/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/event-hero-config/route.ts)**:
   - Removed `readStorageConfig` and `writeStorageConfig` JSON file access.
   - The `GET` and `POST` routes read and persist configurations directly to PostgreSQL.

3. **[`scripts/seed-preferences.ts`](file:///Users/venkey/Documents/svr/UKTA/scripts/seed-preferences.ts)**:
   - Updated to use in-memory TypeScript seed data rather than reading from a JSON file.

4. **[`next.config.js`](file:///Users/venkey/Documents/svr/UKTA/next.config.js)**:
   - Added automated startup cleanup that removes `src/data/event-hero-config.json` from the filesystem.

---

## 6. HTTP Request Response Time Logging & Analytics

A real-time request timing and analytics system has been implemented across the application:

1. **[`src/lib/request-analytics.ts`](file:///Users/venkey/Documents/svr/UKTA/src/lib/request-analytics.ts)**:
   - Hooks into the Node.js `http.Server` to calculate exact duration from incoming request arrival to response completion (`res.on('finish')`).
   - Automatically attaches `Server-Timing: total;dur=${durationMs}` and `X-Response-Time: ${durationMs}ms` headers to outgoing responses.
   - Debounced batching queue (`flushLogQueue`) flushes logs asynchronously into PostgreSQL `SystemLog` table via `prisma.systemLog.createMany`, preventing DB write bottlenecks.
   - Filters out high-frequency static asset noise (`/_next/static/*`, images, fonts, `.glb`) so only genuine API and page traffic is logged.

2. **[`src/instrumentation.ts`](file:///Users/venkey/Documents/svr/UKTA/src/instrumentation.ts)**:
   - Next.js server hook registers `initRequestAnalyticsServerHook()` on startup in the Node.js runtime.

3. **[`src/app/api/admin/logs/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/logs/route.ts)**:
   - Flushes in-flight request queues before querying.
   - Computes real-time analytics: Average response time (ms), fastest/slowest response times, HTTP status code distribution (2xx, 3xx, 4xx, 5xx), and slowest endpoints leaderboard.

4. **[`src/app/admin/logs/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/logs/page.tsx)**:
   - **Average Response Time KPI**: displays live latency with performance grade (`<100ms Excellent`, `<300ms Good`, `>300ms Attention`).
   - **Performance Analytics Inspector**: collapsible breakdown featuring top slowest endpoints, status code distributions, and min/max response times.
   - **Row Header Duration Badges**: every HTTP log row displays method (`GET`, `POST`, etc.), status code (`200`, `404`, `500`), and response time (`⏱️ 24ms`).
   - **Expanded Timing Inspector**: visual latency meter bar, route path, client IP, and user-agent metadata.


