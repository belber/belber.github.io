# 博客改版实施计划

> **执行方式：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 按任务逐个实施。步骤使用 `- [ ]` 追踪进度。

**目标：** 将 belber.github.io 从默认 Jekyll 主题改为双栏分屏布局（左列文章列表 / 右列正文），暖色调视觉风格。

**架构：** 基于 Jekyll + GitHub Pages。首页（index.html）渲染为分栏布局，左栏显示按日期分组的文章列表，右栏通过 JS Fetch 加载独立文章页面内容并展示。每篇文章保持独立 URL。

**技术栈：** Jekyll 3.10.0、原生 JavaScript、SCSS/CSS、GitHub Pages

---

### 准备工作

- [ ] **确认 Jekyll 环境**

在本地执行：

```bash
ruby --version
gem --version
jekyll --version
```

预期输出：Ruby >= 2.7、gem 已安装、jekyll 3.x（若未安装 jekyll，执行 `gem install jekyll bundler`）

---

### Task 1：初始化 Jekyll 项目结构

**文件：**
- 创建：`_config.yml`
- 创建：`Gemfile`
- 创建：`.gitignore`

- [ ] **Step 1.1：创建 `_config.yml`**

```yaml
title: "Belber's Diary"
email:
description: "Notes, days, and small pieces of a life in progress."
baseurl: ""
url: "https://belber.github.io"
author: belber

# 文章链接格式
permalink: /diary/:year/:month/:day/:title/

# 构建设置
markdown: kramdown
# 不使用主题，完全自定义布局

# 插件
plugins:
  - jekyll-feed
  - jekyll-seo-tag

# 首页显示文章数（全部显示）
paginate: 100

# 排除文件
exclude:
  - Gemfile
  - Gemfile.lock
  - README.md
  - .gitignore
  - vendor
```

- [ ] **Step 1.2：创建 `Gemfile`**

```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins
gem "jekyll-seo-tag"
gem "jekyll-feed"
```

- [ ] **Step 1.3：创建 `.gitignore`**

```
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
vendor/
Gemfile.lock
.superpowers/
```

- [ ] **Step 1.4：创建示例文章**

创建 `_posts/` 目录和以下文章：

`_posts/2026-05-04-welcome.md`：

```markdown
---
layout: post
title: "Welcome"
date: 2026-05-04 00:00:00 +0800
---

Welcome to my world.

This is the first post in this Jekyll diary. Future entries can live in the `_posts` folder with filenames like `2026-05-04-my-day.md`.
```

`_posts/2026-05-16-first-thought.md`：

```markdown
---
layout: post
title: "通勤路上的想法"
date: 2026-05-16 08:32:00 +0800
---

地铁上看到窗外的城市在晨光中慢慢苏醒。有时候觉得，每天的通勤时间反而是最安静的一段独处时光。
```

`_posts/2026-05-16-second-thought.md`：

```markdown
---
layout: post
title: "关于极简设计的思考"
date: 2026-05-16 12:15:00 +0800
---

少即是多，但少的恰到好处很难。设计中的每一个元素都应该有它存在的理由，否则就是视觉噪音。
```

`_posts/2026-05-16-third-thought.md`：

```markdown
---
layout: post
title: "晚餐记录"
date: 2026-05-16 19:30:00 +0800
---

今天试了新开的拉面店，汤头浓郁但不腻，叉烧炙烤得恰到好处。下次可以带朋友来。
```

- [ ] **Step 1.5：本地构建验证**

```bash
cd /Users/belber/ccyoloWorkspace/belber.github.io
bundle install
bundle exec jekyll build
```

预期：无报错，`_site/` 目录生成。

---

### Task 2：创建基础布局模板

**文件：**
- 创建：`_layouts/default.html`
- 创建：`_layouts/post.html`

- [ ] **Step 2.1：创建 `_layouts/default.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% if page.title %}{{ page.title }} | {{ site.title }}{% else %}{{ site.title }}{% endif %}</title>
  <meta name="description" content="{{ page.description | default: site.description }}">
  <link rel="stylesheet" href="{{ "/assets/css/main.css" | relative_url }}">
  <link rel="alternate" type="application/atom+xml" title="{{ site.title }}" href="{{ "/feed.xml" | relative_url }}">
  {% seo %}
</head>
<body>
  {{ content }}
  <script src="{{ "/assets/js/blog.js" | relative_url }}"></script>
</body>
</html>
```

