# Pick-A-Pill — Enriched App Specification for Cursor Agent

> **How to use this document:** Feed the entire file to Cursor as context before starting. Build in the exact sequence laid out in the Execution Roadmap. Do not skip ahead — each step gates on `npx tsc --noEmit` passing clean before proceeding.

---

## 1. Project Identity

| Field | Value |
|---|---|
| App Name | Pick-A-Pill |
| Platform | Android (React Native, TypeScript) |
| Architecture | 100% local-first. Zero network calls. Zero cloud. Zero auth. |
| Target API | Android 12+ (API 31+) |
| Navigation library | React Navigation v6 (Native Stack + Bottom Tabs) |
| Version shown in UI | v2.4.1 |

---

## 2. Design Tokens

All colors, spacing, and radii must reference these tokens. **Never hardcode values.**

```ts
// tokens/colors.ts
export const Colors = {
  // Brand
  navy:          '#1B2D5B',   // primary brand, active nav, selected chips, profile card bg
  mint:          '#3ECFB2',   // accent, CTAs, taken status, progress bars, streak circles
  coral:         '#F4645F',   // missed status, destructive, badge dot, urgency indicators

  // Backgrounds
  surface:       '#EEEEF4',   // screen background (all screens)
  card:          '#FFFFFF',   // card backgrounds
  navyCard:      '#1B2D5B',   // today's progress card, profile header card

  // Text
  textPrimary:   '#1A1A2E',
  textMuted:     '#8A8FA8',
  textOnNavy:    '#FFFFFF',

  // UI Elements
  border:        '#E4E9F2',
  chipActive:    '#1B2D5B',   // selected chip: bg
  chipInactive:  '#FFFFFF',   // unselected chip: bg (on surface background)
  progressBg:    '#E4E9F2',   // unfilled progress bar track

  // Status
  takenBg:       '#E8FAF5',   // taken card background tint
  missedBg:      '#FEF0EF',   // missed card background tint
  pendingBg:     '#FFFFFF',   // pending card background
  takenBorder:   '#3ECFB2',   // taken card left border
  missedBorder:  '#F4645F',   // missed card left border

  // Stats/Charts
  chartBarMint:  '#3ECFB2',   // adherence bar chart — good days
  chartBarNavy:  '#1B2D5B',   // adherence bar chart — partial days
  chartBarAmber: '#F5A623',   // adherence bar chart — missed days (Sat/Sun in mockup)
  streakFilled:  '#3ECFB2',   // completed streak circle
  streakMissed:  '#E4E9F2',   // missed streak circle (–)
  streakToday:   '#FFFFFF',   // today streak circle (outlined, dot inside)
};
```

**Typography scale:**
- Display: `fontSize: 28, fontWeight: '700'` — greeting name, big stats
- Stat: `fontSize: 36, fontWeight: '800'` — percentage on progress card
- Title: `fontSize: 20, fontWeight: '700'` — screen headers
- SectionTitle: `fontSize: 16, fontWeight: '600'`
- Body: `fontSize: 14, fontWeight: '400'`
- BodySemiBold: `fontSize: 14, fontWeight: '600'`
- Caption: `fontSize: 12, fontWeight: '400'`
- Label: `fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase'` — form field labels

**Spacing scale (multiples of 4):** `4, 8, 12, 16, 20, 24, 32, 48`

**Border radius:** `card: 16`, `chip: 20`, `input: 12`, `button: 14`, `statCard: 12`

---

## 3. Data Model

```ts
// types/index.ts

export type FormFactor = 'Pill' | 'Liquid' | 'Injection';

export type Frequency =
  | 'Daily'
  | 'Twice Daily'
  | 'Alternate Days'
  | 'Weekly'
  | 'Monthly'
  | 'Custom';

export type DoseStatus = 'taken' | 'missed' | 'pending';

export type UrgencyLevel = 'Low' | 'Medium' | 'High';

// A single medication within a course
export interface Medication {
  id: string;                    // uuid v4
  name: string;                  // e.g. "Metformin"
  dosageStrength: string;        // e.g. "500mg"
  formFactor: FormFactor;
  frequency: Frequency;
  customFrequencyDays?: number;  // only when frequency === 'Custom'
  reminderTime: string;          // "HH:MM" 24-hr, e.g. "08:00"
}

// A treatment course — wraps one or more medications
export interface Course {
  id: string;                    // uuid v4
  name: string;                  // e.g. "Antibiotic Run"
  startDate: string;             // "YYYY-MM-DD"
  durationDays: number;          // 7 | 14 | 30 | custom
  endDate: string;               // computed: startDate + durationDays - 1
  medications: Medication[];
  // NOTE: isActive and isCompleted are NOT stored — computed at read time from today's date
}

// A single dose event for a specific day
export interface DoseRecord {
  id: string;                    // uuid v4
  courseId: string;
  medicationId: string;
  date: string;                  // "YYYY-MM-DD"
  status: DoseStatus;
  markedAt?: string;             // ISO timestamp of user action
}

// Computed course status — derive this, never store it
export interface CourseStatus {
  isActive: boolean;             // startDate <= today <= endDate
  isCompleted: boolean;          // endDate < today
  isUpcoming: boolean;           // startDate > today
  daysLeft: number;              // endDate - today (0 if completed)
  daysElapsed: number;           // today - startDate (clamped to durationDays)
  progressRatio: number;         // daysElapsed / durationDays, clamped 0–1
  urgency: UrgencyLevel;         // High: ≤3 days left, Medium: ≤7, Low: >7
}

// User profile
export interface UserProfile {
  name: string;
  email?: string;                // optional, shown in Settings profile card
  notificationsEnabled: boolean;
  refillReminderDays: number;    // default 3
  language: string;              // default "English"
}

// Adherence stats — computed from DoseRecord[], never stored
export interface AdherenceStats {
  dayStreak: number;             // consecutive days with 100% doses taken
  avgAdherencePct: number;       // (taken / total scheduled) over last 30 days, 0–100
  activeCourseCount: number;
  weeklyAdherence: WeekDay[];    // last 7 days
  todayTaken: number;
  todayTotal: number;
}

export interface WeekDay {
  date: string;                  // "YYYY-MM-DD"
  dayLabel: string;              // "Mon", "Tue", etc.
  adherencePct: number;          // 0–100
  status: 'full' | 'partial' | 'missed' | 'future';
}
```

