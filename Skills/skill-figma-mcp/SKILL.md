---
name: skill-figma-mcp
description: >
  Справочник Figma MCP — инструменты, настройка подключения (Desktop и Remote),
  workflows для дизайн-to-код, Code Connect, диаграммы, write-операции на canvas.
  Покрывает 19 MCP tools, 8+ Figma Skills (MCP prompts), типичные задачи
  фронтенд-разработки и продуктового дизайна с Figma.
when_to_use: >
  Когда нужно работать с Figma через MCP: сверстать по макету, получить токены
  дизайн-системы, создать элементы на canvas, настроить Code Connect, сгенерировать
  диаграмму, захватить UI, настроить подключение Desktop или Remote MCP.
  Примеры запросов: "сверстай компонент из Figma", "синхронизируй цвета из Figma",
  "подключи Figma MCP", "создай диаграмму в FigJam".
version: 2.0.0
created: 2026-05-03
---

# Figma MCP

## Назначение

Справочник для работы с Figma через MCP-серверы. Описывает настройку подключения, 19 инструментов (10 Desktop, 19 Remote), 8+ Figma Skills и типичные workflows для фронтенд-разработки и продуктового дизайна.

## Desktop vs Remote

| Характеристика | Desktop | Remote |
|----------------|---------|--------|
| URL | `127.0.0.1:3845/mcp` | `mcp.figma.com/mcp` |
| Требует Figma Desktop | Да | Нет |
| Инструментов | 10 | 19 |
| Write-to-canvas | Нет (REST API, read-only) | Полный (Plugin API) |
| Rate limits | Нет | Да (см. ниже) |
| Авторизация | Автоматически через Desktop | OAuth в браузере |

**Когда выбрать Desktop:** локальная работа без rate limits, Dev Mode, Code Connect.
**Когда выбрать Remote:** write-операции, нет Figma Desktop, нужны generate/use_figma.

## Rate Limits (Remote only)

| План/Seat | Лимит |
|-----------|-------|
| Starter/View/Collab | 6 calls/месяц |
| Dev/Full (Pro) | 15/min, 200/day |
| Dev/Full (Enterprise) | 20/min, 600/day |

`use_figma` в beta — free during beta period, лимиты могут измениться.

## Quick Start

Самый частый сценарий — сверстать компонент по макету:

1. **get_screenshot** — визуально понять, что верстается
2. **get_design_context** — получить код (React+Tailwind по умолчанию)
3. **Адаптировать** — привести код под стек проекта (фреймворк, токены, компоненты)

Desktop: пользователь выделяет элемент в Figma, nodeId не нужен.
Remote: нужны fileKey и nodeId из URL.

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Настроить Desktop MCP | [desktop-setup.md](desktop-setup.md) | — |
| Настроить Remote MCP | [remote-setup.md](remote-setup.md) | — |
| Прочитать данные из Figma | [tools-read.md](tools-read.md) | [workflows.md](workflows.md) |
| Создать/изменить элементы | [tools-write.md](tools-write.md) | [workflows.md](workflows.md) |
| Сверстать компонент по макету | [workflows.md](workflows.md) | [tools-read.md](tools-read.md) |
| Настроить Code Connect | [workflows.md](workflows.md) | [tools-read.md](tools-read.md), [tools-write.md](tools-write.md) |
| Использовать Figma Skills | [mcp-prompts.md](mcp-prompts.md) | — |

## Что НЕ делать

- Не вызывать `use_figma` без предварительного `search_design_system` — проверяй существующие компоненты
- Не вызывать `get_figjam` для обычных Figma-файлов — только FigJam
- Не предполагать write-доступ без проверки Edit permission
- Не игнорировать rate limits на Remote — планировать batch-операции
- Не использовать raw hex-цвета, если в дизайн-системе есть токены
- Не загружать все файлы скилла сразу — только нужные под задачу

## Примеры

### Пример 1: Верстка компонента (Desktop)

**Запрос:** "Сверстай кнопку из макета"

**Маршрут:** [workflows.md](workflows.md), при необходимости [tools-read.md](tools-read.md)

**Результат:** Пользователь выделяет кнопку в Figma. Агент вызывает get_screenshot + get_design_context, адаптирует код под проект.

### Пример 2: Настройка подключения (Remote)

**Запрос:** "Подключи Figma MCP без Desktop"

**Маршрут:** [remote-setup.md](remote-setup.md)

**Результат:** Пошаговая инструкция: `claude mcp add`, перезапуск, OAuth, проверка через whoami.

### Пример 3: Rate limit (Remote)

**Запрос:** Пользователь получает "Rate limit exceeded"

**Маршрут:** SKILL.md (секция Rate Limits), [remote-setup.md](remote-setup.md)

**Результат:** Агент вызывает whoami для определения плана, сообщает лимиты, рекомендует batch-операции или ожидание.
