# ZERO TILT — Core Behavioral Logic

> Version 1.0 | March 2026

## 1. Overview

This document explains how the core MVP habit loop works: streaks, relapse resets, daily pledges, urge logging, panic intervention, milestone unlocking, and journal autosave. All logic lives in the `mobile-app/services/` and `mobile-app/hooks/` directories.

## 2. Streak Engine

**Files**: `services/streakEngine.ts`, `hooks/useStreak.ts`

### How It Works

The streak tracks consecutive tilt-free days. It relies on two Supabase RPC functions (`get_current_streak` and `reset_streak`) plus client-side check-in logic.

### Daily Check-In

When a user opens the dashboard or signs a daily pledge, the app calls `checkInToday()`:

1. Fetch the user's timezone from their profile (default: `America/New_York`).
2. Calculate "today" and "yesterday" boundaries in that timezone.
3. Read the current streak record from the `streaks` table.
4. If `last_checkin` is already today → no-op (already checked in).
5. If `last_checkin` was yesterday → increment `current_days` by 1, set `last_checkin` to now.
6. If `last_checkin` was more than one day ago → the streak was broken silently. Reset `current_days` to 1, set `start_date` to today.
7. If no streak record exists → create one with `current_days = 1`.
8. After any increment, compare `current_days` against `best_streak` and update if higher.

### Timezone Awareness

All date comparisons use the user's profile timezone. The `getTimezoneOffsetDate()` helper converts UTC timestamps to local dates before comparing. This prevents issues where a check-in at 11 PM EST would register as the next day in UTC.

### Assumptions

- One streak record per user (upsert on `user_id`).
- The database RPC `get_current_streak` returns `current_days`, `best_streak`, `start_date`, and `last_checkin`.
- Silent streak breaks (missed days without explicit relapse) reset the counter to 1 on next check-in rather than to 0.

## 3. Relapse Logic

**Files**: `services/relapseService.ts`, `hooks/useStreak.ts`

### How It Works

A relapse is an explicit user action — they press "Reset Streak" and confirm through a modal dialog. This is intentionally friction-heavy to prevent accidental resets.

### Flow

1. User taps "I relapsed" on the dashboard.
2. A confirmation modal appears with severity options (`mild`, `moderate`, `severe`), trigger category, and optional notes.
3. On confirm, the app calls `logRelapse()`:
   - Checks for same-day guard: if a relapse was already logged today, it returns the existing one (prevents duplicate resets).
   - Calls the Supabase RPC `reset_streak(user_id, trigger_category, emotional_state, notes, severity)`.
   - The RPC atomically: (a) creates a `relapse_events` record with the streak value before reset, (b) sets `current_days = 0` on the streak, (c) sets `is_active = false`.
   - Returns `{ relapse_id, previous_streak, message }`.
4. The app fires a `streak_reset` analytics event with the previous streak length and trigger.
5. An encouragement screen appears with the message from the RPC response.

### Same-Day Guard

If the user already relapsed today (checked via `relapse_events` WHERE `created_at >= today`), `logRelapse()` returns the existing relapse record rather than creating a duplicate. The streak is already at 0, so no further damage is done.

### Assumptions

- Relapses are always user-initiated (never automatic).
- The `reset_streak` RPC handles all database mutations atomically.
- `severity` is one of: `mild`, `moderate`, `severe`.
- Relapse stats (`getRelapseStats`) aggregate from the `relapse_events` table.

## 4. Daily Pledge System

**Files**: `services/pledges.ts`, `hooks/useDailyPledge.ts`

### How It Works

Users sign a daily pledge before trading. One pledge per user per day, enforced by a UNIQUE constraint on `(user_id, pledge_date)`.

### Flow

1. Dashboard checks `hasPledgedToday` on mount.
2. If not pledged, a prominent "Sign Your Pledge" card appears.
3. User taps it → navigates to `daily-pledge.tsx`.
4. User signs (enters their name as a digital signature) → calls `signPledge()`.
5. On success:
   - The pledge is saved with `pledge_date = today` (date only, no time).
   - `checkInToday()` is called to increment/maintain the streak.
   - `checkMilestones()` is called to evaluate pledge-related milestones.
   - A `pledge_signed` analytics event fires.
