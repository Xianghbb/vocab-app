# Data Model: Flashcard MVP

**Purpose**: Define entities, relationships, and validation rules for VocabApp MVP
**Created**: 2025-11-27
**Based on**: Feature specification and research findings

## Entity Definitions

### Dictionary Entry

Represents a vocabulary word with its Chinese translation.

**Fields**:
- `id` (UUID): Primary key, auto-generated
- `english_word` (Text): English vocabulary word, unique, required
- `chinese_translation` (Text): Chinese translation, required
- `example_sentence` (Text): Optional example usage sentence
- `created_at` (Timestamp): Record creation time

**Validation Rules**:
- `english_word` must be unique across all records
- `english_word` cannot be empty or whitespace only
- `chinese_translation` cannot be empty or whitespace only
- Maximum length: 500 characters for words, 1000 for sentences

**Business Rules**:
- Words are immutable once created (no updates allowed)
- Deletion cascades to related user_progress records
- English words are stored in lowercase for consistency

### User Progress

Tracks individual user's learning progress for each word.

**Fields**:
- `user_id` (Text): Clerk user ID, part of composite primary key
- `word_id` (UUID): Reference to dictionary entry, part of composite primary key
- `status` (Enum): Word learning status - 'new', 'known', 'unknown'
- `last_reviewed_at` (Timestamp): Last interaction timestamp
- `created_at` (Timestamp): Record creation time
- `updated_at` (Timestamp): Last update time

**Validation Rules**:
- `user_id` must be valid Clerk user identifier
- `word_id` must reference existing dictionary entry
- `status` must be one of: 'new', 'known', 'unknown'
- Composite key ensures one progress record per user-word pair

**Business Rules**:
- Status transitions: 'new' → 'known'/'unknown', 'known'/'unknown' → either
- `last_reviewed_at` updates on every status change
- Records are upserted (updated if exists, created if not)

## Entity Relationships

```
Dictionary Entry (1) ←────── (N) User Progress
  id                              user_id
  english_word                    word_id (FK → Dictionary.id)
  chinese_translation             status
  example_sentence                last_reviewed_at
  created_at                      created_at
                                  updated_at
```

**Relationship Type**: One-to-Many
- One dictionary entry can have many user progress records
- Each user progress record belongs to exactly one dictionary entry
- Deletion of dictionary entry cascades to all related user progress records

## State Transitions

### User Progress Status Flow

```
[new] ──Left──→ [unknown] ←───┐
   │              │            │
  Right          Right        Left
   │              │            │
   ↓              ↓            │
 [known] ←──Left──┴────────────┘
```

**Transition Rules**:
- Any status can transition to any other status
- Transitions are immediate upon user action
- All transitions update `last_reviewed_at`
- No historical tracking (current state only)

## Data Integrity Constraints

### Database-Level Constraints

1. **Unique Constraints**:
   - `dictionary.english_word` must be unique
   - `(user_progress.user_id, user_progress.word_id)` composite primary key

2. **Foreign Key Constraints**:
   - `user_progress.word_id` → `dictionary.id` with CASCADE delete

3. **Check Constraints**:
   - `user_progress.status` IN ('new', 'known', 'unknown')
   - `dictionary.english_word` NOT NULL AND TRIM(english_word) != ''
   - `dictionary.chinese_translation` NOT NULL AND TRIM(chinese_translation) != ''

### Application-Level Validation

1. **Word Normalization**:
   - English words converted to lowercase
   - Leading/trailing whitespace trimmed
   - Multiple internal spaces collapsed to single space

2. **Translation Validation**:
   - Chinese translation required
   - Basic Chinese character detection
   - No mixed English/Chinese in wrong fields

## Query Patterns

### Word Selection Queries

**Priority-Based Selection** (Authenticated Users):
```sql
SELECT d.*, COALESCE(up.status, 'new') as status
FROM dictionary d
LEFT JOIN user_progress up ON d.id = up.word_id AND up.user_id = $1
ORDER BY
  CASE COALESCE(up.status, 'new')
    WHEN 'new' THEN 1
    WHEN 'unknown' THEN 2
    WHEN 'known' THEN 3
  END,
  COALESCE(up.last_reviewed_at, '1970-01-01') ASC
LIMIT 1;
```

**Random Selection** (Guest Users):
```sql
SELECT * FROM dictionary
ORDER BY RANDOM()
LIMIT 1;
```

### Statistics Queries

**User Statistics**:
```sql
-- Total reviewed words
SELECT COUNT(DISTINCT word_id) as total
FROM user_progress
WHERE user_id = $1;

-- Today's reviews
SELECT COUNT(*) as today
FROM user_progress
WHERE user_id = $1
AND DATE(last_reviewed_at) = CURRENT_DATE;

-- This week's reviews
SELECT COUNT(*) as this_week
FROM user_progress
WHERE user_id = $1
AND last_reviewed_at >= CURRENT_DATE - INTERVAL '7 days';

-- Remaining words (new or unknown)
SELECT COUNT(*) as remaining
FROM dictionary d
LEFT JOIN user_progress up ON d.id = up.word_id AND up.user_id = $1
WHERE up.status IN ('new', 'unknown') OR up.status IS NULL;
```

## Type Definitions

### TypeScript Interfaces

```typescript
export interface DictionaryEntry {
  id: string;
  english_word: string;
  chinese_translation: string;
  example_sentence: string | null;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  word_id: string;
  status: 'new' | 'known' | 'unknown';
  last_reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  total: number;
  today: number;
  thisWeek: number;
  remaining: number;
}

export interface WordWithProgress extends DictionaryEntry {
  status: 'new' | 'known' | 'unknown';
  last_reviewed_at: string | null;
}
```

## Migration Strategy

### Initial Schema Migration

```sql
-- Create dictionary table
CREATE TABLE dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  english_word TEXT NOT NULL UNIQUE,
  chinese_translation TEXT NOT NULL,
  example_sentence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE user_progress (
  user_id TEXT NOT NULL,
  word_id UUID NOT NULL REFERENCES dictionary(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('new', 'known', 'unknown')),
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- Create indexes for performance
CREATE INDEX idx_dictionary_random ON dictionary (random());
CREATE INDEX idx_user_progress_user_status ON user_progress (user_id, status);
CREATE INDEX idx_user_progress_reviewed_at ON user_progress (user_id, last_reviewed_at);
```

### Row Level Security

```sql
-- Enable RLS
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Dictionary policies (read-only for users)
CREATE POLICY "Users can read dictionary" ON dictionary
  FOR SELECT USING (true);

-- User progress policies (users manage own data)
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());
```

This data model provides a solid foundation for the flashcard MVP while maintaining simplicity and adhering to the constitutional principles of minimalism and type safety. All entities are designed to support the core learning loop efficiently while enabling future extensions if needed.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.## Validation Summary

✅ **Completeness**: All entities from specification defined
✅ **Type Safety**: Full TypeScript definitions provided
✅ **Validation**: Business rules and constraints specified
✅ **Performance**: Query patterns optimized for MVP scale
✅ **Security**: RLS policies defined per constitution principles
✅ **Simplicity**: Minimal complexity aligned with MVP scope

The model is ready for implementation and supports all required user stories while maintaining the constitutional principles of technical minimalism and server-first architecture.