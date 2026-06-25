// =================================================================
// FUNCȚIE DE ADMINISTRARE BLOG — primește comenzi de la admin.html
// (publicare, editare, ștergere, arhivare) și le aplică în repository
// prin GitHub API. Vercel republică automat site-ul.
//
// Variabile necesare în Vercel (Settings → Environment Variables):
//   GITHUB_TOKEN, GITHUB_REPO ("user/repo"), PUBLISH_PASSWORD
// =================================================================

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodă nepermisă.' }); return; }

  const body = req.body || {};
  const action = body.action || 'publish';

  if (!process.env.PUBLISH_PASSWORD || body.password !== process.env.PUBLISH_PASSWORD) {
    res.status(401).json({ error: 'Parolă greșită.' }); return;
  }
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) { res.status(500).json({ error: 'Server neconfigurat (GITHUB_TOKEN / GITHUB_REPO).' }); return; }

  const apiBase = `https://api.github.com/repos/${repo}/contents/`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'kc-admin',
    'Content-Type': 'application/json'
  };
  const encPath = (p) => p.split('/').map(encodeURIComponent).join('/');
  const toB64 = (s) => Buffer.from(s, 'utf8').toString('base64');
  const fromB64 = (s) => Buffer.from(s, 'base64').toString('utf8');

  async function getFile(path) {
    const r = await fetch(apiBase + encPath(path) + '?ref=main', { headers });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`Citire ${path}: ${r.status}`);
    return r.json();
  }
  async function putFile(path, contentB64, message, sha) {
    const p = { message, content: contentB64, branch: 'main' };
    if (sha) p.sha = sha;
    const r = await fetch(apiBase + encPath(path), { method: 'PUT', headers, body: JSON.stringify(p) });
    if (!r.ok) { const t = await r.text(); throw new Error(`Scriere ${path}: ${r.status} ${t}`); }
    return r.json();
  }
  async function delFile(path, message, sha) {
    const r = await fetch(apiBase + encPath(path), { method: 'DELETE', headers, body: JSON.stringify({ message, sha, branch: 'main' }) });
    if (!r.ok && r.status !== 404) { const t = await r.text(); throw new Error(`Ștergere ${path}: ${r.status} ${t}`); }
    return true;
  }
  async function readPosts() {
    const pj = await getFile('posts.json');
    let list = [];
    if (pj && pj.content) { try { list = JSON.parse(fromB64(pj.content)); } catch (e) { list = []; } }
    return { list, sha: pj ? pj.sha : undefined };
  }
  async function writePosts(list, sha) {
    return putFile('posts.json', toB64(JSON.stringify(list, null, 2) + '\n'), 'Actualizare listă articole', sha);
  }
  function slugify(s) {
    const map = { 'ă':'a','â':'a','î':'i','ș':'s','ş':'s','ț':'t','ţ':'t' };
    return String(s || '').replace(/[ăâîșşțţ]/gi, (c) => map[c.toLowerCase()] || c)
      .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'articol';
  }

  try {
    // ---------- ȘTERGERE ----------
    if (action === 'delete') {
      const slug = body.slug;
      if (!slug) { res.status(400).json({ error: 'Lipsește slug.' }); return; }
      const { list, sha } = await readPosts();
      const idx = list.findIndex((p) => p.slug === slug);
      const entry = idx >= 0 ? list[idx] : null;
      const hp = `posts/${slug}.html`;
      const hf = await getFile(hp);
      if (hf) await delFile(hp, `Șterge articol: ${slug}`, hf.sha);
      if (entry && entry.thumbnail) {
        const tf = await getFile(entry.thumbnail);
        if (tf) await delFile(entry.thumbnail, `Șterge imagine: ${slug}`, tf.sha);
      }
      if (idx >= 0) { list.splice(idx, 1); await writePosts(list, sha); }
      res.status(200).json({ ok: true }); return;
    }

    // ---------- ARHIVARE / DEZARHIVARE ----------
    if (action === 'archive') {
      const slug = body.slug; const archived = !!body.archived;
      const { list, sha } = await readPosts();
      const entry = list.find((p) => p.slug === slug);
      if (!entry) { res.status(404).json({ error: 'Articol inexistent.' }); return; }
      if (archived) entry.archived = true; else delete entry.archived;
      await writePosts(list, sha);
      res.status(200).json({ ok: true }); return;
    }

    // ---------- PUBLICARE / EDITARE ----------
    const isEdit = !!body.isEdit;
    const title = body.title;
    if (!title || !body.postHtml) { res.status(400).json({ error: 'Date incomplete.' }); return; }

    const { list, sha: pjSha } = await readPosts();

    let finalSlug;
    if (isEdit && body.slug) {
      finalSlug = body.slug;
    } else {
      finalSlug = slugify(body.slug || title);
      if (list.some((p) => p.slug === finalSlug) || await getFile(`posts/${finalSlug}.html`)) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-5)}`;
      }
    }

    // Thumbnail
    let thumbnailRel = body.keepThumbnail || '';
    let thumbForHtml = thumbnailRel ? `../${thumbnailRel}` : '';
    if (body.imageBase64) {
      const ext = (body.imageExt || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      thumbnailRel = `images/posts/${finalSlug}-thumb.${ext}`;
      thumbForHtml = `../${thumbnailRel}`;
      const ex = await getFile(thumbnailRel);
      await putFile(thumbnailRel, body.imageBase64, `Imagine articol: ${title}`, ex ? ex.sha : undefined);
    }

    // Imagini din corpul textului (încărcate la publicare, token-urile devin căi reale)
    let html = body.postHtml;
    let md = body.bodyMarkdown || '';
    const bimgs = Array.isArray(body.bodyImages) ? body.bodyImages : [];
    for (let i = 0; i < bimgs.length; i++) {
      const bi = bimgs[i];
      if (!bi || !bi.base64 || !bi.token) continue;
      const ext = (bi.ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `images/posts/${finalSlug}-b${i}-${Date.now().toString().slice(-4)}.${ext}`;
      const ex = await getFile(path);
      await putFile(path, bi.base64, `Imagine în articol: ${title}`, ex ? ex.sha : undefined);
      const rel = `../${path}`;
      html = html.split(bi.token).join(rel);
      md = md.split(bi.token).join(rel);
    }

    // Injectăm calea thumbnail-ului și sursa (markdown) pentru editare ulterioară
    html = html.split('__THUMB_PATH__').join(thumbForHtml);
    html = html.split('__SOURCE_MD__').join(toB64(md));

    const postPath = `posts/${finalSlug}.html`;
    const exHtml = await getFile(postPath);
    await putFile(postPath, toB64(html), `${isEdit ? 'Editare' : 'Articol nou'}: ${title}`, exHtml ? exHtml.sha : undefined);

    const entry = {
      slug: finalSlug, title, date: body.date,
      category: body.category || 'Articol', summary: body.summary || '',
      thumbnail: thumbnailRel, file: postPath
    };
    if (body.archived) entry.archived = true;
    if (body.publishAt) entry.publishAt = body.publishAt;
    if (body.tags && Array.isArray(body.tags) && body.tags.length) entry.tags = body.tags;
    if (body.featured) entry.featured = true;
    if (body.heroStyle && body.heroStyle !== 'default') entry.heroStyle = body.heroStyle;
    if (body.accentColor && body.accentColor !== '#7C6A4E') entry.accentColor = body.accentColor;
    if (body.textColor && body.textColor !== '#2C2B28') entry.textColor = body.textColor;
    if (body.bgColor && body.bgColor !== '#F5F3EE') entry.bgColor = body.bgColor;
    if (body.fontSize && body.fontSize !== '18') entry.fontSize = body.fontSize;
    if (body.postWidth && body.postWidth !== '720') entry.postWidth = body.postWidth;
    if (body.customCss) entry.customCss = body.customCss;

    const existIdx = list.findIndex((p) => p.slug === finalSlug);
    if (existIdx >= 0) list[existIdx] = entry; else list.unshift(entry);
    await writePosts(list, pjSha);

    res.status(200).json({ ok: true, slug: finalSlug, file: postPath });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
