# ZERO TILT — API Specification

> Version 1.0 | March 2026

## 1. Overview

ZERO TILT uses two API layers:

1. **Supabase PostgREST** — Auto-generated REST API for all database tables. The client uses `@supabase/supabase-js` which provides a typed query builder. No custom endpoints needed for CRUD operations.
2. **Supabase Edge Functions** — Custom HTTPS endpoints for server-side logic that requires secrets or complex processing.

All requests require a valid JWT from Supabase Auth (passed as `Authorization: Bearer <token>`), except public endpoints noted below.

**Base URLs**:
- PostgREST: `https://<project>.supabase.co/rest/v1/`
- Edge Functions: `https://<project>.supabase.co/functions/v1/`

## 2. Authentication Endpoints

These are provided by Supabase Auth and called via the `@supabase/supabase-js` SDK.

### POST /auth/v1/signup

Create a new account.

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'trader@example.com',
  password: 'securepassword',
  options: {
    data: { full_name: 'Pedro Rubio' }
  }
});
```

**Response (success)**:
```json
{
  "user": { "id": "uuid", "email": "trader@example.com" },
  "session": { "access_token": "jwt...", "refresh_token": "..." }
}
```

**Errors**: `422` — email already registered, weak password.

### POST /auth/v1/token?grant_type=password

Sign in with email/password.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'trader@example.com',
  password: 'securepassword'
});
```

### POST /auth/v1/token?grant_type=refresh_token

Automatic token refresh (handled by SDK).

### POST /auth/v1/logout

Sign out and invalidate session.

```typescript
await supabase.auth.signOut();
```

### OAuth (Google, Apple)

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'apple'
  options: { redirectTo: 'zerotilt://auth/callback' }
});
```

## 3. Database API (PostgREST)

All table endpoints follow the same pattern via the Supabase client. RLS policies automatically scope data to the authenticated user.

### 3.1 Profile

**Read own profile**:
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Update profile** (onboarding completion, settings changes):
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    trader_name: 'ZeroTiltTrader',
    trading_style: ['Day Trader', 'Scalper'],
    markets: ['Futures', 'Options'],
    onboarding_completed: true,
    quiz_responses: { q1: 'a', q2: 'c', q3: 'b' },
    tilt_risk_level: 'high'
  })
  .eq('id', user.id);
```

### 3.2 Streaks

**Get current streak**:
```typescript
const { data } = await supabase.rpc('get_current_streak', {
  p_user_id: user.id
});
// Returns: integer (number of days)
```

**Reset streak (relapse)**:
```typescript
const { error } = await supabase.rpc('reset_streak', {
  p_user_id: user.id,
  p_reason: 'relapse'
});
```

**Get streak history**:
```typescript
const { data } = await supabase
  .from('streaks')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### 3.3 Journal Entries

**Create entry**:
```typescript
const { data, error } = await supabase
  .from('journal_entries')
  .insert({
    user_id: user.id,
    title: 'Pre-market thoughts',
    content: 'Feeling calm today. Reviewed my plan.',
    mood: 'good',
    mood_emoji: '😊',
    tags: ['Pre-Trade']
  })
  .select()
  .single();
```

**List entries** (paginated):
```typescript
const { data, count } = await supabase
  .from('journal_entries')
  .select('id, title, mood, mood_emoji, tags, created_at', { count: 'exact' })
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(0, 19); // page 1, 20 per page
```

**Update entry**:
```typescript
const { error } = await supabase
  .from('journal_entries')
  .update({ content: 'Updated content', mood: 'great' })
  .eq('id', entryId);
```

**Delete entry**:
```typescript
const { error } = await supabase
  .from('journal_entries')
  .delete()
  .eq('id', entryId);
```

### 3.4 Urge Logs

**Log an urge**:
```typescript
const { data, error } = await supabase
  .from('urge_logs')
  .insert({
    user_id: user.id,
    intensity: 4,
    trigger: 'Saw a big move I missed',
    location: 'At my desk',
    is_alone: true,
    response: ['Breathing exercise', 'Walked away'],
    resisted: true,
    breathing_completed: true,
    notes: 'FOMO hit hard but I resisted'
  })
  .select()
  .single();
