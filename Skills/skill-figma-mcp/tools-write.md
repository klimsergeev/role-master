# Write Tools

## Назначение

Справочник инструментов Figma MCP для записи данных: Code Connect маппинг, write-операции на canvas, создание файлов, загрузка изображений, генерация диаграмм. Выгрузка картинок из файла (`download_assets`) — в [tools-read.md](tools-read.md).

## Маркеры доступности

- **[D+R]** — Desktop и Remote
- **[R]** — только Remote

## Правило: figma-use skill ОБЯЗАТЕЛЕН

**КРИТИЧНО:** Перед КАЖДЫМ вызовом `use_figma` агент ДОЛЖЕН загрузить Figma Skill через MCP prompt `/figma-use` (для Design) или `/figma-use-figjam` (для FigJam). Skill содержит актуальные best practices, API-паттерны и ограничения Plugin API. Без загрузки скилла результат непредсказуем.

Порядок:
1. Загрузить skill через MCP prompt
2. Следовать инструкциям из skill
3. Вызвать `use_figma` с параметром `skillNames`

---

## add_code_connect_map [D+R]

Добавляет маппинг одного Figma-компонента на код.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| source | string | Да | Путь к компоненту в коде |
| componentName | string | Да | Имя компонента |
| label | string | Да | Фреймворк |
| nodeId | string | Нет | ID узла в Figma |
| fileKey | string | Да [R] | Ключ файла |
| template | string | Нет | JS template для Code Connect |
| templateDataJson | string | Нет | JSON string метаданных шаблона (isParserless, imports, nestable, props) |

**Допустимые значения label:**
React, Web Components, Vue, Svelte, Storybook, Javascript, Swift, Swift UIKit, Objective-C UIKit, SwiftUI, Compose, Java, Kotlin, Android XML Layout, Flutter, Markdown

**Пример:**
```
mcp__figma-desktop__add_code_connect_map с source="src/components/Button.tsx", componentName="Button", label="React"
```

---

## send_code_connect_mappings [D+R]

Сохраняет несколько маппингов за один вызов (batch).

| Параметр | Тип | Описание |
|----------|-----|----------|
| mappings | array | Массив объектов маппинга |
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |

**Структура объекта маппинга:**
```json
{
  "nodeId": "123:456",
  "componentName": "Button",
  "source": "src/components/Button.tsx",
  "label": "React",
  "template": "...",
  "templateDataJson": "..."
}
```

**Допустимые значения label:** см. add_code_connect_map.

---

## use_figma [R] [beta]

Главный инструмент для write-операций на canvas. Выполняет JavaScript через Plugin API. Работает и с Design, и с FigJam файлами.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileKey | string | Да | Ключ файла |
| code | string | Да | JavaScript код для выполнения |
| description | string | Да | Описание операции |
| skillNames | string[] | Нет | Какой Figma Skill выполняется (для логирования) |

**Design-операции:**
- Создание элементов (pages, frames, shapes, text, components, variants)
- Редактирование свойств (позиция, размер, цвет, стили)
- Работа с variables, styles, images
- Удаление элементов
- Инспекция node properties

**FigJam-операции:**
- Stickies, Sections, Connectors, Shapes, Tables, Code blocks

**Требования:**
- Edit permission на файл
- Full Design seat (не Viewer)

**Пример:**
```
mcp__figma__use_figma с fileKey="abc123", code="figma.createRectangle()", description="Create a rectangle"
```

**Важно:**
- Инструмент в beta — предупреждать пользователя
- Перед созданием компонентов -> `search_design_system` для проверки существующих
- ОБЯЗАТЕЛЬНО загрузить figma-use skill перед вызовом
- **Обрыв связи не говорит, применился ли скрипт.** Ошибка `MCP server "figma" transport dropped mid-call; response for tool "use_figma" was lost` значит, что потерян ответ, а не что код не выполнился. Перед повтором прочитай состояние файла отдельным вызовом только на чтение и повторяй только то, чего в файле нет. Наблюдение: дважды после обрыва файл оставался в исходном состоянии — но полагаться на это нельзя
- **Чтение `x`/`y` детей GRID-фрейма рвало связь** (наблюдение, один файл: фрейм 20 × 15, 300 экземпляров компонента). Три скрипта с этим чтением через 120 секунд уходили в фон и падали с обрывом, в том числе скрипт только на чтение; скрипты по тем же детям без `x`/`y` и запись 145 привязок к переменным за один вызов проходили сразу. Позицию ребёнка в сетке читай из `gridRowAnchorIndex` и `gridColumnAnchorIndex` — процедура массовой правки сетки в [workflows.md](workflows.md)

---

## generate_figma_design [R]

Захват и конвертация web-страницы или HTML в Figma layers.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| captureId | string | Нет | ID захвата для проверки статуса |
| outputMode | string | Нет | newFile, existingFile, clipboard |
| fileKey | string | Нет | Ключ файла (для existingFile) |
| fileName | string | Нет | Имя файла (для newFile) |
| nodeId | string | Нет | ID узла для добавления |
| planKey | string | Нет | Ключ команды/организации |

**Workflow:**
1. Вызвать без captureId для получения инструкций
2. Получить captureId
3. Polling: вызывать с captureId каждые 5 сек до status "completed"

**Когда использовать:**
- Захват live UI в Figma для первичного дизайна
- Конвертация прототипа в editable layers
- Import web-страницы для редизайна

