# Umami Analytics Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Umami Cloud tracking script and homepage analytics cards to the Jekyll blog.

**Architecture:** Tracking script loaded in `<head>` collects pageview/device/browser data. On the homepage, browser-side JS fetches stats via Umami's public share API (no backend needed) and renders a second row of stat cards.

**Tech Stack:** Umami Cloud (analytics), Jekyll/GitHub Pages (static site), vanilla JS (API fetch + DOM)

---

### Task 1: Add Umami tracking script

**Files:**
- Modify: `_layouts/default.html`

- [ ] **Step 1: Insert tracking script before `</head>`**

Edit `_layouts/default.html` — add the Umami script tag after the SEO tag line (line 14), before `</head>`:

```html
  {% seo %}
  <script defer src="https://cloud.umami.is/script.js" data-website-id="a3836ca7-5a2a-4271-af29-1c189ac6a436"></script>
</head>
```

- [ ] **Step 2: Verify the change**

Open the built site locally with `bundle exec jekyll serve --livereload --future`, view page source, confirm the script tag appears in `<head>` with correct `data-website-id`.

- [ ] **Step 3: Commit**

```bash
git add _layouts/default.html
git commit -m "feat: add Umami Cloud analytics tracking script"
```

---

### Task 2: Add Umami stats HTML to homepage

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add second stats row after the existing `.welcome-stats`**

In `index.html`, after the existing `.welcome-stats` div (line 72), add a divider and a second stats row with browser distribution below:

```html
        </div>
        <div class="welcome-divider"></div>
        <div class="welcome-stats welcome-stats-umami">
          <div class="stat-card">
            <span class="stat-number" id="stat-pageviews">...</span>
            <span class="stat-label">总浏览</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stat-visitors">...</span>
            <span class="stat-label">本月访客</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stat-online">...</span>
            <span class="stat-label">当前在线</span>
          </div>
        </div>
        <div id="browser-dist" class="browser-dist" style="display:none"></div>
      </div>
    </div>
```

Key notes:
- Use class `welcome-stats-umami` to allow potential CSS differentiation (not strictly needed since `.welcome-stats` styles apply to both)
- Initial values show `"..."` as loading indicator
- `#browser-dist` is hidden by default, shown by JS when data loads

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add homepage Umami stats card HTML"
```

---

### Task 3: Implement Umami API fetching and rendering

**Files:**
- Modify: `assets/js/blog.js`

- [ ] **Step 1: Add config constants and share token at top of blog.js**

Near the top of `assets/js/blog.js`, after the `const posts = ...` line (line 5), add:

```js
  // Umami analytics
  const UMAMI_API = 'https://api.umami.is/v1';
  const UMAMI_WEBSITE_ID = 'a3836ca7-5a2a-4271-af29-1c189ac6a436';
  const UMAMI_SHARE_TOKEN = 'm7NbQ2xygYbPg507';
```

- [ ] **Step 2: Add helper function for Umami API calls**

Add after the constants:

```js
  async function umamiFetch(path) {
    var url = UMAMI_API + path;
    if (path.indexOf('?') === -1) {
      url += '?cache=' + Date.now();
    } else {
      url += '&cache=' + Date.now();
    }
    var res = await fetch(url, {
      headers: { 'x-umami-share-token': UMAMI_SHARE_TOKEN }
    });
    if (!res.ok) throw new Error('Umami API error: ' + res.status);
    return res.json();
  }
```

- [ ] **Step 3: Add month range helper**

```js
  function thisMonthRange() {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startAt: start.getTime(), endAt: now.getTime() };
  }
```

- [ ] **Step 4: Add main Umami stats fetch function**

```js
  async function loadUmamiStats() {
    var pageviewsEl = document.getElementById('stat-pageviews');
    var visitorsEl = document.getElementById('stat-visitors');
    var onlineEl = document.getElementById('stat-online');
    var browserEl = document.getElementById('browser-dist');
    if (!pageviewsEl) return;

    try {
      // Fetch all 3 endpoints in parallel
      var range = thisMonthRange();
      var [statsData, activeData, browserData] = await Promise.all([
        umamiFetch('/websites/' + UMAMI_WEBSITE_ID + '/stats?startAt=' + range.startAt + '&endAt=' + range.endAt),
        umamiFetch('/websites/' + UMAMI_WEBSITE_ID + '/active'),
        umamiFetch('/websites/' + UMAMI_WEBSITE_ID + '/metrics?type=browser&startAt=' + range.startAt + '&endAt=' + range.endAt)
      ]);

      // Render stats
      pageviewsEl.textContent = (statsData.pageviews && statsData.pageviews.value != null)
        ? statsData.pageviews.value.toLocaleString() : '0';
      visitorsEl.textContent = (statsData.visitors && statsData.visitors.value != null)
        ? statsData.visitors.value.toLocaleString() : '0';
      onlineEl.textContent = (activeData.visitors != null)
        ? String(activeData.visitors) : '0';

      // Render browser distribution
      if (browserData && browserData.length > 0) {
        var total = browserData.reduce(function(sum, b) { return sum + b.y; }, 0);
        var parts = browserData
          .sort(function(a, b) { return b.y - a.y; })
          .slice(0, 4)
          .map(function(b) {
            var pct = total > 0 ? Math.round(b.y / total * 100) : 0;
            return b.x + ' ' + pct + '%';
          });
        if (parts.length > 0) {
          browserEl.textContent = parts.join(' · ');
          browserEl.style.display = 'block';
        }
      }
    } catch (e) {
      // On error, show dashes and hide browser row
      pageviewsEl.textContent = '—';
      visitorsEl.textContent = '—';
      onlineEl.textContent = '—';
      if (browserEl) browserEl.style.display = 'none';
    }
  }
```

- [ ] **Step 5: Call loadUmamiStats on page load**

Inside the `init()` function (around line 446), add the call at the end, right before `initThemeToggle()`:

```js
    loadUmamiStats();
    initThemeToggle();
```

- [ ] **Step 6: Add browser-dist CSS**

In `assets/css/main.scss`, after the `.stat-card` block (around line 549), add:

```scss
.browser-dist {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.3px;
}
```

- [ ] **Step 7: Verify locally**

```bash
bundle exec jekyll serve --livereload --future
```

Open `http://localhost:4000`, check:
- Second stats row appears with Umami data
- Browser distribution line shows below stats
- Loading state shows "..." briefly
- Error state shows "—" (test by temporarily setting wrong token)
- Existing stats (posts, words, days) are unchanged

- [ ] **Step 8: Commit**

```bash
git add assets/js/blog.js index.html assets/css/main.scss
git commit -m "feat: add Umami stats cards and browser distribution to homepage"
```

---

### Task 4: Final smoke test

- [ ] **Step 1: Full build**

```bash
bundle exec jekyll build --future
```

- [ ] **Step 2: Verify no build errors**

Check terminal output for `Build complete` or `done` with zero errors.

- [ ] **Step 3: Push and verify on GitHub Pages**

```bash
git push
```

Visit `https://belber.github.io`, confirm analytics cards render correctly and Umami Cloud is receiving visit data.