```

**Get urge history** (last 30 days):
```typescript
const { data } = await supabase
  .from('urge_logs')
  .select('*')
  .eq('user_id', user.id)
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order('created_at', { ascending: false });
```

### 3.5 Goals + Check-ins

**Get active goals with today's status**:
```typescript
const { data: goals } = await supabase
  .from('goals')
  .select(`
    id, title, is_custom,
    goal_checkins!inner(checked_date, completed)
  `)
  .eq('user_id', user.id)
  .eq('is_active', true)
  .eq('goal_checkins.checked_date', today);
```

**Toggle goal check-in**:
```typescript
// Check in
const { error } = await supabase
  .from('goal_checkins')
  .upsert({
    goal_id: goalId,
    user_id: user.id,
    checked_date: today,
    completed: true
  }, { onConflict: 'goal_id,checked_date' });

// Uncheck
const { error } = await supabase
  .from('goal_checkins')
  .delete()
  .eq('goal_id', goalId)
  .eq('checked_date', today);
```

**Create custom goal**:
```typescript
const { data, error } = await supabase
  .from('goals')
  .insert({
    user_id: user.id,
    title: 'Review trade plan before every session',
    is_custom: true
  })
  .select()
  .single();
```

### 3.6 Daily Pledges

**Sign today's pledge**:
```typescript
const { error } = await supabase
  .from('daily_pledges')
  .upsert({
    user_id: user.id,
    pledge_text: 'I commit to following my trading plan today.',
    signed_name: 'Pedro Rubio',
    pledge_date: today
  }, { onConflict: 'user_id,pledge_date' });
```

**Check if pledged today**:
```typescript
const { data } = await supabase
  .from('daily_pledges')
  .select('id')
  .eq('user_id', user.id)
  .eq('pledge_date', today)
  .single();

const pledgedToday = !!data;
```

### 3.7 Community Posts

**Get feed** (with author info):
```typescript
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    profiles!user_id(trader_name, avatar_url)
  `)
  .eq('category', 'wins')
  .order('created_at', { ascending: false })
  .range(0, 19);
```

**Create post**:
```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: user.id,
    title: '30 days tilt-free!',
    content: 'Just hit my 30 day milestone...',
    category: 'wins'
  })
  .select()
  .single();
```

**Like/unlike a post**:
```typescript
// Like
const { error } = await supabase
  .from('post_likes')
  .insert({ post_id: postId, user_id: user.id });

// Unlike
const { error } = await supabase
  .from('post_likes')
  .delete()
  .eq('post_id', postId)
  .eq('user_id', user.id);
```

**Note**: `likes_count` on the posts table is updated via a database trigger (to be added in migration 002).

### 3.8 Breathing Sessions

```typescript
const { error } = await supabase
  .from('breathing_sessions')
  .insert({
    user_id: user.id,
    duration_seconds: 120,
    cycles_completed: 5,
    context: 'panic'
  });
```

### 3.9 Game Sessions

```typescript
const { error } = await supabase
  .from('game_sessions')
  .insert({
    user_id: user.id,
    game_type: 'memory',
    score: 850,
    duration_seconds: 45
  });
```

### 3.10 User Stats

**Get all stats** (for dashboard/sharing):
```typescript
const { data } = await supabase.rpc('get_user_stats', {
  p_user_id: user.id
});
// Returns JSON: { current_streak, best_streak, total_relapses,
//                 urges_resisted, total_urges, journal_entries,
//                 breathing_sessions, badges_earned }
```

## 4. Edge Function Endpoints

### 4.1 POST /functions/v1/coach-message

Proxies user messages to Claude API with context.

**Request**:
```json
{
  "message": "I feel like revenge trading after that loss",
  "conversation_id": "uuid-or-null"
}
```

**Response** (streamed):
```json
{
  "reply": "I hear you. That feeling after a loss is one of the most dangerous moments for a trader...",
  "conversation_id": "uuid"
}
```

**Auth**: Required (JWT). Edge function reads user profile, streak, and recent journal to build context.

**Rate limit**: 20 messages per hour per user (enforced server-side).

