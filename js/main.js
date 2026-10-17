(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Reveal + contadores ---------- */
  const countUp = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const idx = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
    el.classList.add('in');
    const c = $('[data-count]', el);
    if (c) countUp(c);
    if (el.id === 'term') startTerminal();
    io.unobserve(el);
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Texto digitado no hero ---------- */
  const phrases = [
    'Front em React, API em ASP.NET (.NET 10).',
    'Login com JWT, senha com BCrypt.',
    'PostgreSQL, EF Core e Docker.',
    'Do banco de dados à interface.'
  ];
  const typed = $('#typed');
  let pi = 0, ci = 0, del = false;
  (function type() {
    const f = phrases[pi];
    typed.textContent = f.slice(0, ci);
    if (reduce) { typed.textContent = f; return; }
    if (!del && ci === f.length) { del = true; return setTimeout(type, 1800); }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 22 : 48);
  })();

  /* ---------- Terminal simulado (requisições da API) ---------- */
  const body = $('#termBody');
  let termRun = 0;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  function line(html) {
    const s = document.createElement('span');
    s.innerHTML = html + '\n';
    body.insertBefore(s, body.lastChild);
    body.scrollTop = body.scrollHeight;
  }
  async function typeCmd(txt) {
    const s = document.createElement('span');
    body.insertBefore(s, body.lastChild);
    for (const ch of txt) { s.textContent += ch; await sleep(14); body.scrollTop = body.scrollHeight; }
    line('');
  }
  const STEPS = [
    ['POST /api/Controll/Login', ['{ "Email": "...", "Senha": "..." }'],
      ['<span class="ok">200 OK</span>  { "mensagem": "...", "token": "eyJhbGciOiJIUzI1NiIs..." }']],
    ['GET  /api/WallEndPoints/categoriasuniq', [],
      ['<span class="ok">200 OK</span>  [ "categoria", "categoria", ... ]']],
    ['GET  /api/WallEndPoints/wall?carregar=1&limit=12&ordem=1', [],
      ['<span class="ok">200 OK</span>  12 wallpapers, ordenados por popularidade']],
    ['GET  /api/WallEndPoints/find?pesquisa=...', [],
      ['<span class="ok">200 OK</span>  resultados da busca']],
    ['GET  /api/WallEndPoints/downloadslg?slugid=1', [],
      ['<span class="ok">200 OK</span>  { "nome", "url", "downloads", "categoria" }']],
    ['POST /api/Icon/SaveIcon', ['Authorization: Bearer eyJhbGciOi...'],
      ['<span class="ok">200 OK</span>  ícone de perfil salvo']],
    ['GET  /api/WallEndPoints/VERIFY', ['Authorization: Bearer (usuário comum)'],
      ['<span class="lb">403 Forbidden</span>  Roles = "777" exigida (somente administrador)']]
  ];
  async function startTerminal() {
    const id = ++termRun;
    const alive = () => id === termRun;
    body.innerHTML = '<span class="cur"></span>';
    line('<span class="dim"># EclipseWall API — ASP.NET (.NET 10) + PostgreSQL</span>\n');
    await sleep(500);
    for (const [cmd, hdr, res] of STEPS) {
      if (!alive()) return;
      const prompt = document.createElement('span');
      prompt.innerHTML = '<span class="lb">&gt;</span> ';
      body.insertBefore(prompt, body.lastChild);
      await typeCmd(cmd);
      for (const h of hdr) line('<span class="dim">  ' + h.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>');
      await sleep(450); if (!alive()) return;
      for (const r of res) line('  ' + r);
      line('');
      await sleep(550);
    }
  }
  $('#replay').addEventListener('click', startTerminal);

  /* ---------- Scroll: progresso, nav ativa, linha da timeline ---------- */
  const prog = $('#progress'), tl = $('#tlLine'), tlBox = $('.timeline');
  const links = $$('.nav a'), secs = links.map(a => $(a.getAttribute('href')));
  function onScroll() {
    const h = document.documentElement;
    prog.style.width = (scrollY / (h.scrollHeight - innerHeight)) * 100 + '%';
    const mid = scrollY + innerHeight * 0.35;
    secs.forEach((s, i) => links[i].classList.toggle('on', s && s.offsetTop <= mid && s.offsetTop + s.offsetHeight > mid));
    const r = tlBox.getBoundingClientRect();
    const k = Math.min(Math.max((innerHeight * 0.7 - r.top) / r.height, 0), 1);
    tl.style.height = Math.max(k * (r.height - 20), 0) + 'px';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