6. If already pledged today (409 conflict from UNIQUE constraint), the hook treats it as success.

### Assumptions

- Pledge date is a DATE (not TIMESTAMP) — one per calendar day in the user's local timezone.
- The pledge text comes from a predefined set or user customization (post-MVP).
- `signature_data` stores the user's typed name as confirmation.

## 5. Urge Logging

**Files**: `services/urges.ts`, `hooks/useUrges.ts`, `app/urge-log.tsx`

### How It Works

Users log tilt urges when they feel the impulse to make an emotional trade. Each urge captures intensity, triggers, coping strategies used, and outcome.

### Data Model

- `intensity`: 1–10 integer (slider input).
- `trigger_type`: one of the predefined trigger categories (FOMO, revenge, boredom, etc.).
- `coping_strategies`: array of strings (what the user did to cope).
- `outcome`: enum — `resisted`, `gave_in`, `distracted`, `used_panic`.
- `duration_seconds`: optional, auto-calculated if the user used the panic button.

### Flow

1. User opens urge-log screen (from dashboard quick action or tab).
2. Fills in intensity, trigger, strategies, and outcome.
3. On save:
   - `logUrge()` inserts into `urge_logs`.
   - A `urge_logged` analytics event fires with intensity, trigger type, and outcome.
   - `checkMilestones()` evaluates urge-related milestones (e.g., "Resist 10 urges").
4. Today's urges and 30-day history are available via `getTodaysUrges()` and `getUrgeHistory()`.
5. `getUrgeStats()` computes aggregates: total urges, resistance rate, average intensity, most common trigger.

### Assumptions

- No limit on urges per day (each one is independently logged).
- The `word_count` field on journal entries is auto-computed by a database trigger; urge logs do not have word counts.

## 6. Panic Intervention System

**Files**: `services/panicService.ts`, `hooks/usePanic.ts`, `app/(tabs)/panic.tsx`

### How It Works

The panic button launches a guided 4-7-8 breathing exercise: inhale for 4 seconds, hold for 7, exhale for 8. This is a clinically validated technique for rapid anxiety reduction.

### Breathing Flow

1. User taps the panic button (tab or dashboard shortcut).
2. Before starting, they rate their current calm level (1-10 slider).
3. The breathing animation begins:
   - `currentPhase` cycles through: `inhale` (4s) → `hold` (7s) → `exhale` (8s).
   - `cycleCount` tracks completed cycles.
   - A `useEffect` with `setInterval` drives the phase transitions.
   - The animated circle on screen expands during inhale, holds, and contracts during exhale.
4. User can stop at any time (partial session) or complete the recommended cycles.
5. On completion:
   - They rate their calm level again (after).
   - `completePanicSession()` logs the session to `breathing_sessions` with duration, cycles, calm_before, and calm_after.
   - A `breathing_completed` analytics event fires.
6. Post-breathing, the user is asked "Would you like to log an urge?" — if yes, `logPanicUrge()` creates a `urge_logs` entry with `outcome = 'used_panic'` and links the breathing session duration.

### Assumptions

- The default pattern is 4-7-8 (configurable via `constants/config.ts` → `BREATHING_PATTERN`).
- Calm ratings are integers 1-10 (1 = very anxious, 10 = very calm).
- Abandoned sessions (user stops early) are logged with `completed = false`.
- The breathing timer is client-side only (no server involvement until completion).

## 7. Milestone Tracking

**Files**: `services/milestoneEngine.ts`, `hooks/useMilestones.ts`

### How It Works

ZERO TILT has 28 milestones across 8 categories, each with a JSONB `requirement` field that defines unlock criteria. The milestone engine evaluates these requirements against the user's actual stats.

### Requirement Format

Each milestone's `requirement` column contains:

```json
{ "type": "streak_days", "target": 7 }
```

Supported requirement types:

