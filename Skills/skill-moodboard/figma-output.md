# Создание мудборда в Figma

## Назначение

Процедура создания мудборда как Figma-фрейма на указанной пользователем странице. Может быть единственным форматом выдачи (если пользователь явно указал «делай в Figma») или дополнением к markdown.

## Когда использовать

- Пользователь предоставил ссылку на Figma-страницу для мудборда
- Пользователь явно попросил создать мудборд в Figma
- Пользователь хочет и markdown, и Figma одновременно

## Предварительные требования

- **Remote MCP обязателен.** Write-операции (use_figma, generate_figma_design) работают только через Remote MCP, не Desktop
- **Edit permission** на целевой Figma-файл
- **Full Design seat** (не Viewer)
- fileKey и nodeId из URL пользователя

**Проверка доступа:**
- Вызвать `whoami` для подтверждения подключения и определения плана
- ЕСЛИ нет Remote MCP или нет Edit permission -> сообщить пользователю, предложить markdown-выдачу как альтернативу

## Процедура создания

### Подготовка данных

Перед созданием фрейма в Figma мудборд должен быть уже сформирован (элементы извлечены, палитра собрана, типографика определена). Процедура формирования — в [moodboard-workflow.md](moodboard-workflow.md).

Что должно быть готово:
- Палитра: hex-коды для всех ролей (primary, secondary, accent, background, text)
- Типографика: названия шрифтов, веса
- UI-паттерны: список с описаниями
- Ключевые слова настроения
- Источники вдохновения

### Загрузка Figma Skill

**ОБЯЗАТЕЛЬНО** перед вызовом `use_figma` или `generate_figma_design`:
- Загрузить Figma Skill `/figma-generate-design` (для generate_figma_design) или `/figma-use` (для use_figma)
- Следовать инструкциям из загруженного skill
- Указать `skillNames` при вызове инструмента

Это требование Figma MCP — без загрузки skill результат непредсказуем.

### Структура мудборд-фрейма

Мудборд в Figma создаётся как фрейм с секциями:

