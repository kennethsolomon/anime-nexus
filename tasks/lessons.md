# Lessons Learned

<!-- Append corrections here so Claude doesn't repeat mistakes. -->
<!-- Format:
### [YYYY-MM-DD] Brief title
**Mistake:** What went wrong
**Root cause:** Why it happened
**Prevention:** What to do differently
-->

### [2026-03-15] Skipped mandatory CLAUDE.md workflow steps
**Mistake:** Went from brainstorm straight to execute-plan, skipping Design confirmation, Branch creation (did it late), /laravel-lint, /laravel-test, /security-check, /review. Never created or maintained tasks/workflow-status.md tracker.
**Root cause:** Treated the workflow as a guideline rather than a strict requirement. Prioritized speed over process compliance.
**Prevention:** Always create tasks/workflow-status.md at the start of every task. Follow every step in order — never skip without explicit user confirmation. Never auto-advance. The workflow in CLAUDE.md is mandatory, not optional. Each step must complete before the next begins.

### [2026-03-15] Did not verify test coverage — assumed passing tests = 100%
**Mistake:** Ran `./vendor/bin/pest` without `--coverage` flag and reported "all tests pass" as if that meant coverage was sufficient. Actual coverage was 69.7% — many new files (CommentController, NotificationController, StreamController, Policies) had 0% coverage.
**Root cause:** Confused "all tests pass" with "all code is tested." Never ran the coverage report to verify.
**Prevention:** Always run `./vendor/bin/pest --coverage` during `/laravel-test`. CLAUDE.md requires 100% coverage. Check the coverage percentage explicitly before reporting success. Write tests for every new file — controllers, jobs, policies, form requests, models — not just the happy path.