注意：不使用 `<header>` 和 `<footer>`，分栏布局自带导航。

- [ ] **Step 2.2：创建 `_layouts/post.html`**

```html
---
layout: default
---
<article class="post-article">
  <header class="post-article-header">
    <h1 class="post-article-title">{{ page.title }}</h1>
    <time class="post-article-date" datetime="{{ page.date | date_to_xmlschema }}">
      {{ page.date | date: "%B %-d, %Y" }}
    </time>
  </header>
  <div class="post-article-content">
    {{ content }}
  </div>
</article>
```

这是单篇文章独立页面的布局，JS 也会抓取这个页面来提取 `.post-article-content`。

---

### Task 3：实现双栏布局首页

**文件：**
- 创建：`index.html`
- 创建：`about.md`

- [ ] **Step 3.1：创建 `index.html`**

```html
---
layout: default
---

<div id="app">
  <!-- 左栏：文章列表 -->
  <aside id="sidebar">
    <div class="sidebar-header">
      <h1 class="site-title"><a href="/">{{ site.title }}</a></h1>
    </div>

    <!-- 月份导航 -->
    <nav id="month-nav" class="month-nav">
      <!-- JS 动态渲染 -->
    </nav>

    <!-- 文章列表 -->
    <div id="post-list" class="post-list">
      <!-- JS 按日期分组渲染 -->
    </div>
  </aside>

  <!-- 右栏：文章内容 -->
  <main id="content">
    <div id="welcome-message" class="welcome-message">
      <h2>{{ site.description }}</h2>
      <p>从左侧选择一篇文章开始阅读</p>
    </div>
    <div id="post-display" class="post-display" style="display:none;">
      <!-- JS 加载的文章内容将放在这里 -->
    </div>
  </main>
</div>

<script>
  // 将文章数据作为 JSON 嵌入页面，供 JS 使用
  window.__POSTS_DATA__ = [
    {% for post in site.posts %}
    {
      "title": {{ post.title | jsonify }},
      "date": "{{ post.date | date_to_xmlschema }}",
      "url": "{{ post.url | relative_url }}",
      "excerpt": {{ post.excerpt | strip_html | truncate: 80 | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
</script>
```

- [ ] **Step 3.2：创建 `about.md`**

```markdown
---
layout: post
title: About
permalink: /about/
---

Hi, I am belber.

This is a small diary blog for everyday notes, thoughts, and fragments worth keeping.
```

---

### Task 4：实现 CSS 样式

**文件：**
- 创建：`assets/css/main.scss`

- [ ] **Step 4.1：创建完整的 CSS**

