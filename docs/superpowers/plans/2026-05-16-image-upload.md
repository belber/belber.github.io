# 图片上传与管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin 编辑器支持图片上传（压缩 → GitHub API → 插入 Markdown），文章支持点击放大查看，编辑器可浏览已上传图片。

**Architecture:** 所有逻辑在 admin/index.html 的 `<script>` 内和 blog.js 中。Canvas 浏览器端压缩，GitHub API 读写文件。Lightbox 纯 DOM 操作，无第三方依赖。

**Tech Stack:** Vanilla JS, Canvas API, GitHub REST API, SCSS

---

### Task 1: Admin — 添加上传图片按钮和压缩逻辑

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: 添加上传按钮和隐藏 file input**

在发布按钮行（`<div style="display:flex;gap:8px;flex-wrap:wrap">`）内，在「取消编辑」按钮前添加：

```html
<button class="btn btn-outline btn-sm" id="upload-btn" onclick="document.getElementById('file-input').click()">上传图片</button>
<input type="file" id="file-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none">
```

- [ ] **Step 2: 添加图片上传 JS 函数**

在 `</script>` 前添加：

```javascript
// === 图片上传 ===
document.getElementById('file-input').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var btn = document.getElementById('upload-btn');
  btn.disabled = true;
  btn.textContent = '上传中...';

  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = new Image();
    img.onload = function() {
      // Canvas 压缩
      var canvas = document.createElement('canvas');
      var MAX = 1920;
      var w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = h * MAX / w; w = MAX; }
        else { w = w * MAX / h; h = MAX; }
      }
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      var quality = 0.85;
      var dataUrl = canvas.toDataURL('image/jpeg', quality);

      // 生成文件名: YYYY-MM-DD_hhmmss_xxx.jpg
      var now = new Date();
      var pad = function(n) { return String(n).padStart(2, '0'); };
      var ds = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) +
               '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
      var rand = '';
      var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 3; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
      var filename = 'assets/images/' + ds + '_' + rand + '.jpg';

      // 上传到 GitHub
      fetch('https://api.github.com/repos/' + REPO + '/contents/' + filename, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
        body: JSON.stringify({
          message: 'upload: ' + filename,
          content: dataUrl.split(',')[1],
          branch: BRANCH
        })
      })
      .then(function(r) {
        if (!r.ok) throw new Error('上传失败 (' + r.status + ')');
        return r.json();
      })
      .then(function() {
        var md = '![](' + '/assets/images/' + filename.split('/').pop() + ')\n';
        var textarea = document.getElementById('post-body');
        textarea.value = textarea.value + '\n' + md;
        btn.textContent = '✓ 已上传';
        setTimeout(function() { btn.disabled = false; btn.textContent = '上传图片'; }, 2000);
      })
      .catch(function(err) {
        alert('上传失败：' + err.message);
        btn.disabled = false;
        btn.textContent = '上传图片';
      });
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  // 重置 input 以便再次选择同一文件
  e.target.value = '';
});
```

- [ ] **Step 3: Commit**

```bash
git add admin/index.html
git commit -m "feat: add image upload with Canvas compression to admin editor"
```

---

### Task 2: Admin — 添加「已上传图片」预览区域

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: 添加已上传图片区域 HTML**

在编辑器 `#status` 之后（关闭 `#editor-view` div 之前），添加：

```html
<div id="image-browser" class="image-browser" style="display:none;margin-top:20px">
  <div class="image-browser-header" onclick="toggleImageBrowser()">
    <span class="image-browser-icon">▶</span>
    <span class="image-browser-label">已上传图片</span>
  </div>
  <div id="image-browser-content" class="image-browser-content" style="display:none">
    <div class="empty-state" style="padding:20px">加载中...</div>
  </div>
</div>
```

- [ ] **Step 2: 添加 CSS**

在 `</style>` 前添加：

```css
.image-browser { border-top: 1px solid #e8e0f0; padding-top: 12px; }
.image-browser-header { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; padding: 6px 0; }
.image-browser-header:hover { color: #a594dd; }
.image-browser-icon { font-size: 10px; color: #a594dd; width: 14px; text-align: center; }
.image-browser-label { font-size: 13px; font-weight: 500; color: #666; }
.image-browser-content { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 0 4px; }
.image-browser-item { width: 64px; height: 64px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 1px solid #e8e0f0; transition: border-color 0.15s, box-shadow 0.15s; }
.image-browser-item:hover { border-color: #a594dd; box-shadow: 0 0 0 2px rgba(165,148,221,0.2); }
.image-browser-item img { width: 100%; height: 100%; object-fit: cover; }
```

- [ ] **Step 3: 添加 JS — 显示/隐藏、加载图片列表**

在 `</script>` 前添加 toggle 函数和加载函数：

