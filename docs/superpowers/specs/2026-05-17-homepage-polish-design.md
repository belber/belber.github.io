# 首页美化设计方案

## 概述

对博客首页（`index.html`）进行视觉美化，增加背景质感、氛围图片、统计信息，保持简洁高级的文艺风格。

## 改动范围

只修改 `index.html` 和 `assets/css/main.scss`。不影响文章内容、admin 页面、布局结构。

## 配色微调

| 用途 | 原来 | 改为 |
|------|------|------|
| `$primary` | `#a594dd` | `#9b87d5` |
| `$page-bg` | `#eff0fa` | `#f4f0fa` |
| `$light-bg` | `#f8f4fc` | `#f6f2fc` |
| `$accent` | `#6b5cb5` | `#7c6bc4` |

变化细微，让紫色更暖一度。

## 页面背景

整体 `#f4f0fa` 加极淡紫色波点暗纹：

```scss
body {
  background-color: #f4f0fa;
  background-image: radial-gradient(circle, #dcd5e8 0.5px, transparent 0.5px);
  background-size: 20px 20px;
}
```

远看纯色，近看有手账纸张般的暗纹。

## 欢迎区（右侧默认页面）

### 上半部分：暮色氛围 + 引文

CSS 渐变模拟暮色天空，叠加引文。不引入外部图片。

```html
<div class="welcome-hero">
  <div class="welcome-overlay">
    <blockquote class="welcome-quote">
      "人生大部分时间都是在寻找，<br>
      寻找喜欢做的事情，<br>
      寻找需要做的事情"
      <cite>—— belber</cite>
    </blockquote>
  </div>
</div>
```

CSS：
```scss
.welcome-hero {
  background: linear-gradient(135deg, #e8e0f5 0%, #c4b8e0 40%, #b8aee0 65%, #d4cce8 100%);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.welcome-quote {
  font-size: 20px;
  line-height: 1.8;
  color: #2b2b2b;
  font-style: normal;
  position: relative;
  z-index: 1;
  
  cite {
    display: block;
    margin-top: 16px;
    font-size: 13px;
    color: #8888aa;
    font-style: normal;
  }
}
```

### 下半部分：统计卡片

横排 3 张卡片：文章数、本月字数、运行天数。数据来自 JS 对 `window.__POSTS_DATA__` 的计算。

```html
<div class="welcome-stats">
  <div class="stat-card">
    <span class="stat-number" id="stat-posts">0</span>
    <span class="stat-label">全部文章</span>
  </div>
  <div class="stat-card">
    <span class="stat-number" id="stat-words">0</span>
    <span class="stat-label">本月写作</span>
  </div>
  <div class="stat-card">
    <span class="stat-number" id="stat-days">0</span>
    <span class="stat-label">运行天数</span>
  </div>
</div>
```

CSS 及 JS 计算：
- 文章数 = `__POSTS_DATA__.length`
- 本月字数 = 遍历本月文章的 excerpt 字数累加
- 运行天数 = 从第一篇博客日期到现在的天数

## 不修改

- 侧栏保持原样（标题、月份导航、文章列表、底部齿轮）
- 文章内容右侧展示区域
- admin 页面

## 文件变更

- Modify: `index.html` — 欢迎区改造，统计 JS
- Modify: `assets/css/main.scss` — 配色微调、背景纹理、欢迎区样式
