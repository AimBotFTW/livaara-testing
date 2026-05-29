# Contributing to Livaara

First off, thank you for considering contributing to Livaara! It's people like you that make this tool great.

## Branch Strategy
- `main` is the primary branch. It should always be deployable.
- Feature branches should be created from `main` using the format `feature/your-feature-name`.
- Bugfix branches should use the format `bugfix/your-bugfix-name`.

## Commit Conventions
We use conventional commits:
- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `style:` for code style changes (formatting, etc.).
- `refactor:` for code changes that neither fix a bug nor add a feature.
- `test:` for adding missing tests.
- `chore:` for updating build tasks, package manager configs, etc.

## Pull Request Process
1. Ensure your code follows the coding standards.
2. Update the README.md with details of changes to the interface, if applicable.
3. Submit a Pull Request targeting the `main` branch.
4. Your PR will be reviewed by maintainers. Please address any feedback promptly.

## Coding Standards
- Use TypeScript for all new code.
- Functional components with React Hooks are preferred.
- Use Tailwind CSS for styling.
- Ensure all components are responsive and accessible (we heavily use Radix UI).
- Follow the existing formatting rules (Prettier/ESLint are configured).

## Folder Organization Rules
- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components (UI components like Radix primitives go in `components/ui`).
- `lib/`: Utility functions, Supabase clients, and generic helpers.
- `hooks/`: Custom React hooks.
- `supabase/`: Database migrations and Supabase configuration.
- `public/`: Static assets.

## Environment Setup Requirements
1. Node.js 18+ (or compatible).
2. Install dependencies with `npm install` or `bun install`.
3. Set up the `.env.local` file based on `.env.example`.
4. Run `npm run dev` to start the development server.
