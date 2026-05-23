# 主题色扩展实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增暖灰主题，将切换入口从二选一循环按钮改为弹出式三色选色面板。

**Architecture:** CSS 自定义属性体系已支持多主题，只需新增 `.theme-warmgray` 变量集。HTML 侧栏 footer 中新增弹出面板 DOM，JS 覆盖原有二选一逻辑，改为弹出面板选色。

**Tech Stack:** SCSS / vanilla JS / no dependencies

---

### Task 1: CSS — 新增暖灰色值 + 弹出面板样式

**Files:**
- Modify: `assets/css/main.scss` — 在 `.theme-blue` 后追加 `.theme-warmgray`，以及弹出面板相关样式

- [ ] **Step 1: 追加暖灰色值**

在 `.theme-blue` 块之后添加：

```scss
// 暖灰
.theme-warmgray {
  --primary:       #a0908e;
  --light-bg:      #f0ecec;
  --page-bg:       #f5f2f0;
  --accent:        #7a6c6a;
  --text:          #2b2b2b;
  --text-muted:    #8a7a78;
  --border:        #d8d0ce;
  --card-hover:    #e8e4e2;
  --month-nav-bg:  #ebe7e5;
  --blockquote-clr: #737373;
  --bg-pattern-clr: #d8d0ce;
  --content-bg:    linear-gradient(135deg, #f5f2f0 0%, #fff 50%);
}
```

- [ ] **Step 2: 新增弹出面板样式**

在 `.theme-toggle` 样式块之后添加：

```scss
// === 主题选择弹出面板 ===
.theme-picker {
  position: relative;
}

.theme-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  z-index: 60;
}

.theme-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.15s, transform 0.15s;

  &:hover {
    transform: scale(1.15);
  }

  &.active {
    border-color: var(--text-muted);
  }
}

.theme-dot-purple  { background: #9b87d5; }
.theme-dot-blue    { background: #7bb8d4; }
.theme-dot-warmgray { background: #a0908e; }
```

- [ ] **Step 3: 验证编译无报错**

Run: `bundle exec jekyll build 2>&1 | tail -5`
Expected: 正常完成，无 SCSS 错误

- [ ] **Step 4: Commit**

```bash
git add assets/css/main.scss
git commit -m "feat: add warm-gray theme and popover switcher styles"
```

### Task 2: HTML — 侧栏底部弹出面板 DOM

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 用弹出面板替换单一按钮**

将：

```html
<div class="sidebar-footer">
  <button id="theme-toggle" class="theme-toggle" aria-label="切换主题" title="切换主题">◑</button>
  <a href="/admin/" class="admin-gear" aria-label="管理">...</a>
</div>
```

改为：

```html
<div class="sidebar-footer">
  <div class="theme-picker">
    <button id="theme-toggle" class="theme-toggle" aria-label="切换主题" title="切换主题">◑</button>
    <div id="theme-popover" class="theme-popover" style="display:none">
      <button class="theme-dot theme-dot-purple active" data-theme="purple" title="浅紫"></button>
      <button class="theme-dot theme-dot-blue" data-theme="blue" title="浅蓝"></button>
      <button class="theme-dot theme-dot-warmgray" data-theme="warmgray" title="暖灰"></button>
    </div>
  </div>
  <a href="/admin/" class="admin-gear" aria-label="管理">
    <svg>...</svg>
  </a>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add theme popover DOM to sidebar footer"
```

### Task 3: JS — 重写主题切换逻辑

**Files:**
- Modify: `assets/js/blog.js`

- [ ] **Step 1: 用弹出面板逻辑替换 `initThemeToggle`**

将原有的 `initThemeToggle` 函数整体替换为：

```js
// === 主题切换 ===
function initThemeToggle() {
  var btn = document.getElementById('theme-toggle');
  var popover = document.getElementById('theme-popover');
  if (!btn || !popover) return;

  var themes = ['purple', 'blue', 'warmgray'];

  function applyTheme(name) {
    themes.forEach(function(t) { document.documentElement.classList.remove('theme-' + t); });
    if (name !== 'purple') document.documentElement.classList.add('theme-' + name);
    popover.querySelectorAll('.theme-dot').forEach(function(dot) {
      dot.classList.toggle('active', dot.dataset.theme === name);
    });
    try { localStorage.setItem('theme', name); } catch(e) {}
  }

  function closePopover() { popover.style.display = 'none'; }

  // 恢复保存的主题
  var saved = 'purple';
  try { saved = localStorage.getItem('theme') || 'purple'; } catch(e) {}
  applyTheme(saved);

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    popover.style.display = popover.style.display === 'none' ? 'flex' : 'none';
  });

  popover.querySelectorAll('.theme-dot').forEach(function(dot) {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      applyTheme(dot.dataset.theme);
      closePopover();
    });
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.theme-picker')) closePopover();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePopover();
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/blog.js
git commit -m "feat: rewrite theme switcher with popover for 3 themes"
```

### Task 4: 验证整体效果

- [ ] **Step 1: 启动 Jekyll 服务器并确认无报错**

Run: `bundle exec jekyll build 2>&1 | tail -5`
Expected: 正常完成

- [ ] **Step 2: 手动验证**
  - 刷新页面，确认三色均生效
  - 点击 ◑ 弹出面板，切换三个主题各一次，确认 UI 变色
  - 刷新页面，确认主题持久化
  - 点击面板外部/ESC，确认面板关闭
  - 管理齿轮图标仍可正常跳转
