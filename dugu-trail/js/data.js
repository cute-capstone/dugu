/* =========================================================
   讀菇山行 The Poisonous Trail － 資料檔
   ---------------------------------------------------------
   ★ 新增插畫時（共 21 層，對應書頁 01–21），只要改這個檔：
     1. 把圖放進 img/art/，在 ART 加一筆 { src, w, h, stages:[n] }
        （一張圖對一層就寫一個數字；一張圖跨多層就寫多個，由下到上）
     2. hot 裡的 x / y 是「在這張圖上」的百分比位置（y 由上往下量）
     3. 沒有插畫的層：預設跳過（插畫直接相接）；頁首「示意層」開關打開時以示意背景＋樹幹補上
   ★ STAGES 的氣候、動植物為示意；MUSH 裡有 book 的 9 種，文字取自本專題書本排版（03/書本排版/），
     其餘菇類文字為示意，待組員校正
   ========================================================= */

window.TRAIL = (function () {

  /* ---------- 插畫段落（由下到上的順序不拘，程式會排序） ---------- */
  const ART = [
    // 插畫來源：03/毒菇山行/（檔名＝書頁頁碼＝第幾層）。hot 的 x / y 為「在這張圖上」的百分比（y 由上往下）
    // blend：這張圖上緣疊進上一張的比例（0–1）。接縫由 _tools/bake_seams.py 烘進圖片透明度，數值照 _tools/seams.json 填
    { src: 'img/art/art-01.webp', w: 2400, h: 1120, stages: [1], blend: 0.2071,
      hot: [
        { m: 'mutinus', x: 30, y: 40 },
        { m: 'mutinus', x: 78, y: 30 },
        { m: 'mutinus', x: 64, y: 36, small: 1 },
        { m: 'mutinus', x: 86, y: 62, small: 1 },
        { e: 'stream', x: 50, y: 93 },
        { e: 'moss', x: 48, y: 30 },
        { e: 'rock', x: 56, y: 68 },
        { e: 'litter', x: 92, y: 18 }
      ] },
    { src: 'img/art/art-02.webp', w: 2400, h: 1123, stages: [2], blend: 0.1158,
      hot: [
        { m: 'chloro', x: 15, y: 32 },
        { m: 'chloro', x: 69, y: 22 },
        { m: 'chloro', x: 5, y: 47, small: 1 },
        { m: 'chloro', x: 93, y: 58, small: 1 },
        { e: 'shrub', x: 23, y: 66 },
        { e: 'wall', x: 90, y: 32 },
        { e: 'trunk', x: 46, y: 50 }
      ] },
    { src: 'img/art/art-03.webp', w: 2400, h: 1184, stages: [3], blend: 0.0845,
      hot: [
        { m: 'panaeolus', x: 33, y: 31 },
        { m: 'panaeolus', x: 50, y: 41 },
        { m: 'panaeolus', x: 88, y: 43 },
        { m: 'panaeolus', x: 14, y: 35, small: 1 },
        { m: 'panaeolus', x: 56, y: 73, small: 1 },
        { e: 'dung', x: 88, y: 60 },
        { e: 'dung', x: 13, y: 66 },
        { e: 'fence', x: 22, y: 22 },
        { e: 'fern', x: 72, y: 60 }
      ] },
    { src: 'img/art/art-04.webp', w: 2400, h: 1160, stages: [4], blend: 0.0776,
      hot: [
        { m: 'psilocybe', x: 16, y: 43 },
        { m: 'psilocybe', x: 88, y: 42 },
        { m: 'psilocybe', x: 68, y: 66 },
        { m: 'psilocybe', x: 18, y: 21, small: 1 },
        { m: 'psilocybe', x: 25, y: 10, small: 1 },
        { e: 'dung', x: 8, y: 62 },
        { e: 'hollow', x: 61, y: 40 },
        { e: 'stones', x: 6, y: 22 }
      ] },
    { src: 'img/art/art-05.webp', w: 2400, h: 1160, stages: [5], blend: 0.0862,
      hot: [
        { m: 'phallus', x: 74, y: 62 },
        { m: 'phallus', x: 10, y: 80 },
        { m: 'phallus', x: 20, y: 68, small: 1 },
        { m: 'phallus', x: 7, y: 34, small: 1 },
        { m: 'phallus', x: 92, y: 58, small: 1 },
        { e: 'bamboogrove', x: 88, y: 12 },
        { e: 'deadbranch', x: 16, y: 20 }
      ] },
    { src: 'img/art/art-06.webp', w: 2400, h: 1120, stages: [6], blend: 0.0893,
      trunkTop: [0.31, 0.71],          // 圖片最上緣的樹幹左右邊界（0–1），完整版示意層的樹幹接得上
      hot: [
        { m: 'leucocoprinus', x: 9, y: 30 },
        { m: 'leucocoprinus', x: 91, y: 34 },
        { m: 'leucocoprinus', x: 78, y: 54 },
        { m: 'leucocoprinus', x: 16, y: 49, small: 1 },
        { m: 'leucocoprinus', x: 28, y: 35, small: 1 },
        { e: 'brook', x: 20, y: 25 },
        { e: 'sedge', x: 16, y: 82 }
      ] },
    { src: 'img/art/art-14.webp', w: 2400, h: 984, stages: [14], blend: 0.1016,
      trunkBottom: [0.22, 0.73],       // 圖片最下緣的樹幹左右邊界
      hot: [
        { m: 'nitidum', x: 6, y: 64 },
        { m: 'nitidum', x: 16, y: 52 },
        { m: 'nitidum', x: 77, y: 62 },
        { m: 'nitidum', x: 86, y: 66, small: 1 },
        { m: 'nitidum', x: 24, y: 58, small: 1 },
        { m: 'nitidum', x: 83, y: 24, small: 1 },
        { m: 'nitidum', x: 95, y: 40, small: 1 },
        { e: 'leafbed', x: 14, y: 86 },
        { e: 'slope', x: 8, y: 22 }
      ] },
    { src: 'img/art/art-15.webp', w: 2400, h: 1016, stages: [15], blend: 0.0984,
      hot: [
        { m: 'entoloma', x: 14, y: 42 },
        { m: 'entoloma', x: 25, y: 66 },
        { m: 'entoloma', x: 87, y: 44 },
        { m: 'entoloma', x: 80, y: 64, small: 1 },
        { m: 'entoloma', x: 93, y: 74, small: 1 },
        { m: 'entoloma', x: 4, y: 14, small: 1 },
        { e: 'weasel', x: 83, y: 30 },
        { e: 'whitebloom', x: 20, y: 92 }
      ] },
    { src: 'img/art/art-16.webp', w: 2400, h: 944, stages: [16], blend: 0.1059,
      hot: [
        { m: 'verna', x: 25, y: 26 },
        { m: 'verna', x: 11, y: 52 },
        { m: 'verna', x: 80, y: 68 },
        { m: 'verna', x: 5, y: 74, small: 1 },
        { m: 'verna', x: 86, y: 85, small: 1 },
        { e: 'mixedwood', x: 86, y: 28 },
        { e: 'mossrock', x: 22, y: 82 }
      ] },
    { src: 'img/art/art-17.webp', w: 2400, h: 848, stages: [17], blend: 0.0825,
      hot: [
        { m: 'inocybe', x: 21, y: 60 },
        { m: 'inocybe', x: 83, y: 32 },
        { m: 'inocybe', x: 69, y: 52 },
        { m: 'inocybe', x: 8, y: 78, small: 1 },
        { m: 'inocybe', x: 95, y: 42, small: 1 },
        { m: 'inocybe', x: 91, y: 64, small: 1 },
        { e: 'hemlock', x: 10, y: 22 },
        { e: 'groundcover', x: 72, y: 85 }
      ] },
    { src: 'img/art/art-18.webp', w: 2400, h: 904, stages: [18], blend: 0.0996,
      hot: [
        { m: 'gyromitra', x: 77, y: 45 },
        { m: 'gyromitra', x: 6, y: 63 },
        { m: 'gyromitra', x: 21, y: 52, small: 1 },
        { m: 'gyromitra', x: 11, y: 77, small: 1 },
        { m: 'gyromitra', x: 95, y: 71, small: 1 },
        { e: 'firs', x: 88, y: 20 },
        { e: 'twigs', x: 8, y: 32 }
      ] },
    { src: 'img/art/art-19.webp', w: 2400, h: 888, stages: [19], blend: 0.1239,
      hot: [
        { m: 'muscaria', x: 14, y: 42 },
        { m: 'muscaria', x: 93, y: 37 },
        { m: 'muscaria', x: 75, y: 35, small: 1 },
        { m: 'muscaria', x: 6, y: 62, small: 1 },
        { m: 'muscaria', x: 71, y: 46, small: 1 },
        { e: 'nest', x: 63, y: 17 },
        { e: 'path', x: 26, y: 58 },
        { e: 'bamboo', x: 86, y: 70 }
      ] },
    { src: 'img/art/art-20.webp', w: 2400, h: 872, stages: [20], blend: 0.1376,
      hot: [
        { e: 'snowfirs', x: 16, y: 58 },
        { e: 'snowfirs', x: 80, y: 62 },
        { e: 'clouds', x: 86, y: 12 },
        { e: 'ridge', x: 63, y: 10 }
      ] },
    { src: 'img/art/art-21.webp', w: 2400, h: 856, stages: [21],
      hot: [
        { e: 'goose', x: 28, y: 30 },
        { e: 'goose', x: 85, y: 33 },
        { e: 'cliff', x: 7, y: 62 },
        { e: 'clouds', x: 92, y: 47 },
        { e: 'branch', x: 33, y: 70 },
        { e: 'ridge', x: 88, y: 80 }
      ] }
  ];

  /* ---------- 21 層海拔與環境（對應書頁 01–21） ---------- */
  // weather: leaves 落葉 / pollen 花粉 / spores 孢子 / rain 細雨 / mist 霧 / fireflies 螢光 / wind 強風 / snow 雪
  // veg: 示意層背景的植物剪影 broad 闊葉 / bamboo 竹 / mixed 混合 / conifer 針葉 / grass 草原 / snow 雪原
  const STAGES = [
    { n: 1, name: '溪澗岩床', en: 'Stream Bed', zone: '榕楠林帶', humid: 88, rain: 2300, weather: ['leaves', 'spores'], veg: 'broad',
      desc: '旅程從溪水開始。濕潤的岩石長滿苔蘚，腐葉堆積在樹根，是菌絲最早甦醒的地方。',
      flora: ['苔蘚', '腎蕨', '姑婆芋'], fauna: ['台灣石賓魚', '褐樹蛙', '溪蟹'], sky: ['#cfe3e0', '#93b8a8'] },
    { n: 2, name: '樹根灌叢', en: 'Root Thicket', zone: '榕楠林帶', humid: 85, rain: 2250, weather: ['leaves', 'spores'], veg: 'broad',
      desc: '樹根周圍的灌叢擋住陽光，土壤富含有機質。草地與林緣常冒出一叢叢白色大菇。',
      flora: ['月桃', '野牡丹', '芒草'], fauna: ['斯文豪氏攀蜥', '鉛色水鶇', '蚯蚓'], sky: ['#d6e6dc', '#9dbc9c'] },
    { n: 3, name: '牧場步道', en: 'Pasture Path', zone: '榕楠林帶', humid: 80, rain: 2200, weather: ['pollen', 'leaves'], veg: 'broad',
      desc: '木柵欄旁的步道與草地。動物糞便提供養分，喜歡糞堆的小型菇在這裡生長。',
      flora: ['大花咸豐草', '狗牙根', '構樹'], fauna: ['黃牛', '白頭翁', '糞金龜'], sky: ['#dceadf', '#a6c4a0'] },
    { n: 4, name: '林緣糞堆', en: 'Dung Meadow', zone: '榕楠林帶', humid: 84, rain: 2300, weather: ['pollen', 'spores'], veg: 'broad',
      desc: '牧場邊的林緣草地，牛糞堆旁冒出白色的大菇；樹洞裡塞滿松鼠藏起來的毬果。',
      flora: ['牧草', '蕨類', '野薑花'], fauna: ['黃牛', '赤腹松鼠', '糞金龜'], sky: ['#d9e8da', '#a2c29a'] },
    { n: 5, name: '竹林小徑', en: 'Bamboo Grove', zone: '榕楠林帶', humid: 82, rain: 2300, weather: ['leaves'], veg: 'bamboo',
      desc: '竹葉沙沙作響，竹林底層落葉厚、通風差，形狀奇特的鬼筆類在此現身。',
      flora: ['孟宗竹', '桂竹', '冷清草'], fauna: ['竹雞', '赤腹松鼠', '竹節蟲'], sky: ['#d7e7d6', '#9fbf92'] },
    { n: 6, name: '溪畔草叢', en: 'Creekside Grass', zone: '楠櫧林帶', humid: 86, rain: 2500, weather: ['pollen', 'spores'], veg: 'broad',
      desc: '溪水繞過大樹根部，岸邊開滿白色小花的草叢。全身檸檬黃的純黃白鬼傘一朵朵冒出來，像點亮的小燈。',
      flora: ['溪畔禾草', '白花小草', '苔蘚'], fauna: ['翠鳥', '褐樹蛙', '溪蝦'], sky: ['#d3e6dc', '#93ba9c'] },
    { n: 7, name: '溪谷霧氣', en: 'Misty Gorge', zone: '楠櫧林帶', humid: 88, rain: 2700, weather: ['mist', 'spores'], veg: 'broad',
      desc: '午後谷風帶起水氣，林間開始出現薄霧。小型環柄菇藏在落葉間，不容易被發現。',
      flora: ['山蘇', '台灣桫欏', '秋海棠'], fauna: ['台灣紫嘯鶇', '山羌', '盤古蟾蜍'], sky: ['#d5e2de', '#97b3a4'] },
    { n: 8, name: '倒木林床', en: 'Fallen Logs', zone: '楠櫧林帶', humid: 88, rain: 2800, weather: ['fireflies', 'spores'], veg: 'broad',
      desc: '倒下的樹木正被真菌分解。夜裡，朽木上的月夜茸發出淡綠螢光——美麗，但吃了會劇烈嘔吐。',
      flora: ['朽木', '冷水麻', '蕨類'], fauna: ['鍬形蟲', '螢火蟲', '馬陸'], sky: ['#2c3b44', '#1c2a2e'], night: true },
    { n: 9, name: '林道邊坡', en: 'Forest Road', zone: '楠櫧林帶', humid: 84, rain: 2900, weather: ['pollen', 'mist'], veg: 'mixed',
      desc: '林道切開山坡，陽光照進林緣。外形普通的粉褶菌常被誤認為食用菇。',
      flora: ['台灣赤楊', '山芙蓉', '五節芒'], fauna: ['五色鳥', '紅嘴黑鵯', '台灣野豬'], sky: ['#d9e4dc', '#9cb39b'] },
    { n: 10, name: '樟櫟林', en: 'Camphor & Oak', zone: '楠櫧林帶', humid: 86, rain: 3000, weather: ['mist', 'spores'], veg: 'broad',
      desc: '樟樹與殼斗科交錯，橡實落滿地。與樹根共生的鵝膏菌在秋天大量出現。',
      flora: ['樟樹', '青剛櫟', '狹葉櫟'], fauna: ['黃喉貂', '松鴉', '赤腹鶇'], sky: ['#d3dfd8', '#8ea995'] },
    { n: 11, name: '殘株林隙', en: 'Stump Clearing', zone: '櫟林帶', humid: 87, rain: 3100, weather: ['mist', 'rain'], veg: 'mixed',
      desc: '颱風吹倒的樹留下殘株與林隙，硫黃色的小菇一簇簇長在樹樁上。',
      flora: ['山枇杷', '台灣杜鵑', '玉山紫金牛'], fauna: ['冠羽畫眉', '條紋松鼠', '白耳畫眉'], sky: ['#cfd9d6', '#8aa196'] },
    { n: 12, name: '雲霧帶下緣', en: 'Cloud Line', zone: '櫟林帶', humid: 92, rain: 3300, weather: ['rain', 'mist'], veg: 'mixed',
      desc: '海拔約 1,600 公尺，雲層就在腳邊。濕度常年九成以上，紅菇類在苔蘚地上很顯眼。',
      flora: ['昆欄樹', '台灣八角', '苔蘚'], fauna: ['台灣山鷓鴣', '黃腹琉璃', '莫氏樹蛙'], sky: ['#c9d3d3', '#8c9c97'] },
    { n: 13, name: '檜木霧林', en: 'Cypress Cloud Forest', zone: '檜木霧林帶', humid: 95, rain: 3600, weather: ['mist', 'rain'], veg: 'conifer',
      desc: '霧林帶是台灣最潮濕的森林。紅檜與扁柏腳下，小小的褐色菇藏著致命的毒素。',
      flora: ['紅檜', '台灣扁柏', '松蘿'], fauna: ['帝雉', '台灣黑熊', '山椒魚'], sky: ['#c3cdcc', '#7f918b'] },
    { n: 14, name: '落葉坡地', en: 'Leaf-litter Slope', zone: '檜木霧林帶', humid: 94, rain: 3600, weather: ['mist', 'leaves'], veg: 'conifer',
      desc: '大樹旁的土坡鋪滿厚厚的落葉。藍灰色、帶著絲質光澤的光澤粉褶菌從葉堆裡探出頭，菌柄透著淡淡的粉紫。',
      flora: ['落葉層', '白花草叢', '苔蘚'], fauna: ['山羌', '盤古蟾蜍', '馬陸'], sky: ['#c5cfcf', '#83958e'] },
    { n: 15, name: '岩坡草甸', en: 'Rocky Meadow', zone: '檜木霧林帶', humid: 90, rain: 3400, weather: ['mist', 'spores'], veg: 'conifer',
      desc: '岩塊間長滿開白花的草叢，黃鼠狼沿著土坡追逐。灰白色、邊緣波浪狀的毒粉褶菌看起來很普通，最容易被誤當成可食的菇。',
      flora: ['白花草叢', '苔蘚', '岩生植物'], fauna: ['黃鼠狼', '水鹿', '酒紅朱雀'], sky: ['#c7d0cc', '#84958c'] },
    { n: 16, name: '針闊葉混合林', en: 'Mixed Forest', zone: '鐵杉雲杉林帶', humid: 88, rain: 3200, weather: ['leaves', 'mist'], veg: 'conifer',
      desc: '氣溫降到十度上下，闊葉樹變少。全身雪白的白毒鵝膏與黃色鵝膏菌，點綴在潮濕的林地上。',
      flora: ['台灣二葉松', '紅榨槭', '台灣鐵杉'], fauna: ['金翼白眉', '星鴉', '台灣小鼩'], sky: ['#cfd6d2', '#8f9b8e'] },
    { n: 17, name: '鐵杉林', en: 'Hemlock Forest', zone: '鐵杉雲杉林帶', humid: 86, rain: 2900, weather: ['wind', 'snow'], veg: 'conifer',
      desc: '冬天開始飄下零星細雪。鐘形白色的汙白絲蓋傘一朵朵冒出，赫鹿花菌也長在腐植質厚的林地邊緣。',
      flora: ['台灣鐵杉', '玉山杜鵑', '台灣藜蘆'], fauna: ['栗背林鴝', '岩鷚', '台灣黑熊'], sky: ['#cbd8e2', '#8a9eaa'] },
    { n: 18, name: '冷杉林', en: 'Fir Forest', zone: '冷杉林帶', humid: 85, rain: 2800, weather: ['snow', 'wind'], veg: 'conifer',
      desc: '海拔 2,600 公尺，冷杉林在春雪融化後，鹿花菌與羊肚菌同時出現，最容易誤採。',
      flora: ['台灣冷杉', '玉山圓柏', '高山白珠樹'], fauna: ['帝雉', '鷦鷯', '高山田鼠'], sky: ['#d3dee8', '#93a6b4'] },
    { n: 19, name: '高山草坡', en: 'Alpine Meadow', zone: '高山箭竹草原', humid: 78, rain: 2600, weather: ['wind', 'snow'], veg: 'grass',
      desc: '樹林讓位給箭竹草原與岩壁。紅白相間的毒蠅鵝膏菌，是這段山路最醒目的路標。',
      flora: ['玉山箭竹', '玉山薊', '高山沙參'], fauna: ['岩鷚', '台灣朱雀', '黃鼠狼'], sky: ['#b7d3ea', '#7ea4c4'] },
    { n: 20, name: '雪霧冷杉林', en: 'Snowy Fir Forest', zone: '冷杉林帶', humid: 80, rain: 2550, weather: ['snow', 'mist'], veg: 'conifer',
      desc: '接近森林界線，冷杉林被白雪與雲霧包圍。氣溫接近冰點，菇類大多暫時躲進雪下。',
      flora: ['台灣冷杉', '玉山圓柏', '地衣'], fauna: ['帝雉', '星鴉', '台灣黑熊'], sky: ['#d5e0ea', '#9fb3c4'] },
    { n: 21, name: '雪線稜頂', en: 'Snowy Summit', zone: '高山寒原', humid: 72, rain: 2500, weather: ['snow', 'wind'], veg: 'snow',
      desc: '海拔 3,000 公尺，大樹的枝枒伸進雲裡。冬季白雪覆蓋，菇菇與菌絲在雪下休眠，等待春天。',
      flora: ['地衣', '玉山圓柏', '雪山翻白草'], fauna: ['雁群', '岩鷚', '高山鼠耳蝠'], sky: ['#d9e6f2', '#a9c0d6'] }
  ];
  const TOP = 3000, STEP = TOP / STAGES.length;          // 21 層平分 0–3,000 m
  STAGES.forEach(s => {
    s.from = Math.round((s.n - 1) * STEP / 10) * 10; s.to = Math.round(s.n * STEP / 10) * 10;
    s.alt = (s.from + s.to) / 2;                          // 本層中心高度
    s.temp = +(23.5 - 0.6 * s.alt / 100).toFixed(1);     // 氣溫遞減率 0.6°C/100m
    s.o2 = Math.round(Math.exp(-s.alt / 8400) * 100);     // 相對海平面含氧量
  });

  /* ---------- 菇類圖鑑 ----------
     tox: 0 可食 1 不可食 2–3 胃腸／神經 4 嚴重 5 致命
     img: 去背圖（點菇時飛到右側展示）；plate: 書頁大圖；svg: 沒有去背圖時用的向量菇 */
  const MUSH = {
    mutinus: { name: '竹林蛇頭菌', sci: 'Mutinus bambusinus', fam: '蛇頭菌屬', tox: 1, type: '不可食',
      stage: 1, season: '夏–秋（梅雨後）', color: '#d9736b', img: 'img/mush/mutinus.webp', verified: true,
      look: '醒目的紅白相間棒狀。幼時為白色卵狀，成熟後伸出約 6–10 公分的菌棒；頂端為鮮紅色，覆有褐色異味黏液，菌柄則為粉白色海綿狀。',
      habitat: '喜好高溫高濕，常在夏秋梅雨或雨後，群生或單生於竹林、花園及草地中。主要依靠肥沃、濕潤且富含有機質的腐殖質土壤或枯死竹根生長。',
      symptom: '氣味強烈、不可食用，觸摸後請洗手。誤食可能造成身體不適，若有誤食，請立即就醫。',
      book: { page: '01', parts: [['菌傘', '細長舌狀或棒狀，表面具有明顯的色澤變化。'], ['菌柄基部', '白色卵狀菌托，包覆菌柄下方，質地柔軟。'], ['菌褶', '表面多孔狀。']],
        like: [['狗蛇頭菌', '酷似雄狗的生殖器或昂首的蛇頭而得名。'], ['紅鬼筆', '頭帽分離的結構與鮮豔的紅色菌柄。']] },
      like: ['phallus'] },
    chloro: { name: '綠褶菇', alias: '大青褶傘', sci: 'Chlorophyllum molybdites', fam: '青褶傘屬', tox: 3, type: '胃腸型',
      stage: 2, season: '春–秋（大雨後）', color: '#e9dcc6', img: 'img/mush/chloro.webp', verified: true,
      look: '菌蓋平緩、佈滿褐色鱗片，成熟時菌褶會變成灰綠色，且菌柄上有菌環。',
      habitat: '有毒的綠褶菇是地表腐生菌，常見於都市公園、分隔島草皮及一般農地，大雨後常在草地上長成一整圈的「仙女環」。',
      symptom: '食後 1–3 小時劇烈嘔吐、腹瀉、腹痛，是台灣誤食中毒案例最多的毒菇之一。若有誤食，請立即就醫。',
      book: { page: '02', parts: [['菌傘', '菌蓋呈傘狀，表面帶有褐色鱗片。'], ['菌柄基部', '基部膨大，留有環帶狀殘留物。'], ['菌褶', '藏在菌傘下，白色而密集。']],
        like: [['高大環柄菇', '體型碩大，成熟後菌蓋展開如大型陽傘。'], ['雞肉絲菇', '體型巨大如陽傘，菌蓋布滿蛇皮狀鱗片。']] },
      like: ['macro', 'termito'] },
    panaeolus: { name: '蝶形斑褶菇', alias: '花褶傘', sci: 'Panaeolus papilionaceus', fam: '斑褶菇屬', tox: 3, type: '神經型',
      stage: 3, season: '春–秋', color: '#d8b07a', img: 'img/mush/panaeolus.webp', verified: true,
      look: '糞便上的鐘形小毒菇。具備灰黑色的鐘形傘帽、佈滿斑點的密集黑褶，以及暗紅褐色的細長菌柄。',
      habitat: '生於牛馬糞便上，常成群出現在低海拔、潮濕的牧場與草原。',
      symptom: '可能造成幻覺、焦慮、心跳加快與判斷力下降。若有誤食，請立即就醫。',
      book: { page: '03', parts: [['菌傘', '表面光滑，邊緣常殘留白色的碎屑。'], ['菌柄基部', '略微膨大，且無菌托與菌環。'], ['菌褶', '密集的直生狀，邊緣常有醒目的白色。']],
        like: [['半卵形斑褶菇', '生長於牛馬糞便上，菌蓋呈鐘形或半卵形。'], ['安地列斯斑褶菇', '台灣牧場牛糞上極常見的糞生菌。']] },
      like: ['psilocybe', 'inocybe'] },
    inocybe: { name: '汙白絲蓋傘', sci: 'Inocybe geophylla', fam: '絲蓋傘科', tox: 4, type: '毒蕈鹼型',
      stage: 17, season: '夏–秋', color: '#efe5d6', img: 'img/mush/inocybe.webp', verified: true,
      look: '菌蓋呈鐘形至圓錐形，成熟後逐漸平展，表面呈白色至乳白色，帶有細緻絲狀纖維。菌柄細長，呈白色，基部略微膨大。',
      habitat: '常見於針葉林及闊葉林地面，與樹木形成菌根共生關係，多生長於潮濕、富含腐植質的土壤中。',
      symptom: '食後約 30 分鐘大量流汗、流淚、流口水、視線模糊，嚴重時心跳變慢。若有誤食，請立即就醫。',
      book: { page: '17', parts: [['菌傘', '表面具細緻絲狀纖維，中央微凸。'], ['菌柄基部', '基部略膨大，表面帶有細微纖維。'], ['菌褶', '排列緊密，成熟逐漸轉為淡褐色。']],
        like: [['絲蓋小包腳菇', '絲狀菌蓋，菌柄細長，常見於潮濕環境。'], ['淡紫絲蓋傘', '淡紫至乳白色，菌蓋具絲狀纖維。']] },
      like: ['conocybe', 'panaeolus'] },
    phallus: { name: '純黃竹蓀', sci: 'Phallus luteus', fam: '鬼筆屬', tox: 2, type: '胃腸型',
      stage: 5, season: '夏（雨後清晨）', color: '#e2c021', img: 'img/mush/phallus.webp', verified: true,
      look: '鐘形菌蓋與海綿狀淺黃菌柄，核心特徵是菌蓋下會垂下一整圈鮮豔的橘黃色網格狀長裙。',
      habitat: '熱帶與亞熱帶的竹林、闊葉林或混交林中。',
      symptom: '與可食的長裙竹蓀外形相近，誤食可能嘔吐、腹瀉。若有誤食，請立即就醫。',
      book: { page: '05', parts: [['菌傘', '鐘形或圓錐形，表面有不規則的網格狀隆起。'], ['菌柄基部', '基部留有紫褐色蛋殼狀菌托，為菌蕾破殼後的殘留結構。'], ['菌褶', '凹凸網格狀，覆有墨綠色惡臭黏液。']],
        like: [['長裙竹蓀', '穿著蕾絲裙的菇類。'], ['金黃色竹蓀', '同時擁有橙色網狀長裙與黃色菌柄。']] },
      like: ['mutinus', 'leucocoprinus'] },
  exitialis: { name: '致命鵝膏', sci: 'Amanita exitialis', fam: '鵝膏菌科', tox: 5, type: '肝毒型',
      stage: 7, season: '春–夏', color: '#f4f1ea',
      look: '全身純白，有菌環與袋狀菌托，外表乾淨漂亮，常被誤認為可食的白蘑菇。',
      habitat: '低至中海拔闊葉林地面，與殼斗科植物共生。',
      symptom: '含鵝膏毒肽，潛伏 6–24 小時後嘔吐腹瀉，接著「假性好轉」，2–3 天後肝腎衰竭。',
      like: ['fuliginea', 'chloro'], svg: { kind: 'amanita', cap: '#f6f3ec', stem: '#f6f3ec', volva: 1 } },
    /* 相似可食菇（03/相似菇/，本專題手繪）：ref＝只在「相似卻不同」出現，不放進山行層、不算圖鑑收集數 */
    macro: { name: '高大環柄菇', alias: '雨傘菇', sci: 'Macrolepiota procera', fam: '蘑菇科', tox: 0, type: '可食・對照', ref: true,
      stage: 2, season: '夏–秋', color: '#c9ad86', img: 'img/mush/macro.webp', verified: true,
      look: '體型碩大，成熟後菌蓋展開如大型陽傘，傘面有褐色鱗片，菌柄細長、菌環可上下移動。',
      habitat: '草地、林緣與竹林邊。',
      symptom: '可食用，但和綠褶菇幾乎一模一樣（綠褶菇成熟後菌褶轉灰綠），是台灣最常見的誤採組合，野外不要自己採。',
      like: ['chloro', 'termito'] },
    termito: { name: '雞肉絲菇', sci: 'Termitomyces sp.', fam: '離褶傘科', tox: 0, type: '可食・對照', ref: true,
      stage: 2, season: '夏（梅雨後）', color: '#cfb48e', img: 'img/mush/termito.webp', verified: true,
      look: '體型巨大如陽傘，菌蓋布滿蛇皮狀鱗片，中央有尖凸，菌柄長、往下連到白蟻巢。',
      habitat: '和白蟻共生，從地下的白蟻巢長出，常見於農地、竹林與林緣。',
      symptom: '可食用的野菇，但大型白色傘菇也可能是綠褶菇，須由專家確認。',
      like: ['chloro', 'macro'] },
    pingu: { name: '平菇', sci: 'Pleurotus ostreatus', fam: '側耳科', tox: 0, type: '可食・對照', ref: true,
      stage: 8, season: '秋–春', color: '#b8afa2', img: 'img/mush/pingu.webp', verified: true,
      look: '扇形至貝殼形的灰白菌蓋，菌柄短而偏生，常一片片疊生在枯木上。',
      habitat: '闊葉樹的枯木與倒木。',
      symptom: '可食用；月夜茸也長在枯木上、外形相近，但月夜茸切開菌柄有黑斑、夜晚菌褶會發光。',
      like: ['omphalotus', 'xianggu'] },
    xianggu: { name: '香菇', sci: 'Lentinula edodes', fam: '類臍菇科', tox: 0, type: '可食・對照', ref: true,
      stage: 8, season: '春、秋', color: '#8b5b3d', img: 'img/mush/xianggu.webp', verified: true,
      look: '褐色圓形菌蓋，表面常有白色鱗片或龜裂花紋，菌柄居中、質地韌。',
      habitat: '殼斗科等闊葉樹的倒木；台灣常見的多是段木或太空包栽培。',
      symptom: '可食用；野外與月夜茸外形相近，月夜茸菌柄偏生、菌褶延生且夜晚發光。',
      like: ['omphalotus', 'pingu'] },
    lepiota: { name: '褐鱗環柄菇', sci: 'Lepiota helveola', fam: '蘑菇科', tox: 5, type: '肝毒型',
      stage: 7, season: '夏–秋', color: '#b98a6b',
      look: '小型菌傘，表面有同心排列的紅褐色細鱗，菌柄有不明顯的菌環。',
      habitat: '林下落葉層、草地與林緣。',
      symptom: '與致命鵝膏同樣含鵝膏毒肽，少量即可造成肝臟損傷。',
      like: ['chloro'], svg: { kind: 'parasol', cap: '#ead8c6', spot: '#9c5a3c', stem: '#efe3d6', small: 1 } },
    muer: { name: '黑木耳', sci: 'Auricularia heimuer', fam: '木耳科', tox: 0, type: '可食・對照',
      stage: 8, season: '全年（雨後）', color: '#4b2a22', img: 'img/mush/muer.webp', verified: true,
      look: '可食用，表面柔軟有彈性，呈耳朵狀的膠質子實體。',
      habitat: '倒木與枯枝上，低至中海拔森林常見。',
      symptom: '可食用，但野外採集仍須由專家確認；乾燥的鹿花菌外形容易與木耳混淆。',
      like: ['gyromitra', 'helu'] },
    entoloma: { name: '毒粉褶菌', sci: 'Entoloma sinuatum', fam: '粉褶菌科', tox: 3, type: '胃腸型',
      stage: 15, season: '秋', color: '#b7aa98',
      look: '菌傘灰白至淡黃褐色、邊緣波浪狀，菌褶由淡黃轉為粉紅色，外形普通、容易誤認。',
      habitat: '闊葉林林緣與林道邊坡地面。',
      symptom: '食後 30 分鐘至 2 小時劇烈嘔吐與腹瀉，嚴重時脫水；常被誤認為可食的口蘑或雞油菌。',
      like: ['russula'], svg: { kind: 'flat', cap: '#b8a893', stem: '#ebe4d8' } },
    fuliginea: { name: '灰花紋鵝膏', sci: 'Amanita fuliginea', fam: '鵝膏菌科', tox: 5, type: '肝毒型',
      stage: 10, season: '夏–秋', color: '#6f6a64',
      look: '菌傘灰褐色帶放射狀暗色纖維紋，菌柄白色，基部有白色菌托。',
      habitat: '殼斗科與樟科混生林地面。',
      symptom: '劇毒，含鵝膏毒肽，可造成急性肝衰竭。',
      like: ['exitialis'], svg: { kind: 'amanita', cap: '#7b746b', stem: '#ece8e1', volva: 1 } },
    hypholoma: { name: '簇生垂幕菇', sci: 'Hypholoma fasciculare', fam: '球蓋菇科', tox: 3, type: '胃腸型',
      stage: 11, season: '秋–冬', color: '#e8962a', img: 'img/mush/hypholoma.webp',
      look: '硫黃色小菇成簇生長，菌褶黃綠色，味道很苦。',
      habitat: '腐朽的樹樁、倒木與樹根。',
      symptom: '嘔吐、腹瀉，嚴重時可能影響肝臟。',
      like: ['muer'], svg: { kind: 'cluster', cap: '#dcb53c', stem: '#efd987' } },
    russula: { name: '毒紅菇', sci: 'Russula emetica', fam: '紅菇科', tox: 2, type: '胃腸型',
      stage: 12, season: '夏–秋', color: '#d73a3a', img: 'img/mush/russula.webp',
      look: '鮮紅色光滑菌傘，菌褶與菌柄純白，質地脆、容易折斷。',
      habitat: '潮濕的苔蘚地與針闊葉混合林。',
      symptom: '味道辛辣，食後噁心、嘔吐、腹瀉。',
      like: ['muscaria'], svg: { kind: 'flat', cap: '#d23b3b', stem: '#f5f2ee' } },
    galerina: { name: '具緣盔孢傘', sci: 'Galerina marginata', fam: '層腹菌科', tox: 5, type: '肝毒型',
      stage: 13, season: '秋', color: '#b06b2c',
      look: '小型褐色菇，濕潤時菌傘半透明，菌柄上有細小菌環，常成群長在木頭上。',
      habitat: '針葉樹的倒木與腐木，霧林帶潮濕處。',
      symptom: '含鵝膏毒肽，毒性與致命鵝膏相同；常被誤認為可食的金針菇類。',
      like: ['hypholoma'], svg: { kind: 'cluster', cap: '#b46f30', stem: '#d9b48a' } },
    omphalotus: { name: '月夜菌', alias: '月夜茸', sci: 'Omphalotus japonicus', fam: '類臍菇科', tox: 3, type: '胃腸型',
      stage: 8, season: '秋', color: '#9fe8a8', img: 'img/mush/omphalotus.webp', glow: '#8dffb0',
      look: '褐紫色扁平菌傘，菌褶在黑暗中發出淡綠色螢光。',
      habitat: '山毛櫸、楓類等闊葉樹的枯木上，潮濕的霧林夜晚最容易看見光。',
      symptom: '食後 30 分鐘至 1 小時劇烈嘔吐、腹痛，常被誤認為香菇或平菇。',
      like: ['pingu', 'xianggu'], svg: { kind: 'shelf', cap: '#7a5a48', stem: '#a88c74', glow: '#8dffb0' } },
    pantherina: { name: '豹斑鵝膏', sci: 'Amanita pantherina', fam: '鵝膏菌科', tox: 4, type: '神經型',
      stage: 13, season: '夏–秋', color: '#8a6a4c',
      look: '褐色菌傘上布滿白色疣點，像豹紋；菌柄有菌環，基部膨大。',
      habitat: '針葉林與混合林地面，有時排成「仙女環」。',
      symptom: '含毒蠅蕈醇與鵝膏蕈胺酸，造成意識混亂、幻覺、痙攣。',
      like: ['muscaria', 'huang'], svg: { kind: 'amanita', cap: '#8b6a4b', stem: '#f1ece3', spot: '#f6f1e7' } },
    huang: { name: '黃蓋鵝膏', sci: 'Amanita sp.（種名待確認）', fam: '鵝膏菌科', tox: 4, type: '神經型',
      stage: 16, season: '夏–秋', color: '#e6c34a', img: 'img/mush/huang.webp', verified: true,
      look: '黃色傘面，散布白色疣狀斑點。',
      habitat: '針闊葉混合林地面，與松樹形成菌根。',
      symptom: '與毒蠅鵝膏菌同屬，可能影響神經系統。',
      like: ['muscaria', 'hong'] },
    hong: { name: '紅鵝膏', sci: 'Amanita sp.（種名待確認）', fam: '鵝膏菌科', tox: 4, type: '神經型',
      stage: 17, season: '夏–秋', color: '#e8693b', img: 'img/mush/hong.webp', verified: true,
      look: '橘紅色傘面，散布白色疣狀斑點。',
      habitat: '松林與混合林地面。',
      symptom: '與毒蠅鵝膏菌同屬，可能影響神經系統。',
      like: ['muscaria', 'huang'] },
    morel: { name: '羊肚菌', sci: 'Morchella sp.', fam: '羊肚菌科', tox: 0, type: '可食・對照',
      stage: 17, season: '春', color: '#9a7a52', img: 'img/mush/morel.webp', verified: true,
      look: '可食用，菌蓋呈蜂巢狀凹凸紋理，內部中空。',
      habitat: '春天火燒地、林緣與松林下。',
      symptom: '須完全煮熟才能食用；外形與鹿花菌相似，是最常見的誤採組合。',
      like: ['gyromitra', 'helu'] },
    helu: { name: '赫鹿花菌', sci: 'Gyromitra infula', fam: '平盤菌科', tox: 4, type: '肝毒型',
      stage: 18, season: '夏–秋', color: '#8b3f22', img: 'img/mush/helu.webp', verified: true,
      look: '深褐色菌蓋，呈不規則腦狀皺褶，常呈馬鞍形。',
      habitat: '針葉林腐木與腐植質厚的林地。',
      symptom: '含鹿花菌素，可能造成嘔吐、肝臟損傷與神經症狀。',
      like: ['gyromitra', 'morel'] },
    gyromitra: { name: '鹿花菌', sci: 'Gyromitra esculenta', fam: '鹿花菌屬', tox: 5, type: '肝毒型',
      stage: 18, season: '春', color: '#9a5536', img: 'img/mush/gyromitra.webp', verified: true,
      look: '菌蓋呈不規則腦狀皺褶，紅褐至深褐色，菌柄短粗，呈白色至淡黃色，內部常有空腔。',
      habitat: '常見於溫帶針葉林或混合林，生長在潮濕土壤、腐植質及林地邊緣，多於春季出現，位於海拔高度 2,600 M。',
      symptom: '誤食可能會影響神經系統，若有誤食，請立即就醫。只觀察，不採食，外觀圖解不能作為食用判斷依據。',
      book: { page: '18', parts: [['菌傘', '深褐色，呈不規則腦狀皺褶。'], ['菌柄', '乳白至淡褐色，短粗且表面光滑。']],
        like: [['黑木耳', '可食用，表面柔軟有彈性。'], ['羊肚菌', '可食用，菌蓋呈蜂巢狀凹凸紋理。'], ['赫鹿花菌', '深褐色菌蓋，呈不規則腦狀皺褶。']] },
      like: ['morel', 'muer', 'helu'] },
    muscaria: { name: '毒蠅鵝膏菌', alias: '毒蠅傘', sci: 'Amanita muscaria', fam: '鵝膏菌科', tox: 4, type: '神經型',
      stage: 19, season: '夏–秋', color: '#e0262d', img: 'img/mush/muscaria.webp', verified: true,
      look: '菌傘鮮紅至橘紅色，表面有白色疣狀斑點，菌柄白色，基部膨大。',
      habitat: '常見於針葉林或混合林，與松、樺等樹木形成菌根關係，位於海拔高度 2,000 — 3,000 M。',
      symptom: '誤食可能會影響神經系統，若有誤食，請立即就醫。只觀察，不採食，外觀圖解不能作為食用判斷依據。',
      book: { page: '19', parts: [['菌傘', '紅色傘面，散布白色疣狀斑點。'], ['菌柄基部', '基部膨大，留有環帶狀殘留物。'], ['菌褶', '藏在菌傘下，白色而密集。']],
        like: [['黃蓋鵝膏', '黃色傘面，散布白色疣狀斑點。'], ['紅鵝膏', '橘紅色傘面，散布白色疣狀斑點。']] },
      like: ['huang', 'hong'] },

    /* ---------- 以下為「菌褶線稿」資料夾新增的菇（文字為示意，待組員校正） ---------- */
    conocybe: { name: '乳白錐蓋傘', sci: 'Conocybe apala', fam: '糞錐菇科', tox: 1, type: '不可食',
      stage: 2, season: '夏（雨後清晨）', color: '#efe6d2',
      look: '菌傘圓錐形、乳白色，非常薄脆；菌柄細長易斷，菌褶由淡色轉為肉桂褐色。',
      habitat: '草坪、公園與步道旁的草地，雨後清晨冒出，太陽一曬中午前就凋萎。',
      symptom: '菇體小、不具食用價值，同屬部分種類有毒，請勿採食。',
      like: ['panaeolus', 'chloro'], svg: { kind: 'bell', cap: '#efe6d2', stem: '#f4eee2' } },
    leucocoprinus: { name: '純黃白鬼傘', sci: 'Leucocoprinus birnbaumii', fam: '蘑菇科', tox: 2, type: '胃腸型',
      stage: 6, season: '夏–秋', color: '#f2d43a',
      look: '全身鮮檸檬黃色，菌傘表面有粉狀細鱗，成熟後邊緣出現放射狀溝紋。',
      habitat: '腐葉堆、竹林落葉層，也常出現在盆栽土與溫室裡。',
      symptom: '誤食可能引起嘔吐、腹瀉等腸胃不適。',
      book: { page: '06', parts: [['菌傘', '表面覆有細粉狀鱗片，邊緣具明顯溝紋。'], ['菌柄基部', '整體菌柄纖細。'], ['菌褶', '排列緊密，排列密集且有小褶。']],
        like: [['硫色白鬼傘', '菌蓋呈淡黃綠至硫磺色，表面覆有灰黑色纖毛或鱗片。'], ['三色白鬼傘', '表面多為白色至淡褐色或奶油色。']] },
      like: ['chloro'], svg: { kind: 'parasol', cap: '#f4dd55', spot: '#d9b320', stem: '#f2dc6a', small: 1 } },
    psilocybe: { name: '古巴裸蓋傘', sci: 'Psilocybe cubensis', fam: '裸蓋菇屬', tox: 3, type: '神經型',
      stage: 4, season: '夏–秋（雨後）', color: '#e9e2d6', img: 'img/mush/psilocybe.webp', verified: true,
      look: '金褐色菌蓋與帶菌環的白色菌柄，其最核心特徵是菌體受損後會緩慢氧化變為藍綠色。',
      habitat: '熱帶及亞熱帶的糞生真菌，主要在雨後直接生長於牛馬等草食動物的糞便上。',
      symptom: '含裸蓋菇素，會造成幻覺與判斷力喪失；在台灣屬於管制的毒品成分，嚴禁採集。若有誤食，請立即就醫。',
      book: { page: '04', parts: [['菌傘', '表面光滑，特徵是碰傷後會變為藍綠色。'], ['菌柄基部', '稍微膨大且帶有白色菌絲。'], ['菌褶', '排列緊密，顏色會從幼時的污白色逐漸成熟轉為暗紫褐色。']],
        like: [['藍斑褶傘', '灰白色菌傘與瘦長無菌環的菌柄。'], ['半卵形斑褶菇', '乳白至淡黃色的蛋形菌傘與帶菌環的瘦長菌柄。']] },
      like: ['panaeolus'] },
    verna: { name: '白毒鵝膏', sci: 'Amanita verna', fam: '鵝膏菌科', tox: 5, type: '肝毒型',
      stage: 16, season: '春–夏（溫暖潮濕）', color: '#f5f2ea', img: 'img/mush/verna.webp', verified: true,
      look: '菌蓋呈白色至乳白色，幼時呈半球形，成熟後逐漸平展，菌柄細長，具有膜狀菌環，基部膨大並具有囊狀菌托。',
      habitat: '主要生長於闊葉林及混合林地，常與樹木形成菌根共生關係，多出現於溫暖潮濕的季節，位於海拔高度 500—1,500 M。',
      symptom: '含鵝膏毒肽，潛伏 6–24 小時後嘔吐腹瀉，接著短暫好轉，數天後可能肝腎衰竭。若有誤食，請立即就醫。',
      book: { page: '16', parts: [['菌傘', '菌蓋呈白色至乳白色，表面光滑。'], ['菌柄基部', '基部膨大，具有明顯的白色囊狀菌托。'], ['菌褶', '菌褶呈白色，排列密集，與菌柄分離。']],
        like: [['鱗柄白鵝膏', '菌蓋純白，菌柄具纖維狀鱗片。'], ['白環蘑', '菌蓋白色且表面光滑，菌柄具有菌環。']] },
      like: ['virosa', 'exitialis', 'phalloides'] },
    phalloides: { name: '毒鵝膏', sci: 'Amanita phalloides', fam: '鵝膏菌科', tox: 5, type: '肝毒型',
      stage: 10, season: '夏–秋', color: '#b6b97a',
      look: '菌傘黃綠至橄欖色，表面光滑有放射狀纖維紋，菌褶白色，有菌環與袋狀菌托。',
      habitat: '闊葉林地面，與櫟樹等殼斗科植物共生。',
      symptom: '俗稱「死帽菌」，全球蘑菇中毒死亡的主要原因；半朵就可能致命，造成急性肝衰竭。',
      like: ['fuliginea', 'verna'], svg: { kind: 'amanita', cap: '#a9ae6c', stem: '#f1efe4', volva: 1 } },
    gymnopilus: { name: '橘黃裸傘', sci: 'Gymnopilus junonius', fam: '層腹菌科', tox: 3, type: '神經型',
      stage: 11, season: '夏–秋', color: '#e8902a',
      look: '橘黃色大型菇，成叢長在木頭上，菌褶鐵鏽色，菌柄有菌環，味道很苦。',
      habitat: '枯死的樹樁、倒木與樹根基部。',
      symptom: '部分地區的族群含神經毒素，誤食可能出現頭暈、幻覺或腸胃不適。',
      like: ['hypholoma', 'galerina'], svg: { kind: 'cluster', cap: '#e8902a', stem: '#e9b16a' } },
    nitidum: { name: '光澤粉褶菌', sci: 'Entoloma nitidum', fam: '粉褶菌科', tox: 1, type: '不可食',
      stage: 14, season: '秋', color: '#3f4f78',
      look: '菌傘深藍黑色、帶絲質光澤，菌柄同為藍色，菌褶成熟後呈粉紅色。',
      habitat: '潮濕的針葉林與霧林地面苔蘚間。',
      symptom: '毒性資料不足，粉褶菌屬多數種類會造成胃腸型中毒，不可食用。',
      like: ['entoloma'], svg: { kind: 'bell', cap: '#3f4f78', stem: '#6f80a8' } },
    virosa: { name: '鱗柄白鵝膏', sci: 'Amanita virosa', fam: '鵝膏菌科', tox: 5, type: '肝毒型',
      stage: 16, season: '夏–秋', color: '#f2efe7',
      look: '全身白色，菌柄上有明顯的毛狀鱗片，基部有袋狀菌托，菌傘中央略凸。',
      habitat: '針闊葉混合林地面。',
      symptom: '劇毒，含鵝膏毒肽，可造成急性肝腎衰竭。',
      like: ['verna', 'exitialis'], svg: { kind: 'amanita', cap: '#f4f1ea', stem: '#efebe2', volva: 1 } },
    cornu: { name: '火焰茸', sci: 'Trichoderma cornu-damae', fam: '肉座菌科', tox: 5, type: '肝毒型',
      stage: 10, season: '夏–秋', color: '#d9455a',
      look: '鮮紅色的珊瑚狀或手指狀子實體，從土裡或腐木旁冒出，像一簇小火焰。',
      habitat: '台灣中低海拔闊葉林，多長在腐朽的樹根或倒木周圍。',
      symptom: '劇毒，連觸摸都可能造成皮膚發炎；誤食會造成肝腎衰竭、神經損傷，甚至死亡。若有誤食，請立即就醫。',
      like: ['muscaria'] },
    pulvero: { name: '黃粉末牛肝菌', sci: 'Pulveroboletus ravenelii', fam: '牛肝菌科', tox: 2, type: '胃腸型',
      stage: 17, season: '夏–秋', color: '#e8c52a',
      look: '整朵覆蓋鮮黃色粉末，菌傘下方是黃色「菌孔」而不是菌褶，切開或碰傷會變藍。',
      habitat: '松林與針闊葉混合林地面，與松樹共生。',
      symptom: '不建議食用，可能引起腸胃不適。',
      like: ['huang'], svg: { kind: 'flat', cap: '#e8c52a', stem: '#f0d86a' } }
  };
  Object.keys(MUSH).forEach(k => (MUSH[k].id = k));
  // 菌褶線稿：本專題手繪（03/菌褶線稿/），由 prep_images.py 轉成 img/gill/
  const GILL = ['muscaria', 'inocybe', 'russula', 'omphalotus', 'pantherina', 'chloro', 'phallus', 'panaeolus', 'entoloma',
    'conocybe', 'psilocybe', 'leucocoprinus', 'nitidum', 'gymnopilus', 'phalloides', 'verna', 'virosa', 'pulvero'];
  GILL.forEach(k => { MUSH[k].gill = `img/gill/${k}.webp`; });
  // 菇菇們（03/毒菇山行/菇菇們/）：本專題手繪的 21 種完整去背菇，點菇時飛到右側展示、圖鑑縮圖都用這組
  ['conocybe', 'nitidum', 'psilocybe', 'omphalotus', 'gymnopilus', 'entoloma', 'russula', 'muscaria', 'phalloides', 'inocybe', 'cornu',
    'verna', 'mutinus', 'leucocoprinus', 'phallus', 'chloro', 'panaeolus', 'pantherina', 'virosa', 'gyromitra', 'pulvero']
    .forEach(k => { MUSH[k].img = `img/mush/${k}.webp`; MUSH[k].drawn = true; });
  // 壓克力攜帶小卡（03/壓克力攜帶小卡/）：19 張，說明卡可開大圖
  ['phallus', 'inocybe', 'muscaria', 'gyromitra', 'panaeolus', 'chloro', 'mutinus', 'nitidum', 'virosa', 'verna', 'phalloides',
    'omphalotus', 'cornu', 'russula', 'entoloma', 'pulvero', 'gymnopilus', 'leucocoprinus', 'psilocybe']
    .forEach((k, i) => { MUSH[k].card = `img/card/${String(i + 1).padStart(2, '0')}-${k}.webp`; });
  // 書本排版整頁（03/書本排版/圖片檔/）：說明卡的「書頁圖解」
  Object.values(MUSH).forEach(m => { if (m.book) { m.plate = `img/book/${m.id}.webp`; m.verified = true; } });
  MUSH.pulvero.gillKind = '菌孔'; MUSH.phallus.gillKind = '菌裙';

  /* ---------- 生態點（非菇類） ---------- */
  /* ---------- 場景互動點（地景・植物・動物） ----------
     tag：地景／植物／動物（上方「場景」篩選用）；rel：在這裡生長的菇（說明卡會互相連結） */
  const ECO = {
    // 第 1 張：溪澗
    stream: { name: '山澗溪流', tag: '地景', rel: ['mutinus'], text: '溪水帶來穩定的濕氣，岩石與樹根長時間保持潮濕，是菌絲最早甦醒的地方。' },
    rock: { name: '溪石', tag: '地景', rel: [], text: '溪石表面長滿苔蘚，石縫裡卡著腐葉與細土，成為孢子落地、菌絲保濕的避風港。' },
    moss: { name: '樹根苔蘚', tag: '植物', rel: ['mutinus', 'inocybe'], text: '苔蘚像海綿一樣吸飽水分，讓樹根與樹幹表面長時間保持濕潤，菇類因此能沿著樹幹往上生長。' },
    litter: { name: '落葉層', tag: '植物', rel: ['mutinus'], text: '一層層的落葉被真菌慢慢分解成腐植質。翻開落葉，常能看到白色的菌絲網。' },
    // 第 2 張：灌叢
    shrub: { name: '林緣灌叢', tag: '植物', rel: ['chloro'], text: '樹根周圍的灌叢擋住強光、留住水氣，雨後的草地與灌叢邊緣最常冒出成群的大青褶傘。' },
    wall: { name: '步道邊坡', tag: '地景', rel: ['chloro'], text: '步道旁的擋土牆與草地交界，土壤常被翻動、陽光充足，正是大青褶傘喜歡的環境——也因此最容易被民眾誤採。' },
    trunk: { name: '大樹樹幹', tag: '植物', rel: ['inocybe', 'hypholoma', 'muer'], text: '這棵大樹就是整座山。樹皮的裂縫、苔蘚與枯枝，提供各種菇類附著與分解的空間。' },
    // 第 3 張：牧場
    dung: { name: '牛糞堆', tag: '動物', rel: ['panaeolus', 'psilocybe'], text: '牛吃下牧草，排出的糞便富含氮與未消化的纖維。花褶傘（蝶形斑褶菇）與古巴裸蓋傘的孢子會黏在牧草上被牛吃下，再隨牛糞落地發芽——牛糞就是牠們的家。' },
    fence: { name: '牧場木柵欄', tag: '地景', rel: ['panaeolus'], text: '柵欄圍出放牧的草地。牛群在這裡吃草、休息，也留下了一堆堆牛糞。' },
    pasture: { name: '牧草地', tag: '植物', rel: ['panaeolus'], text: '牧草地陽光充足，草根與牛糞交錯，是糞生菇與草地菇類共同的舞台。' },
    fern: { name: '樹幹上的蕨類', tag: '植物', rel: ['inocybe'], text: '附生在樹幹上的蕨類代表這裡空氣濕潤。汙白絲蓋傘就躲在這些小葉片旁邊。' },
    // 第 4 張：林緣糞堆
    hollow: { name: '樹洞裡的毬果', tag: '動物', rel: [], text: '樹洞裡塞滿毬果，是松鼠為冬天準備的糧倉。來不及吃掉的種子，日後可能就在林下發芽。' },
    stones: { name: '林緣碎石', tag: '地景', rel: ['psilocybe'], text: '牧場與森林交界的碎石和泥土路，牛群常在這裡休息、留下糞便，糞生菇因此特別多。' },
    // 第 5 張：竹林
    bamboogrove: { name: '竹林', tag: '植物', rel: ['phallus', 'leucocoprinus'], text: '竹林底層落葉厚、濕氣重又不太通風，竹蓀與鬼筆類最喜歡這種環境。' },
    deadbranch: { name: '枯枝與竹葉', tag: '植物', rel: ['phallus'], text: '枯枝與竹葉慢慢被分解成腐植質，是竹蓀從「菌蛋」中破殼而出的溫床。' },
    // 第 6 張：溪畔草叢
    brook: { name: '繞樹溪流', tag: '地景', rel: ['leucocoprinus'], text: '溪水繞過大樹根部，岸邊的土壤總是濕的。純黃白鬼傘喜歡這種溫暖潮濕、腐植質多的地方。' },
    sedge: { name: '白花草叢', tag: '植物', rel: ['leucocoprinus', 'entoloma'], text: '細長的草葉間開滿白色小花，替地面遮陽保濕，小型菇類常躲在草叢裡。' },
    // 第 14 張：落葉坡地
    leafbed: { name: '厚落葉層', tag: '植物', rel: ['nitidum'], text: '一層層落葉被真菌慢慢分解。光澤粉褶菌就從葉堆裡冒出，藍灰色的菌傘在落葉間特別顯眼。' },
    slope: { name: '大樹土坡', tag: '地景', rel: ['nitidum'], text: '大樹根部隆起的土坡排水好又保濕，是許多菇類與樹根交換養分的地方。' },
    // 第 15 張：岩坡草甸
    weasel: { name: '黃鼠狼', tag: '動物', rel: ['entoloma'], text: '黃鼠狼在土坡與岩縫間穿梭覓食。動物走過時會帶著孢子移動，幫菇類把下一代散播到別處。' },
    whitebloom: { name: '岩間草甸', tag: '植物', rel: ['entoloma'], text: '岩塊之間長滿開白花的草叢，灰白色的毒粉褶菌混在其中，外表普通、最容易被誤採。' },
    // 第 16 張：針闊葉混合林
    mixedwood: { name: '針闊葉混合林', tag: '植物', rel: ['verna', 'virosa', 'huang'], text: '針葉樹與闊葉樹混生，地面富含腐植質。白毒鵝膏與樹根形成菌根，彼此交換養分。' },
    mossrock: { name: '苔蘚岩塊', tag: '地景', rel: ['verna'], text: '長滿苔蘚的岩塊保住了林地的濕氣，溫暖潮濕的季節，白色鵝膏就在岩邊冒出。' },
    // 第 17 張：鐵杉林
    hemlock: { name: '鐵杉林', tag: '植物', rel: ['inocybe'], text: '鐵杉林下的地面潮濕、富含腐植質，汙白絲蓋傘與樹木形成菌根共生。' },
    groundcover: { name: '林下灌叢', tag: '植物', rel: ['inocybe'], text: '林下低矮的灌叢替小型菇類遮陽保濕，鐘形的白色小菇常一朵朵藏在葉叢間。' },
    // 第 18 張：冷杉林
    firs: { name: '冷杉林', tag: '植物', rel: ['gyromitra', 'helu'], text: '海拔兩千五百公尺上下的冷杉林，春雪融化後土壤潮濕，鹿花菌就在林地邊緣出現。' },
    twigs: { name: '倒伏枯枝', tag: '植物', rel: ['gyromitra'], text: '倒下的枯枝慢慢腐爛，讓林地邊緣累積厚厚的腐植質，正是鹿花菌喜歡的地方。' },
    // 第 20 張：雪霧冷杉林
    snowfirs: { name: '雪霧冷杉', tag: '植物', rel: [], text: '冷杉披著霜雪站在雲霧裡。這裡接近森林界線，再往上就只剩箭竹草原與岩壁。' },
    // 第 19 張：高山草坡
    nest: { name: '高處鳥巢', tag: '動物', rel: [], text: '鳥巢建在避風的枝枒間。高山鳥類趁短暫的夏天繁殖，趕在入冬前離開。' },
    path: { name: '高山步道', tag: '地景', rel: ['muscaria'], text: '登山步道兩側光照充足，又連著針葉樹的根系，毒蠅鵝膏常沿著步道邊緣冒出，是登山客最常看見的毒菇。' },
    strata: { name: '岩層褶皺', tag: '地景', rel: [], text: '板岩與砂岩一層層堆疊、彎折，記錄著台灣造山運動把海底地層推上高山的過程。' },
    bamboo: { name: '玉山箭竹草坡', tag: '植物', rel: ['muscaria'], text: '森林界線以上，玉山箭竹取代了大樹，密密覆蓋稜線，冬天會被白雪壓彎。' },
    // 第 21 張：稜頂
    goose: { name: '遷徙雁群', tag: '動物', rel: [], text: '秋天的雁群飛越稜線，提醒山上的季節即將進入冰雪期。' },
    cliff: { name: '高山岩壁', tag: '地景', rel: [], text: '陡峭的岩壁上幾乎沒有土壤，只剩地衣與苔蘚，菌類多半改以和藻類共生的「地衣」形式生活。' },
    clouds: { name: '雲海', tag: '地景', rel: ['gyromitra', 'muscaria'], text: '午後雲霧湧上山谷，形成雲海。霧氣帶來的水分，讓高山上的菇類在少雨的季節也能生長。' },
    ridge: { name: '遠方稜線', tag: '地景', rel: [], text: '一座座山峰連成稜線。越往上，氣溫越低、風越大，能生存的生物也越少。' },
    branch: { name: '冬季枯枝', tag: '植物', rel: [], text: '樹頂的枝條在冬天落光葉子，減少水分散失、避免積雪壓斷枝幹，等春天再長出新芽。' }
  };

  return { ART, STAGES, MUSH, ECO, TOP, STEP };
})();