**Error responses**:
| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ "error": "Unauthorized" }` | Missing/invalid JWT |
| 429 | `{ "error": "Rate limit exceeded" }` | Too many messages |
| 500 | `{ "error": "Coach unavailable" }` | Claude API error |
| 503 | `{ "error": "Service temporarily unavailable" }` | Timeout |

### 4.2 POST /functions/v1/share-image

Generates a shareable stats card image.

**Request**:
```json
{
  "type": "streak_milestone",
  "data": {
    "streak_days": 30,
    "rank": "Gold",
    "urges_resisted": 47
  }
}
```

**Response**:
```json
{
  "image_url": "https://<project>.supabase.co/storage/v1/object/public/shares/abc123.png"
}
```

### 4.3 POST /functions/v1/webhook-revenuecat

RevenueCat webhook handler. Called by RevenueCat when subscription events occur.

**Request** (from RevenueCat):
```json
{
  "api_version": "1.0",
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "supabase-user-uuid",
    "product_id": "zerotilt_pro_yearly",
    "price_in_purchased_currency": 59.99
  }
}
```

**Auth**: Verified via RevenueCat webhook secret (not user JWT).

**Actions**: Updates the `subscriptions` table based on event type (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION).

### 4.4 POST /functions/v1/check-badges

Evaluates whether the user has earned any new badges. Called after streak updates, urge logs, journal entries, etc.

**Request**:
```json
{
  "user_id": "uuid",
  "trigger": "urge_logged"
}
```

**Response**:
```json
{
  "new_badges": [
    { "id": "uuid", "name": "Urge Warrior", "tier": "bronze" }
  ]
}
```

### 4.5 POST /functions/v1/send-notification

Sends push notifications via Expo Push Service.

**Request**:
```json
{
  "user_id": "uuid",
  "title": "Streak milestone!",
  "body": "You just hit 7 days tilt-free! Keep going!",
  "data": { "screen": "dashboard" }
}
```

### 4.6 POST /functions/v1/export-user-data

GDPR data export. Returns all user data as a downloadable JSON.

**Auth**: Required (JWT). Can only export own data.

**Response**:
```json
{
  "download_url": "https://<project>.supabase.co/storage/v1/object/sign/exports/user-uuid.json?token=..."
}
```

### 4.7 POST /functions/v1/delete-user-data

GDPR data deletion. Cascading delete of all user records.

**Auth**: Required (JWT). Can only delete own data.

**Response**:
```json
{ "status": "deleted", "tables_affected": 17 }
```

## 5. Error Handling

### Standard Error Response Format

All API errors follow this shape:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Optional additional context"
}
```

### HTTP Status Codes

| Status | Meaning | When |
|--------|---------|------|
| 200 | Success | Successful read/update |
| 201 | Created | Successful insert |
| 204 | No Content | Successful delete |
| 400 | Bad Request | Malformed request, validation error |
| 401 | Unauthorized | Missing or expired JWT |
| 403 | Forbidden | RLS policy denied access |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Unique constraint violation (e.g., duplicate like) |
| 422 | Unprocessable | Semantic error (e.g., weak password) |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal error |

### Client-Side Error Handling Pattern

```typescript
async function safeQuery<T>(
  query: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await query;

  if (error) {
    // Log to Sentry
    Sentry.captureException(error);

    if (error.code === 'PGRST301') throw new AuthError('Session expired');
    if (error.code === '23505') throw new ConflictError('Already exists');
    if (error.code === '42501') throw new ForbiddenError('Access denied');

    throw new ApiError(error.message);
  }

  if (!data) throw new NotFoundError('No data returned');
  return data;
}
```

## 6. Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Supabase PostgREST | 1000 req/min per user | Rolling 1 minute |
| coach-message | 20 messages/hour per user | Rolling 1 hour |
| share-image | 10 requests/hour per user | Rolling 1 hour |
| Auth signup | 10 requests/hour per IP | Rolling 1 hour |
| Auth login | 30 requests/hour per IP | Rolling 1 hour |

## 7. Pagination

All list endpoints support cursor-based pagination via Supabase's `.range()`:

```typescript
// Page 1 (items 0-19)
const { data } = await supabase.from('posts').select('*').range(0, 19);

// Page 2 (items 20-39)
const { data } = await supabase.from('posts').select('*').range(20, 39);
```

Default page size: 20 items. Maximum: 100 items.
