# Purple Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign blog with purple color scheme, collapsible sidebar layout, SVG logo, monthly post grouping, and admin desktop layout fix.

**Architecture:** All changes are frontend-only (CSS + JS + HTML). Color is driven by SCSS variables in a single file. Layout and grouping changes span CSS and JS. Logo is inline SVG in the HTML template.

**Tech Stack:** Jekyll 4.3, SCSS, vanilla JS, GitHub Pages

---

### Task 1: Replace color variables in main.scss

**Files:**
- Modify: `assets/css/main.scss:1-6`
- Test: `bundle exec jekyll build` (verify no compile errors)

- [ ] **Step 1: Replace SCSS color variables**

Replace lines 1-6 in `assets/css/main.scss`:

```
$primary:       #a594dd;
$light-bg:      #f8f4fc;
$page-bg:       #eff0fa;
$accent:        #6b5cb5;
$text:          #2b2b2b;
$text-muted:    #8888aa;
$border:        #dcd5e8;
$card-hover:    #f0ecf8;
```

- [ ] **Step 2: Build to verify**

Run: `bundle exec jekyll build`
Expected: No errors, site builds cleanly

- [ ] **Step 3: Commit**

```bash
git add assets/css/main.scss
git commit -m "refactor: replace color palette with purple scheme (misty purple)"
```

### Task 2: Add inline SVG favicon and logo to HTML template

**Files:**
- Modify: `_layouts/default.html`
- Test: `bundle exec jekyll build` then open `http://localhost:4000`

- [ ] **Step 1: Add favicon and logo to default.html**

After `<title>` line (line 6), add favicon:

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect x='4' y='4' width='72' height='72' rx='16' fill='%23a594dd'/><text x='40' y='52' text-anchor='middle' font-size='36' font-weight='600' fill='white' font-family='serif'>蜉</text></svg>">
```

Before `{{ content }}` is not needed — the logo goes inside the sidebar in `index.html`, not the default layout. The favicon goes in `<head>`.

- [ ] **Step 2: Build and verify favicon**

Run: `bundle exec jekyll build`
Open `_site/index.html`, check `<head>` has the favicon link tag.

- [ ] **Step 3: Commit**

```bash
git add _layouts/default.html
git commit -m "feat: add inline SVG favicon (蜉 character logo)"
```

### Task 3: Add sidebar logo and toggle button to index.html

**Files:**
- Modify: `index.html`
- Test: `bundle exec jekyll build` then visual check

- [ ] **Step 1: Update sidebar header with logo and toggle button**

Replace the sidebar-header block (lines 8-10):

```html
<div class="sidebar-header">
  <div class="sidebar-header-row">
    <svg class="sidebar-logo" width="28" height="28" viewBox="0 0 80 80">
      <rect x="4" y="4" width="72" height="72" rx="16" fill="#a594dd"/>
      <text x="40" y="54" text-anchor="middle" font-size="36" font-weight="600" fill="#fff" font-family="serif">蜉</text>
    </svg>
    <h1 class="site-title"><a href="/">{{ site.title }}</a></h1>
    <button id="sidebar-toggle" class="sidebar-toggle" aria-label="切换侧栏">◀</button>
  </div>
</div>
```

Replace the nav placeholder (`<nav id="month-nav" class="month-nav">`) with:

```html
<nav id="month-nav" class="month-nav">
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add sidebar logo and toggle button to index"
```

### Task 4: Add sidebar collapse/expand CSS

**Files:**
- Modify: `assets/css/main.scss` (after color variables)

- [ ] **Step 1: Add sidebar toggle button styles**

After the `.sidebar-header` block, add:

```scss
.sidebar-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-logo {
  flex-shrink: 0;
}

.sidebar-toggle {
  margin-left: auto;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover {
    background: $light-bg;
    color: $accent;
  }
}
```

- [ ] **Step 2: Add collapsed sidebar state CSS**

After `#sidebar` block, add sidebar collapsed state and the "mini sidebar" (narrow collapsed view):

