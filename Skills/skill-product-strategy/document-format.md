# Document Format: структура, Markdown и опциональный HTML

Как собрать разделы в итоговый документ. **Формат по умолчанию — Markdown (.md).** Интерактивный HTML — опциональный финальный шаг «когда нужен красивый вид», только по запросу пользователя.

---

## Структура документа (карта разделов)

Порядок и группировка разделов одинаковы для MD и HTML:

```
Контекст:
  1. Рынок и тренды            → research-blocks.md
  2. JTBD и пользователи       → users-and-jtbd.md
  3. Конкуренты                → research-blocks.md
  4. Продукт сегодня (as-is)   → product-as-is.md

Стратегия:
  5. Видение и ставка          → vision.md
  6. Стратегические фокусы     → roadmap.md
  7. Дорожная карта            → roadmap.md
  8. Метрики и успех           → metrics.md

Первичные данные:
  ★  Касдев & Наблюдения       → ai-customer-dev.md / product-as-is.md
  ★★ AI-Касдев                 → ai-customer-dev.md

Стратегический выбор:
  A. AI-новички и быстрорастущие → research-blocks.md
  B. Два вижина                  → vision.md
```

---

## Режим по умолчанию: Markdown

Собери документ как единый `.md` со следующими соглашениями:

- **Заголовки** — `#`/`##`/`###` по иерархии разделов выше; оглавление сверху (список ссылок-якорей).
- **Таблицы** — использовать markdown-таблицы (карточки, финкарта, матрица JTBD×конкурент, метрики, риски).
- **Карточки и highlight-блоки** — как блок-цитаты `>` или подзаголовки с выделением; интерактив (сворачивание, «показать ответ») — обычными списками или `<details>`.
- **Теги данных** — `[AI-симуляция]` и `[Первичные данные]` проставляются прямо в ячейках/подписях.
- **Источники** — инлайн `(Источник, месяц год)` + сводный реестр источников в конце (см. [metrics.md](metrics.md)).
- **Имя файла** — `[Продукт]_Product_Strategy.md`.

---

## Опциональный режим: интерактивный HTML

Запускается только если пользователь попросил «красивый вид» / HTML-выгрузку. Один самодостаточный `.html` (все стили и скрипты встроены, без внешних файлов) с фиксированным сайдбаром и переключением разделов.

### Структура и цвета (светлая тема)

```
- Фиксированный левый сайдбар 260px, тёмный (#1E293B) для читаемости навигации
- Основная область: margin-left 260px, padding 32px 40px, max-width 1100px
- Фон страницы #F1F5F9, блоки #FFFFFF, основной текст #1E293B, вторичный #64748B
- Акцент #3B82F6, заголовки #0F172A, границы #E2E8F0, hover строк #F8FAFC
```

### Компоненты

- `.cards` — grid карточек метрик (фон #FFFFFF, box-shadow).
- `.block` — белый блок с тенью и border-radius 12px.
- `.tbl` — таблица с hover, заголовок на #1E293B с белым текстом.
- `.badge` — цветные теги (red / orange / green / blue / purple / gray); использовать и для `[AI-симуляция]` (напр. purple) vs `[Первичные данные]` (green).
- `.insight` — светлые цветные блоки-подсказки.
- `.highlight-box` — градиентный баннер (главный тезис, финальный вывод).
- `.roadmap` — timeline с цветными точками.
- `.focus-card` — карточки стратегических фокусов.

### Базовый CSS (стартовая заготовка)

```css
body { background:#F1F5F9; color:#1E293B; font-family:'Inter',system-ui,sans-serif; }
.sidebar { background:#1E293B; color:#F1F5F9; width:260px; position:fixed; height:100vh; overflow-y:auto; }
.main { margin-left:260px; padding:32px 40px; max-width:1100px; }
.block { background:#FFFFFF; border-radius:12px; padding:24px; margin-bottom:24px;
         box-shadow:0 1px 3px rgba(0,0,0,0.08); border:1px solid #E2E8F0; }
.tbl { width:100%; border-collapse:collapse; }
.tbl th { background:#1E293B; color:#FFFFFF; padding:10px 14px; text-align:left; }
.tbl td { padding:10px 14px; border-bottom:1px solid #E2E8F0; color:#1E293B; }
.tbl tr:hover td { background:#F8FAFC; }
.nav-item { padding:8px 16px; cursor:pointer; border-radius:6px; color:#CBD5E1; }
.nav-item:hover, .nav-item.active { background:#3B82F6; color:#FFFFFF; }
h1, h2, h3 { color:#0F172A; }
```

### Переключение разделов (JS)

```javascript
function show(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + id).classList.add('active');
  el.classList.add('active');
  window.scrollTo(0, 0);
}
```

Механика «показать ответ» в симуляторе интервью ([users-and-jtbd.md](users-and-jtbd.md)) — на этом же паттерне toggle-видимости.

---

## Правила качества (сквозные)

1. **Каждая цифра = свежий источник + дата** `(Источник, месяц год)`. Числа не хардкодятся — ищутся при использовании.
2. **Данные не старше 2 лет** для рынка и конкурентов; возраст помечать датой.
3. **JTBD** — от первого лица, результат-ориентированно.
4. **Касдев = первичные данные** — не смешивать с аналитикой конкурентов.
5. **Синтетика — только с тегом `[AI-симуляция]`**, реальные данные — `[Первичные данные]`; не смешивать в одной ячейке.
6. **Вижины** — реальный выбор с обоснованными плюсами у каждого.
7. **Цитаты** — на языке оригинала, если контекст понятен.
8. **HTML — самодостаточный** (стили и скрипты встроены), но это про артефакт HTML, а не про reference-файлы скилла.
9. **В основном тексте документа** предпочитать карточки, таблицы, цветные блоки спискам-«простыням» (правило оформления финального документа, не reference-файлов).
