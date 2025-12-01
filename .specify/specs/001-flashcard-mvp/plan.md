# Implementation Plan: Flashcard MVP - Zero-Backend Edition

**Branch**: `001-flashcard-mvp` | **Date**: 2025-11-27 | **Spec**: [link]
**Input**: Feature specification from `/specs/001-flashcard-mvp/spec.md`
**Architecture**: Zero-Backend, Client-First

**Note**: This plan implements a zero-backend architecture using client components and browser-side Supabase client only.

## Summary

Build a zero-backend flashcard application for Chinese users to learn English vocabulary. The app runs entirely in the browser using Next.js client components, Supabase JS browser client for data operations, and Clerk for authentication. All interactivity happens client-side with RLS policies protecting data access.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode
**Primary Dependencies**: Next.js 14+, Supabase browser client, Clerk authentication
**Storage**: Supabase PostgreSQL with RLS (browser-only access)
**Testing**: Jest for unit tests, browser-based testing
**Target Platform**: Web application (mobile-first, client-only)
**Performance Goals**: <100ms keyboard response, <3s initial load
**Constraints**: Zero backend code, client components only, browser-side Supabase
**Project Type**: Client-side web application
**Scale/Scope**: Single page app, 3 main pages, 2 database tables, ~500 word dictionary

## Constitution Check - Zero-Backend Edition

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ MVP-First Development
- Scope limited to core flashcard learning loop
- No complex features beyond basic review and stats
- Guest mode provides immediate value without authentication

### ✅ Technical Minimalism - Zero-Backend
- Supabase as only backend via browser client
- Clerk for authentication (client-side only)
- **Zero server-side code, no backend logic**
- Browser-side Supabase JS client for all operations

### ✅ Client-First Architecture - Zero Backend
- **Client components for all interactive screens**
- **Supabase JS browser client for all database operations**
- **No Server Actions, no Route Handlers, no API endpoints**
- Server components only for static layouts if needed

### ✅ Flashcard Interaction Simplicity
- Space = reveal, Left/Right = mark knowledge
- No complex gestures or multi-step interactions
- Keyboard-first design

### ✅ Strict TypeScript Compliance
- All code TypeScript with strict mode
- Database operations fully typed via Supabase
- No `any` types in application code

### ✅ Mobile-First Design
- Single column layouts
- Touch-friendly targets
- Responsive design for all screen sizes
- No desktop-only features

### ✅ Incremental AI Development
- Small, testable components
- Incremental implementation approach
- Direct specification-to-code generation

**Zero-backend architecture confirmed. Proceed with client-only implementation.**

## Project Structure - Zero Backend

### Documentation (this feature)

```text
specs/001-flashcard-mvp/
├── plan.md              # This file (zero-backend implementation)
├── research.md          # Phase 0 output (client-first patterns)
├── data-model.md        # Phase 1 output (browser-safe queries)
├── quickstart.md        # Phase 1 output (client setup)
└── tasks.md             # Phase 2 output (client-only tasks)
```

### Source Code - Zero Backend

```text
app/
├── page.tsx                    # Homepage/flashcard review (client)
├── dashboard/
│   └── page.tsx               # Stats dashboard (client)
├── login/
│   └── page.tsx               # Clerk login page (client)
├── layout.tsx                 # Root layout with Clerk provider
└── globals.css                # Global styles

components/
├── FlashcardComponent.tsx     # Main flashcard UI (client)
├── StatsDashboard.tsx         # Statistics display (client)
├── KeyboardHandler.tsx        # Keyboard event handling (client)
├── Navigation.tsx             # Simple navigation (client)
└── ui/                        # Reusable UI components

lib/
├── supabase/
│   ├── client.ts              # Browser Supabase client setup
│   └── types.ts               # Generated database types
├── clerk/
│   └── client.ts              # Clerk client configuration
├── utils/
│   ├── wordSelection.ts       # Client-side word algorithms
│   └── statistics.ts          # Client-side stats calculations
└── constants.ts               # App constants

hooks/
├── useSupabase.ts             # Supabase client hook
├── useKeyboardNavigation.ts   # Keyboard event hook
├── useWordReview.ts          # Word review logic hook
└── useStatistics.ts          # Statistics calculation hook

types/
└── index.ts                   # Application type definitions

supabase/
├── migrations/
│   └── 20241127000000_initial_schema.sql
└── seed.sql                   # Dictionary seed data
```

**Structure Decision**: Flat client-side architecture with all interactivity in client components. No server components for interactive features, no API routes, no server actions.

## Complexity Tracking

> **Zero backend complexity justified**: All data operations happen client-side via Supabase browser client with RLS protection. This eliminates server maintenance while maintaining security through database-level policies.

## Phase 0: Research - Client-First Patterns

### Browser-Side Supabase Integration

**Research Required**: Best practices for browser-only Supabase usage with Next.js
- Supabase client initialization in browser context
- RLS policy configuration for client-side access
- Authentication state management with Clerk
- Error handling for client-side operations

### Client Component Patterns

**Research Required**: Client component architecture patterns
- State management for word review flow
- Keyboard event handling in client components
- Data fetching patterns without server components
- Loading states and error boundaries

### Zero-Backend Security

**Research Required**: Security considerations for client-only apps
- RLS policy design for protecting user data
- Clerk integration with Supabase RLS
- Preventing unauthorized writes through RLS
- Data validation at database level

## Phase 1: Design - Client-Only Implementation

### Database Schema - Browser Safe