```scss
// === 侧栏折叠/展开 ===
#sidebar.collapsed {
  width: 48px;
  min-width: 48px;

  .site-title { display: none; }
  .sidebar-logo { width: 28px; height: 28px; }
  #month-nav { display: none; }
  .post-list { display: none; }
  .sidebar-header-row { justify-content: center; }
  .sidebar-toggle { margin-left: 0; }
}

// === 手机端侧栏（覆盖层） ===
#sidebar {
  transition: transform 0.25s ease;
}

#sidebar.open {
  transform: translateX(0);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 98;
}

.sidebar-overlay.active {
  display: block;
}
```

- [ ] **Step 3: Add mobile responsive adjustments for sidebar**

Replace the existing `@media (max-width: 768px)` block:

```scss
@media (max-width: 767px) {
  #app {
    flex-direction: column;
  }

  #sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    min-width: 300px;
    z-index: 99;
    transform: translateX(-100%);
    border-right: 1px solid $border;
  }

  #sidebar.open {
    transform: translateX(0);
  }

  #content {
    height: 100vh;
    padding: 20px;
  }

  // 移动端右上角汉堡按钮
  .mobile-menu-btn {
    display: block;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 100;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid $border;
    background: #fff;
    color: $text;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
}
```

- [ ] **Step 4: Add transition to sidebar width change**

Add to existing `#sidebar` block:

```scss
#sidebar {
  // ... existing properties, add:
  transition: width 0.2s ease, transform 0.25s ease;
  overflow: hidden;
}
```

- [ ] **Step 5: Fix the existing media query for mobile sidebar height**

Remove or replace the old `@media (max-width: 768px)` section (lines 279-295) entirely — it will be replaced by the new one above.

Also add the medium-screen responsive:

```scss
// === 中屏（折叠屏展开/平板）无特殊处理，默认左右布局生效 ===
@media (max-width: 480px) {
  #sidebar {
    width: 260px;
    min-width: 260px;
  }

  #content {
    height: 100vh;
    padding: 16px;
  }

  .post-article-title {
    font-size: 22px;
  }
}
```

- [ ] **Step 6: Build and verify**

