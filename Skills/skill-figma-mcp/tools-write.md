# Write Tools

## Назначение

Справочник 7 инструментов Figma MCP для записи данных: Code Connect маппинг, write-операции на canvas, создание файлов, загрузка изображений, генерация диаграмм.

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

Загрузка изображений в Figma-файл.

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileKey | string | Да | Ключ файла |
| count | number | Нет | Количество изображений (1-5) |
| nodeId | string | Нет | ID узла для размещения |
| scaleMode | string | Нет | FILL, FIT, CROP, TILE |

**Примечание:** nodeId можно использовать только при count=1.

**Форматы:** PNG, JPG, GIF, WebP (до 10MB).

**Результат:** Upload URL. Для загрузки — POST raw bytes с соответствующим Content-Type.

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
