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
