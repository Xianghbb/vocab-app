<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0 (Initial constitution creation)
- Added sections: Core Principles (I-VII), Technical Architecture, UX Standards, Development Workflow, Governance
- No modified or removed sections (first version)
- Templates requiring updates: plan-template.md, spec-template.md, tasks-template.md (✅ verified compatible)
- No follow-up TODOs
-->

# VocabApp Constitution

## Core Principles

### I. MVP-First Development
Deliver a clean, extremely simple MVP for Chinese users learning English vocabulary. Focus on the core learning flow rather than complex features. Every feature must justify its existence by directly supporting vocabulary learning.

**Rationale**: Scope creep is the enemy of shipping. A simple, working flashcard app is infinitely more valuable than a complex, unfinished learning platform.

### II. Technical Minimalism
Use Supabase as the only backend & database. Use Clerk for authentication. Use Next.js App Router with server-side calls via Supabase client + RLS. No complex backend logic unless absolutely necessary.

**Rationale**: Technical complexity should match product complexity. These tools provide everything needed for an MVP without custom backend infrastructure.

### III. Server-First Architecture
Prefer server components except where explicit interactivity is required. All database operations must be typed and use server-side calls. Client components are the exception, not the rule.

**Rationale**: Server components provide better performance, security, and simpler data fetching. They align with Next.js best practices and reduce client-side complexity.

### IV. Flashcard Interaction Simplicity
Flashcard interface: Space = reveal word details, Left arrow = mark as unknown, Right arrow = mark as known. No complex gestures, no multi-step interactions.

**Rationale**: Learning requires focus on vocabulary, not interface mechanics. Simple interactions become muscle memory, allowing users to focus on learning.

### V. Strict TypeScript Compliance
All code must be TypeScript with strict mode enabled. All database operations must be fully typed. No `any` types except in third-party library integration.

**Rationale**: Type safety prevents runtime errors and provides better IDE support. For a learning app, reliability is crucial for user trust.

### VI. Mobile-First Design
UI must be minimal, clean, and mobile-friendly. Single column layouts, touch-friendly targets, readable fonts. No desktop-only features.

**Rationale**: Chinese users primarily access web apps via mobile. The learning experience must be seamless on phones.

### VII. Incremental AI Development
Generate artifacts directly from specifications. Keep each AI-generated part small and testable. Prefer incremental tasks during implementation.

**Rationale**: Small, testable chunks reduce integration issues and make debugging easier. This aligns with MVP development principles.

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 14+ with App Router
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Authentication**: Clerk
- **Deployment**: Vercel
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (minimal)

### Data Flow
1. Server components fetch data via Supabase client
2. RLS policies enforce security at database level
3. Client components handle only interactive elements
4. All mutations go through server actions

### Database Principles
- Single dictionary table for MVP
- Progress tracking per user-word pair
- Simple random or FIFO review algorithms only
- No complex SRS or spaced repetition

## UX Standards

### Color Palette
- Minimal colors: primary, secondary, success, error
- High contrast for readability
- No gradients or complex visual effects
- Consistent spacing using Tailwind scale

### Interaction Patterns
- Space key reveals card details
- Left/Right arrows mark knowledge
- No mouse-only interactions
- Clear visual feedback for all actions

### Content Guidelines
- English words with Chinese translations
- Clear, simple definitions
- Example sentences where helpful
- Pronunciation guides for beginners

## Development Workflow

### Code Quality Gates
1. TypeScript compilation must pass
2. ESLint rules must pass
3. All database operations typed
4. Server components preferred
5. No client-side data fetching except when necessary

### Testing Requirements
- Unit tests for utility functions
- Integration tests for user flows
- Manual testing on mobile devices
- No tests for simple UI components unless complex logic

### Review Process
1. All PRs must pass type checking
2. Mobile responsiveness verified
3. Performance checked on slow connections
4. Accessibility basic compliance (keyboard navigation)

## Governance

### Amendment Process
- Constitution changes require documentation update
- Must not conflict with MVP scope boundaries
- Technical architecture changes need justification
- UX changes must maintain simplicity

### Compliance Verification
- All PRs must verify constitution compliance
- New features must fit MVP scope
- Technical choices must align with principles
- UX changes require mobile testing

### Version Management
- Follow semantic versioning for constitution
- Document all changes in sync impact report
- Maintain backward compatibility where possible
- Breaking changes require team discussion

**Version**: 1.0.0 | **Ratified**: 2025-11-27 | **Last Amended**: 2025-11-27