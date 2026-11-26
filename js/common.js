/* 讀菇 主網站共用：頁首、捲動顯現、菇的說明卡、看大圖 */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.DUGU, TR = window.TRAIL;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BAND = { low: '低海拔 ・ 尋野', mid: '中海拔 ・ 林間', high: '高海拔 ・ 登峰' };

  // 頁首：離開開場畫面後變成米白底
  const nav = $('#nav'), solidAt = () => (document.body.dataset.page === 'home' ? innerHeight * .45 : 40);
  const onScroll = () => nav.classList.toggle('solid', scrollY > solidAt());
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#navMenu').addEventListener('click', e => { const o = nav.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // 捲動到才出現
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  const reveal = (root = document) => $$('.rv:not(.in)', root).forEach(el => io.observe(el));
  reveal();

  // 看大圖（書頁、小卡）
  const lb = $('#lb');
  function openLB(src, cap) { $('img', lb).src = src; $('img', lb).alt = cap; $('p', lb).textContent = cap; lb.hidden = false; }
  lb.addEventListener('click', () => (lb.hidden = true));

  // 菇的說明卡
  const modal = $('#modal');
  function openMush(id) {
    const m = D.byId[id]; if (!m) return;
    const ty = D.TYPES[m.type], tm = TR && TR.MUSH[id];
    $('#mdArt').innerHTML = m.card ? `<img src="${m.card}" alt="${m.name} 壓克力攜帶小卡">` : `<img class="cut" src="${m.img}" alt="${m.name}">`;
    $('#mdTxt').innerHTML = `
      <span class="md-chip" style="--c:${ty.color}">${ty.name}</span><span class="md-band">${BAND[m.band]}</span>
      <h3 id="mdName">${m.name}</h3><div class="sci">${m.sci}</div>
      <p>${m.text}</p>
      ${tm && tm.look ? `<p style="color:var(--ink-2);font-size:15px"><b>外觀</b>　${tm.look}</p>` : ''}
      ${m.gill ? `<div class="md-gill"><img src="${m.gill}" alt="${m.name} 菌褶線稿"><span><b>菌褶線稿</b><br>每一種菇的菌褶都不一樣，也是燈具與杯墊的圖案來源。</span></div>` : ''}
      <p class="md-warn">⚠ 不可採食。若有誤食，請立即就醫並保留菇體。</p>
      <div class="md-acts">
        <a class="btn btn-ink" href="dugu-trail/index.html#m=${id}">在毒菇山行找到牠 <span class="arr">→</span></a>
        ${m.plate ? `<button class="btn btn-line" data-lb="${m.plate}" data-cap="${m.name} ・ 圖鑑書頁 P.${m.page}">看書頁</button>` : ''}
        ${m.card ? `<button class="btn btn-line" data-lb="${m.card}" data-cap="${m.name} ・ 壓克力攜帶小卡">放大小卡</button>` : ''}
      </div>`;
    modal.hidden = false; requestAnimationFrame(() => modal.classList.add('on'));
    document.documentElement.style.overflow = 'hidden';
  }
  function closeMush() { modal.classList.remove('on'); document.documentElement.style.overflow = ''; setTimeout(() => { if (!modal.classList.contains('on')) modal.hidden = true; }, 350); }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeMush(); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lb]'); if (b) { openLB(b.dataset.lb, b.dataset.cap || ''); return; }
    const m = e.target.closest('[data-mush]'); if (m) { e.preventDefault(); openMush(m.dataset.mush); }
  });
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (!lb.hidden) lb.hidden = true; else if (!modal.hidden) closeMush(); });

  window.UI = { $, $$, reveal, openMush, openLB, reduce, BAND };
})();
