---
name: mitra-admin-api
description: >-
  Execute administrative operations on the MITRA UK platform.
  Use when managing events, RSVPs, member directories, payments, media items,
  sponsors, leadership committee, Telugu businesses, charity cases, site settings,
  system audit logs, and email notifications.
---

# MITRA UK — Admin API Agent Skill

This skill guides AI agents and LLM tools on authenticating and invoking all administrative REST APIs on the MITRA UK backend.

## 1. Authentication Workflow

Every administrative endpoint requires an Admin JWT token.

### Step 1: Login to Obtain Bearer Token
Make an HTTP `POST` request to `/api/auth/login`:

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<ADMIN_EMAIL_OR_USERNAME>",
    "password": "<ADMIN_PASSWORD>",
    "loginType": "admin"
  }'
```

**Response Payload:**
```json
{
  "success": true,
  "role": "Admin",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "cuid_admin_123",
    "email": "admin@mitrauk.com",
    "role": "Admin",
    "username": "admin"
  }
}
```

### Step 2: Use Bearer Token in Subsequent Requests
For all `/api/admin/*` endpoints, provide the token in the header:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 2. API Operation Quick Reference

| Category | Endpoint | Method | Key Parameters / Payload |
|---|---|---|---|
| **Analytics** | `/api/admin/dashboard-analytics` | `GET` | `?eventId=all` |
| **Events** | `/api/admin/events` | `GET`, `POST`, `PUT`, `DELETE` | `page`, `limit`, `search`, `status` / event JSON |
| **Event Hero** | `/api/admin/event-hero-config` | `GET`, `POST` | `eventId`, `tagline`, `heroBackgrounds`, etc. |
| **RSVPs** | `/api/admin/rsvps` | `GET`, `POST`, `PATCH`, `DELETE` | `page`, `limit`, `eventId`, `search` / RSVP JSON |
| **RSVP Convert** | `/api/admin/rsvps/convert-to-member` | `POST` | `rsvpId`, `generateCredentials` |
| **RSVP Map Payment** | `/api/admin/rsvps/map-payment-member` | `POST` | `rsvpId`, `memberId`, `paymentId` |
| **Payments** | `/api/admin/payments` | `GET` | `page`, `limit`, `status`, `search` |
| **Force RSVP** | `/api/admin/payments/force-rsvp` | `POST` | `paymentId` |
| **Payment Settings** | `/api/admin/payment-settings` | `GET`, `POST` | Stripe & bank transfer credentials |
| **Members** | `/api/admin/members` | `GET`, `POST`, `PUT`, `DELETE` | `page`, `limit`, `search`, `status`, `tier` |
| **Broadcast Notify** | `/api/admin/notify` | `POST` | `targetAudience`, `subject`, `messageBody` |
| **Media Gallery** | `/api/admin/media` | `GET`, `POST`, `PUT`, `DELETE` | `page`, `limit`, `category` / media JSON |
| **Media Reorder** | `/api/admin/media/reorder` | `PATCH` | `orderedIds`: `[id1, id2, ...]` |
| **Featured Media** | `/api/admin/featured-media` | `GET`, `POST` | `slot_1`, `slot_2`, `slot_3` media configs |
| **Sponsors** | `/api/admin/sponsors` | `GET`, `POST`, `PUT`, `DELETE` | `tier`, `isActive` / sponsor JSON |
| **Sponsors Reorder** | `/api/admin/sponsors/reorder` | `PATCH` | `orderedIds`: `[id1, id2, ...]` |
| **Leadership** | `/api/admin/leadership` | `GET`, `POST`, `PUT`, `DELETE` | `category`, `isActive` / member JSON |
| **Telugu Businesses** | `/api/admin/telugu-business` | `GET`, `POST`, `PUT`, `DELETE` | `category`, `status` / business JSON |
| **Charity Cases** | `/api/admin/charity-cases` | `GET`, `POST`, `PUT`, `DELETE` | `status`, `urgency` / case JSON |
| **Site Settings** | `/api/admin/settings` | `GET`, `POST` | `key`, `value`, `category`, `description` |
| **Audit Logs** | `/api/admin/logs` | `GET`, `POST` | `page`, `limit`, `action`, `entity` |
| **Email Queue Worker** | `/api/email-queue` | `GET`, `POST` | `action`: `"process"` or `"stats"` |

---

## 3. Detailed Request Payloads & LLM Examples

### 3.1 Analytics & Insights
**Fetch Dashboard KPIs:**
```bash
curl -X GET "http://localhost:3000/api/admin/dashboard-analytics?eventId=all" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.2 Event Management
**Create an Event:**
```bash
curl -X POST "http://localhost:3000/api/admin/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ugadi Celebrations 2026",
    "slug": "ugadi-2026",
    "description": "Celebrate Telugu New Year with cultural performances and traditional feast.",
    "eventDate": "2026-03-29T10:00:00.000Z",
    "endDate": "2026-03-29T18:00:00.000Z",
    "venue": "Byron Hall, Harrow Leisure Centre",
    "address": "Christchurch Ave, Harrow HA3 5BD",
    "capacity": 800,
    "rsvpEnabled": true,
    "status": "UPCOMING",
    "bannerUrl": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819"
  }'
```

**Update Event:**
```bash
curl -X PUT "http://localhost:3000/api/admin/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_ugadi_2026",
    "capacity": 900,
    "status": "LIVE"
  }'
```

**Delete Event:**
```bash
curl -X DELETE "http://localhost:3000/api/admin/events?id=evt_ugadi_2026" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.3 RSVP & Devotee Management
**Filter RSVPs:**
```bash
curl -X GET "http://localhost:3000/api/admin/rsvps?eventId=evt_ugadi_2026&status=CONFIRMED&page=1&limit=25" \
  -H "Authorization: Bearer $TOKEN"
```

**Create / Manual RSVP:**
```bash
curl -X POST "http://localhost:3000/api/admin/rsvps" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_ugadi_2026",
    "fullName": "Srinivas Rao",
    "email": "srinivas@example.com",
    "phone": "+447911123456",
    "adultsCount": 2,
    "kidsCount": 1,
    "status": "CONFIRMED"
  }'
```

**Convert RSVP Attendee to Registered Member:**
```bash
curl -X POST "http://localhost:3000/api/admin/rsvps/convert-to-member" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rsvpId": "rsvp_cuid_123",
    "generateCredentials": true
  }'
```

### 3.4 Payments & Stripe Control
**Query Payments:**
```bash
curl -X GET "http://localhost:3000/api/admin/payments?status=COMPLETED&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Force Create RSVP for Successful Offline/Discrepant Payment:**
```bash
curl -X POST "http://localhost:3000/api/admin/payments/force-rsvp" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_stripe_pi_12345"
  }'
```

### 3.5 Member Directory & Broadcast Notifications
**List Members:**
```bash
curl -X GET "http://localhost:3000/api/admin/members?tier=PATRON&status=ACTIVE&page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

**Broadcast Email to Members:**
```bash
curl -X POST "http://localhost:3000/api/admin/notify" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "ACTIVE_MEMBERS",
    "subject": "Volunteers Needed for Ugadi 2026",
    "messageBody": "<p>Dear Members, we are seeking volunteers for stage and prasadam coordination.</p>",
    "priority": "HIGH"
  }'
```

### 3.6 Media Gallery & Homepage Featured Media
**Add Media Item:**
```bash
curl -X POST "http://localhost:3000/api/admin/media" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ganesh Aarti 2025 Highlights",
    "type": "VIDEO",
    "url": "https://www.youtube.com/watch?v=example",
    "category": "FESTIVALS",
    "isFeatured": true
  }'
```

**Reorder Media Items:**
```bash
curl -X PATCH "http://localhost:3000/api/admin/media/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderedIds": ["media_id_3", "media_id_1", "media_id_2"]
  }'
```

### 3.7 Sponsors & Donors
**Create Sponsor:**
```bash
curl -X POST "http://localhost:3000/api/admin/sponsors" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Saraswathi Financial Services",
    "tier": "PLATINUM",
    "logoUrl": "https://example.com/logo.png",
    "websiteUrl": "https://saraswathifinance.co.uk",
    "isActive": true
  }'
```

### 3.8 Telugu Business Directory
**Create Business Listing:**
```bash
curl -X POST "http://localhost:3000/api/admin/telugu-business" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Amaravathi Catering UK",
    "category": "FOOD_CATERING",
    "contactPerson": "Ramesh Varma",
    "email": "info@amaravathicatering.co.uk",
    "phone": "+447812345678",
    "city": "London",
    "status": "APPROVED"
  }'
```

### 3.9 Charity & Student Relief
**Add Relief Case:**
```bash
curl -X POST "http://localhost:3000/api/admin/charity-cases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Medical Support for International Student",
    "applicantName": "K. Sai Krishna",
    "category": "MEDICAL",
    "targetAmount": 3500.00,
    "urgency": "HIGH",
    "status": "OPEN",
    "description": "Hospitalization and medical relief support fund."
  }'
```

### 3.10 Site Configuration Settings
**Update Site Setting:**
```bash
curl -X POST "http://localhost:3000/api/admin/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "contact_emergency_helpline",
    "value": "+44 7000 123456",
    "category": "CONTACT",
    "description": "Emergency Telugu student support telephone line"
  }'
```

---

## 4. LLM Guidelines & Best Practices

1. **Token Refreshing**: The Admin JWT expires in 7 days. If a request returns `401 Unauthorized`, re-authenticate via `POST /api/auth/login` to obtain a fresh token.
2. **Media URLs vs Binary Uploads**: Since LLMs handle text and JSON payloads best, pass direct media URLs (e.g., hosted image/video URLs) into the `url`, `bannerUrl`, or `logoUrl` fields instead of issuing `multipart/form-data` uploads.
3. **Safe Deletions**: Always verify entity IDs by running a query `GET` with appropriate search filters before calling `DELETE`.
4. **Pagination**: Most listing endpoints default to 20 or 50 items per page. Always inspect `pagination.totalPages` in responses to paginate thoroughly if aggregating data.