**MMKV storage keys:**
```ts
// storage/keys.ts
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',   // JSON: UserProfile
  COURSES:      'courses',        // JSON: Course[]
  DOSE_RECORDS: 'dose_records',   // JSON: DoseRecord[]
  ONBOARDED:    'onboarded',      // "true" | "false"
} as const;
```

---

## 4. State Management (Zustand)

Three stores. Screens never touch MMKV directly — all persistence happens inside stores.

### 4.1 `useProfileStore`
```ts
interface ProfileStore {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}
```

### 4.2 `useCourseStore`
```ts
interface CourseStore {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, partial: Partial<Course>) => void;
  addMedicationToCourse: (courseId: string, medication: Medication) => void;
  updateMedicationInCourse: (courseId: string, medicationId: string, partial: Partial<Medication>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getActiveCourses: () => Course[];      // filters by today's date at call time
  getCompletedCourses: () => Course[];
}
```

### 4.3 `useDoseStore`
```ts
interface DoseStore {
  records: DoseRecord[];
  getDoseForDay: (medicationId: string, date: string) => DoseRecord | undefined;
  markDose: (courseId: string, medicationId: string, date: string, status: DoseStatus) => void;
  getRecordsForDate: (date: string) => DoseRecord[];
  // Used by Dashboard stats
  getRecordsInRange: (fromDate: string, toDate: string) => DoseRecord[];
}
```

---

## 5. Business Logic (Pure Helper Functions)

### `utils/courseHelpers.ts`

```ts
// Map "HH:MM" to time-of-day section
export function getTimeOfDay(reminderTime: string): 'morning' | 'afternoon' | 'evening'
// < 12:00 → morning, 12:00–16:59 → afternoon, 17:00+ → evening

// Returns true if a dose of this medication is scheduled on the given date
// Must handle ALL frequency types: Daily, Twice Daily, Alternate Days, Weekly, Monthly, Custom
export function isDoseScheduledOnDate(medication: Medication, course: Course, date: string): boolean

// Derive the display status for a dose slot.
// If a DoseRecord exists: return its status.
// If no record AND date is today AND reminderTime + 30 min has passed: return 'missed' (display only).
// Otherwise: return 'pending'.
// CRITICAL: This function must NEVER write to the store. It is read-only/display logic.
export function computeDisplayStatus(
  record: DoseRecord | undefined,
  medication: Medication,
  date: string
): DoseStatus

// Compute the derived status fields for a course (isActive, daysLeft, urgency, etc.)
export function computeCourseStatus(course: Course): CourseStatus

// Compute adherence stats from raw records and active courses
export function computeAdherenceStats(
  courses: Course[],
  records: DoseRecord[]
): AdherenceStats
```

**Twice Daily rule:** A medication with `frequency: 'Twice Daily'` produces TWO dose slots per day. Slot A uses `medication.reminderTime`. Slot B is `reminderTime + 12 hours`, capped at 23:59. In the timeline, render both as separate `MedicationCard` instances. In the data model, represent the second slot by appending a synthetic suffix to the medicationId: `${medicationId}_slot2`. `DoseRecord` for slot 2 uses this synthetic ID. Notifications for both slots must be scheduled separately.

### `utils/dateHelpers.ts`
Thin wrappers around `date-fns`. Export: `todayString()`, `formatDisplayDate()`, `formatTime()`, `addDaysToDateString()`, `diffInDays()`.

---

## 6. Notification Service

```ts
// services/notificationService.ts — uses @notifee/react-native

export async function createNotificationChannel(): Promise<void>
// Channel id: 'medication-reminders', name: 'Medication Reminders', importance: HIGH
// Call this ONCE on app start in App.tsx, before any scheduling.

export async function scheduleMedicationReminder(medication: Medication, course: Course): Promise<void>
// For 'Twice Daily': schedule two notifications (reminderTime and reminderTime + 12h)
// Notification id format: `med_${medication.id}` and `med_${medication.id}_slot2`
// Title: "Time for your ${medication.name}"
// Body: "${medication.dosageStrength} · ${medication.formFactor}"
// Data payload: { medicationId: medication.id, courseId: course.id }
// Trigger: daily repeat at the specified time, stop scheduling past course.endDate

export async function cancelMedicationReminders(medicationId: string): Promise<void>
// Cancels both the primary and _slot2 notification for this medication id

export async function cancelCourseReminders(courseId: string): Promise<void>
// Iterates all medications in the course and calls cancelMedicationReminders for each

export async function rescheduleAllActiveReminders(courses: Course[]): Promise<void>
// Called on app start. Loops active courses and calls scheduleMedicationReminder for each medication.
// Safe to call multiple times — notifee deduplicates by notification id.
```

