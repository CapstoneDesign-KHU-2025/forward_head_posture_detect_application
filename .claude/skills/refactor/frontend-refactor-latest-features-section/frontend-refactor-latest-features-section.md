---
name: frontend-refactor-latest-features-section
description: Guidelines for refactoring frontend code using the latest features of Next.js, React, TypeScript, and associated libraries to improve maintainability and performance.

---

## Latest Framework Feature Review

When refactoring frontend code, do not only clean the existing code style.
Also check whether the current project can benefit from newer features in Next.js, React, TypeScript, and the active library stack.

The goal is not to use new features just because they are new.
The goal is to improve:

- readability
- abstraction quality
- maintainability
- performance
- bundle size
- server/client responsibility separation
- developer experience

## Review Rule

Before applying a refactor, inspect whether the current implementation can be simplified or improved by newer stable features from the project stack.

Focus especially on:

- Next.js App Router patterns
- React Server Components
- Server Actions / Server Functions
- Suspense and streaming boundaries
- React form/action utilities
- optimistic UI utilities
- TypeScript type-safety improvements
- framework-native caching and data fetching patterns
- image, font, metadata, and routing improvements
- library-specific newer APIs already available in the project

## Decision Principle

Do not recommend a new feature unless it clearly improves the current code.

A feature is worth applying only when it solves at least one of these problems:

- removes unnecessary client-side state
- reduces `useEffect` usage
- reduces prop drilling
- moves server-only logic out of client components
- improves loading UX
- makes data mutation flow easier to reason about
- improves type safety
- reduces duplicated fetch/mutation logic
- improves performance without making the code harder to understand

## Next.js Refactor Guidance

Prefer Server Components by default.
Use Client Components only when the component needs:

- browser APIs
- event handlers
- local interactive state
- refs
- effects
- client-only libraries

When reviewing a component, ask:

```md
Does this component really need `use client`?
Can data fetching stay on the server?
Can the interactive part be extracted into a smaller Client Component?
```

Recommended direction:

```md
Page / Layout: Server Component
Data fetching: Server Component or server function
Interactive UI only: Client Component
Mutation: Server Action or dedicated API route depending on use case
```

Avoid turning large pages into Client Components just because one small button needs state.

## React Refactor Guidance

Prefer newer React patterns when they simplify mutation and UI feedback.

Consider:

- `useActionState` for form submission state
- `useFormStatus` for pending form UI
- `useOptimistic` for optimistic UI updates
- Suspense boundaries for loading states
- smaller Client Components around interactive islands

Use these only when they reduce custom state management.

Bad direction:

```md
Adding a new hook just because it is modern.
```

Good direction:

```md
Replacing scattered `isLoading`, `error`, and manual form state with a clearer action-based flow.
```

## TypeScript Refactor Guidance

Use TypeScript to make invalid usage hard.

During refactor, check whether types can better express intent:

- replace vague `string` values with unions when the domain is limited
- avoid unnecessary `any`
- use `satisfies` for config objects
- type API response boundaries explicitly
- use discriminated unions for UI states
- keep DTO / API / UI types separated when their responsibilities differ

Example:

```ts
type Status = "idle" | "loading" | "success" | "error";
```

Prefer meaningful types over clever types.

## Library Feature Review

When the project uses libraries such as TanStack Query, Zustand, Prisma client types, next-intl, Auth.js, Sentry, or charting libraries, check whether newer APIs or recommended patterns can simplify the code.

Review questions:

```md
Is this library being used in the current recommended way?
Is there duplicated wrapper logic that the library now supports natively?
Can error/loading/retry/cache logic be simplified?
Can type inference be improved?
Can unnecessary client code be moved to the server?
```

Do not rewrite working code only to match trends.
Recommend changes only when the benefit is clear.

## Refactor Recommendation Format

When suggesting a framework/library feature, use this format:

```md
## Suggested Modernization

### Current Problem
<what is hard to read, maintain, or optimize>

### Recommended Feature / Pattern
<Next.js / React / TypeScript / library feature>

### Why This Helps
<readability / abstraction / maintainability / performance benefit>

### Risk Level
Low / Medium / High

### Apply Now?
Yes / Not yet / Only after dependency upgrade

### Example Direction
<short code or architecture example>
```

## Strong Opinions

- New features are tools, not goals.
- Prefer stable framework-native patterns over custom abstractions.
- Do not add abstraction before the repeated pattern is clear.
- Do not move everything to the client for convenience.
- Do not use `useEffect` for work that belongs in server data fetching.
- Do not optimize performance by making the code unreadable.
- A good refactor should make the next feature easier to build.
