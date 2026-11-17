/* =========================================================
   讀菇山行 － 向量繪圖
   沒有插畫的層，用這裡產生示意背景、樹幹與菇（之後換成插畫就不會用到）
   ========================================================= */
window.ART = (function () {
  let uid = 0;
  const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, '0')).join('');
  const shade = (c, t) => (t > 0 ? mix(c, '#ffffff', t) : mix(c, '#1a120c', -t));

  /* ---------- 菇（viewBox 0 0 100 120，底部中心 = 50,118） ---------- */
  function mushSVG(s) {
    const id = 'm' + (++uid), cap = s.cap, stem = s.stem || '#efe7da';
    const defs = `<defs>
      <radialGradient id="${id}c" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="${shade(cap, .35)}"/><stop offset=".55" stop-color="${cap}"/><stop offset="1" stop-color="${shade(cap, -.35)}"/></radialGradient>
      <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="${shade(stem, -.18)}"/><stop offset=".45" stop-color="${shade(stem, .25)}"/><stop offset="1" stop-color="${shade(stem, -.28)}"/></linearGradient>
    </defs>`;
    const shadow = `<ellipse cx="50" cy="117" rx="26" ry="3.5" fill="#1a120c" opacity=".28"/>`;
    let g = '';
    const spots = (cx, cy, rx, ry, n, col, seed) => {
      const r = rng(seed); let o = '';
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI, d = Math.sqrt(r());
        const x = cx + Math.cos(a) * rx * d * (r() > .5 ? 1 : -1), y = cy - Math.sin(a) * ry * d * .9;
        o += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(1.4 + r() * 2).toFixed(1)}" ry="${(1 + r() * 1.3).toFixed(1)}" fill="${col}" opacity=".95"/>`;
      }
      return o;
    };
    switch (s.kind) {
      case 'amanita':
        g = `<path d="M44 58 C43 80 42 98 40 108 C46 113 56 113 60 108 C58 98 57 80 56 58Z" fill="url(#${id}s)"/>
          ${s.volva ? `<path d="M36 108 C36 100 42 98 50 98 C58 98 64 100 64 108 C64 116 36 116 36 108Z" fill="${shade(stem, -.08)}" stroke="${shade(stem, -.3)}" stroke-width=".8"/>` : `<ellipse cx="50" cy="109" rx="12" ry="7" fill="${shade(stem, -.05)}"/>`}
          <path d="M41 66 C44 72 56 72 59 66 L62 74 C56 78 44 78 38 74Z" fill="${shade(stem, .1)}" stroke="${shade(stem, -.25)}" stroke-width=".7"/>
          <path d="M12 58 C12 28 30 14 50 14 C70 14 88 28 88 58 C76 63 24 63 12 58Z" fill="url(#${id}c)"/>
          <path d="M14 58 C30 64 70 64 86 58" stroke="${shade(cap, -.45)}" stroke-width="1.4" fill="none" opacity=".6"/>
          ${s.spot ? spots(50, 50, 32, 34, 22, s.spot, 7) : ''}`;
        break;
      case 'parasol':
        g = `<path d="M47 50 C46 76 45 98 43 112 C47 115 53 115 57 112 C55 98 54 76 53 50Z" fill="url(#${id}s)"/>
          <ellipse cx="50" cy="112" rx="9" ry="4" fill="${shade(stem, -.1)}"/>
          <path d="M42 70 C46 73 54 73 58 70 L59 75 C53 78 47 78 41 75Z" fill="${shade(stem, .15)}"/>
          <path d="M${s.small ? 22 : 8} 54 C${s.small ? 22 : 8} 30 28 18 50 18 C72 18 ${s.small ? 78 : 92} 30 ${s.small ? 78 : 92} 54 C74 60 26 60 ${s.small ? 22 : 8} 54Z" fill="url(#${id}c)"/>
          <ellipse cx="50" cy="24" rx="9" ry="5" fill="${s.spot}" opacity=".85"/>
          ${spots(50, 50, s.small ? 24 : 36, 26, s.small ? 14 : 26, s.spot, 3)}`;
        break;
      case 'bell':
        g = `<path d="M48 44 C47 70 45 96 42 114 C46 116 52 116 55 114 C54 96 53 70 52 44Z" fill="url(#${id}s)"/>
          <path d="M26 50 C26 30 36 12 50 12 C64 12 74 30 74 50 C64 55 36 55 26 50Z" fill="url(#${id}c)"/>
          <path d="M30 50 L34 54 L38 51 L42 55 L46 52 L50 55 L54 52 L58 55 L62 51 L66 54 L70 50" stroke="${shade(cap, .4)}" stroke-width="1" fill="none"/>`;
        break;
      case 'flat':
        g = `<path d="M43 52 C42 78 41 98 40 112 C46 116 54 116 60 112 C59 98 58 78 57 52Z" fill="url(#${id}s)"/>
          <path d="M10 52 C10 40 26 30 50 30 C74 30 90 40 90 52 C90 56 82 58 50 58 C18 58 10 56 10 52Z" fill="url(#${id}c)"/>
          <ellipse cx="50" cy="36" rx="18" ry="3" fill="${shade(cap, -.2)}" opacity=".5"/>
          <path d="M16 56 C30 60 70 60 84 56" stroke="${shade(stem, .2)}" stroke-width="2.5" fill="none"/>`;
        break;
      case 'stinkhorn':
        g = `<path d="M46 116 C43 90 44 60 46 28 C47 20 53 20 54 28 C56 60 57 90 54 116Z" fill="url(#${id}s)"/>
          ${Array.from({ length: 9 }, (_, i) => `<ellipse cx="50" cy="${44 + i * 8}" rx="${3.4 + i * .1}" ry="1.4" fill="${shade(stem, -.25)}" opacity=".35"/>`).join('')}
          <path d="M45.5 40 C44 26 46 10 50 8 C54 10 56 26 54.5 40 C52 43 48 43 45.5 40Z" fill="url(#${id}c)"/>
          <ellipse cx="48.5" cy="20" rx="1.4" ry="5" fill="#fff" opacity=".35"/>
          <path d="M40 116 C40 108 60 108 60 116Z" fill="#f2ece2"/>`;
        break;
      case 'cluster': {
        const r = rng(11); let o = '';
        [[30, 84, .62], [64, 78, .7], [47, 64, .86], [76, 96, .5], [22, 100, .46]].forEach(([x, y, k], i) => {
          const w = 22 * k, h = 15 * k, sx = x + (r() - .5) * 4;
          o += `<path d="M${sx - 2} ${y} C${sx - 3} ${y + 15} 48 108 50 116 L53 116 C52 108 ${sx + 4} ${y + 15} ${sx + 2} ${y}Z" fill="url(#${id}s)"/>
            <path d="M${sx - w} ${y} C${sx - w} ${y - h * 1.2} ${sx - w * .4} ${y - h * 1.6} ${sx} ${y - h * 1.6} C${sx + w * .4} ${y - h * 1.6} ${sx + w} ${y - h * 1.2} ${sx + w} ${y} C${sx + w * .5} ${y + 3} ${sx - w * .5} ${y + 3} ${sx - w} ${y}Z" fill="url(#${id}c)"/>`;
        });
        g = o; break;
      }
      case 'shelf': {
        let o = '';
        [[50, 66, 1], [28, 86, .72], [72, 84, .76]].forEach(([x, y, k]) => {
          const w = 26 * k;
          o += `<path d="M${x - 4 * k} ${y} C${x - 5 * k} ${y + 20} ${x - 3} 110 ${x - 2} 116 L${x + 3} 116 C${x + 3} 110 ${x + 5 * k} ${y + 20} ${x + 4 * k} ${y}Z" fill="url(#${id}s)"/>
            <path d="M${x - w} ${y - 12 * k} C${x - w * .6} ${y - 2 * k} ${x - 6} ${y + 3} ${x} ${y + 3} C${x + 6} ${y + 3} ${x + w * .6} ${y - 2 * k} ${x + w} ${y - 12 * k}Z" fill="${s.glow}" class="gill-glow"/>
            <path d="M${x - w} ${y - 12 * k} C${x - w * .5} ${y - 22 * k} ${x + w * .5} ${y - 22 * k} ${x + w} ${y - 12 * k} C${x + w * .6} ${y - 8 * k} ${x - w * .6} ${y - 8 * k} ${x - w} ${y - 12 * k}Z" fill="url(#${id}c)"/>`;
        });
        g = o; break;
      }
      case 'brain': {
        const r = rng(5); let o = `<path d="M42 76 C40 92 40 104 38 114 C46 118 56 118 62 114 C60 104 60 92 58 76Z" fill="url(#${id}s)"/>`;
        for (let i = 0; i < 16; i++) {
          const x = 50 + (r() - .5) * 52, y = 50 + (r() - .5) * 52, rr = 9 + r() * 7;
          o += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rr.toFixed(1)}" ry="${(rr * .7).toFixed(1)}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#${id}c)" stroke="${shade(cap, -.45)}" stroke-width=".9"/>`;
        }
        g = o; break;
      }
    }
    return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">${defs}${shadow}${g}</svg>`;
  }

  /* ---------- 示意層背景（viewBox 1000×500） ---------- */
  function vegShapes(veg, r, col, y0) {
    let o = '';
    const side = x => x < 300 || x > 720;          // 主要畫在樹幹兩側
    if (veg === 'broad' || veg === 'mixed') {
      for (let i = 0; i < 16; i++) {
        const x = r() * 1000; if (!side(x)) continue;
        const rr = 34 + r() * 46;
        o += `<circle cx="${x.toFixed(0)}" cy="${(y0 - rr * .4).toFixed(0)}" r="${rr.toFixed(0)}" fill="${shade(col, (r() - .5) * .35)}"/>`;
      }
    }
    if (veg === 'bamboo') {
      for (let i = 0; i < 26; i++) {
        const x = r() * 1000; if (!side(x)) continue;
        const h = 160 + r() * 200, c = shade(col, (r() - .5) * .3);
        o += `<path d="M${x} ${y0} q${(r() - .5) * 30} ${-h / 2} ${(r() - .5) * 40} ${-h}" stroke="${c}" stroke-width="${4 + r() * 4}" fill="none"/>`;
        for (let k = 0; k < 4; k++) o += `<path d="M${x} ${y0 - h * (k + 1) / 5} q${r() > .5 ? 22 : -22} -6 ${r() > .5 ? 40 : -40} 8" stroke="${shade(col, .15)}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      }
    }
    if (veg === 'conifer' || veg === 'mixed') {
      for (let i = 0; i < 18; i++) {
        const x = r() * 1000; if (!side(x)) continue;
        const h = 90 + r() * 150, w = h * .32, c = shade(col, -.15 + (r() - .5) * .25);
        o += `<path d="M${x} ${y0 - h} L${x + w} ${y0 - h * .35} L${x + w * .55} ${y0 - h * .38} L${x + w * 1.15} ${y0} L${x - w * 1.15} ${y0} L${x - w * .55} ${y0 - h * .38} L${x - w} ${y0 - h * .35}Z" fill="${c}"/>`;
      }
    }
    if (veg === 'grass' || veg === 'snow') {
      for (let i = 0; i < 70; i++) {
        const x = r() * 1000, h = 14 + r() * 26;
        o += `<path d="M${x} ${y0 + 4} q${(r() - .5) * 10} ${-h / 2} ${(r() - .5) * 18} ${-h}" stroke="${veg === 'snow' ? '#c9d3cf' : shade(col, (r() - .5) * .4)}" stroke-width="2.4" fill="none"/>`;
      }
    }
    return o;
  }

  function slotSVG(st, trunk) {
    const r = rng(st.n * 977 + 13), id = 's' + (++uid);
    const [skyTop, skyBot] = st.sky;
    const far = mix(skyBot, '#5b6772', .45), near = mix(skyBot, '#3d4a3a', .6);
    const vegCol = { broad: '#4d7a3b', bamboo: '#5e8a3e', mixed: '#46703f', conifer: '#2f5644', grass: '#7b9a4c', snow: '#dfe7ec' }[st.veg];
    const soil = st.n >= 20 ? '#f2f5f8' : st.n >= 19 ? '#8aa35a' : st.n >= 15 ? '#6a5a44' : '#6b4f35';
    const ridge = (base, amp, step) => {
      let d = `M0 ${base}`, pts = [];
      for (let x = 0; x <= 1000; x += step) { const y = base - r() * amp; pts.push([x, y]); d += ` L${x} ${y.toFixed(0)}`; }
      return { d: d + ' L1000 500 L0 500Z', pts };
    };
    const fr = ridge(250, 150, 90), nr = ridge(340, 90, 70);
    let caps = '';
    if (st.n >= 15) fr.pts.forEach(([x, y]) => { if (y < 160) caps += `<path d="M${x - 26} ${y + 30} L${x} ${y} L${x + 26} ${y + 30} L${x + 10} ${y + 24} L${x} ${y + 34} L${x - 12} ${y + 22}Z" fill="#f4f7fa" opacity=".9"/>`; });
    let clouds = '';
    for (let i = 0; i < 4; i++) clouds += `<ellipse cx="${(r() * 1000).toFixed(0)}" cy="${(60 + r() * 160).toFixed(0)}" rx="${(80 + r() * 120).toFixed(0)}" ry="${(16 + r() * 18).toFixed(0)}" fill="#fff" opacity="${st.night ? .08 : .55}" filter="url(#${id}b)"/>`;
    let stars = '';
    if (st.night) for (let i = 0; i < 40; i++) stars += `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * 260).toFixed(0)}" r="${(r() * 1.6 + .4).toFixed(1)}" fill="#fff" opacity="${(.4 + r() * .6).toFixed(2)}"/>`;
    const gy = 420 + r() * 20;
    let ground = `M0 ${gy}`;
    for (let x = 0; x <= 1000; x += 50) ground += ` L${x} ${(gy + (r() - .5) * 26).toFixed(0)}`;
    ground += ' L1000 500 L0 500Z';
    return `<svg viewBox="0 0 1000 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBot}"/></linearGradient>
      <filter id="${id}b"><feGaussianBlur stdDeviation="10"/></filter></defs>
      <rect width="1000" height="500" fill="url(#${id}g)"/>${stars}${clouds}
      <path d="${fr.d}" fill="${far}" opacity="${st.night ? .7 : .55}"/>${caps}
      <path d="${nr.d}" fill="${near}" opacity="${st.night ? .85 : .7}"/>
      ${vegShapes(st.veg, r, st.night ? shade(vegCol, -.5) : vegCol, gy + 8)}
      <path d="${ground}" fill="${st.night ? shade(soil, -.5) : soil}"/>
      <path d="${ground.replace(/ L1000 500 L0 500Z$/, '')}" stroke="${shade(soil, .25)}" stroke-width="3" fill="none" opacity=".6"/>
    </svg>`;
  }

  /* ---------- 樹幹（橫跨所有連續的示意層） ---------- */
  // stages：由下到上；edgeBottom / edgeTop：[左, 右]（0–1）
  function trunkSVG(stages, edgeBottom, edgeTop, ov) {
    const k = stages.length, H = 500 * k + ov * 2, id = 't' + (++uid), r = rng(k * 31 + 7);
    const ease = t => t * t * (3 - 2 * t);
    const edge = (y, side) => {
      const t = ease(Math.min(1, Math.max(0, 1 - (y - ov) / (500 * k))));
      const base = lerp(edgeBottom[side], edgeTop[side], t) * 1000;
      return base + (side ? 1 : -1) * (10 * Math.sin(y / 190 + side * 2) + 6 * Math.sin(y / 61 + side));
    };
    let L = [], R = [];
    for (let y = 0; y <= H; y += 30) { L.push([edge(y, 0), y]); R.push([edge(y, 1), y]); }
    const body = 'M' + L.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L') + ' L' + R.reverse().map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L') + 'Z';
    R.reverse();
    // 樹皮紋
    let grooves = '';
    for (let g = 0; g < 9; g++) {
      const f = .08 + g * .105 + (r() - .5) * .04, ph = r() * 10;
      let d = '';
      for (let y = 0; y <= H; y += 40) {
        const l = edge(y, 0), rr = edge(y, 1), x = lerp(l, rr, f) + 9 * Math.sin(y / 120 + ph);
        d += (y ? ' L' : 'M') + x.toFixed(1) + ' ' + y;
      }
      grooves += `<path d="${d}" stroke="#3b2414" stroke-width="${(2 + r() * 3).toFixed(1)}" opacity=".45" fill="none"/>
        <path d="${d}" stroke="#c39a6c" stroke-width="1.4" opacity=".22" fill="none" transform="translate(5 0)"/>`;
    }
    // 苔蘚、地衣、積雪
    let moss = '';
    stages.forEach((st, i) => {
      const y0 = ov + 500 * (k - 1 - i);
      const n = Math.round((st.humid - 70) / 2.2);
      for (let j = 0; j < n; j++) {
        const y = y0 + r() * 500, side = r() > .5 ? 1 : 0, l = edge(y, 0), rr = edge(y, 1);
        const x = side ? lerp(rr, l, r() * .3) : lerp(l, rr, r() * .3);
        const c = st.n >= 17 ? ['#9aa58f', '#c4c9b2', '#7f8c78'][j % 3] : ['#8a9a32', '#b3b53c', '#6c7d2c', '#a3a948'][j % 4];
        for (let q = 0; q < 5; q++) moss += `<ellipse cx="${(x + (r() - .5) * 40).toFixed(0)}" cy="${(y + (r() - .5) * 40).toFixed(0)}" rx="${(5 + r() * 9).toFixed(0)}" ry="${(3 + r() * 5).toFixed(0)}" fill="${c}" opacity="${(.45 + r() * .4).toFixed(2)}" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      }
      if (st.n >= 17) {
        for (let j = 0; j < 6; j++) {
          const y = y0 + r() * 500, l = edge(y, 0), rr = edge(y, 1), x = lerp(l, rr, r());
          moss += `<path d="M${(x - 30).toFixed(0)} ${y.toFixed(0)} q30 -${(6 + r() * 6).toFixed(0)} 60 0 q-30 6 -60 0Z" fill="#f4f7fa" opacity=".85"/>`;
        }
      }
    });
    // 枝枒
    let branches = '';
    stages.forEach((st, i) => {
      if (i % 3 !== 1 || st.veg === 'snow') return;
      const y = ov + 500 * (k - 1 - i) + 180 + r() * 120, side = i % 2;
      const x0 = edge(y, side), dir = side ? 1 : -1, len = 180 + r() * 90;
      const x1 = x0 + dir * len, y1 = y - 120 - r() * 60;
      branches += `<path d="M${x0 - dir * 20} ${y + 30} Q${x0 + dir * len * .5} ${y + 10} ${x1} ${y1} L${x1 + dir * 4} ${y1 + 12} Q${x0 + dir * len * .45} ${y + 40} ${x0 - dir * 20} ${y + 70}Z" fill="url(#${id}g)"/>`;
      const leaf = { broad: '#5b8a3c', bamboo: '#6d9a44', mixed: '#557e3e', conifer: '#2f5a45', grass: '#7a8f4a' }[st.veg];
      for (let q = 0; q < 14; q++) branches += `<circle cx="${(x1 + (r() - .5) * 120).toFixed(0)}" cy="${(y1 + (r() - .5) * 70).toFixed(0)}" r="${(16 + r() * 22).toFixed(0)}" fill="${st.night ? shade(leaf, -.5) : shade(leaf, (r() - .5) * .4)}" opacity=".95"/>`;
    });
    return `<svg viewBox="0 0 1000 ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#4a2f1c"/><stop offset=".3" stop-color="#7d5434"/><stop offset=".55" stop-color="#8a5f3a"/><stop offset="1" stop-color="#3f2717"/></linearGradient>
        <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .05" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .12  0 0 0 0 .06  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
        <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${(ov / H).toFixed(4)}" stop-color="#fff"/><stop offset="${(1 - ov / H).toFixed(4)}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="${id}m"><rect width="1000" height="${H}" fill="url(#${id}f)"/></mask>
      </defs>
      <g mask="url(#${id}m)">
        ${branches}
        <path d="${body}" fill="url(#${id}g)"/>
        <path d="${body}" fill="#000" filter="url(#${id}n)"/>
        ${grooves}${moss}
      </g>
    </svg>`;
  }

  return { mushSVG, slotSVG, trunkSVG, mix, lerp };
})();
