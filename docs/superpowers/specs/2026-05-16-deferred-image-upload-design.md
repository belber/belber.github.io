# 延迟图片上传 — 设计文档

**Problem:** 上传图片时立即通过 GitHub API 提交到仓库，即使后续删除 Markdown 引用，图片文件仍留在仓库中。导致 `assets/images/` 目录积累了大量未引用的图片。

**Solution:** 上传后暂存本地，发布文章时只提交正文中引用的图片。

**Architecture:** 纯前端修改，只在 `admin/index.html` 中改动。新增 `pendingImages` 数组暂存压缩后的图片数据流，发布时过滤出被引用的图片再提交。

---

## 1. 上传流程

### 当前流程
```
选择文件 → Canvas 压缩 → GitHub API PUT → 插入 Markdown
```

### 新流程
```
选择文件 → Canvas 压缩 → 存入 pendingImages[] → 插入 Markdown → [发布时] 遍历 pendingImages,
检查 Markdown 是否引用 → 只上传被引用的 → 提交文章
```

## 2. 数据结构

新增全局变量：
```javascript
var pendingImages = []; // { filename: String, dataUrl: String }
```

- `filename`: 生成的唯一文件名（YYYY-MM-DD_hhmmss_xxx.jpg）
- `dataUrl`: Canvas 输出的 base64 JPEG 数据（`data:image/jpeg;base64,...`）

## 3. 预览

- **已上传图片预览（syncBrowser）**：解析 textarea 中的 `![](/assets/images/xxx.jpg)` 引用
  - 如果 filename 在 `pendingImages` 中，用 `dataUrl` 作为 img.src（base64 本地预览）
  - 如果 filename 不在 `pendingImages` 中（已提交过的旧图片），用 `https://raw.githubusercontent.com/...`
- 逻辑都在 `syncBrowser()` 中处理，无需额外组件

## 4. 发布时提交

在 `publish()` 函数中，提交文章前增加步骤：

1. 从正文用正则提取所有引用的文件名
2. 过滤 `pendingImages`，只保留被引用的图片
3. 逐个调用 GitHub API PUT 上传图片
4. 上传完成后从 `pendingImages` 中移除已提交的条目
5. 继续提交文章

错误处理：任一图片上传失败则中断，提示用户，不提交文章。

## 5. 状态管理

- **上传成功后**：图片存入 `pendingImages`，Markdown 插入正文，`syncBrowser()` 用 base64 显示预览
- **发布成功后**：已提交的图片从 `pendingImages` 中移除
- **取消编辑** (`cancelEdit` / `showEditor`)：清空 `pendingImages`
- **切换视图**（管理文章 ↔ 写新文章）：清空 `pendingImages`
- **浏览器刷新 / 关闭**：`pendingImages` 丢失（JS 内存变量），已上传但未提交的图片需要重新上传。这是可接受的行为

## 6. 编辑已有文章

编辑时新上传的图片同样走 pending 流程，发布时只提交被引用的 pending 图片。已有且已提交的图片不受影响。

## 7. 文件变更

只修改 `admin/index.html`。不需改动任何后端或配置文件。
