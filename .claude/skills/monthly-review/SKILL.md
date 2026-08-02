---
name: monthly-review
description: 生成月度开销复盘报告。当用户说"复盘""月度总结""月度报告""本月花了多少""开支分析"时使用。
argument-hint: "[月份，如 2026-07]"
arguments: month
allowed-tools: Read Write Bash
---

# 月度开销复盘报告

## 参数

- `$month`：目标月份，格式 `YYYY-MM`。缺省时使用上个月（今天是 2026-08-02，上月即 2026-07）。

## 执行步骤

### 第一步：获取数据

数据存储在浏览器 localStorage，key 为 `daily-expense-data`。先检查项目根目录是否有 `exported-data.json`（上次导出的缓存）：

```bash
cat exported-data.json 2>/dev/null || echo "NOT_FOUND"
```

若 `NOT_FOUND`，则引导用户导出数据。请用户执行以下操作：

> 📋 请打开 http://localhost:5173，按 F12 打开开发者工具，在 Console 标签页粘贴以下命令并回车：
>
> ```js
> copy(JSON.stringify(JSON.parse(localStorage.getItem('daily-expense-data')), null, 2))
> ```
>
> 数据已复制到剪贴板。请粘贴到对话中。

用户粘贴数据后，用 Write 保存为 `exported-data.json` 以便下次复用。以后报告前先询问用户是否要刷新导出数据。

### 第二步：解析与筛选

参考 `reference.md` 中的数据模型解析 JSON。然后筛选目标月份的物品：

- `item.purchaseDate` 格式为 `YYYY-MM-DD`
- 筛选 `purchaseDate` 以 `$month` 开头的所有物品
- 若无匹配物品，直接告知用户"该月没有购买记录"

### 第三步：计算指标

对目标月份的物品集合：

| 指标 | 计算方式 |
|------|---------|
| 当月总支出 | 本月物品 `price` 之和 |
| 物品数量 | 本月物品个数 |
| 日均支出 | 当月总支出 ÷ 当月天数（当月天数按该月实际天数算） |
| 物品日均成本 | 每件物品 `price ÷ (今天 - purchaseDate) 的天数`（当天购买时=价格本身） |
| 按分类汇总 | 按 `category` 分组，统计每类金额与占比 |

**环比计算**：同样计算上个月的指标，对比变化（金额变化、数量变化）。

### 第四步：生成报告

按以下格式输出美观的中文报告（用 emoji 装饰）：

```
╔══════════════════════════════════╗
║   📊 YYYY年M月 开销复盘报告      ║
╚══════════════════════════════════╝

📌 总览
  • 总支出：¥xxx（环比上月 ↑/↓ ¥xxx，xx%）
  • 购买物品：xx 件（环比 ↑/↓ xx 件）
  • 日均支出：¥xx.xx/天

📂 分类排行（按金额降序）
  1. 🏠 家居    ¥xxx  (xx%)
  2. 📱 电子设备 ¥xxx  (xx%)
  ...

🛒 物品明细
  • [物品名]  ¥价格  |  购买日期  |  已用X天  |  日均¥xx
  ...

💡 建议
  根据消费情况给出 2-3 条个性化建议。
```

### 第五步：清理

报告生成后，询问用户是否将 `exported-data.json` 加入 `.gitignore`（避免隐私数据提交到仓库）。