**Prerequisites**: Research complete, RLS policies designed

**Schema Design**:
```sql
-- Dictionary table (read-only for users)
CREATE TABLE dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  english_word TEXT NOT NULL UNIQUE,
  chinese_translation TEXT NOT NULL,
  example_sentence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table (user-managed via RLS)
CREATE TABLE user_progress (
  user_id TEXT NOT NULL,
  word_id UUID NOT NULL REFERENCES dictionary(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('new', 'known', 'unknown')),
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- Performance indexes
CREATE INDEX idx_user_progress_user_status ON user_progress (user_id, status);
CREATE INDEX idx_user_progress_reviewed_at ON user_progress (user_id, last_reviewed_at);
```

### RLS Policies - Client Protection

```sql
-- Dictionary: Read-only for all users
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dictionary" ON dictionary
  FOR SELECT USING (true);

-- User Progress: Users manage only their own data
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());
```

### Browser-Safe Queries

**Word Selection for Guests**:
```typescript
// Client-side Supabase query
const { data, error } = await supabase
  .from('dictionary')
  .select('*')
  .order('random()')
  .limit(1)
  .single();
```

**Word Selection for Authenticated Users**:
```typescript
// Client-side priority query
const { data, error } = await supabase
  .from('user_progress')
  .select(`
    word_id,
    status,
    last_reviewed_at,
    dictionary!inner(*)
  `)
  .order('status', { ascending: true })
  .order('last_reviewed_at', { ascending: true })
  .limit(1)
  .single();
```

### Client Components - Zero Backend

**FlashcardComponent** (Client Only):
```typescript
'use client';

export function FlashcardComponent() {
  const [word, setWord] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const supabase = useSupabaseClient();

  // Client-side word fetching
  const fetchWord = async () => {
    const { data } = await supabase
      .from('dictionary')
      .select('*')
      .order('random()')
      .limit(1)
      .single();

    setWord(data);
    setIsRevealed(false);
  };

  // Client-side keyboard handling
  useKeyboardNavigation({
    onReveal: () => setIsRevealed(true),
    onUnknown: handleUnknown,
    onKnown: handleKnown
  });

  return (
    // Client-side JSX
  );
}
```

### Browser-Side Supabase Client

**Client Configuration**:
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Hook for client components
export const useSupabaseClient = () => {
  const [client] = useState(() => createBrowserClient());
  return client;
};
```

### Clerk Integration - Client Only

**Authentication Setup**:
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Client-Side Auth Hook**:
```typescript
// hooks/useAuth.ts
import { useUser } from '@clerk/nextjs';

export const useClientAuth = () => {
  const { user, isSignedIn } = useUser();
  return { user, isSignedIn };
};
```

## Phase 2: Implementation Tasks

Tasks will be generated by `/speckit.tasks` command based on this zero-backend plan.

## Validation Summary

✅ **Zero-Backend Architecture**: No server actions, no API routes, no server-side code
✅ **Client-First Implementation**: All interactivity in client components
✅ **Browser-Side Supabase**: Direct client-to-database via browser client
✅ **RLS Protection**: Security enforced at database level
✅ **Clerk Integration**: Client-side authentication only
✅ **Type Safety**: Full TypeScript support with generated types

This plan establishes a clean, zero-backend architecture that eliminates all server complexity while maintaining full functionality through client-side implementation and database-level security.## Validation Summary

✅ **Zero-Backend Architecture**: No server actions, no API routes, no server-side code
✅ **Client-First Implementation**: All interactivity in client components
✅ **Browser-Side Supabase**: Direct client-to-database via browser client
✅ **RLS Protection**: Security enforced at database level
✅ **Clerk Integration**: Client-side authentication only
✅ **Type Safety**: Full TypeScript support with generated types

This plan establishes a clean, zero-backend architecture that eliminates all server complexity while maintaining full functionality through client-side implementation and database-level security.## Validation Summary

✅ **Zero-Backend Architecture**: No server actions, no API routes, no server-side code
✅ **Client-First Implementation**: All interactivity in client components
✅ **Browser-Side Supabase**: Direct client-to-database via browser client
✅ **RLS Protection**: Security enforced at database level
✅ **Clerk Integration**: Client-side authentication only
✅ **Type Safety**: Full TypeScript support with generated types

This plan establishes a clean, zero-backend architecture that eliminates all server complexity while maintaining full functionality through client-side implementation and database-level security.## Validation Summary

✅ **Zero-Backend Architecture**: No server actions, no API routes, no server-side code
✅ **Client-First Implementation**: All interactivity in client components
✅ **Browser-Side Supabase**: Direct client-to-database via browser client
✅ **RLS Protection**: Security enforced at database level
✅ **Clerk Integration**: Client-side authentication only
✅ **Type Safety**: Full TypeScript support with generated types

This plan establishes a clean, zero-backend architecture that eliminates all server complexity while maintaining full functionality through client-side implementation and database-level security.## Validation Summary

✅ **Zero-Backend Architecture**: No server actions, no API routes, no server-side code
✅ **Client-First Implementation**: All interactivity in client components
✅ **Browser-Side Supabase**: Direct client-to-database via browser client
✅ **RLS Protection**: Security enforced at database level
✅ **Clerk Integration**: Client-side authentication only
✅ **Type Safety**: Full TypeScript support with generated types

This plan establishes a clean, zero-backend architecture that eliminates all server complexity while maintaining full functionality through client-side implementation and database-level security.