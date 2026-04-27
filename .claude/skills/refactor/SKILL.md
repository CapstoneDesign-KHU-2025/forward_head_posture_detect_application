---
name: refactor
description: Use when refactoring existing code without changing behavior. Use for improving readability, structure, naming, duplication, separation of concerns, and maintainability.
---

# Refactor Skill

## Goal

Improve code quality without changing existing behavior.

## When to use

Use this skill when the task involves:

- cleaning messy code
- separating UI and business logic
- extracting reusable components
- extracting hooks or utilities
- reducing duplication
- improving naming
- simplifying complex functions
- improving folder structure
- improving readability 
- improving performance without changing behavior

## Core rules

- Do not change behavior unless explicitly requested.
- Make the smallest safe refactor first.
- Preserve public APIs unless there is a clear reason to change them.
- Prefer readability over clever abstraction.
- Avoid premature abstraction.
- Keep UI, business logic, data fetching, and validation separated.
- Keep server-only logic out of client components.
- Keep side effects isolated.
- Do not refactor unrelated files.

## Workflow

1. Understand the current behavior.
2. Identify code smells:
   - duplicated logic
   - long function
   - unclear naming
   - mixed responsibilities
   - deeply nested conditions
   - repeated JSX
   - unstable props or effects
   - business logic inside UI
3. Decide the safest refactor type:`
   - rename
   - extract function
   - extract component
   - extract hook
   - move server logic
   - simplify condition
   - split file
4. Refactor in small steps.
5. Ensure behavior stays the same.
6. Run relevant checks if available:
   - `npm test`

## React / Next.js refactor rules

- Extract components when JSX becomes hard to scan.
- Extract hooks only when stateful logic is reused or too complex.
- Extract utility functions for pure logic.
- Prefer Server Components unless interactivity is required.
- Use Client Components only for hooks, events, browser APIs, or interactive state.
- Avoid passing unnecessary props through many layers.
- Avoid putting database/API logic inside UI components.

## Output style

- Show the refactored code first.
- List what changed.
- Mention behavior that was intentionally preserved.
- Mention any risk if the refactor could affect behavior.
- Always add Korean desccription after the English explanation.