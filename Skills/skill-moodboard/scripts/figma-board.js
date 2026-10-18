// Каркас доски мудборда для use_figma (перед вызовом загрузить /figma-use).
//
// Строит шапку, группы с заголовками и кладку колонками одинаковой ширины: каждая карточка —
// пустой прямоугольник пропорций картинки и подпись «номер · что взять» + «продукт · источник ·
// метка» со ссылкой на страницу-источник. Картинки в прямоугольники ставит upload_assets с nodeIds.
// Возвращает { boardId, map, createdNodeIds }: map — соответствие «номер карточки → id прямоугольника»,
// из него берутся nodeIds для upload_assets.
//
// Как вызывать:
// - не больше 12 карточек за вызов;
// - первый вызов: BOARD_ID = null — создаётся доска с шапкой; boardId из ответа подставляется
//   в следующие вызовы;
// - группа, которая уже есть на доске (совпало имя), продолжается: колонки находятся на доске,
//   их высоты дочитываются, новые карточки идут в самую короткую колонку;
// - MISSING заполняется в последнем вызове: блок «Чего не нашлось» встаёт в конец доски
//   и остаётся последним при следующих вызовах.
//
// Ядро — цикл по группам и карточкам — отработало на досках из 48 и 24 картинок.
// Создание доски с шапкой, продолжение группы, метка и пометка в подписи, блок «Чего не нашлось»
// добавлены поверх него и в таком виде не запускались: после первого вызова проверять доску
// через get_screenshot.

const PAGE_ID = "<id страницы>";
const BOARD_ID = null; // null — первый вызов; дальше — boardId из ответа
const HEADER = { title: "Moodboard — <тема> v1", about: "<задача в одну-две фразы>", origin: "<откуда картинки>" };
const COLS = 4, COL_W = 300, GAP = 20; // направление — 4 колонки по 300, коллекция паттернов — 3 по 360
const groups = [ { title: "<группа>", items: [ { n: 1, w: 500, h: 790, take: "<что взять>", prod: "<продукт или автор>", src: "<домен>", url: "<страница-источник>", label: "поиск картинок", note: "" } ] } ];
const MISSING = []; // строки блока «Чего не нашлось»

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
const W = COLS * COL_W + (COLS - 1) * GAP;
const addText = (parent, chars, size, style, width) => {
  const t = figma.createText(); t.fontName = { family: "Inter", style: style }; t.fontSize = size; t.characters = chars;
  if (width) { t.resize(width, t.height); t.textAutoResize = "HEIGHT"; }
  parent.appendChild(t); return t;
};

let board;
if (BOARD_ID) {
  board = await figma.getNodeByIdAsync(BOARD_ID);
} else {
  board = figma.createAutoLayout("VERTICAL", { name: HEADER.title, itemSpacing: 64 });
  board.paddingTop = board.paddingBottom = board.paddingLeft = board.paddingRight = 64;
  board.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  page.appendChild(board);
  const head = figma.createAutoLayout("VERTICAL", { name: "Шапка", itemSpacing: 12 }); head.fills = []; board.appendChild(head);
  addText(head, HEADER.title, 40, "Semi Bold");
  addText(head, HEADER.about, 18, "Regular", W);
  addText(head, HEADER.origin, 14, "Regular", W);
}

const map = {}, created = [];
for (const g of groups) {
  let sec = board.children.find(c => c.name === g.title);
  let cols, heights;
  if (sec) {
    const row = sec.children.find(c => c.name === "Columns");
    cols = [...row.children]; heights = cols.map(c => c.height);
  } else {
    sec = figma.createAutoLayout("VERTICAL", { name: g.title, itemSpacing: 20 }); sec.fills = []; board.appendChild(sec);
    const h = figma.createText(); h.fontName = { family: "Inter", style: "Semi Bold" }; h.fontSize = 26; h.characters = g.title; sec.appendChild(h);
    const row = figma.createAutoLayout("HORIZONTAL", { name: "Columns", itemSpacing: GAP }); row.fills = []; sec.appendChild(row);
    cols = []; heights = [];
    for (let i = 0; i < COLS; i++) { const c = figma.createAutoLayout("VERTICAL", { name: "Col " + (i + 1), itemSpacing: GAP }); c.fills = []; row.appendChild(c); cols.push(c); heights.push(0); }
  }
  for (const it of g.items) {
    const imgH = Math.round(COL_W * it.h / it.w);
    const card = figma.createAutoLayout("VERTICAL", { name: String(it.n).padStart(2, "0") + " · " + it.prod, itemSpacing: 6 }); card.fills = [];
    const k = heights.indexOf(Math.min(...heights)); cols[k].appendChild(card); heights[k] += imgH + 70 + GAP;
    const img = figma.createRectangle(); img.name = "img-" + it.n; img.resize(COL_W, imgH); img.cornerRadius = 6;
    img.strokes = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.9 } }]; img.strokeWeight = 1;
    img.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.96 } }]; card.appendChild(img);
    const cap = figma.createText(); cap.fontName = { family: "Inter", style: "Regular" }; cap.fontSize = 13;
    const a = String(it.n).padStart(2, "0") + " · " + it.take; const b = "\n" + it.prod + " · " + it.src + " · " + it.label + (it.note ? " · " + it.note : "");
    cap.characters = a + b; cap.resize(COL_W, cap.height); cap.textAutoResize = "HEIGHT";
    cap.setRangeFontName(0, a.length, { family: "Inter", style: "Semi Bold" });
    const s0 = a.length + 1 + it.prod.length + 3; cap.setRangeHyperlink(s0, s0 + it.src.length, { type: "URL", value: it.url });
    card.appendChild(cap); map[it.n] = img.id; created.push(card.id);
  }
}

let miss = board.children.find(c => c.name === "Чего не нашлось");
if (MISSING.length) {
  if (miss) miss.remove();
  miss = figma.createAutoLayout("VERTICAL", { name: "Чего не нашлось", itemSpacing: 8 }); miss.fills = [];
  addText(miss, "Чего не нашлось", 26, "Semi Bold");
  addText(miss, MISSING.map(s => "— " + s).join("\n"), 16, "Regular", W);
  board.appendChild(miss);
} else if (miss) {
  board.appendChild(miss);
}

return { boardId: board.id, map, createdNodeIds: created };
