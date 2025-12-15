---
name: code-quality
description: React Native (Expo) 项目代码质量检测和修复，包括 TypeScript 检查、ESLint、Prettier 格式化、Jest 测试。当用户提到"代码检查"、"分析"、"格式化"、"代码风格"、"质量检测"、"测试"、"lint"时使用此 skill。
---

# React Native 代码质量检测

确保 React Native/Expo TypeScript 代码符合项目规范，自动检测和修复问题。

## 快速参考

### 核心命令

| 检测项    | 命令                      | 说明                 |
| --------- | ------------------------- | -------------------- |
| 类型检查  | `pnpm tsc --noEmit`       | TypeScript 编译检查  |
| 代码分析  | `pnpm eslint .`           | ESLint 语法/规范检查 |
| 格式化    | `pnpm prettier --check .` | 代码格式检查         |
| 测试      | `pnpm jest`               | 运行 Jest 单元测试   |
| 依赖检查  | `pnpm outdated`           | 检查过期依赖         |
| Expo 诊断 | `npx expo doctor`         | Expo SDK 兼容性检查  |

### 完整质量检查（一键运行）

```bash
pnpm tsc --noEmit && pnpm eslint . && pnpm prettier --check . && pnpm jest
```

### 自动修复

```bash
# ESLint 自动修复
pnpm eslint . --fix

# Prettier 自动格式化
pnpm prettier --write .
```

### 快速检查清单

- [ ] `tsc --noEmit` 无类型错误
- [ ] `eslint .` 无 error/warning
- [ ] `prettier --check .` 无格式问题
- [ ] `jest` 全部测试通过
- [ ] 无硬编码敏感信息

---

## 子代理执行（推荐）

**建议通过子代理执行完整质量检查**：

```typescript
Task({
  subagent_type: 'general-purpose',
  description: '运行 RN 代码质量检查',
  prompt: `运行完整代码质量检查并修复问题，遵循 .claude/skills/code-quality/SKILL.md`,
});
```

**原因**：质量检查失败时可能产生大量输出（10k-20k tokens），子代理可隔离处理。

---

## 目录结构规范

根据 `comet.yaml` 配置，项目应遵循以下结构：

```text
src/
  app/              # 应用入口、Provider、导航
  core/             # 无业务基础设施（网络、存储、主题等）
  features/         # Feature-first 业务模块
    <feature>/
      presentation/ # Screen、组件、store
      domain/       # 实体、仓库接口（纯 TS）
      data/         # 数据源、仓库实现
```

### 分层检查

| 层级            | 允许依赖                         | 禁止依赖                   |
| --------------- | -------------------------------- | -------------------------- |
| `domain/`       | 纯 TypeScript                    | `react-native`、UI 相关包  |
| `presentation/` | `core/`、本 feature 的 `domain/` | 其他 feature 的 store/组件 |
| `data/`         | `domain/` 接口                   | `presentation/`            |

---

## 安全检查

### 敏感信息

| 禁止                 | 允许                                  |
| -------------------- | ------------------------------------- |
| 硬编码 API Key/Token | 环境变量 (`app.config.ts` / `.env.*`) |
| 硬编码密码           | SecureStorage / Keychain              |
| 内部 URL/IP          | `core/config/env.ts` 统一管理         |

### 常见漏洞

| 漏洞     | 预防                         |
| -------- | ---------------------------- |
| 数据泄露 | 移除 `console.log` 敏感日志  |
| 本地存储 | 敏感数据使用 `secureStorage` |
| 网络请求 | 强制 HTTPS                   |
| XSS/注入 | 验证用户输入                 |

---

## 性能检查

| 检查项     | 标准                                        |
| ---------- | ------------------------------------------- |
| 单文件行数 | < 500 行                                    |
| 组件嵌套   | < 10 层                                     |
| 列表渲染   | 使用 `FlatList` / `FlashList`               |
| 避免重渲染 | 使用 `React.memo`、`useMemo`、`useCallback` |
| 图片优化   | 使用缓存策略                                |

---

## 命名规范

根据设计文档约定：

| 类型           | 命名格式           | 示例                         |
| -------------- | ------------------ | ---------------------------- |
| 目录           | `kebab-case`       | `user-profile/`              |
| React 组件文件 | `PascalCase.tsx`   | `UserProfileScreen.tsx`      |
| 非组件模块     | `camelCase.ts`     | `httpClient.ts`              |
| Hooks          | `useXxx.ts`        | `useCounterStore.ts`         |
| Store          | `use<Name>Store`   | `useCounterStore`            |
| Service        | `<Name>Service`    | `AuthService`                |
| Repository     | `<Name>Repository` | `counterRepository.ts`       |
| 测试文件       | `*.test.ts(x)`     | `UserProfileScreen.test.tsx` |

---

## 状态管理规范

### 命名约定

| 类型             | 命名           | 用途                   |
| ---------------- | -------------- | ---------------------- |
| `useXxxQuery`    | TanStack Query | 服务端状态（请求缓存） |
| `useXxxMutation` | TanStack Query | 服务端状态变更         |
| `useXxxStore`    | Zustand        | 客户端本地状态         |

### Zustand Store 示例

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

---

## 常见问题修复

```tsx
// ❌ 未使用的导入
import { unused } from 'some-package';

// ✅ 移除未使用导入
```

```tsx
// ❌ 缺少类型标注
const handlePress = (data) => { ... }

// ✅ 添加类型
const handlePress = (data: UserData) => { ... }
```

```tsx
// ❌ 内联样式
<View style={{padding: 10, margin: 5}}>

// ✅ 使用 StyleSheet 或 NativeWind
<View className="p-2.5 m-1.25">
```

---

## 附录

### A. ESLint 配置

配置文件：`.eslintrc.js` 或 `eslint.config.js`

推荐规则集：

- `@typescript-eslint/recommended`
- `react-hooks/recommended`
- `prettier` (避免冲突)

### B. TypeScript 配置

配置文件：`tsconfig.json`

推荐开启：

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`

### C. 测试命令

```bash
pnpm jest                           # 所有测试
pnpm jest --watch                   # 监听模式
pnpm jest --coverage                # 覆盖率报告
pnpm jest path/to/test.test.ts      # 指定测试
```

### D. CI/CD 集成

```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: pnpm tsc --noEmit
- name: Lint
  run: pnpm eslint .
- name: Format Check
  run: pnpm prettier --check .
- name: Test
  run: pnpm jest --coverage
```

### E. Pre-commit Hook

```bash
# 使用 lint-staged + husky
npx husky init
echo "pnpm lint-staged" > .husky/pre-commit
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```
