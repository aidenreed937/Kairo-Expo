# React Native 通用脚手架设计方案（非业务）

> 目标：为团队提供一套可复用的 React Native 项目基础骨架与脚手架命令规范，聚焦基础设施与工程实践，而非具体业务。
>
> 最后更新：2025-12-14（依赖版本来自 npm registry 查询结果；版本会持续演进，以模板的 `package.json` + lockfile 为准）

## 1. 设计目标

- 非业务化：只提供工程层面的约定（目录、状态管理、网络、路由、配置、国际化、监控等），不耦合任何业务领域模型。
- 一致性：不同项目/仓库按照统一模板与命名规范，降低迁移与协作成本。
- 可扩展：通过「feature-first + 分层」结构，以及脚手架命令生成代码，支持项目演进。
- 易测试：鼓励分层、依赖倒置、接口抽象，便于单元测试与端到端测试（E2E）。
- 多环境：支持多环境（dev/staging/prod）与多平台（iOS/Android）的配置切换。
- 可插拔：核心架构与选型尽量模块化，可替换状态管理、路由、网络、存储实现。

## 2. 技术与工具选型（可替换，但脚手架默认如此）

> 本文档的“推荐默认组合”是：Expo（Prebuild / CNG） + New Architecture + Greenfield。
>
> 说明：
>
> - 目录分层与工程约定（`src/app`、`src/core`、`src/features`）在 Expo/Bare RN 下都可保持一致。
> - 构建与环境切换属于“模式维度”，应在 `comet.yaml` 中固化，避免不同项目各自发挥。

- React Native：若使用 Expo，优先跟随 Expo SDK 锁定的 React/RN 版本；若 Bare RN，可按模板锁定并按发布节奏升级。
- 语言：TypeScript（默认开启较严格的 `tsconfig`）。
- 包管理：pnpm / yarn / npm（三选一，脚手架建议在 `comet.yaml` 固化，并在 CI 统一）。
  - 推荐策略：**统一一种并写入模板**，以 lockfile 作为唯一真相源（CI 与本地必须一致；Expo/EAS 也通常会基于 lockfile 选择包管理器）。
  - 默认推荐：`pnpm`（更快、更省磁盘，workspace/monorepo 体验更好；建议配合 `corepack` 固定 pnpm 版本）。
    - 兼容性兜底：少量旧库/脚本依赖“扁平 node_modules”时，优先通过 `.npmrc` 的 hoist 规则局部兜底；必要时再用 `shamefully-hoist=true`（不建议长期默认开启）。
    - Monorepo 约定：若使用 workspace/monorepo，通常需要相应调整 `metro.config.js`（如 `watchFolders`/resolver）以兼容多包与符号链接解析。
  - 更保守的选择：`yarn`（仅 Yarn Classic / node-modules 模式）或 `npm`。
    - **不建议使用 Yarn PnP（v2+ 的 Plug'n'Play）**：在 RN/Metro/原生模块场景下更容易遇到兼容性问题与排障成本。
- 导航：React Navigation（Stack/Tabs/Drawer 按需启用）。
- 状态管理：
  - 服务端状态（请求缓存、重试、失效）：TanStack Query（推荐）。
  - 客户端本地状态（UI/会话/轻量业务状态）：Zustand（推荐），脚手架保留接口以便替换为 Redux Toolkit / MobX / Jotai 等。
- 样式方案（推荐二选一，脚手架可配置）：
  - Utility-first：NativeWind（Tailwind CSS 风格，迭代效率高）。
  - 类型安全主题系统：Unistyles（或 Restyle 等同类方案）。
- 网络请求：`fetch` 封装或 `axios`（脚手架默认 axios + 拦截器 + 错误映射）。
- 表单与校验（推荐）：React Hook Form + Zod（Schema 可复用、性能好、业务高频场景开箱即用）。
- 权限管理（推荐封装）：统一封装 `core/permissions`，底层可选 `react-native-permissions`（Bare RN/Prebuild）或 Expo 各模块权限能力（以项目需要为准）。
- 本地存储：
  - 简单配置/flag：MMKV（推荐，配合 TypedStorage/JSON 封装）。
  - 高性能 KV：MMKV（推荐用于频繁读写、启动期读取）。
  - 敏感信息：Keychain/Keystore（可通过社区库封装；脚手架只提供抽象接口与示例实现）。