---

## 7. Navigation Architecture

```
RootNavigator (Native Stack, no header)
├── OnboardingScreen                   ← shown only when ONBOARDED !== "true"
└── AppNavigator (Bottom Tab Navigator)
    ├── Tab: Home → HomeScreen
    ├── Tab: Dashboard → DashboardScreen
    └── Tab: Settings → SettingsScreen

Modals (presented over AppNavigator via root stack, slide-up)
├── AddMedicationFlow (inner Native Stack)
│   ├── StepOneScreen
│   └── StepTwoScreen
└── CourseDetailScreen                 ← pushed from Dashboard tab
```

**Bottom Tab Bar style:**
- Background: white, slight shadow.
- Active icon + label: navy.
- Inactive icon + label: textMuted.
- Icons: Home → `Home`, Dashboard → `ChartBar`, Settings → `Settings` (lucide).
- Tab labels: "Home", "Dashboard", "Settings".

**FAB (Floating Action Button):**
- Position: absolute, bottom 24, centered horizontally (or standard right-aligned at right 24 — pick one and be consistent).
- Shape: pill/capsule, not a circle. Width ~80px, height ~48px. Navy background. `+` icon in white.
- Visible ONLY on Home and Dashboard tabs. Conditionally rendered, not opacity-hidden.
- Tapping FAB → navigate to `AddMedicationFlow` modal with `{ existingCourseId: undefined }`.

---

## 8. Screen Specifications

---

### 8.1 OnboardingScreen

**Trigger:** `ONBOARDED` key in MMKV is absent or not `"true"`.

**Visual:**
- Full-screen background color: `Colors.navy`.
- Centered layout with generous vertical padding.
- App icon: a white capsule SVG, ~80×40px.
- App name: "Pick-A-Pill" — Display, white.
- Tagline: "Your personal medication companion." — Body, white at 70% opacity.
- Vertical spacer.
- Card container (white, `borderRadius: 20`, padding 24): contains label "Your name" + text input with placeholder "e.g. John Doe".
- "Get Started" button: full-width, 56px height, mint background, navy text, `borderRadius: 14`. Placed below the card with 16px gap.

**Validation:** Name ≥ 2 chars. Red caption error text below the input on failure.

**On submit:**
1. Construct `UserProfile`: `{ name, notificationsEnabled: true, refillReminderDays: 3, language: 'English' }`.
2. Persist via `useProfileStore.setProfile()`.
3. Write `STORAGE_KEYS.ONBOARDED = "true"` to MMKV.
4. Request notification permission via `notifee.requestPermission()`.
5. Call `createNotificationChannel()`.
6. Replace navigation stack with `AppNavigator`.

---

### 8.2 HomeScreen

**Overall layout:** `ScrollView`, `backgroundColor: Colors.surface`, `paddingHorizontal: 20`.

**Section A — Header row** (`flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'`, `marginTop: 48`):
- Left block:
  - Line 1: "Good morning," in Body, textMuted (greeting prefix only)
  - Line 2: `${profile.name} 👋` in Display (28pt bold), textPrimary
  - Greeting prefix logic: `< 12` → "Good morning,", `< 17` → "Good afternoon,", else "Good evening,"
- Right: bell icon (lucide `Bell`, size 24, navy). Wrap in a `TouchableOpacity`. If any dose for today is `missed`, render an 8px coral filled circle absolutely positioned at top-right of the icon.

**Section B — Date Picker** (`marginTop: 20`):
- Horizontal `ScrollView` (no scroll indicator).
- 7 chips: today − 3 → today + 3.
- `DateChip` component: width 44, height 56, `borderRadius: 20`, centered content.
  - Row 1: weekday abbreviation — Caption, textMuted (unselected) / white (selected).
  - Row 2: day number — BodySemiBold, textPrimary (unselected) / white (selected).
  - Selected: `backgroundColor: Colors.navy`.
  - Unselected: `backgroundColor: Colors.chipInactive`.
- On chip tap: update selected date state. Re-render timeline below.
- Default selected: today.

**Section C — Today's Progress Card** (`marginTop: 20`, `borderRadius: 20`, `backgroundColor: Colors.navy`, `padding: 20`):

Only render this card when the selected date is today. Hide it for past/future date selections.

```
TODAY'S PROGRESS          [Donut: 2/5 doses]
40%
2 of 5 doses taken
[Don't forget your doses]
[──────── red progress bar ────────]
```

