# AGENTS

本文件给 Codex CLI（OpenAI）提供在本仓库内工作的约定与指引。

## 项目概览

- **项目**：Kairo-Expo（Expo SDK 52 + React Native 0.76 + React 18 + TypeScript）
- **包管理器**：`pnpm`（不要改用 npm/yarn）
- **架构**：feature-first + clean architecture（presentation / domain / data）

## 常用命令

### Dev

```bash
pnpm start
pnpm android          # expo run:android
pnpm ios              # expo run:ios
```

### Quality（提交前必跑）

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint . --ext .ts,.tsx
pnpm format:check     # prettier --check .
pnpm test             # jest
pnpm quality          # typecheck + lint + format:check + test
```

### Build

```bash
pnpm prebuild         # expo prebuild --clean（生成 android/ios）
pnpm doctor           # npx expo doctor
```

## 目录与依赖规则

```text
src/
  app/          # App 入口、providers、navigation
  core/         # 与业务无关的基础设施（network/storage/i18n/theme/utils/components 等）
  features/     # 业务模块：<feature>/{presentation,domain,data}
```

- `domain/` 必须是纯 TypeScript：**禁止**依赖 `react-native`、UI、Expo API。
- `presentation/` 可以依赖 `domain/` 与 `core/`。
- `data/` 实现 `domain/` 的接口，可使用 `core/network`、`core/storage`。
- Feature 之间不要直接互相依赖（尤其是 store / UI 组件）。

## 路径别名

`tsconfig.json` 与 `babel.config.js` 已配置：

- `@/*` → `src/*`
- `@app/*` → `src/app/*`
- `@core/*` → `src/core/*`
- `@features/*` → `src/features/*`

## 命名约定

- 目录：`kebab-case/`
- React 组件：`PascalCase.tsx`
- 非组件模块：`camelCase.ts`
- Hooks：`useXxx.ts`
- Zustand store：`use<Name>Store`
- TanStack Query：`useXxxQuery` / `useXxxMutation`
- Repository interface：`<name>Repository.ts`
- Repository impl：`<Name>RepositoryImpl.ts`
- 测试：`*.test.ts(x)`（与 `__tests__/` 结构对应）

## 新增 Feature 的骨架

```bash
mkdir -p src/features/<name>/{presentation/{screens,components,stores},domain/{entities,repositories},data/{datasources,repositories}}
```

并在 `src/app/navigation/routes.ts` 与 `src/app/navigation/RootNavigator.tsx` 注册路由。
