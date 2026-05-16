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
  var welcomeEl = document.getElementById('welcome-message');
  var currentActiveItem = null;

  function renderMonthNav(posts) {
    var months = getMonths(posts);
    var html = '';
    var currentYear = null;
    months.forEach(function(m, i) {
      if (currentYear !== m.year) {
        currentYear = m.year;
        html += '<span class="year-label">' + m.year + '</span>';
      }
      html += '<button class="month-btn' + (i === 0 ? ' active' : '') + '" data-month="' + m.year + '-' + String(m.month + 1).padStart(2, '0') + '">' + m.label + '</button>';
    });
    monthNavEl.innerHTML = html;

    // 绑定月份筛选
    monthNavEl.querySelectorAll('.month-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        monthNavEl.querySelectorAll('.month-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderPostList(posts, btn.dataset.month);
      });
    });
  }

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
    if (window.innerWidth < 768) {
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
    if (window.innerWidth < 768) {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    } else {
      sidebar.classList.toggle('collapsed');
      var btn = document.getElementById('sidebar-toggle');
      if (btn) btn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    }
  }

  function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  // === 初始化 ===
  function init() {
    // 添加手机端汉堡按钮
    var mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = '☰';
    mobileBtn.onclick = toggleSidebar;
    document.body.appendChild(mobileBtn);

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

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
