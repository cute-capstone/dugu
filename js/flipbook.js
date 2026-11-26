/* 讀菇 三冊經摺裝（拉頁書）模擬（2026-11-26）
   實體：封面三層黑卡紙——①外框黑卡、鐳雕樹林草地線條、中間挖空 ②彩繪毒菇 ③底層黑卡、鐳雕紋路＋書名。
        書是經摺裝的拉頁，往上翻：每翻一折同時看到正反兩面——
          上面＝翻上去那一折的背面：毒菇說明頁（書本排版）
          下面＝下一折的正面：同一種菇在《毒菇山行》裡的樹與菇插畫
        正面整條拉開＝《毒菇山行》捲軸海報（這一冊的海拔段）。
   網頁：#shelf 封面換成三層疊（滑鼠視差）；點書開全螢幕翻閱器；「正面全部拉開」看整條捲軸。
   依賴 common.js 的 window.UI、home-data.js 的 window.DUGU；接在 home.js 之後載入 */
(function () {
  const { $, $$ } = window.UI, D = window.DUGU;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const RATIO = 1600 / 775;                      // 封面比例（每一折同大小）
  const T = D.TYPES;
  const ARTN = Object.fromEntries(D.ART.map(a => [a.n, `img/art/art-${String(a.n).padStart(2, '0')}.webp`]));   // 山行插畫原檔（完整、不做接縫透明）：第 n 層＝書頁 n
  const SKY = { low: ['#d9d3bd', '#b9b48f'], mid: ['#c9d2c3', '#9fae98'], high: ['#cdd5da', '#a7b3ba'] };

  /* ---------- 1. 三層封面 ---------- */
  function cover3(b) {
    return `<div class="cv3" data-book="${b.key}">
      <img class="cv3-l cv3-base" src="img/cover/base-${b.key}.webp" alt="" draggable="false">
      <img class="cv3-l cv3-mush" src="img/cover/mush.webp" alt="" draggable="false">
      <img class="cv3-l cv3-frame" src="img/cover/frame.webp" alt="《${b.title}》封面：${b.sub} ${b.place}" draggable="false">
    </div>`;
  }
  // 滑鼠在封面上：三層各移不同距離，看得出紙張前後
  function parallax(el) {
    if (!el || reduce || !matchMedia('(pointer: fine)').matches) return;
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--px', 0); el.style.setProperty('--py', 0); });
  }
  $$('#shelf .book').forEach(btn => {
    const b = D.BOOKS.find(x => x.key === btn.dataset.book), c = $('.book-cover', btn);
    const tag = $('.bc-band', c);
    c.innerHTML = cover3(b); if (tag) c.append(tag);
    c.insertAdjacentHTML('beforeend', '<span class="bc-open">往上拉開 ↑</span>');
    parallax($('.cv3', c));
  });

  /* ---------- 2. 每一折的兩面 ---------- */
  const plain = s => s.replace(/的毒菇$/, '');
  const pageList = b => D.M.filter(m => m.band === b.key).sort((a, c) => a.stage - c.stage);   // 由山下往上
  const pno = m => String(m.stage).padStart(2, '0');
  // 背面：毒菇說明頁
  function descFace(m, b) {
    if (m.plate) return `<div class="fp plate"><img src="${m.plate}" alt="${m.name} 說明頁 P.${m.page}" draggable="false">
      <button class="fp-zoom" data-lb="${m.plate}" data-cap="《${b.title}》${m.name} ・ 說明頁 P.${m.page}" aria-label="放大說明頁">⤢</button></div>`;
    const t = T[m.type];
    return `<div class="fp gen">
      <div class="gp-l"><h4>${m.name}</h4><i>${m.sci}</i><b style="--c:${t.color}">${t.name}</b>
        <h5>外觀與生長</h5><p>${m.text}</p><h5>分布</h5><p>${b.sub} ${b.range}・${plain(b.place)}</p></div>
      <div class="gp-m"><span class="gp-ring"></span><img src="${m.img}" alt="${m.name}" draggable="false"></div>
      <div class="gp-r"><header><span>讀菇山行 / The Poisonous Trail</span><em>${pno(m)}</em></header>
        ${m.gill ? `<figure><img src="${m.gill}" alt="" draggable="false"><figcaption>菌褶</figcaption></figure>` : ''}
        <p class="gp-warn"><b>⚠ ${t.name}中毒</b>${t.text}</p>
        <button class="gp-more" data-mush="${m.id}">看說明卡</button>
        <small>網頁示意・正式說明頁排版中</small></div></div>`;
  }
  // 正面：《毒菇山行》插畫（同一種菇那一層）
  function artFace(m) {
    const src = ARTN[m.stage], cap = `<span class="af-cap"><em>山行 ${pno(m)}</em>${m.name}</span>`;
    if (src) return `<div class="fp art"><img src="${src}" alt="《毒菇山行》第 ${m.stage} 層：${m.name}" draggable="false">${cap}
      <button class="fp-zoom" data-lb="${src}" data-cap="《毒菇山行》第 ${m.stage} 層 ・ ${m.name}" aria-label="放大插畫">⤢</button></div>`;
    return `<div class="fp art pending"><img class="af-mush" src="${m.img}" alt="${m.name}" draggable="false">${cap}<small class="af-note">這一層的山行插畫繪製中，先放菇的手繪圖</small></div>`;
  }
  const gauge = k => `<span class="fb-gauge">${['high', 'mid', 'low'].map(x => `<i class="${x === k ? 'on' : ''}"></i>`).join('')}</span>`;
  // 最後一折的背面：這一冊收錄的菇
  function tocFace(b, list) {
    return `<div class="fp ink fintro"><div class="in-l">${gauge(b.key)}<h3>${b.title}</h3><p class="in-en">${b.en}</p>
        <p class="in-sub">${b.sub}　${b.range}</p><p class="in-place">${b.place}</p></div>
      <ol class="in-toc">${list.map(m => `<li><span>${pno(m)}</span>${m.name}<em>${T[m.type].name}</em></li>`).join('')}</ol></div>`;
  }
  function endFace(b) {
    const i = D.BOOKS.indexOf(b), nx = D.BOOKS[i + 1];
    return `<div class="fp ink end"><img src="dugu-trail/img/logo-white.png" alt="讀菇">
      <p>《${b.title}》拉到底了。</p>
      <div class="end-btns">${nx ? `<button class="fb-btn" data-next="${nx.key}">接著往上：《${nx.title}》${nx.sub} ↑</button>` : `<button class="fb-btn" data-next="low">回到山腳《尋野》</button>`}
        <button class="fb-btn line" data-unfold>把正面全部拉開</button></div>
      <small>三冊的正面接起來，就是從平地走到稜線的《毒菇山行》捲軸。</small></div>`;
  }

  /* ---------- 3. 翻閱器 ---------- */
  const fb = document.createElement('div');
  fb.className = 'fb'; fb.hidden = true; fb.setAttribute('role', 'dialog'); fb.setAttribute('aria-label', '翻閱圖鑑');
  fb.innerHTML = `<div class="fb-top">
      <nav class="fb-books">${D.BOOKS.map(b => `<button data-book="${b.key}">${gauge(b.key)}<b>${b.title}</b><span>${b.sub}</span></button>`).join('')}</nav>
      <span class="fb-count" id="fbCount"></span>
      <button class="fb-unf" data-unfold>正面全部拉開</button>
      <button class="fb-x" data-fbclose aria-label="關閉">✕</button></div>
    <div class="fb-stage" id="fbStage">
      <div class="fb-ghost" id="fbGhost"></div>
      <div class="fb-board" id="fbBoard"></div>
      <div class="fb-leaves" id="fbLeaves"></div>
      <div class="fb-hinge"></div>
      <span class="fb-side up">說明頁<small>背面</small></span><span class="fb-side dn">毒菇山行<small>正面</small></span>
      <ol class="fb-legend" aria-label="封面三層結構">
        <li style="--y:27%"><b>①</b><span>外框<small>黑卡紙，鐳雕樹林草地線條，中間挖空</small></span></li>
        <li style="--y:51%"><b>②</b><span>中層<small>彩繪毒菇，從洞口露出來</small></span></li>
        <li style="--y:75%"><b>③</b><span>底層<small>黑卡紙，鐳雕紋路＋書名</small></span></li>
      </ol>
    </div>
    <div class="fb-bot">
      <button class="fb-nav" data-go="-1" aria-label="摺回一折">▼ 摺回</button>
      <div class="fb-dots" id="fbDots"></div>
      <button class="fb-nav up" data-go="1" aria-label="往上拉開一折">往上拉 ▲</button>
    </div>
    <p class="fb-tip">抓住下半部往上拉・點上半部摺回・鍵盤 ↑↓ 也可以</p>
    <div class="fb-unfold" id="fbUnfold" hidden></div>`;
  document.body.append(fb);
  const stage = $('#fbStage', fb), leavesEl = $('#fbLeaves', fb), board = $('#fbBoard', fb), ghost = $('#fbGhost', fb), unf = $('#fbUnfold', fb);
  let book = null, list = [], leaves = [], idx = 0, bh = 0;

  function layout() {
    const W = Math.min(innerWidth - 32, 1180), half = (innerHeight - 190) / 2;
    bh = Math.max(120, Math.min(W / RATIO, half));
    stage.style.setProperty('--bw', (bh * RATIO).toFixed(1) + 'px'); stage.style.setProperty('--bh', bh.toFixed(1) + 'px');
  }
  function open(key, keepOpen) {
    book = D.BOOKS.find(b => b.key === key) || D.BOOKS[0];
    list = pageList(book);
    fb.style.setProperty('--sky1', SKY[book.key][0]); fb.style.setProperty('--sky2', SKY[book.key][1]);
    // 第 0 折：正面＝封面、背面＝第 1 種菇的說明頁；第 k 折：正面＝第 k 種的山行插畫、背面＝第 k+1 種的說明頁
    const L = [{ front: cover3(book), back: descFace(list[0], book) },
      ...list.map((m, k) => ({ front: artFace(m), back: list[k + 1] ? descFace(list[k + 1], book) : tocFace(book, list) }))];
    leavesEl.innerHTML = ''; leaves = [];
    L.forEach((f, i) => {
      const lf = document.createElement('div'); lf.className = 'leaf' + (i ? '' : ' is-cover');
      lf.innerHTML = `<div class="face front">${f.front}<i class="shade"></i></div><div class="face back">${f.back}<i class="shade"></i></div>`;
      leavesEl.append(lf); leaves.push({ el: lf, ang: 0 });
    });
    board.innerHTML = endFace(book);
    ghost.innerHTML = `<div class="gh">${gauge(book.key)}<h3>${book.title}</h3><p>${book.sub}　${book.range}</p><p class="gh-place">${book.place}</p>
      <button class="fb-btn ghost-x" data-explode>看封面三層結構</button>
      <p class="gh-tip">↓ 抓住封面往上拉：上面是毒菇說明頁，下面是同一種菇的山行插畫</p></div>`;
    $$('.fb-books button', fb).forEach(x => x.classList.toggle('on', x.dataset.book === book.key));
    $('#fbDots', fb).innerHTML = leaves.map(() => '<i></i>').join('');
    parallax($('.cv3', leavesEl));
    closeUnfold(true);
    idx = 0; layout(); render(true);
    if (!keepOpen) { fb.hidden = false; document.documentElement.style.overflow = 'hidden'; requestAnimationFrame(() => fb.classList.add('on')); }
  }
  function close() { fb.classList.remove('on'); document.documentElement.style.overflow = ''; setTimeout(() => { if (!fb.classList.contains('on')) fb.hidden = true; }, 400); }

  function setAng(L, a) {
    L.ang = a; L.el.style.transform = `rotateX(${a.toFixed(2)}deg)`;
    L.el.style.setProperty('--a', (a / 180).toFixed(3));
  }
  const zOf = i => (i < idx ? 10 + i : 500 - i);
  function render(instant) {
    leaves.forEach((L, i) => {
      L.el.classList.toggle('anim', !instant && !reduce);
      setAng(L, i < idx ? 180 : 0);
      if (!L.tm || instant) L.el.style.zIndex = zOf(i);
    });
    const n = leaves.length;
    fb.classList.toggle('closed', idx === 0); fb.classList.toggle('reading', idx > 0 && idx < n);
    fb.classList.remove('explode');
    const m = list[idx - 1];
    $('#fbCount', fb).innerHTML = idx === 0 ? `《${book.title}》封面` : idx >= n ? '拉到底了' : `<b>${pno(m)}</b> ${m.name}　<span>上：說明頁｜下：山行插畫</span>`;
    $$('#fbDots i', fb).forEach((d, i) => d.classList.toggle('on', i < idx));
    $('[data-go="-1"]', fb).disabled = idx === 0; $('[data-go="1"]', fb).disabled = idx >= n;
  }
  // 正在翻的那一折浮在最上面，翻完再回到它該在的層
  function lift(L) { const i = leaves.indexOf(L); L.el.style.zIndex = 900; clearTimeout(L.tm); L.tm = setTimeout(() => { L.el.style.zIndex = zOf(i); L.tm = 0; }, reduce ? 0 : 950); }
  function go(d) { const n = clamp(idx + d, 0, leaves.length); if (n === idx) return; const L = leaves[d > 0 ? idx : idx - 1]; idx = n; render(); lift(L); }

  /* 拖曳：下半部往上拉＝翻開一折，上半部往下拉＝摺回 */
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button, a') || fb.classList.contains('explode')) return;
    const lower = e.clientY > leavesEl.getBoundingClientRect().top, i = lower ? idx : idx - 1;
    if (i < 0 || i >= leaves.length) return;
    drag = { i, fwd: lower, y: e.clientY, t: performance.now(), moved: 0 };
    leaves[i].el.classList.remove('anim'); leaves[i].el.style.zIndex = 900;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const dy = drag.y - e.clientY; drag.moved = Math.max(drag.moved, Math.abs(dy));
    setAng(leaves[drag.i], drag.fwd ? clamp(dy / (bh * 1.15) * 180, 0, 180) : clamp(180 + dy / (bh * 1.15) * 180, 0, 180));
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

  /* ---------- 4. 正面全部拉開＝捲軸 ---------- */
  function openUnfold() {
    // 由上到下：高的層在上、山腳在下；折痕一凸一凹
    // 同一層有兩種菇（如第 3 層）只放一折，名稱合在一起
    const byStage = [];
    list.forEach(m => { const g = byStage.find(x => x.stage === m.stage); g ? g.names.push(m.name) : byStage.push({ stage: m.stage, m, names: [m.name] }); });
    const rows = byStage.reverse().map((g, i, a) => `<div class="uf-p ${i % 2 ? 'valley' : 'mountain'}" style="--i:${a.length - 1 - i}">${artFace({ ...g.m, name: g.names.join('・') })}</div>`).join('');
    unf.innerHTML = `<div class="uf-head"><b>《${book.title}》正面全部拉開</b><span>${book.sub} ${book.range}・由山腳（下）往上</span>
        <a class="fb-btn line" href="dugu-trail/index.html#s=${list[0].stage}">三冊接起來：完整《毒菇山行》捲軸 →</a>
        <button class="fb-btn" data-unfold>摺回去</button></div>
      <div class="uf-strip" id="ufStrip"><div class="uf-col">${rows}</div></div>`;
    unf.hidden = false; fb.classList.add('unfolded');
    const s = $('#ufStrip', unf); s.scrollTop = s.scrollHeight;
    requestAnimationFrame(() => requestAnimationFrame(() => unf.classList.add('on')));
  }
  function closeUnfold(now) { unf.classList.remove('on'); fb.classList.remove('unfolded'); if (now) unf.hidden = true; else setTimeout(() => { if (!unf.classList.contains('on')) unf.hidden = true; }, 500); }

  fb.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-fbclose]')) return close();
    if (t.closest('[data-unfold]')) return unf.hidden || !unf.classList.contains('on') ? openUnfold() : closeUnfold();
    const g = t.closest('[data-go]'); if (g) return go(+g.dataset.go);
    const bk = t.closest('.fb-books button'); if (bk) return open(bk.dataset.book, true);
    const nx = t.closest('[data-next]'); if (nx) return open(nx.dataset.next, true);
    const ex = t.closest('[data-explode]');
    if (ex) { fb.classList.toggle('explode'); ex.textContent = fb.classList.contains('explode') ? '把三層疊回去' : '看封面三層結構'; }
  });
  addEventListener('keydown', e => {
    if (fb.hidden || !$('.lb').hidden || !$('.modal').hidden) return;
    if (e.key === 'Escape') { if (!unf.hidden) closeUnfold(); else close(); return; }
    if (!unf.hidden) return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
  });
  addEventListener('resize', () => { if (!fb.hidden) layout(); });

  // 書架：點書＝拉開
  $('#shelf').addEventListener('click', e => { const b = e.target.closest('.book'); if (b) open(b.dataset.book); });
  window.FB = { open, cover3 };
})();