- 国际化：`i18next` + `react-i18next`（或 FormatJS，按需替换）。
- 监控与错误上报：Sentry（或其他平台，脚手架只依赖抽象接口）。
- 代码规范：ESLint 9（flat config） + Prettier + TypeScript（`tsc --noEmit`）。
- Babel 配置：
  - 预设顺序：`nativewind/babel` 必须在 `babel-preset-expo` **之前**
  - 不要给预设传递不支持的选项（如 `{ plugins: [...] }`）
  - 错误 `.plugins is not a valid Plugin property` 表示预设配置格式错误
- 测试：
  - 单元/组件：Jest + `@testing-library/react-native`
  - pnpm 兼容：需配置 `transformIgnorePatterns` 处理 `.pnpm` 目录结构
  - E2E：Detox（可选，按团队落地成本启用）

### 2.0 模式维度选择建议（推荐默认）

| 模式维度 | 推荐选择               | 理由                                                                                                                                                                                                                          | 何时改选/注意点                                                                                                                                                      |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 构建工具 | Expo（Prebuild / CNG） | 兼顾“自动化原生配置”和“可写原生代码”：默认用 JS/TS 迭代，遇到原生需求可通过 Prebuild 生成 `android/`、`ios/`，并用 Config Plugin 注入 Gradle/Info.plist/原生代码改动；如果你熟悉 Kotlin，这条路线能较低成本做原生扩展与调试。 | 若项目需要深度定制原生构建链路（大量手改 Gradle/Xcode、复杂私有 SDK、强约束企业构建系统），或团队不愿维护 Config Plugin，则考虑直接 Bare RN（纯 React Native CLI）。 |
| 底层架构 | New Architecture       | React Native 新架构（JSI/TurboModules/Fabric）已是主流方向；对“交易类应用”的高频列表、复杂图表与交互来说，更低的跨端开销与更稳定的渲染/交互链路更有利。并且在较新的 RN 版本中，新架构已默认开启，甚至逐步走向“仅新架构”。     | 关注三方库兼容性：少量旧库可能仍依赖旧架构或有适配问题；模板应在升级 RN 前做一次依赖审计与灰度验证。                                                                 |
| 集成方式 | Greenfield（全量 RN）  | 若没有既存的庞大原生代码库，全量 RN 交付能避免混合开发的路由栈/生命周期/资源与构建系统的复杂度，减少“边界层”问题（线程、桥接、调试、升级风险）。                                                                              | 若你已有成熟原生 App 且必须渐进迁移，则选择 Brownfield（RN 作为模块嵌入）；但需额外投入解决：双路由栈、资源与权限统一、原生/JS 依赖管理、发版与热更新策略等。        |

这些选择在脚手架中应固化为 `comet.yaml` 的 `build_tool` / `architecture` / `integration` 三个字段，并驱动模板分支与生成逻辑（而不是写死在文档里靠人记忆）。

### 2.1 依赖版本与兼容性建议（截至 2025-12-14）

以下版本来自 `npm view <pkg> version` 查询结果（稳定版），用于“了解当下生态版本分布”。实际项目以模板锁定版本为准。

特别注意：

- Expo 项目不建议随意将 `react`/`react-native` 升到 npm 最新：应以 Expo SDK 约束为准（SDK 升级时整体迁移）。
- Bare RN 项目可更自由升级，但需配合原生构建、三方库与新架构兼容性一起验证。

- React & RN：
  - `react: 19.2.3`
  - `react-native: 0.83.0`
- 导航（React Navigation 7）：
  - `@react-navigation/native: 7.1.25`
  - `@react-navigation/native-stack: 7.8.6`
  - `react-native-screens: 4.18.0`
  - `react-native-safe-area-context: 5.6.2`
- 状态与请求：
  - `zustand: 5.0.9`
  - `@tanstack/react-query: 5.90.12`
- 网络与存储：
  - `axios: 1.13.2`
  - `react-native-mmkv: 4.1.0`
  - `react-native-config: 1.6.1`（可选：Bare RN 或团队希望统一 `.env.*` 方案时使用）
- 国际化与监控：
  - `i18next: 25.7.2`
  - `react-i18next: 16.5.0`
  - `@sentry/react-native: 7.7.0`
- 测试：
  - `jest: 30.2.0`
  - `@testing-library/react-native: 13.3.3`
  - `detox: 20.46.0`

示例 `package.json` 片段（示意，版本以模板为准）：

