# AUTO PING — Never Miss a Service

> **Instruction to the AI builder (Antigravity):** Build the complete web application described in this document. Follow the phases in Section 20 in order. Use realistic seed data (Section 16) so every screen looks alive on first run. Where a decision is not specified, choose the simplest option that still looks premium and works end to end. Do not skip the Admin side or the Chatbot.

---

## 1. Product Overview

**Auto Ping** is a vehicle-care platform that remembers when a vehicle needs maintenance, explains *what* needs to be serviced and *why*, estimates the cost, finds suitable service centers, shows available slots, and lets the user book the service, either manually or through a guided chatbot.

**Tagline:** *Never Miss a Service.*

**Real-life example (the problem we solve):**
Shreyas bought a Hyundai Creta in 2024. He forgets his 20,000 km service, his engine oil gets old, and a month later he pays ₹15,000 for a repair that a ₹4,500 service would have prevented. With Auto Ping, he gets a reminder 30 days early, sees exactly what is due, compares service centers, picks a slot and books in under a minute.

### Three experiences in one platform

| Experience | Who uses it | Purpose |
|---|---|---|
| **Customer App** | Vehicle owners | Vehicles, health, reminders, booking, chatbot |
| **Service Center Portal** | Garage / dealership staff | Manage slots, accept/reject bookings, update service status |
| **Admin Dashboard** | Platform admin | Users, vehicles, bookings, centers, reports |

> **Scope note:** Customer App and Admin Dashboard are **mandatory**. The Service Center Portal is **Phase 2** (build a simplified version if time allows; otherwise the Admin can perform its actions).

---

## 2. Goals & Success Criteria

- A new user can sign up → add a vehicle → book a service in **under 2 minutes**.
- Dashboard tells the user **what is due next, in how many days/km, and the estimated cost** at a glance.
- Two users can never book the **same slot** at the same service center.
- Admin sees live counts and can confirm/cancel any booking.
- UI feels like **Cars24 + Apple + Glassmorphism**: clean, premium, spacious, smooth.

---

## 3. User Roles

| Role | Access |
|---|---|
| `CUSTOMER` | Own profile, vehicles, bookings, notifications, chatbot |
| `SERVICE_CENTER` *(Phase 2)* | Own center's slots and bookings |
| `ADMIN` | Everything, via a separate admin dashboard |

Admin login is a **separate entry** ("Admin Login" link on the login page) and redirects to `/admin`. Customers must never be able to open `/admin` routes (enforce with middleware + server-side role checks).

---

## 4. Recommended Tech Stack

Use this unless there is a strong reason not to:

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router) + TypeScript** |
| Styling | **Tailwind CSS** + shadcn/ui components |
| Animation | **Framer Motion** |
| Icons | lucide-react |
| Charts | Recharts |
| Database | **PostgreSQL** (SQLite acceptable for local dev) |
| ORM | **Prisma** |
| Auth | NextAuth (Auth.js): email/password + Google |
| Validation | Zod + React Hook Form |
| State / data fetching | TanStack Query (or server actions) |
| Notifications | In-app (DB-backed) now; email via Resend/Nodemailer as optional; WhatsApp/SMS = future |
| Chatbot | Rule-based **guided flow** (buttons/chips), no external AI required |
| Date handling | date-fns |

---

## 5. Design System

**Style:** Cars24 + Apple + Glassmorphism.

### Colors
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F5F7FA` | Page background (with soft radial gradients) |
| `--primary` | `#0B5CFF` | Buttons, links, active states |
| `--secondary` | `#00C2FF` | Accents, gradients (electric cyan) |
| `--success` | `#22C55E` | Good / confirmed |
| `--warning` | `#F59E0B` | Due soon |
| `--danger` | `#EF4444` | Overdue / cancelled |
| `--text` | `#0F172A` | Main text |
| `--muted` | `#64748B` | Secondary text |

### Glass card recipe
```css
background: rgba(255,255,255,0.65);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.6);
box-shadow: 0 8px 32px rgba(15,23,42,0.08);
border-radius: 20px;
```

### Typography
**Inter** (SF Pro-like). Large bold headings, generous whitespace, rounded corners (16–24px).

### Motion (subtle, never excessive)
- Card hover lift (translateY -4px + shadow)
- Page transitions (fade + slight slide)
- Animated number counters on dashboard cards
- Progress bar / ring animations for health score
- Calendar month transitions
- Vehicle card slide-in
- Booking success animation (checkmark draw + confetti-lite)
- Chatbot typing indicator (three dots)
- Skeleton loaders for all data-loading states
- Smooth modal open/close

