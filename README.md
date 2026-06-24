<h1 align="center">
  <br />
  💊 Pick-A-Pill
  <br />
</h1>

<p align="center">
  <strong>A local-first medication tracking app for Android — built with React Native & TypeScript.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-5.0-FF6B35" />
  <img src="https://img.shields.io/badge/storage-MMKV-orange" />
  <img src="https://img.shields.io/badge/zero%20cloud-local%20first-1B2D5B" />
</p>

---

## Overview

Pick-A-Pill helps users track medication adherence across treatment courses. Every piece of data lives on-device — no accounts, no backend, no network calls. The app is built as a bare React Native project (no Expo) targeting **Android 12+ (API 31+)**.

---

## Features

- **Course-based tracking** — Group medications under named treatment courses with start/end dates and urgency indicators
- **Daily timeline** — Date-chip navigator showing morning / afternoon / evening dose slots with inline tap-to-toggle status
- **Flexible frequencies** — Daily, Twice Daily, Alternate Days, Weekly (per-weekday), Monthly, and Custom intervals
- **Adherence analytics** — 7-day bar chart, streak row, and computed stats (day streak, average adherence %, active course count) — all derived from raw records, nothing pre-aggregated in storage
- **Local notifications** — Scheduled reminders via `@notifee/react-native` with per-frequency scheduling logic and clean cancellation
- **Three-step add flow** — Accordion-style multi-medication entry with a review/confirm step before committing to storage
- **Onboarding** — First-launch name capture, notification permission request, and channel setup
- **Settings** — Editable profile, notification toggle (cancels/reschedules all reminders live), refill reminder lead time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.85 (bare, no Expo) |
| Language | TypeScript 5.8 (strict mode) |
| Navigation | React Navigation v7 — Native Stack + Bottom Tabs |
| State | Zustand v5 |
| Persistence | `react-native-mmkv` (JSI-backed, zero async overhead) |
| Notifications | `@notifee/react-native` — Android channels, daily/weekly triggers |
| Charts | `react-native-svg` — custom donut and bar chart components, no chart library |
| Icons | `lucide-react-native` |
| Date math | `date-fns` v4 |
| IDs | `react-native-uuid` v4 |

---

## Architecture

```
src/
├── types/           # Shared TypeScript interfaces (Course, Medication, DoseRecord, ...)
├── tokens/          # Design tokens — colors, elevation shadows
├── storage/         # MMKV keys + storage singleton
├── stores/          # Zustand stores (useProfileStore, useCourseStore, useDoseStore)
├── utils/           # Pure helper functions (courseHelpers, dateHelpers)
├── services/        # notificationService — schedule, cancel, reschedule
├── components/      # Reusable UI components
├── screens/
│   ├── HomeScreen           # Active course list (CourseCard)
│   ├── DashboardScreen      # Daily medication timeline
│   ├── HistoryScreen        # Analytics — streak, adherence chart, stat cards
│   ├── SettingsScreen       # Profile + app preferences
│   └── AddMedication/       # 3-step modal flow (StepOne → StepTwo → StepThree)
└── navigation/      # RootNavigator (stack) + AppNavigator (bottom tabs)
```

**Key design decisions:**

- `CourseStatus` fields (`isActive`, `isCompleted`, `urgency`) are **always computed at read time** — never stored, so data stays consistent without any sync logic.
- `computeDisplayStatus` is **pure and read-only** — a stored `DoseRecord` always wins; auto-missed inference is display-only and never written back.
- Stores are the **only MMKV interface** — no screen or component calls MMKV directly.
- Twice Daily doses produce **two independent `DoseRecord` entries** using a `_slot2` ID suffix, keeping the data model flat.

---

## Data Model

```
Course ──── has many ──── Medication
  │                            │
  └── id, name,                └── id, name, dosageStrength,
      startDate,                   formFactor, frequency,
      durationDays,                reminderTime, selectedWeekdays, ...
      endDate

DoseRecord  (one per dose slot per day)
  └── courseId, medicationId, date, status (taken | missed | pending)
```

---

## Getting Started

### Prerequisites

- Node ≥ 22.11
- JDK 17
- Android SDK (API 31+) with an emulator or physical device

### Install

```bash
git clone https://github.com/Shashank1219/PickAPill.git
cd PickAPill
npm install
```

### Run

```bash
# Start Metro bundler
npm start

# In a second terminal
npm run android
```

> Make sure an Android emulator is running or a device is connected via ADB before running the second command.

---

## Project Highlights for Recruiters

| What | Why it matters |
|---|---|
| **Zero cloud, fully offline** | Architecture decision — no auth, no network layer, no backend dependency. The app works on a plane. |
| **Computed-not-stored derived state** | Course urgency, dose statuses, adherence stats are all derived at render time from raw records — no stale cache issues. |
| **Custom SVG charts** | Donut chart and 7-day bar chart implemented directly with `react-native-svg` — no chart library, full control over rendering. |
| **Strict TypeScript** | `strict: true`, no `any` anywhere in the codebase. |
| **Multi-frequency notification scheduling** | Per-weekday weekly reminders, Twice Daily dual-slot scheduling, and clean cancellation by notification ID. |
| **Accordion multi-medication entry** | Step 2 of the add-medication flow supports an arbitrary number of medications in a single form session with collapse/expand and inline validation. |

---