---

## create_new_file [R]

Создание нового пустого Figma файла.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileName | string | Да | Имя файла |
| planKey | string | Да | Ключ команды/организации |
| editorType | string | Да | design или figjam |
| projectId | string | Нет | ID проекта (папки) для размещения |

**Совет:** Получить planKey можно через `whoami`.

---

## upload_assets [R]

Загрузка растровых картинок и SVG в файл Figma: заливкой в существующие узлы, новыми фреймами или векторными слоями. Работает в файлах Design (`/design/`), FigJam (`/board/`) и Slides (`/slides/`). Процедура — сценарий 12 в [workflows.md](workflows.md), перенос из другого файла — сценарий 21 там же.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileKey | string | Да | Ключ файла |
| count | integer | Нет | Сколько ссылок для отправки выдать: от 1 до 60, по умолчанию 1 |
| nodeIds | string[] | Нет | Узлы-цели, по одному на ссылку и в том же порядке; длина массива равна `count`. Растровая картинка встаёт заливкой в свой узел. С `nodeId` не сочетается |
| nodeId | string | Нет | Устарел, вместо него `nodeIds`. Работает только при `count` 1 |
| scaleMode | string | Нет | Как растр заполняет узел: `FILL` (по умолчанию), `FIT`, `TILE`. Значения `CROP` в схеме нет |
| currentPageId | string | Нет | Страница, на которой создаются новые фреймы, когда цели не заданы. Схема просит передавать её всегда, когда id известен |
| batchCommit | boolean | Нет | По умолчанию `false`: каждая ссылка сама сохраняет и размещает свою картинку. `true` — только если агент вызовет возвращённый `commitUrl` ровно один раз после всех отправок: тогда всё размещается одной операцией с файлом |

**Что происходит с разными входами** (по схеме):

- Растр с `nodeIds` → заливка существующего узла; у каждой ссылки в ответе есть `targetNodeId`
- Растр без целей → новые фреймы с заливкой-картинкой на `currentPageId`, без него — на текущей странице
- SVG (`image/svg+xml`) → импорт деревом редактируемых векторных слоёв на страницу; `nodeIds` и `scaleMode` к SVG не применяются

**Форматы:** PNG, JPG, GIF, WebP, SVG, до 10 МБ на файл.

**Предел за вызов:** не больше 60 ссылок. Сначала отправить файлы на все полученные ссылки, только потом вызывать `upload_assets` снова.

**Ответ и отправка** (наблюдение):

- На каждую картинку приходит `submitUrl` вида `mcp.figma.com/mcp/upload/<uuid>/submit?…`. Ссылка одноразовая и живёт 10 минут — файлы готовить до вызова, а отправлять сразу после него
- Отправка — POST одним из двух способов из инструкции в ответе: `multipart/form-data` с полем `file` либо сырые байты с заголовком `Content-Type`. По инструкции имя файла при `multipart` становится именем слоя; при `nodeIds` имя слоя не меняется — остаётся имя узла-цели
- **Тип файла указывать явно.** `curl -F "file=@pic.webp"` без `;type=image/webp` отправляет WebP как произвольные байты, и сервер отвечает HTTP 415; с явным типом — HTTP 200. Тип брать из содержимого файла (`file -b --mime-type`), а не из расширения
- Успешная отправка отвечает `{"success":true,"imageHash":…,"placedOnNodeId":"…"}`; `placedOnNodeId` совпадал с узлом-целью
- При `nodeIds` размеры узла не меняются, заливка встаёт типом `IMAGE` со `scaleMode` FILL, пропорции картинки без обрезки
- Скорость: 48 картинок `curl` в 8 потоков — 27 секунд; лимитов и обрывов не встретилось
- **Отправлять `curl`, а не Python `urllib`.** На Python с python.org (macOS, корневые сертификаты не установлены) `urllib` падает до отправки с `CERTIFICATE_VERIFY_FAILED`; системный `curl` на той же машине работает
- **Встала ли картинка — проверять чтением заливок** через `use_figma` (узлы без заливки типа `IMAGE`), а не глазами по `get_screenshot`: чтение нашло обе пустые карточки на доске из 48

---

## generate_diagram [R]

Генерация FigJam-диаграммы из Mermaid-синтаксиса.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| name | string | Да | Название диаграммы |
| mermaidSyntax | string | Да | Код на Mermaid.js |
| userIntent | string | Нет | Описание цели пользователя |
| useArchitectureLayoutCode | string | Нет | Код из ресурса architecture-diagram-instructions |
| planKey | string | Нет | Ключ команды/организации |
| fileKey | string | Нет | Добавление в существующий FigJam-файл |

**Поддерживаемые типы (6):**
- Flowchart (блок-схемы)
- Gantt chart (диаграммы Ганта)
- State diagram (диаграммы состояний)
- Sequence diagram (диаграммы последовательности)
- Architecture diagram (визуализация системной архитектуры)
- Entity Relationship Diagram / ERD (схемы БД)

**Пример:**
```
mcp__figma__generate_diagram с name="Auth Flow", mermaidSyntax="graph LR\nA[Login] --> B{Valid?}\nB -->|Yes| C[Dashboard]\nB -->|No| A"
```

**Ограничения:**
- Только FigJam, не Figma Design
- Не поддерживает: class diagrams, timelines, venn diagrams
