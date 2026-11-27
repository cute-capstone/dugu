/* 讀菇 森林聲音（2026-11-27）：用 Web Audio 即時合成，不用音檔
   － 空靈和聲：D 大調五聲音階的長音 pad，慢慢換和弦
   － 風鈴／木琴：偶爾落下一兩個高音，帶長殘響
   － 溪水：濾過的噪音，音量慢慢起伏
   － 鳥鳴：偶爾幾聲短啁啾
   預設關閉（瀏覽器規定要使用者按過才能出聲）；按右下角「聲音」開關，狀態記在 localStorage，換頁也記得 */
(function () {
  const KEY = 'dugu-sound';
  const btn = document.createElement('button');
  btn.className = 'snd'; btn.type = 'button';
  btn.innerHTML = '<span class="snd-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="snd-t">森林聲音</span>';
  document.body.appendChild(btn);

  let ctx = null, master = null, wet = null, on = false, timers = [], stopFns = [];
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const R = () => Math.random();

  function impulse(sec) {               // 長殘響：雙聲道衰減噪音
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function noise(sec) {                  // 棕噪音（較柔，像水聲）
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = (last + .02 * (R() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
    return b;
  }
  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    const rev = ctx.createConvolver(); rev.buffer = impulse(5);
    wet = ctx.createGain(); wet.gain.value = .55; wet.connect(rev); rev.connect(master);
  }
  const out = (node, dry = .5, pan = 0) => {
    const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p);
    const g = ctx.createGain(); g.gain.value = dry; p.connect(g); g.connect(master); p.connect(wet);
  };

  // 空靈和聲
  const CHORDS = [[50, 57, 64, 66], [47, 54, 62, 69], [43, 50, 59, 64], [45, 52, 61, 66], [50, 57, 62, 69]];
  let ci = 0;
  function pad() {
    const t = ctx.currentTime, ch = CHORDS[ci++ % CHORDS.length], hold = 9;
    ch.forEach((n, i) => {
      const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700 + i * 160; lp.Q.value = .3;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 / (1 + i * .25), t + 4); g.gain.setValueAtTime(.05 / (1 + i * .25), t + hold); g.gain.linearRampToValueAtTime(0, t + hold + 6);
      [0, 7].forEach((det, k) => { const o = ctx.createOscillator(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = midi(n); o.detune.value = k ? det : -det / 2;
        o.connect(lp); o.start(t); o.stop(t + hold + 6.2); });
      lp.connect(g); out(g, .45, (i - 1.5) * .35);
    });
    timers.push(setTimeout(pad, hold * 1000));
  }
  // 風鈴（五聲音階高音）
  const BELL = [74, 76, 78, 81, 83, 86, 88, 90, 93];
  function bell() {
    const t = ctx.currentTime, n = BELL[Math.floor(R() * BELL.length)], pan = R() * 1.6 - .8;
    [[1, .07], [2.76, .018], [5.4, .006]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = midi(n) * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 3.2 / m);
      o.connect(g); out(g, .35, pan); o.start(t); o.stop(t + 3.4);
    });
    if (R() < .35) timers.push(setTimeout(bell, 260 + R() * 300));     // 偶爾連兩聲
    else timers.push(setTimeout(bell, 2600 + R() * 5200));
  }
  // 溪水
  function stream() {
    const src = ctx.createBufferSource(); src.buffer = noise(6); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = .6;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 250;
    const g = ctx.createGain(); g.gain.value = .05;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = .02; lfo.connect(lg); lg.connect(g.gain); lfo.start();
    src.connect(bp); bp.connect(hp); hp.connect(g); out(g, .8, -.2); src.start();
    stopFns.push(() => { try { src.stop(); lfo.stop(); } catch (e) {} });
  }
  // 鳥鳴
  function bird() {
    const t0 = ctx.currentTime, k = 2 + Math.floor(R() * 3), base = 2600 + R() * 1400, pan = R() * 1.4 - .7;
    for (let i = 0; i < k; i++) {
      const t = t0 + i * (.11 + R() * .06), o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * (1.35 + R() * .3), t + .06); o.frequency.exponentialRampToValueAtTime(base * .9, t + .1);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + .12);
      o.connect(g); out(g, .5, pan); o.start(t); o.stop(t + .14);
    }
    timers.push(setTimeout(bird, 7000 + R() * 12000));
  }

  function start() {
    if (!ctx) build();
    ctx.resume();
    const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(.9, t + 3);
    timers.forEach(clearTimeout); timers = [];
    pad(); if (!stopFns.length) stream(); timers.push(setTimeout(bell, 2500), setTimeout(bird, 5000));
  }
  function stop() {
    timers.forEach(clearTimeout); timers = [];
    if (!ctx) return;
    const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(() => { if (!on) { stopFns.forEach(f => f()); stopFns = []; ctx.suspend(); } }, 1300);
  }
  function set(v) {
    on = v; btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on);
    btn.querySelector('.snd-t').textContent = on ? '聲音 開' : '森林聲音';
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    on ? start() : stop();
  }
  btn.addEventListener('click', () => set(!on));
  // 之前開過：等使用者第一次點畫面就自動接著播
  let want = false; try { want = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (want) { btn.classList.add('want'); const go = e => { if (e.target.closest('.snd')) return; removeEventListener('pointerdown', go, true); if (!on) set(true); }; addEventListener('pointerdown', go, true); }
  // 分頁切走時靜音
  document.addEventListener('visibilitychange', () => { if (!ctx || !on) return; document.hidden ? ctx.suspend() : ctx.resume(); });
})();
