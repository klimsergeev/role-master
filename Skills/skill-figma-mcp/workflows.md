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

## 5. Создать правила дизайн-системы [D]

**Инструменты:** `create_design_system_rules` + `get_variable_defs`

На Remote инструмента `create_design_system_rules` в схеме нет (наблюдение) — там правила собираются слеш-командой `/figma-create-design-system-rules` ([mcp-prompts.md](mcp-prompts.md)).

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

**Инструменты:** `upload_assets`; `use_figma` — если картинки встают в заранее созданные узлы и для проверки

Параметры, форматы и наблюдения по отправке — `upload_assets` в [tools-write.md](tools-write.md).

1. **Файлы готовы до вызова.** Ссылки для отправки одноразовые и живут 10 минут, поэтому картинки скачиваются и проверяются заранее
2. **Цели.** ЕСЛИ картинки должны встать в существующие узлы → собрать их id в порядке файлов (например, скрипт каркаса в `use_figma` возвращает соответствие «картинка → id узла»). ЕСЛИ целей нет → картинки встанут новыми фреймами на `currentPageId`
3. **Вызов.** `upload_assets` с `fileKey`, `count` (до 60), `nodeIds` в порядке файлов и `currentPageId`; `scaleMode` — `FILL` по умолчанию, `FIT` или `TILE` по задаче. Файлов больше 60 → следующий вызов только после отправки на все ссылки текущего
4. **Отправка — сразу, `curl`, параллельно, с явным типом каждого файла** (`$SUBMIT_URL` — `submitUrl` из ответа для этого файла):

   ```bash
   curl -sS -X POST -F "file=@$FILE;type=$(file -b --mime-type "$FILE")" "$SUBMIT_URL" -w "%{http_code}\n"
   ```

   Второй способ — сырые байты: `curl -sS -X POST -H "Content-Type: image/png" --data-binary "@$FILE" "$SUBMIT_URL"`. Python `urllib` не использовать
5. **Коды ответа.** HTTP 200 и `placedOnNodeId`, совпадающий с целью, — картинка встала. HTTP 415 — тип не указан или указан неверно: отправить снова с явным типом; ЕСЛИ одноразовая ссылка повтор не приняла → запросить для этого узла новую ссылку вызовом `upload_assets`
6. **Проверка чтением.** Скрипт `use_figma` только на чтение находит узлы-цели без заливки типа `IMAGE`; найденные перезалить по шагам 3–5. Затем `get_screenshot` для визуальной сверки
7. ЕСЛИ файл — SVG → он импортируется векторными слоями на страницу; `nodeIds` и `scaleMode` к нему не применяются

Наблюдение: доска из 48 картинок — один вызов `upload_assets` и отправка в 8 потоков за 27 секунд, 46 из 48 с первого раза; два WebP без явного типа получили HTTP 415 и встали после повторной отправки с типом.

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

---

## 20. Массовая правка детей фрейма-сетки [R]

**Инструменты:** `use_figma`

Фрейм с `layoutMode: "GRID"`, правка многих детей по их месту в сетке — например, перекрасить места в схеме зала.

1. **Место ребёнка — из сетки, а не из координат и не из порядка.** Строка и столбец — `gridRowAnchorIndex` и `gridColumnAnchorIndex` ребёнка (отсчёт с нуля), размер сетки — `gridRowCount` и `gridColumnCount` фрейма. При `gridItemsPositioning: "MANUAL"` (значение по умолчанию) порядок в `children` ячейку не определяет: `i % cols` и `floor(i / cols)` дают неверную раскладку. Только при `"ROW_AUTO_FLOW"` дети раскладываются по порядку слоёв — слева направо, сверху вниз
2. **План — отдельным вызовом только на чтение.** Скрипт считает для каждого нужного узла целевое значение и возвращает компактную строку пар `ID:значение`, а не объекты целиком
3. **Запись — по явным ID.** Скрипт записи берёт узлы через `figma.getNodeByIdAsync(id)`. ID слоя внутри экземпляра собирается по шаблону `I<id экземпляра>;<id слоя в компоненте>`
4. **Цвет — привязкой к переменной, а не hex.** Библиотечная переменная импортируется через `figma.variables.importVariableByKeyAsync(key)`. `figma.variables.setBoundVariableForPaint(paint, 'color', variable)` возвращает копию заливки — её и записывают в `fills`
5. **Проверка — чтением.** Отдельный вызов только на чтение подтверждает, что у целевых узлов `boundVariables.color` указывает на нужную переменную

Наблюдение: так за один вызов прошли порции на 50 и на 145 узлов во фрейме 20 × 15 с 300 экземплярами компонента.

---

## 21. Перенос картинок между файлами [R]

**Инструменты:** `download_assets` → `upload_assets`; `use_figma` — для узлов-целей и проверки

Сценарий собран по схемам двух инструментов: `download_assets` вживую не проверялся, половина с `upload_assets` проверена — сценарий 12.

1. **Выгрузить из файла-источника.** `download_assets` с `fileKey` источника и `nodeId` узла, в котором лежат картинки. Исходники — из `rawImages`, а не из `export`: `export` — рендер узла со всем, что лежит поверх картинки
2. **Скачать сразу.** Ссылки временные. Каждую скачать во временную папку; расширение — по полю `format`; ЕСЛИ `format` равен `original` → определить тип по содержимому (`file -b --mime-type`)
3. **Предел ответа.** В `rawImages` не больше 20 картинок. ЕСЛИ в узле их больше → вызывать `download_assets` по дочерним узлам
4. **Цели в файле-приёмнике.** ЕСЛИ картинки должны встать в существующие узлы → создать или найти их через `use_figma` и собрать id в порядке файлов. ЕСЛИ целей нет → картинки встанут новыми фреймами на `currentPageId`
5. **Загрузить.** `upload_assets` с `fileKey` приёмника и отправка — шаги 3–7 сценария 12. Режим заливки исходника схема `download_assets` не сообщает — `scaleMode` в приёмнике задаётся заново
6. **Прибрать.** После проверки удалить локальные копии вместе с временной папкой