- "TODAY'S PROGRESS" — Label typography, `Colors.textOnNavy` at 70% opacity.
- Percentage — Stat typography (36pt bold), white.
- "X of Y doses taken" — Body, white at 80% opacity.
- "Don't forget your doses" — small pill-shaped button: semi-transparent white background, white text, `borderRadius: 20`, `paddingHorizontal: 16, paddingVertical: 6`. This is decorative (non-navigating) — it is a motivational nudge, not a CTA. Only show it when `todayTaken < todayTotal`.
- Progress bar: full width, height 4, `borderRadius: 2`. Track: semi-transparent white (30% opacity). Fill: `Colors.coral`. Fill width = `(taken / total) * 100%`.
- Donut chart (right side, ~80px):
  - Two arcs: filled (mint) = taken ratio, unfilled (white at 20% opacity) = remainder.
  - Center label: `${taken}/${total}` in BodySemiBold white, "doses" in Caption white.
  - Implement with `react-native-svg` Arc paths. Do not use a third-party chart library for this one component.

**Section D — Medication Timeline** (`marginTop: 24`):

Sections: Morning, Afternoon, Evening.

**SectionHeader row** (`flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12`):
- Left: emoji + section name in SectionTitle (e.g. "🌅 Morning")
- Right: "X/Y done" in Caption, textMuted

**MedicationCard** per dose slot:
- `backgroundColor` depends on display status:
  - `taken` → `Colors.takenBg`, left border 3px `Colors.takenBorder`
  - `missed` → `Colors.missedBg`, left border 3px `Colors.missedBorder`
  - `pending` → `Colors.pendingBg`, `borderColor: Colors.border, borderWidth: 1`
- Card `borderRadius: 14`, `padding: 14`, `marginBottom: 10`.
- Layout: `flexDirection: 'row', alignItems: 'center'`
  - Left: form factor icon (SVG icon: pill link / drop / syringe), size 32, in a 44px circle with light mint background.
  - Middle (flex: 1, `marginLeft: 12`):
    - Row 1: medication name in BodySemiBold. If status is `taken`, apply `textDecorationLine: 'line-through'` + `color: textMuted`.
    - Next to name (same row): status badge chip — "Taken" (mint bg, white text) or "Missed" (coral bg, white text). Hidden when `pending`.
    - Row 2: `${dosageStrength} · ${formFactor}` in Caption, textMuted. Clock icon + `${time}` in Caption, textMuted. Same row, separated by a `·`.
  - Right: status toggle circle, 28px. Tappable.
    - `taken`: mint filled circle with white checkmark.
    - `missed`: hollow circle, coral border (`borderWidth: 2`), no fill.
    - `pending`: hollow circle, light border.
    - On tap: cycle `pending → taken`, `taken → missed`, `missed → pending`. Call `markDose()`. Update immediately (optimistic UI).
- The ENTIRE card is tappable (not just the circle) for the status toggle.

**Empty section:** If no doses in a time bucket, render a muted row: "Nothing scheduled" in Caption, textMuted, `paddingVertical: 12`.

**Full empty state** (no active courses at all): Centered illustration placeholder + "No medications today" in Title, textMuted + "Add a course →" tappable text (mint color) that fires the FAB action.

---

### 8.3 DashboardScreen (Course History)

**Screen title:** "Course History" — Title typography, textPrimary. Subtitle: "Your medication adherence overview" — Body, textMuted. Both left-aligned, `marginTop: 48, paddingHorizontal: 20`.

**Section A — Stat Cards Row** (`flexDirection: 'row'`, equal width, `gap: 12`, `marginTop: 20, paddingHorizontal: 20`):

Three cards, each `flex: 1`, `backgroundColor: Colors.card`, `borderRadius: 12`, `padding: 16`:

| Icon | Value | Label |
|---|---|---|
| 🔥 (flame, coral) | `dayStreak` | "Day Streak" |
| 📈 (trend-up, mint) | `${avgAdherencePct}%` | "Avg. Adherence" |
| ⏱ (clock, navy) | `activeCourseCount` | "Active Courses" |

Value in SectionTitle (16pt bold), textPrimary. Label in Caption, textMuted.

**Section B — This Week's Streak** (`marginTop: 20, marginHorizontal: 20`):

White card, `borderRadius: 16, padding: 20`.

Header row: "This Week's Streak" in BodySemiBold left-aligned. Right: 🔥 flame icon + "`${dayStreak} days`" in a coral-background pill chip.

Weekday circles row (`flexDirection: 'row', justifyContent: 'space-between', marginTop: 16`):
- 7 circles (M T W T F S S), each 40px, `borderRadius: 20`.
- `full`: `backgroundColor: Colors.streakFilled`, white checkmark icon.
- `missed`: `backgroundColor: Colors.streakMissed`, `–` text in textMuted.
- `partial`: `backgroundColor: Colors.chartBarNavy`, white `~` text.
- `future`/today: `backgroundColor: 'transparent'`, `borderWidth: 2, borderColor: Colors.mint`, small dot in center (mint, 8px).
- Day label (M, T, W…) in Caption, textMuted, below each circle.

**Section C — 7-Day Adherence Chart** (`marginTop: 20, marginHorizontal: 20`):

White card, `borderRadius: 16, padding: 20`.

Header: "7-Day Adherence" in BodySemiBold.

Bar chart (`marginTop: 12`):
- 7 bars, one per day. Max height 120px.
- Bar width: `(containerWidth - padding - gaps) / 7`.
- Bar color by `adherencePct`:
  - 100% → `Colors.chartBarMint`
  - 50–99% → `Colors.chartBarNavy`
  - 1–49% → `Colors.chartBarAmber`
  - 0% → `Colors.progressBg`
