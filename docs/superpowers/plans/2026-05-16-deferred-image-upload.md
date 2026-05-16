# 延迟图片上传 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上传图片后暂存本地，发布文章时只提交正文中引用的图片到 GitHub，避免 `assets/images/` 积累未引用文件。

**Architecture:** 只修改 `admin/index.html`。新增 `pendingImages[]` 数组暂存压缩后的 base64 图片数据，`syncBrowser()` 对 pending 图片用 dataUrl 预览，`publish()` 在提交文章前先遍历 pending 图片、只上传被引用的。

**Tech Stack:** Vanilla JS, Canvas API, GitHub REST API

---

### Task 1: Admin — 修改图片上传为本地暂存模式

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: 添加 pendingImages 全局变量**

在 `let editingFile = null;` 之后添加：

```javascript
let pendingImages = []; // { filename: String, dataUrl: String } 已上传但未提交到 GitHub 的图片
```

- [ ] **Step 2: 修改上传 handler — 取消 GitHub API 调用，改为存入 pendingImages**

将文件上传事件中从 `// 生成文件名` 到 `// 重置 input` 之间的代码替换为：

```javascript
          // 生成文件名: YYYY-MM-DD_hhmmss_xxx.jpg
          var now = new Date();
          var pad = function(n) { return String(n).padStart(2, '0'); };
          var ds = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) +
                   '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
          var rand = '';
          var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          for (var i = 0; i < 3; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
          var filename = 'assets/images/' + ds + '_' + rand + '.jpg';

          // 存入暂存区（不提交 GitHub）
          var shortName = filename.split('/').pop();
          pendingImages.push({ filename: shortName, dataUrl: dataUrl });

          var md = '![](' + '/assets/images/' + shortName + ')\n';
          var textarea = document.getElementById('post-body');
          textarea.value = textarea.value + '\n' + md;
          syncBrowser();
          btn.textContent = '✓ 已上传';
          setTimeout(function() { btn.disabled = false; btn.textContent = '上传图片'; }, 2000);
```

- [ ] **Step 3: 修改 syncBrowser — pending 图片用 dataUrl 预览**

将 `syncBrowser()` 中渲染缩略图的代码块：

```javascript
  filenames.forEach(function(name) {
    var safeName = name.replace(/"/g, '&quot;');
    html += '<div class="image-browser-item" data-filename="' + safeName + '" title="' + safeName + '">';
    html += '  <img src="https://raw.githubusercontent.com/' + REPO + '/main/assets/images/' + encodeURI(name) + '" alt="' + safeName + '" loading="lazy">';
    html += '</div>';
  });
```

替换为：

```javascript
  filenames.forEach(function(name) {
    var safeName = name.replace(/"/g, '&quot;');
    var isPending = pendingImages.some(function(p) { return p.filename === name; });
    var imgSrc;
    if (isPending) {
      var pending = pendingImages.filter(function(p) { return p.filename === name; });
      imgSrc = pending.length > 0 ? pending[0].dataUrl : '';
    } else {
      imgSrc = 'https://raw.githubusercontent.com/' + REPO + '/main/assets/images/' + encodeURI(name);
    }
    html += '<div class="image-browser-item" data-filename="' + safeName + '" title="' + safeName + '">';
    html += '  <img src="' + imgSrc + '" alt="' + safeName + '" loading="lazy">';
    html += '</div>';
  });
```

- [ ] **Step 4: 修改 previewImage — pending 图片用 dataUrl 预览大图**

`previewImage()` 当前用 `raw.githubusercontent.com` 加载大图，pending 图片尚未提交，需要改用 dataUrl。

在 `previewImage()` 函数中，将图片 src 的生成方式改为：

```javascript
  // 检查是否为 pending 图片
  var pendingItem = pendingImages.filter(function(p) { return p.filename === filename; });
  var imgSrc;
  if (pendingItem.length > 0) {
    imgSrc = pendingItem[0].dataUrl;
  } else {
    imgSrc = 'https://raw.githubusercontent.com/' + REPO + '/main/assets/images/' + encodeURI(filename);
  }

  overlay.innerHTML = '<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:12px">' +
    '<img src="' + imgSrc + '" style="max-width:90vw;max-height:80vh;border-radius:4px;box-shadow:0 4px 32px rgba(0,0,0,0.4);object-fit:contain;cursor:default">' +
    '<button onclick="insertImage(\'' + filename.replace(/'/g, "\\'") + '\');closePreview()" style="padding:8px 20px;background:#a594dd;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer">插入图片</button>' +
    '</div>';
```

