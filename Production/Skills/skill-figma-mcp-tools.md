---
name: skill-figma-mcp-tools
description: Справочник MCP-инструментов Figma для агентов Claude Code (Desktop + Remote)
---

# Figma MCP Tools

## Назначение

Справочник для агента по работе с Figma через MCP-сервер. Описывает доступные инструменты, их назначение и типичные сценарии использования. Покрывает оба варианта подключения: Desktop MCP и Remote MCP.

**Настройка подключения:**
- Desktop MCP -> skill-figma-mcp-setup
- Remote MCP -> skill-figma-mcp-remote-setup

---

## Desktop vs Remote

| Характеристика | Desktop | Remote |
|----------------|---------|--------|
| URL | `127.0.0.1:3845/mcp` | `mcp.figma.com/mcp` |
| Требует Figma Desktop | Да | Нет |
| Инструментов | 8 | 16 |
| Write-to-canvas | Ограничено | Полный |
| Rate limits | Нет | Да |
| API | REST API (read-only) | Plugin API (read + write) |

**Почему write только для Remote:**
- REST API (Desktop) — позволяет читать структуру, метаданные, экспортировать изображения
- Plugin API (Remote) — полный доступ: создание, изменение, удаление элементов на canvas

---

## Rate Limits (Remote only)

| План/Seat | Лимит |
|-----------|-------|
| Starter/View/Collab | 6 calls/месяц |
| Dev/Full (Pro) | 15/min, 200/day |
| Dev/Full (Enterprise) | 20/min, 600/day |

**Примечание:** `use_figma` в beta — free during beta, лимиты могут измениться.

---

## Маркеры доступности

- **[D+R]** — Desktop и Remote
- **[R]** — только Remote
- **[D]** — только Desktop
- **[beta]** — в beta, free during beta period

---

## Быстрая проверка подключения

### Desktop MCP

1. Пользователь должен выделить элемент в Figma Desktop
2. Вызвать `mcp__figma-desktop__get_design_context`
3. Ожидаемый результат: React+Tailwind код

**Если ошибка** -> направить к skill-figma-mcp-setup.

### Remote MCP

1. Вызвать `mcp__figma__whoami`
2. Ожидаемый результат: информация о пользователе (email, plan)

**Если ошибка** -> направить к skill-figma-mcp-remote-setup.

---

## Инструменты для чтения

**Заметка о Code Connect:** Для лучших результатов переиспользования кода настройте Code Connect в Figma. Code Connect позволяет связать несколько фреймворков (например, React и SwiftUI) с компонентами Figma-библиотеки. Desktop MCP использует маппинг, выбранный в Dev Mode. Для управления маппингом через параметр `clientFrameworks` укажите точное название label из Code Connect (например, "React", "SwiftUI").

### get_design_context [D+R]

**Назначение:** Генерирует React+Tailwind код для выделенного элемента.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла (формат "123:456") |
| fileKey | string | Ключ файла [R] |
| artifactType | string | Тип артефакта: WEB_PAGE_OR_APP_SCREEN, COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN, REUSABLE_COMPONENT, DESIGN_SYSTEM |
| clientFrameworks | string | Фреймворки через запятую: react, vue, etc. |
| clientLanguages | string | Языки через запятую: javascript, typescript, etc. |
| forceCode | boolean | Принудительно вернуть код даже для больших элементов |
| excludeScreenshot | boolean | Исключить скриншот из ответа [R] |

**Пример вызова (Desktop):**
```
mcp__figma-desktop__get_design_context с nodeId="123:456", clientFrameworks="react", clientLanguages="typescript"
```

**Пример вызова (Remote):**
```
mcp__figma__get_design_context с fileKey="abc123", nodeId="123:456", clientFrameworks="vue"
```

**Результат:** React-компонент с Tailwind-классами (по умолчанию).

---

### get_screenshot [D+R]

**Назначение:** Возвращает PNG-скриншот элемента.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |

**Когда использовать:**
- Нужно визуально понять, что верстается
- Для сравнения результата с макетом
- Для документации

**Результат:** Base64-encoded PNG изображение.

---

### get_metadata [D+R]

**Назначение:** Возвращает XML-структуру с ID, именами, позициями и размерами.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла или страницы |
| fileKey | string | Ключ файла [R] |

**Когда использовать:**
- Нужно понять иерархию элементов
- Найти конкретный элемент по имени
- Получить размеры и позиции

**Пример результата:**
```xml
<FRAME id="123:456" name="Header" x="0" y="0" width="1440" height="80">
  <TEXT id="123:457" name="Logo" x="24" y="24" width="120" height="32"/>
  <FRAME id="123:458" name="Navigation" x="200" y="24" width="800" height="32">
    ...
  </FRAME>
</FRAME>
```

