---
name: post-list-flat-layout-optimization
description: 文章列表平铺布局优化——去掉分组标题，全部平铺展示，月份导航可横滚，border-top 分隔月份
---

# 文章列表平铺布局优化设计

## 背景

当前文章列表使用分组折叠/展开模式：月份导航选中某月后，列表只显示该月的文章，其余月份隐藏。这种方式存在两个问题：

1. 月份信息重复出现两次（导航按钮显示"5月"，分组标题显示"2026年5月"）
2. 一次只能浏览一个月的文章，查看其他月份需要切换月份点击

## 改动概要

涉及文件：`assets/js/blog.js`、`assets/css/main.scss`

### 1. 文章列表平铺展示

去掉 `.month-group`、`.month-header` 结构，所有月份的文章按时间倒序全部渲染。

月份之间使用 `.month-separator`（`border-top` 细线）分隔。

**渲染结构变为：**

```html
<div class="post-item" data-url="..." data-month="2026-05">
  <div class="post-item-row">
    <span class="post-item-date">5月16日</span>
    <div class="post-item-text">
      <div class="post-item-title">...</div>
      <div class="post-item-excerpt">...</div>
    </div>
  </div>
</div>
<!-- 月份切换处插入 separator -->
<div class="month-separator"></div>
<div class="post-item" data-url="..." data-month="2026-04">
  ...
</div>
```

不再需要 `renderPostList(posts, activeMonthKey)` 的过滤逻辑。

### 2. 月份导航交互变更

点击月份导航按钮时，不再重新渲染列表，而是：

- 找到该月第一篇 `.post-item[data-month="2026-05"]`
- 调用 `scrollIntoView({ block: 'start' })` 滚动到该位置
- 高亮该月份导航按钮

点击文章时：

- 从文章的 `data-month` 属性获取月份
- 找到对应的月份导航按钮并高亮

### 3. 月份导航横向滚动

```scss
.month-nav {
  overflow-x: auto;
  flex-wrap: nowrap;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}
```

### 4. 减小左内边距

`.post-item` 的 `padding-left` 从 `32px` 减至 `16px`，更紧凑。

`.post-item-row` 的 `gap` 从 `8px` 减至 `6px`。

### 5. 删除不需要的代码

- `renderPostList` 不再接受 `activeMonthKey` 参数，内部移除折叠/展开逻辑
- 移除 `.month-group`、`.month-header`、`.month-toggle-icon`、`.month-posts` 相关 SCSS
- `loadInitialPost` 中移除展开 `.month-group` 的逻辑

### CSS 变更

新增 `.month-separator` 样式：

```scss
.month-separator {
  border-top: 1px solid $border;
  margin: 8px 16px;
}
```

删除 `.month-group`、`.month-header`、`.month-toggle-icon`、`.month-posts`、`.month-count` 样式。
