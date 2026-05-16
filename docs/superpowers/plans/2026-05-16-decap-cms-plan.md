# Decap CMS 手机发文实施计划

> **执行方式：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 按任务逐个实施。步骤使用 `- [ ]` 追踪进度。

**目标：** 在 belber.github.io 上配置 Decap CMS，实现手机/电脑浏览器直接写文章并发布到博客。

**架构：** 在博客的 `/admin` 目录下部署 Decap CMS 静态文件，CMS 通过 GitHub Device Flow 认证，写文章后直接通过 GitHub API 提交 `.md` 文件到仓库，GitHub Pages 自动重新部署。

**技术栈：** Decap CMS（静态）、GitHub OAuth (Device Flow)、Jekyll

**前置条件：** 博客改版已完成，项目已在 GitHub 上正常运行。

---

### Task 1：创建 CMS 配置文件

**文件：**
- 创建：`admin/config.yml`
- 创建：`admin/index.html`

- [ ] **Step 1.1：创建 `admin/index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>文章管理 - Belber's Diary</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; }
  </style>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 1.2：创建 `admin/config.yml`**

```yaml
backend:
  name: github
  repo: belber/belber.github.io
  branch: main
  # 使用 Device Flow 认证（无需自建服务器）
  auth_scope: repo

publish_mode: editorial_workflow
media_folder: "assets/images"
public_folder: "/assets/images"

collections:
  - name: "posts"
    label: "文章"
    label_singular: "文章"
    folder: "_posts"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "标题", name: "title", widget: "string" }
      - { label: "发布日期", name: "date", widget: "datetime", format: "YYYY-MM-DD HH:mm:ss Z" }
      - { label: "正文", name: "body", widget: "markdown" }

  - name: "pages"
    label: "页面"
    files:
      - name: "about"
        label: "关于页面"
        file: "about.md"
        fields:
          - { label: "标题", name: "title", widget: "string" }
          - { label: "正文", name: "body", widget: "markdown" }
```

---

### Task 2：配置 GitHub OAuth App（Device Flow）

- [ ] **Step 2.1：在 GitHub 上注册 OAuth App**

Device Flow 模式下，不需要配置回调 URL。访问 https://github.com/settings/applications/new：

| 字段 | 值 |
|------|-----|
| Application name | belber-blog-cms |
| Homepage URL | `https://belber.github.io` |
| Authorization callback URL | `https://belber.github.io/admin`（Device Flow 不需要但 GitHub 要求必填） |

点击 "Register application"。

- [ ] **Step 2.2：获取 Client ID**

注册完成后，页面上会显示 **Client ID**（一串 20 位左右的 hash），记录这个值。

- [ ] **Step 2.3：更新 `admin/config.yml`，填入 Client ID**

```yaml
backend:
  name: github
  repo: belber/belber.github.io
  branch: main
  auth_scope: repo
  # 填入上一步获取的 Client ID
  app_id: YOUR_CLIENT_ID_HERE
```

---

### Task 3：构建验证并部署

- [ ] **Step 3.1：本地构建并确认文件生成**

```bash
cd /Users/belber/ccyoloWorkspace/belber.github.io
bundle exec jekyll build
```

确认 `_site/admin/index.html` 和 `_site/admin/config.yml` 已生成。

- [ ] **Step 3.2：本地预览（需要先构建）**

```bash
bundle exec jekyll serve
```

访问 `http://localhost:4000/admin/`，预期看到 Decap CMS 的登录界面。

- [ ] **Step 3.3：提交并推送**

```bash
git add admin/
git commit -m "feat: add Decap CMS for mobile posting"
git push
```

- [ ] **Step 3.4：在线验证**

等待部署完成后，用手机浏览器打开 `https://belber.github.io/admin/`：
1. 点击 "Login with GitHub"
2. 看到 Device Flow 验证码
3. 在手机上打开 github.com 输入验证码
4. 授权后即可进入 CMS 后台
5. 写一篇测试文章并发布
6. 确认文章在博客上正常显示

---

### 附：写作流程（给用户参考）

1. 手机打开 `https://belber.github.io/admin/`
2. 点 "Login with GitHub" → 输入设备码 → 授权
3. 点 "新建文章" → 写标题和正文
4. 点 "发布" → 几秒后博客更新

无需装 App、无需电脑、无需手动 git push。