---

### get_variable_defs [D+R]

**Назначение:** Возвращает переменные дизайн-системы (цвета, шрифты, отступы).

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |

**Когда использовать:**
- Нужны токены дизайн-системы
- Настройка Tailwind config
- Синхронизация цветов/шрифтов с кодом

**Пример результата:**
```json
{
  "colors/primary": "#3B82F6",
  "colors/secondary": "#6B7280",
  "spacing/sm": "8px",
  "spacing/md": "16px",
  "font/heading": "Inter, sans-serif"
}
```

---

### get_code_connect_map [D+R]

**Назначение:** Возвращает существующий маппинг Figma-компонентов на код.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |
| codeConnectLabel | string | Label для фильтрации по фреймворку [R] |

**Когда использовать:**
- Проверить, какие компоненты уже связаны с кодом
- Найти путь к компоненту в codebase

**Пример результата:**
```json
{
  "123:456": {
    "codeConnectSrc": "src/components/Button.tsx",
    "codeConnectName": "Button"
  }
}
```

---

### get_code_connect_suggestions [D+R]

**Назначение:** Возвращает предложения для связывания Figma-компонентов с кодом.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |

**Когда использовать:**
- Автоматический поиск соответствий между Figma и codebase
- Начальная настройка Code Connect

---

### create_design_system_rules [D+R]

**Назначение:** Генерирует промпт для создания правил дизайн-системы.

**Когда использовать:**
- Создание .mdc файла с правилами дизайн-системы
- Стандартизация стилей в проекте

---

### get_figjam [D+R]

**Назначение:** Получает данные из FigJam-файла.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |
| includeImagesOfNodes | boolean | Включить изображения узлов [R] |

**Ограничение:** Работает ТОЛЬКО с FigJam-файлами, не с обычными Figma-файлами.

**Когда использовать:**
- Извлечение данных из диаграмм
- Парсинг sticky notes и connections

---

### whoami [R]

**Назначение:** Возвращает идентификационные данные авторизованного пользователя.

**Параметры:** Нет

**Когда использовать:**
- Проверка подключения к Remote MCP
- Определение плана и rate limits
- Диагностика проблем с permissions

**Пример результата:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "plan": "professional"
}
```

---

### search_design_system [D+R]

**Назначение:** Поиск компонентов, переменных и стилей в дизайн-системе.

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| query | string | Текстовый запрос для поиска |
| fileKey | string | Ключ файла для контекста |
| includeComponents | boolean | Включить компоненты (default: true) |
| includeVariables | boolean | Включить переменные (default: true) |
| includeStyles | boolean | Включить стили (default: true) |
| includeLibraryKeys | array | Ограничить поиск конкретными библиотеками |

**Когда использовать:**
- Поиск существующих компонентов перед созданием новых
- Проверка наличия токенов в дизайн-системе
- Импорт компонентов из библиотек

**Пример вызова:**
```
mcp__figma__search_design_system с query="button", fileKey="abc123", includeComponents=true
```

---

## Инструменты для записи

### add_code_connect_map [D+R]

**Назначение:** Добавляет маппинг одного Figma-компонента на код.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| source | string | Да | Путь к компоненту в коде |
| componentName | string | Да | Имя компонента |
| label | string | Да | Фреймворк |
| nodeId | string | Нет | ID узла в Figma |
| fileKey | string | Да [R] | Ключ файла |
| template | string | Нет | JS template для Code Connect [R] |

**Допустимые значения label:**
React, Web Components, Vue, Svelte, Storybook, Javascript, Swift UIKit, Objective-C UIKit, SwiftUI, Compose, Java, Kotlin, Android XML Layout, Flutter, Markdown

**Пример вызова:**
```
mcp__figma-desktop__add_code_connect_map с source="src/components/Button.tsx", componentName="Button", label="React"
```

---

### send_code_connect_mappings [D+R]

**Назначение:** Сохраняет несколько маппингов за один вызов.

**Параметры:**

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
  "label": "React"
}
```

---

### use_figma [R] [beta]

**Назначение:** Главный инструмент для write-операций на canvas. Выполняет JavaScript через Plugin API.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileKey | string | Да | Ключ файла |
| code | string | Да | JavaScript код для выполнения |
| description | string | Да | Описание операции |

**Операции:**
- Создание элементов (frames, shapes, text, components)
- Редактирование свойств (позиция, размер, цвет, стили)
- Удаление элементов
- Инспекция node properties

**Требования:**
- Edit permission на файл
- Full Design seat (не Viewer)

**Пример вызова:**
```
mcp__figma__use_figma с fileKey="abc123", code="figma.createRectangle()", description="Create a rectangle"
```

