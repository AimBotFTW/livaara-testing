# Contributing to Livaara

We welcome contributions to the Livaara codebase. Please adhere to the following guidelines to maintain code quality and ensure a smooth review process.

## Branch Strategy
- `main` is the production-ready branch.
- Create feature branches from `main` using the format `feature/your-feature-name` or `fix/your-bug-fix`.

## Commit Conventions
Follow conventional commits to ensure a clear history:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `chore:` for routine tasks, dependency updates, or formatting
- `refactor:` for code refactoring without changing behavior

## Pull Request Process
1. Ensure your code passes all linting and type-checking (`npm run lint` and `npm run build`).
2. Write a clear, descriptive PR title and description.
3. Reference any related issues or tickets.
4. Request a review from at least one core team member.
5. Once approved, the PR will be squash-merged into `main`.

## Coding Standards
- **TypeScript:** Use strict typing. Avoid `any`.
- **Components:** Use functional components and Radix UI primitives where applicable. Follow the existing Tailwind CSS aesthetic.
- **State:** Prefer server-side data fetching where possible. Use React Context for global client state (e.g., Cart).
- **Formatting:** Code must be formatted with Prettier (`npm run format`).

## Folder Organization Rules
- `app/api/*`: strictly for serverless API endpoints.
- `app/admin/*`: admin-only pages protected by middleware.
- `components/ui/*`: shared UI components.
- `lib/*`: utility functions, helpers, and types.
- `supabase/migrations/*`: database schema changes. Do not alter existing migrations; always create a new migration file.

## Environment Setup Requirements
- Copy `.env.example` to `.env.local` and obtain the necessary keys from your team lead.
- Do not commit `.env.local` or any real API keys to the repository.
