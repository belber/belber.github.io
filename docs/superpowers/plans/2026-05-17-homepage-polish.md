# 首页美化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 美化博客首页，增加背景纹理、暮色氛围区、统计卡片，保持简洁文艺风格。

**Architecture:** 纯 CSS/JS 改动。SCSS 变量调整配色 + body 背景纹理 + 欢迎区样式。index.html 替换 welcome-message 为新的 hero+stats 结构，在 `__POSTS_DATA__` 中增加字符数供 JS 计算统计。

**Tech Stack:** Vanilla JS, SCSS, Jekyll Liquid

---

### Task 1: SCSS — 配色微调、背景纹理、欢迎区样式

**Files:**
- Modify: `assets/css/main.scss`

- [ ] **Step 1: 微调配色变量**

将 `assets/css/main.scss:5-8` 的配色变量改为：

```scss
$primary:       #9b87d5;
$light-bg:      #f6f2fc;
$page-bg:       #f4f0fa;
$accent:        #7c6bc4;
```

- [ ] **Step 2: 给 body 增加紫色波点背景纹理**

在 `assets/css/main.scss:31`（`background: $page-bg;`）之后添加：

```scss
  background-image: radial-gradient(circle, #dcd5e8 0.5px, transparent 0.5px);
  background-size: 20px 20px;
```

- [ ] **Step 3: 替换 welcome-message 为新的 hero + stats 样式**

将 `assets/css/main.scss:326-339` 的 `.welcome-message` 块完全替换为：

```scss
// === 欢迎区 ===
.welcome-area {
  animation: fadeIn 0.3s ease;
}

.welcome-hero {
  background: linear-gradient(135deg, #e8e0f5 0%, #c4b8e0 40%, #b8aee0 65%, #d4cce8 100%);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
}

.welcome-quote {
  font-size: 20px;
  line-height: 1.9;
  color: $text;
  position: relative;
  z-index: 1;
  margin: 0;

  cite {
    display: block;
    margin-top: 16px;
    font-size: 13px;
    color: $text-muted;
    font-style: normal;
    font-weight: 400;
  }
}

// === 统计卡片 ===
.welcome-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;

  .stat-number {
    display: block;
    font-size: 28px;
    font-weight: 600;
    color: $accent;
    line-height: 1.2;
  }

  .stat-label {
    display: block;
    font-size: 12px;
    color: $text-muted;
    margin-top: 4px;
  }
}
```

- [ ] **Step 4: 验证 SCSS 编译**

Run: `bundle exec jekyll build 2>&1 | grep -i "error"`
Expected: 无错误输出

- [ ] **Step 5: Commit**

```bash
git add assets/css/main.scss
git commit -m "style: update color palette, add dot pattern background and welcome styles"
```

---

### Task 2: index.html — 欢迎区 HTML + 统计 JS

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 替换欢迎区 HTML**

将 `index.html:38-41` 的 `<div id="welcome-message"` 替换为：

```html
    <div id="welcome-area" class="welcome-area">
      <div class="welcome-hero">
        <blockquote class="welcome-quote">
          "人生大部分时间都是在寻找，<br>
          寻找喜欢做的事情，<br>
          寻找需要做的事情"
          <cite>—— belber</cite>
        </blockquote>
      </div>
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
    </div>
```

- [ ] **Step 2: 在 `__POSTS_DATA__` 中增加 `char_count`**

在 `index.html:52-56` 的 JSON 对象中增加字段：

```javascript
      "title": {{ post.title | jsonify }},
      "date": "{{ post.date | date_to_xmlschema }}",
      "url": "{{ post.url | relative_url }}",
      "excerpt": {{ post.excerpt | strip_html | truncate: 80 | jsonify }},
      "char_count": {{ post.content | strip_html | size }}
```

- [ ] **Step 3: 添加统计计算 JS**

在 `index.html` 的 `<script>` 块末尾（`</script>` 之前）添加：

```javascript
  // 首页统计
  (function calcStats() {
    var posts = window.__POSTS_DATA__ || [];
    document.getElementById('stat-posts').textContent = posts.length;

    // 本月字数
    var now = new Date();
    var thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    var monthWords = 0;
    posts.forEach(function(p) {
      if (p.date && p.date.substring(0, 7) === thisMonth) {
        monthWords += p.char_count || 0;
      }
    });
    document.getElementById('stat-words').textContent = monthWords.toLocaleString();

    // 运行天数
    if (posts.length > 0) {
      var first = new Date(posts[posts.length - 1].date);
      var days = Math.floor((now - first) / (1000 * 60 * 60 * 24)) + 1;
      document.getElementById('stat-days').textContent = days;
    } else {
      document.getElementById('stat-days').textContent = 1;
    }
  })();
```

- [ ] **Step 4: 验证 JS 语法**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script>([\s\S]*)<\/script>/);
try { new Function(match[1]); console.log('JS syntax: OK'); }
catch(e) { console.error('SyntaxError:', e.message); }
"
```
Expected: `JS syntax: OK`

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: redesign welcome area with hero quote and stats cards"
```
