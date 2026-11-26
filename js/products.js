/* 讀菇 產品頁互動 */
(function () {
  const { $, $$, reveal } = window.UI, D = window.DUGU, TR = window.TRAIL, B = D.byId;

  // 開場：菇與菌褶浮在黑底上
  $('#pHeroArt').innerHTML = [
    ['g', B.muscaria.gill, 'right:-6%;top:-10%;width:46vw;max-width:640px'],
    ['m', B.muscaria.img, 'right:16%;bottom:-2%;height:62%'],
    ['m', B.inocybe.img, 'right:4%;bottom:6%;height:46%'],
    ['m', B.chloro.img, 'right:30%;bottom:4%;height:30%']
  ].map(([k, src, st], i) => `<img class="${k}" src="${src}" alt="" style="${st};--dl:-${i * 1.6}s">`).join('');

  // 燈：開關
  const stage = $('#lampStage'), sw = $('#lampSwitch');
  sw.addEventListener('click', () => { const off = stage.classList.toggle('off'); sw.setAttribute('aria-pressed', !off); $('span', sw).textContent = off ? '關燈中' : '開燈中'; });
  // 4 款燈：汙白絲蓋傘（有渲染與打樣）、毒蠅鵝膏菌（製作中）、另外兩款待公布
  const LAMPS = [
    { tag: '渲染＋打樣', cls: '', name: '汙白絲蓋傘燈', no: 'No.1', html: `<img class="photo" src="img/prod/lamp-proto.webp" alt="汙白絲蓋傘燈 打樣實拍">`, lb: ['img/prod/lamp-proto.webp', '汙白絲蓋傘燈 ・ 打樣實拍'] },
    { tag: '製作中', cls: 'wip', name: '毒蠅鵝膏菌燈', no: 'No.2', html: `<img class="gill" src="${B.muscaria.gill.replace('.webp', '-light.webp')}" alt=""><img class="mush" src="${B.muscaria.img}" alt="毒蠅鵝膏菌">`, mush: 'muscaria' },
    { tag: '即將公開', cls: 'soon', name: '第三款', no: 'No.3', html: '<span class="q">?</span>' },
    { tag: '即將公開', cls: 'soon', name: '第四款', no: 'No.4', html: '<span class="q">?</span>' }
  ];
  $('#lampRow').innerHTML = LAMPS.map((l, i) => `<button class="lc rv" style="--rd:${i * .08}s" ${l.lb ? `data-lb="${l.lb[0]}" data-cap="${l.lb[1]}"` : l.mush ? `data-mush="${l.mush}"` : 'disabled'}>
    <span class="lc-tag ${l.cls}">${l.tag}</span><div class="lc-art">${l.html}</div><div class="lc-txt"><small>LAMP ${l.no}</small><b>${l.name}</b></div></button>`).join('');

  // 杯墊：主圖切換
  const SHOTS = [['img/prod/coaster-chloro.webp', '綠褶菇杯墊 ・ 渲染圖'], ['img/prod/coaster-chloro-2.webp', '綠褶菇杯墊 ・ 渲染圖（側光）'],
    ['img/prod/coaster-chloro-3.webp', '綠褶菇杯墊 ・ 渲染圖（斜放）'], ['img/prod/coaster-photo.webp', '綠褶菇杯墊 ・ 雷雕打樣實拍']];
  $('#coThumbs').innerHTML = SHOTS.map(([s, c], i) => `<button class="${i ? '' : 'on'}" data-i="${i}" aria-label="${c}"><img src="${s}" alt=""></button>`).join('');
  $('#coThumbs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#coThumbs button').forEach(x => x.classList.toggle('on', x === b));
    const [s, c] = SHOTS[+b.dataset.i], img = $('#coMain');
    img.style.opacity = 0; setTimeout(() => { img.src = s; $('#coCap').textContent = c; img.style.opacity = 1; }, 200);
  });
  // 10 款菌褶
  const CO = ['chloro', 'muscaria', 'inocybe', 'russula', 'omphalotus', 'pantherina', 'phallus', 'panaeolus', 'entoloma', 'psilocybe'];
  $('#coList').innerHTML = CO.map((id, i) => { const m = B[id];
    return `<button class="co rv" data-mush="${id}" style="--rd:${(i % 5) * .06}s"><div class="co-disc"><img class="dk" src="${m.gill}" alt=""><img class="lt" src="${m.gill.replace('.webp', '-light.webp')}" alt=""></div><b>${m.name}</b><small>${D.TYPES[m.type].name}</small></button>`; }).join('');
  $$('.seg button').forEach(b => b.addEventListener('click', () => {
    $$('.seg button').forEach(x => x.classList.toggle('on', x === b));
    $('#coList').classList.toggle('acrylic', b.dataset.look === 'acrylic');
  }));

  // 小卡：篩選＋傾斜
  const cards = D.M.filter(m => m.card).sort((a, b) => a.card.localeCompare(b.card));
  $('#chips').innerHTML = `<button class="on" data-f="all">全部 ${cards.length}</button>` + ['gi', 'ne', 'li'].map(k => `<button data-f="${k}" style="--c:${D.TYPES[k].color}"><i></i>${D.TYPES[k].name} ${cards.filter(m => m.type === k).length}</button>`).join('');
  $('#cardGrid').innerHTML = cards.map((m, i) => `<button class="ac rv" data-mush="${m.id}" data-t="${m.type}" style="--rd:${(i % 6) * .05}s" aria-label="${m.name} 小卡"><img src="${m.card}" alt="${m.name} 壓克力攜帶小卡" loading="lazy"></button>`).join('');
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#chips button').forEach(x => x.classList.toggle('on', x === b));
    $$('.ac').forEach(c => c.classList.toggle('hide', b.dataset.f !== 'all' && c.dataset.t !== b.dataset.f));
  });
  $('#cardGrid').addEventListener('pointermove', e => {
    const c = e.target.closest('.ac'); if (!c || e.pointerType !== 'mouse') return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateZ(10px)`; c.style.setProperty('--gx', `${(x + .5) * 100}%`);
  });
  $('#cardGrid').addEventListener('pointerout', e => { const c = e.target.closest('.ac'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });

  // 卷軸縮圖
  const segs = TR.ART.slice().sort((a, b) => b.stages[0] - a.stages[0]);
  $('#gcScroll').innerHTML = `<div>${segs.map((a, i) => `<img src="dugu-trail/${a.src}" alt="" loading="lazy" style="margin-top:${i && a.blend ? -(a.blend * a.h / a.w * 100).toFixed(2) : 0}%;position:relative;z-index:${i}">`).join('')}</div>`;

  $('#footGrass').innerHTML = Array.from({ length: 14 }, (_, i) => `<img src="img/scene/${i % 3 ? 'grass-blob' : 'grass-a'}.webp" alt="">`).join('');
  reveal();
})();
