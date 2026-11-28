/* =========================================================
   讀菇山行 － 主程式（由下往上的捲動、面板、菇點、氣候特效）
   ========================================================= */
(function () {
  const { ART: SEGS, STAGES, MUSH, ECO, TOP, STEP } = window.TRAIL;
  const N = STAGES.length;                                   // 層數（目前 21 層，對應書頁 01–21）；N + 1 代表山頂
  const { mushSVG, slotSVG, trunkSVG, mix, lerp } = window.ART;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 私密模式 */ } }
  };

  const WOOD = new Set(['muer', 'hypholoma', 'galerina', 'omphalotus']);
  const SPRITE = { gyromitra: { kind: 'brain', cap: '#9a5536', stem: '#efe2cf' }, muscaria: { kind: 'amanita', cap: '#d8232b', spot: '#fbf3ea', stem: '#f3eee6' } };
  const ORDER = Object.values(MUSH).filter(m => !m.ref).sort((a, b) => a.stage - b.stage);   // ref＝相似可食對照，只在菇卡裡出現
  const WX = { leaves: '落葉飄落', pollen: '花粉飛舞', spores: '孢子飄散', rain: '細雨', mist: '山嵐霧氣', fireflies: '夜間螢光', wind: '稜線強風', snow: '飄雪' };
  const found = new Set(store.get('dugu-found', []));

  /* ---------- 1. 組出大樹（由上到下排 DOM，視覺上由下往上走） ----------
     預設只放已完成的插畫，相鄰兩張用不規則漸層融合；
     頁首「示意層」打開時，沒有插畫的層以示意背景＋樹幹補上 */
  const segOf = {};
  SEGS.forEach(s => s.stages.forEach(n => (segOf[n] = s)));
  const col = $('#column');
  const thumb = (m, cls = '') => m.img ? `<img class="cut ${cls}" src="${m.img}" alt="" draggable="false">` : mushSVG(m.svg || SPRITE[m.id]);
  const label = m => `<span class="hs-label">${m.name}<em>${m.type}</em></span>`;
  const showPh = !!window.TRAIL_FULL;                  // full.html 設 TRAIL_FULL＝true：補上還沒有插畫的層（示意）
  let blocks = [];

  function buildColumn() {
    col.innerHTML = ''; blocks = [];
    for (let n = N; n >= 1;) {
      if (segOf[n]) { blocks.push({ type: 'art', seg: segOf[n] }); n = Math.min(...segOf[n].stages) - 1; }
      else if (showPh) { const g = []; while (n >= 1 && !segOf[n]) g.unshift(STAGES[--n]); blocks.push({ type: 'ph', stages: g }); }
      else n--;
    }
    blocks.forEach((b, bi) => {
      const el = document.createElement('div');
      b.el = el;
      if (b.type === 'art') {
        const s = b.seg, prev = blocks[bi - 1], next = blocks[bi + 1];
        el.className = 'seg art';
        if (prev && prev.type === 'ph') el.classList.add('fade-top');
        if (next && next.type === 'ph') el.classList.add('fade-bottom');
        el.style.aspectRatio = `${s.w} / ${s.h}`;
        // 上一張也是插畫：往上疊 blend 的高度，用接縫遮罩融合
        b.blend = prev && prev.type === 'art' ? (s.blend || .2) : 0;
        if (b.blend) {
          el.classList.add('blend');
          el.style.setProperty('--bh', `calc(var(--W) * ${(b.blend * s.h / s.w).toFixed(4)})`);
        }
        el.innerHTML = `<img src="${s.src}" alt="讀菇山行插畫：海拔 ${STAGES[Math.min(...s.stages) - 1].from}–${STAGES[Math.max(...s.stages) - 1].to} 公尺" draggable="false">` +
          s.hot.map((h, i) => {
            if (h.m) { const m = MUSH[h.m]; return `<button class="hs${h.small ? ' small' : ''}" data-m="${h.m}" data-cat="mush" style="left:${h.x}%;top:${h.y}%;--c:${m.color};--dl:${(i * .37) % 2}s" aria-label="${m.name}">${label(m)}</button>`; }
            const e = ECO[h.e], cat = { '地景': 'land', '植物': 'plant', '動物': 'animal' }[e.tag] || 'land';
            return `<button class="hs eco small cat-${cat}" data-e="${h.e}" data-cat="${cat}" style="left:${h.x}%;top:${h.y}%;--dl:${(i * .29) % 2}s" aria-label="${e.name}"><span class="hs-label">${e.name}<em>${e.tag}</em></span></button>`;
          }).join('');
      } else {
        // 示意層：上下鄰接插畫的樹幹寬度
        const lo = b.stages[0].n, hi = b.stages[b.stages.length - 1].n;
        const below = segOf[lo - 1], above = segOf[hi + 1];
        const eb = (below && below.trunkTop) || [.3, .7], et = (above && above.trunkBottom) || [.3, .7];
        const k = b.stages.length;
        el.className = 'seg ph';
        b.slots = [];
        let sprites = '';
        [...b.stages].reverse().forEach((st, i) => {           // i = 0 是最上面那層
          const slot = document.createElement('div');
          slot.className = 'slot'; slot.dataset.n = st.n;
          slot.innerHTML = slotSVG(st) + `<span class="slot-tag">插畫 ${String(st.n).padStart(2, '0')} ・ 待繪製</span>`;
          el.appendChild(slot);
          b.slots.push({ n: st.n, el: slot });
          // 這層的樹幹邊界（與 art.js 的樹幹一致）
          const t = (k - 1 - i + .15) / k, e = t * t * (3 - 2 * t);
          const L = lerp(eb[0], et[0], e), R = lerp(eb[1], et[1], e);
          ORDER.filter(m => m.stage === st.n).forEach((m, j) => {
            const side = (st.n + j) % 2;
            const w = m.img ? 11 : 8.5;
            let x, y;
            if (WOOD.has(m.id) && m.id !== 'omphalotus') { x = side ? Math.min(R * 100 - 4, 82) : Math.max(L * 100 + 4, 21); y = 52; }
            else { x = side ? Math.min((R + (1 - R) * .4) * 100, 84) : Math.max(L * 100 - 5, 21); y = 92; }
            const top = (i + y / 100) / k * 100;
            const glow = m.glow ? ' glows' : '';
            sprites += `<button class="sp${glow}" data-m="${m.id}" data-cat="mush" style="left:${x.toFixed(1)}%;top:${top.toFixed(2)}%;--w:${w}%;--c:${m.color};--dl:-${j * 1.3}s" aria-label="${m.name}">${thumb(m)}${label(m)}</button>`;
            if (!m.img || m.id === 'morel' || m.id === 'hypholoma') {
              const dx = side ? 5 : (x - 5 < 19 ? 6 : -5);   // 左側的小菇改放右邊，不壓到海拔儀
              sprites += `<button class="sp${glow}" data-m="${m.id}" data-cat="mush" tabindex="-1" style="left:${(x + dx).toFixed(1)}%;top:${(top + .4 / k).toFixed(2)}%;--w:${(w * .55).toFixed(1)}%;--c:${m.color};--dl:-${j + 2}s" aria-hidden="true">${thumb(m)}</button>`;
            }
          });
        });
        el.insertAdjacentHTML('beforeend', `<div class="trunk">${trunkSVG(b.stages, eb, et, 0)}</div><div class="sprites">${sprites}</div>`);
      }
      col.appendChild(el);
    });
  }
  buildColumn();

  $('#statMush').textContent = ORDER.length; $('#statMush').dataset.count = ORDER.length;
  const drawn = new Set(SEGS.flatMap(s => s.stages)).size;
  $$('[data-ver-label]').forEach(el => (el.textContent = window.TRAIL_FULL ? `完整版 ・ ${N} 層（含 ${N - drawn} 層示意）` : `插畫版 ・ 已完成 ${drawn} / ${N} 層`));
  $$('[data-count-layers]').forEach(el => { el.dataset.count = N; el.textContent = N; });

  /* ---------- 2. 海拔儀刻度 ---------- */
  const scale = $('#railScale');
  STAGES.forEach(st => {
    const b = document.createElement('button');
    b.className = 'rail-tick' + ((st.n - 1) % 4 === 0 ? ' major' : '');
    b.style.bottom = st.alt / TOP * 100 + '%';
    b.dataset.go = st.n;
    b.innerHTML = `<span>${fmt(st.from)}　${st.name}</span>`;
    b.setAttribute('aria-label', `${st.name}，海拔 ${st.from} 公尺`);
    scale.appendChild(b);
  });

  // 「展開高度說明」開關：一次顯示所有層的名稱
  const rail = $('#rail'), railToggle = $('#railToggle');
  const setRailOpen = v => {
    rail.classList.toggle('expanded', v); railToggle.setAttribute('aria-pressed', v);
    $('.rt-txt', railToggle).textContent = v ? '收合高度說明' : '展開高度說明';
    store.set('dugu-rail', v);
  };
  setRailOpen(store.get('dugu-rail', false));
  railToggle.addEventListener('click', () => setRailOpen(!rail.classList.contains('expanded')));

  /* ---------- 3. 量測每層位置 ---------- */
  let bands = [], colTop = 0, colBottom = 0;
  const snaps = document.createElement('div');
  snaps.className = 'snaps'; $('#trail').appendChild(snaps);
  function measure() {
    const sy = scrollY;
    bands = [];
    const list = [];                                   // 由上到下
    blocks.forEach(b => {
      const r = b.el.getBoundingClientRect();
      if (b.type === 'art') {
        const ks = [...b.seg.stages].sort((a, c) => c - a), h = r.height / ks.length;
        ks.forEach((n, i) => list.push({ n, top: r.top + sy + i * h, bottom: r.top + sy + (i + 1) * h, blendPx: 0 }));
        if (b.blend) list[list.length - ks.length].blendPx = b.blend * b.seg.h / b.seg.w * r.width;
      } else b.slots.forEach(({ n, el }) => { const q = el.getBoundingClientRect(); list.push({ n, top: q.top + sy, bottom: q.bottom + sy }); });
    });
    // 兩張插畫相疊的融合區，各分一半給上下兩層
    for (let i = 1; i < list.length; i++) {
      if (list[i].blendPx) { const mid = list[i].top + list[i].blendPx / 2; list[i - 1].bottom = mid; list[i].top = mid; }
    }
    list.forEach(x => (bands[x.n - 1] = { top: x.top, bottom: x.bottom }));
    colTop = Math.min(...list.map(x => x.top)); colBottom = Math.max(...list.map(x => x.bottom));
    // 觸控螢幕用的吸附點：每一層的中心
    const mainTop = $('#trail').getBoundingClientRect().top + sy;
    snaps.innerHTML = list.map(x => `<i style="top:${((x.top + x.bottom) / 2 - mainTop).toFixed(0)}px"></i>`).join('');
    $$('.rail-tick').forEach(t => t.classList.toggle('missing', !bands[+t.dataset.go - 1]));
  }
  const lineY = () => scrollY + innerHeight * .5;
  function altAt(y) {
    if (y >= colBottom) return -1;            // 山腳（菌絲層）
    if (y <= colTop) return TOP + 1;          // 山頂
    for (let i = 0; i < N; i++) {
      const b = bands[i];
      if (b && y <= b.bottom && y >= b.top) return STAGES[i].from + (STAGES[i].to - STAGES[i].from) * (b.bottom - y) / (b.bottom - b.top);
    }
    return 0;
  }
  const present = () => bands.map((b, i) => (b ? i + 1 : 0)).filter(Boolean);
  function goStage(n, smooth = true) {
    const max = document.documentElement.scrollHeight - innerHeight;
    let y;
    if (n <= 0) y = max;
    else if (n > N) y = 0;
    else {
      const b = bands[n - 1];
      if (!b) { toast(`第 ${n} 層（${STAGES[n - 1].name}）插畫還在繪製中　可到「完整 21 層版」瀏覽`); return false; }
      y = (b.top + b.bottom) / 2 - innerHeight * .5;
    }
    glideTo(clamp(y, 0, max), smooth && !reduce ? 700 : 0);
    return true;
  }
  // 自己做的平滑捲動：每一層移動的時間固定，移動中暫停觸控吸附，避免互相拉扯
  let glideRaf = 0, gliding = false;
  function glideTo(y, dur, ease) {
    cancelAnimationFrame(glideRaf);
    if (!dur) { scrollTo(0, y); return; }
    const y0 = scrollY, t0 = performance.now();
    gliding = true;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = ease === 'out' ? 1 - Math.pow(1 - k, 3) : (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      scrollTo(0, y0 + (y - y0) * e);
      if (k < 1) glideRaf = requestAnimationFrame(tick); else gliding = false;
    };
    glideRaf = requestAnimationFrame(tick);
  }
  // 使用者一動（滾輪、觸控、按鍵）就停止自動滑動，交還控制
  ['wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { if (gliding && !wheelOn) { cancelAnimationFrame(glideRaf); gliding = false; } }, { passive: true }));
  // 往上／往下走一層（跳過沒有插畫的層）
  function step(dir) {
    const ps = present();
    let target;
    if (cur <= 0) target = dir > 0 ? ps[0] : 0;
    else if (cur > N) target = dir > 0 ? N + 1 : ps[ps.length - 1];
    else {
      const i = ps.indexOf(cur);
      target = dir > 0 ? (i < ps.length - 1 ? ps[i + 1] : N + 1) : (i > 0 ? ps[i - 1] : 0);
    }
    goStage(target);
  }

  /* ---------- 4. 面板 ---------- */
  const panel = $('#panel');
  const toxHTML = m => `<span class="tox${m.tox === 0 ? ' safe' : ''}" title="毒性 ${m.tox}/5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= (m.tox === 0 ? 5 : m.tox) ? 'on' : ''}"></i>`).join('')}</span>`;
  let panelOpen = false, panelMini = store.get('dugu-panel-mini', false);
  function renderPanel(st) {
    const ms = ORDER.filter(m => m.stage === st.n);
    const metric = (k, v, unit, p, c) => `<div class="mt"><div class="mt-k">${k}</div><div class="mt-v">${v}<small>${unit}</small></div><div class="mt-bar"><i style="--p:${p}%;--c:${c}"></i></div></div>`;
    panel.innerHTML = `<div class="pn-in">
      <div class="pn-head"><span class="pn-no">${String(st.n).padStart(2, '0')}<small>/${N}</small></span><span class="pn-zone">${st.zone}</span>
        <button class="pn-toggle" aria-expanded="${panelOpen}">詳細 <b>▲</b></button><button class="pn-mini" aria-label="收合資訊卡" title="收合／展開資訊卡">${panelMini ? '＋' : '—'}</button></div>
      <h2 class="pn-name">${st.name}</h2>
      <div class="pn-en pn-hide">${st.en}</div>
      <div class="pn-range pn-hide">ALT ${fmt(st.from)} – ${fmt(st.to)} m</div>
      <p class="pn-desc pn-hide">${st.desc}</p>
      <div class="pn-clim">
        ${metric('年均溫', st.temp.toFixed(1), '°C', clamp(st.temp / 25 * 100, 4, 100), st.temp > 15 ? '#e7b34a' : st.temp > 9 ? '#8fc1d6' : '#d7ecff')}
        ${metric('濕度', st.humid, '%', st.humid, '#7fc6b5')}
        ${metric('年雨量', fmt(st.rain), 'mm', st.rain / 40, '#6fa3d8')}
        ${metric('含氧量', st.o2, '%', st.o2, '#a9b84a')}
      </div>
      <div class="pn-wx pn-hide">${st.weather.map(w => `<span class="wx">${WX[w]}</span>`).join('')}${st.night ? '<span class="wx">夜</span>' : ''}</div>
      <div class="pn-sec pn-hide"><h4>植物</h4><div class="chips">${st.flora.map(f => `<span class="chip">${f}</span>`).join('')}</div></div>
      <div class="pn-sec pn-hide"><h4>動物</h4><div class="chips">${st.fauna.map(f => `<span class="chip">${f}</span>`).join('')}</div></div>
      <div class="pn-sec"><h4>本層菇類</h4>${ms.length ? ms.map(m => `<button class="mchip" data-open="${m.id}" style="--c:${m.color}"><span class="lk">${thumb(m)}</span><span><b>${m.name}</b><em>${m.sci}</em></span>${toxHTML(m)}</button>`).join('') : '<p class="pn-note" style="margin:0">這一層沒有記錄到菇類。</p>'}</div>
      <p class="pn-note pn-hide">氣候為依海拔推估的示意值（氣溫遞減率 0.6°C／100 m）。動植物與菇類資料待組員校正。</p>
    </div>`;
    panel.classList.toggle('open', panelOpen);
    panel.classList.toggle('mini', panelMini);
  }
  panel.addEventListener('click', e => {
    const t = e.target.closest('.pn-toggle');
    if (t) { panelOpen = !panelOpen; panel.classList.toggle('open', panelOpen); t.setAttribute('aria-expanded', panelOpen); }
    const mi = e.target.closest('.pn-mini');
    if (mi) { panelMini = !panelMini; store.set('dugu-panel-mini', panelMini); panel.classList.toggle('mini', panelMini); mi.textContent = panelMini ? '＋' : '—'; }
  });

  /* ---------- 5. 捲動狀態 ---------- */
  const altNum = $('#altNum'), altSub = $('#altSub'), mark = $('#railMark'), fill = $('#railFill');
  const banner = $('#banner'), root = document.documentElement.style;
  let cur = -1, alt = -1, bannerTimer, first = true, lastY = scrollY, scrollDY = 0;
  const weight = (a, test) => {          // 以高度做平滑的權重
    const f = a / STEP - .5; let s = 0, w = 0;
    STAGES.forEach((st, i) => { const g = Math.exp(-((i - f) ** 2) / .72); w += g; if (test(st)) s += g; });
    return s / w;
  };
  const elNight = $('#night'), elFog = $('#fog'), elFrost = $('#frost');
  const setLayer = (el, v) => { el.style.opacity = v.toFixed(3); el.style.visibility = v < .01 ? 'hidden' : 'visible'; };
  function update() {
    scrollDY += scrollY - lastY; lastY = scrollY;
    const a = altAt(lineY());
    alt = a;
    const A = clamp(a, 0, TOP);
    altNum.textContent = fmt(A);
    const p = A / TOP * 100;
    mark.style.bottom = p + '%'; fill.style.height = p + '%';
    // 氣候覆蓋（幾乎看不到時整層隱藏，捲動時不用重算）
    const night = a < 0 ? 0 : weight(A, s => s.night);
    setLayer(elNight, night);
    document.body.classList.toggle('is-night', night > .35);
    setLayer(elFog, a < 0 ? 0 : weight(A, s => s.weather.includes('mist')) * .6);
    setLayer(elFrost, clamp((A - 2500) / 500, 0, 1) * (a > TOP ? .5 : .55));
    fx.set(a);
    // 層別
    const n = a < 0 ? 0 : a > TOP ? N + 1 : clamp(Math.floor(A / STEP) + 1, 1, N);
    document.body.classList.toggle('at-ground', n === 0);
    document.body.classList.toggle('at-summit', n === N + 1);
    if (n !== cur) {
      const prev = cur; cur = n;
      $$('.rail-tick').forEach(el => el.classList.toggle('on', +el.dataset.go === n));
      if (n === 0) altSub.textContent = '山腳・菌絲層';
      else if (n === N + 1) altSub.textContent = `山頂・${fmt(TOP)} m`;
      else {
        const st = STAGES[n - 1];
        altSub.textContent = `${st.zone}・${st.temp.toFixed(1)}°C`;
        renderPanel(st);
        if (!first && prev !== -1) {
          banner.innerHTML = `<span class="b-alt">${n > prev ? '↑' : '↓'} ${fmt(st.from)} m</span><span class="b-name">${st.name}</span><span class="b-en">${st.en}</span>`;
          banner.classList.add('on'); clearTimeout(bannerTimer);
          bannerTimer = setTimeout(() => banner.classList.remove('on'), 1900);
        }
      }
      if (n === N + 1) renderSummit();
    }
    first = false;
  }
  let ticking = false, lastScrollT = 0, snapT = 0, pointerDown = false, userMoved = false;
  // 只有使用者自己滑動（滾輪、觸控、鍵盤、拖捲軸）才算數；程式自己的捲動不會再觸發對齊，避免來回拉扯
  ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(ev => addEventListener(ev, () => (userMoved = true), { passive: true }));
  addEventListener('scroll', () => {
    lastScrollT = performance.now();
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }
    // 停下來之後，若離某一層的中心不遠，就輕輕滑過去對齊（不干擾正在滑動的手感）
    clearTimeout(snapT);
    if (!gliding && userMoved) snapT = setTimeout(softSnap, 170);
  }, { passive: true });
  addEventListener('pointerdown', () => (pointerDown = true), { passive: true });
  addEventListener('pointerup', () => { pointerDown = false; if (userMoved) { clearTimeout(snapT); snapT = setTimeout(softSnap, 170); } }, { passive: true });
  function softSnap() {
    if (gliding || pointerDown || drawerOpen || dexOpen || reduce || !userMoved) return;
    if (performance.now() - lastScrollT < 150) { snapT = setTimeout(softSnap, 120); return; }
    userMoved = false;                                   // 一次手勢只對齊一次
    const y = lineY();
    if (y >= colBottom || y <= colTop) return;            // 山腳、山頂不對齊
    let best = null, bd = Infinity;
    bands.forEach(b => { if (!b) return; const c = (b.top + b.bottom) / 2, d = c - y; if (Math.abs(d) < Math.abs(bd)) { bd = d; best = b; } });
    if (!best || Math.abs(bd) < 6 || Math.abs(bd) > innerHeight * .34) return;
    glideTo(scrollY + bd, clamp(Math.abs(bd) * 1.6, 260, 620), 'out');
  }

  /* ---------- 6. 滾動：瀏覽器原生捲動（有慣性、最順）＋停下後輕輕對齊每一層 ----------
     「反向滾動」開啟時才接管滾輪：往下滾＝往上爬，用平滑追隨，不再一格一格卡住 */
  const btnWheel = $('#btnWheel');
  let wheelOn = store.get('dugu-wheel-inv', false);
  const setWheel = v => { wheelOn = v; btnWheel.setAttribute('aria-pressed', v); store.set('dugu-wheel-inv', v); };
  setWheel(wheelOn);
  btnWheel.addEventListener('click', () => setWheel(!wheelOn));
  let wheelTarget = null, wheelRaf = 0;
  const wheelFollow = () => {
    const d = wheelTarget - scrollY;
    if (Math.abs(d) < .5) { scrollTo(0, wheelTarget); wheelTarget = null; return; }
    scrollTo(0, scrollY + d * .18);
    wheelRaf = requestAnimationFrame(wheelFollow);
  };
  addEventListener('wheel', e => {
    if (!wheelOn || e.ctrlKey || drawerOpen || dexOpen || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.target.closest && e.target.closest('.panel')) return;
    e.preventDefault();
    cancelAnimationFrame(glideRaf); gliding = false;
    const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    const max = document.documentElement.scrollHeight - innerHeight;
    wheelTarget = clamp((wheelTarget === null ? scrollY : wheelTarget) - d, 0, max);
    if (!wheelRaf || wheelTarget !== null) { cancelAnimationFrame(wheelRaf); wheelRaf = requestAnimationFrame(wheelFollow); }
  }, { passive: false });

  /* ---------- 7. 點菇：衝擊波 → 菇從畫裡浮起 → 飛到右側展示台 ---------- */
  const drawer = $('#drawer'), scrim = $('#scrim');
  let drawerOpen = false, openEl = null, lens = null, flyer = null;
  const artOf = m => m.img ? `<img src="${m.img}" alt="" draggable="false">` : mushSVG(m.svg || SPRITE[m.id]);
  function closeMush() {
    drawerOpen = false; rot.auto = false; cancelAnimationFrame(rot.tw);
    drawer.classList.remove('on'); scrim.classList.remove('on');
    setTimeout(() => { if (!drawerOpen) drawer.hidden = true; }, 600);
    clearScene();
  }
  function clearScene() {
    if (openEl) { openEl.classList.remove('is-open'); openEl = null; }
    if (lens) { const l = lens; l.classList.remove('on'); setTimeout(() => l.remove(), 500); lens = null; }
    if (flyer) { flyer.remove(); flyer = null; }
  }
  function burst(host, x, y, c) {
    if (reduce) return;
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('i'), a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 90;
      s.className = 'spore';
      s.style.cssText = `left:${x};top:${y};--c:${c};--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r - 30).toFixed(0)}px;animation-delay:${(Math.random() * .2).toFixed(2)}s`;
      host.appendChild(s); setTimeout(() => s.remove(), 2000);
    }
  }
  // 點擊處的衝擊波＋畫面泛光（固定在視窗上）
  function shock(x, y, c) {
    if (reduce) return;
    const w = document.createElement('div');
    w.className = 'shock';
    w.style.cssText = `left:${x}px;top:${y}px;--c:${c}`;
    w.innerHTML = '<i></i><i></i><i></i><b></b>';
    document.body.appendChild(w);
    setTimeout(() => w.remove(), 1400);
  }
  function highlight(el, m) {
    openEl = el; el.classList.add('is-open');
    const r = el.getBoundingClientRect();
    shock(r.left + r.width / 2, r.top + r.height / 2, m.color);
    if (el.classList.contains('hs')) {
      const seg = el.closest('.seg'), sr = seg.getBoundingClientRect();
      const D = innerWidth < 700 ? 150 : 230, Z = innerWidth < 700 ? 2.4 : 1.7;
      const x = parseFloat(el.style.left) / 100, y = parseFloat(el.style.top) / 100;
      lens = document.createElement('div');
      lens.className = 'lens';
      lens.style.cssText = `left:${el.style.left};top:${el.style.top};--d:${D}px;--c:${m.color};background-image:url(${seg.querySelector('img').src});background-size:${(sr.width * Z).toFixed(0)}px auto;background-position:${(-x * sr.width * Z + D / 2).toFixed(0)}px ${(-y * sr.height * Z + D / 2).toFixed(0)}px`;
      seg.appendChild(lens);
      requestAnimationFrame(() => requestAnimationFrame(() => lens && lens.classList.add('on')));
      burst(seg, el.style.left, el.style.top, m.color);
    } else if (el.classList.contains('sp')) {
      burst(el.parentElement, el.style.left, `calc(${el.style.top} - 2%)`, m.color);
    }
  }
  // 展示台在說明卡滑入「完成後」的位置（不受滑入動畫的 transform 影響）
  function stageBox() {
    const st = $('.dw-stage', drawer), fig = $('.hero-m', drawer);  // 飛行終點＝展示台中央
    if (!st || !fig) return null;
    const dl = drawer.offsetLeft, dt = drawer.offsetTop;
    const h = fig.offsetHeight, w = fig.offsetWidth;
    return { cx: dl + st.offsetLeft + st.offsetWidth / 2, cy: dt + st.offsetTop + fig.offsetTop + h / 2, w, h };
  }
  function fly(el, m) {
    const box = stageBox(), stage = $('.dw-stage', drawer);
    if (!box || reduce) { enter('sprout'); return; }
    const r = el.getBoundingClientRect();
    const h0 = el.classList.contains('hs') ? Math.min(150, innerHeight * .18) : r.height;
    const cx0 = r.left + r.width / 2, cy0 = el.classList.contains('hs') ? r.top + r.height / 2 - h0 * .25 : r.top + r.height / 2;
    const s0 = h0 / box.h;
    const tr = (cx, cy, s, rot = 0) => `translate(${(cx - box.w / 2).toFixed(1)}px,${(cy - box.h / 2).toFixed(1)}px) scale(${s.toFixed(3)}) rotate(${rot}deg)`;
    flyer = document.createElement('div');
    flyer.className = 'flyer';
    flyer.style.cssText = `width:${box.w}px;height:${box.h}px;--c:${m.color}`;
    flyer.innerHTML = artOf(m);
    document.body.appendChild(flyer);
    stage.classList.add('await');
    const mx = (cx0 + box.cx) / 2, my = Math.min(cy0, box.cy) - Math.min(160, innerHeight * .2);
    const f = flyer;
    // 1. 從畫裡浮起　2. 弧線飛行　3. 落到展示台
    const anim = f.animate([
      { transform: tr(cx0, cy0 + 10, s0 * .85), opacity: 0, filter: 'brightness(1.6) drop-shadow(0 0 0 transparent)' },
      { transform: tr(cx0, cy0 - 18, s0 * 1.35, -4), opacity: 1, offset: .22, filter: `brightness(1.25) drop-shadow(0 0 22px ${m.color})` },
      { transform: tr(mx, my, (s0 + 1) * .62, 8), opacity: 1, offset: .6, filter: `brightness(1.15) drop-shadow(0 0 30px ${m.color})` },
      { transform: tr(box.cx, box.cy, 1.06, -2), opacity: 1, offset: .9, filter: `brightness(1.05) drop-shadow(0 0 26px ${m.color})` },
      { transform: tr(box.cx, box.cy, 1, 0), opacity: 1, filter: 'brightness(1) drop-shadow(0 0 0 transparent)' }
    ], { duration: 1150, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
    // 飛行軌跡上的孢子
    const t0 = performance.now();
    const trail = () => {
      if (!flyer || flyer !== f) return;
      const q = f.getBoundingClientRect();
      const s = document.createElement('i');
      s.className = 'trail';
      s.style.cssText = `left:${q.left + q.width * (.3 + Math.random() * .4)}px;top:${q.top + q.height * (.2 + Math.random() * .5)}px;--c:${m.color}`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 900);
      if (performance.now() - t0 < 1000) requestAnimationFrame(trail);
    };
    setTimeout(trail, 240);
    const landed = () => {
      if (flyer !== f) return;
      enter('land');
      f.remove(); flyer = null;
    };
    anim.onfinish = landed;
    setTimeout(landed, 2200);            // 分頁在背景時動畫可能暫停，保險起見一定落地
  }
  function nearestEl(sel) {
    let best = null, bd = Infinity;
    $$(sel).forEach(el => {
      if (el.getAttribute('aria-hidden')) return;
      const r = el.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - innerHeight * .5);
      if (r.bottom > 0 && r.top < innerHeight && d < bd) { bd = d; best = el; }
    });
    return best;
  }
  function openMush(id, opts = {}) {
    const m = MUSH[id]; if (!m) return;
    // 說明卡已開著（上一種／下一種／相似菇）：直接換內容，背景移到那一層
    if (drawerOpen && !opts.el) {
      clearScene(); renderDrawer(m); markFound(m);
      $('.dw-scroll', drawer).scrollTop = 0;
      enter('sprout');
      const inView = nearestEl(`[data-m="${id}"]`);
      if (inView) highlight(inView, m);
      else if (bands[m.stage - 1]) { goStage(m.stage); setTimeout(() => { const e = nearestEl(`[data-m="${id}"]`); if (e && drawerOpen) highlight(e, m); }, reduce ? 50 : 900); }
      return;
    }
    if (drawerOpen) { drawerOpen = false; clearScene(); }
    const el = opts.el || nearestEl(`[data-m="${id}"]`);
    if (!el && opts.scroll !== false && bands[m.stage - 1]) {
      goStage(m.stage);
      setTimeout(() => openMush(id, { scroll: false }), reduce ? 50 : 900);
      return;
    }
    renderDrawer(m);
    drawer.hidden = false; drawerOpen = true;
    drawer.classList.add('on'); scrim.classList.add('on');
    if (el) { highlight(el, m); fly(el, m); } else enter('sprout');
    markFound(m);
    setTimeout(() => $('.x', drawer) && $('.x', drawer).focus({ preventScroll: true }), 350);
  }
  function markFound(m) {
    if (found.has(m.id)) return;
    found.add(m.id); store.set('dugu-found', [...found]); updateCount();
    toast(`新發現 <b>${m.name}</b>　已收集 ${found.size} / ${ORDER.length}`);
  }
  // 場景點（地景・植物・動物）：放大觀察＋在這裡生長的菇
  const CAT = { '地景': 'land', '植物': 'plant', '動物': 'animal' };
  const CAT_C = { land: '#8fb3d9', plant: '#a9c94a', animal: '#e7a64a' };
  function openEco(id, el) {
    const e = ECO[id]; if (!e) return;
    if (drawerOpen) { drawerOpen = false; clearScene(); }
    el = el || nearestEl(`[data-e="${id}"]`);
    if (!el) {                                   // 不在畫面上：先捲到那個場景點
      const first = $(`[data-e="${id}"]`); if (!first) return;
      const r = first.getBoundingClientRect();
      glideTo(scrollY + r.top - innerHeight * .5, reduce ? 0 : 850);
      setTimeout(() => openEco(id, first), reduce ? 50 : 900);
      return;
    }
    const cat = CAT[e.tag] || 'land', c = CAT_C[cat];
    highlight(el, { color: c });
    // 放大觀察：把插畫上這一點放大到說明卡裡
    const seg = el.closest('.seg'), img = seg && seg.querySelector('img');
    let view = '';
    if (img) {
      const Z = 3.2, W = 440, H = 300, s = seg.getBoundingClientRect();
      const bw = W * Z, bh = bw * s.height / s.width;
      const x = parseFloat(el.style.left) / 100, y = parseFloat(el.style.top) / 100;
      view = `<div class="eco-view" style="background-image:url(${img.src});background-size:${bw.toFixed(0)}px ${bh.toFixed(0)}px;background-position:calc(50% - ${((x - .5) * bw).toFixed(0)}px) calc(50% - ${((y - .5) * bh).toFixed(0)}px)"><i class="eco-ring"></i></div>`;
    }
    const st = STAGES[(segStage(el) || cur || 1) - 1];
    const rel = (e.rel || []).map(k => MUSH[k]).filter(Boolean);
    let n = 0; const seq = () => `style="--i:${n++}"`;
    drawer.style.setProperty('--c', c);
    drawer.innerHTML = `<div class="dw-top"><span>讀菇山行 ／ FIELD NOTE · ${e.tag}</span><button class="x" data-close aria-label="關閉">×</button></div>
      <div class="dw-scroll">
        <div class="dw-stage eco-stage cat-${cat}">${view}<span class="eco-tag">${e.tag}</span><span class="st-tag tr">${st ? `${fmt(st.from)}–${fmt(st.to)} m・${st.name}` : ''}</span></div>
        <div class="dw-body">
          <h2 class="dw-name eco-name" id="dwName" ${seq()}>${[...e.name].map((ch, i) => `<span style="--k:${i}">${ch}</span>`).join('')}</h2>
          <div class="dw-sci" ${seq()}>${st ? st.zone : ''}</div>
          <div class="dw-sec" ${seq()}><h3>觀察筆記</h3><p>${e.text}</p></div>
          ${rel.length ? `<div class="dw-sec" ${seq()}><h3>在這裡生長的菇</h3><div class="eco-rel">${rel.map(o => `<button data-open="${o.id}" style="--c:${o.color}"><span class="lk">${artOf(o)}</span><span><b>${o.name}</b><em>${o.type}</em></span></button>`).join('')}</div></div>` : ''}
          ${st ? `<div class="dw-sec" ${seq()}><h3>這一層的環境</h3><p>${st.desc}</p><div class="chips" style="margin-top:10px">${st.flora.map(f => `<span class="chip ch-plant">${f}</span>`).join('')}${st.fauna.map(f => `<span class="chip ch-animal">${f}</span>`).join('')}</div></div>` : ''}
        </div>
      </div>`;
    drawer.hidden = false; drawerOpen = true;
    requestAnimationFrame(() => { drawer.classList.add('on'); scrim.classList.add('on'); });
  }
  // 場景點所在的層：用它在插畫段落裡的高度換算
  function segStage(el) {
    const seg = el.closest('.seg'); if (!seg) return 0;
    const b = blocks.find(x => x.el === seg); if (!b || b.type !== 'art') return 0;
    const ks = [...b.seg.stages].sort((p, q) => p - q), y = parseFloat(el.style.top) / 100;
    return ks[Math.min(ks.length - 1, Math.floor((1 - y) * ks.length))];
  }
  /* ---------- 3D 旋轉展示台 ----------
     一圈 8 片去背圖繞著菌柄排開（看起來有厚度、可旋轉），
     再加「菌傘頂」與「菌褶」兩片圓盤，俯視、仰視時看得到 */
  // 每一類菇的動態個性：進場、待機、開場旋轉、粒子、光線都不同
  const MOTION = {
    muscaria: 'pop', hong: 'pop', huang: 'pop', exitialis: 'pop', fuliginea: 'pop', pantherina: 'pop',
    mutinus: 'rise', phallus: 'rise',
    chloro: 'umbrella', lepiota: 'umbrella',
    panaeolus: 'scatter', inocybe: 'scatter', hypholoma: 'scatter', galerina: 'scatter',
    omphalotus: 'glow',
    gyromitra: 'squish', helu: 'squish', morel: 'squish',
    muer: 'jelly',
    russula: 'flip', entoloma: 'flip',
    verna: 'pop', phalloides: 'pop', virosa: 'pop', pulvero: 'pop', leucocoprinus: 'umbrella',
    conocybe: 'scatter', psilocybe: 'scatter', gymnopilus: 'scatter', nitidum: 'flip'
  };
  const MO_INFO = {
    pop: { label: '浮現・旋轉', intro: [[0, 360, 1700]], fx: 'spark' },
    rise: { label: '升起・搖擺', intro: [[0, -40, 900], [-8, 40, 1300], [0, 0, 900]], fx: 'flies' },
    umbrella: { label: '漂浮・旋轉', intro: [[-30, 720, 2400], [0, 720, 600]], fx: 'rain' },
    scatter: { label: '滑入・張望', intro: [[-18, 45, 800], [-18, -45, 1000], [0, 0, 800]], fx: 'drift' },
    glow: { label: '夜光呼吸', intro: [[0, 180, 2200], [0, 360, 2200]], fx: 'fire' },
    squish: { label: '浮動・翻看菌蓋', intro: [[-35, 0, 1000], [-35, 180, 1600], [0, 360, 1000]], fx: 'bubble' },
    jelly: { label: '輕輕擺動', intro: [[0, 22, 800], [0, -18, 900], [0, 0, 800]], fx: 'drop' },
    flip: { label: '輕落・看菌褶', intro: [[0, 0, 300], [70, 0, 900], [70, 180, 1200], [0, 360, 900]], fx: 'swirl' }
  };
  const NO_GILLS = new Set(['mutinus', 'phallus', 'gyromitra', 'helu', 'morel', 'muer', 'cornu']);
  // 成群、帶木頭或葉子、不對稱的去背圖：用「厚紙卡」翻轉（正面＋厚度＋背面），不做一圈環繞
  const CARD = new Set(['mutinus', 'chloro', 'panaeolus', 'hypholoma', 'omphalotus', 'muer', 'helu', 'galerina', 'gymnopilus',
    'conocybe', 'nitidum', 'psilocybe', 'cornu', 'pantherina', 'virosa']);   // 多朵或不對稱的去背圖：用厚紙卡旋轉
  const VIEWS = { front: [0, 0], side: [-8, 70], back: [0, 180], top: [-72, 20], under: [68, 20] };
  const rot = { rx: 0, ry: 0, el: null, tw: 0, auto: false, autoT: 0, drag: null, m: null };
  function setRot() {
    if (!rot.el) return;
    rot.el.style.transform = `rotateX(${rot.rx.toFixed(2)}deg) rotateY(${rot.ry.toFixed(2)}deg)`;
    const st = rot.el.closest('.dw-stage');
    if (!st) return;
    st.style.setProperty('--sheen', (Math.sin(rot.ry * Math.PI / 180) * 50 + 50).toFixed(1) + '%');
    // 往上／往下翻到一定角度才顯示菌傘頂、菌褶圓盤，正面看不到它們的邊
    st.style.setProperty('--topv', clamp((-rot.rx - 18) / 30, 0, 1).toFixed(2));
    st.style.setProperty('--unv', clamp((rot.rx - 18) / 30, 0, 1).toFixed(2));
  }
  function tween(seq, done) {
    cancelAnimationFrame(rot.tw);
    let i = 0;
    const next = () => {
      if (i >= seq.length) { rot.rx %= 360; rot.ry %= 360; setRot(); done && done(); return; }
      const [tx, ty, d] = seq[i++], fx = rot.rx, fy = rot.ry, t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / (reduce ? 1 : d)), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        rot.rx = fx + (tx - fx) * e; rot.ry = fy + (ty - fy) * e; setRot();
        if (k < 1) rot.tw = requestAnimationFrame(tick); else next();
      };
      rot.tw = requestAnimationFrame(tick);
    };
    next();
  }
  function autoSpin(on) {
    rot.auto = on;
    const b = $('[data-spin]', drawer); if (b) b.classList.toggle('on', on);
    if (!on) return;
    cancelAnimationFrame(rot.tw);
    let last = performance.now();
    const tick = now => {
      if (!rot.auto || !rot.el || !rot.el.isConnected) return;
      rot.ry += (now - last) * .045; last = now;
      rot.rx += (-12 - rot.rx) * .03;
      setRot(); rot.tw = requestAnimationFrame(tick);
    };
    rot.tw = requestAnimationFrame(tick);
  }
  function setView(v) {
    autoSpin(false);
    const [tx, ty] = VIEWS[v];
    const near = rot.ry + ((((ty - rot.ry) % 360) + 540) % 360) - 180;
    tween([[tx, near, 900]]);
    $$('[data-view]', drawer).forEach(b => b.classList.toggle('on', b.dataset.view === v));
  }
  // 進場（飛來落地 land／直接長出 sprout）後播放該類菇的開場旋轉
  function enter(kind) {
    const st = $('.dw-stage', drawer); if (!st) return;
    st.classList.remove('await'); st.classList.add(kind);
    const m = rot.m, info = MO_INFO[MOTION[m.id] || 'pop'];
    const intro = CARD.has(m.id) ? info.intro.map(([x, y, d]) => [clamp(x, -25, 25), y, d]) : info.intro;
    setTimeout(() => { if (rot.m === m && !rot.auto && !rot.drag) tween(intro); }, kind === 'land' ? 650 : 1100);
  }
  /* 3D 模型試作（2026-11-28）：A＝旋轉成形（_tools/lathe3d.py）、B＝AI 生成（TRELLIS 開源模型，_tools/hf3d/trellis.py）
     模型是 js/models/<key>.js（glb 以 data URI 內嵌，直接開檔也讀得到）；model-viewer 從 Google CDN 載入，點了才載 */
  const M3D_KIND = {
    A: { how: '旋轉成形', note: '照組員手繪側面圖繞中軸轉成立體・底面貼本專題菌褶線稿' },
    B: { how: 'AI 生成', note: '用開源模型 TRELLIS 從組員手繪圖推算出立體' },
  };
  const M3D = {};   // 菇 id → 試作 A／B（js/models/<id>.js 要存在）；B 待做：conocybe nitidum psilocybe omphalotus gymnopilus cornu mutinus chloro panaeolus pantherina virosa gyromitra（TRELLIS 額度）
  'muscaria phalloides inocybe verna leucocoprinus entoloma russula pulvero'.split(' ').forEach(k => M3D[k] = { tag: 'A', ...M3D_KIND.A });
  'phallus'.split(' ').forEach(k => M3D[k] = { tag: 'B', ...M3D_KIND.B });
  M3D.phallus.note += '・網狀菌裙是真的鏤空';
  const M3D_ORBIT = { front: '0deg 80deg 118%', side: '90deg 80deg 118%', back: '180deg 80deg 118%', top: '0deg 8deg 118%', under: '0deg 168deg 118%' };
  const loadJS = src => new Promise((ok, no) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return ok();
    const s = document.createElement('script'); s.src = src; s.dataset.src = src;
    if (src.startsWith('https')) s.type = 'module';
    s.onload = ok; s.onerror = no; document.head.appendChild(s);
  });
  async function toggle3D(btn) {
    const st = btn.closest('.dw-stage'), m = rot.m, cfg = M3D[m.id];
    if (st.classList.toggle('is-3d')) {
      autoSpin(false); cancelAnimationFrame(rot.tw);
      btn.textContent = '回到手繪轉盤';
      if (!$('.st-m3d', st)) {
        st.insertAdjacentHTML('beforeend', `<div class="st-m3d"><div class="m3d-wait">3D 模型載入中…</div><span class="m3d-label"><b>試作 ${cfg.tag}・${cfg.how}</b>${cfg.note}</span></div>`);
        try {
          await Promise.all([loadJS('https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js'), loadJS(`js/models/${m.id}.js?v=1`)]);
          const box = $('.st-m3d', st); if (!box) return;
          box.insertAdjacentHTML('afterbegin', `<model-viewer src="${window.DUGU_MODELS[m.id]}" alt="${m.name} 3D 模型（試作 ${cfg.tag}）" camera-controls auto-rotate rotation-per-second="24deg" auto-rotate-delay="2500" camera-orbit="${M3D_ORBIT.front}" interaction-prompt="none" shadow-intensity="0" exposure="${cfg.tag === 'B' ? 1.35 : 1}" environment-image="neutral" disable-zoom></model-viewer>`);
          $('model-viewer', box).addEventListener('load', () => box.classList.add('ready'), { once: true });
        } catch (err) { const w = $('.m3d-wait', st); if (w) w.textContent = '3D 模型需要網路才能載入'; }
      }
    } else {
      btn.textContent = `3D 模型・試作 ${cfg.tag}`;
    }
    $$('[data-view]', drawer).forEach(b => b.classList.remove('on'));
  }
  function turntable(m) {
    const g = (window.MUSH_GEOM || {})[m.id] || { capY: .42, capW: .82, capX: .5, ratio: .833 };
    const ratio = m.img ? g.ratio : .833;
    if (CARD.has(m.id)) {
      const layers = Array.from({ length: 7 }, (_, i) => `<div class="pl th" style="--z:${-(i + 1) * 1.6}px">${artOf(m)}</div>`).join('');
      return `<figure class="hero-m" data-drag><div class="hero-tilt"><div class="hero-rot"><div class="hero-art card" style="aspect-ratio:${ratio}"><div class="pl back">${artOf(m)}</div>${layers}<div class="pl front">${artOf(m)}</div></div></div></div><span class="hero-floor"></span></figure>`;
    }
    const N = 8;
    const planes = Array.from({ length: N }, (_, i) => `<div class="pl" style="--a:${(i * 180 / N).toFixed(1)}deg">${artOf(m)}</div>`).join('');
    const dw = g.capW;                                         // 圓盤直徑（佔圖寬）
    const left = ((g.capX - dw / 2) * 100).toFixed(1) + '%';
    const dH = dw * ratio;                                      // 圓盤直徑換算成圖高的比例
    const topY = ((g.capY * .12 - dH / 2) * 100).toFixed(1) + '%';
    const underY = ((g.capY - dH / 2) * 100).toFixed(1) + '%', udw = dw * .94;
    const bx = g.capW >= .999 ? 0 : ((g.capX - g.capW / 2) / (1 - g.capW) * 100);
    const capTop = m.img ? `<div class="cap-top" style="left:${left};top:${topY};width:${(dw * 100).toFixed(1)}%;background-image:url(${m.img});background-size:${(100 / g.capW).toFixed(1)}% ${(100 / g.capY).toFixed(1)}%;background-position:${bx.toFixed(1)}% 0"></div>`
      : `<div class="cap-top flat" style="left:${left};top:${topY};width:${(dw * 100).toFixed(1)}%;background:${m.svg ? m.svg.cap : m.color}"></div>`;
    const gillC = mix((m.svg && m.svg.stem) || '#efe7da', '#ffffff', .2);
    const under = NO_GILLS.has(m.id) && !m.gill ? '' : `<div class="cap-under${m.gill ? ' has-gill' : ''}" style="left:${((g.capX - udw / 2) * 100).toFixed(1)}%;top:${((g.capY - udw * ratio / 2) * 100).toFixed(1)}%;width:${(udw * 100).toFixed(1)}%;--g:${gillC};--gd:${mix(gillC, '#3a2a1c', .45)}${m.gill ? `;background-image:url(${m.gill})` : ''}"></div>`;
    return `<figure class="hero-m" data-drag><div class="hero-tilt"><div class="hero-rot"><div class="hero-art" style="aspect-ratio:${ratio}">${planes}${capTop}${under}</div></div></div><span class="hero-floor"></span></figure>`;
  }
  function motes(fx) {
    const r = () => Math.random();
    return Array.from({ length: fx === 'flies' ? 7 : 20 }, (_, i) => `<i style="left:${(r() * 100).toFixed(0)}%;top:${(r() * 100).toFixed(0)}%;--d:${(fx === 'flies' ? 1.6 + r() * 1.4 : 3 + r() * 5).toFixed(1)}s;--dl:-${(r() * 8).toFixed(1)}s;--s:${(2 + r() * 4).toFixed(1)}px;--o:${(i * 360 / 7).toFixed(0)}deg"></i>`).join('');
  }
  function renderDrawer(m) {
    const st = STAGES[m.stage - 1], idx = ORDER.indexOf(m);
    const prev = ORDER[(idx - 1 + ORDER.length) % ORDER.length], next = ORDER[(idx + 1) % ORDER.length];
    const safe = m.tox === 0, mo = MOTION[m.id] || 'pop', info = MO_INFO[mo];
    const pips = [1, 2, 3, 4, 5].map(i => `<i class="${i <= (safe ? 5 : m.tox) ? 'on' : ''}" style="--i:${i}"></i>`).join('');
    const stamp = m.tox >= 5 ? '<span class="st-stamp deadly">致命<small>DEADLY</small></span>' : safe ? '<span class="st-stamp safe">可食<small>EDIBLE・對照</small></span>' : '';
    let n = 0; const seq = () => `style="--i:${n++}"`;
    autoSpin(false); cancelAnimationFrame(rot.tw);
    rot.rx = 0; rot.ry = 0; rot.m = m;
    drawer.style.setProperty('--c', m.color);
    drawer.innerHTML = `<div class="dw-top"><span>讀菇山行 ／ The Poisonous Trail　·　${idx < 0 ? '相似可食・對照' : 'No.' + String(idx + 1).padStart(2, '0')}</span><button class="x" data-close aria-label="關閉">×</button></div>
      <div class="dw-scroll">
        <div class="dw-stage mo-${mo}${m.glow ? ' glows' : ''}${m.tox >= 5 ? ' deadly' : ''}">
          <div class="st-rays"></div><div class="st-rings"><i></i><i></i><i></i></div><div class="st-halo"></div>
          <div class="st-motes fx-${info.fx}">${motes(info.fx)}</div>
          <span class="st-tag tl">${fmt(st.from)}–${fmt(st.to)} m</span>
          <span class="st-tag tr">${st.name}</span>
          <span class="dw-badge${m.verified ? ' ok' : ''}">${m.verified ? '書頁資料' : '示意資料・待校正'}</span>
          ${stamp}
          ${turntable(m)}
          <div class="st-sheen"></div>
          <div class="st-switches">${m.plate ? `<button class="st-switch" data-plate="${m.plate}" data-plate-name="${m.name}">書頁圖解 P.${m.book.page}</button>` : ''}${m.card ? `<button class="st-switch" data-plate="${m.card}" data-plate-name="${m.name}" data-plate-kind="壓克力攜帶小卡">壓克力小卡</button>` : ''}${M3D[m.id] ? `<button class="st-switch m3d-btn" data-m3d>3D 模型・試作 ${M3D[m.id].tag}</button>` : ''}</div>
        </div>
        <div class="st-views" role="toolbar" aria-label="旋轉檢視">
          <button data-spin title="自動旋轉">⟳ 360°</button>
          <button data-view="front" class="on">正面</button><button data-view="side">側面</button><button data-view="back">背面</button>${CARD.has(m.id) ? '' : `<button data-view="top">俯視</button><button data-view="under">${m.gillKind || (NO_GILLS.has(m.id) ? '底部' : '菌褶')}</button>`}
          <span class="st-hint">拖曳旋轉 · ${info.label}</span>
        </div>
        <div class="dw-body">
          <h2 class="dw-name${safe ? ' safe' : ''}" id="dwName" ${seq()}>${[...m.name].map((ch, i) => `<span style="--k:${i}">${ch}</span>`).join('')}</h2>
          <div class="dw-sci" ${seq()}>${m.sci}${m.alias ? `<span class="dw-alias">又名 ${m.alias}</span>` : ''}</div>
          <div class="dw-fam" ${seq()}><span>${m.fam}</span><span class="dw-tox">${safe ? '可食・對照' : '毒性'} <span class="tox big${safe ? ' safe' : ''}">${pips}</span> ${safe ? '' : m.type}</span></div>
          <div class="dw-facts" ${seq()}>
            <div><small>海拔</small><b>${fmt(st.from)}–${fmt(st.to)} m</b></div>
            <div><small>生態層</small><b>${st.name}</b></div>
            <div><small>季節</small><b>${m.season}</b></div>
          </div>
          <div class="dw-sec" ${seq()}><h3>外觀</h3><p>${m.look}</p></div>
          ${m.gill ? `<div class="dw-sec dw-gill" ${seq()}><h3>${m.gillKind || '菌褶'}線稿</h3><figure class="gill-fig"><img src="${m.gill.replace('.webp', '-light.webp')}" alt="${m.name}的${m.gillKind || '菌褶'}線稿" draggable="false"></figure><p class="gill-cap">本專題手繪・從菌傘下方往上看的${m.gillKind || '菌褶'}紋理${m.gillKind === '菌孔' ? '（牛肝菌類是一個個小孔，不是褶片）' : ''}　${CARD.has(m.id) ? '' : '<button class="gill-3d" data-view="under">在展示台上翻過來看 ↻</button>'}</p></div>` : ''}
          <div class="dw-sec" ${seq()}><h3>生長環境</h3><p>${m.habitat}</p></div>
          ${m.book ? `<div class="dw-sec dw-book" ${seq()}><h3>書頁解說<small>讀菇山行 ・ P.${m.book.page}</small></h3><p class="bk-lead">慢慢看，從菌傘到菌柄。</p><div class="bk-parts">${m.book.parts.map(([k, t]) => `<div><b>${k}</b><span>${t}</span></div>`).join('')}</div><button class="bk-open" data-plate="${m.plate}" data-plate-name="${m.name}">看整頁書頁 ↗</button></div>` : ''}
          <div class="dw-sec" ${seq()}><h3>${safe ? '注意' : '中毒症狀'}</h3><p>${m.symptom}</p></div>
          ${homes(m).length ? `<div class="dw-sec" ${seq()}><h3>牠的家</h3><div class="eco-rel">${homes(m).map(([k, e]) => `<button data-eco="${k}" style="--c:${CAT_C[CAT[e.tag]]}"><span class="lk eco-ic">${e.tag[0]}</span><span><b>${e.name}</b><em>${e.tag}・點我去看看</em></span></button>`).join('')}</div></div>` : ''}
          ${m.book ? `<div class="dw-sec" ${seq()}><h3>慢慢看，菇菇相似卻不同</h3><div class="bk-like">${m.book.like.map(([n, t]) => { const o = byName(n); return o ? `<button data-open="${o.id}" style="--c:${o.color}"><span class="lk">${artOf(o)}</span><span><b>${n}</b><em>${t}</em></span></button>` : `<div><span class="lk bk-dot"></span><span><b>${n}</b><em>${t}</em></span></div>`; }).join('')}</div></div>` : ''}
          ${!m.book && m.like && m.like.length ? `<div class="dw-sec" ${seq()}><h3>慢慢看，菇菇相似卻不同</h3><div class="dw-like">${m.like.map(k => MUSH[k]).filter(Boolean).map(o => `<button data-open="${o.id}" style="--c:${o.color}"><span class="lk">${artOf(o)}</span>${o.name}</button>`).join('')}</div></div>` : ''}
          <div class="dw-warn" ${seq()}><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L30 28 H2Z" fill="none" stroke="#e8336f" stroke-width="2" stroke-linejoin="round"/><path d="M16 12v8" stroke="#e8336f" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="24" r="1.6" fill="#e8336f"/></svg>
            <span>誤食可能會造成嚴重中毒，若有誤食，請立即就醫。<br>只觀察，不採食，外觀圖解不能作為食用判斷依據。</span></div>
        </div>
      </div>
      <div class="dw-nav"><button data-open="${prev.id}"><span class="lk">${artOf(prev)}</span><span><small>← 上一種</small>${prev.name}</span></button><button data-open="${next.id}"><span><small>下一種 →</small>${next.name}</span><span class="lk">${artOf(next)}</span></button></div>`;
    rot.el = $('.hero-rot', drawer); setRot();
  }
  const byName = n => Object.values(MUSH).find(o => o.name === n || o.alias === n);
  // 書本排版整頁檢視（點書頁圖解）
  const bookLb = $('#bookLb');
  function openBook(src, name, kind) {
    $('img', bookLb).src = src; $('img', bookLb).alt = `${name} ${kind || '書頁圖解'}`;
    $('.bl-cap', bookLb).textContent = `${name} ・ ${kind || '讀菇山行 書本排版'}（本專題組員手繪）`;
    bookLb.hidden = false; requestAnimationFrame(() => bookLb.classList.add('on'));
  }
  const closeBook = () => { bookLb.classList.remove('on'); setTimeout(() => { if (!bookLb.classList.contains('on')) bookLb.hidden = true; }, 350); };
  bookLb.addEventListener('click', e => { if (e.target === bookLb || e.target.closest('[data-close-book]')) closeBook(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !bookLb.hidden) { e.stopImmediatePropagation(); closeBook(); } }, true);
  // 展示台：滑鼠傾斜、拖曳旋轉、視角按鈕、切換書頁圖解
  drawer.addEventListener('pointermove', e => {
    const st = e.target.closest('.dw-stage'); if (!st || reduce || st.classList.contains('is-3d')) return;
    if (rot.drag) {
      const d = rot.drag;
      rot.ry = d.ry + (e.clientX - d.x) * .6;
      rot.rx = clamp(d.rx - (e.clientY - d.y) * .45, -80, 80);
      setRot(); return;
    }
    const r = st.getBoundingClientRect();
    st.style.setProperty('--rx', (((e.clientY - r.top) / r.height - .5) * -10).toFixed(2) + 'deg');
    st.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg');
  });
  drawer.addEventListener('pointerdown', e => {
    const f = e.target.closest('.dw-stage'); if (!f || e.target.closest('button') || f.classList.contains('is-3d')) return;
    autoSpin(false); cancelAnimationFrame(rot.tw);
    rot.drag = { x: e.clientX, y: e.clientY, rx: rot.rx, ry: rot.ry };
    f.classList.add('dragging'); f.setPointerCapture(e.pointerId);
    $$('[data-view]', drawer).forEach(b => b.classList.remove('on'));
  });
  const endDrag = e => {
    if (!rot.drag) return;
    rot.drag = null;
    const f = $('.dw-stage', drawer); if (f) f.classList.remove('dragging');
  };
  drawer.addEventListener('pointerup', endDrag);
  drawer.addEventListener('pointercancel', endDrag);
  drawer.addEventListener('pointerleave', () => { const st = $('.dw-stage', drawer); if (st) { st.style.setProperty('--rx', '0deg'); st.style.setProperty('--ry', '0deg'); } });
  drawer.addEventListener('click', e => {
    if (e.target.closest('[data-m3d]')) { toggle3D(e.target.closest('[data-m3d]')); return; }
    const mv = $('.dw-stage.is-3d model-viewer', drawer);
    if (mv && e.target.closest('[data-view], [data-spin]')) {      // 3D 模式：視角鈕／旋轉鈕改控制模型
      const v3 = e.target.closest('[data-view]');
      if (v3) { if (v3.classList.contains('gill-3d')) $('.dw-scroll', drawer).scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); mv.autoRotate = false; mv.cameraOrbit = M3D_ORBIT[v3.dataset.view]; $$('[data-view]', drawer).forEach(b => b.classList.toggle('on', b.dataset.view === v3.dataset.view)); $('[data-spin]', drawer).classList.remove('on'); }
      else { mv.autoRotate = !mv.autoRotate; $('[data-spin]', drawer).classList.toggle('on', mv.autoRotate); }
      return;
    }
    const v = e.target.closest('[data-view]');
    if (v) { if (v.classList.contains('gill-3d')) $('.dw-scroll', drawer).scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); setView(v.dataset.view); return; }
    if (e.target.closest('[data-spin]')) { autoSpin(!rot.auto); $$('[data-view]', drawer).forEach(b => b.classList.remove('on')); return; }
    const b = e.target.closest('[data-plate]'); if (!b) return;
    openBook(b.dataset.plate, b.dataset.plateName, b.dataset.plateKind);
  });

  // 菇的「家」：哪些場景點跟牠有關（只列畫面上真的有的點）
  const homes = m => Object.entries(ECO).filter(([k, e]) => (e.rel || []).includes(m.id) && $(`[data-e="${k}"]`));

  /* ---------- 場景篩選：全部／菇／植物／動物／地景 ---------- */
  let filterOn = 'all';
  function setFilter(f) {
    filterOn = filterOn === f && f !== 'all' ? 'all' : f;
    document.body.dataset.filter = filterOn;
    $$('button[data-filter]').forEach(b => b.classList.toggle('on', b.dataset.filter === filterOn));
    if (filterOn !== 'all') {
      const n = $$(`[data-cat="${filterOn}"]`).filter(el => !el.getAttribute('aria-hidden')).length;
      toast(`顯示 <b>${{ mush: '菇類', plant: '植物', animal: '動物', land: '地景' }[filterOn]}</b>　全山共 ${n} 個點`);
    }
  }

  /* ---------- 8. 圖鑑、收集 ---------- */
  const dex = $('#dex');
  let dexOpen = false;
  function updateCount() { $('#foundCount').textContent = `${found.size}/${ORDER.length}`; }
  function renderDex() {
    $('#dexGrid').innerHTML = ORDER.map(m => {
      const st = STAGES[m.stage - 1], got = found.has(m.id);
      return `<button class="dcard${got ? '' : ' locked'}" data-open="${m.id}" style="--c:${m.color}">
        <div class="th">${thumb(m)}${m.gill ? `<img class="th-gill" src="${m.gill.replace('.webp', '-light.webp')}" alt="">` : ''}</div>
        <b>${got ? m.name : '？？？'}</b><em>${got ? m.sci : '尚未發現'}</em>
        <div class="meta"><span>${fmt(st.from)} m・${st.name}</span>${toxHTML(m)}</div></button>`;
    }).join('');
  }
  function openDex() { renderDex(); dex.hidden = false; dexOpen = true; requestAnimationFrame(() => dex.classList.add('on')); }
  function closeDex() { dex.classList.remove('on'); dexOpen = false; setTimeout(() => { if (!dexOpen) dex.hidden = true; }, 400); }
  function renderSummit() {
    const got = ORDER.filter(m => found.has(m.id));
    $('#sumFound').textContent = got.length;
    $('#summitDex').innerHTML = got.length ? got.map(m => `<button data-open="${m.id}" style="--c:${m.color}"><i></i>${m.name}</button>`).join('') : '<span class="none">還沒有點開任何菇——回到山腳再走一次吧。</span>';
  }
  let toastTimer;
  function toast(html) { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2400); }

  /* ---------- 9. 事件 ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    const hs = t.closest('[data-m]');
    if (hs && (hs.classList.contains('hs') || hs.classList.contains('sp'))) { openMush(hs.dataset.m, { el: hs }); return; }
    const eco = t.closest('[data-e]');
    if (eco) { openEco(eco.dataset.e, eco); return; }
    const ecoLink = t.closest('[data-eco]');
    if (ecoLink) { openEco(ecoLink.dataset.eco); return; }
    const flt = t.closest('button[data-filter]');   // body 也有 data-filter，只認按鈕
    if (flt) { setFilter(flt.dataset.filter); return; }
    const op = t.closest('[data-open]');
    if (op) { if (dexOpen) closeDex(); openMush(op.dataset.open); return; }
    const go = t.closest('[data-go]');
    if (go) { e.preventDefault(); if (drawerOpen) closeMush(); goStage(+go.dataset.go); return; }
    if (t.closest('[data-close]') || t === scrim) { closeMush(); return; }
    if (t.closest('[data-open-dex]') || t.closest('#btnDex')) { openDex(); return; }
    if (t.closest('[data-close-dex]') || t === dex) { closeDex(); return; }
    if (t.closest('#btnHint')) { document.body.classList.add('hinting'); setTimeout(() => document.body.classList.remove('hinting'), 2600); }
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (dexOpen) closeDex(); else if (drawerOpen) closeMush(); return; }
    if (drawerOpen || dexOpen || /input|textarea/i.test(e.target.tagName)) return;
    const map = { ArrowUp: 1, PageUp: 1, ArrowDown: -1, PageDown: -1, ' ': 1 };
    if (map[e.key]) { e.preventDefault(); step(map[e.key]); }
    if (e.key === 'Home') { e.preventDefault(); goStage(0); }
    if (e.key === 'End') { e.preventDefault(); goStage(N + 1); }
  });

  /* ---------- 10. 氣候粒子 ---------- */
  const fx = (function () {
    const cv = $('#fx'), ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, parts = [], level = {}, last = performance.now(), run = !reduce;
    const CFG = {
      leaves: { max: 34, life: 9 }, pollen: { max: 50, life: 5 }, spores: { max: 60, life: 6 }, rain: { max: 150, life: 1.2 },
      fireflies: { max: 34, life: 7 }, snow: { max: 260, life: 12 }, wind: { max: 16, life: 1.4 }
    };
    const LEAF = ['#c8743a', '#d9a441', '#8a9a32', '#b5532e', '#e0b25a'];
    function resize() { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function set(a) {
      if (a < 0) { level = { spores: .5 }; return; }
      const A = clamp(a, 0, TOP);
      Object.keys(CFG).forEach(k => (level[k] = weight(A, s => s.weather.includes(k))));
      level.snow = Math.max(level.snow, clamp((A - 2300) / 600, 0, 1));
      if (a > TOP) level.snow = 1.2;
      level.fireflies = weight(A, s => s.night) * 1.2;
    }
    function spawn(k) {
      const p = { k, age: 0, life: CFG[k].life * (.7 + Math.random() * .6) };
      switch (k) {
        case 'leaves': Object.assign(p, { x: Math.random() * W * 1.2 - W * .1, y: -20, vx: 20 + Math.random() * 50, vy: 40 + Math.random() * 50, r: 5 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - .5) * 4, c: LEAF[Math.random() * LEAF.length | 0] }); break;
        case 'pollen': Object.assign(p, { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .3) * 20, vy: (Math.random() - .5) * 12, r: 1 + Math.random() * 1.6 }); break;
        case 'spores': Object.assign(p, { x: Math.random() * W, y: H * (.3 + Math.random() * .8), vx: (Math.random() - .5) * 10, vy: -8 - Math.random() * 18, r: .8 + Math.random() * 1.6 }); break;
        case 'rain': Object.assign(p, { x: Math.random() * W * 1.2, y: -30, vx: -90, vy: 700 + Math.random() * 300, r: 12 + Math.random() * 12 }); break;
        case 'fireflies': Object.assign(p, { x: Math.random() * W, y: H * (.35 + Math.random() * .6), vx: 0, vy: 0, r: 1.6 + Math.random() * 1.4, ph: Math.random() * 6 }); break;
        case 'snow': Object.assign(p, { x: Math.random() * W * 1.2 - W * .1, y: -10, vx: -10 + Math.random() * 20, vy: 28 + Math.random() * 52, r: .8 + Math.random() * 2.8, ph: Math.random() * 6 }); break;
        case 'wind': Object.assign(p, { x: -220, y: Math.random() * H, vx: 700 + Math.random() * 400, vy: 0, r: 80 + Math.random() * 140 }); break;
      }
      parts.push(p);
    }
    const count = {};
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      Object.keys(CFG).forEach(k => (count[k] = 0));
      parts.forEach(p => count[p.k]++);
      Object.keys(CFG).forEach(k => {
        const target = (level[k] || 0) * CFG[k].max * (W < 700 ? .55 : 1);
        if (count[k] < target) { let n = (target / CFG[k].life) * dt * 1.6; while (n > 0) { if (Math.random() < n) spawn(k); n--; } }
      });
      const shift = -scrollDY * .35; scrollDY = 0;
      parts = parts.filter(p => {
        p.age += dt;
        if (p.k === 'fireflies') { p.vx += (Math.random() - .5) * 40 * dt; p.vy += (Math.random() - .5) * 40 * dt; p.vx *= .98; p.vy *= .98; }
        p.x += (p.vx + (p.k === 'snow' ? Math.sin(p.age * 1.4 + p.ph) * 18 : 0)) * dt;
        p.y += p.vy * dt + shift * (p.k === 'rain' || p.k === 'wind' ? .3 : 1);
        if (p.rot !== undefined) p.rot += p.vr * dt;
        const fade = Math.min(1, p.age * 2, (p.life - p.age) * 1.5);
        if (fade <= 0 || p.y > H + 40 || p.y < -80 || p.x > W + 260) return false;
        ctx.globalAlpha = fade;
        switch (p.k) {
          case 'leaves': ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.age * 3)) * .7 + .3); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .5, 0, 0, 7); ctx.fill(); ctx.restore(); break;
          case 'pollen': ctx.fillStyle = 'rgba(255,226,140,.8)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); break;
          case 'spores': ctx.fillStyle = 'rgba(255,248,226,.75)'; ctx.shadowColor = '#fff2c9'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0; break;
          case 'rain': ctx.strokeStyle = 'rgba(214,230,240,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * .02, p.y - p.r); ctx.stroke(); break;
          case 'fireflies': { const b = .5 + .5 * Math.sin(p.age * 3 + p.ph); ctx.globalAlpha = fade * b; ctx.fillStyle = '#c6ff9e'; ctx.shadowColor = '#8dffb0'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0; break; }
          case 'snow': ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); break;
          case 'wind': { const g = ctx.createLinearGradient(p.x, 0, p.x + p.r, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.6, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x + p.r / 2, p.y - 6, p.x + p.r, p.y); ctx.stroke(); break; }
        }
        return true;
      });
      ctx.globalAlpha = 1;
      if (run) requestAnimationFrame(frame);
    }
    resize(); addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { const was = run; run = !document.hidden && !reduce; if (run && !was) { last = performance.now(); requestAnimationFrame(frame); } });
    if (run) requestAnimationFrame(frame);
    return { set };
  })();

  /* ---------- 首頁主視覺：菌褶環繞＋菌絲連線＋孢子＋數字跑動 ---------- */
  const hero = (function () {
    const ground = $('#ground'), stage = $('#heroStage'), ring = $('#heroRing'), net = $('#heroNet'), cv = $('#sporeCv');
    const RING = ['chloro', 'russula', 'pantherina', 'verna', 'panaeolus', 'omphalotus', 'psilocybe', 'entoloma'];
    const BASE = [-42, -14, 14, 42, 138, 166, 194, 222];                     // 左右兩側，避開中間的文字
    let rx = 0, ry = 0, size = 90, visible = true, t0 = performance.now(), raf = 0;
    const discs = RING.filter(k => MUSH[k] && MUSH[k].gill).map((k, i) => {
      const m = MUSH[k], b = document.createElement('button');
      b.className = 'ring-disc'; b.dataset.ring = k;
      b.style.setProperty('--t', `${60 + i * 9}s`); b.style.setProperty('--dir', i % 2 ? 'reverse' : 'normal');
      b.setAttribute('aria-label', `${m.name}的菌褶線稿，點擊看說明`);
      b.innerHTML = `<img src="${m.gill.replace('.webp', '-light.webp')}" alt="" draggable="false"><span>${m.name}</span>`;
      ring.appendChild(b);
      return { b, m, base: BASE[i], i };
    });
    net.innerHTML = discs.map(() => '<g><path class="base"/><path class="flow"/></g>').join('');
    const groups = $$('g', net);
    function layout() {
      const r = $('#hero').getBoundingClientRect();
      const narrow = innerWidth < 700;
      rx = narrow ? innerWidth * .43 : Math.min(innerWidth * .4, 600);
      ry = narrow ? r.height * .4 : Math.min(r.height * .36, 330);
      size = narrow ? 46 : clamp(r.height * .11, 64, 112);
      ring.style.setProperty('--s', size + 'px');
    }
    function frame(now) {
      const t = (now - t0) / 1000;
      discs.forEach(d => {
        const a = (d.base + Math.sin(t * .18 + d.i) * 6) * Math.PI / 180, k = 1 + Math.sin(t * .35 + d.i * 2) * .025;
        const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
        d.b.style.setProperty('--x', x.toFixed(1) + 'px'); d.b.style.setProperty('--y', y.toFixed(1) + 'px');
        // 菌絲：由外往中心，略帶弧度
        const len = Math.hypot(x, y), ux = x / len, uy = y / len, ex = x - ux * size * .55, ey = y - uy * size * .55;
        const cx = ex / 2 - uy * len * .16, cy = ey / 2 + ux * len * .16;
        const dpath = `M${ex.toFixed(1)} ${ey.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} 0 0`;
        groups[d.i].children[0].setAttribute('d', dpath); groups[d.i].children[1].setAttribute('d', dpath);
      });
      spores(now);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    }
    // 孢子：從中央菌褶往上飄（預先畫好光點，不用 shadowBlur，省效能）
    const ctx = cv.getContext('2d'); let parts = [], W = 0, H = 0, dpr = 1, last = performance.now();
    const dot = document.createElement('canvas'); dot.width = dot.height = 24;
    (() => { const g = dot.getContext('2d'), gr = g.createRadialGradient(12, 12, 0, 12, 12, 12); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(.35, 'rgba(255,214,140,.55)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 24, 24); })();
    function sizeCv() { dpr = Math.min(devicePixelRatio || 1, 1.5); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spores(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (parts.length < 70 && Math.random() < .9) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * Math.min(W, H) * .32;
        parts.push({ x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r * .8, vy: -(10 + Math.random() * 26), vx: (Math.random() - .5) * 8, s: 3 + Math.random() * 7, age: 0, life: 4 + Math.random() * 5, ph: Math.random() * 6 });
      }
      ctx.clearRect(0, 0, W, H);
      parts = parts.filter(p => {
        p.age += dt; p.x += (p.vx + Math.sin(p.age * 1.3 + p.ph) * 6) * dt; p.y += p.vy * dt;
        const f = Math.min(1, p.age, (p.life - p.age) * .8);
        if (f <= 0) return false;
        ctx.globalAlpha = f * .8; ctx.drawImage(dot, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        return true;
      });
      ctx.globalAlpha = 1;
    }
    // 數字從 0 跑到目標值
    function countUp() {
      $$('[data-count]', ground).forEach((el, i) => {
        const to = +el.dataset.count, pre = el.dataset.prefix || '', t1 = performance.now() + 1500 + i * 150;
        const tick = now => {
          const k = clamp((now - t1) / 1400, 0, 1), e = 1 - Math.pow(1 - k, 3);
          el.textContent = pre + fmt(to * e);
          if (k < 1) requestAnimationFrame(tick);
        };
        el.textContent = pre + '0'; requestAnimationFrame(tick);
      });
    }
    // 滑鼠微視差
    ground.addEventListener('pointermove', e => {
      if (reduce) return;
      const mx = e.clientX / innerWidth - .5, my = e.clientY / innerHeight - .5;
      stage.style.translate = `${(-mx * 18).toFixed(1)}px ${(-my * 12).toFixed(1)}px`;
    });
    ground.addEventListener('click', e => {
      const d = e.target.closest('.ring-disc'); if (d) openMush(d.dataset.ring, { el: d });
    });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !reduce) { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(ground);
    addEventListener('resize', () => { layout(); sizeCv(); });
    function start() {
      layout(); sizeCv(); frame(performance.now());
      discs.forEach((d, i) => setTimeout(() => { d.b.classList.add('on'); groups[d.i].classList.add('on'); }, reduce ? 0 : 1300 + i * 140));
      if (!reduce) countUp();
    }
    return { start };
  })();

  /* ---------- 11. 啟動：從山腳開始 ---------- */
  window.TRAIL.go = goStage;             // 也可在主控台用 TRAIL.go(10) 跳層
  window.TRAIL.open = openMush;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  updateCount();
  function start() {
    measure();
    scrollTo(0, document.documentElement.scrollHeight);
    update();
    document.body.classList.remove('is-loading');
    hero.start();
    // 從主網站帶進來：#m=chloro 開這朵菇的說明卡；#s=5 跳到第 5 層
    const hp = new URLSearchParams(location.hash.slice(1));
    if (hp.get('m') && MUSH[hp.get('m')]) setTimeout(() => openMush(hp.get('m')), 900);
    else if (+hp.get('s')) setTimeout(() => goStage(+hp.get('s')), 900);
  }
  let rT;
  let lastW = innerWidth;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => {
    const n = cur, widthChanged = Math.abs(innerWidth - lastW) > 2; lastW = innerWidth;
    measure();
    if (widthChanged && n >= 1 && n <= N && bands[n - 1]) goStage(n, false);   // 只有寬度改變（版面重排）才回到同一層；手機網址列收合只改高度，不動
    update();
  }, 150); });
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
  if (document.fonts) document.fonts.ready.then(() => { measure(); update(); });
})();
