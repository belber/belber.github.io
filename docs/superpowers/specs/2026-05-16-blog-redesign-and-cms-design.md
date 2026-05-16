# 博客改版 & 手机发文方案

## 概述

两个独立项目：(1) 将 belber.github.io 改版为双栏布局 + 暖色调视觉风格，(2) 通过 Decap CMS 实现手机发文，无需开发原生 App。

---

## 项目 1：博客布局 & 视觉改版

### 布局

- **双栏分屏**：左栏 38% 文章列表，右栏 62% 文章内容
- **JS 动态加载**：点击左栏文章 → JS 将内容加载到右栏（页面不跳转）
- **独立 URL 保留**：每篇文章仍有独立链接，SEO 和分享不受影响
- **移动端自适应**：上下堆叠 — 列表在上，内容在下

### 文章列表

- **按日期分组**：同一天的多条感想聚合在日期标题下（如 MAY 16）
- **月份导航**：左栏顶部有年/月切换器，筛选文章
- **卡片样式**：每条文章显示为圆角卡片，含标题 + 简短摘要

### 配色

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 / 强调色 | 陶土色 | `#d4a373` |
| 浅色 / 卡片背景 | 暖米色 | `#faedcd` |
| 页面背景 | 浅米色 | `#fefae0` |
| 辅助色 | 草绿色 | `#ccd5ae` |
| 正文色 | 深灰 | `#2b2b2b` |

### 视觉细节

- 扁平化设计，无渐变或大阴影，卡片悬浮仅微阴影
- 圆角 8px 的文章卡片
- 文章切换 0.2s 过渡动画
- 用背景色区分区域，少用边框
- 系统字体，行高 1.8 舒适阅读
- 标题粗体（600-700），正文常规（400）

### 数据模型

- 每条感想独立 Jekyll 文章：`_posts/YYYY-MM-DD-标题.md`
- Front matter：`title`、`date`、`layout: post`
- JS 按日期分组展示
- 年/月筛选从文章日期字段派生

### 技术实现

- 框架：Jekyll（已有），GitHub Pages 托管
- JS：原生 JavaScript，无框架
- CSS：自定义样式表，无 CSS 框架
- 文章列表数据来源：`site.posts`
- 每篇文章既是独立页面，也是 JS 可获取的内容源

---

## 项目 2：Decap CMS 手机发文

### 方案

- 在博客的 `/admin` 挂一个 Decap CMS（原 Netlify CMS）后台
- 无需服务器 — CMS 文件是静态 HTML/JS，由 GitHub Pages 托管
- 认证：GitHub Device Flow（用户输入验证码授权，无需自建认证服务）

### 发文流程

1. 在手机或电脑上打开 `belber.github.io/admin`
2. 通过 GitHub Device Flow 认证
3. 在 CMS 编辑器中写文章（Markdown 或富文本）
4. 点发布 → CMS 自动提交 `.md` 文件到 GitHub 仓库
5. GitHub Pages 自动重新部署

### 所需文件

- `admin/index.html` — CMS 入口页面
- `admin/config.yml` — CMS 配置（仓库、分支、文章类型、字段）
- Device Flow 认证由 Decap CMS 内置支持

### 安全性

- 不暴露 Client Secret — Device Flow 使用公开 OAuth App
- Access Token 存在浏览器 localStorage
- Token 作用域仅限于当前仓库
- 用户可随时在 GitHub 上撤销 token

---

## 实施顺序

1. 在本仓库搭建 Jekyll 项目结构
2. 实现博客布局改版（CSS + JS 双栏布局）
3. 配置 Decap CMS 实现手机发文
4. 端到端测试：手机写文章 → 自动部署

---

## 不做

- 原生 Android/iOS App（用 Web CMS 替代）
- 评论系统
- 统计功能
- 多人协作
