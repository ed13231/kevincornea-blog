document.addEventListener('DOMContentLoaded', function () {

  /* ----- 1. MENIU MOBIL (hamburger) ----------------------------- */
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Deschide meniul');
      });
    });
  }

  /* ----- 2. ANUL CURENT ÎN FOOTER ------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ----- 2b. CONSIMȚĂMÂNT --------------------------------------- */
  var consent = document.getElementById('cf-consent');
  var submitBtn = document.getElementById('cf-submit');
  if (consent && submitBtn) {
    var sync = function () { submitBtn.disabled = !consent.checked; };
    consent.addEventListener('change', sync);
    sync();
  }

  /* ----- UTILITĂȚI COMUNE --------------------------------------- */
  var LUNI = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
              'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  function formateazaData(iso) {
    var parts = String(iso).split('-');
    if (parts.length !== 3) { return iso; }
    var an   = parts[0];
    var luna = LUNI[parseInt(parts[1], 10) - 1] || '';
    var zi   = parseInt(parts[2], 10);
    return zi + ' ' + luna + ' ' + an;
  }

  function scapaHtml(text) {
    var d = document.createElement('div');
    d.textContent = text == null ? '' : text;
    return d.innerHTML;
  }

  function construiesteCard(post) {
    var meta = scapaHtml(post.category) + ' &middot; ' + scapaHtml(formateazaData(post.date));
    var thumb = post.thumbnail
      ? '<img class="post-card__thumb" src="' + scapaHtml(post.thumbnail) +
        '" alt="' + scapaHtml(post.title) + '" loading="lazy">'
      : '';
    var summary = post.summary
      ? '<p class="post-card__summary">' + scapaHtml(post.summary) + '</p>'
      : '';

    return '' +
      '<article class="post-card">' +
        thumb +
        '<div class="post-card__body">' +
          '<p class="post-card__meta">' + meta + '</p>' +
          '<h3 class="post-card__title">' +
            '<a href="' + scapaHtml(post.file) + '">' + scapaHtml(post.title) + '</a>' +
          '</h3>' +
          summary +
          '<a class="post-card__more" href="' + scapaHtml(post.file) + '">Citește mai mult &rarr;</a>' +
        '</div>' +
      '</article>';
  }

  function filtreazaVizibile(posts) {
    var now = new Date();
    return posts.filter(function (p) {
      if (p && p.archived) { return false; }
      if (p && p.publishAt && new Date(p.publishAt) > now) { return false; }
      return true;
    });
  }

  /* ----- 3. HOMEPAGE — ULTIMELE 3 ARTICOLE ---------------------- */
  var latestGrid = document.getElementById('latestPostGrid');
  if (latestGrid) {
    fetch('posts.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) { throw new Error('Status ' + res.status); }
        return res.json();
      })
      .then(function (posts) {
        if (!Array.isArray(posts)) { posts = []; }
        var visible = filtreazaVizibile(posts);
        if (visible.length === 0) {
          latestGrid.innerHTML = '<p class="post-grid-error">Niciun articol publicat încă.</p>';
          return;
        }
        var latest = visible.slice(0, 3);
        latestGrid.innerHTML = latest.map(construiesteCard).join('');
      })
      .catch(function () {
        latestGrid.innerHTML = '<p class="post-grid-error">Articolele nu au putut fi încărcate.</p>';
      });
  }

  /* ----- 4. BLOG — SEARCH + PAGINARE ---------------------------- */
  var blogGrid = document.getElementById('postGrid');
  var searchInput = document.getElementById('searchInput');
  var paginationEl = document.getElementById('pagination');

  if (blogGrid && searchInput && paginationEl) {
    var POSTS_PER_PAGE = 6;
    var allPosts = [];
    var currentPage = 1;

    function getFilteredPosts() {
      var query = searchInput.value.trim().toLowerCase();
      if (!query) { return allPosts; }
      return allPosts.filter(function (p) {
        return (p.title && p.title.toLowerCase().indexOf(query) !== -1) ||
               (p.summary && p.summary.toLowerCase().indexOf(query) !== -1) ||
               (p.category && p.category.toLowerCase().indexOf(query) !== -1);
      });
    }

    function renderPagination(total) {
      var totalPages = Math.ceil(total / POSTS_PER_PAGE);
      if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
      }
      var html = '';
      html += '<button class="pagination-prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&laquo; Înapoi</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="pagination-num' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
      }
      html += '<button class="pagination-next"' + (currentPage >= totalPages ? ' disabled' : '') + '>Înainte &raquo;</button>';
      paginationEl.innerHTML = html;

      paginationEl.querySelector('.pagination-prev').addEventListener('click', function () {
        if (currentPage > 1) { currentPage--; renderBlog(); }
      });
      paginationEl.querySelector('.pagination-next').addEventListener('click', function () {
        if (currentPage < totalPages) { currentPage++; renderBlog(); }
      });
      paginationEl.querySelectorAll('.pagination-num').forEach(function (btn) {
        btn.addEventListener('click', function () {
          currentPage = parseInt(btn.getAttribute('data-page'), 10);
          renderBlog();
        });
      });
    }

    function renderBlog() {
      var filtered = getFilteredPosts();
      if (filtered.length === 0) {
        blogGrid.innerHTML = '<p class="post-grid-error">Niciun articol găsit.</p>';
        paginationEl.innerHTML = '';
        return;
      }
      var start = (currentPage - 1) * POSTS_PER_PAGE;
      var page = filtered.slice(start, start + POSTS_PER_PAGE);
      blogGrid.innerHTML = page.map(construiesteCard).join('');
      renderPagination(filtered.length);
    }

    searchInput.addEventListener('input', function () {
      currentPage = 1;
      renderBlog();
    });

    fetch('posts.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) { throw new Error('Status ' + res.status); }
        return res.json();
      })
      .then(function (posts) {
        if (!Array.isArray(posts)) { posts = []; }
        allPosts = filtreazaVizibile(posts);
        renderBlog();
      })
      .catch(function (err) {
        console.error('Nu am putut încărca posts.json:', err);
        blogGrid.innerHTML =
          '<p class="post-grid-error">Articolele nu au putut fi încărcate. ' +
          'Verifică fișierul posts.json.</p>';
      });
  }

});