```scss
---
---

// === 配色 ===
$primary:       #d4a373;
$light-bg:      #faedcd;
$page-bg:       #fefae0;
$accent:        #ccd5ae;
$text:          #2b2b2b;
$text-muted:    #999;
$border:        #e0d5c0;
$card-hover:    #f5efe0;

// === 全局 ===
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: $text;
  background: $page-bg;
  -webkit-font-smoothing: antialiased;
}

a {
  color: $primary;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

// === 分栏布局 ===
#app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

// === 左栏 ===
#sidebar {
  width: 360px;
  min-width: 360px;
  border-right: 1px solid $border;
  display: flex;
  flex-direction: column;
  background: $page-bg;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid $border;

  .site-title {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.3px;
    a { color: $text; }
  }
}

// === 月份导航 ===
.month-nav {
  display: flex;
  gap: 4px;
  padding: 10px 16px;
  border-bottom: 1px solid $border;
  background: darken($page-bg, 1%);
  overflow-x: auto;
  font-size: 12px;

  .month-btn {
    padding: 3px 12px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: $text-muted;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;

    &:hover { background: $light-bg; color: $text; }
    &.active {
      background: $primary;
      color: #fff;
    }
  }

  .year-label {
    font-weight: 600;
    color: $text;
    padding: 3px 8px;
    font-size: 12px;
  }
}

// === 文章列表 ===
.post-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: $border;
    border-radius: 2px;
  }
}

.date-group {
  margin-bottom: 4px;
}

.date-header {
  font-size: 11px;
  font-weight: 600;
  color: $primary;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 20px 4px;
}

.post-item {
  display: block;
  padding: 8px 16px 8px 20px;
  margin: 1px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: $card-hover;
  }

  &.active {
    background: $light-bg;
    border-left-color: $primary;
  }

  .post-item-title {
    font-weight: 500;
    font-size: 14px;
    color: $text;
  }

  .post-item-excerpt {
    font-size: 12px;
    color: $text-muted;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// === 右栏 ===
#content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  background: #fff;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: $border;
    border-radius: 2px;
  }
}

.welcome-message {
  text-align: center;
  padding: 80px 20px;
  color: $text-muted;

  h2 {
    font-size: 18px;
    font-weight: 400;
    color: $text;
    margin-bottom: 8px;
  }

  p { font-size: 14px; }
}

// === 文章内容样式 ===
.post-display {
  max-width: 680px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.post-article {
  max-width: 680px;
}

.post-article-header {
  margin-bottom: 24px;
}

.post-article-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
  line-height: 1.3;
  color: $text;
}

.post-article-date {
  font-size: 13px;
  color: $primary;
  display: block;
  margin-top: 4px;
}

.post-article-content {
  font-size: 15px;
  line-height: 1.8;
  color: $text;

  p { margin-bottom: 1em; }

  h2 { font-size: 22px; font-weight: 600; margin: 28px 0 12px; }
  h3 { font-size: 18px; font-weight: 600; margin: 24px 0 8px; }

  code {
    font-size: 13px;
    background: $light-bg;
    padding: 2px 6px;
    border-radius: 4px;
  }

  pre {
    background: #f8f8f8;
    border: 1px solid $border;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 1em;

    code {
      background: none;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid $primary;
    padding-left: 16px;
    color: lighten($text, 20%);
    font-style: normal;
    margin-bottom: 1em;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
  }
}

// === 移动端 ===
@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }

  #sidebar {
    width: 100%;
    min-width: 0;
    height: 50vh;
    border-right: none;
    border-bottom: 1px solid $border;
  }

  #content {
    height: 50vh;
    padding: 20px;
  }
}

// === 小屏特殊处理 ===
@media (max-width: 480px) {
  #sidebar {
    height: 45vh;
  }

  #content {
    height: 55vh;
    padding: 16px;
  }

  .post-article-title {
    font-size: 22px;
  }
}
```

---

### Task 5：实现 JavaScript 动态加载

**文件：**
- 创建：`assets/js/blog.js`

- [ ] **Step 5.1：创建 `blog.js`**

