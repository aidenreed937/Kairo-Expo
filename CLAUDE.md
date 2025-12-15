# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kairo-Expo is a React Native scaffold project built with Expo (SDK 52) using TypeScript. It follows a feature-first architecture with clean architecture principles (presentation/domain/data layers).

## Development Commands

```bash
# Start development server
pnpm start

# Run on platforms
pnpm android          # expo run:android
pnpm ios              # expo run:ios

# Code quality (run before committing)
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint . --ext .ts,.tsx
pnpm lint:fix         # eslint --fix
pnpm format           # prettier --write .
pnpm format:check     # prettier --check .
pnpm quality          # runs typecheck + lint + format:check + test

# Testing
pnpm test             # jest
pnpm test:watch       # jest --watch
pnpm test:coverage    # jest --coverage

# Build
pnpm prebuild         # expo prebuild --clean (generates android/ios)
pnpm doctor           # npx expo doctor
```

## Architecture

### Directory Structure

```
src/
  app/                    # App entry, providers, navigation
    App.tsx               # Root component with providers
    bootstrap.ts          # App initialization
    navigation/
      routes.ts           # Route constants and ParamList types
      RootNavigator.tsx   # Navigation setup

  core/                   # Business-agnostic infrastructure
    config/               # Environment and app configuration
    error/                # AppError model, errorMapper, errorReporter
    network/              # httpClient (axios), interceptors
    storage/              # keyValueStorage (MMKV)
    i18n/                 # i18next setup, locales (en, zh)
    theme/                # Design tokens and theme
    forms/                # Zod schemas
    utils/                # logger, Result type
    components/           # Reusable UI (LoadingIndicator, ErrorView, PrimaryButton)

  features/               # Feature modules (feature-first)
    <feature>/
      presentation/       # Screens, components, Zustand stores
      domain/             # Entities, repository interfaces (pure TS, no RN deps)
      data/               # DataSources, repository implementations
```

### Layer Dependencies

- `domain/` must be pure TypeScript - no `react-native` or UI dependencies
- `presentation/` can depend on `domain/` and `core/`
- `data/` implements `domain/` interfaces, can use `core/network` and `core/storage`
- Features should not directly depend on other features' stores/components

## Path Aliases

Configured in `tsconfig.json` and `babel.config.js`:

```typescript
@/*         -> src/*
@app/*      -> src/app/*
@core/*     -> src/core/*
@features/* -> src/features/*
```

## Tech Stack

- **Framework**: Expo 52 + React Native 0.76 + React 18
- **Navigation**: React Navigation 7 (native-stack)
- **State**: Zustand (client state) + TanStack Query (server state)
- **Styling**: NativeWind (Tailwind CSS)
- **Forms**: React Hook Form + Zod
- **Network**: axios
- **Storage**: MMKV
- **i18n**: i18next + react-i18next
- **Monitoring**: Sentry

## Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Directories | `kebab-case` | `user-profile/` |
| React components | `PascalCase.tsx` | `UserProfileScreen.tsx` |
| Non-component modules | `camelCase.ts` | `httpClient.ts` |
| Hooks | `useXxx.ts` | `useCounterStore.ts` |
| Zustand stores | `use<Name>Store` | `useCounterStore` |
| TanStack Query | `useXxxQuery`, `useXxxMutation` | `useUserQuery` |
| Repository interface | `<name>Repository.ts` | `counterRepository.ts` |
| Repository impl | `<Name>RepositoryImpl.ts` | `CounterRepositoryImpl.ts` |
| Tests | `*.test.ts(x)` | `CounterScreen.test.tsx` |

## Git Workflow

- Use Conventional Commits: `feat|fix|docs|style|refactor|test|chore(scope): message`
- Branch naming: `feature/xxx`, `fix/xxx`, `hotfix/xxx`, `refactor/xxx`
- Always run `pnpm quality` before committing
- Pre-commit hooks configured via husky + lint-staged

## Creating New Features

Use the three-layer structure:

```bash
mkdir -p src/features/<name>/{presentation/{screens,components,stores},domain/{entities,repositories},data/{datasources,repositories}}
```

Then register routes in `src/app/navigation/routes.ts` and `RootNavigator.tsx`.

See `.claude/skills/feature-generator/SKILL.md` for detailed templates.

## Testing

- Jest with `jest-expo` preset
- `@testing-library/react-native` for component testing
- Coverage threshold: 70% (branches, functions, lines, statements)
- Tests mirror source structure in `__tests__/`
