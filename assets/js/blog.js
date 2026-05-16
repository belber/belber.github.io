(function() {
  'use strict';

  // === 数据 ===
  const posts = window.__POSTS_DATA__ || [];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // === 工具函数 ===
  function groupByMonth(posts) {
    var groups = {};
    posts.forEach(function(p) {
      var d = new Date(p.date);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!groups[key]) {
        groups[key] = {
          year: d.getFullYear(),
          month: d.getMonth(),
          label: monthNames[d.getMonth()] + ' ' + d.getFullYear(),
          key: key,
          posts: []
        };
      }
      groups[key].posts.push(p);
    });
    var result = Object.keys(groups).map(function(k) { return groups[k]; });
    result.sort(function(a, b) {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return result;
  }

  function getMonths(posts) {
    var map = {};
    posts.forEach(function(p) {
      var d = new Date(p.date);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!map[key]) {
        map[key] = { year: d.getFullYear(), month: d.getMonth(), label: monthNames[d.getMonth()] + ' ' + d.getFullYear(), posts: [] };
      }
      map[key].posts.push(p);
    });
    return Object.keys(map).sort().reverse().map(function(k) { return map[k]; });
  }

  // === 渲染 ===
  var postListEl = document.getElementById('post-list');
  var monthNavEl = document.getElementById('month-nav');
  var postDisplayEl = document.getElementById('post-display');
  var welcomeEl = document.getElementById('welcome-area');
  var currentActiveItem = null;

  function renderMonthNav(posts) {
    var months = getMonths(posts);
    var years = [];
    months.forEach(function(m) {
      if (years.indexOf(m.year) === -1) years.push(m.year);
    });
    years.sort(function(a, b) { return b - a; }); // 倒序

    var selectedYear = years[0]; // 默认最新年份
    var selectedMonth = months.length > 0 ? months[0].key : null;

    function render() {
      var yearMonths = months.filter(function(m) { return m.year === selectedYear; });
      var html = '<span class="year-selector" onclick="toggleYearDropdown()">' + selectedYear + ' <span class="year-arrow">▼</span></span>';
      html += '<div id="year-dropdown" class="year-dropdown" style="display:none">';
      years.forEach(function(y) {
        html += '<button class="year-option' + (y === selectedYear ? ' active' : '') + '" data-year="' + y + '">' + y + '</button>';
      });
      html += '</div>';
      yearMonths.forEach(function(m) {
        var key = m.year + '-' + String(m.month + 1).padStart(2, '0');
        html += '<button class="month-btn' + (key === selectedMonth ? ' active' : '') + '" data-month="' + key + '">' + monthNames[m.month] + '</button>';
      });
      monthNavEl.innerHTML = html;

      // 绑定月份筛选
      monthNavEl.querySelectorAll('.month-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          selectedMonth = btn.dataset.month;
          monthNavEl.querySelectorAll('.month-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          renderPostList(posts, btn.dataset.month);
        });
      });

      // 绑定年份切换
      document.querySelectorAll('.year-option').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          selectedYear = parseInt(btn.dataset.year, 10);
          closeYearDropdown();
          render();
          // 选中年份的第一个月
          var firstMonth = monthNavEl.querySelector('.month-btn');
          if (firstMonth) firstMonth.click();
        });
      });
    }

    render();
  }

  window.toggleYearDropdown = function() {
    var dd = document.getElementById('year-dropdown');
    if (dd) dd.style.display = dd.style.display === 'none' ? '' : 'none';
  };

  function closeYearDropdown() {
    var dd = document.getElementById('year-dropdown');
    if (dd) dd.style.display = 'none';
  }

  // 点击其他区域关闭年份下拉
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.year-selector') && !e.target.closest('.year-dropdown')) {
      closeYearDropdown();
    }
  });

  function renderPostList(posts, activeMonthKey) {
    var groups = groupByMonth(posts);
    var html = '';

    groups.forEach(function(g) {
      var isExpanded = (g.key === activeMonthKey);
      var displayStyle = isExpanded ? '' : ' style="display:none"';
      var toggleIcon = isExpanded ? '▼' : '▶';

      html += '<div class="month-group' + (isExpanded ? ' expanded' : '') + '" data-month="' + g.key + '">';
      html += '<div class="month-header" data-month="' + g.key + '">';
      html += '  <span class="month-toggle-icon">' + toggleIcon + '</span>';
      html += '  <span class="month-label">' + g.label + ' <span class="month-count">(' + g.posts.length + ')</span></span>';
      html += '</div>';
      html += '<div class="month-posts"' + displayStyle + '>';
      g.posts.forEach(function(p) {
        html += '<div class="post-item" data-url="' + p.url + '">';
        html += '  <div class="post-item-title">' + p.title + '</div>';
        html += '  <div class="post-item-excerpt">' + p.excerpt + '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    });

    postListEl.innerHTML = html;

    // 月份标题点击折叠/展开
    postListEl.querySelectorAll('.month-header').forEach(function(hdr) {
      hdr.addEventListener('click', function(e) {
        var group = this.parentNode;
        var postsDiv = group.querySelector('.month-posts');
        var icon = this.querySelector('.month-toggle-icon');
        if (postsDiv.style.display === 'none') {
          postsDiv.style.display = '';
          icon.textContent = '▼';
          group.classList.add('expanded');
        } else {
          postsDiv.style.display = 'none';
          icon.textContent = '▶';
          group.classList.remove('expanded');
        }
      });
    });

    // 文章点击事件
    postListEl.querySelectorAll('.post-item').forEach(function(item) {
      item.addEventListener('click', function() {
        loadPost(item.dataset.url, item);
      });
    });
  }

  function loadPost(url, listItem) {
    // 高亮当前文章
    if (currentActiveItem) {
      currentActiveItem.classList.remove('active');
    }
    listItem.classList.add('active');
    currentActiveItem = listItem;

    // 移动端选择文章后收起侧栏
    if (window.innerWidth < 660) {
      closeSidebar();
    }

    // 显示加载状态
    welcomeEl.style.display = 'none';
    postDisplayEl.style.display = 'block';
    postDisplayEl.innerHTML = '<p style="color:#999;padding:20px;">加载中...</p>';

    // 用 fetch 获取文章页面
    fetch(url)
      .then(function(response) { return response.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var article = doc.querySelector('.post-article');
        if (article) {
          postDisplayEl.innerHTML = article.outerHTML;
          // 计算字数和阅读时长
          var contentEl = postDisplayEl.querySelector('.post-article-content');
          var etaEl = postDisplayEl.querySelector('.post-article-eta');
          if (contentEl && etaEl) {
            var text = contentEl.textContent.replace(/\s+/g, '');
            var charCount = text.length;
            var minutes = Math.max(1, Math.ceil(charCount / 300));
            etaEl.textContent = charCount + ' 字 · ' + minutes + ' 分钟';
          }
          // 上下篇导航
          var articleEl = postDisplayEl.querySelector('.post-article');
          var currentUrl = url.replace(/\/$/, '');
          var idx = -1;
          for (var i = 0; i < posts.length; i++) {
            if (posts[i].url.replace(/\/$/, '') === currentUrl) { idx = i; break; }
          }
          if (articleEl && idx !== -1) {
            var navHtml = '<nav class="post-nav">';
            if (idx < posts.length - 1) {
              var prev = posts[idx + 1];
              navHtml += '<a class="post-nav-link post-nav-prev" href="' + prev.url + '"><span class="post-nav-dir">← 上一篇</span><span class="post-nav-title">' + prev.title + '</span></a>';
            } else {
              navHtml += '<span class="post-nav-link post-nav-prev post-nav-disabled"></span>';
            }
            if (idx > 0) {
              var next = posts[idx - 1];
              navHtml += '<a class="post-nav-link post-nav-next" href="' + next.url + '"><span class="post-nav-dir">下一篇 →</span><span class="post-nav-title">' + next.title + '</span></a>';
            } else {
              navHtml += '<span class="post-nav-link post-nav-next post-nav-disabled"></span>';
            }
            navHtml += '</nav>';
            articleEl.insertAdjacentHTML('beforeend', navHtml);
            // 给 nav 内的链接绑定点击事件
            articleEl.querySelectorAll('.post-nav a').forEach(function(link) {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                var targetUrl = this.getAttribute('href');
                var items = postListEl.querySelectorAll('.post-item');
                for (var j = 0; j < items.length; j++) {
                  if (items[j].dataset.url === targetUrl) {
                    loadPost(targetUrl, items[j]);
                    break;
                  }
                }
              });
            });
          }
          // Lightbox：图片点击放大
          postDisplayEl.querySelectorAll('.post-article-content img').forEach(function(img) {
            img.addEventListener('click', function(e) {
              openLightbox(this.src);
            });
          });

          // 过渡动画
          postDisplayEl.style.animation = 'none';
          postDisplayEl.offsetHeight; // 触发回流
          postDisplayEl.style.animation = 'fadeIn 0.2s ease';
          // 更新 URL
          history.pushState(null, '', url);
        } else {
          postDisplayEl.innerHTML = '<p>文章内容加载失败</p>';
        }
      })
      .catch(function() {
        postDisplayEl.innerHTML = '<p>文章加载失败，请重试</p>';
      });
  }

  // === 根据当前路径加载文章 ===
  function loadInitialPost() {
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') {
      var items = postListEl.querySelectorAll('.post-item');
      for (var i = 0; i < items.length; i++) {
        var url = items[i].dataset.url;
        if (url === path) {
          var group = items[i].closest('.month-group');
          if (group) {
            var postsDiv = group.querySelector('.month-posts');
            var icon = group.querySelector('.month-toggle-icon');
            if (postsDiv) postsDiv.style.display = '';
            if (icon) icon.textContent = '▼';
            group.classList.add('expanded');
          }
          loadPost(url, items[i]);
          items[i].scrollIntoView({ block: 'center' });
          break;
        }
      }
    }
  }

  // === 侧栏交互 ===
  function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    if (window.innerWidth < 660) {
      sidebar.classList.remove('collapsed');
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    } else {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      sidebar.classList.toggle('collapsed');
      var btn = document.getElementById('sidebar-toggle');
      if (btn) btn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';

      // 折叠时保存宽度并清除内联样式，让 CSS 的 collapsed 宽度生效；
      // 展开时恢复内联宽度
      if (sidebar.classList.contains('collapsed')) {
        sidebar.dataset.expandedWidth = sidebar.style.width || getComputedStyle(sidebar).width;
        sidebar.style.width = '';
        sidebar.style.minWidth = '';
      } else {
        var w = sidebar.dataset.expandedWidth;
        if (w) {
          sidebar.style.width = w;
          sidebar.style.minWidth = w;
        }
      }
    }
  }

  function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

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
    overlay.innerHTML = '';
    var img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('alt', '');
    overlay.appendChild(img);
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

  // === 初始化 ===
  function init() {
    // 添加遮罩层
    var overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);

    // 绑定侧栏折叠按钮
    var toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) toggleBtn.onclick = toggleSidebar;

    renderMonthNav(posts);
    // 默认选择第一个月份
    var firstMonth = monthNavEl.querySelector('.month-btn');
    if (firstMonth) {
      renderPostList(posts, firstMonth.dataset.month);
    }
    loadInitialPost();
  }

  // 窗口 resize 时清理跨断点状态残留
  window.addEventListener('resize', function() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (window.innerWidth >= 660 && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      var overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.classList.remove('active');
    }
    if (window.innerWidth >= 660 && sidebar.classList.contains('collapsed')) {
      // 从手机端展开后，如果侧栏是折叠状态，展开它
      sidebar.classList.remove('collapsed');
      var toggleBtn = document.getElementById('sidebar-toggle');
      if (toggleBtn) toggleBtn.textContent = '◀';
      var w = sidebar.dataset.expandedWidth;
      if (w) {
        sidebar.style.width = w;
        sidebar.style.minWidth = w;
      }
    }
  });

  // === 侧栏拖拽 ===
  function initResizeHandle() {
    var handle = document.getElementById('sidebar-resize-handle');
    var sidebar = document.getElementById('sidebar');
    if (!handle || !sidebar) return;

    // 恢复保存的宽度
    try {
      var saved = localStorage.getItem('sidebar_width');
      if (saved) {
        sidebar.style.width = saved;
        sidebar.style.minWidth = saved;
      }
    } catch(e) {}

    var startX, startWidth;

    function onStart(e) {
      if (sidebar.classList.contains('collapsed')) return;
      if (window.innerWidth < 660) return;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      sidebar.style.transition = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    }

    function onMove(e) {
      var width = startWidth + (e.clientX - startX);
      width = Math.max(180, Math.min(500, width));
      sidebar.style.width = width + 'px';
      sidebar.style.minWidth = width + 'px';
    }

    function onEnd() {
      handle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      sidebar.style.transition = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      try { localStorage.setItem('sidebar_width', sidebar.style.width); } catch(e) {}
    }

    handle.addEventListener('mousedown', onStart);
  }

  // 在 init 最后调用
  var origInit = init;
  init = function() {
    origInit();
    initResizeHandle();
  };

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
