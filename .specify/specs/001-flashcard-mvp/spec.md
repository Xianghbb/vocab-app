# Feature Specification: Flashcard MVP

**Feature Branch**: `001-flashcard-mvp`
**Created**: 2025-11-27
**Status**: Draft
**Input**: User description: "Based on the VocabApp Constitution (v1.0.0), generate a clean, minimal Product Specification for the MVP. The goal is to define only the features necessary to implement: 1. The flashcard learning loop, 2. Basic progress tracking for authenticated users, 3. A simple progress dashboard. No navigation complexity, no multi-dictionary support, and no non-essential features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest Instant Review (Priority: P1)

As a Guest, I can load the app and immediately see a flashcard with an English word. The words shown are selected randomly from the full dictionary. I can press Spacebar to reveal Chinese translation, then press Left arrow for "unknown" or Right arrow for "known" to load the next random word.

**Why this priority**: This delivers immediate value to all users without requiring authentication, establishing the core learning experience.

**Independent Test**: Can be fully tested by opening the app as a guest, viewing flashcards, and using keyboard interactions without any login or persistence.

**Acceptance Scenarios**:

1. **Given** I am an unauthenticated user, **When** I load the app, **Then** I immediately see an English word flashcard
2. **Given** I see an English word, **When** I press Spacebar, **Then** the Chinese translation is revealed
3. **Given** I have revealed the translation, **When** I press Left arrow, **Then** a new random word appears
4. **Given** I have revealed the translation, **When** I press Right arrow, **Then** a new random word appears
5. **Given** I am using the app as a guest, **When** I complete any interaction, **Then** no data is persisted

---

### User Story 2 - User Authentication (Priority: P2)

As a User, I can authenticate via Clerk to access personalized features including progress tracking and priority review system.

**Why this priority**: Authentication enables personalized learning but is not required for the core flashcard experience.

**Independent Test**: Can be fully tested by completing the authentication flow and verifying access to authenticated features.

**Acceptance Scenarios**:

1. **Given** I am on the app, **When** I choose to sign in, **Then** I can authenticate via Clerk
2. **Given** I am authenticated, **When** I complete the login process, **Then** I see my personalized review queue
3. **Given** I am authenticated, **When** I interact with flashcards, **Then** my progress is tracked

---

### User Story 3 - Priority Review System (Priority: P2)

As an authenticated User, I see words prioritized by learning status: unreviewed words first, then words marked "unknown", then known words. This ensures I focus on new and challenging vocabulary.

**Why this priority**: Priority review maximizes learning efficiency by focusing on words that need attention.

**Independent Test**: Can be fully tested by authenticating, reviewing words, and verifying the priority order of word presentation.

**Acceptance Scenarios**:

1. **Given** I have authenticated, **When** I start reviewing, **Then** I see unreviewed words first
2. **Given** I have some words marked as unknown, **When** no unreviewed words remain, **Then** I see unknown words next
3. **Given** I have words marked as known, **When** no unreviewed or unknown words remain, **Then** I see known words last

---

### User Story 4 - Progress Tracking (Priority: P2)

As an authenticated User, my Left/Right interactions update my word status. Right arrow marks words as "known", Left arrow marks words as "unknown", enabling personalized review prioritization.

**Why this priority**: Progress tracking enables the priority review system and personalizes the learning experience.

**Independent Test**: Can be fully tested by authenticating, reviewing words, and verifying status changes are persisted.

**Acceptance Scenarios**:

1. **Given** I am authenticated and see a word, **When** I press Right arrow, **Then** the word is marked as known
2. **Given** I am authenticated and see a word, **When** I press Left arrow, **Then** the word is marked as unknown
3. **Given** I have marked words, **When** I return to the app later, **Then** my progress is preserved

---

### User Story 5 - Stats Dashboard (Priority: P3)

As an authenticated User, I can view a minimal dashboard showing total unique words reviewed, words reviewed today, words reviewed this week, and words remaining to review.

**Why this priority**: Stats provide motivation and progress visibility but are not essential for the core learning experience.

**Independent Test**: Can be fully tested by authenticating, reviewing words, and verifying dashboard displays accurate statistics.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** I view the dashboard, **Then** I see total words I've reviewed
2. **Given** I have reviewed words today, **When** I check the dashboard, **Then** I see today's count
3. **Given** I have reviewed words this week, **When** I check the dashboard, **Then** I see this week's count
4. **Given** I have words remaining, **When** I check the dashboard, **Then** I see the remaining count

### Edge Cases

- What happens when all words have been reviewed and marked as known?
- How does the system handle users who want to review known words again?
- What happens if a user loses internet connection during review?
- How are duplicate English words prevented in the dictionary?
- What happens when the dictionary contains no words?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow guest users to view English words without authentication
- **FR-002**: System MUST reveal Chinese translations when users press Spacebar
- **FR-003**: System MUST load next words based on keyboard input (Left/Right arrows)
- **FR-004**: System MUST NOT persist guest user interactions or progress
- **FR-005**: System MUST provide authentication via Clerk for user accounts
- **FR-006**: System MUST track word review status (new, known, unknown) for authenticated users
- **FR-007**: System MUST prioritize word review order: new words → unknown words → known words
- **FR-008**: System MUST update word status immediately when users make Left/Right decisions
- **FR-009**: System MUST display four key statistics: total reviewed, today, this week, remaining
- **FR-010**: System MUST support keyboard-only navigation for all core interactions
- **FR-011**: System MUST be mobile-responsive and touch-friendly
- **FR-012**: System MUST use simple algorithms for word selection (random or FIFO, no SRS)

### Key Entities *(include if feature involves data)*

- **Dictionary Entry**: Represents an English word with Chinese translation. Attributes: unique English word, Chinese translation, optional example sentence
- **User Progress**: Tracks individual user's interaction with words. Attributes: user identifier, word reference, status (new/known/unknown), last review timestamp
- **User Statistics**: Aggregated view of user's learning progress. Attributes: total reviewed count, daily count, weekly count, remaining count

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start reviewing vocabulary within 3 seconds of loading the app
- **SC-002**: 95% of keyboard interactions respond within 100 milliseconds
- **SC-003**: Users complete the authentication process in under 2 minutes
- **SC-004**: Authenticated users see personalized word prioritization working within 1 second
- **SC-005**: Dashboard statistics update accurately within 5 seconds of word reviews
- **SC-006**: 90% of users successfully complete at least 10 word reviews in their first session
- **SC-007**: Mobile users can complete the full review flow without horizontal scrolling
- **SC-008**: Guest users can learn vocabulary even with intermittent internet connection

## Assumptions

- Dictionary will be pre-populated with English-Chinese word pairs
- Clerk authentication service will be properly configured
- Users understand basic English and Chinese to benefit from the vocabulary learning
- Mobile devices have touch capabilities for interaction
- Internet connection is available for authentication and progress synchronization
- Users prefer keyboard shortcuts over mouse/touch for efficiency

## Constraints

- No multiple dictionary support in MVP
- No spaced repetition algorithms - simple random or FIFO only
- No social features, sharing, or user-to-user interaction
- No offline mode for authenticated features
- No payment or subscription functionality
- No complex navigation or multiple screens beyond review and stats