// Кандидаты для мудборда из выдачи картинок Google — для javascript_tool расширения Claude in Chrome.
//
// Где выполнять: на странице https://www.google.com/search?q=<запрос>&udm=2 после загрузки.
// Что делает: в HTML выдачи лежат массивы вида ["<исходник>",<число>,<число>], а через
// несколько сотен символов после — ссылка на страницу-источник. Скрипт собирает пары
// «исходник, страница-источник», складывает их в window.__q и возвращает первые 25.
// Следующие части: window.__q.slice(25, 50), window.__q.slice(50, 75) и т. д. —
// длинный ответ javascript_tool обрезается.
// Строка запроса у ссылок отрезается до возврата: значение со строкой запроса или
// похожее на токен расширение блокирует целиком.
// Превью Google (gstatic) отбрасываются. Размеры из выдачи не возвращаются: порядок чисел
// в массиве ненадёжен, размеры берутся из скачанного файла.

window.__grab = () => {
  const html = document.documentElement.innerHTML;
  const re = /\["(https?:\/\/[^"]+?\.(?:jpe?g|png|webp))",(\d+),(\d+)\]/gi;
  const strip = u => { try { const x = new URL(u.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')); return x.origin + x.pathname } catch (e) { return null } };
  const out = []; const seen = new Set(); let m;
  while ((m = re.exec(html))) {
    const img = strip(m[1]); if (!img || img.includes('gstatic') || seen.has(img)) continue; seen.add(img);
    const tail = html.slice(m.index + m[0].length, m.index + m[0].length + 4000);
    const pm = [...tail.matchAll(/"(https?:\/\/[^"]+)"/g)].map(x => strip(x[1]))
      .filter(u => u && !/\.(jpe?g|png|webp|gif)$/i.test(u) && !/google|gstatic/.test(u));
    out.push([img, pm[0] || '']);
  }
  return out;
};
window.__q = window.__grab(); window.__q.slice(0, 25)