- Y-axis labels on left: 0%, 25%, 50%, 75%, 100% in Caption, textMuted.
- X-axis labels below bars: day abbreviations in Caption, textMuted.
- Implement with `react-native-svg` Rect elements. No third-party chart library.

**Section D — Active Courses** (`marginTop: 20, paddingHorizontal: 20`):

Header row: "Active Courses" in SectionTitle left. "See all" in BodySemiBold, mint, right-aligned. Tapping "See all" → scrolls to or navigates to a full list (filter = Active).

List of `CourseCard` components, `marginTop: 12`.

**CourseCard:**
```
┌──────────────────────────────────────────────┐
│ 🔴 Amoxicillin      [Low]         4 days left│
│    500mg                                      │
│  ──────────────────────────── (progress bar) │
│  6 days completed · 10 day course            │
└──────────────────────────────────────────────┘
```
- Urgency dot (left): 8px circle. `High` → coral, `Medium` → amber, `Low` → mint.
- Medication names (if multiple): show first medication name as the course label. If course has >1 medication, append `+${n-1} more`.
- Urgency badge: pill chip next to name. `High` → coral bg/text, `Medium` → amber bg/text, `Low` → mint bg/text.
- "X days left" — right-aligned, BodySemiBold, textPrimary.
- Progress bar: full width, height 4, mint fill, `progressBg` track.
- Bottom line: "X days completed · Y day course" in Caption, textMuted.
- Tapping card → navigate to `CourseDetailScreen`.

**Empty state** (no courses): centered text "No courses yet. Tap + to begin."

**CourseDetailScreen** (modal pushed from Dashboard):
- Header: back button + course name.
- Date range: "Jan 15 – Jan 22, 2025" in Body, textMuted.
- Progress bar + "X of Y days completed" label.
- Section "Medications in this course":
  - Each medication: `MedicationDetailRow` — name, dosage, formFactor, frequency, reminderTime. Edit icon (pencil) on right.
  - Tapping edit icon → opens `AddMedicationFlow` in edit mode (`editMedicationId` param set).
- "Add Another Medication" button (outlined, navy, full width) → opens `AddMedicationFlow` with `existingCourseId` set.
- "Delete Course" button at bottom (coral text, no background). Tap → native `Alert.alert` confirmation → delete course + cancel all notifications.

---

### 8.4 AddMedicationFlow (Two-Step Modal)

Opened via root stack as a full-screen modal with slide-up animation. Screen background: `Colors.surface`.

**Shared modal header:**
- Back arrow (`←`) on left: goes to previous step or dismisses if on Step 1.
- Title: "Add Medication" — Title typography, textPrimary.
- Step indicator subtitle below title: "Step X of 2 — [Step Name]" in Caption, textMuted.
- Below the title block: a horizontal 2-segment progress bar. Segment 1 always mint. Segment 2 mint if on step 2, else `Colors.progressBg`. Total width = full screen width − 40px padding. Height 3px, `borderRadius: 2`. `marginTop: 12`.

---

#### StepOneScreen

Scrollable (`ScrollView`, `paddingHorizontal: 20`). All field labels use `Label` typography (uppercase, 11pt). Required fields get a red `*` after the label text.

**Field 1 — Course Name** *(hidden when `existingCourseId` is set)*
- Label: "COURSE NAME *"
- Input: white card, `borderRadius: 12`, height 52, placeholder "e.g. Antibiotic Run"

**Field 2 — Medication Name**
- Label: "MEDICATION NAME *"
- Input: placeholder "e.g., Amoxicillin"

**Field 3 — Dosage Strength**
- Label: "DOSAGE STRENGTH *"
- Input: placeholder "e.g., 500mg"

**Field 4 — Form Factor** (segmented chip group, `flexDirection: 'row', gap: 12, marginTop: 8`)
- Label: "FORM FACTOR"
- Three chips, equal width (`flex: 1`), height 64, `borderRadius: 12`.
- Each chip: icon on top (24px SVG), label below in BodySemiBold.
  - Pill: link/capsule icon
  - Liquid: droplet icon
  - Injection: syringe icon
- Selected: `backgroundColor: Colors.navy`, icon + text white.
- Unselected: `backgroundColor: Colors.card`, icon + text `Colors.textPrimary`.

**Field 5 — Frequency**
- Label: "FREQUENCY"
- Dropdown trigger: white card row, height 52. Shows current value right-aligned with a chevron.
- Options: Daily | Twice Daily | Alternate Days | Weekly | Monthly | Custom.
- On Android: use a `Modal` with a simple list picker (avoid native spinner). 
- If "Custom" selected: reveal inline text input below "Every ___ days" with numeric keyboard.

**Field 6 — Reminder Time**
- Label: "REMINDER TIME *"
- Tappable row (white card, height 52): shows clock icon + formatted time ("8:00 AM"). On tap: open `@react-native-community/datetimepicker` in time mode.

**Field 7 — Course Duration** *(hidden when `existingCourseId` is set)*
- Label: "COURSE DURATION"
- 4 chips in a row: "7 days" | "14 days" | "30 days" | "Custom". Same chip style as Form Factor but text-only (no icon), height 44.
- Default: "7 days".
- If "Custom" selected: reveal inline numeric input "Number of days".