**Основной фрейм:**
- Имя: `Moodboard — [Название проекта]`
- Ширина: 1440px (стандартная десктопная ширина)
- Auto Layout: vertical, gap 48px, padding 64px
- Фон: белый (#FFFFFF) или светло-серый (#F8FAFC)

**Секция «Палитра»:**
- Заголовок секции
- Ряд цветных прямоугольников (по одному на роль)
- Под каждым — текст с hex-кодом и названием роли
- Размер прямоугольника: 120x120px, радиус 12px

**Секция «Типографика»:**
- Заголовок секции
- Примеры текста: headline-шрифтом (крупный), body-шрифтом (обычный)
- Под каждым — название шрифта и вес

**Секция «Ключевые слова»:**
- Заголовок секции
- Ключевые слова в виде текстовых блоков или «тегов»

**Секция «UI-паттерны»:**
- Заголовок секции
- Текстовые описания паттернов (или скриншоты, если доступны)

**Секция «Источники»:**
- Заголовок секции
- Список источников с URL

### Выбор инструмента

| Сценарий | Инструмент | Когда |
|---|---|---|
| Создание фрейма с элементами | `use_figma` | Основной способ — полный контроль над структурой |
| Захват HTML-мудборда в Figma | `generate_figma_design` | Если уже есть HTML-версия мудборда |

**Рекомендация:** использовать `use_figma` — он даёт полный контроль над структурой, именами слоёв, auto layout и стилями.

### Создание через use_figma

Порядок действий:
- Загрузить `/figma-use` skill
- Подготовить JavaScript-код для Plugin API
- Создать основной фрейм с auto layout
- Добавить секции по одной (палитра, типографика, ключевые слова, паттерны, источники)
- Проверить результат через `get_screenshot`

**Принципы JavaScript-кода:**
- Использовать `figma.createFrame()` для контейнеров
- `figma.createRectangle()` для цветных блоков палитры
- `figma.createText()` для текстовых элементов
- Перед созданием текста — загрузить шрифт через `figma.loadFontAsync()`
- Использовать auto layout (`layoutMode`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `itemSpacing`, `paddingTop/Bottom/Left/Right`)
- Задавать осмысленные имена слоям (`frame.name = "Color Palette"`)

**Ограничения:**
- Rate limits на Remote MCP (15 вызовов/мин для Pro, 20/мин для Enterprise)
- Шрифты должны быть доступны в Figma (Google Fonts доступны по умолчанию, кастомные — только если загружены в организацию)
- ЕСЛИ шрифт недоступен -> использовать Inter как fallback, указать в комментарии

### Создание через generate_figma_design

Альтернативный путь — если есть HTML-версия мудборда:
- Загрузить `/figma-generate-design` skill (ОБЯЗАТЕЛЬНО)
- Подготовить HTML-страницу с мудбордом
- Вызвать `generate_figma_design` с `outputMode: "existingFile"`, указав fileKey и nodeId
- Polling каждые 5 сек до status "completed"
- Проверить результат через `get_screenshot`

**Когда предпочтительнее:** если мудборд содержит скриншоты или сложную визуальную разметку, которую проще создать в HTML, чем через Plugin API.

### Проверка результата

После создания:
- Вызвать `get_screenshot` для визуальной проверки
- Показать скриншот пользователю
- Спросить, нужны ли корректировки
- ЕСЛИ нужны -> итерировать через `use_figma`

---

## Визуальные мокапы (для тематических коллекций)

Для тематических коллекций паттернов (FOMO, онбординг, empty states и т.п.) текстовые описания недостаточны — пользователь ожидает визуальные примеры. Три способа создания визуальных мокапов в Figma:

### Мокапы через use_figma (основной способ)

Создание простых UI-компонентов прямо в Figma через Plugin API. Подходит для: бейджей, плашек, таймеров, нотификаций, прогресс-баров, тегов.

**Процедура:**
- Для каждого паттерна из коллекции создать визуальный мокап — упрощённый, но узнаваемый
- Мокап = фрейм с фоном, текстом, иконкой (прямоугольник/круг как placeholder), корректными цветами
- НЕ пытаться создать pixel-perfect копию — цель: передать суть паттерна визуально
- Загрузить шрифты перед использованием (`figma.loadFontAsync`)
- Группировать мокапы по категориям (отдельный фрейм на категорию)

**Элементы, доступные через Plugin API:**
- `figma.createFrame()` — контейнер с auto layout, фоном, скруглением
- `figma.createRectangle()` — цветные блоки, placeholder для иконок
- `figma.createEllipse()` — точки, индикаторы, круглые аватары
- `figma.createText()` — текст бейджа, таймера, нотификации
- `figma.createLine()` — разделители, зачёркивание цены (strikethrough)

**Пример: FOMO-бейдж "Осталось мало"**

```javascript
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// Контейнер бейджа
const badge = figma.createFrame();
badge.name = "FOMO Badge — Low Stock";
badge.layoutMode = "HORIZONTAL";
badge.itemSpacing = 6;
badge.paddingTop = badge.paddingBottom = 6;
badge.paddingLeft = badge.paddingRight = 10;
badge.cornerRadius = 6;
badge.fills = [{ type: "SOLID", color: { r: 0.996, g: 0.945, b: 0.945 } }]; // #FEF2F2

// Иконка-placeholder (красный круг вместо fire emoji)
const icon = figma.createEllipse();
icon.resize(14, 14);
icon.fills = [{ type: "SOLID", color: { r: 0.937, g: 0.267, b: 0.267 } }]; // #EF4444
badge.appendChild(icon);

// Текст бейджа
const text = figma.createText();
text.characters = "Осталось 2 шт.";
text.fontSize = 12;
text.fontName = { family: "Inter", style: "Bold" };
text.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.106, b: 0.106 } }]; // #991B1B
badge.appendChild(text);
```

**Пример: Countdown timer**

```javascript
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// Контейнер таймера
const timer = figma.createFrame();
timer.name = "FOMO — Countdown Timer";
timer.layoutMode = "HORIZONTAL";
timer.itemSpacing = 4;
timer.paddingTop = timer.paddingBottom = 8;
timer.paddingLeft = timer.paddingRight = 12;
timer.cornerRadius = 8;
timer.fills = [{ type: "SOLID", color: { r: 0.975, g: 0.451, b: 0.086 } }]; // #F97316

// Цифры таймера
const digits = figma.createText();
digits.characters = "02 : 14 : 37";
digits.fontSize = 18;
digits.fontName = { family: "Inter", style: "Bold" };
digits.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; // #FFFFFF
timer.appendChild(digits);

// Подпись
const label = figma.createText();
label.characters = "до конца акции";
label.fontSize = 11;
label.fontName = { family: "Inter", style: "Regular" };
label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
timer.appendChild(label);
```

### Скриншоты Figma-нод через get_screenshot

ЕСЛИ источник мудборда — Figma-макет, можно сделать скриншот конкретной ноды и показать пользователю как визуальный референс.

**Процедура:**
- Вызвать `get_screenshot` с fileKey и nodeId конкретного компонента
- Показать пользователю скриншот в контексте мудборда
- Подписать: «Референс из [имя файла/источник]»

**Ограничение:** Скриншот нельзя программно вставить в другой Figma-файл через Plugin API. Используется для показа пользователю в чате, не для Figma-фрейма мудборда.

### HTML-мокапы через generate_figma_design

ЕСЛИ паттерны проще описать в HTML/CSS (сложная вёрстка, градиенты, анимации), можно создать HTML-мокап и конвертировать в Figma.

**Процедура:**
- Загрузить `/figma-generate-design` skill (ОБЯЗАТЕЛЬНО)
- Подготовить HTML-страницу с мокапами паттернов: каждый паттерн как отдельный блок с реальными цветами, шрифтами, размерами
- Вызвать `generate_figma_design` с `outputMode: "existingFile"`, указав fileKey и nodeId целевой страницы
- Polling каждые 5 сек до status "completed"
- Проверить результат через `get_screenshot`

**Когда предпочтительнее use_figma:**
- Мокапы содержат сложные CSS-эффекты (градиенты, box-shadow, backdrop-blur)
- Много текстового контента с разнообразной вёрсткой
- Нужны SVG-иконки (проще вставить в HTML, чем рисовать через Plugin API)

**Когда предпочтительнее use_figma (а не HTML):**
- Нужен полный контроль над именами слоёв и структурой
- Мокапы простые (прямоугольник + текст + цвет)
- Нужна возможность итеративной правки отдельных элементов

### Структура Figma-фрейма для тематической коллекции

Отличается от стандартного мудборд-фрейма — организация по категориям паттернов вместо «палитра -> типографика -> паттерны»:

**Основной фрейм:**
- Имя: `Pattern Collection — [Название темы]`
- Ширина: 1440px
- Auto Layout: vertical, gap 64px, padding 64px
- Фон: белый (#FFFFFF) или светло-серый (#F8FAFC)

**Секция заголовка:**
- Название темы (крупный заголовок)
- Краткое описание: что за паттерны, сколько категорий

**Секция категории (повторяется для каждой категории):**
- Заголовок категории
- Фрейм с мокапами: horizontal layout, gap 24px — визуальные мокапы паттернов в ряд
- Под каждым мокапом — текстовое описание (название паттерна, контекст использования, источник)

**Секция «Визуальные константы»:**
- Ряд цветов (как в стандартной палитре, но с ролями, специфичными для темы: urgency red, success green)
- Типографические наблюдения

**Секция «Do / Don't»:**
- Два столбца или два блока: зелёный (do) и красный (don't)
- Текстовые описания правил

**Секция «Источники»:**
- Список URL

---

## Итерация мудборда в Figma

При корректировках после ревью:
- Использовать `use_figma` для точечных изменений (замена цвета, текста, шрифта)
- НЕ пересоздавать весь фрейм — менять конкретные элементы
- После каждой итерации — `get_screenshot` для проверки

---

## Что НЕ делать

- НЕ вызывать `use_figma` без загрузки `/figma-use` skill
- НЕ вызывать `generate_figma_design` без загрузки `/figma-generate-design` skill
- НЕ создавать мудборд в Figma через Desktop MCP — write-операции только через Remote
- НЕ предполагать Edit permission — проверять через `whoami`
- НЕ использовать hardcoded hex-цвета, если в файле есть дизайн-система с токенами — проверить через `search_design_system`
- НЕ создавать весь мудборд одним вызовом `use_figma` — разбить на секции для управляемости
- НЕ игнорировать rate limits — планировать вызовы

---

## Пример: JavaScript для секции палитры

```javascript
// Пример структуры для use_figma — секция палитры
// Загрузить шрифт перед использованием
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

const palette = figma.createFrame();
palette.name = "Color Palette";
palette.layoutMode = "VERTICAL";
palette.itemSpacing = 24;
palette.paddingTop = palette.paddingBottom = 32;
palette.paddingLeft = palette.paddingRight = 32;

// Заголовок
const title = figma.createText();
title.characters = "Палитра";
title.fontSize = 24;
title.fontName = { family: "Inter", style: "Bold" };
palette.appendChild(title);

// Ряд цветов
const row = figma.createFrame();
row.name = "Colors Row";
row.layoutMode = "HORIZONTAL";
row.itemSpacing = 16;
palette.appendChild(row);

// Пример одного цвета
const colorBlock = figma.createFrame();
colorBlock.name = "Primary #2563EB";
colorBlock.layoutMode = "VERTICAL";
colorBlock.itemSpacing = 8;

const swatch = figma.createRectangle();
swatch.resize(120, 120);
swatch.cornerRadius = 12;
swatch.fills = [{ type: "SOLID", color: { r: 0.145, g: 0.388, b: 0.922 } }];
colorBlock.appendChild(swatch);

const label = figma.createText();
label.characters = "Primary\n#2563EB";
label.fontSize = 14;
label.fontName = { family: "Inter", style: "Regular" };
colorBlock.appendChild(label);

row.appendChild(colorBlock);
// Повторить для остальных цветов...
```

Этот код иллюстративный — адаптировать под конкретные данные мудборда при каждом вызове.
