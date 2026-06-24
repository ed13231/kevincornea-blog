/* =================================================================
   KEVIN CORNEA — JAVASCRIPT
   -----------------------------------------------------------------
   KEVIN: Nu e nevoie să modifici acest fișier. El se ocupă de:
     1. Meniul de tip "hamburger" pe telefon
     2. Afișarea automată a articolelor din 'posts.json'
     3. Anul curent din footer
   ================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ----- 1. MENIU MOBIL (hamburger) ----------------------------- */
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    });

    // La click pe un link, închide meniul (util pe telefon)
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Deschide meniul');
      });
    });
  }

  /* ----- 2. ANUL CURENT ÎN FOOTER ------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ----- 2b. CONSIMȚĂMÂNT: butonul Trimite e activ doar dacă bifa e bifată -- */
  const consent = document.getElementById('cf-consent');
  const submitBtn = document.getElementById('cf-submit');
  if (consent && submitBtn) {
    const sync = function () { submitBtn.disabled = !consent.checked; };
    consent.addEventListener('change', sync);
    sync(); // stare inițială corectă
  }

  /* ----- 3. ÎNCĂRCAREA ARTICOLELOR DIN posts.json --------------- */
  const grid = document.getElementById('postGrid');
  if (!grid) { return; }

  // Numele lunilor în română, pentru afișarea datei
  const LUNI = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
                'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  function formateazaData(iso) {
    // primește "2025-01-15" și returnează "15 Ianuarie 2025"
    const parts = String(iso).split('-');
    if (parts.length !== 3) { return iso; }
    const an   = parts[0];
    const luna = LUNI[parseInt(parts[1], 10) - 1] || '';
    const zi   = parseInt(parts[2], 10);
    return zi + ' ' + luna + ' ' + an;
  }

  function scapaHtml(text) {
    // protejează împotriva caracterelor speciale în text
    const d = document.createElement('div');
    d.textContent = text == null ? '' : text;
    return d.innerHTML;
  }

  function construiesteCard(post) {
    const meta = scapaHtml(post.category) + ' &middot; ' + scapaHtml(formateazaData(post.date));
    const thumb = post.thumbnail
      ? '<img class="post-card__thumb" src="' + scapaHtml(post.thumbnail) +
        '" alt="' + scapaHtml(post.title) + '" loading="lazy">'
      : '';
    const summary = post.summary
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

  fetch('posts.json', { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) { throw new Error('Status ' + res.status); }
      return res.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts)) { posts = []; }
      // Ascunde articolele arhivate și pe cele programate (până le vine data)
      var now = new Date();
      var visible = posts.filter(function (p) {
        if (p && p.archived) { return false; }
        if (p && p.publishAt && new Date(p.publishAt) > now) { return false; }
        return true;
      });
      if (visible.length === 0) {
        grid.innerHTML = '<p class="post-grid-error">Niciun articol publicat încă.</p>';
        return;
      }
      grid.innerHTML = visible.map(construiesteCard).join('');
    })
    .catch(function (err) {
      console.error('Nu am putut încărca posts.json:', err);
      grid.innerHTML =
        '<p class="post-grid-error">Articolele nu au putut fi încărcate. ' +
        'Dacă vezi acest mesaj pe site-ul publicat, verifică fișierul posts.json.</p>';
    });

});