### Responsive & accessible
- Mobile-first; must work from 360px to desktop.
- Bottom tab bar on mobile, sidebar on desktop.
- Keyboard navigable, visible focus rings, sufficient color contrast, `prefers-reduced-motion` respected.
- Dark mode: optional, nice-to-have.

---

## 6. Information Architecture (Sitemap)

```text
AUTO PING
│
├── / (Landing Page)
│
├── Authentication
│   ├── /login
│   ├── /signup
│   ├── /forgot-password
│   └── /admin/login
│
├── Onboarding
│   ├── /onboarding/profile
│   └── /onboarding/vehicle
│
├── Customer App (protected)
│   ├── /dashboard
│   ├── /vehicles
│   ├── /vehicles/[id]            (Vehicle Health page)
│   ├── /services/book            (multi-step booking)
│   ├── /bookings
│   ├── /bookings/[id]
│   ├── /history
│   ├── /notifications
│   └── /profile
│
├── Floating: Auto Ping Assistant (chatbot on every customer page)
│
└── Admin (role = ADMIN)
    ├── /admin                    (Command Center)
    ├── /admin/users
    ├── /admin/vehicles
    ├── /admin/bookings
    ├── /admin/service-centers
    ├── /admin/slots
    ├── /admin/catalog            (brands/models/service types)
    ├── /admin/notifications
    └── /admin/reports
```

**Navigation (customer):** Dashboard · My Vehicles · Services · Bookings · Service History · Notifications · Profile, plus the floating **🤖 Auto Ping** button.

---

## 7. Detailed Feature Specification

### 7.1 Landing Page (`/`)
- Hero: "Never Miss a Service." + sub-text + **Get Started** and **Login** buttons.
- 3 feature blocks: Smart Reminders, Easy Booking, Vehicle Health.
- "How it works" in 4 steps (Add vehicle → Get reminded → Choose center → Book slot).
- Animated mock of the dashboard card.
- Footer with links.

### 7.2 Login / Signup
**Login screen elements:** Auto Ping logo, tagline, Email/Mobile, Password (show/hide), **Continue with Google**, Forgot password, Create account, **Admin Login** link.

**Validation rules:**
- Email: valid format. Mobile: 10-digit Indian number (`^[6-9]\d{9}$`).
- Password: min 8 chars, at least 1 letter and 1 number.
- Show inline errors, never alert boxes.

**Real-life example:** Shreyas types his mobile number instead of email. The login accepts either field and figures out which one it is.

### 7.3 Create Profile (after signup)
Fields: Profile photo (optional upload, preview), Full name, Email, Mobile, City, Address, Preferred service city. Button: **Save & Proceed**.
- Preferred service city drives which service centers are shown by default.

### 7.4 Add Vehicle (visual, not a plain form)
Multi-step wizard with progress bar and animated transitions:

1. **Vehicle Type**: large cards: 🚗 Car · 🏍️ Bike · 🛵 Scooter
2. **Brand**: grid of brand **logos** (search box on top)
   - Cars: Tata, Mahindra, Maruti Suzuki, Hyundai, Honda, Toyota, Kia, BMW, Mercedes-Benz, Audi
   - Bikes/Scooters: Royal Enfield, Yamaha, Bajaj, TVS, Hero, Honda
3. **Model**: list filtered by brand and type (e.g., Hyundai → Creta, Venue, i20, Verna…)
4. **Purchase Year**: scrollable year picker (current year down to 2000)
5. **Current KM** *(essential; service intervals depend on mileage)*
6. **Extras (optional):** Registration number (e.g., `MH12AB1234`), fuel type (Petrol/Diesel/CNG/EV), last service date, last service KM
7. **Review & Save**

**Example:** `Hyundai → Creta → 2024 → 18,500 km → last serviced 15 Aug 2026 at 10,500 km`.

Users can add **multiple vehicles** and can edit/delete them later.

> Brand logos: use locally stored SVG/PNG assets or a clean placeholder (brand initials in a circle) if real logos aren't available. Do **not** hotlink random external images.

### 7.5 Customer Dashboard (`/dashboard`)
Greeting by time of day: *"Good afternoon, Shreyas 👋"* + *"Your vehicle is ready for its next check-up."*

**My Vehicles** carousel of vehicle cards:
```
🚗 Hyundai Creta
2024 • 18,500 km
[ Service Due in 12 Days ]   ← colored badge (green / yellow / red)
```

**Stat cards** (animated counters) for the selected vehicle:

| Card | Example |
|---|---|
| 🔧 Next Service | 12 days |
| 🛣️ Service KM | 1,500 km left |
| 💰 Estimated Cost | ₹4,500 |
| ❤️ Vehicle Health | 92% |
| 📅 Last Service | 15 Aug 2026 |

