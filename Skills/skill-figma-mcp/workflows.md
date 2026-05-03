# Workflows

## Назначение

Типичные задачи при работе с Figma MCP: от вёрстки по макету до pixel-perfect проверки и handoff. Содержит пошаговые алгоритмы и общие правила.

## Общие правила

- ЕСЛИ nodeId не указан -> используется текущий выделенный элемент (Desktop)
- ЕСЛИ nodeId в URL формате (node-id=1-2) -> преобразовать в формат "1:2"
- ЕСЛИ URL содержит branch -> использовать branchKey как fileKey
- ЕСЛИ нужны write-операции -> проверить Edit permission
- ВСЕГДА указывать clientFrameworks и clientLanguages для точных результатов
- ВСЕГДА сначала проверять подключение (Desktop: `get_design_context`, Remote: `whoami`)

---

## 1. Сверстать компонент по макету [D+R]

**Инструменты:** `get_screenshot` + `get_design_context`

1. Попросить пользователя выделить элемент в Figma (Desktop) или получить fileKey+nodeId (Remote)
2. Вызвать `get_screenshot` для визуального понимания
3. Вызвать `get_design_context` с `clientFrameworks` и `clientLanguages`
4. Адаптировать полученный код под стек проекта (фреймворк, токены, компоненты)

---

## 2. Узнать структуру макета [D+R]

**Инструменты:** `get_metadata`

1. Вызвать `get_metadata` для страницы или frame
2. Проанализировать XML-структуру
3. Найти нужные элементы по именам/ID

---

## 3. Получить токены дизайн-системы [D+R]

**Инструменты:** `get_variable_defs`

1. Вызвать `get_variable_defs`
2. Преобразовать в нужный формат (Tailwind config, CSS variables, SCSS)
3. Интегрировать в проект

---

## 4. Связать Figma-компоненты с кодом (Code Connect) [D+R]

**Инструменты:** `get_code_connect_map` -> `get_code_connect_suggestions` -> `add_code_connect_map`

1. Проверить существующие маппинги через `get_code_connect_map`
2. Получить предложения через `get_code_connect_suggestions`
3. Добавить маппинги через `add_code_connect_map` или `send_code_connect_mappings`

**Альтернатива:** Code Connect UI — in-app маппинг в Figma (не требует CLI).

---

## 5. Создать правила дизайн-системы [D+R]

**Инструменты:** `create_design_system_rules` + `get_variable_defs`

1. Вызвать `create_design_system_rules` для получения промпта
2. Вызвать `get_variable_defs` для токенов
3. Создать .mdc файл с правилами

---

## 6. Создать элементы на canvas [R]

**Инструменты:** `search_design_system` -> `use_figma`

1. Вызвать `search_design_system` для проверки существующих компонентов
2. ЕСЛИ компонент найден -> использовать `importComponentByKeyAsync`
3. ЕСЛИ не найден -> создать через `use_figma`
4. Проверить Edit permission на файл

**Требования:** Edit permission, Full seat. Загрузить `/figma-use` skill перед вызовом.

---

## 7. Захватить live UI в Figma [R]

**Инструменты:** `generate_figma_design`

1. Вызвать `generate_figma_design` без captureId для инструкций
2. Выбрать outputMode (newFile/existingFile/clipboard)
3. Получить captureId
4. Polling каждые 5 сек до completion

---

## 8. Создать диаграмму [R]

**Инструменты:** `generate_diagram`

1. Получить описание диаграммы от пользователя
2. Сгенерировать Mermaid-синтаксис
3. Вызвать `generate_diagram`
4. Вернуть URL созданной диаграммы

---

## 9. Поиск компонентов в дизайн-системе [R]

**Инструменты:** `search_design_system`

1. Вызвать `search_design_system` с query
2. Проанализировать результаты
3. Использовать найденные компоненты через import

---

## 10. Создать элементы на FigJam-борде [R]

**Инструменты:** `use_figma`

1. Определить fileKey FigJam-файла
2. Загрузить `/figma-use-figjam` skill
3. Вызвать `use_figma` с FigJam-операциями (stickies, sections, connectors и т.д.)
4. Использовать `skillNames: ["figma-use-figjam"]`

**Требования:** Edit permission, Full seat.

---

## 11. Суммаризировать FigJam-борд [D+R]

**Инструменты:** `get_figjam`