```json
{
  "dependencies": {
    "react": "19.2.3",
    "react-native": "0.83.0",
    "@react-navigation/native": "7.1.25",
    "@react-navigation/native-stack": "7.8.6",
    "@tanstack/react-query": "5.90.12",
    "zustand": "5.0.9",
    "axios": "1.13.2",
    "react-native-mmkv": "4.1.0",
    "react-native-config": "1.6.1",
    "i18next": "25.7.2",
    "react-i18next": "16.5.0",
    "@sentry/react-native": "7.7.0"
  }
}
```

说明：

- 不建议在“文档”里长期硬编码版本作为权威来源：模板仓库应以 `package.json` + lockfile（`pnpm-lock.yaml`/`yarn.lock`/`package-lock.json`）为唯一真相源。
- 建议定期运行：
  - Bare RN：`npx react-native doctor`
  - Expo：`npx expo doctor`
  - 依赖检查：`npm outdated`（或 pnpm/yarn 对应命令）
    并在确认 iOS/Android 构建与 E2E 通过后再升级。

## 3. 目录结构设计（项目骨架）

### 3.1 顶层目录（Expo Prebuild / Bare RN）

```text
project_root/
  app.json or app.config.ts
  android/
  ios/
  src/
  assets/
  __tests__/
  .vscode/ or .idea/
  babel.config.js
  metro.config.js
  tsconfig.json
  package.json
  comet.yaml              # 脚手架配置（工程约定）
  README.md
```

说明：

- `comet.yaml`：脚手架工具自己的配置文件，用于记录状态管理类型、路由实现、是否启用某些模块等。
- 若采用 Expo（Prebuild），`android/`、`ios/` 通常由 `expo prebuild` 生成并由 Config Plugin 驱动“可复现的原生改动”；原则上避免直接手改生成产物而不回写到 config/plugin。
- Expo Prebuild 是否提交 `android/`、`ios/`：
  - 若需要稳定承载自定义原生代码（例如 Kotlin 扩展模块）并希望原生改动可审查，可选择提交；但仍应以 Config Plugin 为主、避免“手改后忘记同步”。
  - 若希望保持纯 CNG（不提交生成产物），需确保 CI/本地能稳定复现 prebuild，并将所有原生改动沉淀到 plugin/config。
- 无论 Expo 还是 Bare RN，原生工程（`android/`、`ios/`）都需要统一约定：多环境（flavor/scheme）、签名、权限、原生依赖与构建脚本。

### 3.2 src 目录结构（核心）

```text
src/
  app/
    App.tsx               # 根组件：Provider 注入、NavigationContainer、全局兜底 UI
    bootstrap.ts          # 引导应用：环境初始化、日志/监控初始化等
    di.ts                 # 可选：跨 feature 的核心依赖收口（尽量轻量）
    navigation/
      routes.ts           # 路由常量/类型（ParamList）
      RootNavigator.tsx   # Root Navigator（Stack/Tabs 汇总）

  core/                   # 无业务的基础设施与通用模块
    config/
      env.ts              # Env 抽象（dev/staging/prod）
      appConfig.ts        # 汇总读取 Env / build-time config

    error/
      appError.ts         # 域无关错误模型
      errorMapper.ts      # 将异常/SDK error 映射为 AppError
      errorReporter.ts    # 上报与记录（Sentry 等）

    forms/                # 表单与校验（可选，但强烈建议脚手架内置）
      formTypes.ts        # 通用类型与封装（例如 FieldError 映射）
      zodSchemas.ts       # 可复用的 Schema（按需拆 namespace）

    network/
      httpClient.ts       # axios/fetch 封装
      interceptors/
        authInterceptor.ts
        loggingInterceptor.ts

    permissions/          # 权限封装（可选，但建议统一收口）
      permissions.ts      # 权限类型与平台映射
      usePermission.ts    # 请求/拒绝/引导设置页的统一流程

    storage/
      keyValueStorage.ts        # MMKV 抽象
      secureStorage.ts          # Keychain/Keystore 抽象（可选）

    theme/
      tokens.ts           # 设计 token（颜色/间距/字号）
      theme.ts            # Theme 对象与 hooks

    styling/              # 样式引擎适配层（可选：nativewind/unistyles/restyle/stylesheet）
      styling.ts          # 对外统一导出（className / style helpers）

    i18n/
      i18n.ts             # i18next 初始化与导出

    utils/
      logger.ts
      result.ts           # 通用 Result 类型（Ok/Err）
      extensions/
        stringExtensions.ts

    assets/               # 资源相关配置（可选）
      svg.ts              # SVG 导入/包装约定（配合 transformer）

    components/           # 无业务的可复用 UI 组件
      AppScaffold.tsx
      LoadingIndicator.tsx
      ErrorView.tsx
      PrimaryButton.tsx

  features/               # Feature-first 的业务模块目录（脚手架只放示例）
    counter/
      presentation/
        screens/
          CounterScreen.tsx
        components/
          CounterView.tsx
        stores/
          useCounterStore.ts
      domain/
        entities/
          counter.ts
        repositories/
          counterRepository.ts
      data/
        datasources/
          counterLocalDataSource.ts
        repositories/
          counterRepositoryImpl.ts
```

