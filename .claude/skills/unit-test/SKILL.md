---
name: unit-test
description: 对项目代码编写并运行单元测试，生成测试报告。当用户说"单元测试""写测试""跑测试""测试覆盖率""test"时使用。
argument-hint: "[目标文件或模块，如 src/utils/format.ts]"
context: fork
agent: test-expert
---

# 任务：为项目编写并运行单元测试

## 目标

$ARGUMENTS

如果用户未指定目标（$ARGUMENTS 为空），先扫描 `src/utils/` 目录，按优先级列出可测函数，然后对所有工具函数编写测试。

## 项目信息

- 项目路径：/Users/renlong/每日开销
- 测试框架：Vitest（已安装并配置）
- 测试文件目录：`src/__tests__/`
- 测试初始化文件：`src/test-setup.ts`（已创建，引入 @testing-library/jest-dom）
- 配置文件：`vite.config.ts`（test.globals=true, environment=jsdom）
- "今天"固定为 2026-08-02，测试中请使用假时钟

## 可用命令

```bash
npx vitest run --reporter=verbose          # 运行所有测试
npx vitest run --reporter=verbose <file>   # 运行指定测试文件
```

## 已经存在的测试

- `src/__tests__/format.test.ts` — 25 个用例，全部通过

## 要求

1. 如需新增依赖（如 @vitest/coverage-v8），用 npm 安装
2. 测试文件命名：`<原名>.test.ts`，放 `src/__tests__/` 下
3. 每个函数覆盖：正常输入、边界情况、异常输入
4. 测试命名用中文 `it('应该xxx')`
5. 不要修改业务代码（`src/utils/`、`src/hooks/`、`src/components/` 中的文件）
6. 如果发现业务代码 bug，在报告中指出但不要擅自修改
7. 跑不通的测试要分析原因并修正测试本身，直到全部通过

## 输出

测试全部通过后，输出结构化的测试报告，包含：测试文件数、用例数、通过/失败数、耗时、每个 describe 的详细结果。
