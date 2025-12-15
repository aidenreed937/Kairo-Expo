# Kairo-Expo

React Native scaffold project built with Expo SDK 52, featuring a feature-first architecture with clean architecture principles.

## Tech Stack

| Category   | Technology                                 |
| ---------- | ------------------------------------------ |
| Framework  | Expo 52 + React Native 0.76 + React 18     |
| Language   | TypeScript                                 |
| Navigation | React Navigation 7                         |
| State      | Zustand (client) + TanStack Query (server) |
| Styling    | NativeWind (Tailwind CSS)                  |
| Forms      | React Hook Form + Zod                      |
| Network    | Axios                                      |
| Storage    | MMKV                                       |
| i18n       | i18next                                    |
| Monitoring | Sentry                                     |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Android Studio / Xcode (for native builds)

### Installation

```bash
# Install dependencies
pnpm install

# Generate native projects
pnpm prebuild

# Start development server
pnpm start
```

### Running

```bash
# Android
pnpm android

# iOS
pnpm ios
```

## Project Structure

```
src/
├── app/                    # App entry, providers, navigation
│   ├── App.tsx
│   ├── bootstrap.ts
│   └── navigation/
├── core/                   # Business-agnostic infrastructure
│   ├── components/         # Reusable UI components
│   ├── config/             # Environment and app config
│   ├── error/              # Error handling
│   ├── forms/              # Zod schemas
│   ├── i18n/               # Internationalization
│   ├── network/            # HTTP client
│   ├── storage/            # Key-value storage
│   ├── theme/              # Design tokens
│   └── utils/              # Utilities
└── features/               # Feature modules
    └── <feature>/
        ├── presentation/   # Screens, components, stores
        ├── domain/         # Entities, repository interfaces
        └── data/           # DataSources, implementations
```

## Scripts

```bash
# Development
pnpm start                # Start dev server
pnpm android              # Run on Android
pnpm ios                  # Run on iOS

# Code Quality
pnpm typecheck            # TypeScript check
pnpm lint                 # ESLint
pnpm lint:fix             # ESLint with auto-fix
pnpm format               # Prettier format
pnpm format:check         # Prettier check
pnpm quality              # Run all checks

# Testing
pnpm test                 # Run tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report

# Build
pnpm prebuild             # Generate native projects
pnpm doctor               # Expo diagnostics
```

## Architecture

This project follows **Feature-First Architecture** with clean architecture layers:

- **Presentation Layer**: UI components, screens, and Zustand stores
- **Domain Layer**: Pure TypeScript entities and repository interfaces (no RN dependencies)
- **Data Layer**: Repository implementations, data sources

### Layer Dependencies

```
presentation → domain ← data
      ↓          ↑        ↓
    core ←───────┴────────┘
```

## Path Aliases

```typescript
@/*         → src/*
@app/*      → src/app/*
@core/*     → src/core/*
@features/* → src/features/*
```

## Git Workflow

- **Commit Format**: Conventional Commits (`feat|fix|docs|refactor|test|chore(scope): message`)
- **Branch Naming**: `feature/xxx`, `fix/xxx`, `hotfix/xxx`, `refactor/xxx`
- **Pre-commit**: Husky + lint-staged (auto lint & format)

## License

MIT