```javascript
(function() {
  'use strict';

  // === 数据 ===
  const posts = window.__POSTS_DATA__ || [];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // === 工具函数 ===
  function groupByDate(posts) {
    const groups = {};
    posts.forEach(function(p) {
      var d = new Date(p.date);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (!groups[key]) {
        groups[key] = { date: d, posts: [] };
      }
      groups[key].posts.push(p);
    });
    // 转数组并按日期降序
    var result = Object.keys(groups).map(function(k) { return groups[k]; });
    result.sort(function(a, b) { return b.date - a.date; });
    return result;
  }

  function getMonths(posts) {
    var map = {};
    posts.forEach(function(p) {
      var d = new Date(p.date);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!map[key]) {
        map[key] = { year: d.getFullYear(), month: d.getMonth(), label: monthNames[d.getMonth()] + ' ' + d.getFullYear(), posts: [] };
      }
      map[key].posts.push(p);
    });
    return Object.keys(map).sort().reverse().map(function(k) { return map[k]; });
  }

  function formatDateHeader(d) {
    return monthNames[d.getMonth()].toUpperCase() + ' ' + d.getDate();
  }

  // === 渲染 ===
  var postListEl = document.getElementById('post-list');
  var monthNavEl = document.getElementById('month-nav');
  var postDisplayEl = document.getElementById('post-display');
  var welcomeEl = document.getElementById('welcome-message');
  var currentActiveItem = null;

  function renderMonthNav(posts) {
    var months = getMonths(posts);
    var html = '';
    var currentYear = null;
    months.forEach(function(m, i) {
      if (currentYear !== m.year) {
        currentYear = m.year;
        html += '<span class="year-label">' + m.year + '</span>';
      }
      html += '<button class="month-btn' + (i === 0 ? ' active' : '') + '" data-month="' + m.year + '-' + String(m.month + 1).padStart(2, '0') + '">' + m.label + '</button>';
    });
    monthNavEl.innerHTML = html;

    // 绑定月份筛选
    monthNavEl.querySelectorAll('.month-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        monthNavEl.querySelectorAll('.month-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderPostList(posts, btn.dataset.month);
      });
    });
  }

  function renderPostList(posts, filterMonth) {
    var groups = groupByDate(posts);
    var html = '';

    groups.forEach(function(g) {
      // 月份筛选
      var monthKey = g.date.getFullYear() + '-' + String(g.date.getMonth() + 1).padStart(2, '0');
      if (filterMonth && monthKey !== filterMonth) return;

      html += '<div class="date-group">';
      html += '<div class="date-header">' + formatDateHeader(g.date) + '</div>';
      g.posts.forEach(function(p) {
        html += '<div class="post-item" data-url="' + p.url + '">';
        html += '  <div class="post-item-title">' + p.title + '</div>';
        html += '  <div class="post-item-excerpt">' + p.excerpt + '</div>';
        html += '</div>';
      });
      html += '</div>';
    });

    postListEl.innerHTML = html;

    // 绑定点击事件
    postListEl.querySelectorAll('.post-item').forEach(function(item) {
      item.addEventListener('click', function() {
        loadPost(item.dataset.url, item);
      });
    });
  }

  function loadPost(url, listItem) {
    // 高亮当前文章
    if (currentActiveItem) {
      currentActiveItem.classList.remove('active');
    }
    listItem.classList.add('active');
    currentActiveItem = listItem;

    // 显示加载状态
    welcomeEl.style.display = 'none';
    postDisplayEl.style.display = 'block';
    postDisplayEl.innerHTML = '<p style="color:#999;padding:20px;">加载中...</p>';

    // 用 fetch 获取文章页面
    fetch(url)
      .then(function(response) { return response.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var article = doc.querySelector('.post-article');
        if (article) {
          postDisplayEl.innerHTML = article.outerHTML;
          // 过渡动画
          postDisplayEl.style.animation = 'none';
          postDisplayEl.offsetHeight; // 触发回流
          postDisplayEl.style.animation = 'fadeIn 0.2s ease';
          // 更新 URL hash
          history.pushState(null, '', url);
        } else {
          postDisplayEl.innerHTML = '<p>文章内容加载失败</p>';
        }
      })
      .catch(function() {
        postDisplayEl.innerHTML = '<p>文章加载失败，请重试</p>';
      });
  }

  // === 根据 URL hash 或当前路径加载文章 ===
  function loadInitialPost() {
    var path = window.location.pathname;
    // 如果是文章页面路径（非首页），自动加载
    if (path !== '/' && path !== '/index.html') {
      var items = postListEl.querySelectorAll('.post-item');
      for (var i = 0; i < items.length; i++) {
        var url = items[i].dataset.url;
        if (url === path) {
          loadPost(url, items[i]);
          // 滚动到可见
          items[i].scrollIntoView({ block: 'center' });
          break;
        }
      }
    }
  }

  // === 初始化 ===
  function init() {
    renderMonthNav(posts);
    // 默认选择第一个月份
    var firstMonth = monthNavEl.querySelector('.month-btn');
    if (firstMonth) {
      renderPostList(posts, firstMonth.dataset.month);
    }
    loadInitialPost();
  }

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

---

### Task 6：构建验证

- [ ] **Step 6.1：本地构建并验证**

```bash
cd /Users/belber/ccyoloWorkspace/belber.github.io
bundle exec jekyll build
```

预期：构建无报错

- [ ] **Step 6.2：本地启动预览**

```bash
bundle exec jekyll serve
```

打开 `http://localhost:4000` 验证：
- 分栏布局正常显示（左列表 / 右内容）
- 点击左栏文章，右栏加载内容
- 文章按日期正确分组
- 月份切换正常
- 文章有独立 URL，直接访问正常
- 移动端自适应正常（浏览器 DevTools 切换手机模式）

---

### Task 7：部署到 GitHub

- [ ] **Step 7.1：初始化 Git 仓库并提交**

```bash
cd /Users/belber/ccyoloWorkspace/belber.github.io
git init
git add -A
git commit -m "feat: init blog with split-pane layout and warm theme"
```

- [ ] **Step 7.2：推送到 GitHub**

```bash
git remote add origin git@github.com:belber/belber.github.io.git
git push -u origin main
```

- [ ] **Step 7.3：确认部署成功**

等待 1-2 分钟后访问 `https://belber.github.io`，确认：
- 新布局生效
- 文章正常显示
- 无 404 错误