**Validation on "Next →":**
- Medication Name: required, ≥ 1 char.
- Dosage Strength: required, ≥ 1 char.
- Reminder Time: required (always has a default so this should not fail).
- Course Name (if visible): required.
- Custom frequency/duration values: must be positive integers.
- Show red Caption error text directly below the failing field. Do not use alerts.

**"Next →" button:** Full width, 56px, `borderRadius: 14`, `backgroundColor: Colors.mint`, navy text, `marginTop: 24, marginBottom: 40`.

---

#### StepTwoScreen

**Header:** same structure as Step 1 but "Step 2 of 2 — Confirm". Both bar segments are mint.

**Summary block** (white card, `borderRadius: 16, padding: 20, marginTop: 20`):

Title: "Review your medication" — SectionTitle, textPrimary, `marginBottom: 16`.

Label → Value rows, each `height: 44, borderBottomWidth: 1, borderColor: Colors.border`:
```
Medication      Amoxicillin
Dosage          500mg
Form            Pill
Frequency       Daily
Reminder        8:00 AM
Duration        7 days
Course          Antibiotic Run
Start Date      Today (Jun 2, 2025)
End Date        Jun 8, 2025
```
- Label: Caption, textMuted, left-aligned.
- Value: BodySemiBold, textPrimary, right-aligned.
- Last row: no bottom border.

End date computed as `startDate + durationDays - 1`. "Start Date" always shows "Today (formatted date)".

**"← Edit Details" link:** textMuted, Caption, left-aligned, `marginTop: 16`. Navigates back to Step 1 without clearing form state.

**"Confirm & Save" button:** Full width, 56px, mint background, navy text.

On tap:
1. Construct `Medication` with `uuid`.
2. If new course: construct `Course` with `uuid`, `startDate = todayString()`, computed `endDate`. `medications: [medication]`.
3. If `existingCourseId` set: call `addMedicationToCourse(existingCourseId, medication)`.
4. If edit mode (`editMedicationId` set): call `updateMedicationInCourse(...)`.
5. Persist via store.
6. Call `scheduleMedicationReminder(medication, course)`.
7. Dismiss modal.
8. Do not force tab navigation — user returns to where they triggered the FAB.

---

### 8.5 SettingsScreen

**Screen title:** "Settings" — Title typography, `marginTop: 48, paddingHorizontal: 20`.

**Profile Card** (`marginTop: 20, marginHorizontal: 20`, `borderRadius: 16, backgroundColor: Colors.navy, padding: 20`):
```
[avatar emoji 👤]  Sarah Wilson        [Edit]
                   sarah.wilson@email.com
```
- Avatar: 48px circle, semi-transparent white bg, large emoji centered.
- Name: BodySemiBold, white.
- Email: Caption, white at 70% opacity. If no email stored: show "Tap Edit to add details".
- "Edit" button: small outlined pill (`borderWidth: 1, borderColor: white`, white text, `paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20`).
- Tapping Edit → navigate to a simple `EditProfileScreen` (new screen in root stack) with name + email inputs. On save: `updateProfile()` and go back.

**Settings List** (white card, `marginTop: 20, marginHorizontal: 20, borderRadius: 16`):

Each `SettingsRow`: height 56, `paddingHorizontal: 20`. `flexDirection: 'row', alignItems: 'center'`.
- Left: icon (20px, colored) + label (Body, textPrimary) with `gap: 12`.
- Right: value text (Body, textMuted) + chevron icon.
- Separated by a 1px `Colors.border` divider (not on last row).

| Icon | Color | Label | Default Value | Behavior |
|---|---|---|---|---|
| 🔔 Bell | amber | Notifications | On | Toggle switch (replaces value + chevron). On toggle: cancel or reschedule all reminders. |
| 💊 Pill | coral | Refill Reminders | 3 days before | Bottom sheet picker: 1, 2, 3, 5, 7 days. |
| ❤️ Heart | coral | Health Data Sync | Not connected | Show "Coming soon" toast. |
| 👤 Person | navy | Caregiver Access | Not linked | Show "Coming soon" toast. |
| 🌐 Globe | blue | Language | English | Show "Coming soon" toast. |

**Footer** (`marginTop: 32, marginBottom: 48`, centered):
- "Pick-A-Pill v2.4.1" in Caption, textMuted.
- "Privacy Policy" in Caption, mint (tappable → `Linking.openURL('https://example.com/privacy')`).

---

## 9. Component Library

All components require an explicit TypeScript `interface Props`. No `any`.

