# Blogul lui Kevin Cornea

Acesta este site-ul tău personal. Funcționează doar din fișiere simple (HTML, CSS, JS),
fără programe complicate. Mai jos găsești tot ce ai nevoie ca să-l pui online și să adaugi
articole noi — fără să știi să programezi.

---

## Cuprins w

1. [Cum arată fișierele](#cum-arată-fișierele)
2. [Cum adaug un articol nou](#cum-adaug-un-articol-nou) ← cel mai folosit
3. [Cum pun site-ul online (GitHub + Vercel)](#cum-pun-site-ul-online)
4. [Cum conectez domeniul kevincornea.blog](#cum-conectez-domeniul)
5. [Setări de făcut o singură dată](#setări-de-făcut-o-singură-dată)

---

## Cum arată fișierele

```
kevincornea-blog/
├── index.html              ← Pagina principală (n-o modifici manual)
├── style.css               ← Cum arată site-ul (culori, fonturi)
├── script.js               ← Codul care afișează automat articolele
├── posts.json              ← LISTA articolelor (asta editezi des)
├── posts/
│   ├── post-template.html  ← ȘABLONUL pe care îl copiezi la fiecare articol nou
│   ├── primul-articol-exemplu.html
│   └── al-doilea-articol-exemplu.html
└── images/
    ├── hero-photo.jpg      ← Poza ta de pe prima pagină
    └── posts/              ← Pozele articolelor (thumbnail-uri)
```

> Reține doar două lucruri: **articolele** stau în folderul `posts/`, iar **lista** lor
> stă în fișierul `posts.json`. Restul funcționează singur.

---

## Cum adaug un articol nou

Sunt 5 pași. Durează ~5 minute.

### Pasul 1 — Pregătește textul articolului
Scrie articolul cum vrei tu, într-un document obișnuit.

### Pasul 2 — Transformă textul în HTML cu ajutorul AI
Deschide Claude sau ChatGPT și spune-i exact așa:

> Am un șablon HTML de articol pentru blogul meu. Completează-l cu textul de mai jos.
> Titlul este: **[titlul tău]**
> Data este: **[data de azi]**
> Categoria este: **[ex: Reportaj]**
> Textul articolului: **[lipești tot textul]**
> Returnează doar codul HTML complet, gata de copiat, fără explicații.

Apoi lipește-i și conținutul fișierului `posts/post-template.html` ca model.
Vei primi înapoi codul HTML complet al articolului.

### Pasul 3 — Creează fișierul articolului pe GitHub
1. Intră pe **github.com**, în repository-ul tău `kevincornea-blog`.
2. Deschide folderul `posts/`.
3. Apasă **Add file → Create new file**.
4. La nume scrie: `posts/titlul-articolului.html`
   — fără diacritice și fără spații (folosește `-` în loc de spațiu).
   Exemplu: `posts/calatorie-la-munte.html`
5. Lipește codul HTML primit de la AI.
6. Jos, apasă **Commit changes**.

### Pasul 4 — Adaugă articolul în listă (`posts.json`)
1. Deschide fișierul `posts.json`, apasă creionul ✏️ ca să-l editezi.
2. Adaugă un obiect nou **la începutul listei** (cel mai nou articol primul).
   Copiază blocul de mai jos și schimbă valorile:

```json
  {
    "slug": "calatorie-la-munte",
    "title": "Călătorie la munte",
    "date": "2025-03-22",
    "category": "Reportaj",
    "summary": "Un rezumat în 1–2 propoziții care apare pe card.",
    "thumbnail": "images/posts/calatorie-la-munte-thumb.jpg",
    "file": "posts/calatorie-la-munte.html"
  },
```

> ⚠️ Atenție la virgule: fiecare articol se desparte de următorul printr-o virgulă `,`,
> dar **ultimul** articol din listă NU are virgulă după el. Dacă nu ești sigur, lipește
> tot fișierul în Claude/ChatGPT și cere-i: „verifică dacă acest JSON e valid".

3. Apasă **Commit changes**.

### Pasul 5 — Încarcă imaginea (thumbnail)
1. Intră în folderul `images/posts/`.
2. Apasă **Add file → Upload files** și trage imaginea acolo.
3. Numele imaginii trebuie să fie **exact** cel scris la `thumbnail` în `posts.json`
   (ex: `calatorie-la-munte-thumb.jpg`).
4. **Commit changes**.

**Gata!** În ~30 de secunde site-ul se actualizează singur și articolul apare pe pagina **Blog**.

---

## Cum pun site-ul online

(De făcut o singură dată, la început.)

### A. GitHub — unde stă codul
1. Intră pe **github.com** și fă-ți cont gratuit (**Sign up**), dacă nu ai.
2. Apasă **+ → New repository**.
3. Nume: `kevincornea-blog`. Selectează **Public**. Apasă **Create repository**.
4. Apasă **Add file → Upload files** și trage **toate** fișierele și folderele din acest
   pachet. Apoi **Commit changes**.

### B. Vercel — unde trăiește site-ul online
1. Intră pe **vercel.com** → **Sign Up** → **Continue with GitHub**.
2. Autorizează Vercel să-ți vadă contul GitHub.
3. Apasă **Add New… → Project**, găsește `kevincornea-blog`, apasă **Import**.
4. La configurare:
   - **Framework Preset**: `Other`
   - **Build Command**: lasă **gol** (șterge tot, dacă scrie ceva)
   - **Output Directory**: lasă gol
5. Apasă **Deploy**. După ~1 minut primești un link de forma
   `kevincornea-blog.vercel.app`. Acesta e site-ul tău!

De acum, orice modificare făcută pe GitHub apare automat pe site (auto-deploy).

---

## Cum conectez domeniul

Ai cumpărat `kevincornea.blog` pe Namecheap. Îl legăm de Vercel.

### În Vercel
1. În proiect: **Settings → Domains**.
2. Scrie `kevincornea.blog` și apasă **Add**.
3. Vercel îți arată ce trebuie pus în Namecheap (de obicei):
   - `A` record:  Host `@`  → valoare `76.76.21.21`
   - `CNAME` record:  Host `www`  → valoare `cname.vercel-dns.com`
   > Folosește valorile exacte pe care ți le afișează Vercel ție, dacă diferă.

### În Namecheap
1. **Sign In** → **Domain List** → la `kevincornea.blog` apasă **MANAGE**.
2. Mergi la tabul **Advanced DNS**.
3. Șterge înregistrările vechi (CNAME „parking" / redirect, dacă există).
4. Apasă **ADD NEW RECORD** și completează:

   | Type        | Host | Value                  | TTL       |
   |-------------|------|------------------------|-----------|
   | A Record    | @    | 76.76.21.21            | Automatic |
   | CNAME Record| www  | cname.vercel-dns.com   | Automatic |

5. Salvează (bifa ✓ de pe fiecare rând).
6. Înapoi în Vercel apare ✅ când totul e corect.

> Propagarea DNS poate dura de la 15 minute până la 48 de ore. E normal, ai răbdare.

---

## Setări de făcut o singură dată

Caută în fișiere aceste locuri și înlocuiește-le cu datele tale reale:

- **Formularul de contact** — în `index.html` caută `FORMSPREE_ID`.
  Fă cont gratuit pe **formspree.io**, creează un formular și pune ID-ul primit în loc.
  Până atunci, formularul nu va trimite mesaje.
- **Adresa de email** — caută `kevincorneablog@gmail.com` (apare în câteva locuri)
  și pune adresa ta.
- **Poza ta** — înlocuiește `images/hero-photo.jpg` cu o poză reală (portret, ~320×420px).
- **Linkuri sociale** (opțional) — în `index.html`, în footer, sunt linii „comentate"
  (`<!-- ... -->`) pentru Instagram și X. Șterge `<!--` și `-->` și pune linkurile tale.

---

### Notă tehnică (pentru curioși)
Dacă deschizi `index.html` direct de pe calculator (dublu-click), lista de articole s-ar
putea să nu apară — browserele blochează citirea fișierului `posts.json` în acest mod.
Pe site-ul publicat (Vercel) totul funcționează corect. Asta nu e o eroare a site-ului.

---

# Metoda ușoară de publicare — Panoul de scriere (admin.html)

Pe lângă metoda manuală de mai sus, site-ul are un **panou privat de scriere** prin care
un articol se publică direct dintr-un formular, fără GitHub și fără cod.

## Pentru Kevin — cum publici un articol
1. Intră pe `kevincornea.blog/admin.html` (salvează pagina la favorite).
2. Introdu parola (o singură dată pe dispozitiv).
3. Completează: titlu, categorie, rezumat scurt, (opțional) o poză, și textul articolului.
4. Apasă **Publică articolul**.
5. Gata — în ~30 de secunde articolul apare singur pe pagina Blog.

În textul articolului poți folosi formatare simplă: `**îngroșat**`, `## Subtitlu`,
`> citat`, liste cu `- `. Un rând gol între paragrafe = paragraf nou.

## Setare inițială (o singură dată) — pentru cel care administrează site-ul
Panoul are nevoie de 3 valori setate în Vercel ca să poată scrie în repository:

1. **Creează un token GitHub** (fine-grained):
   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   - Repository access: **Only select repositories** → alege `kevincornea-blog`.
   - Permissions → Repository permissions → **Contents: Read and write**.
   - Generează și copiază token-ul (apare o singură dată).
2. **Adaugă variabilele în Vercel**: proiect → Settings → Environment Variables. Adaugă:
   - `GITHUB_TOKEN` = token-ul copiat
   - `GITHUB_REPO` = `utilizator/kevincornea-blog` (ex: `kevincorneablog-gif/kevincornea-blog`)
   - `PUBLISH_PASSWORD` = o parolă la alegere (asta o dai lui Kevin)
3. **Redeploy** (Deployments → ultimul → Redeploy) ca să se aplice variabilele.

Token-ul și parola NU se află niciodată în codul site-ului — stau doar în setările Vercel.
Pagina `admin.html` nu e indexată de Google și nu e linkată nicăieri pe site.
