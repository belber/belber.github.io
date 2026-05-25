---
name: umami-analytics
description: "Umami Cloud analytics integration for belber.github.io — tracking script + homepage stats"
---

# Umami Analytics Integration

## Overview

Add Umami Cloud analytics to the personal Jekyll blog. Two parts: (1) tracking script on every page for data collection, (2) homepage stats cards showing total pageviews, monthly visitors, current online users, and browser distribution.

## Tracking Script

- Insert Umami tracking `<script>` tag into `_layouts/default.html` before `</head>`.
- Script loads from `https://cloud.umami.is/script.js` with `data-website-id="a3836ca7-5a2a-4271-af29-1c189ac6a436"`.
- No additional config needed — Umami auto-tracks pageviews, referrers, devices, browsers, etc.
- Since the blog uses `fetch()` + `history.pushState` for SPA-style navigation, Umami's default script handles SPA route changes automatically via the `data-auto-track` behavior.

## Homepage Stats

### Layout

Retain the existing 3 stat cards (posts, monthly words, days running). Append a second row of Umami stats below, separated by a divider. Followed by a single-line browser distribution.

```
┌─────────────────────────────────────────────────┐
│  [文章]  [本月字数]  [运行天数]                     │ ← existing
├─────────────────────────────────────────────────┤
│  [总浏览]  [本月访客]  [当前在线]                    │ ← Umami stats
├─────────────────────────────────────────────────┤
│  Chrome 58% · Safari 22% · Edge 12% · 其他 8%   │ ← browser row
└─────────────────────────────────────────────────┘
```

If an API call fails or Umami is unreachable, the affected card shows "—" and the browser row is hidden. No blocking of page render.

### Data Source

Use Umami's **public share API** (no API Key required):

1. User enables public sharing in Umami Cloud dashboard → obtains a `shareToken`
2. Frontend JS calls:
   - `GET /api/websites/{websiteId}/stats?startAt={ts}&endAt={ts}` with header `x-umami-share-token: {token}`
     → returns `{ pageviews: {value, prev}, visitors: {value, prev}, visits: {value, prev} }`
   - `GET /api/websites/{websiteId}/active` with header `x-umami-share-token: {token}`
     → returns `{ visitors: number }`
   - `GET /api/websites/{websiteId}/metrics?type=browser&startAt={ts}&endAt={ts}` with header `x-umami-share-token: {token}`
     → returns `[{ x: "Chrome", y: 120 }, { x: "Safari", y: 45 }, ...]`

3. For "this month" queries:
   - `startAt` = first millisecond of current month
   - `endAt` = `Date.now()`

4. Browser percentages are calculated client-side from raw counts.

### Files Changed

| File | Change |
|---|---|
| `_layouts/default.html` | Add Umami tracking script in `<head>` |
| `index.html` | Add second row of stat card HTML + browser row |
| `assets/js/blog.js` | Add `fetchUmamiStats()` async function, call on page load |

### States

- **Loading**: Cards show a brief "..." pulse (existing pattern)
- **Success**: Real values rendered
- **Error (API down / rate limit)**: Display "—", browser row hidden
- **Empty (no data yet)**: Cards show 0, browser row shows "暂无数据"

### Error Handling

- All API calls wrapped in try/catch. One failing endpoint does not block others.
- Minimum 3-second timeout on fetch to avoid hanging.
- No retry logic — stats are non-critical content.

## Non-Goals

- No backend server or serverless function
- No real-time auto-refresh (stats update on page load)
- No deep Umami dashboard embedding