| Type | What it checks | Source |
|------|---------------|--------|
| `streak_days` | Current streak length | `streaks.current_days` |
| `total_urges_resisted` | Urges with `outcome = 'resisted'` | COUNT from `urge_logs` |
| `journal_entries` | Total journal entries | COUNT from `journal_entries` |
| `breathing_sessions` | Completed breathing sessions | COUNT from `breathing_sessions` WHERE `completed = true` |
| `pledges_signed` | Total pledges signed | COUNT from `daily_pledges` |
| `goals_completed` | Goal check-ins completed | COUNT from `goal_checkins` WHERE `completed = true` |
| `relapse_recovery` | Relapses recovered from | COUNT from `relapse_events` |
| `urge_intensity_resisted` | Resisted an urge at or above a given intensity | MAX intensity from `urge_logs` WHERE `outcome = 'resisted'` |

### Evaluation Flow

`checkAndUnlockMilestones(userId)`:

1. Fetch all milestones and the user's existing `milestone_unlocks`.
2. Filter to milestones not yet unlocked (progress < 100).
3. For each pending milestone:
   - Parse the `requirement` JSONB.
   - Query the appropriate table/aggregate to get the user's current value.
   - Calculate `progress = min(100, (currentValue / target) * 100)`.
   - Upsert into `milestone_unlocks` with the new progress.
   - If progress reaches 100, set `unlocked_at = now()`.
4. Return any newly unlocked milestones.

### Milestone Tiers

Milestones have 5 tiers (stored as `milestone_tier` enum):

| Tier | Visual | Typical Target |
|------|--------|---------------|
| `bronze` | Bronze orb | Beginner (e.g., 3-day streak) |
| `silver` | Silver orb | Intermediate (e.g., 7-day streak) |
| `gold` | Gold orb | Advanced (e.g., 30-day streak) |
| `platinum` | Platinum orb | Expert (e.g., 90-day streak) |
| `diamond` | Diamond orb | Master (e.g., 365-day streak) |

### When Milestones Are Checked

Milestone evaluation triggers after these actions:

- Daily check-in (streak milestones)
- Urge logged (urge milestones)
- Journal entry saved (journal milestones)
- Breathing session completed (breathing milestones)
- Pledge signed (pledge milestones)
- Goal check-in toggled (goal milestones)
- Relapse logged (recovery milestones)

### Celebration

When `checkAndUnlockMilestones()` returns newly unlocked milestones, the `useMilestones` hook sets `newlyUnlocked` state. The dashboard renders a celebration modal with confetti showing the milestone name, tier, and points earned. The user dismisses it via `clearNewlyUnlocked()`.

## 8. Journal Autosave

**Files**: `services/journalDraft.ts`, `hooks/useJournal.ts`, `app/journal-entry.tsx`

### How It Works

Journal entries autosave locally using MMKV (fast key-value storage) so users don't lose work if the app crashes or they navigate away.

### Draft System

- **Key format**: `journal_draft_{userId}` (one draft per user at a time).
- **Saved fields**: title, content, mood, tags, and a timestamp.
- **Auto-save trigger**: Every time the user modifies the title or content fields (debounced).
- **Draft recovery**: When opening `journal-entry.tsx`, the hook checks for an existing draft via `getDraft(userId)`. If found, the form is pre-populated.
- **Draft clearing**: On successful save to Supabase, `clearDraft(userId)` removes the local draft.
- **`hasDraft(userId)`**: Returns a boolean for showing a "Resume draft" indicator on the journal tab.

### Assumptions

- Only one draft at a time per user (new draft overwrites the previous one).
- Drafts are local-only — they do not sync to Supabase.
- MMKV is synchronous, so draft operations are non-blocking and instant.
- Draft data includes a timestamp so stale drafts (>7 days) can optionally be discarded.

## 9. Analytics Event Firing

All core actions fire PostHog analytics events via the `useAnalytics` hook. Key events from the core loop:

