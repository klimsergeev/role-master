# Figma Skills (MCP Prompts)

## Назначение

Справочник Figma Skills — промпт-инструкций, которые MCP-сервер отдаёт агенту через MCP prompts. Описывает 9 доступных слеш-команд, механизм работы и отличия от инструментов.

## Механизм работы

### Tools vs Skills

- **Tools** — строительные блоки. Один вызов, конкретные параметры, конкретный результат.
- **Skills** — workflow. Мульти-шаговые рецепты с best practices. Скилл говорит агенту КАК использовать инструменты.

### Как работает Figma Skill

1. MCP-клиент запрашивает у сервера prompts
2. Сервер возвращает инструкции для каждого скилла
3. Агент выполняет инструкции, вызывая обычные tools (`use_figma`, `get_design_context` и т.д.)
4. В параметре `skillNames` у `use_figma` указывается какой скилл выполняется

## Доступные слеш-команды

| # | Слеш-команда | Платформа | Описание |
|---|-------------|-----------|----------|
| 1 | `/figma-use` | Remote | Запись в Design canvas: фреймы, компоненты, переменные, auto layout |
| 2 | `/figma-use-figjam` | Remote | Запись в FigJam: стикеры, секции, коннекторы, фигуры, таблицы, code blocks |
| 3 | `/figma-code-connect-components` | D+R | Маппинг Figma-компонентов на код через Code Connect (Organization/Enterprise) |
| 4 | `/figma-create-design-system-rules` | D+R | Генерация правил дизайн-системы (.mdc): анализ кодовой базы, документирование конвенций |
| 5 | `/figma-create-new-file` | Remote | Создание нового файла (Design или FigJam) в Drafts |
| 6 | `/figma-implement-design` | D+R | Дизайн -> код: чтение дизайна, pull ассетов, генерация кода |
| 7 | `/figma-generate-library` | Remote | Создание DS-библиотеки из кодовой базы. Фазы: Discovery -> Foundations -> Структура -> Компоненты -> QA |
| 8 | `/figma-generate-design` | Remote | Сборка полных экранов из реальных компонентов дизайн-системы |
| 9 | `/figma-generate-project-plan` | Remote | Генерация project plan: декомпозиция задач, зависимости, таймлайн в FigJam |

## Примеры вызова

```
/figma-use Create a pricing card with title, features, and button using auto layout
```

```
/figma-use-figjam Add sticky notes for sprint goals and organize into sections
```

```
/figma-create-new-file figjam "Sprint Planning"
```

```
/figma-implement-design [Figma URL]
```

```
/figma-generate-design Create mobile account settings screen with profile and security sections
```

```
/figma-generate-project-plan Break down the redesign of the checkout flow into tasks with dependencies
```

## Figma MCP Catalog

Figma MCP Catalog — community-библиотека скиллов. Позволяет находить и использовать сторонние рецепты для типовых задач. Каталог доступен из MCP-клиента.

## Правила

- ЕСЛИ нужна write-операция на Design canvas -> загрузить `/figma-use` перед вызовом `use_figma`
- ЕСЛИ нужна write-операция в FigJam -> загрузить `/figma-use-figjam`
- ЕСЛИ нужно реализовать дизайн в коде -> использовать `/figma-implement-design`
- ВСЕГДА указывать `skillNames` при вызове `use_figma` после загрузки скилла
- НИКОГДА не вызывать `use_figma` без предварительной загрузки соответствующего Figma Skill
