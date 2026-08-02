---
name: comment-check
description: 检查代码注释是否充分、规范。找出缺少注释的函数和关键逻辑，生成审查报告。当用户说"检查注释""注释审查""缺少注释""comment"时使用。
argument-hint: "[目标路径，如 src/utils/format.ts，缺省扫描全部 src/]"
context: fork
agent: comment-checker
---

# 任务：扫描项目代码，检查注释是否充分

## 目标路径

$ARGUMENTS

如果用户未指定（$ARGUMENTS 为空），扫描 `src/` 下所有 `.ts` 和 `.tsx` 文件。

## 排除规则

跳过以下文件/目录：
- `src/__tests__/` 目录
- `*.test.ts`、`*.test.tsx`
- `src/test-setup.ts`
- `src/main.tsx`（入口文件）
- `src/vite-env.d.ts`
- `vite.config.ts`
- `tailwind.config.js`、`postcss.config.js`

## 项目信息

- 项目路径：/Users/renlong/每日开销
- 技术栈：React + TypeScript + Vite + Tailwind CSS
- 注释语言：中文
- 项目文档参考：CLAUDE.md

## 审查标准摘要

每个导出的函数必须有 JSDoc（描述 + @param + @returns），复杂逻辑必须有行内注释解释「为什么」，魔法数字和正则必须说明含义。

## 输出要求

1. 按严重度（🔴高 🟡中 🟢低）分组列出所有问题
2. 给出评分（满分 100）
3. 列出注释良好的文件
4. 报告末尾询问用户是否需要自动补充注释
