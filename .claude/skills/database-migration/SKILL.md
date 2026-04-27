---
name: database-migration
description: Use when creating, reviewing, or modifying database migrations. Focus on safe schema evolution, especially for production-like applications where data loss, broken relations, or unexpected downtime must be avoided.
---

# Database Migration Skill

## Purpose

Use this skill when creating, reviewing, or modifying database migrations.

This skill focuses on safe PostgreSQL schema evolution, especially for production-like applications where data loss, broken relations, or unexpected downtime must be avoided.

## Core Philosophy

A database migration is not just a schema change.
It is a controlled transition from one valid data model to another.

Good migrations should be:

- Safe
- Reversible when possible
- Incremental
- Easy to review
- Compatible with existing data
- Clear about risk

The database protects the truth.
Migration code must protect the transition.

## When To Use This Skill

Use this skill when:

- Adding, removing, or renaming tables
- Adding, removing, or renaming columns
- Changing column types
- Adding constraints
- Adding indexes
- Changing relations
- Introducing soft delete
- Refactoring many-to-many or one-to-many relationships
- Backfilling existing data
- Reviewing Prisma, SQL, or PostgreSQL migration files

## Migration Principles

### 1. Never assume the database is empty

Always design migrations for existing data.

Bad assumption:

```sql
ALTER TABLE users ADD COLUMN name TEXT NOT NULL;
```

Better approach:

```sql
ALTER TABLE users ADD COLUMN name TEXT;
-- backfill existing rows
UPDATE users SET name = 'Unknown' WHERE name IS NULL;
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
```

### 2. Prefer expand → backfill → contract

For risky changes, avoid doing everything in one migration.

Use this pattern:

Expand: add the new structure
Backfill: copy or transform existing data
Switch: update application code to use the new structure
Contract: remove old structure later

Example:

Instead of renaming a column directly:

1. Add new column
2. Backfill from old column
3. Update app code to read/write new column
4. Remove old column in a later migration

3. Avoid destructive changes in the same migration

Do not immediately drop columns, tables, or constraints unless clearly safe.

Before dropping anything, check:

Is the application still reading this field?
Is old data still needed?
Is rollback possible?
Is there a backup?
Is this column used in analytics, admin tools, or background jobs?
4. Constraints should be added carefully

Database constraints are good, but adding them to existing data can fail.

Before adding:

NOT NULL
UNIQUE
CHECK
FOREIGN KEY

First verify or clean existing data.

Recommended flow:

```sql
-- 1. Add nullable column
ALTER TABLE table_name ADD COLUMN new_column TEXT;

-- 2. Backfill
UPDATE table_name SET new_column = 'default' WHERE new_column IS NULL;

-- 3. Add constraint
ALTER TABLE table_name ALTER COLUMN new_column SET NOT NULL;
```

5. Indexes should match real query patterns

Do not add indexes just because a column exists.

Add indexes when the column is commonly used in:

WHERE
JOIN
ORDER BY
pagination
uniqueness checks
frequent lookups

Prefer compound indexes when queries filter and sort together.

Example:

```sql
CREATE INDEX idx_measurements_user_created_at
ON measurements (user_id, created_at DESC);
``` 
6. Be careful with unique constraints and soft delete

If soft delete is used with deleted_at, normal unique constraints may block recreated records.

Bad:
```sql
CREATE UNIQUE INDEX users_email_unique ON users(email);
``` 

Better for soft delete:
```sql  
CREATE UNIQUE INDEX users_email_unique ON users(email) WHERE deleted_at IS NULL;
```

7. Foreign keys should describe real ownership

Use ON DELETE behavior intentionally.

Ask:

Should child rows be deleted with the parent?
Should deletion be blocked?
Should the foreign key become null?
Should soft delete be used instead?

Example:
```sql
-- Strong ownership
ON DELETE CASCADE

-- Preserve history
ON DELETE RESTRICT

-- Optional relationship
ON DELETE SET NULL
```     
Do not use cascade delete casually.

8. Raw data and derived data should migrate separately

For analytics-heavy systems, raw data should be preserved.

Do not overwrite raw measurement/event data just to fit a new summary model.

Prefer:

keep raw event/sample table
add new summary table
backfill summaries from raw data
validate summary results before switching reads
9. Naming must make intent obvious

Use clear, consistent names.

Recommended:

Table names:
- users
- posture_sessions
- posture_samples
- posture_summaries

Column names:
- user_id
- session_id
- created_at
- updated_at
- deleted_at
- measured_at
- status
- source

Index names:
- idx_table_column
- idx_table_column_column
- table_column_unique


Avoid:
data
info
temp
new_value
old_value
list
mapping

Unless the name has strong domain meaning.

10. Every migration should be reviewable

A migration should clearly answer:

What changed?
Why is it needed?
Is existing data safe?
Is rollback possible?
Does app code need to change before or after this?
Could this lock a large table?
Are indexes and constraints necessary?
PostgreSQL-Specific Guidance
Prefer timestamptz for time

Use timezone-aware timestamps.

Recommended:
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Avoid storing local time without timezone unless there is a strong reason.

Prefer explicit defaults

Good:

```sql
status TEXT NOT NULL DEFAULT 'active'
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Use CHECK constraints for simple domain rules

Example:
```sql
ALTER TABLE posture_samples
ADD CONSTRAINT posture_angle_range
CHECK (neck_angle >= 0 AND neck_angle <= 180);
```

Use enums carefully

PostgreSQL enums are useful, but harder to change later.

Prefer TEXT + CHECK when status values may evolve often.

Example:
```sql
status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'deleted'))
```

Avoid large table locks when possible

For large tables:

avoid adding heavy constraints immediately
avoid long-running updates in one transaction
consider batching backfills
consider adding indexes concurrently where supported

Example:
```sql
CREATE INDEX CONCURRENTLY idx_events_user_id_created_at
ON events(user_id, created_at DESC);
```
Note: CREATE INDEX CONCURRENTLY cannot run inside a normal transaction block.

Prisma Migration Guidance

When using Prisma:

Always inspect generated SQL before applying it
Do not blindly trust prisma migrate dev
Be careful when Prisma wants to drop and recreate columns
Prefer manual migration edits for risky changes
Use prisma migrate dev for local development
Use prisma migrate deploy for production

Before applying migration, check:
```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

Migration Review Checklist

Before approving a migration, verify:

[ ] Does this migration preserve existing data?
[ ] Does it avoid unnecessary destructive changes?
[ ] Are nullable / non-nullable changes handled safely?
[ ] Are defaults added intentionally?
[ ] Are constraints valid for current data?
[ ] Are foreign key delete behaviors intentional?
[ ] Are indexes based on real query patterns?
[ ] Are soft-delete rules considered?
[ ] Is the migration compatible with the current application version?
[ ] Is a rollback or recovery plan possible?
[ ] Is the naming clear and domain-specific?

Output Style

When helping with migration work:

Show the corrected migration or schema first.
Then explain only the important risks.
Use concrete SQL or Prisma examples.
Avoid vague advice.
Mention whether the change is safe, risky, or requires staged deployment.

Response Format

Use this format:

## Recommended Migration

<code>

## Why

<short explanation>

## Risk Level

Safe / Medium / Risky

## Notes

<any important warnings>


Strong Opinions
Do not treat migrations as simple file generation.
Do not drop data unless the user explicitly confirms it is safe.
Do not add constraints without thinking about existing data.
Do not use cascade delete unless ownership is obvious.
Do not design schema only for the current UI screen.
Do not hide business rules only in backend code when the database can enforce them.
Good migration work should make future mistakes harder.