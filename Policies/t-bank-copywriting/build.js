const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 't-bank');
const OUTPUT_HTML = path.join(__dirname, 't-bank-copywriting.html');
const ASSETS_DIR = path.join(__dirname, 't-bank-copywriting-assets');

// Порядок разделов
const SECTION_ORDER = [
  'Общие принципы',
  'Как мы пишем',
  'Тон и правила общения',
  'Типографика',
  'Элементы интерфейса',
  'Ошибки'
];

// Маппинг файлов к разделам (по ключевым словам в названии)
const FILE_TO_SECTION = {
  'Полезно': { section: 'Общие принципы', order: 1 },
  'Понятно': { section: 'Общие принципы', order: 2 },
  'Просто': { section: 'Общие принципы', order: 3 },
  
  'Вступление': { section: 'Как мы пишем', order: 1 },
  'Консистентно': { section: 'Как мы пишем', order: 2 },
  'Без повторов': { section: 'Как мы пишем', order: 3 },
  'Без многозначности': { section: 'Как мы пишем', order: 4 },
  'В активном залоге': { section: 'Как мы пишем', order: 5 },
  'Без модальных глаголов': { section: 'Как мы пишем', order: 6 },
  'Без отглагольных': { section: 'Как мы пишем', order: 7 },
  'Пишем точное время': { section: 'Как мы пишем', order: 8 },
  
  'На равных': { section: 'Тон и правила общения', order: 1 },
  'Нейтрально': { section: 'Тон и правила общения', order: 2 },
  
  'Точки': { section: 'Типографика', order: 1 },
  'Тире': { section: 'Типографика', order: 2 },
  'Неразрывные': { section: 'Типографика', order: 3 },
  'Даты': { section: 'Типографика', order: 4 },
  'Валюты': { section: 'Типографика', order: 5 },
  'Числа': { section: 'Типографика', order: 6 },
  'Слова': { section: 'Типографика', order: 7 },
  'Остальные знаки': { section: 'Типографика', order: 8 },
  
  'Заголовки': { section: 'Элементы интерфейса', order: 1 },
  'Кнопки': { section: 'Элементы интерфейса', order: 2 },
  'Лейблы': { section: 'Элементы интерфейса', order: 3 },
  'Списки': { section: 'Элементы интерфейса', order: 4 },
  'Алерты': { section: 'Элементы интерфейса', order: 5 },
  'Тултипы': { section: 'Элементы интерфейса', order: 6 },
  'Тогглы': { section: 'Элементы интерфейса', order: 7 },
  'Лигалы': { section: 'Элементы интерфейса', order: 8 },
  'Экран ввода': { section: 'Элементы интерфейса', order: 9 },
  
  'Ошибки': { section: 'Ошибки', order: 1 }
};

// Создаём папку для ассетов
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Получаем реальные имена файлов
function getRealFiles() {
  const files = fs.readdirSync(SOURCE_DIR);
  return files.filter(f => f.endsWith('.html'));
}

// Определяем раздел для файла
function getFileSection(filename) {
  // Нормализуем для сравнения
  const normalized = filename.normalize('NFC');
  
  for (const [key, value] of Object.entries(FILE_TO_SECTION)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  console.warn(`Не определён раздел для: ${filename}`);
  return null;
}

// Собираем картинки
function copyImages() {
  const files = fs.readdirSync(SOURCE_DIR);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(SOURCE_DIR, file);
    if (fs.statSync(filePath).isDirectory() && file.includes('_files')) {
      const assets = fs.readdirSync(filePath);
      assets.forEach(asset => {
        if (asset.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          const srcPath = path.join(filePath, asset);
          const destPath = path.join(ASSETS_DIR, asset);
          
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
            count++;
          }
        }
      });
    }
  });
  
  console.log(`Скопировано ${count} картинок`);
}