Also on dashboard: **Smart Reminder banner**, **Upcoming Booking card** (if any), **Recent Activity**, floating **Chatbot** button.

**Empty state:** if no vehicles → friendly illustration + "Add your first vehicle" button.

### 7.6 Vehicle Details & Health Page (`/vehicles/[id]`)
Sections:
- **Vehicle info:** brand, model, registration, purchase year, fuel type, current KM (editable, with "Update KM" quick action).
- **Service info:** last service, next service (date + KM), estimated cost.
- **Vehicle Health Score** (ring chart, see 8.3).
- **Health Timeline** with status for each component:
  `Oil Change → Brake Inspection → Tyre Check → Battery → AC → Engine → Filters`
  Each shows 🟢 Good · 🟡 Due Soon · 🔴 Overdue with last-done and next-due info.
- **Service history** list (date, KM, center, services done, cost).
- **Maintenance schedule** (upcoming intervals, e.g., 20k, 30k, 40k km).
- **Book Service** primary button.

**Real-life example:** Amit sees "Brake Inspection: 🟡 Due Soon, last done at 12,000 km, next at 24,000 km" and taps Book Service; brake inspection is already pre-selected.

### 7.7 Smart Service Reminder
Not just "service due on 12 October." Show a rich card:

> 🔔 **Your service is coming up**
> **Hyundai Creta**
> Recommended because:
> - 20,000 km interval approaching (you're at 18,500 km)
> - Engine oil replacement
> - Oil filter replacement
> - Brake inspection
> - Tyre inspection
>
> **Estimated Service Cost:** ₹3,500 – ₹5,000
> `[Book Service]`

Reminders are generated from the rules in Section 8.

### 7.8 Book Service, Step 1: Choose Services
Checkbox cards (multi-select, with icon + short description + approx price):
- General Service
- Engine Oil Change
- Brake Service
- AC Service
- Battery
- Tyre Service
- Periodic Maintenance
- Washing & Detailing

Recommended items (from the reminder engine) are **pre-selected** with a "Recommended" tag.

**Special Requirements** (textarea, max 500 chars) with quick-add chips:
🔧 Check engine noise · 🛞 Check tyre condition · ❄️ AC not cooling · 🔋 Battery issue · 🚨 Warning light · ✍️ Other
Tapping a chip appends text to the box.

Example text: *"Please check unusual brake noise when braking at high speed."*

Optional: **"Visit Mechanic Website"** link shown on a service center if it has `websiteUrl`.

### 7.9 Book Service, Step 2: Choose Service Center
Three tabs: **Authorized** · **Multi-Brand** · **Local**
- *Authorized* only shows centers matching the vehicle's brand.
- Sort/filter: distance, rating, price, slots available.

**Card:**
```
Tata Motors Service Center
⭐ 4.6   📍 3.2 km   ₹4,500 estimated   🟢 6 slots available
[View Details]  [Select]
```
**View Details** opens a modal: address, phone, opening hours, services offered, supported brands, rating, website link, map placeholder.

Distance: compute from city/area using stored lat/lng (Haversine) if user's location is available; otherwise show city-level distance or mock values.

### 7.10 Book Service, Step 3: Date & Slot
- Month calendar (animated month change). Past dates and fully-booked days disabled.
- After selecting a date, show slots: `09:00 AM · 10:30 AM · 12:00 PM · 02:30 PM · 04:00 PM`
- **Unavailable slots are greyed out** and not clickable.
- Slot capacity: each slot has a `capacity` (default 2 bookings). Show "Only 1 left!" when capacity remaining = 1.

### 7.11 Book Service, Step 4: Summary & Confirmation
Summary card: Vehicle, Services, Service Center, Date, Time, Estimated Cost, Special Requirements.
Button: **Confirm Service**.

On success: animated checkmark + "**Service Booked!**"
> Your Hyundai Creta service is scheduled for **12 October • 10:30 AM**
> Booking ID: `AP-20261012-001`

Actions: Add to Calendar (.ics download), View Booking, Back to Dashboard.
Also: create in-app notification + (optional) confirmation email.

**Booking ID format:** `AP-YYYYMMDD-NNN` (date of service + daily running number, zero-padded).

### 7.12 Bookings Page (`/bookings`)
Tabs: **Upcoming · Completed · Cancelled**. Each card shows status pill, vehicle, center, date/time.
Actions: **Reschedule** (re-pick slot; frees the old one), **Cancel** (with confirmation modal and optional reason; allowed up to 2 hours before slot), **View details**.

### 7.13 Service History (`/history`)
Timeline/table filtered by vehicle. Each entry: date, KM, center, services performed, total cost, invoice note. Completed bookings automatically become history entries. Users can also **manually add past service** (for older records).

### 7.14 Notifications (`/notifications`)
List with unread indicator, mark-as-read, mark-all-read, filter by type. Bell icon with unread count in the header. See Section 9 for rules.

### 7.15 Profile (`/profile`)
Edit personal info, photo, preferred city, notification preferences (toggle in-app / email / WhatsApp / SMS), change password, delete account.

---

## 8. Business Logic

### 8.1 Service Interval Rules
Each vehicle model (or vehicle type default) has intervals. Use the **earlier** of the two triggers:

| Vehicle type | KM interval | Time interval |
|---|---|---|
| Car | every 10,000 km | 6–12 months |
| Bike | every 3,000–5,000 km | 6 months |
| Scooter | every 3,000 km | 6 months |

Store defaults in the catalog so Admin can edit them per model.

```
nextServiceKm   = lastServiceKm + intervalKm
nextServiceDate = lastServiceDate + intervalMonths
kmRemaining     = nextServiceKm - currentKm
daysRemaining   = nextServiceDate - today
dueStatus       = whichever of (kmRemaining, daysRemaining) is more urgent
```

**Real-life example:** Creta last serviced 15 Aug 2026 at 10,500 km, interval 10,000 km / 12 months. Now 18,500 km, so 2,000 km left. Next service at 20,500 km. The reminder is triggered because it's within 2,000 km, even though the date is far away.

### 8.2 Status Thresholds
| Status | Condition |
|---|---|
| 🟢 **Good** | > 30 days AND > 1,000 km remaining |
| 🟡 **Due Soon** | ≤ 30 days OR ≤ 1,000 km remaining |
| 🔴 **Overdue** | days < 0 OR km remaining < 0 |

Apply the same logic per component (oil, brakes, tyres, battery, AC, engine, filters) using each component's own interval (see table below).

| Component | KM interval | Time interval |
|---|---|---|
| Engine oil & filter | 10,000 | 12 months |
| Brake inspection | 20,000 | 12 months |
| Tyre check / rotation | 10,000 | 6 months |
| Battery check | — | 12 months (replace ~36–48 months) |
| AC service | — | 12 months |
| Engine check | 20,000 | 12 months |
| Air / cabin filters | 20,000 | 12 months |

*(These are sensible defaults; keep them editable in Admin → Catalog.)*

### 8.3 Vehicle Health Score (0–100)
Weighted score, recalculated whenever KM, service history, or bookings change:

| Component | Weight |
|---|---|
| Engine oil | 20 |
| Brakes | 20 |
| Tyres | 15 |
| Battery | 15 |
| Engine | 10 |
| AC | 10 |
| Filters | 10 |

Per-component points: **Good = 100%**, **Due Soon = 60%**, **Overdue = 20%** of its weight. Round to nearest integer.
Display: animated ring or `█████████░` bar, plus label (≥85 Excellent, 70–84 Good, 50–69 Needs attention, <50 Critical).
A short "Why?" tooltip lists which components lowered the score.

**Example:** Everything Good except Tyres 🟡 → 100 − (15 × 0.4) = **94%**.

### 8.4 Estimated Cost
`estimatedCost = sum(service base price for selected services) × vehicle-class multiplier × center-type multiplier`
- Vehicle class multiplier: hatchback 1.0, sedan 1.15, SUV 1.3, premium (BMW/Merc/Audi) 2.0+; bikes 0.3, scooters 0.25.
- Center-type multiplier: Authorized 1.2, Multi-brand 1.0, Local 0.85.
- Show as a **range** (−15% to +10%), e.g., "₹3,500 – ₹5,000".
- Label it clearly as an *estimate*.

### 8.5 Slot Booking Rules (critical)
- A slot = (service center, date, start time). It has `capacity`.
- On confirm, run in a **database transaction**: re-check remaining capacity, then create booking. If full, return a friendly error and refresh slots ("Sorry, that slot was just taken. Please pick another.").
- Slots cannot be booked in the past or within 2 hours from now.
- Cancelled/rescheduled bookings release capacity immediately.
- One vehicle cannot have two active bookings at overlapping times.

### 8.6 Booking Status Lifecycle
```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
    ↘         ↘
   CANCELLED  CANCELLED / NO_SHOW
```
- Default on customer booking: `CONFIRMED` if the center has auto-confirm on, else `PENDING`.
- Admin (or center) can move status forward. When `COMPLETED`: admin/center enters final cost, KM at service, services done → auto-create a **ServiceRecord**, update the vehicle's `lastServiceDate/KM`, recalculate health and next service, and send "Service completed" notification.

---

## 9. Notification System

| Trigger | Message | Type |
|---|---|---|
| 30 days before due | 🔔 Your next service is approaching. | `REMINDER_30D` |
| 7 days before due | ⚠️ Your Hyundai Creta service is due in 7 days. | `REMINDER_7D` |
| Due today | 🚨 Your service is due today. | `DUE_TODAY` |
| Overdue | 🔴 Your vehicle service is overdue by 12 days. | `OVERDUE` |
| KM-based | Your bike is within 500 km of its next service. | `REMINDER_KM` |
| Booking confirmed | ✅ Service booked for 12 Oct, 10:30 AM. | `BOOKING_CONFIRMED` |
| Day-before booking | ⏰ Reminder: your service is tomorrow at 10:30 AM. | `BOOKING_REMINDER` |
| Booking cancelled/changed | ❌ / 🔁 Your booking was cancelled / rescheduled. | `BOOKING_UPDATED` |
| After service | ✅ Your service has been completed. | `SERVICE_COMPLETED` |

**Implementation:** a scheduled job (cron / Next.js route triggered daily, plus a manual "Run reminder job" button in Admin for demo) that scans vehicles, computes status, and inserts notifications without duplicates (unique key: vehicleId + type + dueCycle).
Channels: **In-app (build now)**, Email (optional), WhatsApp/SMS (future; leave adapter interfaces and toggles in place).

**Real-life example:** On 5 October the job sees Priya's Activa is 7 days from its 6-month service, creates a `REMINDER_7D` notification, and the bell icon shows a red "1".

---

## 10. Auto Ping Assistant (Chatbot)

A **task-oriented guided assistant**, not a free-text AI. Floating button (bottom-right) opens a glass chat panel with typing animation, quick-reply chips, and a restart option.

**Main menu:** Hi! What would you like to do?
`[Book Service]` `[Check Next Service]` `[View My Vehicles]` `[Service History]`

### Flow: Book Service
1. "Which vehicle?" → 🚗 Hyundai Creta / 🏍️ Royal Enfield Classic 350
2. "What do you need?" → 🔧 General Service / 🛢️ Oil Change / 🛞 Tyre / 🔋 Battery / ❓ Other
3. "When would you like to visit?" → 📅 date picker
4. "Choose a service center." → 3 top cards (by rating/distance/slots)
5. "Pick a time." → slot chips
6. "Your service is ready to book." → summary + **[Confirm Booking]** / **[Change]**
7. Success message with Booking ID.

### Flow: Check Next Service
Shows: "Your Creta's next service is in **12 days** or **1,500 km**. Estimated ₹4,500. Want to book it?" `[Yes, book]` `[Not now]`

### Other flows
- **View My Vehicles:** cards with health % and status.
- **Service History:** last 3 records + "View all".
- **Fallback:** if input is unrecognized, show the main menu chips and say "I can help with these:".
- Optional free-text: simple keyword matching (book, service, next, history, cancel) mapped to the above flows.

The chatbot must call the **same booking API/logic** as the manual flow (one source of truth). Persist chat state in component state; no need to store transcripts.

**Real-life example:** Rahul, driving, opens the assistant, taps *Book Service → Honda City → Oil Change → tomorrow → Honda Service → 10:30 AM → Confirm*. Six taps, done.

---

## 11. Admin Dashboard

Separate layout (dark sidebar or distinct header) at `/admin`. Login at `/admin/login`.

### 11.1 Command Center (`/admin`)
KPI cards (animated): **Total Users · Vehicles · Today's Bookings · Upcoming Services · Confirmed Slots · Pending Requests**.
Charts: bookings per day (last 30 days), bookings by service type (donut), top brands, center utilization.

**Today's Service Schedule** table:

| Time | Customer | Vehicle | Center | Status | Actions |
|---|---|---|---|---|---|
| 09:00 | Rahul | Honda City | Honda Service | Confirmed | View / Cancel |
| 10:30 | Amit | Creta | Local Garage | Confirmed | View / Cancel |
| 12:00 | Priya | Activa | Multi Brand | Pending | **Confirm** / Reject |

### 11.2 Admin Capabilities
- **Users:** list, search, filter, view detail (profile, vehicles, bookings), suspend/activate.
- **Vehicles:** list all, filter by brand/type/status, view detail and history.
- **Bookings:** filter by date/status/center, confirm/cancel/reschedule, change status, add completion details.
- **Service Centers:** create/edit/deactivate (name, type Authorized/Multi-brand/Local, brands supported, address, city, lat/lng, phone, website, hours, services offered, rating, photo).
- **Slots:** generate slots per center (working days, time list, capacity), block dates (holidays), edit capacity.
- **Catalog:** manage vehicle brands (with logo), models, service types with base prices, service intervals.
- **Service history:** view/search all records.
- **Notifications:** view sent notifications; send an announcement to all users or a segment; "Run reminder job now".
- **Reports:** bookings, revenue estimate, popular services, no-show rate; **export CSV**.

Every table: pagination, search, sort, loading skeleton, empty state.

---

## 12. Service Center Portal (Phase 2)

Login as `SERVICE_CENTER` → `/center`:
- Today's bookings and calendar view
- Accept / reject / reschedule bookings
- Update status (In progress / Completed) + enter final cost & services done
- Manage own slots and capacity
- View customer + vehicle details for their bookings only

---

## 13. Data Model (Prisma-style)

```prisma
enum Role { CUSTOMER SERVICE_CENTER ADMIN }
enum VehicleType { CAR BIKE SCOOTER }
enum FuelType { PETROL DIESEL CNG EV }
enum CenterType { AUTHORIZED MULTI_BRAND LOCAL }
enum BookingStatus { PENDING CONFIRMED IN_PROGRESS COMPLETED CANCELLED NO_SHOW }

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  mobile        String?  @unique
  passwordHash  String?
  role          Role     @default(CUSTOMER)
  photoUrl      String?
  city          String?
  address       String?
  preferredCity String?
  isActive      Boolean  @default(true)
  prefs         Json?    // notification channel toggles
  vehicles      Vehicle[]
  bookings      Booking[]
  notifications Notification[]
  createdAt     DateTime @default(now())
}

model Brand {
  id     String @id @default(cuid())
  name   String @unique
  type   VehicleType
  logoUrl String?
  models VehicleModel[]
}

model VehicleModel {
  id             String @id @default(cuid())
  brandId        String
  brand          Brand  @relation(fields: [brandId], references: [id])
  name           String
  vehicleClass   String   // hatchback | sedan | suv | premium | bike | scooter
  serviceKmInterval     Int
  serviceMonthInterval  Int
  imageUrl       String?
}

model Vehicle {
  id              String @id @default(cuid())
  userId          String
  user            User   @relation(fields: [userId], references: [id])
  modelId         String
  model           VehicleModel @relation(fields: [modelId], references: [id])
  registrationNo  String?
  purchaseYear    Int
  currentKm       Int
  fuelType        FuelType?
  lastServiceDate DateTime?
  lastServiceKm   Int?
  healthScore     Int      @default(100)
  bookings        Booking[]
  records         ServiceRecord[]
  componentStatus ComponentStatus[]
  createdAt       DateTime @default(now())
}

model ComponentStatus {
  id          String @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle @relation(fields: [vehicleId], references: [id])
  component   String   // OIL, BRAKES, TYRES, BATTERY, AC, ENGINE, FILTERS
  lastDoneDate DateTime?
  lastDoneKm  Int?
  @@unique([vehicleId, component])
}

model ServiceType {
  id        String @id @default(cuid())
  name      String @unique
  icon      String?
  description String?
  basePrice Int
  isActive  Boolean @default(true)
}

model ServiceCenter {
  id          String @id @default(cuid())
  name        String
  type        CenterType
  brandsSupported String[]   // brand names; empty = all (multi/local)
  address     String
  city        String
  lat         Float?
  lng         Float?
  phone       String?
  websiteUrl  String?
  openingHours Json?
  servicesOffered String[]
  rating      Float   @default(4.0)
  autoConfirm Boolean @default(true)
  isActive    Boolean @default(true)
  slots       Slot[]
}

model Slot {
  id        String @id @default(cuid())
  centerId  String
  center    ServiceCenter @relation(fields: [centerId], references: [id])
  date      DateTime   // date only
  startTime String     // "10:30"
  capacity  Int @default(2)
  booked    Int @default(0)
  isBlocked Boolean @default(false)
  bookings  Booking[]
  @@unique([centerId, date, startTime])
}

model Booking {
  id          String @id @default(cuid())
  bookingCode String @unique         // AP-20261012-001
  userId      String
  vehicleId   String
  centerId    String
  slotId      String
  services    String[]               // service type ids/names
  notes       String?
  estimatedCostMin Int
  estimatedCostMax Int
  status      BookingStatus @default(CONFIRMED)
  cancelReason String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ServiceRecord {
  id        String @id @default(cuid())
  vehicleId String
  bookingId String?
  centerName String
  date      DateTime
  km        Int
  servicesDone String[]
  totalCost Int
  notes     String?
}

model Notification {
  id       String @id @default(cuid())
  userId   String
  type     String
  title    String
  message  String
  vehicleId String?
  bookingId String?
  isRead   Boolean @default(false)
  dedupeKey String? @unique
  createdAt DateTime @default(now())
}
```

*(Adjust field names as needed, but keep the relationships and the unique constraints; especially `Slot @@unique` and `Notification.dedupeKey`.)*

---

## 14. API / Server Actions (REST-style reference)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` · `/login` | Auth |
| GET/PUT | `/api/profile` | Profile |
| GET | `/api/catalog/brands?type=CAR` | Brands |
| GET | `/api/catalog/models?brandId=` | Models |
| GET/POST | `/api/vehicles` | List / add vehicle |
| GET/PUT/DELETE | `/api/vehicles/:id` | Vehicle detail / update (incl. KM) / delete |
| GET | `/api/vehicles/:id/health` | Health score + component statuses + recommendations |
| GET | `/api/services` | Service types |
| POST | `/api/estimate` | Cost estimate for vehicle + services + center |
| GET | `/api/centers?tab=&city=&vehicleId=` | Service centers |
| GET | `/api/centers/:id/slots?date=` | Slots for a date |
| POST | `/api/bookings` | Create booking (transactional) |
| GET | `/api/bookings?status=` | My bookings |
| PATCH | `/api/bookings/:id` | Cancel / reschedule |
| GET | `/api/history?vehicleId=` | Service history |
| GET/PATCH | `/api/notifications` | List / mark read |
| POST | `/api/chatbot/action` | Optional; reuse the booking endpoints |
| GET | `/api/admin/stats` | Dashboard KPIs |
| CRUD | `/api/admin/{users,vehicles,bookings,centers,slots,catalog}` | Admin management |
| POST | `/api/admin/jobs/reminders` | Run reminder job |

All inputs validated with Zod; all protected routes check session + role; return consistent JSON `{ data, error }`.

---

## 15. Suggested Folder Structure

```text
/src
  /app
    /(marketing)/page.tsx
    /(auth)/login, signup, forgot-password
    /(customer)/dashboard, vehicles, services/book, bookings, history, notifications, profile
    /admin/...
    /api/...
  /components
    /ui            (buttons, cards, glass, modal, skeleton)
    /vehicle       (VehicleCard, HealthRing, Timeline)
    /booking       (ServiceSelector, CenterCard, Calendar, SlotPicker, Summary)
    /chatbot       (ChatWidget, ChatFlow)
    /admin         (KpiCard, DataTable, Charts)
  /lib
    db.ts, auth.ts, health.ts, estimate.ts, slots.ts, reminders.ts, validators.ts
  /prisma/schema.prisma, seed.ts
  /public/brands/*.svg
```

Keep business logic (health, estimate, slots, reminders) in `/lib` as pure, testable functions.

---

## 16. Seed Data (so the app looks real on first run)

- **Users:** 1 admin (`admin@autoping.com` / `Admin@123`), 1 demo customer (`shreyas@example.com` / `Demo@1234`), ~20 fake customers.
- **Brands & models:** the brands from 7.4 with 3–6 popular models each (e.g., Hyundai: Creta, Venue, i20, Verna; Tata: Nexon, Punch, Harrier; Royal Enfield: Classic 350, Bullet 350, Hunter 350; Honda: City, Amaze, Activa, Shine; TVS: Jupiter, Apache; etc.).
- **Demo customer vehicles:** Hyundai Creta 2024 (18,500 km, Due Soon) and Royal Enfield Classic 350 2022 (Good).
- **Service centers:** ~12 across Pune, Mumbai, Bengaluru, Delhi: mix of Authorized, Multi-Brand, and Local, with ratings 4.0–4.9.
- **Slots:** auto-generated for the next 30 days: `09:00, 10:30, 12:00, 14:30, 16:00`, capacity 2, some randomly pre-filled.
- **Bookings:** ~40 spread across statuses and dates (so admin charts aren't empty).
- **Service history:** 2–3 past records for the demo vehicles.
- **Notifications:** a few for the demo customer.

Use **Indian context**: currency ₹, +91 mobile format, Indian cities and names.

---

## 17. Non-Functional Requirements

- **Performance:** skeleton loaders; images optimized; dashboard loads < 2 s on seeded data.
- **Security:** hashed passwords (bcrypt/argon2), CSRF-safe sessions, rate-limit login, input validation on server, role checks on every admin/center route, never expose other users' data.
- **Reliability:** slot booking is transactional; idempotent reminder job.
- **Error handling:** friendly error toasts, 404 and 500 pages, form-level and field-level errors.
- **Empty states:** every list has one (illustration + action).
- **SEO/Meta:** landing page title, description, OG tags.
- **Privacy:** account deletion removes personal data; show a simple privacy note on signup.
- **Testing:** unit tests for `health.ts`, `estimate.ts`, `slots.ts`, `reminders.ts`.

---

## 18. Edge Cases to Handle

| Situation | Expected behavior |
|---|---|
| User has no vehicle | Dashboard empty state → "Add vehicle" |
| Current KM entered lower than previous | Validation error ("KM can't go down") |
| Last service date in the future | Validation error |
| No slots available on chosen date | Message + suggest next available date |
| Two users pick the same last slot | Second gets "Slot just taken" and refreshed slots |
| Center has no slots at all | Card shows "No slots", Select disabled |
| Vehicle never serviced | Base calculation on purchase year + KM; flag "No service record; add one?" |
| Brand has no authorized center in city | "Authorized" tab shows empty state suggesting Multi-Brand |
| User cancels < 2 hours before slot | Block with message |
| Admin deactivates a center with future bookings | Warn and require reassign/cancel |
| Session expired | Redirect to login and return to the previous page |

---

## 19. Content & Copy Guidelines

Friendly, short, confident. Examples:
- Greeting: "Good afternoon, Shreyas 👋"
- Empty vehicles: "No vehicles yet. Add your first one and we'll take care of the reminders."
- Success: "Service Booked! We'll remind you the day before."
- Error: "That slot was just taken. Here are other times that work."

---

## 20. Build Plan (follow in order)

**Phase 1: Foundation**
1. Project setup, Tailwind, design tokens, Inter font, glass components, layout shells (customer + admin).
2. Prisma schema, migrations, seed script.
3. Authentication (email/password + Google), role-based middleware, Admin login.

**Phase 2: Customer core**
4. Landing page.
5. Profile onboarding.
6. Add Vehicle wizard (type → brand → model → year → KM).
7. Dashboard with vehicle cards and stat cards.
8. Vehicle detail + Health score + timeline.
9. Reminder engine (`lib/health.ts`, `lib/reminders.ts`) + Smart Reminder card.

**Phase 3: Booking**
10. Service selection + special requirements.
11. Service center list (3 tabs) + details modal.
12. Calendar + slot picker.
13. Summary + transactional confirm + success animation + `.ics`.
14. Bookings page (cancel/reschedule) and Service History.

**Phase 4: Engagement**
15. Notifications (in-app + bell + reminder job).
16. Auto Ping Assistant chatbot with guided flows.

**Phase 5: Admin**
17. Command Center KPIs, charts, today's schedule.
18. Users, Vehicles, Bookings management.
19. Service centers, Slots, Catalog management.
20. Reports + CSV export.

**Phase 6: Polish**
21. Animations, skeletons, empty states, responsive QA, accessibility pass.
22. Unit tests for business logic; final end-to-end walkthrough.

**Phase 7 (optional): Service Center Portal, email/WhatsApp/SMS adapters, dark mode.**

---

## 21. Acceptance Checklist

- [ ] New user can sign up, complete profile, and add a vehicle with brand logos.
- [ ] Dashboard shows next service (days + km), estimated cost, health %, last service.
- [ ] Health score and component timeline update when KM or history changes.
- [ ] Smart reminder card explains *why* service is recommended.
- [ ] Booking works end to end: services → center (3 tabs) → date → slot → confirm.
- [ ] Booking ID follows `AP-YYYYMMDD-NNN`; success animation plays.
- [ ] Double-booking the same full slot is impossible.
- [ ] Cancel and reschedule free the slot.
- [ ] Notifications appear for reminders and booking events; bell shows unread count.
- [ ] Chatbot completes a full booking via guided buttons using the same booking logic.
- [ ] Admin login is separate; customers cannot access `/admin`.
- [ ] Admin sees KPIs, today's schedule, and can confirm/cancel bookings and manage centers/slots/catalog.
- [ ] CSV export works in Reports.
- [ ] UI is responsive (mobile + desktop), glassmorphism style, with smooth but subtle animation.
- [ ] Seed data makes every screen look populated on first launch.

---

## 22. Final Concept

> **Auto Ping is a vehicle-care platform that remembers when your vehicle needs maintenance, explains what needs to be serviced, estimates the cost, finds suitable service centers, shows available slots, and lets you book the service, either manually or through an intelligent guided assistant.**

# **AUTO PING**
### **Never Miss a Service.**