### 3.3 tests 目录结构（建议）

```text
__tests__/
  core/
  features/
    counter/
      presentation/
      domain/
      data/
```

脚手架在生成 feature 时，同步生成对应的测试目录与基础测试文件（Jest + RTL 模板；如启用 Detox，则生成 `e2e/` 结构与配置）。

## 4. 分层与职责划分

### 4.1 app 层

- 作为组合根（Composition Root），负责：
  - 读取 `Env` / 配置，初始化基础设施（logger、error reporter、http client 等）。
  - 注入全局 Provider（QueryClient、theme、i18n、auth/session 等）。
  - 配置 `NavigationContainer` 与 Root Navigator。
  - 暴露统一 `bootstrap()`/`App` 入口，平台入口文件（`index.js`）尽量只负责注册组件。

关于 `app/di.ts`（可选）：

- React 生态通常不需要“重量级 DI 容器”；脚手架推荐使用：
  - 纯函数注入（构造参数/工厂函数）+ hooks
  - 或轻量 Context 作为依赖收口
- `di.ts` 的职责是**集中管理跨多个 feature 共享、与业务无关的核心服务实例/工厂**（如 `AuthService`, `AnalyticsService`, `CrashReportingService` 等），并便于在测试中替换实现。
- 各 feature 自己的依赖与 store 保持在各自目录中，不放入 `di.ts`。

### 4.2 core 层

- 放置完全无业务的、可跨项目复用的基础设施：
  - 网络层封装：统一 baseUrl、拦截器、错误转换、超时与重试策略（如与 Query 配合）。
  - 存储层封装：KV/secure storage 的抽象与实现。
  - 主题 token、基础组件、国际化初始化。
  - 权限处理：请求流程、拒绝兜底、引导去系统设置页等统一策略（避免业务层各自实现）。
  - 表单与校验：通用规则、错误映射与类型复用（避免每个 feature 重复造轮子）。
  - 样式引擎适配：统一 theme/tokens 与样式工具，避免项目中混用多套写法。
  - 日志、错误映射、Result 模型、工具函数与扩展方法。
- 原则：
  - `core` 不引用任何 `features`。
  - 与第三方 SDK（Sentry/Analytics/Firebase 等）交互的封装建议放在 `core/services`（可选目录）或 `core/error`/`core/utils` 下的明确子模块中，避免散落各处难以替换。

### 4.3 features 层

- Feature-first 组织方式：每个 feature 有完整的 presentation/domain/data 三层。
- 约定：
  - `presentation`：Screen/组件、store（Zustand）与 view-model（可选）。
  - `domain`：实体、用例、仓库接口，**禁止依赖 `react-native`/UI 相关包**，保持纯 TypeScript，便于测试与复用。
  - `data`：远程/本地数据源实现、仓库实现。
- Feature 间通信策略：
  - 推荐通过 `core` 中的共享 service（如 `AuthService`）或共享的 `domain` 层仓库接口进行交互。
  - 禁止 `feature A` 直接依赖 `feature B` 的 store 或组件，避免强耦合和循环依赖。
- 脚手架仅提供示例 `counter` feature，用于演示约定；实际业务由业务项目按此结构扩展。

## 5. 状态管理约定（以 TanStack Query + Zustand 为例）

### 5.1 命名规范

- `useXxxQuery` / `useXxxMutation`：服务端状态（Query/Mutation hooks）。
- `useXxxStore`：Zustand store hook（本地状态）。
- `XxxRepository`：数据访问抽象/实现。
- `XxxService`：跨 feature 的服务（如 auth/session/analytics），归于 `core`。

