/* =========================================================
   讀菇 主網站 － 資料檔
   菇的插圖、小卡、書頁、山行插畫都共用 dugu-trail/img/（本專題組員手繪）
   文字取自本專題企劃書表一～表三（毒性分類、分布、症狀）
   ========================================================= */
window.DUGU = (function () {
  const T = 'dugu-trail/';
  // type: gi 腸胃型 / ne 神經型 / li 肝腎型　band: low 低海拔 / mid 中海拔 / high 高海拔
  const TYPES = {
    gi: { name: '腸胃型', en: 'Gastrointestinal', color: '#d9a62b', text: '最常見的中毒類型。誤食後數小時內噁心、嘔吐、腹痛、腹瀉，嚴重時脫水。' },
    ne: { name: '神經型', en: 'Neurotoxic', color: '#c8463e', text: '影響神經系統，可能出現幻覺、意識混亂、大量流汗流涎、肌肉抽搐。' },
    li: { name: '肝腎型', en: 'Hepato-renal', color: '#4f5b3a', text: '最致命的一群。潛伏期長、會「假性好轉」，數天後肝腎衰竭，嚴重時死亡。' }
  };
  const M = [
    // ---------- 腸胃型 ----------
    { id: 'chloro', name: '綠褶菇', sci: 'Chlorophyllum molybdites', type: 'gi', band: 'low', stage: 2,
      text: '台灣平原地區常見的大型毒菇，菌褶成熟後轉為灰綠色。公園草地雨後常一整圈冒出，是誤食案例最多的毒菇。' },
    { id: 'russula', name: '毒紅菇', sci: 'Russula emetica', type: 'gi', band: 'high', stage: 12,
      text: '中高海拔林地生長，菌蓋鮮紅、菌褶白色。' },
    { id: 'omphalotus', name: '月夜茸', sci: 'Omphalotus japonicus', type: 'gi', band: 'mid', stage: 8,
      text: '低、中海拔森林的腐木上，菌褶在黑暗中會發出綠色螢光。誤食引發劇烈嘔吐、腹瀉。' },
    { id: 'nitidum', name: '光澤粉褶菌', sci: 'Entoloma nitidum', type: 'gi', band: 'mid', stage: 14,
      text: '低海拔潮濕林地，帶金屬光澤的深藍灰色外觀，成熟後菌褶轉為粉紅色。' },
    { id: 'phallus', name: '純黃竹蓀', sci: 'Phallus luteus', type: 'gi', band: 'low', stage: 5,
      text: '潮濕林地及竹林，鮮黃色蕾絲狀菌裙配橄欖綠黏液，外觀非常醒目。' },
    { id: 'pulvero', name: '黃粉末牛肝菌', sci: 'Pulveroboletus ravenelii', type: 'gi', band: 'mid', stage: 11,
      text: '中低海拔山區，外觀覆蓋鮮黃色粉末，受傷後菌肉會變藍。' },
    { id: 'conocybe', name: '乳白錐蓋傘', sci: 'Conocybe lactea', type: 'gi', band: 'low', stage: 3,
      text: '在苗栗被發現，乳白色圓錐形菌傘，菌柄細長脆弱。' },
    { id: 'leucocoprinus', name: '純黃白鬼傘', sci: 'Leucocoprinus birnbaumii', type: 'gi', band: 'low', stage: 6,
      text: '夏秋兩季的盆栽土或野外林地，全株鮮黃，連家裡的花盆都可能冒出來。' },
    { id: 'entoloma', name: '毒粉褶菌', sci: 'Entoloma sinuatum', type: 'gi', band: 'mid', stage: 15,
      text: '低中海拔山區，菌蓋灰白至淡褐，菌褶由白轉粉紅。外形普通，最容易被誤當成可食菇。' },
    { id: 'mutinus', name: '竹林蛇頭菌', sci: 'Mutinus bambusinus', type: 'gi', band: 'low', stage: 1,
      text: '低海拔竹林，細長如小蛇，頂端紅色並覆蓋惡臭黏液。沒有菌褶。' },
    // ---------- 肝腎型 ----------
    { id: 'phalloides', name: '毒鵝膏', sci: 'Amanita phalloides', type: 'li', band: 'mid', stage: 10,
      text: '菌蓋黃綠至橄欖綠，具菌環與菌托。俗稱「死帽菌」，可能造成肝腎衰竭致命。' },
    { id: 'verna', name: '白毒鵝膏', sci: 'Amanita verna', type: 'li', band: 'high', stage: 16,
      text: '全株純白，具菌環與袋狀菌托。看起來最乾淨無害，卻是最致命的一群。' },
    { id: 'virosa', name: '鱗柄白鵝膏', sci: 'Amanita virosa', type: 'li', band: 'high', stage: 16,
      text: '中高海拔林地，全株純白，菌柄帶白色鱗片。誤食可能肝腎衰竭。' },
    { id: 'gyromitra', name: '鹿花菌', sci: 'Gyromitra esculenta', type: 'li', band: 'high', stage: 18,
      text: '中高海拔山區，腦狀皺褶、紅褐至暗褐色。常被誤認成可食的羊肚菌。' },
    { id: 'cornu', name: '火焰茸', sci: 'Trichoderma cornu-damae', type: 'li', band: 'mid', stage: 10,
      text: '中低海拔闊葉林，鮮紅色火焰狀。毒性強烈，連觸摸都可能讓皮膚發炎。' },
    // ---------- 神經型 ----------
    { id: 'muscaria', name: '毒蠅鵝膏菌', sci: 'Amanita muscaria', type: 'ne', band: 'high', stage: 19,
      text: '中高海拔林地，鮮紅菌蓋綴著白色斑點，童話裡最常見的那朵菇。誤食出現幻覺、抽搐。' },
    { id: 'gymnopilus', name: '橘黃裸傘', sci: 'Gymnopilus junonius', type: 'ne', band: 'mid', stage: 11,
      text: '中海拔腐木上，全株亮橘色、常成群生長。誤食可能頭暈、幻覺、異常興奮。' },
    { id: 'inocybe', name: '汙白絲蓋傘', sci: 'Inocybe geophylla', type: 'ne', band: 'high', stage: 17,
      text: '低中海拔林地，白色菌蓋中央突起。誤食大量流汗流涎、腹痛、呼吸困難。' },
    { id: 'psilocybe', name: '古巴裸蓋傘', sci: 'Psilocybe cubensis', type: 'ne', band: 'low', stage: 4,
      text: '草地、牧場的牛糞上，菌蓋淡黃至黃褐，受損後變藍。含管制成分，嚴禁採集。' },
    { id: 'pantherina', name: '豹斑鵝膏', sci: 'Amanita pantherina', type: 'ne', band: 'high', stage: 13,
      text: '中高海拔林地，褐色菌蓋佈滿白色斑點，像豹紋。誤食出現幻覺、抽搐。' },
    { id: 'panaeolus', name: '蝶形斑褶菇', sci: 'Panaeolus papilionaceus', type: 'ne', band: 'low', stage: 3,
      text: '低海拔牧場或草地的動物糞便上，灰褐至灰黑色鐘形菌傘。' }
  ];
  const CARDS = ['phallus', 'inocybe', 'muscaria', 'gyromitra', 'panaeolus', 'chloro', 'mutinus', 'nitidum', 'virosa', 'verna', 'phalloides',
    'omphalotus', 'cornu', 'russula', 'entoloma', 'pulvero', 'gymnopilus', 'leucocoprinus', 'psilocybe'];
  const GILLS = new Set(['muscaria', 'inocybe', 'russula', 'omphalotus', 'pantherina', 'chloro', 'phallus', 'panaeolus', 'entoloma',
    'conocybe', 'psilocybe', 'leucocoprinus', 'nitidum', 'gymnopilus', 'phalloides', 'verna', 'virosa', 'pulvero']);
  const BOOKPAGE = { mutinus: '01', chloro: '02', panaeolus: '03', psilocybe: '04', phallus: '05', leucocoprinus: '06', verna: '16', inocybe: '17', gyromitra: '18', muscaria: '19' };
  M.forEach(m => {
    m.img = `${T}img/mush/${m.id}.webp`;
    const ci = CARDS.indexOf(m.id);
    if (ci > -1) m.card = `${T}img/card/${String(ci + 1).padStart(2, '0')}-${m.id}.webp`;
    if (GILLS.has(m.id)) m.gill = `${T}img/gill/${m.id}.webp`;
    if (BOOKPAGE[m.id]) { m.page = BOOKPAGE[m.id]; m.plate = `${T}img/book/${m.id}.webp`; }
  });
  // 三冊圖鑑：依海拔分冊（封面＝03/封面/02_B版 黑卡紙鐳雕版，海拔與封面一致；中高海拔公尺數待組員確認）
  // 封面實體是三層黑卡紙：外框（鐳雕樹林草地、中間挖空）→ 彩繪毒菇 → 底層（紋路＋書名鐳雕）；網頁用 img/cover/frame・mush・base-* 疊出來
  // 書是「往上拉」的折頁書：上緣裝訂，一頁頁往上翻，翻上去的背面和下一頁對照
  const BOOKS = [
    { key: 'low', title: '尋野', en: 'Into the Wild', range: '0–1,200 m', sub: '低海拔', color: '#7f9a4a',
      place: '溪澗・草地・平原的毒菇', cover: 'img/cover/cover-low.webp',
      text: '溪澗、竹林、牧場與城市草地。最貼近日常的一冊——公園的綠褶菇、盆栽裡的純黃白鬼傘都在這裡。' },
    { key: 'mid', title: '林間', en: 'Among the Trees', range: '1,200–2,500 m', sub: '中海拔', color: '#3f6b4f',
      place: '闊葉林・霧林・倒木間的毒菇', cover: 'img/cover/cover-mid.webp',
      text: '闊葉林與霧林帶。倒木上的月夜茸、落葉堆裡的光澤粉褶菌，躲在潮濕陰暗的林床。' },
    { key: 'high', title: '登峰', en: 'To the Summit', range: '2,500–3,952 m', sub: '高海拔', color: '#3d4f63',
      place: '針葉林・高山草原・稜線的毒菇', cover: 'img/cover/cover-high.webp',
      text: '針葉林到雪線稜頂。白得發亮的白毒鵝膏、紅白相間的毒蠅鵝膏菌，是登山客最該認得的菇。' }
  ];
  // 卷軸插畫（已完成的頁）
  const ART = [1, 2, 3, 4, 5, 6, 14, 15, 16, 17, 18, 19, 20, 21].map(n => ({ n, src: `${T}img/art/art-${String(n).padStart(2, '0')}.webp` }));
  return { T, TYPES, M, BOOKS, ART, byId: Object.fromEntries(M.map(m => [m.id, m])) };
})();
