/* 讀菇 三冊折頁書模擬（2026-11-26）
   實體：封面是三層黑卡紙（外框鐳雕樹林草地、中間挖空 → 彩繪毒菇 → 底層紋路＋書名鐳雕）；
        書是上緣裝訂、「往上拉」的折頁書，一頁翻上去，它的背面和下一頁上下對照。
   網頁：#shelf 的封面換成三層疊出來的封面（滑鼠視差），點書打開全螢幕翻頁器。
   依賴 common.js 的 window.UI、home-data.js 的 window.DUGU；接在 home.js 之後載入 */
(function () {
  const { $, $$, openLB } = window.UI, D = window.DUGU;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const RATIO = 1600 / 775;                      // 封面比例（書頁同大小）

  /* ---------- 1. 三層封面 ---------- */
  function cover3(b) {
    return `<div class="cv3" data-book="${b.key}">
      <img class="cv3-l cv3-base" src="img/cover/base-${b.key}.webp" alt="" draggable="false">
      <img class="cv3-l cv3-mush" src="img/cover/mush.webp" alt="" draggable="false">
      <img class="cv3-l cv3-frame" src="img/cover/frame.webp" alt="《${b.title}》封面：${b.sub} ${b.place}" draggable="false">
      <span class="cv3-tag t3"><b>③</b>底層・黑卡鐳雕紋路＋書名</span>
      <span class="cv3-tag t2"><b>②</b>中層・彩繪毒菇</span>
      <span class="cv3-tag t1"><b>①</b>外框・黑卡鐳雕樹林，中間挖空</span>
    </div>`;
  }
  // 滑鼠在封面上：三層各移不同距離，看得出紙張前後
  function parallax(el) {
    if (reduce || !matchMedia('(pointer: fine)').matches) return;
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--px', 0); el.style.setProperty('--py', 0); });
  }
  $$('#shelf .book').forEach(btn => {
    const b = D.BOOKS.find(x => x.key === btn.dataset.book), c = $('.book-cover', btn);
    const tag = $('.bc-band', c);
    c.innerHTML = cover3(b); if (tag) c.append(tag);
    c.insertAdjacentHTML('beforeend', '<span class="bc-open">往上翻開 ↑</span>');
    parallax($('.cv3', c));
  });

  /* ---------- 2. 書頁 ---------- */
  const T = D.TYPES;
  const plain = s => s.replace(/的毒菇$/, '');
  function pageList(b) {
    const list = D.M.filter(m => m.band === b.key);
    const real = list.filter(m => m.plate).sort((a, c) => a.page - c.page);
    const rest = list.filter(m => !m.plate).sort((a, c) => a.stage - c.stage);
    return [...real, ...rest];
  }
  function pageFace(m, b, n) {
    if (m.plate) return `<div class="fp plate"><img src="${m.plate}" alt="${m.name} 書頁 P.${m.page}" draggable="false">
      <button class="fp-zoom" data-lb="${m.plate}" data-cap="《${b.title}》${m.name} ・ P.${m.page}" aria-label="放大這一頁">⤢</button></div>`;
    const t = T[m.type];
    return `<div class="fp gen">
      <div class="gp-l"><h4>${m.name}</h4><i>${m.sci}</i><b style="--c:${t.color}">${t.name}</b>
        <h5>外觀與生長</h5><p>${m.text}</p><h5>分布</h5><p>${b.sub} ${b.range}・${plain(b.place)}</p></div>
      <div class="gp-m"><span class="gp-ring"></span><img src="${m.img}" alt="${m.name}" draggable="false"></div>
      <div class="gp-r"><header><span>讀菇山行 / The Poisonous Trail</span><em>No.${String(n).padStart(2, '0')}</em></header>
        ${m.gill ? `<figure><img src="${m.gill}" alt="" draggable="false"><figcaption>菌褶</figcaption></figure>` : ''}
        <p class="gp-warn"><b>⚠ ${t.name}中毒</b>${t.text}</p>
        <button class="gp-more" data-mush="${m.id}">看說明卡</button>
        <small>網頁示意・正式書頁排版中</small></div></div>`;
  }
  const gauge = k => `<span class="fb-gauge">${['high', 'mid', 'low'].map(x => `<i class="${x === k ? 'on' : ''}"></i>`).join('')}</span>`;
  function introFace(b, pages) {
    return `<div class="fp ink fintro"><div class="in-l">${gauge(b.key)}<h3>${b.title}</h3><p class="in-en">${b.en}</p>
        <p class="in-sub">${b.sub}　${b.range}</p><p class="in-place">${b.place}</p></div>
      <ol class="in-toc">${pages.map((m, i) => `<li><span>${m.plate ? 'P.' + m.page : 'No.' + String(i + 1).padStart(2, '0')}</span>${m.name}<em>${T[m.type].name}</em></li>`).join('')}</ol></div>`;
  }
  const blankFace = () => `<div class="fp ink blank"><img src="../dugu-trail/img/logo-white.png" alt=""></div>`;
  function endFace(b) {
    const i = D.BOOKS.indexOf(b), nx = D.BOOKS[i + 1];
    return `<div class="fp ink end"><img src="../dugu-trail/img/logo-white.png" alt="讀菇">
      <p>《${b.title}》讀完了。</p>
      <div class="end-btns">${nx ? `<button class="fb-btn" data-next="${nx.key}">接著讀《${nx.title}》${nx.sub} ↑</button>` : `<button class="fb-btn" data-next="low">回到第一冊《尋野》</button>`}
        <a class="fb-btn line" href="../dugu-trail/index.html">另外二十頁 → 捲軸海報《毒菇山行》</a></div>
      <small>三冊上下接起來，就是從平地走到稜線的一整條山路。</small></div>`;
  }

  /* ---------- 3. 翻頁器 ---------- */
  const fb = document.createElement('div');
  fb.className = 'fb'; fb.hidden = true; fb.setAttribute('role', 'dialog'); fb.setAttribute('aria-label', '翻閱圖鑑');
  fb.innerHTML = `<div class="fb-top">
      <nav class="fb-books">${D.BOOKS.map(b => `<button data-book="${b.key}">${gauge(b.key)}<b>${b.title}</b><span>${b.sub}</span></button>`).join('')}</nav>
      <span class="fb-count" id="fbCount"></span>
      <button class="fb-x" data-fbclose aria-label="關閉">✕</button></div>
    <div class="fb-stage" id="fbStage">
      <div class="fb-ghost" id="fbGhost"></div>
      <div class="fb-board" id="fbBoard"></div>
      <div class="fb-leaves" id="fbLeaves"></div>
      <div class="fb-hinge"></div>
      <ol class="fb-legend" aria-label="封面三層結構">
        <li style="--y:27%"><b>①</b><span>外框<small>黑卡紙鐳雕樹林與草地，中間挖空</small></span></li>
        <li style="--y:51%"><b>②</b><span>中層<small>彩繪毒菇，從洞口露出來</small></span></li>
        <li style="--y:75%"><b>③</b><span>底層<small>黑卡紙鐳雕紋路＋書名</small></span></li>
      </ol>
    </div>
    <div class="fb-bot">
      <button class="fb-nav" data-go="-1" aria-label="翻回上一頁">▼ 翻回</button>
      <div class="fb-dots" id="fbDots"></div>
      <button class="fb-nav up" data-go="1" aria-label="往上翻下一頁">往上翻 ▲</button>
    </div>
    <p class="fb-tip">拖曳下半頁往上翻・點上半頁翻回・鍵盤 ↑↓ 也可以</p>`;
  document.body.append(fb);
  const stage = $('#fbStage', fb), leavesEl = $('#fbLeaves', fb), board = $('#fbBoard', fb), ghost = $('#fbGhost', fb);
  let book = null, leaves = [], idx = 0, bw = 0, bh = 0;

  function layout() {
    const W = Math.min(innerWidth - 32, 1180), half = (innerHeight - 190) / 2;
    bh = Math.max(120, Math.min(W / RATIO, half)); bw = bh * RATIO;
    stage.style.setProperty('--bw', bw.toFixed(1) + 'px'); stage.style.setProperty('--bh', bh.toFixed(1) + 'px');
  }
  function open(key, keepOpen) {
    book = D.BOOKS.find(b => b.key === key) || D.BOOKS[0];
    const pages = pageList(book);
    const faces = [{ html: cover3(book), cover: true }, { html: introFace(book, pages) },
      ...pages.map((m, i) => ({ html: pageFace(m, book, i + 1) }))];
    if (faces.length % 2) faces.push({ html: blankFace() });   // 湊成雙面
    leavesEl.innerHTML = '';
    leaves = [];
    for (let i = 0; i < faces.length; i += 2) {
      const lf = document.createElement('div'); lf.className = 'leaf';
      lf.innerHTML = `<div class="face front">${faces[i].html}<i class="shade"></i></div><div class="face back">${faces[i + 1].html}<i class="shade"></i></div>`;
      leavesEl.append(lf); leaves.push({ el: lf, ang: 0 });
    }
    board.innerHTML = endFace(book);                     // 封底：全部翻上去後露出來
    ghost.innerHTML = `<div class="gh">${gauge(book.key)}<h3>${book.title}</h3><p>${book.sub}　${book.range}</p><p class="gh-place">${book.place}</p>
      <button class="fb-btn ghost-x" data-explode>看封面三層結構</button><p class="gh-tip">↓ 抓住封面往上拉，翻開這本書</p></div>`;
    $$('.fb-books button', fb).forEach(x => x.classList.toggle('on', x.dataset.book === book.key));
    $('#fbDots', fb).innerHTML = leaves.map(() => '<i></i>').join('');
    parallax($('.cv3', leavesEl));
    idx = 0; layout(); render(true);
    if (!keepOpen) { fb.hidden = false; document.documentElement.style.overflow = 'hidden'; requestAnimationFrame(() => fb.classList.add('on')); }
  }
  function close() { fb.classList.remove('on'); document.documentElement.style.overflow = ''; setTimeout(() => { if (!fb.classList.contains('on')) fb.hidden = true; }, 400); }

  function setAng(L, a) {
    L.ang = a; L.el.style.transform = `rotateX(${a.toFixed(2)}deg)`;
    L.el.style.setProperty('--a', (a / 180).toFixed(3));
  }
  function render(instant) {
    leaves.forEach((L, i) => {
      L.el.classList.toggle('anim', !instant && !reduce);
      setAng(L, i < idx ? 180 : 0);
      if (!L.tm || instant) L.el.style.zIndex = zOf(i);
    });
    fb.classList.toggle('closed', idx === 0);
    fb.classList.remove('explode');
    const n = leaves.length;
    $('#fbCount', fb).textContent = idx === 0 ? `《${book.title}》封面` : idx >= n ? '封底・讀完了' : `已翻 ${idx} / ${n} 張`;
    $$('#fbDots i', fb).forEach((d, i) => d.classList.toggle('on', i < idx));
    $('[data-go="-1"]', fb).disabled = idx === 0; $('[data-go="1"]', fb).disabled = idx >= n;
  }
  const zOf = i => (i < idx ? 10 + i : 500 - i);
  // 正在翻的那張浮在最上面，翻完再回到它該在的層
  function lift(L) { const i = leaves.indexOf(L); L.el.style.zIndex = 900; clearTimeout(L.tm); L.tm = setTimeout(() => { L.el.style.zIndex = zOf(i); L.tm = 0; }, reduce ? 0 : 950); }
  function go(d) { const n = clamp(idx + d, 0, leaves.length); if (n === idx) return; const L = leaves[d > 0 ? idx : idx - 1]; idx = n; render(); lift(L); }

  /* 拖曳：下半頁往上拉＝翻頁，上半頁往下拉＝翻回 */
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button, a') || fb.classList.contains('explode')) return;
    const r = leavesEl.getBoundingClientRect(), hingeY = r.top, lower = e.clientY > hingeY;
    let i = lower ? idx : idx - 1;
    if (i < 0 || i >= leaves.length) return;
    drag = { i, fwd: lower, y: e.clientY, t: performance.now(), moved: 0, base: lower ? 0 : 180 };
    leaves[i].el.classList.remove('anim'); leaves[i].el.style.zIndex = 900;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const dy = drag.y - e.clientY; drag.moved = Math.max(drag.moved, Math.abs(dy));
    const a = drag.fwd ? clamp(dy / (bh * 1.15) * 180, 0, 180) : clamp(180 + dy / (bh * 1.15) * 180, 0, 180);
    setAng(leaves[drag.i], a);
  });
  const endDrag = e => {
    if (!drag) return; const d = drag; drag = null;
    const L = leaves[d.i];
    if (d.moved < 6) { go(d.fwd ? 1 : -1); return; }      // 只是點一下
    const v = (d.y - e.clientY) / Math.max(1, performance.now() - d.t);
    const flip = d.fwd ? (L.ang > 70 || v > .5) : (L.ang < 110 || v < -.5);
    idx = d.fwd ? (flip ? d.i + 1 : d.i) : (flip ? d.i : d.i + 1);
    render(); lift(L);
  };
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

  let wheelLock = 0;
  stage.addEventListener('wheel', e => { e.preventDefault(); const now = performance.now(); if (now < wheelLock || Math.abs(e.deltaY) < 8) return; wheelLock = now + 700; go(e.deltaY > 0 ? 1 : -1); }, { passive: false });
  fb.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-fbclose]')) return close();
    const g = t.closest('[data-go]'); if (g) return go(+g.dataset.go);
    const bk = t.closest('.fb-books button'); if (bk) return open(bk.dataset.book, true);
    const nx = t.closest('[data-next]'); if (nx) return open(nx.dataset.next, true);
    if (t.closest('[data-explode]')) { fb.classList.toggle('explode'); t.closest('[data-explode]').textContent = fb.classList.contains('explode') ? '把三層疊回去' : '看封面三層結構'; }
  });
  addEventListener('keydown', e => {
    if (fb.hidden || !$('.lb').hidden || !$('#modal, .modal').hidden) return;
    if (e.key === 'Escape') close();
    else if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
  });
  addEventListener('resize', () => { if (!fb.hidden) layout(); });

  // 書架：點書＝翻開
  $('#shelf').addEventListener('click', e => { const b = e.target.closest('.book'); if (b) open(b.dataset.book); });
  window.FB = { open, cover3 };
})();