**Важно:** Инструмент в beta. Перед созданием компонентов вызывай `search_design_system` для проверки существующих компонентов.

---

### generate_figma_design [R]

**Назначение:** Захват и конвертация web-страницы или HTML в Figma layers.

**Параметры:**

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

**Пример вызова:**
```
mcp__figma__generate_figma_design с outputMode="newFile", fileName="My App Capture"
```

---

### create_new_file [R]

**Назначение:** Создание нового пустого Figma файла.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileName | string | Да | Имя файла |
| planKey | string | Да | Ключ команды/организации |
| editorType | string | Да | design или figjam |

**Когда использовать:**
- Создание нового файла перед use_figma
- Автоматизация создания файлов

**Пример вызова:**
```
mcp__figma__create_new_file с fileName="New Design", planKey="team123", editorType="design"
```

**Совет:** Получить planKey можно через `whoami`.

---

### generate_diagram [R]

**Назначение:** Генерация FigJam-диаграммы из Mermaid-синтаксиса.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| name | string | Да | Название диаграммы |
| mermaidSyntax | string | Да | Код на Mermaid.js |
| userIntent | string | Нет | Описание цели пользователя |

**Поддерживаемые типы:**
- Flowchart (блок-схемы)
- Gantt chart (диаграммы Ганта)
- State diagram (диаграммы состояний)
- Sequence diagram (диаграммы последовательности)

**Пример вызова:**
```
mcp__figma__generate_diagram с name="Auth Flow", mermaidSyntax="graph LR\nA[Login] --> B{Valid?}\nB -->|Yes| C[Dashboard]\nB -->|No| A"
```

**Ограничения:**
- Только FigJam, не Figma Design
- Не поддерживает: class diagrams, timelines, venn diagrams, ER diagrams

---

## Типичные задачи

### Задача 1: Сверстать компонент по макету [D+R]

**Инструменты:** `get_design_context` + `get_screenshot`

**Алгоритм:**
1. Попросить пользователя выделить элемент в Figma
2. Вызвать `get_screenshot` для визуального понимания
3. Вызвать `get_design_context` с нужными параметрами
4. Адаптировать полученный код под проект

---

### Задача 2: Узнать структуру макета [D+R]

**Инструменты:** `get_metadata`

**Алгоритм:**
1. Вызвать `get_metadata` для страницы или frame
2. Проанализировать XML-структуру
3. Найти нужные элементы по именам/ID

---

### Задача 3: Получить токены дизайн-системы [D+R]

**Инструменты:** `get_variable_defs`

**Алгоритм:**
1. Вызвать `get_variable_defs`
2. Преобразовать в формат Tailwind config или CSS variables
3. Интегрировать в проект

---

### Задача 4: Связать Figma-компоненты с кодом [D+R]

**Инструменты:** `get_code_connect_map` -> `get_code_connect_suggestions` -> `add_code_connect_map`

**Алгоритм:**
1. Проверить существующие маппинги через `get_code_connect_map`
2. Получить предложения через `get_code_connect_suggestions`
3. Добавить маппинги через `add_code_connect_map` или `send_code_connect_mappings`

---

### Задача 5: Создать правила дизайн-системы [D+R]

**Инструменты:** `create_design_system_rules` + `get_variable_defs`

**Алгоритм:**
1. Вызвать `create_design_system_rules` для получения промпта
2. Вызвать `get_variable_defs` для токенов
3. Создать .mdc файл с правилами

---

### Задача 6: Создать элементы на canvas [R]

**Инструменты:** `search_design_system` -> `use_figma`

**Алгоритм:**
1. Вызвать `search_design_system` для проверки существующих компонентов
2. ЕСЛИ компонент найден -> использовать `importComponentByKeyAsync`
3. ЕСЛИ не найден -> создать через `use_figma`
4. Проверить Edit permission на файл

**Требования:** Edit permission, Full seat

---

### Задача 7: Захватить live UI в Figma [R]

**Инструменты:** `generate_figma_design`

**Алгоритм:**
1. Вызвать `generate_figma_design` без captureId для инструкций
2. Выбрать outputMode (newFile/existingFile/clipboard)
3. Получить captureId
4. Polling каждые 5 сек до completion

**Когда использовать:** Первичный захват web-страницы. Для обновления — использовать `use_figma`.

---

### Задача 8: Создать диаграмму из описания [R]

**Инструменты:** `generate_diagram`

**Алгоритм:**
1. Получить описание диаграммы от пользователя
2. Сгенерировать Mermaid-синтаксис
3. Вызвать `generate_diagram`
4. Вернуть URL созданной диаграммы

---