### 5.2 示例（Zustand）

```ts
// features/counter/presentation/stores/useCounterStore.ts
import { create } from 'zustand';

type CounterState = {
  value: number;
  inc: () => void;
  dec: () => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  value: 0,
  inc: () => set((s) => ({ value: s.value + 1 })),
  dec: () => set((s) => ({ value: s.value - 1 })),
}));
```

脚手架在生成 feature 时，可以选择：

- 生成基础的 store（Zustand）模板或 Redux Toolkit slice 模板。
- 允许通过参数选择是否包含 `domain/data` 层（纯 UI feature 可以只生成 presentation）。

## 6. 路由与导航约定（React Navigation）

- 使用 React Navigation，单一 Root Navigator 定义在 `app/navigation/RootNavigator.tsx`。
- 每个 feature 暴露自己的路由常量/Screen 组件，由 Root Navigator 汇总。
- 约定尽量使用类型化的 ParamList，避免手写字符串与参数不一致。

示例约定：

```ts
// app/navigation/routes.ts
export const AppRoutes = {
  Counter: 'Counter',
} as const;

export type RootStackParamList = {
  Counter: undefined;
};
```

```tsx
// app/navigation/RootNavigator.tsx（片段）
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './routes';
import { CounterScreen } from '../../features/counter/presentation/screens/CounterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Counter" component={CounterScreen} />
    </Stack.Navigator>
  );
}
```

脚手架生成 feature 时，如果指定了 `--route`，自动为该 feature 生成 Screen 与路由声明，并在 Root Navigator 预留的占位标记处插入注册代码（通过注释占位符或代码生成实现）。  
约定与自动化的关系：

- 文档中对路由组织方式的说明属于“架构约定”，而实际的路由声明/注册工作应尽量由 `comet` CLI 自动完成。
- 推荐通过 `comet create feature --route ...` 新增路由，而不是手动编辑 Root Navigator，以减少人为疏漏并保证一致性。

### 6.1 Deep Linking（可选，但建议脚手架支持）

- 建议在 `comet.yaml` 中统一声明：
  - app scheme（例如 `myapp://`）
  - Universal Links / App Links 的域名列表
- Expo（Prebuild）：
  - 通过 `app.json/app.config.ts` + Config Plugin 生成 iOS Associated Domains 与 Android intent-filter。
- Bare RN：
  - 由脚手架生成并维护 Android `AndroidManifest.xml` 的 intent-filter、iOS 的 Associated Domains/URL Types（并提供校验脚本）。

## 7. 环境与配置管理

环境切换建议拆成两层看：

- 原生构建维度（必须存在）：
  - iOS：Scheme/Configuration（Debug/Staging/Release 等）
  - Android：productFlavors（dev/staging/prod）+ buildTypes（debug/release）
- JS 侧读取维度（按所选构建工具决定）：
  - Expo（推荐默认）：优先使用 `app.config.ts` + EAS 的环境变量/配置体系，在 `core/config/env.ts` 做类型化封装。
  - Bare RN（或团队强制统一）：可用 `react-native-config`（或同类方案）将 `.env.*` 注入到 JS 侧，再由 `core/config/env.ts` 统一读取。

脚手架约定在 `comet.yaml` 中声明可选环境，以及其对应的原生 flavor/scheme（以及 `.env` 或 app config 的来源）：

```yaml
# comet.yaml（envs 片段）
envs:
  - name: development
    android_flavor: dev
    ios_scheme: MyApp-Dev
    env_file: .env.development
  - name: staging
    android_flavor: stg
    ios_scheme: MyApp-Stg
    env_file: .env.staging
  - name: production
    android_flavor: prod
    ios_scheme: MyApp
    env_file: .env.production
```

脚手架命令可根据该配置生成对应的 `run`/构建命令提示或脚本（例如 `pnpm ios:stg`、`pnpm android:dev`）。

## 8. 错误处理与日志规范

- 引入统一的 `AppError`（或 `Failure`）模型，对网络错误/解析错误/业务错误等进行归一化。
- 在 `errorMapper.ts` 中实现从 `unknown`（`Error`/SDK error/axios error）到 `AppError` 的映射。
- UI 层尽量只依赖 `AppError` 或 `Result<T>`，不关心底层异常类型。
- `logger.ts` 统一提供：
  - 控制台打印（dev）。
  - 远程上报（prod，可接入 Sentry/Crashlytics/自建平台）。