1. Вызвать `get_figjam` с fileKey и `includeImagesOfNodes=true`
2. Проанализировать структуру (sticky notes, sections, connections)
3. Сформировать саммари с инсайтами и next steps

---

## 12. Загрузить изображения в Figma [R]

**Инструменты:** `upload_assets`

1. Вызвать `upload_assets` с fileKey и count
2. Получить upload URL из ответа
3. POST raw bytes с Content-Type на upload URL
4. Указать scaleMode при необходимости (FILL/FIT/CROP/TILE)

---

## 13. Просмотреть библиотеки файла [R]

**Инструменты:** `get_libraries`

1. Вызвать `get_libraries` с fileKey
2. Проанализировать subscribed и available библиотеки
3. Для больших организаций использовать offset для пагинации

---

## 14. Responsive верстка по макету [D+R]

**Инструменты:** `get_screenshot` + `get_design_context` + `get_metadata`

1. Получить макеты для 3 breakpoints (mobile, tablet, desktop) — обычно отдельные frames
2. Для каждого breakpoint: `get_screenshot` + `get_design_context`
3. Через `get_metadata` сравнить структуру между breakpoints
4. Сгенерировать responsive код с media queries / container queries
5. Проверить: общие компоненты переиспользуются, различия только в layout

---

## 15. Tokens -> CSS Custom Properties / SCSS [D+R]

**Инструменты:** `get_variable_defs`

1. Вызвать `get_variable_defs` для получения всех токенов
2. Преобразовать в целевой формат:
   - **CSS Custom Properties:** `--color-primary: #3B82F6;`
   - **SCSS variables:** `$color-primary: #3B82F6;`
   - **Tailwind config:** `colors: { primary: '#3B82F6' }`
3. Сгруппировать по категориям (colors, spacing, typography, shadows)
4. Создать файл токенов в проекте

---

## 16. Компонентный подход (Figma component = код-компонент) [D+R]

**Инструменты:** `get_metadata` + `get_design_context` + `get_code_connect_map`

1. Через `get_metadata` определить иерархию компонентов в макете
2. Через `get_code_connect_map` проверить, какие компоненты уже замаплены
3. Для каждого Figma-компонента:
   - ЕСЛИ есть Code Connect -> использовать существующий код-компонент
   - ЕСЛИ нет -> вызвать `get_design_context` и создать новый компонент
4. Собрать страницу из компонентов, а не верстать монолитом

---

## 17. Pixel-perfect проверка [R]

**Инструменты:** `generate_figma_design` + `get_screenshot`

1. Сверстать компонент/страницу по макету
2. Через `generate_figma_design` захватить результат вёрстки в Figma
3. Через `get_screenshot` получить скриншот оригинального макета
4. Сравнить визуально: layout, spacing, typography, colors
5. Итерировать до совпадения

---

## 18. Handoff чеклист [D+R]

Проверка готовности макета к передаче в разработку:

- [ ] **Токены:** все цвета, шрифты, отступы используют variables (не hardcoded)
- [ ] **Нейминг:** слои названы осмысленно (не "Frame 427")
- [ ] **Auto Layout:** все контейнеры используют auto layout (не absolute positioning)
- [ ] **Code Connect:** ключевые компоненты связаны с кодом
- [ ] **Responsive:** макеты для нужных breakpoints
- [ ] **States:** компоненты имеют все состояния (default, hover, active, disabled, error)
- [ ] **Annotations:** дизайнер оставил пометки для нетривиальных решений

**Инструменты для проверки:**
- `get_variable_defs` — токены используются
- `get_metadata` — нейминг, auto layout
- `get_code_connect_map` — Code Connect настроен

---

## 19. Миграция Desktop -> Remote [D+R]

1. Убедиться, что Desktop MCP работает (проверить через `get_design_context`)
2. Добавить Remote MCP: `claude mcp add --transport http figma https://mcp.figma.com/mcp`
3. Перезапустить Claude Code
4. Аутентифицироваться через `/mcp` -> figma -> Authenticate
5. Проверить Remote через `whoami`
6. Desktop MCP можно оставить параллельно (разные префиксы: `mcp__figma-desktop__*` и `mcp__figma__*`)
7. ЕСЛИ Desktop больше не нужен -> удалить запись из `~/.claude.json`

**Примечание:** Оба MCP могут работать параллельно. Desktop без rate limits для чтения, Remote для write-операций.
