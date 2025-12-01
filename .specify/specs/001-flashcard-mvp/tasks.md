# Tasks: Flashcard MVP - Zero-Backend Implementation

**Input**: Design documents from `/specs/001-flashcard-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md
**Architecture**: Zero-Backend, Client-First

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Client components**: `components/` (all client components)
- **App pages**: `app/` (Next.js App Router pages)
- **Utilities**: `lib/` (client-side utilities)
- **Hooks**: `hooks/` (client-side React hooks)
- **Database**: `supabase/` (migrations and seed data)
- **Configuration**: Root level (env files, next.config.js)

---

## Phase 1: Project & Data Setup

**Purpose**: Initialize zero-backend project and configure core services

### P001 Initialize Next.js Project

- **Tool**: filesystem
- **Description**: Create Next.js project with App Router, TypeScript, and Tailwind CSS
- **Files**: Root directory structure
- **Done when**: `package.json` exists with Next.js 14+, TypeScript, and Tailwind dependencies

### P002 Install Zero-Backend Dependencies

- **Tool**: filesystem
- **Description**: Install Clerk, Supabase browser client, and TypeScript dependencies
- **Files**: `package.json`
- **Done when**: Dependencies installed: `@clerk/nextjs`, `@supabase/supabase-js`, `typescript`

### P003 Configure TypeScript Strict Mode

- **Tool**: filesystem
- **Description**: Set up `tsconfig.json` with strict mode enabled
- **Files**: `tsconfig.json`
- **Done when**: TypeScript strict mode enabled and compilation passes

### P004 Create Environment Variables Template

- **Tool**: filesystem
- **Description**: Create `.env.local` template with Supabase and Clerk variables
- **Files**: `.env.local.example`
- **Done when**: Template includes all required environment variables

### P005 Configure Clerk Provider

- **Tool**: filesystem
- **Description**: Set up Clerk provider in root layout
- **Files**: `app/layout.tsx`
- **Done when**: ClerkProvider wraps application with proper configuration

### P006 Create Browser Supabase Client

- **Tool**: filesystem
- **Description**: Implement browser-only Supabase client configuration
- **Files**: `lib/supabase/client.ts`
- **Done when**: Client exports `createBrowserClient()` function using anon key

### P007 Create Supabase Client Hook

- **Tool**: filesystem
- **Description**: Create React hook for accessing Supabase client in components
- **Files**: `hooks/useSupabase.ts`
- **Done when**: Hook returns initialized browser Supabase client

### P008 Create Database Tables via Supabase MCP

- **Tool**: supabase
- **Description**: Create `dictionary` and `user_progress` tables via Supabase migrations
- **Files**: `supabase/migrations/20241127000000_initial_schema.sql`
- **Done when**: Tables exist with correct schema and constraints

### P009 Deploy RLS Policies via Supabase MCP

- **Tool**: supabase
- **Description**: Deploy Row Level Security policies for client-side access
- **Files**: `supabase/migrations/20241127000001_rls_policies.sql`
- **Done when**: RLS policies protect dictionary (read-only) and user_progress (user-isolated)

### P010 Generate Supabase Types

- **Tool**: supabase
- **Description**: Generate TypeScript types from database schema
- **Files**: `lib/supabase/types.ts`
- **Done when**: Types generated and imported in client configuration

### P011 Configure Tailwind for Mobile-First

- **Tool**: filesystem
- **Description**: Set up Tailwind with mobile-first configuration and custom utilities
- **Files**: `tailwind.config.js`, `app/globals.css`
- **Done when**: Mobile-first utilities available and responsive design enabled

---

## Phase 2: Authentication & Core Data Services

**Purpose**: Implement authentication and core data operations (all client-side)

### P012 Create Login Page with Clerk Components

- **Tool**: filesystem
- **Description**: Build login page using Clerk's pre-built components
- **Files**: `app/login/page.tsx`
- **Done when**: Page renders Clerk sign-in/up components, works with zero backend

### P013 Create Guest Word Fetching Hook

- **Tool**: filesystem
- **Description**: Implement hook to fetch random word for guest users
- **Files**: `hooks/useGuestWord.ts`
- **Done when**: Hook returns random word using browser Supabase client

### P014 Create Authenticated Word Fetching Hook

- **Tool**: filesystem
- **Description**: Implement hook to fetch prioritized word for authenticated users
- **Files**: `hooks/useAuthenticatedWord.ts`
- **Done when**: Hook returns word based on priority (new → unknown → known)

### P015 Create Word Progress Update Hook

- **Tool**: filesystem
- **Description**: Implement hook to update word status in user_progress
- **Files**: `hooks/useUpdateProgress.ts`
- **Done when**: Hook updates status via browser Supabase client with RLS

### P016 Create Guest Mode Detection Hook

- **Tool**: filesystem
- **Description**: Implement hook to detect and handle guest vs authenticated state
- **Files**: `hooks/useAuthMode.ts`
- **Done when**: Hook returns correct mode and handles Clerk auth state

### P017 Create Word Selection Utility

- **Tool**: filesystem
- **Description**: Implement client-side word selection logic for both modes
- **Files**: `lib/utils/wordSelection.ts`
- **Done when**: Utility handles random selection for guests, priority for authenticated

### P018 Create Progress Tracking Utility

- **Tool**: filesystem
- **Description**: Implement client-side progress update logic
- **Files**: `lib/utils/progressTracking.ts`
- **Done when**: Utility handles upserts with proper error handling

---

## Phase 3: Flashcard UI and Interaction

**Purpose**: Build the core flashcard interface with Figma-based design

### P019 Extract Figma Design for Flashcard Component

- **Tool**: figma
- **Description**: Use Figma MCP to extract flashcard layout, colors, spacing
- **Files**: Design reference for `components/FlashcardComponent.tsx`
- **Done when**: Component specifications extracted including dimensions, colors, typography

### P020 Create FlashcardComponent Structure

- **Tool**: filesystem
- **Description**: Build basic FlashcardComponent with "use client" directive
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Component structure created with proper TypeScript types

### P021 Implement Flashcard Hidden State UI

- **Tool**: filesystem
- **Description**: Build UI showing English word only with "Press Space to reveal" prompt
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Hidden state matches Figma design with Tailwind classes

### P022 Implement Flashcard Revealed State UI

- **Tool**: filesystem
- **Description**: Build UI showing both English and Chinese with action prompts
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Revealed state matches Figma design with proper layout

### P023 Integrate Word Data into FlashcardComponent

- **Tool**: filesystem
- **Description**: Connect component to word fetching hooks
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Component displays actual word data from Supabase

### P024 Implement Reveal Logic

- **Tool**: filesystem
- **Description**: Add state management for reveal functionality
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Spacebar reveals Chinese translation, UI updates accordingly

### P025 Create Keyboard Handler Hook

- **Tool**: filesystem
- **Description**: Implement hook for Space/Left/Right keyboard events
- **Files**: `hooks/useKeyboardNavigation.ts`
- **Done when**: Hook captures keyboard events and calls appropriate handlers

### P026 Integrate Keyboard Handler with Flashcard

- **Tool**: filesystem
- **Description**: Connect keyboard events to flashcard actions
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Space reveals, Left/Right trigger progress updates and next word

### P027 Implement Progress Update Integration

- **Tool**: filesystem
- **Description**: Connect Left/Right actions to progress tracking
- **Files**: `components/FlashcardComponent.tsx`, `hooks/useUpdateProgress.ts`
- **Done when**: Left marks unknown, Right marks known, both update database via browser client

### P028 Create Main Review Page

- **Tool**: filesystem
- **Description**: Build main page integrating flashcard component
- **Files**: `app/page.tsx`
- **Done when**: Page renders flashcard with proper layout and navigation

### P029 Implement Word Transition Logic

- **Tool**: filesystem
- **Description**: Add smooth transitions between words after user actions
- **Files**: `components/FlashcardComponent.tsx`
- **Done when**: Next word loads smoothly after user decision

### P030 Add Loading States

- **Tool**: filesystem
- **Description**: Implement loading indicators during data fetching
- **Files**: `components/FlashcardComponent.tsx`, `hooks/useGuestWord.ts`, `hooks/useAuthenticatedWord.ts`
- **Done when**: Loading states display during word fetching and progress updates

---

## Phase 4: Dashboard and Deployment

**Purpose**: Build statistics dashboard and prepare for deployment

### P031 Extract Figma Design for Stats Dashboard

- **Tool**: figma
- **Description**: Use Figma MCP to extract dashboard layout and styling
- **Files**: Design reference for `components/StatsDashboard.tsx`
- **Done when**: Dashboard specifications extracted including 4-stat layout

### P032 Create Statistics Calculation Hook

- **Tool**: filesystem
- **Description**: Implement hook to calculate user statistics client-side
- **Files**: `hooks/useStatistics.ts`
- **Done when**: Hook returns total, today, this week, remaining counts

### P033 Create StatsDashboard Component

- **Tool**: filesystem
- **Description**: Build dashboard component showing 4 statistics
- **Files**: `components/StatsDashboard.tsx`
- **Done when**: Component displays all 4 stats with Figma-based styling

### P034 Implement Statistics Queries

- **Tool**: filesystem
- **Description**: Create client-side Supabase queries for statistics
- **Files**: `lib/utils/statistics.ts`
- **Done when**: Utilities fetch and calculate all required statistics

### P035 Create Dashboard Page

- **Tool**: filesystem
- **Description**: Build dashboard page integrating stats component
- **Files**: `app/dashboard/page.tsx`
- **Done when**: Page renders dashboard with proper navigation

### P036 Add Navigation Between Pages

- **Tool**: filesystem
- **Description**: Implement simple navigation between review and dashboard
- **Files**: `components/Navigation.tsx`, `app/page.tsx`, `app/dashboard/page.tsx`
- **Done when**: Users can navigate between main review and dashboard

### P037 Implement Error Boundaries

- **Tool**: filesystem
- **Description**: Add error handling for Supabase operations and UI errors
- **Files**: `components/ErrorBoundary.tsx`, various component files
- **Done when**: Errors display user-friendly messages, app remains stable

### P038 Add Environment Variables Validation

- **Tool**: filesystem
- **Description**: Validate required environment variables at runtime
- **Files**: `lib/utils/envValidation.ts`
- **Done when**: App shows clear error if required env vars missing

### P039 Create Deployment Configuration

- **Tool**: filesystem
- **Description**: Configure for Vercel deployment
- **Files**: `vercel.json`, `next.config.js`, environment setup
- **Done when**: Configuration supports zero-backend deployment to Vercel

### P040 Create Final Testing Checklist

- **Tool**: filesystem
- **Description**: Document manual testing procedures for zero-backend app
- **Files**: `TESTING_CHECKLIST.md`
- **Done when**: Checklist covers guest flow, auth flow, keyboard navigation, data persistence

### P041 Add Dictionary Seed Data

- **Tool**: supabase
- **Description**: Seed initial vocabulary words via Supabase
- **Files**: `supabase/seed.sql`
- **Done when**: Dictionary table populated with sample English-Chinese word pairs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies - can start immediately
- **Phase 2**: Depends on Phase 1 completion (database and auth setup)
- **Phase 3**: Depends on Phase 2 completion (core data services)
- **Phase 4**: Depends on Phase 3 completion (core flashcard functionality)

### Parallel Opportunities

**Within Each Phase**:
- P002, P003, P004 (dependency installation) can run in parallel
- P008, P009 (database setup) can run in parallel
- P013, P014, P015 (data hooks) can run in parallel
- P020, P025, P032 (component creation) can run in parallel
- P031, P033 (dashboard work) can run in parallel with P032

**Cross-Phase Parallelism**:
- Figma extraction (P019, P031) can happen anytime after Phase 1
- Some utility functions can be developed while UI components are being built

### Critical Path

1. P001 → P002 → P005 → P006 → P007 → P008 → P009 → P010
2. P013 → P014 → P015 → P020 → P021 → P022 → P023 → P024 → P026 → P027 → P028
3. P032 → P033 → P034 → P035 → P036 → P039 → P040

## Notes

- All tasks assume zero-backend architecture - no server components for interactive features
- Figma integration tasks should be completed before corresponding UI implementation
- Supabase MCP usage requires proper authentication and project selection
- Client components must use `"use client"` directive
- All Supabase operations use browser client only
- RLS policies handle security - no custom backend validation needed

This task list provides a complete roadmap for building the VocabApp MVP with zero-backend architecture, prioritizing the core flashcard learning experience while maintaining constitutional principles of simplicity and client-first development.## Validation Summary

✅ **Zero-Backend Compliance**: All tasks use client components and browser Supabase client
✅ **Atomic Tasks**: Each task does one clear thing with specific file paths
✅ **Prioritized Order**: Core flashcard loop before dashboard statistics
✅ **Figma Integration**: Explicit tasks for design extraction and implementation
✅ **MCP Tool Specification**: Clear tool usage for filesystem, supabase, and figma operations
✅ **Parallel Opportunities**: Dependencies identified for efficient development

The task list is ready for implementation following the zero-backend, client-first architecture defined in the updated constitution.## Validation Summary

✅ **Zero-Backend Compliance**: All tasks use client components and browser Supabase client
✅ **Atomic Tasks**: Each task does one clear thing with specific file paths
✅ **Prioritized Order**: Core flashcard loop before dashboard statistics
✅ **Figma Integration**: Explicit tasks for design extraction and implementation
✅ **MCP Tool Specification**: Clear tool usage for filesystem, supabase, and figma operations
✅ **Parallel Opportunities**: Dependencies identified for efficient development

The task list is ready for implementation following the zero-backend, client-first architecture defined in the updated constitution.## Validation Summary

✅ **Zero-Backend Compliance**: All tasks use client components and browser Supabase client
✅ **Atomic Tasks**: Each task does one clear thing with specific file paths
✅ **Prioritized Order**: Core flashcard loop before dashboard statistics
✅ **Figma Integration**: Explicit tasks for design extraction and implementation
✅ **MCP Tool Specification**: Clear tool usage for filesystem, supabase, and figma operations
✅ **Parallel Opportunities**: Dependencies identified for efficient development

The task list is ready for implementation following the zero-backend, client-first architecture defined in the updated constitution.## Validation Summary

✅ **Zero-Backend Compliance**: All tasks use client components and browser Supabase client
✅ **Atomic Tasks**: Each task does one clear thing with specific file paths
✅ **Prioritized Order**: Core flashcard loop before dashboard statistics
✅ **Figma Integration**: Explicit tasks for design extraction and implementation
✅ **MCP Tool Specification**: Clear tool usage for filesystem, supabase, and figma operations
✅ **Parallel Opportunities**: Dependencies identified for efficient development

The task list is ready for implementation following the zero-backend, client-first architecture defined in the updated constitution.## Validation Summary

✅ **Zero-Backend Compliance**: All tasks use client components and browser Supabase client
✅ **Atomic Tasks**: Each task does one clear thing with specific file paths
✅ **Prioritized Order**: Core flashcard loop before dashboard statistics
✅ **Figma Integration**: Explicit tasks for design extraction and implementation
✅ **MCP Tool Specification**: Clear tool usage for filesystem, supabase, and figma operations
✅ **Parallel Opportunities**: Dependencies identified for efficient development

The task list is ready for implementation following the zero-backend, client-first architecture defined in the updated constitution.## Validation Summary

✅ **Zero-Backend Compliance**: All tasks use client components and browser Supabase client
✅ **Atomic Tasks**: Each task does one clear thing with specific file paths
✅ **Prioritized Order**: Core flashcard loop before dashboard statistics
✅ **Figma Integration**: Explicit tasks for design extraction and implementation
✅ **MCP Tool Specification**: Clear tool usage for filesystem, supabase, and figma operations
✅ **Parallel Opportunities**: Dependencies identified for efficient development

The task list is ready for implementation following the zero-backend, client-first architecture defined in the updated constitution.