# Implementation Plan: Flashcard MVP

**Branch**: `001-flashcard-mvp` | **Date**: 2025-11-27 | **Spec**: [link]
**Input**: Feature specification from `/specs/001-flashcard-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a minimal viable product for Chinese users to learn English vocabulary through a flashcard interface. The core learning loop allows immediate guest access with keyboard-driven interactions (Space to reveal, Left/Right to mark knowledge), while authenticated users get personalized review prioritization and progress tracking. Implementation uses Next.js 14 App Router with server-first architecture, Supabase for data persistence, and Clerk for authentication.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode
**Primary Dependencies**: Next.js 14+, Supabase client, Clerk authentication
**Storage**: Supabase PostgreSQL with Row Level Security
**Testing**: Jest for unit tests, Playwright for integration tests
**Target Platform**: Web application (mobile-first)
**Performance Goals**: <100ms keyboard response, <3s initial load, <1s data fetching
**Constraints**: Server components preferred, no client-side data fetching, strict TypeScript
**Project Type**: Web application with server-first architecture
**Scale/Scope**: Single page app, 3 main components, 2 database tables, ~500 initial word dictionary

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ MVP-First Development
- Scope limited to core flashcard learning loop
- No complex features beyond basic review and stats
- Guest mode provides immediate value without authentication

### ✅ Technical Minimalism
- Supabase as only backend/database
- Clerk for authentication
- Next.js App Router with server components
- No custom backend infrastructure

### ✅ Server-First Architecture
- Server components for data fetching
- Server actions for mutations
- RLS policies for security
- Client components only for interactivity

### ✅ Flashcard Interaction Simplicity
- Space = reveal, Left/Right = mark knowledge
- No complex gestures or multi-step interactions
- Keyboard-first design

### ✅ Strict TypeScript Compliance
- All code will be TypeScript with strict mode
- Database operations fully typed
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

**No constitution violations detected. Proceed with implementation.**

## Project Structure

### Documentation (this feature)

```text
specs/001-flashcard-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (guest)/
│   ├── page.tsx                    # Guest flashcard review
│   └── layout.tsx                  # Guest layout wrapper
├── (user)/
│   ├── dashboard/
│   │   └── page.tsx               # Stats dashboard
│   ├── review/
│   │   └── page.tsx               # Authenticated flashcard review
│   └── layout.tsx                 # Protected user layout
├── _components/
│   ├── FlashcardComponent.tsx     # Main flashcard UI
│   ├── StatsDashboard.tsx         # Statistics display
│   ├── KeyboardHandler.tsx        # Keyboard event handling
│   └── Navigation.tsx             # Simple navigation
├── api/
│   └── words/
│       └── route.ts               # Word fetching endpoint
├── actions/
│   └── wordActions.ts             # Server actions for word updates
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client configuration
│   │   ├── server.ts              # Server-side Supabase client
│   │   └── types.ts               # Database type definitions
│   ├── clerk/
│   │   └── client.ts              # Clerk client setup
│   └── utils/
│       ├── wordSelection.ts       # Word priority algorithms
│       └── statistics.ts          # Stats calculation utilities
└── middleware.ts                  # Clerk authentication middleware

components/
└── ui/                            # Reusable UI components (if needed)

lib/
├── database.types.ts              # Generated Supabase types
└── constants.ts                   # App constants

supabase/
├── migrations/
│   └── 20241127000000_initial_schema.sql
└── seed.sql                       # Dictionary seed data

types/
└── index.ts                       # Application type definitions
```

**Structure Decision**: Next.js App Router with route groups for authentication boundaries, server-first architecture with typed Supabase operations, and minimal component hierarchy aligned with MVP scope.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Route Groups | Authentication boundary separation | Single route would complicate auth logic |
| Server Actions | Data mutation requirements | Direct client calls violate RLS principles |
| Keyboard Handler | Complex keyboard interactions | Native events insufficient for requirements |