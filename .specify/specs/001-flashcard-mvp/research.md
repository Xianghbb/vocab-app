# Research: Flashcard MVP Technical Implementation

**Purpose**: Resolve technical unknowns and establish implementation patterns for VocabApp MVP
**Created**: 2025-11-27
**Feature**: Flashcard MVP

## Technology Stack Decisions

### Next.js App Router with Route Groups

**Decision**: Use Next.js 14+ App Router with route groups `(guest)` and `(user)`

**Rationale**: Route groups provide clean authentication boundary separation without affecting URL structure. This aligns with the constitution's server-first architecture principle while maintaining simple navigation.

**Implementation Pattern**:
```typescript
// app/(guest)/layout.tsx - Unauthenticated layout
// app/(user)/layout.tsx - Protected layout with Clerk authentication
```

**Alternatives Considered**:
- Single layout with conditional rendering (rejected: complex auth logic)
- Middleware-based protection (rejected: less explicit boundaries)

### Supabase Integration Pattern

**Decision**: Use Supabase client libraries with server-side initialization

**Rationale**: Server components can directly access Supabase without exposing credentials, maintaining security while enabling type-safe database operations.

**Implementation Pattern**:
```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

export const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Alternatives Considered**:
- Client-side Supabase (rejected: violates RLS and server-first principles)
- REST API wrapper (rejected: unnecessary complexity)

### Clerk Authentication Integration

**Decision**: Use Clerk's Next.js integration with middleware protection

**Rationale**: Clerk provides seamless authentication with built-in components and middleware support, aligning with the constitution's technical minimalism principle.

**Implementation Pattern**:
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/words"],
  ignoredRoutes: ["/api/webhooks/clerk"]
});
```

**Alternatives Considered**:
- Custom auth implementation (rejected: violates minimalism)
- NextAuth.js (rejected: more complex setup)

## Data Architecture Patterns

### Word Selection Algorithm

**Decision**: Simple priority queue with FIFO fallback for words in same priority

**Rationale**: Meets constitution requirement for "simple algorithms only, no SRS" while providing effective learning prioritization.

**Algorithm Logic**:
1. New words (status = 'new') - random selection
2. Unknown words (status = 'unknown') - random selection
3. Known words (status = 'known') - random selection
4. Within each category: FIFO ordering based on last_reviewed_at

**Database Query Pattern**:
```sql
WITH priority_words AS (
  SELECT w.id, w.english_word, w.chinese_translation,
         COALESCE(up.status, 'new') as status,
         up.last_reviewed_at
  FROM dictionary w
  LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = auth.uid()
  WHERE auth.uid() IS NOT NULL
  ORDER BY
    CASE COALESCE(up.status, 'new')
      WHEN 'new' THEN 1
      WHEN 'unknown' THEN 2
      WHEN 'known' THEN 3
    END,
    COALESCE(up.last_reviewed_at, '1970-01-01') ASC
  LIMIT 1
)
SELECT * FROM priority_words;
```

### Statistics Calculation

**Decision**: Real-time aggregation with optimized queries

**Rationale**: Provides accurate, up-to-date statistics without complex caching while maintaining performance for MVP scale.

**Query Patterns**:
```sql
-- Total reviewed
SELECT COUNT(DISTINCT word_id)
FROM user_progress
WHERE user_id = auth.uid();

-- Today's count
SELECT COUNT(*)
FROM user_progress
WHERE user_id = auth.uid()
AND DATE(last_reviewed_at) = CURRENT_DATE;

-- Remaining words
SELECT COUNT(*)
FROM dictionary d
LEFT JOIN user_progress up ON d.id = up.word_id AND up.user_id = auth.uid()
WHERE up.status IN ('new', 'unknown') OR up.status IS NULL;
```

## UI/UX Implementation Patterns

### Keyboard Event Handling

**Decision**: Custom React hook with proper event cleanup

**Rationale**: Provides clean keyboard interaction while preventing memory leaks and ensuring proper TypeScript typing.

**Implementation Pattern**:
```typescript
// hooks/useKeyboardNavigation.ts
import { useEffect } from 'react';

export const useKeyboardNavigation = ({
  onReveal,
  onUnknown,
  onKnown
}: KeyboardNavHandlers) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onReveal();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onUnknown();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onKnown();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onReveal, onUnknown, onKnown]);
};
```

### Mobile-First Component Structure

**Decision**: Responsive design with touch-friendly targets (minimum 44px)

**Rationale**: Aligns with constitution's mobile-first principle and accessibility guidelines.

**CSS Patterns**:
```css
/* Tailwind classes */
.min-touch-target {
  @apply min-h-[44px] min-w-[44px];
}

.mobile-card {
  @apply w-full max-w-sm mx-auto p-4;
}
```

## Database Schema Design

### Dictionary Table Design

**Decision**: Simple structure with unique constraint on English words

**Rationale**: Prevents duplicates while maintaining query performance for random selection.

**Schema**:
```sql
CREATE TABLE dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  english_word TEXT NOT NULL UNIQUE,
  chinese_translation TEXT NOT NULL,
  example_sentence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dictionary_random ON dictionary (random());
```

### User Progress Table Design

**Decision**: Composite key approach with user_id + word_id

**Rationale**: Ensures one progress record per user-word pair while enabling efficient queries.

**Schema**:
```sql
CREATE TABLE user_progress (
  user_id TEXT NOT NULL,
  word_id UUID NOT NULL REFERENCES dictionary(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('new', 'known', 'unknown')),
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX idx_user_progress_user_status ON user_progress (user_id, status);
CREATE INDEX idx_user_progress_reviewed_at ON user_progress (user_id, last_reviewed_at);
```

## Security & RLS Patterns

### Row Level Security Policies

**Decision**: Principle of least privilege with explicit grants

**Rationale**: Aligns with constitution's security-first approach while maintaining functionality.

**RLS Implementation**:
```sql
-- Dictionary: Read-only for users
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read dictionary" ON dictionary
  FOR SELECT USING (true);

-- User Progress: Users can only access their own data
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());
```

## Performance Optimization

### Query Optimization

**Decision**: Strategic indexing and query patterns

**Rationale**: Ensures responsive user experience while maintaining simple architecture.

**Key Indexes**:
- Composite indexes on (user_id, status) for priority queries
- Index on last_reviewed_at for time-based statistics
- Random ordering optimization for word selection

### Caching Strategy

**Decision**: No client-side caching for MVP (server-side only)

**Rationale**: Simplifies implementation while Next.js provides built-in server-side caching. Can add client caching later if performance requires.

## Error Handling Patterns

### Database Error Handling

**Decision**: Typed error responses with user-friendly messages

**Rationale**: Maintains type safety while providing actionable error information.

**Pattern**:
```typescript
try {
  const { data, error } = await supabaseServer
    .from('user_progress')
    .upsert(progressData);

  if (error) throw error;
  return { success: true, data };
} catch (error) {
  return { success: false, error: 'Failed to save progress' };
}
```

## Testing Strategy

### Unit Testing Focus

**Decision**: Test utility functions and data transformation logic

**Rationale**: Server components and database operations are tested through integration tests.

**Test Coverage**:
- Word selection algorithms
- Statistics calculation functions
- Keyboard event handling logic
- Type safety validation

## Deployment Considerations

### Environment Configuration

**Decision**: Environment variables for all external services

**Rationale**: Enables different configurations for development/staging/production while maintaining security.

**Required Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

This research establishes clear implementation patterns that align with the VocabApp Constitution while providing specific technical guidance for the MVP implementation. All decisions prioritize simplicity, type safety, and maintainability as required by the constitutional principles.