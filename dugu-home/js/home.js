/* 讀菇 首頁互動 */
(function () {
  const { $, $$, reveal, reduce } = window.UI, D = window.DUGU, TR = window.TRAIL;
  const S = n => `img/scene/${n}.webp`;

  /* ---------- 1. 開場森林：位置用「距離畫面中心幾 vh」排，洞口裡和全螢幕都好看 ---------- */
  // [圖, x, 高, 底, 左右翻]
  const ALP = [['p-alpine', -62, 50, 15, -1], ['p-alpine', 0, 46, 17], ['p-alpine', 62, 50, 15, -1], ['p-alpine', 122, 50, 15], ['p-alpine', -122, 50, 15]];
  const FAR = [['conifer', -26, 34, 20], ['conifer', 22, 40, 19], ['conifer', 46, 30, 21, -1], ['conifer', -54, 38, 19, -1], ['conifer', 74, 34, 20],
    ['conifer', -86, 30, 21], ['broadleaf', -6, 30, 22], ['conifer', 100, 38, 19, -1], ['conifer', -112, 34, 19]];
  // 毒菇山行的手繪畫片：兩側像走進林道
  const PANEL = [['p-amanita', -50, 40, 6], ['p-broad', 52, 44, 5], ['p-white', -92, 46, 3], ['p-fence', 92, 42, 4], ['p-nest', -136, 46, 3, -1], ['p-amanita', 134, 44, 3, -1]];
  const MID = [['broadleaf', -36, 46, 10, -1], ['conifer', 32, 40, 12], ['bamboo', -66, 46, 8], ['broadleaf', 72, 52, 7],
    ['shrub-flower', 20, 19, 9], ['bush-blue', -20, 13, 9], ['bamboo', 104, 46, 8, -1], ['broadleaf', -104, 54, 7]];
  const GROUND = [['grass-blob', -70, 22, -3], ['grass-blob', -34, 20, -3, -1], ['grass-blob', 2, 21, -3], ['grass-blob', 36, 20, -3, -1], ['grass-blob', 72, 22, -3],
    ['grass-blob', 108, 22, -3, -1], ['grass-blob', -106, 22, -3], ['grass-corner', -24, 24, -2], ['grass-dark', 50, 18, -2], ['bush-low', 8, 9, 10], ['fence', -84, 7, 9], ['dung', 60, 7, 8]];
  const MUSH = [['verna', -3, 33, 4], ['muscaria', -17, 23, 4], ['chloro', 13, 25, 3], ['phallus', 26, 27, 6], ['gyromitra', -27, 16, 2], ['cornu', 5, 11, 1],
    ['russula', -10, 10, 0], ['leucocoprinus', 33, 19, 9], ['inocybe', -33, 22, 7], ['gymnopilus', -43, 16, 7], ['pantherina', 41, 23, 6], ['panaeolus', -54, 22, 6],
    ['omphalotus', 54, 15, 4], ['psilocybe', -66, 20, 5], ['nitidum', 66, 20, 5], ['virosa', -78, 22, 4], ['mutinus', 79, 24, 3], ['entoloma', -90, 21, 4],
    ['pulvero', 90, 18, 5], ['conocybe', -102, 20, 5], ['phalloides', 102, 22, 4]];
  const FRONT = [['grass-a', -26, 9, -3], ['grass-dark', 22, 8, -3, -1], ['grass-a', -64, 11, -4, -1], ['grass-dark', 64, 11, -4], ['grass-a', 100, 10, -4], ['grass-blob', -118, 12, -5]];
  const pos = (x, h, b, f) => `--x:${x};--h:${h};--b:${b}vh;--f:${f || 1}`;
  let wi = 0;
  const imgs = (arr, sway) => arr.map(([n, x, h, b, f]) => { wi++;
    const w = sway ? `;--wd:${(6 + (wi * 1.37) % 4).toFixed(2)}s;--wdl:${(-(wi * .83) % 5).toFixed(2)}s` : '';
    return `<img${sway ? ' class="sw"' : ''} src="${S(n)}" alt="" style="${pos(x, h, b, f)}${w}" loading="eager">`; }).join('');
  $('.lyr-alp').innerHTML = imgs(ALP);
  $('.lyr-far').innerHTML = imgs(FAR, 1);
  $('.lyr-panel').innerHTML = imgs(PANEL);
  $('.lyr-mid').innerHTML = imgs(MID, 1);
  $('.lyr-ground').innerHTML = imgs(GROUND, 1);
  $('.lyr-front').innerHTML = imgs(FRONT, 1);
  $('.lyr-mush').innerHTML = MUSH.map(([id, x, h, b], i) => {
    const m = D.byId[id];
    return `<button class="mu" data-mush="${id}" style="${pos(x, h, b)};--d:${(i * .37) % 1.6}" aria-label="${m.name}"><img src="${m.img}" alt=""><span class="tag">${m.name}</span></button>`;
  }).join('');

  const hero = $('.hero'), scene = $('#scene'), hint = $('#hint'), say = $('#say'), logo = $('#heroLogo'), torch = $('#torch'), heroFade = $('#heroFade');
  // 三層樹冠環：林緣（最暗、最先穿過）→ 林間 → 林床（最亮）
  const rings = ['.r-front', '.r-mid', '.r-back'].map((q, i) => ({ el: $(q), base: [1.04, .9, .78][i], start: [0, .14, .28][i], rot: [-3, 2.2, -1.4][i] }));
  const depthLis = $$('#depth li'), dapple = $('.dapple'), depthEl = $('#depth');
  const lyrs = $$('.lyr').map(el => ({ el, d: +el.dataset.depth }));
  let mx = 0, my = 0, tx = 0, ty = 0, p = 0, sp = 0, tcx = innerWidth / 2, tcy = innerHeight / 2, cxs = tcx, cys = tcy;
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; tcx = e.clientX; tcy = e.clientY; } }, { passive: true });
  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => t * t * (3 - 2 * t);            // smoothstep：起步、收尾都柔
  const easeIn = t => t * t * t;
  function heroFrame() {
    const r = hero.getBoundingClientRect(), span = hero.offsetHeight - innerHeight;
    p = clamp(-r.top / span);
    sp += (p - sp) * (reduce ? 1 : .085);             // 捲動帶一點慣性，像慢慢走進去
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    rings.forEach(R => {
      const t = clamp((sp - R.start) / .55), e = easeIn(t) * .6 + ease(t) * .4;
      const z = R.base * (1 + e * 6.5);
      R.el.style.transform = `translate(${(-mx * 14 * (1.4 - R.base)).toFixed(1)}px, ${(-my * 8).toFixed(1)}px) scale(${z.toFixed(4)}) rotate(${(e * R.rot).toFixed(2)}deg)`;
      R.el.style.opacity = t > .62 ? clamp(1 - (t - .62) / .3).toFixed(3) : 1;
    });
    const all = ease(clamp(sp / .95));
    scene.style.transform = `scale(${(1.04 + all * .07).toFixed(4)})`;
    lyrs.forEach(({ el, d }) => { el.style.transform = `translate3d(${(-mx * 26 * d).toFixed(1)}px, ${(-my * 10 * d + all * 46 * (d - .55)).toFixed(1)}px, 0) scale(${(1 + all * .08 * d).toFixed(4)})`; });
    logo.style.transform = `translate(-50%, calc(-50% + ${(all * 3).toFixed(2)}vh)) scale(${(1 - all * .08).toFixed(3)})`;
    hint.style.opacity = Math.max(0, 1 - sp * 6);
    heroFade.style.opacity = clamp((sp - .84) / .16).toFixed(3);
    const lvl = sp < .3 ? 0 : sp < .58 ? 1 : 2;
    depthLis.forEach((li, i) => li.classList.toggle('on', i === lvl));
    depthEl.style.opacity = sp > .92 ? .3 : 1;
    $('.rings').style.setProperty('--shade', (1 - clamp((sp - .55) / .35)).toFixed(3));
    dapple.style.opacity = (.55 * (1 - clamp((sp - .5) / .4))).toFixed(3);
    say.classList.toggle('on', sp > .86);
    cxs += (tcx - cxs) * .12; cys += (tcy - cys) * .12;
    torch.style.transform = `translate(${cxs.toFixed(0)}px, ${cys.toFixed(0)}px)`;
  }

  /* ---------- 孢子＋落葉（點空地會揚起一陣孢子） ---------- */
  const cv = $('#spores'), cx = cv.getContext('2d');
  let SP = [], LF = [], BURST = [];
  const LEAF_C = ['#6f8f3a', '#8fae4a', '#c9a640', '#a8692e', '#4f6e2c'];
  const newLeaf = top => ({ x: Math.random() * innerWidth, y: top ? -20 - Math.random() * innerHeight * .5 : Math.random() * innerHeight, s: 7 + Math.random() * 9,
    vy: .5 + Math.random() * .7, vx: .2 + Math.random() * .5, a: Math.random() * 6.28, va: (Math.random() - .5) * .04, w: Math.random() * 6.28, c: LEAF_C[Math.floor(Math.random() * LEAF_C.length)] });
  function sizeCv() { const r = devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r; cx.setTransform(r, 0, 0, r, 0, 0);
    SP = Array.from({ length: Math.round(innerWidth / 18) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: .6 + Math.random() * 2.2, v: .12 + Math.random() * .4, w: Math.random() * 6.28 }));
    LF = Array.from({ length: Math.round(innerWidth / 160) + 3 }, () => newLeaf(false)); }
  function leaf(l) {
    cx.save(); cx.translate(l.x, l.y); cx.rotate(l.a); cx.scale(1, Math.abs(Math.sin(l.w)) * .7 + .3);   // 翻面時變窄，像在空中翻轉
    cx.beginPath(); cx.moveTo(-l.s, 0); cx.quadraticCurveTo(0, -l.s * .55, l.s, 0); cx.quadraticCurveTo(0, l.s * .55, -l.s, 0);
    cx.globalAlpha = .85; cx.fillStyle = l.c; cx.fill();
    cx.strokeStyle = 'rgba(40,40,20,.35)'; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(-l.s, 0); cx.lineTo(l.s, 0); cx.stroke(); cx.restore();
  }
  function spores() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    SP.forEach(s => { s.y -= s.v; s.w += .01; s.x += Math.sin(s.w) * .3; if (s.y < -10) { s.y = innerHeight + 10; s.x = Math.random() * innerWidth; }
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.29); cx.fillStyle = `rgba(255, 236, 170, ${.35 + s.r * .15})`; cx.fill(); });
    BURST = BURST.filter(b => (b.t += 1) < b.life);
    BURST.forEach(b => { b.vx *= .97; b.vy = b.vy * .97 - .012; b.x += b.vx + Math.sin(b.t * .05 + b.w) * .3; b.y += b.vy;
      cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 6.29); cx.fillStyle = `rgba(${b.c}, ${(1 - b.t / b.life) * .9})`; cx.fill(); });
    LF.forEach((l, i) => { l.w += .03; l.a += l.va + Math.sin(l.w) * .01; l.x += l.vx + Math.sin(l.w * .7) * .8; l.y += l.vy;
      if (l.y > innerHeight + 30 || l.x > innerWidth + 30) LF[i] = newLeaf(true); leaf(l); });
  }
  sizeCv(); addEventListener('resize', sizeCv);
  $('#heroStick').addEventListener('click', e => {
    if (e.target.closest('.mu, a, button')) return;
    const col = ['255, 236, 170', '240, 250, 210', '255, 214, 160'];
    for (let i = 0; i < 46; i++) { const a = Math.random() * 6.28, v = .6 + Math.random() * 2.6;
      BURST.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, r: .8 + Math.random() * 2.4, t: 0, life: 90 + Math.random() * 90, w: Math.random() * 6, c: col[i % 3] }); }
    for (let i = 0; i < 3; i++) { const l = newLeaf(false); l.x = e.clientX + (Math.random() - .5) * 60; l.y = e.clientY - 40; LF.push(l); }
    if (LF.length > 40) LF.splice(0, LF.length - 40);
  });
  let heroOn = true;
  new IntersectionObserver(es => (heroOn = es[0].isIntersecting)).observe(hero);
  (function loop() { if (heroOn) { heroFrame(); if (!reduce) spores(); } requestAnimationFrame(loop); })();

  /* ---------- 2. 小測驗 ---------- */
  const Q = ['muscaria', 'leucocoprinus', 'verna', 'russula'];
  $('#quizRow').innerHTML = Q.map(id => { const m = D.byId[id], t = D.TYPES[m.type];
    return `<button class="qz" data-q="${id}"><span class="res" style="background:${t.color}">${t.name}</span><img src="${m.img}" alt=""><b>${m.name}</b></button>`; }).join('');
  $('#quizRow').addEventListener('click', e => {
    const b = e.target.closest('.qz'); if (!b) return;
    const quiz = $('#quiz'); quiz.classList.add('done');
    $$('.qz').forEach(q => q.classList.toggle('right', q.dataset.q === 'verna'));
    const hit = b.dataset.q === 'verna';
    $('#quizAns').innerHTML = `${hit ? '答對了！' : '其實是<b>白毒鵝膏</b>。'}全身純白、看起來最乾淨的牠，含鵝膏毒肽，可能造成<b>肝腎衰竭致命</b>；最鮮豔的毒蠅鵝膏菌屬於神經型，純黃白鬼傘與毒紅菇則是腸胃型。<br><b>鮮不鮮豔，決定不了有沒有毒。</b> <a href="#" data-mush="verna" style="color:#fff">看白毒鵝膏 →</a>`;
  });

  /* ---------- 3. 三種毒性 ---------- */
  const order = ['gi', 'ne', 'li'];
  $('#tabs').innerHTML = order.map((k, i) => { const t = D.TYPES[k], n = D.M.filter(m => m.type === k).length;
    return `<button class="tab${i ? '' : ' on'}" role="tab" data-t="${k}" style="--c:${t.color}"><i></i>${t.name}<small>${n} 種</small></button>`; }).join('');
  const SCALE = { cornu: .55, russula: .62, gyromitra: .62, omphalotus: .66, verna: 1.12, virosa: 1.02, phallus: 1.05 };
  function showType(k) {
    $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === k));
    $('#typeDesc').textContent = D.TYPES[k].text;
    const floor = $('#floor'); floor.classList.remove('show');
    const list = D.M.filter(m => m.type === k);
    const s = list.length > 7 ? .78 : 1;
    $('#floorRow').innerHTML = list.map((m, i) => `<button class="fm" data-mush="${m.id}" style="--i:${i};--s:${((SCALE[m.id] || .9) * s).toFixed(2)}"><img src="${m.img}" alt=""><span>${m.name}</span></button>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => floor.classList.add('show')));
  }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) showType(b.dataset.t); });
  showType('gi');

  /* ---------- 4. 卷軸預覽：插畫由上（山頂）到下（山腳）接起來，自動慢慢往上爬 ---------- */
  const segs = TR.ART.slice().sort((a, b) => b.stages[0] - a.stages[0]);
  const strip = $('#strip'), win = $('#scrollWin');
  strip.innerHTML = segs.map((a, i) => {
    const prev = segs[i - 1];   // 上面那張；這張的上緣疊進它的底部
    const mt = prev && a.blend ? -(a.blend * a.h / a.w * 100) : 0;
    return `<img src="../dugu-trail/${a.src}" alt="毒菇山行 第 ${a.stages[0]} 頁" style="margin-top:${mt.toFixed(3)}%;z-index:${i + 1}" loading="lazy" draggable="false">`;
  }).join('');
  let off = null, dir = -1, drag = null, last = 0, idle = 0;
  const maxOff = () => Math.max(0, strip.offsetHeight - win.clientHeight);
  function altAt() {
    const mid = off + win.clientHeight / 2, ims = $$('img', strip);
    for (let i = ims.length - 1; i >= 0; i--) {
      const im = ims[i], top = im.offsetTop, h = im.offsetHeight;
      if (mid >= top) { const n = segs[i].stages[0], f = 1 - Math.min(1, (mid - top) / h); return Math.round(((n - 1 + f) * TR.STEP) / 10) * 10; }
    }
    return 3000;
  }
  function stepScroll(t) {
    const dt = Math.min(50, t - last); last = t;
    if (off === null && strip.offsetHeight > win.clientHeight) off = maxOff();
    if (off !== null) {
      if (!drag && t > idle && !reduce) { off += dir * dt * .045; if (off <= 0) { off = 0; dir = 1; idle = t + 2500; } if (off >= maxOff()) { off = maxOff(); dir = -1; idle = t + 1500; } }
      strip.style.transform = `translateY(${-off.toFixed(1)}px)`;
      $('#altNum').textContent = altAt().toLocaleString();
    }
    requestAnimationFrame(stepScroll);
  }
  requestAnimationFrame(stepScroll);
  win.addEventListener('pointerdown', e => { drag = { y: e.clientY, o: off }; win.setPointerCapture(e.pointerId); });
  win.addEventListener('pointermove', e => { if (drag) off = Math.min(maxOff(), Math.max(0, drag.o - (e.clientY - drag.y))); });
  win.addEventListener('pointerup', () => { drag = null; idle = performance.now() + 3000; });
  win.addEventListener('wheel', e => { e.preventDefault(); off = Math.min(maxOff(), Math.max(0, off + e.deltaY)); idle = performance.now() + 3000; dir = e.deltaY > 0 ? 1 : -1; }, { passive: false });

  /* ---------- 5. 三冊圖鑑 ---------- */
  const COVER = { low: 'chloro', mid: 'omphalotus', high: 'muscaria' };
  $('#shelf').innerHTML = D.BOOKS.map((b, i) => { const m = D.byId[COVER[b.key]];
    return `<button class="book rv${i ? '' : ' on'}" data-book="${b.key}" style="--bc:${b.color};--rd:${i * .1}s">
      <div class="book-cover"><img class="bc-gill" src="${m.gill}" alt=""><span class="bc-sub">${b.sub} ・ ${b.range}</span><span class="bc-title">${b.title}</span><span class="bc-en">${b.en}</span><img class="bc-mush" src="${m.img}" alt=""></div>
      <div class="book-meta"><b>${b.title}</b><span>${b.range}</span><p>${b.text}</p></div></button>`; }).join('');
  function showBook(k) {
    const b = D.BOOKS.find(x => x.key === k);
    $$('.book').forEach(el => el.classList.toggle('on', el.dataset.book === k));
    const list = D.M.filter(m => m.band === k).sort((a, c) => a.stage - c.stage);
    const pages = list.filter(m => m.plate), rest = list.filter(m => !m.plate);
    $('#pages').innerHTML = `<div class="pages-h"><b>翻開《${b.title}》</b><span>${b.sub} ${b.range} ・ 收錄 ${list.length} 種${pages.length ? `，點書頁看大圖` : '（書頁排版中，先認識裡面的菇）'}</span></div>
      <div class="pages-row">${pages.map(m => `<button class="pg" data-lb="${m.plate}" data-cap="《${b.title}》 ${m.name} ・ P.${m.page}"><img src="${m.plate}" alt="${m.name} 書頁" loading="lazy"><span><em>P.${m.page}</em>${m.name}</span></button>`).join('')}
      ${rest.map(m => `<button class="pg mush" data-mush="${m.id}"><img src="${m.img}" alt="" loading="lazy"><span><em>${D.TYPES[m.type].name}</em>${m.name}</span></button>`).join('')}</div>`;
  }
  $('#shelf').addEventListener('click', e => { const b = e.target.closest('.book'); if (b) showBook(b.dataset.book); });
  showBook('low');

  /* ---------- 6. 小卡扇形、頁尾草叢 ---------- */
  $('#fan').innerHTML = ['muscaria', 'phallus', 'verna', 'cornu', 'gymnopilus'].map((id, i) => `<img src="${D.byId[id].card}" alt="" style="--r:${(i - 2) * 6}">`).join('');
  /* ---------- 7. 區塊交界：林線剪影（向量、清楚俐落）、山丘緩坡、林床草簇、螢火蟲 ---------- */
  // 固定亂數：每次開都一樣，不會跳
  const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  // 一棵針葉樹：由上往下 4–5 層，每層外緣略垂
  function conifer(x, base, h, w, r) {
    const n = 4 + Math.floor(r() * 2), top = base - h, pts = [[x, top]];
    for (let i = 1; i <= n; i++) {
      const y = top + h * .86 * i / n, hw = w / 2 * (i / n) * (.82 + r() * .3);
      pts.push([x + hw, y]);
      if (i < n) pts.push([x + hw * .42, y - h * .05]);
    }
    const R = pts.slice(1), L = R.map(([px, py]) => [2 * x - px, py]).reverse();
    const tw = Math.max(2, w * .06);
    return 'M' + [[x, top], ...R, [x + tw, base - h * .14], [x + tw, base], [x - tw, base], [x - tw, base - h * .14], ...L].map(p => p.map(v => v.toFixed(1)).join(',')).join('L') + 'Z';
  }
  // 一叢闊葉樹：幾個圓疊起來
  function broad(x, base, h, w, r) {
    let d = `M${(x - w * .05).toFixed(1)},${base}L${(x - w * .05).toFixed(1)},${(base - h * .45).toFixed(1)}L${(x + w * .05).toFixed(1)},${(base - h * .45).toFixed(1)}L${(x + w * .05).toFixed(1)},${base}Z`;
    for (let i = 0; i < 4; i++) { const cx = x + (r() - .5) * w * .55, cy = base - h * (.5 + r() * .32), rr = w * (.22 + r() * .14);
      d += `M${(cx - rr).toFixed(1)},${cy.toFixed(1)}a${rr.toFixed(1)},${rr.toFixed(1)} 0 1,0 ${(rr * 2).toFixed(1)},0a${rr.toFixed(1)},${rr.toFixed(1)} 0 1,0 ${(-rr * 2).toFixed(1)},0Z`; }
    return d;
  }
  function treeline(el, seed) {
    const W = 1600, H = +el.dataset.h || 150, r = rng(seed);
    const row = (hMin, hMax, gap, y0) => { let d = '', x = -20;
      while (x < W + 40) { const h = hMin + r() * (hMax - hMin), w = h * (.42 + r() * .16);
        d += r() < .2 ? broad(x, H + 2, h * .8, w * 1.5, r) : conifer(x, H + 2, h, w, r); x += gap * (.55 + r() * .9); }
      return d + `M-20,${H - y0}L${W + 40},${H - y0}L${W + 40},${H + 4}L-20,${H + 4}Z`; };
    let mush = '';
    for (let i = 0; i < 9; i++) { const x = 60 + r() * (W - 120), h = H * (.07 + r() * .07), cw = h * (.9 + r() * .7), sw = Math.max(2, cw * .16), base = H + 2;
      mush += `M${(x - sw / 2).toFixed(1)},${base}L${(x - sw / 2).toFixed(1)},${(base - h * .62).toFixed(1)}L${(x - cw / 2).toFixed(1)},${(base - h * .62).toFixed(1)}Q${x.toFixed(1)},${(base - h * 1.35).toFixed(1)} ${(x + cw / 2).toFixed(1)},${(base - h * .62).toFixed(1)}L${(x + sw / 2).toFixed(1)},${(base - h * .62).toFixed(1)}L${(x + sw / 2).toFixed(1)},${base}Z`; }
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path class="tl-back" d="${row(H * .55, H * .98, 46, 6)}"/><path class="tl-mid" d="${row(H * .32, H * .7, 40, 4)}"/><path class="tl-front" d="${row(H * .14, H * .38, 30, 2)}${mush}"/></svg>`;
  }
  function hill(el, seed) {
    const W = 1600, H = +el.dataset.h || 90, r = rng(seed);
    const wave = (amp, off, k) => { let d = `M0,${H}L0,${(H - off).toFixed(1)}`; const n = 7;
      for (let i = 0; i < n; i++) { const x0 = W * i / n, x1 = W * (i + 1) / n, cy = H - off - amp * (r() * .9 + .3) * (i % 2 ? 1 : -.35);
        d += `Q${((x0 + x1) / 2).toFixed(1)},${cy.toFixed(1)} ${x1.toFixed(1)},${(H - off - (r() - .5) * amp * .5).toFixed(1)}`; }
      return d + `L${W},${H}Z`; };
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="hl-back" d="${wave(H * .4, H * .55, 1)}"/><path class="hl-front" d="${wave(H * .3, H * .3, 2)}"/></svg>`;
  }
  const GRS = ['grass-a', 'grass-dark', 'grass-corner', 'grass-a', 'grass-dark'], gr = rng(29);
  $$('[data-grass]').forEach(el => { el.innerHTML = Array.from({ length: 46 }, (_, i) => `<img src="${S(GRS[i % 5])}" alt="" style="height:${(70 + gr() * 30).toFixed(0)}%;--fx:${gr() < .5 ? -1 : 1}">`).join(''); });
  // 林床：零星草簇，不是一整排
  const tufts = ['grass-a', 'grass-dark'], tr = rng(11);
  $('#floorGround').innerHTML = Array.from({ length: 12 }, (_, i) => `<img src="${S(tufts[i % 2])}" alt="" style="left:${(3 + i * 8.6 + tr() * 4).toFixed(1)}%;height:${(22 + tr() * 26).toFixed(0)}px;transform:translateX(-50%) scaleX(${tr() < .5 ? -1 : 1})">`).join('');
  const R = () => Math.random();
  if (!reduce) $('#flies').innerHTML = Array.from({ length: 22 }, () => `<i style="left:${(R() * 100).toFixed(1)}%;top:${(25 + R() * 70).toFixed(1)}%;--t:${(6 + R() * 8).toFixed(1)}s;--dl:${(-R() * 10).toFixed(1)}s;--dx:${(R() * 120 - 60).toFixed(0)}px;--dy:${(R() * 80 - 40).toFixed(0)}px"></i>`).join('');
  reveal();
})();
