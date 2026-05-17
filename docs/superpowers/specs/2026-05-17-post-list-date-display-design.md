---
name: post-list-date-display
description: 文章列表日期显示中文化——月份导航显示"5月"，文章条目显示"5月16日"
---

# 文章列表日期显示设计

## 背景

博客文章列表中，月份导航和分组标题使用英文月份名（"May"），且文章条目不显示具体日期，不便于快速定位。

## 改动概要

涉及文件：`assets/js/blog.js`

### 1. 月份导航按钮（month-nav）

`#month-nav` 中的月份按钮，将英文月份显示改为中文。

**当前：** `May`
**改为：** `5月`

改动位置：`monthNames` 数组不再使用，改用 `${month + 1}月` 格式。

### 2. 月份分组标题（post-list group header）

文章列表折叠/展开的月份分组标题。

**当前：** `May 2026 (3)`
**改为：** `2026年5月 (3)`

### 3. 文章条目日期（post-item）

每个文章条目增加具体日期显示，采用方案 B（日期与标题同行、左侧对齐）。

**当前：**
```
今天的心情
一段简短的摘要...
```

**改为：**
```
5月16日  今天的心情
         一段简短的摘要...
```

HTML 结构：
```html
<div class="post-item" data-url="...">
  <div class="post-item-row">
    <span class="post-item-date">5月16日</span>
    <div class="post-item-text">
      <div class="post-item-title">...</div>
      <div class="post-item-excerpt">...</div>
    </div>
  </div>
</div>
```

### CSS 样式调整

文件：`assets/css/main.scss`

新增 `.post-item-row`、`.post-item-date`、`.post-item-text` 样式：

- `.post-item-row`：`display: flex; gap: 8px;`
- `.post-item-date`：`font-size: 12px; color: $text-muted; white-space: nowrap; flex-shrink: 0; padding-top: 2px;`
- `.post-item-text`：`flex: 1; min-width: 0;`

### 月份导航相关代码清理

`monthNames` 数组可以移除，不再使用。
