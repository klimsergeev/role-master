// Вычисленные стили страницы для мудборда — для javascript_tool расширения Claude in Chrome.
//
// Где выполнять: на открытой странице источника после загрузки и прокрутки.
// Что делает: обходит до 4000 видимых элементов, взвешивает цвет фона по площади элемента,
// цвет текста и шрифт — по числу текстовых узлов, цвет рамки — по числу элементов с рамкой.
// Возвращает до 6 фонов, 6 цветов текста, 4 цветов рамок, 6 пар «шрифт вес», og:image и заголовок.
// Акцент автоматически не выделяется: его ищут глазами по кнопкам и ссылкам на снимке.
// Поле og_image может вернуться как [BLOCKED: …], если в ссылке есть строка запроса;
// для поиска исходников картинок оно не используется.
//
// Это та же функция, что STYLES_JS в scripts/capture.py, оформленная как самовызывающаяся.

(() => {
 const toHex = v => { const m = v.match(/rgba?\(([^)]+)\)/); if(!m) return null;
   const p = m[1].split(',').map(s=>parseFloat(s)); if (p.length===4 && p[3] < 0.9) return null;
   return '#' + p.slice(0,3).map(n=>Math.round(n).toString(16).padStart(2,'0')).join('').toUpperCase(); };
 const bg={}, fg={}, border={}, fonts={};
 for (const e of [...document.querySelectorAll('body *')].slice(0,4000)) {
   const r = e.getBoundingClientRect(); const a = r.width*r.height; if (a < 1) continue;
   const s = getComputedStyle(e);
   const b = toHex(s.backgroundColor); if (b) bg[b]=(bg[b]||0)+a;
   const hasText = [...e.childNodes].some(n=>n.nodeType===3 && n.textContent.trim());
   if (hasText) { const c = toHex(s.color); if (c) fg[c]=(fg[c]||0)+1;
     const f = s.fontFamily.split(',')[0].replace(/["']/g,'') + ' ' + s.fontWeight;
     fonts[f]=(fonts[f]||0)+1; }
   if (parseFloat(s.borderTopWidth) > 0) { const c = toHex(s.borderTopColor); if (c) border[c]=(border[c]||0)+1; }
 }
 const top = (o,n) => Object.entries(o).sort((x,y)=>y[1]-x[1]).slice(0,n).map(([k,v])=>({value:k, weight:Math.round(v)}));
 return { backgrounds: top(bg,6), text: top(fg,6), borders: top(border,4), fonts: top(fonts,6),
          og_image: document.querySelector('meta[property="og:image"]')?.content || null,
          title: document.title };
})()
