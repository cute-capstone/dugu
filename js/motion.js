/* 讀菇 首頁動態層（2026-11-25）：標題逐字浮現、數字跑動、視差、3D 傾斜、磁吸按鈕、各區塊專屬動態
   依賴 common.js 的 window.UI 與 home-data.js 的 window.DUGU；開啟「減少動態」時只保留最終狀態 */
(function () {
  const { $, $$ } = window.UI, D = window.DUGU;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const once = (els, cls, opt = {}) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add(cls); io.unobserve(e.target); opt.cb && opt.cb(e.target); } }), { rootMargin: opt.margin || '0px 0px -12% 0px' });
    els.forEach(el => io.observe(el));
  };

  /* ---------- 1. 標題逐字浮現（保留 <br>、<em>） ---------- */
  function split(el) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach(c => { if (!c.trim()) { frag.append(c); return; }
          const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i++); frag.append(s); });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el.classList.add('split');
  }
  const heads = $$('.h2, .foot-say');
  heads.forEach(split);
  once(heads, 'go');
  once($$('.kicker'), 'go');

  /* ---------- 2. 數字跑動 ---------- */
  const nums = $$('.fact-n, .stat b').filter(el => /\d/.test(el.firstChild && el.firstChild.textContent));
  nums.forEach(el => { const t = el.firstChild, raw = t.textContent.trim(); el._to = +raw.replace(/,/g, ''); el._comma = raw.includes(','); el._t = t; if (!reduce) t.textContent = '0'; });
  once(nums, 'counted', { cb: el => {
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const step = now => { const k = clamp((now - t0) / dur), e = 1 - Math.pow(1 - k, 4), v = Math.round(el._to * e);
      el._t.textContent = el._comma ? v.toLocaleString() : v; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  } });

  /* ---------- 3. 引言：捲動時一個字一個字亮起來 ---------- */
  const q = $('.quote q');
  if (q) { split(q); q.classList.add('fill'); }
  const qch = q ? $$('.ch', q) : [];

  /* ---------- 4. 卷軸：進畫面時才「展開」 ---------- */
  const scroll = $('.scroll'), win = $('#scrollWin');
  if (scroll) {
    const setH = () => scroll.style.setProperty('--wh', win.offsetHeight + 'px');
    setH(); addEventListener('resize', setH);
    if (reduce) scroll.classList.add('open'); else once([scroll], 'open', { margin: '0px 0px -25% 0px' });
  }

  /* ---------- 5. 三種毒性：切換時整區染上該毒性的顏色、地面漣漪 ---------- */
  const types = $('.types');
  function tint(k) { const c = D.TYPES[k] && D.TYPES[k].color; if (c) types.style.setProperty('--tc', c); }
  tint('gi');
  $('#tabs') && $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; tint(b.dataset.t);
    types.classList.remove('pulse'); void types.offsetWidth; types.classList.add('pulse'); });

  /* ---------- 6. 小卡扇形：進畫面時攤開 ---------- */
  once($$('.tile.cards'), 'fanned', { margin: '0px 0px -20% 0px' });

  /* ---------- 7. 視差＋捲動進度（同一個 rAF） ---------- */
  const par = [
    ...$$('.quiz').map(el => ({ el, k: -.06 })),
    ...$$('.fact').map((el, i) => ({ el, k: .03 + i * .025 })),
    ...$$('.book').map((el, i) => ({ el, k: [.02, .07, .04][i % 3], inner: true })),
    ...$$('.scroll-grid > div:last-child').map(el => ({ el, k: -.04 })),
    ...$$('.tile').map((el, i) => ({ el, k: [.02, .06, .1][i % 3], inner: true })),
    ...$$('.leafshade').map(el => ({ el, k: .18, bg: true })),
    ...$$('.types-bg').map(el => ({ el, k: -.12 })),
  ];
  const bar = document.createElement('div'); bar.className = 'progress'; bar.innerHTML = '<i></i>'; document.body.append(bar);
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const H = innerHeight, docH = document.documentElement.scrollHeight - H;
      bar.firstChild.style.transform = `scaleX(${(scrollY / docH).toFixed(4)})`;
      if (!reduce) par.forEach(p => {
        const r = (p.bg ? p.el.parentElement : p.el).getBoundingClientRect();
        if (r.bottom < -200 || r.top > H + 200) return;
        const off = (r.top + r.height / 2 - H / 2) * p.k;
        p.el.style.setProperty('--py', off.toFixed(1) + 'px');
      });
      if (qch.length) {
        const r = q.getBoundingClientRect(), k = clamp((H * .82 - r.top) / (H * .5)), n = Math.round(k * qch.length);
        qch.forEach((c, i) => c.classList.toggle('lit', i < n));
      }
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  if (reduce || !fine) return;   // 以下只給滑鼠

  /* ---------- 8. 3D 傾斜＋聚光（測驗卡、書、產品磚） ---------- */
  $$('.qz, .book, .tile, .fact').forEach(el => {
    el.classList.add('tilt');
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((x - .5) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      el.classList.add('hot');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.classList.remove('hot'); });
  });

  /* ---------- 9. 磁吸按鈕 ---------- */
  $$('.btn, .nav-cta, .tab').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
      el.style.translate = `${((e.clientX - r.left - r.width / 2) * .25).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .35).toFixed(1)}px`; });
    el.addEventListener('pointerleave', () => (el.style.translate = ''));
  });

  /* ---------- 10. 螢火蟲被游標吸引、地上的菇會轉頭看你 ---------- */
  const flies = $('#flies');
  if (flies) types.addEventListener('pointermove', e => { const r = types.getBoundingClientRect();
    flies.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .06).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * .06).toFixed(1)}px)`; });
  $('#floor') && $('#floor').addEventListener('pointermove', e => {
    $$('.fm', $('#floor')).forEach(f => { const r = f.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2);
      f.style.setProperty('--lean', clamp(dx / 40, -4, 4).toFixed(2) + 'deg'); });
  });
  $('#floor') && $('#floor').addEventListener('pointerleave', () => $$('.fm').forEach(f => f.style.setProperty('--lean', '0deg')));
})();
