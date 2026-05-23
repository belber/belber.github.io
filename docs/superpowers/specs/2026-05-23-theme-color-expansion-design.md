# 主题色扩展设计

## 目标

在现有浅紫、浅蓝两套主题色的基础上，新增暖灰主题，并将切换入口从二选一循环按钮改为弹出式选色面板。

## 主题色

三套主题全部通过 CSS 自定义属性（`--primary`, `--light-bg` 等）定义，均位于 `assets/css/main.scss`。

### 浅紫（默认）

```scss
:root, .theme-purple {
  --primary:       #9b87d5;
  --light-bg:      #f6f2fc;
  --page-bg:       #f4f0fa;
  --accent:        #7c6bc4;
  --text:          #2b2b2b;
  --text-muted:    #8888aa;
  --border:        #dcd5e8;
  --card-hover:    #f0ecf8;
  --month-nav-bg:  #efeaf6;
  --blockquote-clr: #737373;
  --bg-pattern-clr: #dcd5e8;
  --content-bg:    linear-gradient(135deg, #faf8fd 0%, #fff 50%);
}
```

### 浅蓝

```scss
.theme-blue {
  --primary:       #7bb8d4;
  --light-bg:      #f0f7fc;
  --page-bg:       #f0f6fa;
  --accent:        #5a9bb8;
  --text:          #2b2b2b;
  --text-muted:    #6a8aaa;
  --border:        #d0dce8;
  --card-hover:    #e8f2f8;
  --month-nav-bg:  #ebf2f5;
  --blockquote-clr: #737373;
  --bg-pattern-clr: #d0dce8;
  --content-bg:    linear-gradient(135deg, #f5fafd 0%, #fff 50%);
}
```

### 暖灰（新增）

```scss
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

## 切换入口

### 位置

侧栏底部，和管理齿轮图标并列。保持现有 `sidebar-footer` 布局。

### 交互

1. **触发按钮**：◑ 图标按钮（保持现有样式）
2. **弹出面板**：点击后弹出一个小浮层，包含 3 个颜色圆点
3. **选择**：点击圆点切换主题，面板自动关闭
4. **关闭**：点击面板外部或按 ESC 关闭（不变更）
5. **状态指示**：当前主题对应的圆点显示高亮边框

### HTML 结构（示意）

```html
<div class="sidebar-footer">
  <div class="theme-picker">
    <button id="theme-toggle" class="theme-toggle" aria-label="切换主题" title="切换主题">◑</button>
    <div id="theme-popover" class="theme-popover" style="display:none">
      <button class="theme-dot theme-dot-purple active" data-theme="purple"></button>
      <button class="theme-dot theme-dot-blue" data-theme="blue"></button>
      <button class="theme-dot theme-dot-warmgray" data-theme="warmgray"></button>
    </div>
  </div>
  <a href="/admin/" class="admin-gear" aria-label="管理">...</a>
</div>
```

### CSS 样式

- `.theme-picker` 容器：`position: relative`
- `.theme-popover`：`position: absolute`，位于按钮上方，白色背景，圆角，阴影，三个圆点水平排列
- `.theme-dot`：24×24px 圆形，对应主题色的 `--primary` 色值
- `.theme-dot.active`：边框高亮（使用 `--primary`）

### JavaScript 逻辑

更新 `initThemeToggle()`：

1. 点击 ◑ 按钮 → 切换 `.theme-popover` 显示/隐藏
2. 点击 `.theme-dot` → 应用对应主题（`document.documentElement.className` 替换为 `.theme-{name}`）→ 更新 `.theme-dot.active` 状态 → 关闭面板 → localStorage 保存
3. 点击面板外部 → 关闭面板
4. ESC 键 → 关闭面板

## 存储

`localStorage` key: `theme`，值为 `"purple"` | `"blue"` | `"warmgray"`

## 不涉及

- 不修改文章列表、月份导航等功能
- 不修改 posts 页面或布局模板
- 不新增外部依赖