### Задача 9: Поиск компонентов в дизайн-системе [D+R]

**Инструменты:** `search_design_system`

**Алгоритм:**
1. Вызвать `search_design_system` с query
2. Проанализировать результаты
3. Использовать найденные компоненты через import

---

## Правила

- ЕСЛИ nodeId не указан -> используется текущий выделенный элемент (Desktop)
- ЕСЛИ nodeId в URL формате (node-id=1-2) -> преобразовать в формат "1:2"
- ЕСЛИ URL содержит branch -> использовать branchKey как fileKey
- ЕСЛИ нужны write-операции -> проверить Edit permission
- ЕСЛИ use_figma -> сначала вызвать search_design_system для проверки существующих компонентов
- ЕСЛИ rate limit exceeded -> подождать или оптимизировать batch-операции
- ВСЕГДА сначала проверять подключение (Desktop: `get_design_context`, Remote: `whoami`)
- ВСЕГДА указывать clientFrameworks и clientLanguages для точных результатов
- ВСЕГДА предупреждать о beta статусе use_figma
- НИКОГДА не вызывать `get_figjam` для обычных Figma-файлов
- НИКОГДА не предполагать наличие write-доступа без проверки

---

## Формат выдачи

При работе с Figma MCP сообщать пользователю:

1. Какой инструмент используется и зачем
2. Тип подключения (Desktop/Remote) и доступные возможности
3. Что нужно сделать в Figma (выделить элемент, открыть файл)
4. Результат в понятном формате
5. Предупреждения о rate limits или beta статусе (для Remote)

---

## Примеры

### Пример 1: Верстка компонента (Desktop)

**Вход:** "Сверстай кнопку из макета"

**Действия агента:**
1. Попросить выделить кнопку в Figma
2. Вызвать `mcp__figma-desktop__get_screenshot` для визуализации
3. Вызвать `mcp__figma-desktop__get_design_context` с `clientFrameworks="react"`, `clientLanguages="typescript"`
4. Адаптировать код под проект, создать файл

---

### Пример 2: Настройка дизайн-системы (Desktop/Remote)

**Вход:** "Синхронизируй цвета из Figma в Tailwind config"

**Действия агента:**
1. Вызвать `get_variable_defs`
2. Преобразовать переменные в формат Tailwind:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
      }
    }
  }
}
```
3. Обновить конфиг проекта

---

### Пример 3: Создание элемента на canvas (Remote)

**Вход:** "Создай синий прямоугольник 200x100 в файле abc123"

**Действия агента:**
1. Проверить подключение через `mcp__figma__whoami`
2. Вызвать `mcp__figma__use_figma`:
```javascript
const rect = figma.createRectangle()
rect.resize(200, 100)
rect.fills = [{type: 'SOLID', color: {r: 0, g: 0, b: 1}}]
```
3. Сообщить результат с предупреждением о beta

---

### Пример 4: Rate limit (Remote)

**Вход:** Пользователь получает ошибку rate limit

**Действия агента:**
1. Вызвать `whoami` для определения плана
2. Сообщить лимиты для плана пользователя
3. Рекомендовать batch-операции или ожидание

---

## Самопроверка при подключении

При подключении скилла агент должен определить доступные MCP-серверы и вывести:

```
Скилл подключён: Figma MCP Tools

Назначение: Справочник инструментов Figma MCP.

Тип подключения: [Desktop / Remote / Desktop + Remote]

Доступные инструменты:

Desktop [D] (8):
• get_design_context — генерация кода из макета
• get_screenshot — скриншот элемента
• get_metadata — XML-структура
• get_variable_defs — токены дизайн-системы
• get_code_connect_map — маппинги компонентов
• add_code_connect_map — добавление маппинга
• get_code_connect_suggestions — предложения
• create_design_system_rules — правила ДС

Remote [R] (16):
• [D+R] get_design_context, get_screenshot, get_metadata, get_variable_defs
• [D+R] get_code_connect_map, add_code_connect_map, get_code_connect_suggestions, send_code_connect_mappings
• [D+R] create_design_system_rules, get_figjam, search_design_system
• [R] whoami — идентификация пользователя
• [R] use_figma [beta] — write-операции на canvas
• [R] generate_figma_design — захват web-страниц
• [R] create_new_file — создание файлов
• [R] generate_diagram — FigJam диаграммы
```

---

## Что НЕ входит в scope

- Настройка подключения к MCP-серверу (см. skill-figma-mcp-setup, skill-figma-mcp-remote-setup)
- Работа с Figma Web API напрямую
- Работа с Figma plugins (кроме Plugin API через use_figma)
- Управление billing и seats в Figma
- Настройка permissions на уровне файлов/команд