// Извлекаем контент из HTML файла
function extractContent(htmlFile) {
  const filePath = path.join(SOURCE_DIR, htmlFile);
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Ищем контент
  const match = html.match(/<div class="theme-doc-markdown markdown">([\s\S]*?)<\/article>/);
  
  if (!match) {
    console.warn(`Контент не найден в: ${htmlFile}`);
    return null;
  }
  
  let content = match[1];
  
  // Извлекаем заголовок из h1
  const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : '';
  
  // Убираем header
  content = content.replace(/<header>[\s\S]*?<\/header>/, '');
  
  // Находим соответствующую папку _files
  const filesDir = htmlFile.replace('.html', '_files');
  
  // Заменяем пути к картинкам
  content = content.replace(
    /src="\.\/[^"]*_files\/([^"]+)"/g,
    'src="./t-bank-copywriting-assets/$1"'
  );
  
  // Упрощаем классы - оставляем нужные
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
    const classList = classes.split(' ');
    const keepClasses = [];
    
    classList.forEach(c => {
      if (c.startsWith('grid')) keepClasses.push(c);
      else if (c === 'note-container') keepClasses.push(c);
      // Важен порядок! Сначала более специфичные
      else if (c.startsWith('cardTableCell')) keepClasses.push('card-cell');
      else if (c.startsWith('cardTableRow')) keepClasses.push('card-row');
      else if (c.startsWith('cardTable_')) keepClasses.push('card-table');
      else if (c.startsWith('statusContainer')) keepClasses.push('status');
    });
    
    // Убираем дубликаты
    const unique = [...new Set(keepClasses)];
    return unique.length ? `class="${unique.join(' ')}"` : '';
  });
  
  // Убираем якорные ссылки
  content = content.replace(/<a[^>]*hash-link[^>]*>[\s\S]*?<\/a>/g, '');
  
  // Чистим inline стили (кроме размеров картинок)
  content = content.replace(/\s+style="[^"]*width:\s*24px[^"]*"/g, ' class="icon"');
  content = content.replace(/\s+style="[^"]*"/g, '');
  
  // Убираем SVG иконки
  content = content.replace(/<svg[\s\S]*?<\/svg>/g, '');
  content = content.replace(/<span[^>]*data-qa-type[^>]*>[\s\S]*?<\/span>/g, '');
  
  // Чистим пустые div'ы (но сохраняем структуру grid)
  content = content.replace(/<div>\s*<\/div>/g, '');
  
  return { title, content };
}

