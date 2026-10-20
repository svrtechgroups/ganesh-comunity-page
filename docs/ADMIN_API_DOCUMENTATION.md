# MITRA UK — Admin REST API Specification

This document provides the complete API specification for all administrative endpoints of the MITRA UK platform. These endpoints are designed to be invoked securely by authorized Admin users, frontend administrative consoles, mobile applications, and AI Agents / LLMs.

---

## 1. Authentication & Security Architecture

### Authentication Mechanism
All routes under `/api/admin/*` are strictly guarded by `src/middleware.ts`. Requests must provide an Admin JWT token using either:
1. **Authorization Header (Recommended for LLMs & external clients)**:
   ```http
   Authorization: Bearer <TOKEN>
   ```
2. **Cookie**:
   ```http
   Cookie: mitra_token=<TOKEN>
   ```

### Obtaining the Admin Token
Before making calls to any `/api/admin/*` endpoint, obtain a 7-day Admin JWT token via `POST /api/auth/login`.

#### Endpoint
`POST /api/auth/login`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | **Yes** | Admin email address or username |
| `password` | `string` | **Yes** | Admin password |
| `loginType` | `string` | **Yes** | Must be set to `"admin"` |

**Example Request:**
```json
{
  "email": "admin@mitrauk.com",
  "password": "YourSecurePassword",
  "loginType": "admin"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "role": "Admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid_admin_123",
    "email": "admin@mitrauk.com",
    "role": "Admin",
    "username": "admin"
  }
}
```

---

## 2. External / LLM Callability Analysis

| Capability | Status | Details |
|---|---|---|
| **JSON REST Calling** | ✅ Fully Supported | All administrative read, create, update, delete operations accept and return standard `application/json`. |
| **Bearer Token Support** | ✅ Fully Supported | Middleware inspects `Authorization: Bearer <TOKEN>` on every request. |
| **Binary File Uploads (`/api/upload`)** | ⚠️ Special Handling | Requires `multipart/form-data`. When using an LLM that cannot output binary streams directly, specify existing image/video URLs directly in the entity payload (e.g., `bannerUrl`, `logoUrl`, `imageUrl`, `url`). |

---

## 3. Administrative Endpoints Reference

---

### 3.1 Analytics & Dashboard
#### `GET /api/admin/dashboard-analytics`
Fetches real-time KPIs, aggregated donation and ticket revenue, RSVP counts, daily festival schedule breakdowns, and recent live activity feed.