| Action | Event Name | Key Properties |
|--------|-----------|---------------|
| Streak check-in | `streak_checkin` | `current_days`, `is_new_streak` |
| Streak reset (relapse) | `streak_reset` | `previous_streak`, `trigger_category`, `severity` |
| Pledge signed | `pledge_signed` | `streak_day`, `is_first_pledge` |
| Urge logged | `urge_logged` | `intensity`, `trigger_type`, `outcome`, `coping_strategies` |
| Breathing started | `breathing_started` | `calm_before`, `context` |
| Breathing completed | `breathing_completed` | `duration_seconds`, `cycles`, `calm_before`, `calm_after` |
| Journal saved | `journal_entry_saved` | `word_count`, `mood`, `has_tags`, `is_edit` |
| Milestone unlocked | `milestone_unlocked` | `milestone_name`, `tier`, `category`, `points` |

See `docs/analytics-events.md` for the full 70+ event catalog.

## 10. Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                    SCREENS                       │
│  dashboard.tsx  │  panic.tsx  │  urge-log.tsx    │
│  journal-entry  │  progress   │  daily-pledge    │
└────────┬────────┴──────┬──────┴────────┬─────────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│                     HOOKS                        │
│  useStreak  │  usePanic  │  useUrges            │
│  useDailyPledge  │  useJournal  │  useMilestones│
│  useAnalytics  │  useAuth                       │
└────────┬────────┴──────┬──────┴────────┬─────────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│                   SERVICES                       │
│  streakEngine  │  relapseService  │  panicService│
│  milestoneEngine  │  journalDraft  │  pledges    │
│  urges  │  journal  │  breathing  │  analytics   │
└────────┬────────┴──────┬──────┴────────┬─────────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL)                │
│  streaks │ relapse_events │ daily_pledges        │
│  urge_logs │ journal_entries │ breathing_sessions │
│  milestones │ milestone_unlocks │ profiles        │
│                                                   │
│  RPC: get_current_streak, reset_streak,           │
│       get_best_streak, calculate_milestone_progress│
└───────────────────────────────────────────────────┘
```

## 11. File Reference

### New Services (Phase 4)

| File | Purpose |
|------|---------|
| `services/streakEngine.ts` | Timezone-aware check-in, streak increment, silent break detection |
| `services/relapseService.ts` | Explicit relapse logging with same-day guard, history, stats |
| `services/milestoneEngine.ts` | JSONB requirement evaluation, progress calculation, batch unlock |
| `services/panicService.ts` | Breathing session lifecycle (start → complete/abandon), post-panic urge log |
| `services/journalDraft.ts` | MMKV-based local draft persistence for journal entries |

### New Hooks (Phase 4)

| File | Purpose |
|------|---------|
| `hooks/usePanic.ts` | Breathing timer state machine, phase transitions, calm rating collection |
| `hooks/useDailyPledge.ts` | Today's pledge state, sign action with streak + milestone side effects |

### Enhanced Hooks (Phase 4)

| File | Changes |
|------|---------|
| `hooks/useStreak.ts` | Added `checkIn()`, `logRelapse()`, `isCheckedInToday`, `relapseHistory` |
| `hooks/useJournal.ts` | Added draft support, milestone checking after save |
| `hooks/useUrges.ts` | Added `todaysUrges`, analytics event firing, milestone checking |
| `hooks/useMilestones.ts` | Added `checkMilestones()`, `newlyUnlocked`, `clearNewlyUnlocked()` |

### Updated Screens (Phase 4)

| File | Changes |
|------|---------|
| `app/(tabs)/dashboard.tsx` | Auto check-in, pledge integration, milestone celebration modal |
| `app/(tabs)/panic.tsx` | Full breathing flow with calm sliders, post-breathing urge log |
| `app/urge-log.tsx` | Custom intensity input (replaced slider), analytics + milestones |
| `app/journal-entry.tsx` | Autosave via journalDraft, draft recovery on mount |
| `app/(tabs)/progress.tsx` | Real milestone data, relapse history display |
| `app/(tabs)/settings.tsx` | Fixed Edit Profile navigation bug |
