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
    assets/               # Static assets (images, fonts)
    components/           # Reusable UI (LoadingIndicator, ErrorView, PrimaryButton)
    config/               # Environment and app configuration
    error/                # AppError model, errorMapper, errorReporter
    forms/                # Zod schemas
    i18n/                 # i18next setup, locales (en, zh)
    network/              # httpClient (axios), interceptors
    permissions/          # Permission handling utilities
    storage/              # keyValueStorage (MMKV)
    styling/              # Style utilities
    theme/                # Design tokens and theme
    utils/                # logger, Result type

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

## Patches & Compatibility

This project uses `pnpm patch` to fix compatibility issues with Expo 52 (RN 0.76) and Reanimated 3.

| Patch File                                 | Target Package               | Reason                                                                                                                            |
| :----------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `react-native-nitro-modules@0.31.10.patch` | `react-native-nitro-modules` | Fixes `ReactModuleInfo` constructor signature mismatch in Android native code for RN 0.76+ (New Architecture).                    |
| `react-native-css-interop.patch`           | `react-native-css-interop`   | Removes invalid reference to `react-native-worklets/plugin` in Babel config, which is only available in Reanimated 4 (we use v3). |

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
- Coverage threshold: 100% (branches, functions, lines, statements)
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

### 1. "Cannot find module 'react-native-worklets/plugin'"

**Symptoms**: Tests or builds fail with `Cannot find module 'react-native-worklets/plugin'`, especially when using NativeWind v4 with Reanimated 3.

**Cause**: `react-native-css-interop` (used by NativeWind) may incorrectly reference `react-native-worklets/plugin` (a Reanimated 4 feature) even when running on Reanimated 3.

**Solution**:
Do NOT install `react-native-worklets-core` if you are on Reanimated 3. Instead, patch `react-native-css-interop` to remove the invalid plugin reference.

1. Create a patch:
   ```bash
   pnpm patch react-native-css-interop
   ```
2. Edit the `babel.js` file in the temporary directory to comment out or remove `"react-native-worklets/plugin"`.
3. Commit the patch:
   ```bash
   pnpm patch-commit <path-to-temp-dir>
   ```

### 2. "Cannot find module 'xxx/plugin'" (General)

**Symptoms**: CI fails with missing plugin errors while local tests pass.

**Causes**:

- Dependency resolution differences.
- Transitive dependencies missing from lockfile.

**Solutions**:

- **Babel plugin errors**: Install the package directly if it's a legitimate dependency.
- **Jest runtime errors**: Use `moduleNameMapper` in `jest.config.js` to mock the module.

### 3. ".plugins is not a valid Plugin property"

**Cause**: Passing unsupported options to a Babel preset.

**Solution**: Ensure presets in `babel.config.js` are simple strings or arrays where the second element is a valid options object supported by that specific preset.

```javascript
// ✅ Correct
presets: ['nativewind/babel', 'babel-preset-expo'],

// ❌ Wrong (if the preset doesn't support a 'plugins' option)
presets: [['nativewind/babel', { plugins: [...] }]]
```

### 4. Jest transformIgnorePatterns for pnpm

**Issue**: Jest fails to transform modules within `node_modules` because pnpm uses a nested structure (`.pnpm/package@version/node_modules/package`).

**Solution**: Update `transformIgnorePatterns` in `jest.config.js` to match pnpm paths:

```javascript
transformIgnorePatterns: [
  '<rootDir>/node_modules/(?!(?:.pnpm/)?(?:react-native|@react-native|expo|...))',
];
```

### 5. Native Module Compatibility (New Architecture)

**Issue**: Build fails with native module errors (e.g., `ReactModuleInfo` constructor mismatch) when `newArchEnabled` is true.

**Solution**:

- Check if the library has a newer version supporting RN 0.76+.
- If not, use `patch-package` (or `pnpm patch`) to fix the native code (Java/Kotlin/ObjC/Swift) locally.
- Example: `react-native-nitro-modules` may need a patch for `NitroModulesPackage.kt` to match the new `ReactModuleInfo` signature.

### 6. White Screen / Layout Collapse with NativeWind

**Symptoms**: The app launches without errors, but the screen is completely white or empty. No UI elements are visible, or layout styles (like `flex-1`) seem to be ignored.

**Cause**: NativeWind configuration in `metro.config.js` points to an incorrect or non-existent CSS entry file. If NativeWind cannot find the input file, it fails to generate styles, causing layout collapse (height/width = 0).

**Solution**:

1. Ensure `metro.config.js` points to the correct CSS file location:

   ```javascript
   // ❌ Wrong (if file is in src/app)
   input: './global.css';

   // ✅ Correct
   input: './src/app/global.css';
   ```

2. **Crucial**: Clear Metro cache after changing the config:
   ```bash
   npx expo start -c
   ```