```javascript
// === 已上传图片浏览 ===
function toggleImageBrowser() {
  var content = document.getElementById('image-browser-content');
  var icon = document.querySelector('.image-browser-icon');
  if (content.style.display === 'none') {
    content.style.display = '';
    icon.textContent = '▼';
    loadImageBrowser();
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
}

function loadImageBrowser() {
  var container = document.getElementById('image-browser-content');
  fetch('https://api.github.com/repos/' + REPO + '/contents/assets/images', {
    headers: { 'Authorization': 'Bearer ' + accessToken, 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(function(r) {
    if (r.status === 404) { container.innerHTML = '<div class="empty-state" style="padding:20px">还没有上传过图片</div>'; return null; }
    if (!r.ok) throw new Error('加载失败');
    return r.json();
  })
  .then(function(files) {
    if (!files || !files.length) {
      container.innerHTML = '<div class="empty-state" style="padding:20px">还没有上传过图片</div>';
      return;
    }
    // 按文件名倒序（最新的在前），取最近 50 张
    files.sort(function(a, b) { return b.name.localeCompare(a.name); });
    var html = '';
    files.slice(0, 50).forEach(function(f) {
      if (f.type !== 'file') return;
      html += '<div class="image-browser-item" title="' + f.name + '" onclick="insertImage(\'' + f.name + '\')">';
      html += '  <img src="https://raw.githubusercontent.com/' + REPO + '/main/assets/images/' + f.name + '" alt="' + f.name + '" loading="lazy">';
      html += '</div>';
    });
    container.innerHTML = html;
  })
  .catch(function() {
    container.innerHTML = '<div class="empty-state" style="padding:20px;color:#e57373">加载失败</div>';
  });
}

function insertImage(filename) {
  var md = '![](' + '/assets/images/' + filename + ')\n';
  var textarea = document.getElementById('post-body');
  textarea.value = textarea.value + '\n' + md;
}
```

- [ ] **Step 4: 编辑器显示时也展示已上传图片区域**

在 `showEditor()` 函数中，在 `document.getElementById('editor-view').style.display = 'block';` 之前，添加：

```javascript
document.getElementById('image-browser').style.display = '';
```

- [ ] **Step 5: 编辑器隐藏时也隐藏图片浏览**

在 `showPosts()` 函数中，在 `document.getElementById('editor-view').style.display = 'none';` 之后，添加：

```javascript
document.getElementById('image-browser').style.display = 'none';
```

- [ ] **Step 6: Commit**

```bash
git add admin/index.html
git commit -m "feat: add image browser panel in admin editor"
```

---

### Task 3: 文章图片展示 — 阴影 + Lightbox

**Files:**
- Modify: `assets/css/main.scss`
- Modify: `assets/js/blog.js`

- [ ] **Step 1: 添加图片阴影 CSS**

在 `assets/css/main.scss` 的 `.post-article-content img` 块内，在现有 `max-width` 和 `border-radius` 后添加：

```scss
  img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    cursor: zoom-in;
    transition: box-shadow 0.2s;
  }
```

- [ ] **Step 2: 添加 Lightbox CSS**

在 `assets/css/main.scss` 文件末尾添加：

```scss
// === Lightbox ===
.lightbox-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;

  &.active { display: flex; }

  img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 4px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.4);
    object-fit: contain;
  }
}
```

- [ ] **Step 3: 添加 Lightbox JS**

在 `assets/js/blog.js` 的 `loadPost` 函数内，在过渡动画代码之前（`postDisplayEl.style.animation = 'none'` 之前），添加 Lightbox 事件绑定：

```javascript
          // Lightbox：图片点击放大
          postDisplayEl.querySelectorAll('.post-article-content img').forEach(function(img) {
            img.addEventListener('click', function(e) {
              openLightbox(this.src);
            });
          });
```

在 `closeSidebar` 函数之后、`init` 函数之前添加 Lightbox 函数：

```javascript
  // === Lightbox ===
  function openLightbox(src) {
    var overlay = document.getElementById('lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.className = 'lightbox-overlay';
      overlay.onclick = closeLightbox;
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = '<img src="' + src + '" alt="">';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    var overlay = document.getElementById('lightbox-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.innerHTML = '';
    }
    document.body.style.overflow = '';
  }

  // ESC 关闭 Lightbox
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });
```

- [ ] **Step 4: Build and verify**

Run: `bundle exec jekyll build`
Expected: No errors, site builds cleanly.

- [ ] **Step 5: Commit**

```bash
git add assets/css/main.scss assets/js/blog.js
git commit -m "feat: add image shadow and lightbox for article images"
```

---

### Task 4: 验证全功能并推送

- [ ] **Step 1: 构建确认无错误**

Run: `bundle exec jekyll build`
Expected: done in X seconds, no errors

- [ ] **Step 2: 推送**

```bash
git push origin main
```
