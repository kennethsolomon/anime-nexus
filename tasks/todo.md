# Fix Duplicate Episode Notifications

## Goal

Prevent duplicate notifications for the same episodes. Currently, the `CheckNewEpisodes` job creates multiple notifications for the same anime/episode because the dedup logic only checks for unread notifications and is vulnerable to race conditions.

## Constraints

- Follow existing conventions: strict types, final classes, Actions pattern
- All existing tests must continue to pass
- No breaking changes to the notification frontend
- Dedup must survive: race conditions, read-then-re-notify, multiple sessions

---

## Plan

TBD — pending brainstorm

## Acceptance Criteria

1. A user never receives more than one notification for the same episode count
2. Reading a notification does not cause re-notification for the same episodes
3. Multiple concurrent job runs do not create duplicates
4. Existing notification features (bell, mark read, mark all read) still work
5. All tests pass with 100% coverage on new code
