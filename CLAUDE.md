# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A personal Jekyll-based diary blog ("蜉蝣人生") hosted on GitHub Pages. Posts are Markdown files in `_posts/`. The site uses a custom two-column layout — left sidebar with month navigation and post list, right side with article content loaded via JavaScript `fetch()`.

## Commands

```sh
# Serve locally with live reload
bundle exec jekyll serve --livereload --future

# Build
bundle exec jekyll build

# Install dependencies
bundle install
```

## Architecture

- **`_config.yml`** — Jekyll config: custom theme (null), permalink `/diary/:year/:month/:day/:title/`, jekyll-feed + jekyll-seo-tag plugins, Asia/Shanghai timezone
- **`_layouts/default.html`** — Base layout, loads `main.css` and `blog.js`
- **`_layouts/post.html`** — Post template with `.post-article` container, used by both initial render and JS `fetch()`
- **`index.html`** — Two-column SPA-style homepage with `window.__POSTS_DATA__` JSON embedded from Liquid
- **`assets/css/main.scss`** — All styles, SCSS with warm earth-toned palette (`$primary: #d4a373`, `$page-bg: #fefae0`)
- **`assets/js/blog.js`** — Client-side logic: month navigation, post list, post content fetching via `fetch()`/`DOMParser`, `history.pushState` URL updates
- **`admin/index.html`** — Standalone admin page for creating posts via GitHub API (PAT-based auth, commits to `main` branch)
- **`_posts/`** — Markdown posts with YAML front matter (`layout: post`, `title`, `date`)

## Key Behaviors

- Posts are grouped by date and filtered by month via JavaScript (not Liquid)
- Clicking a post fetches its full HTML page, extracts `.post-article`, and injects it into the content area
- Direct navigation to a post URL (e.g. `/diary/2026/05/16/title/`) auto-loads the post and highlights it in the list
- The admin page uses a GitHub Personal Access Token with `repo` scope, stored in `sessionStorage`
- All times are `+0800` (Asia/Shanghai)

## Post File Naming Convention

```
_posts/YYYY-MM-DD-slug.md
```