- UI 全局兜底：
  - 使用 Error Boundary 捕获渲染期异常并展示 `ErrorView`。
  - 网络/异步错误由 Query 的错误边界或统一的 toast/banner 组件承接（避免散落处理）。

## 9. 国际化与资源管理

- 默认使用 i18next：
  - `src/core/i18n/i18n.ts` 初始化语言、资源加载策略、fallback 规则。
  - 文案资源建议按语言拆分（如 `src/core/i18n/locales/zh.json`、`en.json`），或按 namespace 拆分（如 `common.json`、`errors.json`）。
- `assets/` 目录下按类型划分子目录（如 `images/`, `icons/`, `fonts/`），并在：
  - SVG：建议默认配置 SVG 导入为组件（例如使用 `react-native-svg-transformer` 或等效方案），并在 `core/assets` 提供统一封装入口，避免业务层各自写 loader/类型声明。
  - 字体：通过 `react-native.config.js`（或平台工程配置）进行链接与打包（按项目所用方案落地）。
  - 图片：优先静态资源 + `require()`，必要时引入图片缓存策略（按需）。

## 10. 脚手架命令设计（CLI 约定）

假设脚手架工具名为 `comet`（可实现为 Node CLI，也可基于 plop / hygen / cookiecutter / 自研模板系统）。

### 10.0 在 `comet` 之前：官方初始化命令（临时使用）

在脚手架命令还未落地前，建议先用官方初始化命令创建工程，再按本文档的目录与约定手动补齐（或后续用 `comet doctor`/迁移命令将其“收编”为标准结构）。

**Expo（推荐默认：Prebuild/CNG 路线）**

```bash
npx create-expo-app@latest MyApp
cd MyApp
npx expo start
```

如需要落到原生工程（生成 `android/`、`ios/`）以便注入 Kotlin/原生配置：

```bash
npx expo prebuild --clean
```

**Bare React Native（不使用 Expo 的初始化方式）**

```bash
npx @react-native-community/cli@latest init MyApp
cd MyApp
npx react-native run-android
# 或：
npx react-native run-ios
```

### 10.1 全局配置

- `comet.yaml` 是脚手架的单一配置源，记录：
  - 工程名、组织 ID（bundle id / applicationId）。
  - 模式维度（推荐固化）：构建工具（expo_prebuild/bare）、底层架构（new/old）、集成方式（greenfield/brownfield）。
  - 包管理器（pnpm/yarn/npm）。
  - 状态管理方案（zustand/redux）。
  - 路由方案（react-navigation/expo-router 等）。
  - 是否启用网络模块、本地存储模块、Sentry、i18n 等。
  - 核心依赖集及版本策略（由模板与 lockfile 承载），便于项目统一升级。

一个较完整的 `comet.yaml` 示例（可根据项目实际精简或扩展）：

```yaml
name: my_app
org: com.example

package_manager: pnpm

build_tool: expo_prebuild # expo_prebuild | bare
architecture: new # new | old（如遇到兼容性问题才考虑 old）
integration: greenfield # greenfield | brownfield

state_management: zustand
server_state: tanstack_query
router: react_navigation

styling_engine: nativewind # nativewind | unistyles | restyle | stylesheet
forms: rhf_zod # rhf_zod | none
permissions: unified # unified | none
deep_linking: true
app_scheme: myapp
universal_links:
  - example.com

envs:
  - name: development
    android_flavor: dev
    ios_scheme: MyApp-Dev
    env_file: .env.development
  - name: staging
    android_flavor: stg
    ios_scheme: MyApp-Stg
    env_file: .env.staging
  - name: production
    android_flavor: prod
    ios_scheme: MyApp
    env_file: .env.production

modules:
  network: true
  storage: true
  i18n: true
  sentry: true
  svg: true
  e2e: false
```

### 10.2 创建应用

```bash
comet create app <app_name> \
  --org com.example \
  --package-manager pnpm \
  --build-tool expo_prebuild \
  --architecture new \
  --integration greenfield \
  --state-management zustand \
  --router react_navigation \
  --enable-network \
  --enable-storage \
  --with-i18n \
  [--with-sentry] \
  [--with-ci]
```

行为：

- 默认（Expo Prebuild）：
  - 基于 `npx create-expo-app@latest` 初始化。
  - 生成/维护 `app.json` 或 `app.config.ts`，并在需要时执行 `npx expo prebuild --clean` 产出 `android/`、`ios/`。
  - 若需要注入 Kotlin/Gradle/Info.plist 等改动，优先通过 Config Plugin 保持可复现。
