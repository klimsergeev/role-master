# Read Tools

## Назначение

Справочник 12 инструментов Figma MCP для чтения данных: дизайн-контекст, скриншоты, метаданные, токены, Code Connect, библиотеки.

## Маркеры доступности

- **[D+R]** — Desktop и Remote
- **[R]** — только Remote
- **[D]** — только Desktop

## Заметки

**Logging-параметры:** Большинство инструментов принимают `clientFrameworks` и `clientLanguages` для аналитики. В таблицах они указаны только там, где влияют на результат.

**Code Connect:** Для переиспользования кода настройте Code Connect в Figma. Desktop MCP использует маппинг, выбранный в Dev Mode. Для управления через параметр `clientFrameworks` укажите точное название label из Code Connect (например, "React", "SwiftUI").

---

## get_design_context [D+R]

Генерирует React+Tailwind код для выделенного элемента.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла (формат "123:456") |
| fileKey | string | Ключ файла [R] |
| artifactType | string | WEB_PAGE_OR_APP_SCREEN, COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN, REUSABLE_COMPONENT, DESIGN_SYSTEM [D] |
| taskType | string | CREATE_ARTIFACT, CHANGE_ARTIFACT, DELETE_ARTIFACT [D] |
| clientFrameworks | string | Фреймворки через запятую: react, vue, etc. |
| clientLanguages | string | Языки через запятую: javascript, typescript, etc. |
| forceCode | boolean | Принудительно вернуть код для больших элементов |
| excludeScreenshot | boolean | Исключить скриншот из ответа [R] |
| disableCodeConnect | boolean | Отключить Code Connect [R] |

**Пример (Desktop):**
```
mcp__figma-desktop__get_design_context с nodeId="123:456", clientFrameworks="react", clientLanguages="typescript"
```

**Пример (Remote):**
```
mcp__figma__get_design_context с fileKey="abc123", nodeId="123:456", clientFrameworks="vue"
```

**Результат:** React-компонент с Tailwind-классами (по умолчанию). Адаптировать под стек проекта.

---

## get_screenshot [D+R]

Возвращает PNG-скриншот элемента.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |
| contentsOnly | boolean | Рендер ноды изолированно, без floating content |
| enableBase64Response | boolean | Inline base64 для sandbox-окружений [R] |

**Когда использовать:**
- Визуально понять, что верстается
- Сравнить результат с макетом
- Для документации

**Результат:** Base64-encoded PNG изображение.

---

## get_metadata [D+R]

Возвращает XML-структуру с ID, именами, позициями и размерами.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла или страницы |
| fileKey | string | Ключ файла [R] |

**Когда использовать:**
- Понять иерархию элементов
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

## get_variable_defs [D+R]

Возвращает переменные дизайн-системы (цвета, шрифты, отступы).

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |

**Когда использовать:**
- Токены дизайн-системы
- Настройка Tailwind config или CSS variables
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

## get_code_connect_map [D+R]

Возвращает существующий маппинг Figma-компонентов на код.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |
| codeConnectLabel | string | Label для фильтрации по фреймворку |

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

## get_code_connect_suggestions [D+R]

Возвращает предложения для связывания Figma-компонентов с кодом.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |
| excludeMappingPrompt | boolean | Исключить prompt, вернуть только список немаппленных компонентов [R] |

**Когда использовать:**
- Автоматический поиск соответствий между Figma и codebase
- Начальная настройка Code Connect

---

## get_context_for_code_connect [R]

Возвращает метаданные компонентов (properties, variants, descendant tree) для создания Code Connect template files.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла |
| clientFrameworks | string | Фреймворки через запятую |
| clientLanguages | string | Языки через запятую |

**Когда использовать:**
- Детальная информация о компоненте для Code Connect
- Создание template files для маппинга

---

## create_design_system_rules [D+R]

Генерирует промпт для создания правил дизайн-системы (.mdc файл).

**Когда использовать:**
- Создание .mdc файла с правилами дизайн-системы
- Стандартизация стилей в проекте

---

## get_figjam [D+R]

Получает данные из FigJam-файла.

| Параметр | Тип | Описание |
|----------|-----|----------|
| nodeId | string | ID узла |
| fileKey | string | Ключ файла [R] |
| includeImagesOfNodes | boolean | Включить изображения узлов |

**Ограничение:** Работает ТОЛЬКО с FigJam-файлами, не с обычными Figma-файлами.

**Когда использовать:**
- Извлечение данных из диаграмм
- Парсинг sticky notes и connections
- Суммаризация FigJam-бордов

---

## get_libraries [R]

Возвращает библиотеки файла: подключённые (subscribed) и доступные (available).

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| fileKey | string | Да | Ключ файла |
| offset | number | Нет | Пагинация для организационных библиотек |

**Когда использовать:**
- Просмотр подключённых библиотек файла
- Поиск доступных библиотек организации
- Проверка библиотеки перед `search_design_system`

---

## whoami [R]

Возвращает идентификационные данные авторизованного пользователя.

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

## search_design_system [R]

Поиск компонентов, переменных и стилей в дизайн-системе.

| Параметр | Тип | Описание |
|----------|-----|----------|
| query | string | Текстовый запрос для поиска |
| fileKey | string | Ключ файла для контекста |
| includeComponents | boolean | Включить компоненты (default: true) |
| includeVariables | boolean | Включить переменные (default: true) |
| includeStyles | boolean | Включить стили (default: true) |
| includeLibraryKeys | array | Ограничить поиск конкретными библиотеками |
| disableCodeConnect | boolean | Отключить Code Connect в результатах |

**Когда использовать:**
- Поиск существующих компонентов перед созданием новых
- Проверка наличия токенов в дизайн-системе
- Импорт компонентов из библиотек

**Пример:**
```
mcp__figma__search_design_system с query="button", fileKey="abc123", includeComponents=true
```
