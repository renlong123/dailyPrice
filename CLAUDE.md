# 每日开销 — 项目文档

## 项目概述

**每日开销** 是一个用于记录个人购买的物品支出的应用，自动计算物品的使用时长和日均成本，帮助用户了解每件物品的真实使用成本。

## 技术方案

### 方案：React + TypeScript + Vite + Tailwind CSS + localStorage

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 构建用户界面 |
| 样式 | Tailwind CSS 3 | 快速构建美观的 UI |
| 构建工具 | Vite 5 | 快速开发与构建 |
| 数据存储 | localStorage | 浏览器本地存储，数据存于用户浏览器中 |

### 为何选择此方案

1. **零依赖复杂度** — 不需要 Electron 原生模块编译，不需要数据库安装，即刻可用
2. **跨平台** — 任何现代浏览器均可打开，Mac / Windows / Linux 都能用
3. **本地存储，隐私安全** — 所有数据存在浏览器 localStorage 中，无需网络连接
4. **界面美观** — React + Tailwind CSS 做出漂亮的桌面级 UI
5. **可扩展** — 后续可包装为 Electron 桌面应用或 PWA

### 运行方式

打开浏览器访问 `http://localhost:5173`（开发模式），数据存储在浏览器的 localStorage 中。

---

## 功能需求

### 核心功能

1. **物品管理**
   - 添加物品：名称、价格、购买日期、分类、备注
   - 编辑物品信息
   - 删除物品（需确认弹窗）
   - 物品列表展示

2. **自动计算**
   - **已用天数**：从购买日期到今天，自动计算已使用天数
   - **日均成本**：价格 ÷ 已用天数，自动计算每天平均花费
   - 每天打开时数字自动更新

3. **分类管理**
   - 预设分类：📱 电子设备、👔 衣物、🏠 家居、🍔 食品、🚌 交通、🎮 娱乐、📦 其他
   - 支持自定义分类（自定义名称和 emoji 图标）
   - 按分类筛选物品

4. **数据展示**
   - 物品列表（默认按购买日期倒序）
   - 统计概览：总消费金额、物品总数、平均日均成本
   - 按分类筛选查看

5. **数据持久化**
   - 所有数据存储在浏览器 localStorage 中
   - 页面打开时自动加载数据
   - 清除浏览器数据会导致数据丢失（后续可升级为 IndexedDB 或云端同步）

---

## 数据模型

### 物品 (Item)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增 ID |
| name | string | 物品名称 |
| price | number | 购买价格（元） |
| purchaseDate | string (ISO 8601) | 购买日期，如 "2024-01-15" |
| category | string | 分类名称 |
| notes | string | 备注 |

### 分类 (Category)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增 ID |
| name | string | 分类名称 |
| icon | string | Emoji 图标 |

---

## 界面设计

### 主窗口布局

```
┌─────────────────────────────────────────────────┐
│  💰 每日开销                          [+ 添加物品] │
├────────────┬────────────────────────────────────┤
│  统计概览   │  [全部] [📱电子设备] [👔衣物] ...    │
│            │                                    │
│  总消费     │  ┌────────────────────────────────┐ │
│  ¥12,580   │  │ iPhone 15 Pro    ¥6999         │ │
│            │  │ 购买日期：2024年1月15日           │ │
│  物品数量   │  │ 已用 200 天 | 日均 ¥34.99       │ │
│  23 件     │  └────────────────────────────────┘ │
│            │  ┌────────────────────────────────┐ │
│  平均日均   │  │ MacBook Pro      ¥14999        │ │
│  ¥8.5/天   │  │ ...                            │ │
│            │  └────────────────────────────────┘ │
└────────────┴────────────────────────────────────┘
```

### 添加/编辑物品弹窗

```
┌─────────────────────────────┐
│  添加物品                ✕  │
├─────────────────────────────┤
│  物品名称  [____________]    │
│  价格      [____________] 元 │
│  购买日期  [____年__月__日]   │
│  分类      [📱电子] [👔衣物]  │
│            [+ 新建分类]      │
│  备注      [____________]    │
├─────────────────────────────┤
│        [取消]  [保存]        │
└─────────────────────────────┘
```

---

## 项目目录结构

```
每日开销/
├── CLAUDE.md                  # 项目文档（本文件）
├── package.json               # 项目配置与依赖
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 构建配置
├── tailwind.config.js         # Tailwind CSS 配置
├── postcss.config.js          # PostCSS 配置
├── index.html                 # HTML 入口
├── .gitignore                 # Git 忽略文件
├── dist/                      # 构建输出目录
├── src/
│   ├── main.tsx               # React 入口
│   ├── App.tsx                # 根组件（状态管理）
│   ├── index.css              # Tailwind + 全局样式
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── utils/
│   │   └── storage.ts         # localStorage 数据层（CRUD 操作）
│   ├── hooks/
│   │   └── useItems.ts        # 自定义 Hook（数据加载、状态管理）
│   └── components/
│       ├── Layout.tsx         # 主布局（顶栏 + 主体）
│       ├── StatsBar.tsx       # 左侧统计卡片
│       ├── ItemList.tsx       # 物品列表（含空状态/加载状态）
│       ├── ItemCard.tsx       # 单个物品卡片（含计算逻辑）
│       ├── ItemForm.tsx       # 添加/编辑物品弹窗
│       ├── CategoryFilter.tsx # 分类筛选条
│       └── DeleteConfirm.tsx  # 删除确认弹窗
```

---

## 关键计算逻辑

### 已用天数

```typescript
function getDaysUsed(purchaseDate: string): number {
  const purchase = new Date(purchaseDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  purchase.setHours(0, 0, 0, 0)
  const diffMs = today.getTime() - purchase.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}
```

### 日均成本

```
日均成本 = 物品价格 ÷ 已用天数
（当天购买时，日均成本 = 物品价格）
```

---

## 数据存储

### localStorage 结构

Key: `daily-expense-data`

```json
{
  "items": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 6999,
      "purchaseDate": "2024-01-15",
      "category": "电子设备",
      "notes": "京东购买"
    }
  ],
  "categories": [
    { "id": 1, "name": "电子设备", "icon": "📱" },
    { "id": 2, "name": "衣物", "icon": "👔" }
  ],
  "nextId": 2
}
```

存储位置（浏览器）：`devtools → Application → Local Storage → localhost:5173`

---

## 命令

```bash
# 开发模式（启动开发服务器）
npm run dev

# 生产构建
npm run build        # 输出到 dist/ 目录

# 预览生产构建
npm run preview
```

---

## 注意事项

1. **日期处理**：购买日期只存储日期部分，UI 使用 `<input type="date">`
2. **价格精度**：价格以「元」为单位，支持两位小数
3. **删除操作**：删除物品前弹出确认对话框
4. **空状态**：没有物品时显示友好提示和「添加第一件物品」按钮
5. **数据安全**：清除浏览器数据会导致数据丢失，建议定期导出备份（后续功能）
6. **中文优先**：整个应用界面使用中文