| Component | File | Key Props |
|---|---|---|
| `DateChip` | `components/DateChip.tsx` | `date: Date, isSelected: boolean, onPress: () => void` |
| `MedicationCard` | `components/MedicationCard.tsx` | `medication: Medication, slotTime: string, date: string, doseRecord?: DoseRecord, onToggle: (status: DoseStatus) => void` |
| `ProgressCard` | `components/ProgressCard.tsx` | `taken: number, total: number` |
| `DonutChart` | `components/DonutChart.tsx` | `taken: number, total: number, size: number` |
| `StatCard` | `components/StatCard.tsx` | `icon: string, value: string, label: string, iconColor: string` |
| `StreakRow` | `components/StreakRow.tsx` | `weekDays: WeekDay[], streakCount: number` |
| `AdherenceChart` | `components/AdherenceChart.tsx` | `weekDays: WeekDay[]` |
| `CourseCard` | `components/CourseCard.tsx` | `course: Course, status: CourseStatus, onPress: () => void` |
| `MedicationDetailRow` | `components/MedicationDetailRow.tsx` | `medication: Medication, onEdit: () => void` |
| `FormFactorSelector` | `components/FormFactorSelector.tsx` | `value: FormFactor, onChange: (v: FormFactor) => void` |
| `FrequencyPicker` | `components/FrequencyPicker.tsx` | `value: Frequency, customDays?: number, onChange: (v: Frequency, days?: number) => void` |
| `DurationSelector` | `components/DurationSelector.tsx` | `value: number, onChange: (days: number) => void` |
| `TimePickerField` | `components/TimePickerField.tsx` | `value: string, onChange: (hhmm: string) => void` |
| `SettingsRow` | `components/SettingsRow.tsx` | `icon: ReactNode, label: string, value?: string, onPress?: () => void, rightElement?: ReactNode, isLast?: boolean` |
| `StatusCircle` | `components/StatusCircle.tsx` | `status: DoseStatus, onToggle: () => void` |
| `FAB` | `components/FAB.tsx` | `onPress: () => void, visible: boolean` |
| `SectionHeader` | `components/SectionHeader.tsx` | `title: string, doneCount: number, totalCount: number` |
| `StepProgressBar` | `components/StepProgressBar.tsx` | `currentStep: number, totalSteps: number` |
| `UrgencyBadge` | `components/UrgencyBadge.tsx` | `level: UrgencyLevel` |
| `ProgressBar` | `components/ProgressBar.tsx` | `progress: number, height?: number` |

---

## 10. File Structure

```
src/
├── types/
│   └── index.ts
├── tokens/
│   └── colors.ts
├── storage/
│   ├── keys.ts
│   └── mmkvStorage.ts
├── stores/
│   ├── useProfileStore.ts
│   ├── useCourseStore.ts
│   └── useDoseStore.ts
├── utils/
│   ├── courseHelpers.ts
│   └── dateHelpers.ts
├── services/
│   └── notificationService.ts
├── components/
│   └── [all components listed in Section 9]
├── screens/
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── CourseDetailScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── EditProfileScreen.tsx
│   └── AddMedication/
│       ├── StepOneScreen.tsx
│       ├── StepTwoScreen.tsx
│       └── useAddMedicationForm.ts    ← shared form state hook
└── navigation/
    ├── RootNavigator.tsx
    ├── AppNavigator.tsx               ← Bottom tabs + FAB
    └── types.ts
```

---

## 11. Navigation Types

```ts
// navigation/types.ts

export type RootStackParamList = {
  Onboarding: undefined;
  App: undefined;
  AddMedicationFlow: {
    existingCourseId?: string;    // undefined = new course
    editMedicationId?: string;    // undefined = add new, defined = edit existing
  };
  CourseDetail: { courseId: string };
  EditProfile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Settings: undefined;
};
```

---

## 12. Execution Roadmap

Execute strictly in order. **Do not begin step N+1 until step N exits clean.**

### Step 0 — Project Scaffold
```bash
# react-native init is deprecated since RN 0.71+.
# TypeScript is now included in the default template — no --template flag needed.
npx @react-native-community/cli@latest init PickAPill

# Single line — required for Windows PowerShell (no backslash continuations)
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-mmkv zustand date-fns @notifee/react-native @react-native-community/datetimepicker react-native-uuid react-native-svg lucide-react-native
```
Configure `tsconfig.json`: `strict: true`, `baseUrl: './src'`, path alias `@/ → src/`.

✅ **Exit:** `npx tsc --noEmit` clean.

### Step 1 — Foundation Layer
Create: `types/index.ts`, `tokens/colors.ts`, `storage/keys.ts`, `storage/mmkvStorage.ts`.

✅ **Exit:** `npx tsc --noEmit` clean.

### Step 2 — Stores
Create all three Zustand stores with full MMKV persistence.

✅ **Exit:** `npx tsc --noEmit` clean.

### Step 3 — Utils + Notification Service
Implement `courseHelpers.ts` (all functions, all 6 frequency types), `dateHelpers.ts`, `notificationService.ts`.

✅ **Exit:** `npx tsc --noEmit` clean.

### Step 4 — Navigation Shell
Implement `navigation/types.ts`, `RootNavigator.tsx`, `AppNavigator.tsx`. All screens are placeholder `<View><Text>` stubs. FAB is rendered with conditional visibility logic but does nothing yet.

✅ **Exit:** App launches in Android emulator. Three tabs visible. FAB visible on Home/Dashboard, absent on Settings. TypeScript clean.

### Step 5 — Onboarding Screen
Full implementation. On submit: profile saved, notifications permission requested, redirects to app.

✅ **Exit:** Fresh install → onboarding. Submit name → main app. Relaunch → skips onboarding.

### Step 6 — Atomic Component Library
Build every component in Section 9 with hardcoded/prop-driven data. No store connections yet.

✅ **Exit:** `npx tsc --noEmit` clean. All components render correctly in a temporary test screen.

