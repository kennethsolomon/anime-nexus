# Contributing

Thanks for your interest in contributing to Anime Nexus.

## Development Setup

1. Fork and clone the repository
2. Follow the [Setup](#setup) instructions in the README
3. Create a feature branch: `git checkout -b feat/your-feature`

## Code Standards

- **PHP**: PSR-12 via Laravel Pint. PHPStan level 9 must pass.
- **TypeScript**: Strict mode, no `any` types.
- **Architecture**: Business logic goes in `app/Actions/`, not controllers.
- **Validation**: Always use Form Requests.

Run quality checks before committing:

```bash
vendor/bin/pint --dirty
vendor/bin/phpstan analyse
vendor/bin/rector --dry-run
./vendor/bin/pest
npx tsc --noEmit
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add password reset flow
fix(player): resolve HLS buffering on Safari
refactor(actions): extract caching logic to trait
```

## Pull Requests

- Keep PRs focused on a single change
- Include tests for new features and bug fixes
- Update documentation if behavior changes
- All CI checks must pass
