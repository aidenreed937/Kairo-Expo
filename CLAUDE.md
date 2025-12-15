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

# Build & Diagnostics
pnpm prebuild         # expo prebuild --clean (generates android/ios)
npx expo-doctor       # Expo SDK compatibility check
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

| Type                  | Format                          | Example                    |
| --------------------- | ------------------------------- | -------------------------- |
| Directories           | `kebab-case`                    | `user-profile/`            |
| React components      | `PascalCase.tsx`                | `UserProfileScreen.tsx`    |
| Non-component modules | `camelCase.ts`                  | `httpClient.ts`            |
| Hooks                 | `useXxx.ts`                     | `useCounterStore.ts`       |
| Zustand stores        | `use<Name>Store`                | `useCounterStore`          |
| TanStack Query        | `useXxxQuery`, `useXxxMutation` | `useUserQuery`             |
| Repository interface  | `<name>Repository.ts`           | `counterRepository.ts`     |
| Repository impl       | `<Name>RepositoryImpl.ts`       | `CounterRepositoryImpl.ts` |
| Tests                 | `*.test.ts(x)`                  | `CounterScreen.test.tsx`   |

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
- pnpm-compatible `transformIgnorePatterns` configured in `jest.config.js`

## ESLint Configuration

- Uses ESLint 9 flat config format (`eslint.config.mjs`)
- TypeScript-ESLint for type-aware linting
- React and React Hooks plugins
- Prettier integration via `eslint-config-prettier`

## Babel Configuration

Important notes for `babel.config.js`:

- **Preset order matters**: `nativewind/babel` must come BEFORE `babel-preset-expo`
- **Don't pass unsupported options**: Presets should be simple strings, not `['preset', { plugins: [...] }]`
- Common error `.plugins is not a valid Plugin property` means a preset received unsupported options

```javascript
// ✅ Correct
presets: ['nativewind/babel', 'babel-preset-expo'],
plugins: [['module-resolver', { ... }]]

// ❌ Wrong - passing plugins option to preset
presets: [['nativewind/babel', { plugins: [...] }]]
```

## Troubleshooting Common Plugin Errors

### 1. "Cannot find module 'xxx/plugin'" in Jest/CI

**Symptoms**: Tests pass locally but fail in CI with errors like `Cannot find module 'react-native-worklets/plugin'`

**Causes**:

- Dependency resolution differs between local and CI environments
- pnpm store caching includes transitive dependencies not in lockfile
- Native module plugins have different resolution in test environment

**Solutions**:

1. Add a Jest mock for the missing module:
   ```bash
   mkdir -p __mocks__/<package-name>
   echo "module.exports = function () { return {}; };" > __mocks__/<package-name>/plugin.js
   ```
2. Add to `jest.config.js` moduleNameMapper:
   ```javascript
   moduleNameMapper: {
     '<package-name>/plugin': '<rootDir>/__mocks__/<package-name>/plugin.js',
   }
   ```
3. If it's a real dependency, install it: `pnpm add <package-name>`

### 2. ".plugins is not a valid Plugin property"

**Cause**: Passing unsupported options to a Babel preset (see Babel Configuration above)

**Solution**: Ensure presets are simple strings, not arrays with options

### 3. Jest transformIgnorePatterns for pnpm

**Issue**: pnpm uses `.pnpm/package@version/node_modules/package` structure

**Solution**: Use pattern that handles both regular and pnpm paths:

```javascript
transformIgnorePatterns: [
  '<rootDir>/node_modules/(?!(?:.pnpm/)?(?:react-native|@react-native|expo|...))',
];
```

### 4. General Plugin Debugging Steps

1. **Check local vs CI difference**: Compare node_modules structure
2. **Verify lockfile**: Ensure `pnpm-lock.yaml` is committed and up-to-date
3. **Clear caches**: `pnpm store prune && rm -rf node_modules && pnpm install`
4. **Check transitive dependencies**: `pnpm why <package-name>`
5. **Review babel.config.js**: Ensure correct preset/plugin order
6. **Add mocks for test-only issues**: Use `__mocks__/` directory for Jest