### Step 7 — Home Screen
Full implementation wired to stores. Date chip, progress card, medication timeline, status toggles, empty states.

✅ **Exit:** Timeline renders for today. Selecting a different date chip changes the view. Toggling a card status persists after app restart.

### Step 8 — AddMedicationFlow
Full two-step implementation wired to stores and notification service. Handles new course, add-to-existing, and edit-existing modes.

✅ **Exit:** FAB → form → confirm creates a course in MMKV, schedules a notification, medication appears on Home timeline.

### Step 9 — Dashboard Screen + CourseDetailScreen
Full implementation including stat cards, streak row, bar chart, course cards, detail screen with edit/delete.

✅ **Exit:** Stats compute correctly from real records. Progress bar and urgency badge match real data. Delete course removes it and cancels its notifications.

### Step 10 — Settings Screen + EditProfileScreen
Full implementation. Notification toggle functionally cancels/reschedules all reminders.

✅ **Exit:** Profile name and email editable and persist. Notification toggle works end-to-end.

### Step 11 — Polish Pass
- Consistent `paddingHorizontal: 20` on all screens.
- All tappable elements: `activeOpacity={0.75}` on `TouchableOpacity`, or `Pressable` with ripple.
- `KeyboardAvoidingView behavior="padding"` on every screen with inputs.
- `ScrollView` on StepOneScreen so form scrolls on small devices.
- Verify all empty states render.
- Remove all test/placeholder screens.

✅ **Exit:** Zero Metro layout warnings. Zero TypeScript errors. All empty states verified.

---

## 13. All Design Decisions Documented

| Question | Decision |
|---|---|
| Course vs Medication model | Course = treatment period (start/end date, name). Medication = individual drug inside a course. One course holds one or more medications. |
| Course Name | User types a course name in Step 1 (e.g. "Antibiotic Run"). Required field for new courses. |
| Tapping a medication card | Inline status toggle — cycles pending → taken → missed. No navigation. |
| Twice Daily slots | Two separate timeline cards: one at `reminderTime`, second at `reminderTime + 12h`. Separate DoseRecord per slot using `_slot2` suffix on medicationId. |
| Auto-missed display logic | Computed at render time only. If a pending dose's time + 30min has passed on today's date, display as missed. Never writes a DoseRecord. Only a user tap writes a record. |
| Dashboard screen name | "Course History" (matches Figma) |
| Dashboard stat cards | Day Streak, Avg. Adherence, Active Courses — computed from DoseRecord[], not stored. |
| Dashboard bar chart | Implemented with react-native-svg Rect elements. No third-party chart library. |
| Donut chart on Home | Implemented with react-native-svg Arc paths. No third-party chart library. |
| Settings: Health Data Sync | Stub row. Tapping shows "Coming soon" toast. |
| Settings: Caregiver Access | Stub row. Tapping shows "Coming soon" toast. |
| Add Medication steps | 2 steps (not 3). Step 1: form input. Step 2: summary + confirm. |
| Step indicator style | Horizontal segmented progress bar (3px height, 2 segments) matching Figma style, not plain text. |
| Form field labels | Uppercase, 11pt, 0.8 letter-spacing (Label typography). Required fields get a red asterisk. |
| Form background | `Colors.surface = '#EEEEF4'` — cooler, slightly purple-grey, matches Figma. |
| Form factor chips | Icon (SVG) on top + label below, equal width, 64px tall. |
| Notification library | `@notifee/react-native` — handles Android channels, daily repeat triggers, cancellation by notification id. |
| FAB shape | Pill/capsule, not a circle. Navy bg, white `+`. |
| Adding medication to existing course | Via "Add Another Medication" button in CourseDetailScreen. Opens AddMedicationFlow with `existingCourseId` set — hides Course Name and Duration fields. |
| Empty states | Defined per screen. All screens must handle 0-data state. |
| No expo packages | Bare React Native only. No `expo-*` imports anywhere. |

---

## 14. Critical Rules for Cursor Agent

1. **Never use `any`.** Unknown types use `unknown`, then narrow.
2. **Run `npx tsc --noEmit` after every step.** Do not proceed until it passes.
3. **Never hardcode colors.** Import from `tokens/colors.ts`.
4. **Stores are the only MMKV interface.** No direct MMKV calls in screens or components.
5. **`isDoseScheduledOnDate` must fully implement all 6 frequency types.** No stubs.
6. **FAB uses conditional rendering**, not `opacity: 0` or `display: none`.
7. **`KeyboardAvoidingView behavior="padding"`** on every screen with text inputs.
8. **Notification channel created on app start** in `App.tsx`, before any screen renders.
9. **No `expo-*` packages.** This is a bare React Native project.
10. **`react-native-uuid`** for all IDs. Never `Math.random()`.
11. **Charts use `react-native-svg` directly.** No charting libraries.
12. **`computeDisplayStatus` is pure and read-only.** It never writes to any store.
13. **`CourseStatus` fields (`isActive`, `isCompleted`, `urgency`) are always computed at call time**, never stored on the `Course` object.
14. **`useAddMedicationForm.ts`** is a single shared hook that holds all form state for Steps 1 and 2. Never split form state across two separate component-level `useState` chains — state must survive the step transition.