- [ ] **Step 5: 修改 publish — 先上传被引用的 pending 图片，再提交文章**

在 `publish()` 函数的 `if (editingFile)` 判断之前，插入上传 pending 图片的逻辑：

找到 `var frontMatter = '---\nlayout: post\ntitle: "' + title + ...` 这一行之前的 `if (editingFile) {`，在它前面添加图片上传逻辑：

```javascript
  // === 上传正文中引用的 pending 图片 ===
  var bodyForRefs = document.getElementById('post-body').value;
  var refRegex = /!\[\]\(\/assets\/images\/([^)]+)\)/g;
  var refMatches = [];
  var m;
  while ((m = refRegex.exec(bodyForRefs)) !== null) {
    if (refMatches.indexOf(m[1]) === -1) refMatches.push(m[1]);
  }

  var imagesToUpload = pendingImages.filter(function(p) {
    return refMatches.indexOf(p.filename) !== -1;
  });

  if (imagesToUpload.length > 0) {
    var uploadPromises = imagesToUpload.map(function(p) {
      return fetch('https://api.github.com/repos/' + REPO + '/contents/assets/images/' + p.filename, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
        body: JSON.stringify({
          message: 'feat: upload ' + p.filename,
          content: p.dataUrl.split(',')[1],
          branch: BRANCH
        })
      })
      .then(function(r) {
        if (!r.ok) throw new Error('图片上传失败 (' + r.status + ')');
        return r.json();
      });
    });

    try {
      await Promise.all(uploadPromises);
      // 从 pending 中移除已提交的图片
      var uploadedFilenames = imagesToUpload.map(function(p) { return p.filename; });
      pendingImages = pendingImages.filter(function(p) {
        return uploadedFilenames.indexOf(p.filename) === -1;
      });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = editingFile ? '保存修改' : '发布';
      showStatus(err.message, 'error');
      return;
    }
  }
```

注意：`publish()` 当前不是 async 函数。需要将 `function publish()` 改为 `async function publish()`，并将 `fetch(...).then(...)` 的编辑/新建逻辑改为 `await` 风格，或者保持 `.then()` 链但将图片上传部分单独处理。

由于改动较大，更好的办法是将 `publish()` 改为 `async function`：

将 `function publish()` 改为 `async function publish()`，然后将原有 `if (editingFile) { ... } else { ... }` 中的 `.then()` 链改为 `await`：

```javascript
  if (editingFile) {
    // 更新已有文章
    var result = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + editingFile.path, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({
        message: 'update: ' + title,
        content: btoa(unescape(encodeURIComponent(frontMatter))),
        sha: editingFile.sha,
        branch: BRANCH
      })
    }).then(function(r) { return r.json(); });

    if (result.message) throw new Error(result.message);
    editingFile = { path: editingFile.path, sha: result.content.sha };
    btn.textContent = '✓ 已保存';
    showStatus('文章 "' + title + '" 已更新！', 'success');
    setTimeout(function() { btn.disabled = false; btn.textContent = '保存修改'; }, 2000);
  } else {
    // 新建文章
    var slug = title.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, '') || 'post';
    var filename = '_posts/' + dateStr + '-' + slug + '.md';

    var result = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + filename, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({
        message: 'feat: ' + title,
        content: btoa(unescape(encodeURIComponent(frontMatter))),
        branch: BRANCH
      })
    }).then(function(r) { return r.json(); });

    if (result.message) throw new Error(result.message);
    btn.textContent = '✓ 已发布';
    showStatus('文章 "' + title + '" 已发布！', 'success');
    document.getElementById('post-title').value = '';
    document.getElementById('post-body').value = '';
    setTimeout(function() { btn.disabled = false; btn.textContent = '发布'; }, 2000);
  }
```

包裹在 try/catch 中：

```javascript
  try {
    // ... 图片上传逻辑 ...
    // ... 编辑/新建逻辑 ...
  } catch (err) {
    btn.disabled = false;
    btn.textContent = editingFile ? '保存修改' : '发布';
    showStatus((editingFile ? '保存' : '发布') + '失败：' + (err.message || '未知错误'), 'error');
  }
```

- [ ] **Step 6: 修改视图切换 — 清空 pendingImages**

在 `showEditor()` 函数开头添加（在 `editingFile = null;` 之后）：

```javascript
  pendingImages = [];
```

在 `cancelEdit()` 函数中也清空：

```javascript
function cancelEdit() {
  pendingImages = [];
  showPosts();
}
```

- [ ] **Step 7: Commit**

```bash
git add admin/index.html
git commit -m "feat: defer image upload to publish time"
```
