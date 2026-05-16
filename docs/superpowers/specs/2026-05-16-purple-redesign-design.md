---
name: purple-redesign
description: 博客视觉改造设计 - 紫色配色、折叠屏布局、Logo、按月分组
---

# 博客视觉改造设计

## 概述

对博客进行视觉改造，包括整体配色切换为浅紫色系、折叠屏适配、Logo 添加、文章列表按月分组、admin 页面桌面端布局优化。

分两个阶段实施，本文档覆盖 Stage 1（视觉改造），Stage 2（admin 编辑/删除功能）单独规划。

## 配色方案

采用方案 B「雾紫·清冷」系：

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色 `$primary` | `#a594dd` | 链接、按钮、高亮、月份标签激活态 |
| 背景 `$page-bg` | `#eff0fa` | 页面底色、侧栏背景 |
| 强调 `$accent` | `#6b5cb5` | 文章标题日期、分割线强调、按钮悬停 |
| 浅色 `$light-bg` | `#f8f4fc` | 卡片悬停、代码块背景、浅色填充 |
| 文字 `$text` | `#2b2b2b` | 正文（不变） |
| 文本淡化 `$text-muted` | `#8888aa` | 次要文字（微调偏紫） |
| 边框 `$border` | `#dcd5e8` | 分割线、边框（偏紫） |

## Logo

SVG 文字图标：圆角方块底色 `#a594dd` + 白色「蜉」字衬线体。

- 用作 favicon（`<link rel="icon">`）
- 页面左上角标识（侧栏收起时窄条显示）

## 布局 — 可收缩侧栏

根据屏幕宽度三种状态：

### 窄屏 < 768px（手机竖屏/折叠状态）
- 默认显示文章内容区，侧栏隐藏
- 左上角汉堡按钮 → 侧栏从左侧覆盖滑出
- 点击文章 → 自动收起侧栏

### 中屏 ≥ 768px（折叠屏展开/平板）
- 左右两栏布局，侧栏默认展开（宽度 ~280px）
- 侧栏顶部右侧有收缩按钮（◀）
- 点击收缩 → 侧栏收为 48px 窄条（只显示「蜉」Logo + ▶ 展开按钮）
- 内容区自动撑满剩余宽度

### 宽屏 ≥ 1024px（桌面端）
- 同上左右布局，侧栏默认展开

## 文章列表 — 按月分组

替换现有按日分组逻辑：

```
五月 2026  [▼]       ← 当前月份默认展开
  通勤路上的想法        ← 缩进显示标题
  在大悦城Mi Cafe
  通勤路上的想法
四月 2026  [▶]       ← 其他月份折叠
```

- 月份标题可点击展开/折叠
- 默认展开最近月份，其他折叠
- JS 侧的 `renderPostList` / `groupByDate` 函数改为按月分组

## /admin 页面 — 桌面端布局优化

- 宽屏 ≥ 900px 时，编辑器容器从 `max-width: 720px` 放宽到 60% 视口宽度
- 文本域 `textarea` 高度在宽屏下增加到 `min-height: 360px`
- 手机端样式不变

## 涉及文件

| 文件 | 改动内容 |
|------|----------|
| `assets/css/main.scss` | 配色变量全部替换；新增侧栏折叠/抽屉动画 CSS；新增按月分组样式 |
| `assets/js/blog.js` | 重写 `renderPostList`、`groupByDate` 为按月分组；新增侧栏折叠交互逻辑 |
| `index.html` | 侧栏结构微调（加 Logo、收缩按钮）；数据嵌入不变 |
| `_layouts/default.html` | 加 favicon link；加 Logo HTML |
| `admin/index.html` | 宽屏布局样式调整 |
| `favicon.ico` / 内联 SVG | 新增 favicon（SVG data URI 方式嵌入 default.html） |

## 实施顺序

1. 配色变量替换（main.scss）
2. Logo 添加（default.html + favicon）
3. 布局重构（main.scss + blog.js）
4. 文章列表按月分组（blog.js）
5. admin 桌面端布局（admin/index.html）