Run: `bundle exec jekyll build`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add assets/css/main.scss
git commit -m "feat: add sidebar collapse and mobile drawer CSS"
```

### Task 5: Add sidebar toggle and mobile menu JavaScript

**Files:**
- Modify: `assets/js/blog.js`

- [ ] **Step 1: Add sidebar toggle functions and mobile hamburger button**

After the `init` function, add:

```javascript
// === 侧栏交互 ===
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (window.innerWidth < 768) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  } else {
    sidebar.classList.toggle('collapsed');
    var btn = document.getElementById('sidebar-toggle');
    btn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
  }
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}
```

- [ ] **Step 2: Add mobile menu button to `init()`**

In the `init` function, before calling `renderMonthNav`, add mobile menu button injection:

```javascript
function init() {
  // 添加手机端汉堡按钮
  var mobileBtn = document.createElement('button');
  mobileBtn.className = 'mobile-menu-btn';
  mobileBtn.innerHTML = '☰';
  mobileBtn.onclick = toggleSidebar;
  document.body.appendChild(mobileBtn);

  // 添加遮罩层
  var overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'sidebar-overlay';
  overlay.onclick = closeSidebar;
  document.body.appendChild(overlay);

  // 绑定侧栏折叠按钮
  var toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) toggleBtn.onclick = toggleSidebar;

  renderMonthNav(posts);
  // ... rest of init
}
```

- [ ] **Step 3: Close sidebar on post selection (mobile)**

In the `loadPost` function, after setting active class, add:

```javascript
// 移动端选择文章后收起侧栏
if (window.innerWidth < 768) {
  closeSidebar();
}
```

- [ ] **Step 4: Commit**

```bash
git add assets/js/blog.js
git commit -m "feat: add sidebar toggle and mobile menu interactions"
```

### Task 6: Rewrite post list to monthly grouping

**Files:**
- Modify: `assets/js/blog.js`

- [ ] **Step 1: Replace `groupByDate` with `groupByMonth`**

Replace the `groupByDate` function:

```javascript
function groupByMonth(posts) {
  var groups = {};
  posts.forEach(function(p) {
    var d = new Date(p.date);
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (!groups[key]) {
      groups[key] = {
        year: d.getFullYear(),
        month: d.getMonth(),
        label: monthNames[d.getMonth()] + ' ' + d.getFullYear(),
        key: key,
        posts: []
      };
    }
    groups[key].posts.push(p);
  });
  var result = Object.keys(groups).map(function(k) { return groups[k]; });
  result.sort(function(a, b) {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  return result;
}
```

- [ ] **Step 2: Rewrite `renderPostList` for month groups**

Replace the `renderPostList` function:

```javascript
function renderPostList(posts, activeMonthKey) {
  var groups = groupByMonth(posts);
  var html = '';

  groups.forEach(function(g) {
    var isExpanded = (g.key === activeMonthKey);
    var displayStyle = isExpanded ? '' : ' style="display:none"';
    var toggleIcon = isExpanded ? '▼' : '▶';

    html += '<div class="month-group' + (isExpanded ? ' expanded' : '') + '" data-month="' + g.key + '">';
    html += '<div class="month-header" data-month="' + g.key + '">';
    html += '  <span class="month-toggle-icon">' + toggleIcon + '</span>';
    html += '  <span class="month-label">' + g.label + ' <span class="month-count">(' + g.posts.length + ')</span></span>';
    html += '</div>';
    html += '<div class="month-posts"' + displayStyle + '>';
    g.posts.forEach(function(p) {
      html += '<div class="post-item" data-url="' + p.url + '">';
      html += '  <div class="post-item-title">' + p.title + '</div>';
      html += '  <div class="post-item-excerpt">' + p.excerpt + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  });

  postListEl.innerHTML = html;

  // 月份标题点击折叠/展开
  postListEl.querySelectorAll('.month-header').forEach(function(hdr) {
    hdr.addEventListener('click', function(e) {
      var group = this.parentNode;
      var postsDiv = group.querySelector('.month-posts');
      var icon = this.querySelector('.month-toggle-icon');
      if (postsDiv.style.display === 'none') {
        postsDiv.style.display = '';
        icon.textContent = '▼';
        group.classList.add('expanded');
      } else {
        postsDiv.style.display = 'none';
        icon.textContent = '▶';
        group.classList.remove('expanded');
      }
    });
  });

  // 文章点击事件
  postListEl.querySelectorAll('.post-item').forEach(function(item) {
    item.addEventListener('click', function() {
      loadPost(item.dataset.url, item);
    });
  });
}
```

- [ ] **Step 3: Fix `loadInitialPost` to expand parent month group**

Replace `loadInitialPost`:

```javascript
function loadInitialPost() {
  var path = window.location.pathname;
  if (path !== '/' && path !== '/index.html') {
    var items = postListEl.querySelectorAll('.post-item');
    for (var i = 0; i < items.length; i++) {
      var url = items[i].dataset.url;
      if (url === path) {
        var group = items[i].closest('.month-group');
        if (group) {
          var postsDiv = group.querySelector('.month-posts');
          var icon = group.querySelector('.month-toggle-icon');
          if (postsDiv) postsDiv.style.display = '';
          if (icon) icon.textContent = '▼';
          group.classList.add('expanded');
        }
        loadPost(url, items[i]);
        items[i].scrollIntoView({ block: 'center' });
        break;
      }
    }
  }
}
```

- [ ] **Step 4: Update `renderMonthNav` click handler to pass month key**

In the month btn click handler inside `renderMonthNav`, change the last line from `renderPostList(posts, btn.dataset.month);` — it already passes the month key, so no change needed.

- [ ] **Step 5: Remove dead code — `groupByDate` and `formatDateHeader`**

Delete the entire `groupByDate` function and the `formatDateHeader` function from `assets/js/blog.js`. They are replaced by `groupByMonth` and inline date rendering.

- [ ] **Step 6: Commit**

```bash
git add assets/js/blog.js
git commit -m "feat: rewrite post list to monthly grouping with collapsible months"
```

### Task 7: Add monthly grouping CSS

**Files:**
- Modify: `assets/css/main.scss`

- [ ] **Step 1: Add month group styles**

After the `.post-item` CSS block, add:

```scss
// === 按月分组 ===
.month-group {
  margin: 0 8px;
  border-radius: 8px;
  overflow: hidden;

  &.expanded {
    background: darken($page-bg, 0.5%);
  }
}

.month-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: $light-bg;
  }
}

.month-toggle-icon {
  font-size: 10px;
  color: $primary;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.month-label {
  font-size: 13px;
  font-weight: 600;
  color: $text;
}

.month-count {
  font-size: 11px;
  color: $text-muted;
  font-weight: 400;
}

.month-posts {
  padding-bottom: 4px;
}
```

- [ ] **Step 3: Remove old `.date-group` and `.date-header` CSS rules**

Delete the entire `.date-group` and `.date-header` CSS blocks from `assets/css/main.scss` (they are replaced by `.month-group` styles above).

- [ ] **Step 4: Reduce `.post-item` padding for nested look**

Replace existing `.post-item` padding:

```scss
.post-item {
  padding: 6px 16px 6px 32px;
  margin: 1px 8px;
  // ... rest unchanged
}
```

- [ ] **Step 5: Build and verify**

Run: `bundle exec jekyll build`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add assets/css/main.scss
git commit -m "feat: add monthly grouping CSS with expand/collapse"
```

### Task 8: Fix admin page desktop layout

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: Remove the narrow `max-width: 720px` constraint on desktop**

In the `<style>` section, replace the `#app` selector:

```css
#app {
  max-width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
}
```

And update the media query:

```css
@media (min-width: 900px) {
  #app {
    max-width: 800px;
    padding: 60px 40px;
  }
  textarea { min-height: 360px; }
  .login-prompt { padding: 120px 20px; }
}
```

Change `max-width: 800px` to `max-width: 60%`:

```css
@media (min-width: 900px) {
  #app {
    max-width: 60%;
    padding: 60px 40px;
  }
  textarea { min-height: 360px; }
  .login-prompt { padding: 120px 20px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/index.html
git commit -m "fix: widen admin editor layout on desktop screens"
```

### Task 9: Verify full build and visual check

- [ ] **Step 1: Build site**

Run: `bundle exec jekyll build --future`
Expected: Clean build, no errors or warnings.

- [ ] **Step 2: Start dev server**

Run: `bundle exec jekyll serve --livereload --future`
Expected: Server starts on `http://localhost:4000`

- [ ] **Step 3: Visual check items**

Open `http://localhost:4000` and verify:
- [ ] Favicon shows 蜉 character in browser tab
- [ ] Sidebar shows logo + site title + toggle button
- [ ] Post list shows month groups, only latest month expanded
- [ ] Clicking month header toggles post list
- [ ] Clicking toggle button collapses sidebar to narrow view
- [ ] Collapsed sidebar shows only 蜉 logo and expand button
- [ ] Making viewport < 768px, sidebar is hidden
- [ ] Mobile: hamburger button appears, click opens drawer
- [ ] Mobile: clicking post closes sidebar
- [ ] Colors are purple throughout
- [ ] Open `http://localhost:4000/admin` — editor area is wider on desktop