- **Query Parameters**:
  - `eventId` (`string`, optional): Event ID (e.g., `"evt-ganesh-chaturthi"`). Defaults to `"all"`.
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "source": "prisma_live",
  "kpiSummary": {
    "totalRealUsers": 1420,
    "registeredMembersCount": 350,
    "activeMembersCount": 320,
    "subscribersCount": 850,
    "charityCasesCount": 12,
    "eventsCount": 5,
    "totalRevenue": 24500.5,
    "completedRevenue": 21300.0,
    "completedCount": 280,
    "pendingRevenue": 3200.5,
    "pendingCount": 15,
    "failedRevenue": 0,
    "failedCount": 0,
    "totalPaidPoojas": 140,
    "totalPaidPoojaRevenue": 14200.0,
    "totalFreePoojas": 850,
    "totalFreePasses": 1920,
    "totalRSVPsCount": 850,
    "totalPassesIssued": 1920,
    "totalAdultsCount": 1500,
    "totalChildrenCount": 420
  },
  "donationBreakdown": [...],
  "topLocations": [{ "name": "Slough", "count": 210 }],
  "memberTiers": [{ "tier": "Annual Member", "count": 280 }],
  "recentPayments": [...],
  "recentRSVPs": [...],
  "recentMembers": [...],
  "liveFeed": [...]
}
```

---

### 3.2 Events Management
Manage events, venue locations, ticket prices, schedules, and custom RSVP field configurations.

#### `GET /api/admin/events`
Fetch all events with pagination, search, and category filtering.
- **Query Parameters**:
  - `id` (`string`, optional): If provided, returns a single event record including associated `mediaItems`.
  - `page` (`integer`, optional, default `1`): Page number.
  - `limit` (`integer` or `"all"`, optional, default `50`): Page size.
  - `search` (`string`, optional): Search title, description, or venue.
  - `category` (`string`, optional): Filter by category.
  - `status` (`string`, optional): `"Upcoming"` | `"Completed"` | `"Cancelled"`.

#### `POST /api/admin/events`
Create a new community event.
- **Request Body**:
```json
{
  "title": "London Diwali Celebration 2026",
  "category": "Cultural Events",
  "date": "08 Nov 2026",
  "time": "05:00 PM",
  "venue": "Langley Hall",
  "address": "Langley, Slough, United Kingdom",
  "ticketPrice": 10,
  "childTicketPrice": 5,
  "status": "Upcoming",
  "description": "Grand Diwali Mahotsav celebrating Telugu culture with lights, fireworks and cultural programs.",
  "bannerUrl": "https://mitrauk.com/uploads/events/banners/diwali.jpg",
  "capacity": 500,
  "enableRsvp": true,
  "enableSupportPayment": true,
  "enablePooja": false,
  "enforceCapacityLimit": true,
  "adultCapacity": 400,
  "childCapacity": 100,
  "availableDates": ["8th Nov", "9th Nov"],
  "eventSchedule": [
    { "id": "day-1", "date": "08 Nov 2026", "title": "Diwali Cultural Night", "time": "05:00 PM" }
  ],
  "mapUrl": "https://maps.google.com/...",
  "customFields": [
    { "id": "fld-1", "label": "Dietary Preference", "type": "select", "options": ["Vegetarian", "Vegan"] }
  ]
}
```

#### `PUT /api/admin/events`
Update an existing event.
- **Request Body**: Accepts the same properties as `POST` plus the required `id` (`string`).
```json
{
  "id": "cuid_event_123",
  "status": "Completed",
  "capacity": 600
}
```

#### `DELETE /api/admin/events?id=<EVENT_ID>`
Permanently deletes an event and all associated configuration and media items.
- **Query Parameter**: `id` (`string`, required).

---

### 3.3 Event Hero & Display Configuration
Configure 3D models, video banners, background audio, and action buttons for event landing pages.

#### `GET /api/admin/event-hero-config`
Returns full hero configuration across all events and active homepage event ID.

#### `POST /api/admin/event-hero-config`
Update active featured event or event-specific landing configuration.
- **Request Body**:
```json
{
  "activeHomeEventId": "evt-ganesh-chaturthi",
  "event": {
    "id": "evt-ganesh-chaturthi",
    "heroType": "3d-model",
    "modelPath": "/assets/3d/ganesha.glb",
    "title": "London Ganesh Festival 2026",
    "subtitle": "10 Sacred Days of Divine Blessings",
    "themeColor": "emerald",
    "enableCountdown": true,
    "enableAudio": true,
    "enablePoojaBooking": true,
    "enableLiveStream": false
  }
}
```

---

### 3.4 Featured Media Slots (Homepage & Event Hero)
Manages the 4 featured spotlight media slots displayed on the homepage and event heroes.

#### `GET /api/admin/featured-media`
Fetches current 4 spotlight slots for the homepage and available media library.

#### `POST /api/admin/featured-media`
Assigns or clears a media item for a specific homepage spotlight slot.
- **Request Body**:
```json
{
  "slot": 1,
  "mediaItemId": "cuid_media_456"
}
```
*(Set `mediaItemId` to `null` to clear the slot).*

#### `GET /api/admin/events/[id]/featured-media`
Returns the 4 hero slots specifically designated for event `[id]`.

#### `POST /api/admin/events/[id]/featured-media`
Assigns a media item to an event hero slot.
- **Request Body**:
```json
{
  "slot": 1,
  "mediaItemId": "cuid_media_456"
}
```

---

### 3.5 Media Gallery Management
Manage photos, videos, and YouTube embedded streams.

#### `GET /api/admin/media`
List all media items with associated events and metrics.
- **Query Parameters**:
  - `eventId` (`string`, optional): Filter by event ID.
  - `type` (`string`, optional): `"IMAGE"` | `"VIDEO"`.

#### `POST /api/admin/media`
Create a new media gallery item.
- **Request Body**:
```json
{
  "title": "Maha Aarti Highlights",
  "type": "VIDEO",
  "category": "Highlight Video",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "coverImage": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "description": "Devotees joining for evening sacred aarti.",
  "eventId": "evt-ganesh-chaturthi",
  "isFeatured": true,
  "displayOrder": 1
}
```

#### `PUT /api/admin/media`
Update title, cover image, URL, or featured state of a media item.
- **Request Body**:
```json
{
  "id": "cuid_media_123",
  "title": "Updated Aarti Title",
  "isFeatured": false
}
```

#### `DELETE /api/admin/media?id=<MEDIA_ID>`
Permanently delete a media item.

#### `POST /api/admin/media/reorder`
Batch reorder media items.
- **Request Body**:
```json
{
  "items": [
    { "id": "cuid_1", "displayOrder": 1 },
    { "id": "cuid_2", "displayOrder": 2 }
  ]
}
```

---

### 3.6 Devotee RSVPs & Registrations
Manage attendee passes, ticket bookings, and guest conversions.

#### `GET /api/admin/rsvps`
Fetch attendee registrations with search, date filters, and aggregated attendance statistics.
- **Query Parameters**:
  - `eventId` (`string`, optional): Filter by event (e.g. `"evt-ganesh-chaturthi"` or `"all"`).
  - `selectedDate` (`string`, optional): Filter by date (e.g. `"13th Sep"`).
  - `search` (`string`, optional): Search devotee name, email, phone, or town.
  - `page` (`integer`, optional, default `1`).
  - `limit` (`integer` or `"all"`, optional, default `10`).

#### `DELETE /api/admin/rsvps?id=<RSVP_ID>`
Delete an RSVP pass and automatically decrement `rsvpCount` on the associated Event.

#### `POST /api/admin/rsvps/convert-to-member`
Convert guest attendees into registered MITRA Annual Members and email temporary login credentials.
- **Request Body (Single Conversion)**:
```json
{
  "rsvpId": "cuid_rsvp_123"
}
```
- **Request Body (Bulk Conversion)**:
```json
{
  "convertAll": true,
  "eventId": "evt-ganesh-chaturthi"
}
```

#### `POST /api/admin/rsvps/map-payment-member`
Links an unassociated payment to an existing registered member record.
- **Request Body**:
```json
{
  "paymentId": "cuid_pay_123",
  "memberId": "cuid_member_456"
}
```

---

### 3.7 Payments & Donations
Audit checkout sessions, seva contributions, and gateway settings.

#### `GET /api/admin/payments`
Fetch paginated payments with live database calculations for completed, pending, and failed totals.
- **Query Parameters**:
  - `eventId` (`string`, optional): Filter by event.
  - `status` (`string`, optional): `"Completed"` | `"Pending"` | `"Failed"` | `"all"`.
  - `type` (`string`, optional): `"pooja"` | `"anadanam"` | `"event donation"` | `"membership"` | `"general"`.
  - `search` (`string`, optional): Search customer name, email, gotram, or description.
  - `page` (`integer`, optional, default `1`).
  - `limit` (`integer` or `"all"`, optional, default `10`).

#### `POST /api/admin/payments/force-rsvp`
Force-generates a confirmed attendee RSVP record from an orphaned completed payment.
- **Request Body**:
```json
{
  "paymentId": "cuid_payment_123"
}
```

#### `GET /api/admin/payment-settings`
Retrieves configured Stripe keys (secret key masked for safety) and active payout account name.

#### `PUT /api/admin/payment-settings`
Update live Stripe API credentials and currency.
- **Request Body**:
```json
{
  "stripePublishableKey": "pk_live_...",
  "stripeSecretKey": "sk_live_...",
  "currency": "GBP",
  "activeAccountName": "MITRA Official Barclays Stripe"
}
```

---

### 3.8 Members Management & Broadcast Notifications
Manage member accounts and broadcast personalized community announcements.

#### `GET /api/admin/members`
List, search, and paginate registered community members.
- **Query Parameters**:
  - `page` (`integer`, optional, default `1`).
  - `limit` (`integer` or `"all"`, optional, default `50`).
  - `search` (`string`, optional): Search member name, email, or phone.

#### `POST /api/admin/members`
Manually create a member record.
- **Request Body**:
```json
{
  "fullName": "Srinivas Rao",
  "email": "srinivas@example.com",
  "phone": "+44 7700 900123",
  "role": "Member",
  "notes": "Community volunteer"
}
```

#### `POST /api/admin/members/notify`
Broadcasts personalized emails to registered members or event attendees via the streaming background email queue.
- **Request Body**:
```json
{
  "subject": "Important Notice: London Ganesh Festival Darshan Timings",
  "title": "Maha Visarjan & Darshan Schedule Update",
  "message": "Namaste {{name}},\n\nPlease note that tomorrow's Maha Aarti will begin promptly at 7:00 PM.",
  "targetAudience": "all",
  "imageUrl": "/assets/poster.jpg",
  "badgeText": "MITRA Official Announcement",
  "buttonText": "View Festival Guide",
  "buttonUrl": "https://mitrauk.com/events/ganesh-2026"
}
```
*(Supported `targetAudience` values: `"all"`, `"active"`, `"Annual Member"`, or `"event_<EVENT_ID>"`).*

---

### 3.9 Sponsors & Corporate Partners
Manage tier rankings, logos, and website links for sponsors.

#### `GET /api/admin/sponsors`
Returns all active and inactive sponsors sorted by display order.

#### `POST /api/admin/sponsors`
Create a sponsor card.
- **Request Body**:
```json
{
  "name": "Tech Mahindra",
  "tier": "Title Sponsor",
  "logoUrl": "https://mitrauk.com/uploads/sponsors/logos/techm.png",
  "websiteUrl": "https://techmahindra.com",
  "order": 1,
  "active": true,
  "blackLogoBg": false,
  "accent": "from-[#E65C00] to-[#FF7A00]"
}
```

#### `PUT /api/admin/sponsors`
Update sponsor information or toggle active status.
- **Request Body**:
```json
{
  "id": "cuid_sponsor_123",
  "tier": "Platinum Sponsor",
  "order": 2
}
```

#### `DELETE /api/admin/sponsors?id=<SPONSOR_ID>`
Permanently remove a sponsor record.

#### `POST /api/admin/sponsors/reorder`
Update sponsor display order array.
- **Request Body**:
```json
{
  "sponsors": [
    { "id": "sp-1", "order": 1 },
    { "id": "sp-2", "order": 2 }
  ]
}
```

---

### 3.10 Leadership & Executive Committee
Manage founders, patrons, trustees, executive committee, and women's wing leadership.

#### `GET /api/admin/leadership`
Fetch leadership team members with category filtering and pagination.
- **Query Parameters**:
  - `category` (`string`, optional): `"Founders"` | `"Patrons"` | `"Trustees"` | `"Executive Committee"` | `"Nari Shakthi"`.
  - `page` (`integer`, optional).
  - `limit` (`integer`, optional).

#### `POST /api/admin/leadership`
Add a leadership member.
- **Request Body**:
```json
{
  "name": "Dr. Ramesh Babu",
  "designation": "President",
  "category": "Executive Committee",
  "bio": "Serving the Telugu diaspora across the UK for over 15 years.",
  "imageUrl": "/assets/leadership/ramesh.jpg",
  "email": "president@mitrauk.com",
  "phone": "+44 20 8123 4567",
  "linkedin": "https://linkedin.com/in/...",
  "displayOrder": 1,
  "active": true
}
```

#### `PUT /api/admin/leadership`
Update a leadership member's profile.
- **Request Body**: Accepts `id` (`string`, required) along with fields to update.

#### `DELETE /api/admin/leadership?id=<LEADER_ID>`
Remove a leadership member.

---

### 3.11 Telugu Business Directory
Review, approve, reject, or feature community businesses.

#### `GET /api/admin/telugu-business`
Fetch business directory listings with status metrics.
- **Query Parameters**:
  - `status` (`string`, optional): `"All"` | `"Approved"` | `"Pending"` | `"Rejected"`.
  - `category` (`string`, optional): Business category.
  - `q` (`string`, optional): Search keywords.

#### `POST /api/admin/telugu-business`
Create or pre-approve a business listing.
- **Request Body**:
```json
{
  "businessName": "Swagath South Indian Restaurant",
  "ownerName": "Venkat Reddy",
  "category": "Food & Catering",
  "description": "Authentic Hyderabadi Biryani and Andhra meals in Central London.",
  "email": "contact@swagath.co.uk",
  "phone": "+44 20 7123 4567",
  "city": "London",
  "postcode": "W4 5YA",
  "website": "https://swagath.co.uk",
  "status": "Approved",
  "isFeatured": true,
  "specialOffer": "10% discount for MITRA members"
}
```

#### `PUT /api/admin/telugu-business`
Approve, reject, or edit a business listing.
- **Request Body**:
```json
{
  "id": "cuid_biz_123",
  "status": "Approved",
  "adminNotes": "Verified business address and contact details."
}
```

#### `DELETE /api/admin/telugu-business?id=<BIZ_ID>`
Remove a business from the directory.

---

### 3.12 Charity & Student Care
Manage hardship relief and student assistance cases.

#### `GET /api/admin/charity-cases`
Fetch open and resolved hardship cases with pagination.
- **Query Parameters**:
  - `page` (`integer`, optional, default `1`).
  - `limit` (`integer`, optional, default `50`).

#### `PUT /api/admin/charity-cases`
Update urgency or status of a case.
- **Request Body**:
```json
{
  "id": "cuid_charity_123",
  "status": "In Review",
  "urgency": "High"
}
```
*(Status values: `"Open"`, `"In Review"`, `"Approved"`, `"Resolved"`, `"Closed"`).*

---

### 3.13 Site Settings & SEO
Manage platform title, branding, social media handles, and Google Analytics ID.

#### `GET /api/admin/settings`
Returns current global site settings.

#### `PUT /api/admin/settings`
Updates global site settings.
- **Request Body**:
```json
{
  "siteTitle": "Mana Indian Telugu Roots Abroad (MITRA UK)",
  "tagline": "Serving and Connecting the Telugu Community in the United Kingdom",
  "contactEmail": "info@mitrauk.com",
  "contactPhone": "+44 20 8123 4567",
  "address": "MITRA Centre, Chiswick Park, London W4 5YA",
  "twitterUrl": "https://twitter.com/mitra_official",
  "linkedinUrl": "https://linkedin.com/company/mitra-official",
  "facebookUrl": "https://facebook.com/ukteluguassociation",
  "instagramUrl": "https://instagram.com/mitra_official",
  "youtubeUrl": "https://youtube.com/@mitraofficial",
  "googleAnalyticsId": "G-MITRA2026SEO",
  "enableTracking": true
}
```

---

### 3.14 System Audit Logs & Diagnostics
Inspect API latency, error logs, and perform log retention pruning.

#### `GET /api/admin/logs`
Filter logs and compute HTTP performance telemetry (average response time, slowest routes, error counts).
- **Query Parameters**:
  - `level` (`string`, optional): `"INFO"` | `"WARN"` | `"ERROR"` | `"PAYMENT_FAILURE"` | `"HTTP"` | `"all"`.
  - `source` (`string`, optional): Source tag (e.g. `"payments/webhook"`, `"auth/login"`).
  - `search` (`string`, optional): Search keywords.
  - `page` (`integer`, optional, default `1`).
  - `limit` (`integer`, optional, max `100`, default `30`).

#### `POST /api/admin/logs`
Manually trigger log retention pruning.
- **Request Body**:
```json
{
  "retentionDays": 7
}
```

#### `DELETE /api/admin/logs?id=<LOG_ID>`
Delete an individual log entry.

---

### 3.15 Background Email Queue Worker Control
Inspect pending email deliveries, monitor retry rates, or trigger manual dispatch ticks.

#### `GET /api/email-queue`
Returns queue statistics (total, pending, sent, failed counts) and recent pending deliveries.

#### `PUT /api/email-queue`
Manage worker status or force an immediate processing tick.
- **Request Body**:
```json
{
  "action": "process_now"
}
```
*(Actions supported: `"process_now"`, `"start_worker"`, `"stop_worker"`).*

---

### 3.16 File & Media Upload
Uploads media files to FTP server storage.

#### `POST /api/upload`
- **Request Format**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Form Fields**:
  - `file`: File blob (JPG, PNG, WebP, GIF, SVG, MP4, WebM, MOV; max 25MB).
  - `useCase`: `"event_banner"` | `"sponsor_logo"` | `"leader_profile"` | `"member_profile"` | `"media_gallery"` | `"general"`.
  - `identifier`: Identifier slug for file naming (e.g. `"diwali_2026"`).
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "url": "https://mitrauk.com/uploads/events/banners/diwali_2026_abc123.jpg",
  "filename": "diwali_2026_abc123.jpg",
  "storageType": "ftp"
}
```
*Note: For LLMs without direct binary upload support, provide hosted URLs directly in the entity payload.*
