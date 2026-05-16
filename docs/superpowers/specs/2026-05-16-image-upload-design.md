# 图片上传与管理 — 设计文档

**Goal:** Admin 编辑器支持上传图片，并在文章中展示和管理。

**Architecture:** 纯前端实现，通过 GitHub API 将图片文件提交到仓库 `assets/images/` 目录。Lightbox 用纯 CSS + JS 实现，无第三方依赖。

---

## 1. 图片上传

- **触发方式**：编辑器区域添加「上传图片」按钮，点击打开 `<input type="file">`
- **支持格式**：jpg, png, gif, webp
- **压缩处理**：用 Canvas 在浏览器端压缩，最长边 ≤1920px，JPEG quality 0.85
- **文件命名**：`YYYY-MM-DD_hhmmss_xxx.ext`（日期+时分秒+三位随机字母）
- **存储路径**：通过 GitHub API PUT 到 `assets/images/<文件名>`
- **插入正文**：上传成功后，Markdown 代码追加到正文末尾：`![](/assets/images/文件名)`
- **上传中状态**：按钮显示「上传中...」，禁用重复点击
- **错误处理**：上传失败显示错误提示

## 2. 图片展示优化

- **图片阴影**：给 `.post-article-content img` 加细微阴影，提升质感
- **点击放大（Lightbox）**：
  - 点击图片弹出全屏查看
  - 深色半透明遮罩（rgba(0,0,0,0.8)）
  - 图片居中，最大 90vw × 90vh
  - 点击遮罩或按 ESC 关闭
  - 手机上触摸点击遮罩关闭

## 3. 编辑时图片预览

- 编辑器「写新文章」和「编辑文章」视图下，增加「已上传图片」可折叠区域
- 展开后通过 GitHub API 获取 `assets/images/` 文件列表
- 按月份分组，取最新 N 张（避免列表太长）
- 显示缩略图（64×64）和文件名
- 点击缩略图，将 Markdown 图片代码插入到正文末尾

## 4. 具体方案

### 文章展示：
- JS 监听 `.post-article-content img` 点击事件
- 点击后创建遮罩层 div，内嵌 img，body 加 `overflow: hidden`
- ESC 和点击遮罩移除

### 上传流程：
```
选择文件 → Canvas 压缩 → GitHub API PUT (assets/images/) → 插入 Markdown
```

### 编辑预览：
```
点击「已上传图片」→ GitHub API GET (assets/images/) → 列表渲染 → 点击插入
```