- 可选（Bare RN）：
  - 基于 `npx @react-native-community/cli init` 初始化。
  - 直接维护 `android/`、`ios/`（脚手架需提供一致的多环境与脚本约定）。
- 替换/补充项目目录为上述骨架结构（`src/app`、`src/core`、`src/features` 等）。
- 初始化多环境配置（iOS scheme / Android flavors + `.env.*`）。
- 若指定 `--with-ci`，生成基础 CI 配置（如 `.github/workflows/ci.yml`），预设 `tsc --noEmit`、lint、测试与构建步骤，可由团队按需调整。

### 10.3 创建 Feature

```bash
comet create feature <feature_name> \
  [--route Counter] \
  [--no-domain] \
  [--no-data]
```

约定：

- 在 `src/features/<feature_name>/` 下生成：

```text
features/<feature_name>/
  presentation/
    screens/<FeatureName>Screen.tsx
    components/<FeatureName>View.tsx
    stores/use<FeatureName>Store.ts
  domain/
    entities/<featureName>.ts
    repositories/<featureName>Repository.ts
  data/
    datasources/<FeatureName>RemoteDataSource.ts
    repositories/<FeatureName>RepositoryImpl.ts
```

- 如果指定了 `--route`：
  - 生成路由声明（`routes.ts` 片段或 feature 自己的 routes 文件）。
  - 在 Root Navigator 的占位标记处自动插入注册代码（通过占位注释或代码生成）。
- 如果指定 `--no-domain` / `--no-data`：
  - 不生成对应目录与文件，更适合 UI-only feature。
- 在 `__tests__/features/<feature_name>/` 下生成基础测试文件（store 行为、repository mock、screen 渲染用例）作为模板。

### 10.4 创建 Service（跨切面能力）

```bash
comet create service <service_name>
```

用途：

- 在 `src/core/` 下生成对应服务骨架，例如 `analytics`, `crash_reporting`, `remote_config` 等。
- 脚手架可选择自动在 `app/di.ts`（或 providers 文件）中注册该服务，推荐通过 CLI 新增服务而不是手工修改“组合根”，由 CLI 保证一致性与完整性。

### 10.5 辅助命令

- `comet lint`：运行 ESLint + TypeScript 检查（可选结合 `tsc --noEmit`），要求在本地与 CI 中保持一致。
- `comet format`：运行 Prettier。
- `comet test`：运行 Jest；如启用 E2E，则增加 Detox 流程。
- `comet doctor`：检查项目是否符合脚手架约定（目录、配置、依赖、iOS/Android 环境等）。
- `comet upgrade-core`：统一升级项目中的核心依赖版本，并给出变更提示，降低多项目依赖漂移。

### 10.6 CLI 实现建议

- 建议优先选择成熟模板引擎（例如 Plop.js / Hygen）承载文件生成与注入逻辑，再在其上封装 `comet` 的参数解析、约定校验与项目检测（doctor）。
- 原因：模板引擎成熟、可维护性更好，能避免自研“字符串拼文件”带来的长期维护成本与一致性问题。

## 11. 命名与代码风格约定

- 目录：默认 `kebab-case`（例如 `user-profile/`），也可按团队偏好统一为 `snake_case`，但需在脚手架模板中强制一致。
- 文件：
  - React 组件文件：`PascalCase.tsx`（例如 `UserProfileScreen.tsx`, `PrimaryButton.tsx`）。
  - 非组件模块文件：`camelCase.ts`（例如 `errorMapper.ts`, `httpClient.ts`）。
- hooks 命名：`useXxx`（例如 `useUserSession`, `useCounterStore`），通常对应文件 `useXxx.ts`。
- 页面/视图：
  - Screen：`<FeatureName>Screen`（文件：`<FeatureName>Screen.tsx`）。
  - 纯视图组件：`<FeatureName>View`（文件：`<FeatureName>View.tsx`）。
- Store：`use<FeatureName>Store`（文件：`use<FeatureName>Store.ts`）。
- Service：`<Name>Service`（文件：`<name>Service.ts`，例如 `authService.ts`），如 `AuthService`。
- Repository：`<EntityName>Repository` / `<EntityName>RepositoryImpl`（文件：`<entityName>Repository.ts` / `<entityName>RepositoryImpl.ts`）。
- 测试文件：与被测文件同名 + `.test` 后缀，例如 `UserProfileScreen.test.tsx`、`useCounterStore.test.ts`。