// Генерируем HTML
function generateHTML() {
  const files = getRealFiles();
  
  // Группируем файлы по разделам
  const sections = {};
  SECTION_ORDER.forEach(s => sections[s] = []);
  
  files.forEach(file => {
    const info = getFileSection(file);
    if (info) {
      const data = extractContent(file);
      if (data) {
        sections[info.section].push({
          ...data,
          order: info.order,
          file
        });
      }
    }
  });
  
  // Сортируем внутри разделов
  Object.keys(sections).forEach(s => {
    sections[s].sort((a, b) => a.order - b.order);
  });
  
  // Генерируем HTML
  let sectionsHtml = '';
  
  SECTION_ORDER.forEach(sectionTitle => {
    const articles = sections[sectionTitle];
    if (articles.length === 0) return;
    
    sectionsHtml += `
    <section class="section">
      <h2 class="section-title">${sectionTitle}</h2>
`;
    
    articles.forEach(({ title, content }) => {
      sectionsHtml += `
      <article class="article">
        <h3>${title}</h3>
        ${content}
      </article>
`;
    });
    
    sectionsHtml += `    </section>
`;
  });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Редполитика интерфейсов — Т-Банк</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
      padding: 40px 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    header {
      margin-bottom: 3rem;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #000;
    }
    
    .subtitle {
      font-size: 1.1rem;
      color: #666;
    }
    
    .section {
      margin-bottom: 3rem;
    }
    
    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #000;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #ffdd2d;
    }
    
    .article {
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }
    
    .article:last-child {
      border-bottom: none;
    }
    
    .article > h3 {
      font-size: 1.35rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: #000;
    }
    
    h2:not(.section-title) {
      font-size: 1.15rem;
      font-weight: 500;
      margin: 1.5rem 0 0.75rem;
      color: #333;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
    
    li p {
      margin-bottom: 0.25rem;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 0.5rem 0;
    }
    
    img.icon {
      width: 24px;
      height: 24px;
      vertical-align: middle;
      margin-right: 8px;
      border-radius: 0;
      flex-shrink: 0;
    }
    
    /* Контейнер с иконкой и подписью */
    .grid-col--2 > div > div > div {
      display: flex;
      align-items: flex-start;
      margin-top: 0.5rem;
    }
    
    .grid-col--2 > div > div > div p {
      margin: 0;
      font-size: 15px;
    }
    
    /* Текстовые таблицы сравнения */
    .card-table {
      background: #f9f9f9;
      border-radius: 12px;
      padding: 1.25rem;
      margin: 1rem 0;
    }
    
    .card-row {
      display: flex;
      gap: 1.5rem;
    }
    
    .card-row + .card-row {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e5e5e5;
    }
    
    .card-cell {
      flex: 1;
      min-width: 0;
    }
    
    /* Ячейки со статусами в заголовочной строке */
    .card-row:first-child .card-cell:has(.status) {
      flex: 1;
    }
    
    .card-cell h4 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0 0 0.25rem 0;
    }
    
    .card-cell p {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      color: #444;
    }
    
    .card-cell ul {
      margin: 0;
      padding-left: 1.25rem;
    }
    
    .card-cell li {
      margin-bottom: 0.25rem;
    }
    
    .card-cell li p {
      margin: 0;
    }
    
    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status img {
      width: 24px;
      height: 24px;
      border-radius: 0;
      margin: 0;
      flex-shrink: 0;
    }
    
    .status p {
      margin: 0;
      font-weight: 500;
      font-size: 0.9rem;
      white-space: nowrap;
    }
    
    @media (max-width: 640px) {
      .card-row {
        flex-direction: column;
        gap: 1rem;
      }
      
      .card-cell:first-child:has(.status) {
        min-width: auto;
      }
    }
    
    .grid {
      display: grid;
      gap: 1.5rem;
      margin: 1.5rem 0;
    }
    
    .grid-col--2 {
      grid-template-columns: repeat(2, 1fr);
      align-items: start;
    }
    
    .grid-col--2 > div {
      display: flex;
      flex-direction: column;
    }
    
    .grid-col--2 > div > div {
      display: flex;
      flex-direction: column;
    }
    
    .grid-col--2 img:not(.icon) {
      width: 100%;
      height: auto;
      margin-bottom: 0.5rem;
    }
    
    @media (max-width: 640px) {
      .grid-col--2 {
        grid-template-columns: 1fr;
      }
      
      body {
        padding: 20px 15px;
      }
      
      h1 {
        font-size: 2rem;
      }
    }
    
    .note-container {
      background: #f0f7ff;
      border-left: 4px solid #428BF9;
      padding: 1rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin: 1rem 0;
    }
    
    .note-container p {
      margin: 0;
    }
    
    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    th {
      font-weight: 500;
      background: #f9f9f9;
    }
    
    footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 0.9rem;
    }
    
    footer a {
      color: #428BF9;
      text-decoration: none;
    }
    
    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <h1>Редполитика интерфейсов</h1>
    <p class="subtitle">Т-Банк — Руководство по написанию текстов в интерфейсах</p>
  </header>
  
  <main>${sectionsHtml}
  </main>
  
  <footer>
    <p>Источник: <a href="https://design.tbank.ru/docs/Редполитика%20интерфейсов/">design.tbank.ru</a></p>
    <p>© ${new Date().getFullYear()} Т-Банк</p>
  </footer>
</body>
</html>`;
  
  return html;
}

// Запуск
console.log('Копирую картинки...');
copyImages();

console.log('Генерирую HTML...');
const html = generateHTML();

fs.writeFileSync(OUTPUT_HTML, html, 'utf-8');
console.log(`\nГотово!`);
console.log(`HTML: ${OUTPUT_HTML}`);
console.log(`Ассеты: ${ASSETS_DIR}`);