代码质量与风格：

- ESLint 作为主入口，Prettier 负责格式化；避免规则冲突（例如使用 `eslint-config-prettier`）。
- CI 与本地统一执行：lint、`tsc --noEmit`、Jest（以及可选的原生构建校验），保证风格一致与尽早发现问题。

### 11.1 推荐的工程质量保障实践

- 类型安全导航：
  - 统一维护 ParamList 与 route 常量，通过 TypeScript 在编译期约束路由名与参数，避免字符串散落。
- 提交规范与变更管理：
  - 采用 Conventional Commits 规范组织 `git commit` 信息，便于自动生成 `CHANGELOG` 与语义化版本管理。
  - 可在项目中引入 `commitlint` 使规范在 CI 中得到强制执行。
- 统一格式化与预提交钩子：
  - 使用 `lint-staged` + `husky` 在提交前自动执行 ESLint/Prettier/TS 检查，保证提交质量一致。
- E2E 与发布质量：
  - 若项目对核心流程稳定性要求高，建议逐步引入 Detox 覆盖关键路径，并在 nightly 或 release 分支运行，平衡成本与收益。

## 12. 常见问题与排查指南

### 12.1 Babel/Jest 插件相关错误

#### "Cannot find module 'xxx/plugin'" 错误

**现象**：本地测试通过，但 CI 环境中报错如 `Cannot find module 'react-native-worklets/plugin'`

**原因分析**：

- pnpm 的依赖解析在 CI 与本地环境可能存在差异
- pnpm store 可能缓存了一些未在 lockfile 中声明的传递依赖
- 某些原生模块的 Babel 插件在测试环境中有不同的解析行为

**解决方案**：

1. 在 `__mocks__/` 目录下创建对应的 mock 文件
2. 在 `jest.config.js` 的 `moduleNameMapper` 中配置映射
3. 如果确实需要该依赖，直接安装：`pnpm add <package-name>`

```javascript
// jest.config.js
moduleNameMapper: {
  '<package-name>/plugin': '<rootDir>/__mocks__/<package-name>/plugin.js',
}
```

#### ".plugins is not a valid Plugin property" 错误

**原因**：向 Babel preset 传递了不支持的配置选项

**解决方案**：确保 presets 配置为简单字符串，不要传递额外选项

```javascript
// ✅ 正确
presets: ['nativewind/babel', 'babel-preset-expo'],

// ❌ 错误
presets: [['nativewind/babel', { plugins: [...] }]]
```

### 12.2 pnpm 环境下的 Jest 配置

pnpm 使用 `.pnpm/package@version/node_modules/package` 的目录结构，需要特殊的 `transformIgnorePatterns` 配置：

```javascript
// jest.config.js
transformIgnorePatterns: [
  '<rootDir>/node_modules/(?!(?:.pnpm/)?(?:react-native|@react-native|expo|@expo|...))',
];
```

### 12.3 通用排查步骤

1. **对比本地与 CI 环境差异**：检查 node_modules 结构、依赖版本
2. **验证 lockfile**：确保 `pnpm-lock.yaml` 已提交且最新
3. **清理缓存重装**：`pnpm store prune && rm -rf node_modules && pnpm install`
4. **检查传递依赖**：`pnpm why <package-name>` 追溯依赖来源
5. **审查 babel.config.js**：确认 preset/plugin 顺序正确
6. **添加 mock**：对于仅测试环境的问题，使用 `__mocks__/` 目录

## 13. 后续扩展与演进方向

- 支持多种初始化路径模板（React Native CLI / Expo），通过 `comet.yaml` 选择。
- 支持多种状态管理模板（zustand/redux），并内置更贴近团队的最佳实践模板（如 server-state 与 cache 策略）。
- 自动生成 API client（OpenAPI/GraphQL）与错误映射骨架，统一网络层与类型定义。
- 提供更多“开箱即用”工程配置模板（CI 片段、release 流水线、签名与证书管理建议、监控与埋点约定），但依旧保持「非业务」。

---

本设计文档聚焦在 React Native 工程层面的架构与脚手架命令约定，后续可以根据团队反馈与具体项目实践不断调整 `comet.yaml` 配置和模板细节。
