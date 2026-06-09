---
name: skill-figma-plugin
description: >
  Справочник и процедура разработки плагинов Figma с Plugin API. Архитектура
  плагинов (sandbox main thread + UI iframe), манипуляция нодами, стили,
  компоненты, переменные (Variables), UI-разработка с postMessage-коммуникацией,
  настройка проекта (manifest.json, TypeScript, esbuild), тестирование и
  публикация в Figma Community. Пошаговый workflow от идеи до опубликованного
  плагина.
when_to_use: >
  Figma plugin, разработка плагина Figma, Plugin API, figma.createRectangle,
  figma.showUI, postMessage, manifest.json, @figma/plugin-typings,
  create-figma-plugin, sandbox iframe, плагин для Figma, автоматизация Figma,
  design automation, plugin architecture.
  Примеры: "создай плагин для Figma", "как работает Plugin API",
  "настрой проект для Figma-плагина", "как опубликовать плагин в Figma Community",
  "помоги с UI для плагина Figma".
version: 1.0.0
created: 2026-06-08
---

# Figma Plugin Development

## Назначение

Справочный скилл с процедурой для разработки плагинов Figma. Описывает архитектуру плагинов, Plugin API, паттерны разработки, создание UI и полный workflow от инициализации проекта до публикации в Figma Community.

## Архитектура плагина

```
+---------------------------------------------------------+
|                   FIGMA APPLICATION                      |
+---------------------------------------------------------+
|                                                          |
|  +-------------------+      +------------------------+  |
|  |   MAIN THREAD     |      |     UI THREAD          |  |
|  |   (Sandbox)       |      |     (iframe)           |  |
|  |                    |      |                        |  |
|  | - Plugin API       | <--> | - HTML/CSS/JS          |  |
|  | - Node access      | post | - User interface       |  |
|  | - figma.*          | Msg  | - No Figma API access  |  |
|  | - Read/write doc   |      | - Browser APIs (fetch, |  |
|  | - No browser APIs  |      |   DOM, setTimeout)     |  |
|  |                    |      | - npm packages         |  |
|  +-------------------+      +------------------------+  |
|                                                          |
+---------------------------------------------------------+
```

**Ключевые ограничения:**
- Main thread (sandbox) — доступ к Figma API, но ограниченная JS-среда (нет fetch, DOM, setTimeout)
- UI thread (iframe) — полная браузерная среда, но нет доступа к Figma API
- Коммуникация между потоками через `postMessage` / `onmessage`

## Типы плагинов

| Тип | Назначение | UI | editorType |
|-----|-----------|----|----|
| Design Plugin | Манипуляция дизайн-файлами | Опционально | `figma` |
| FigJam Plugin | Манипуляция FigJam-файлами | Опционально | `figjam` |
| Dev Mode Plugin | Инструменты для разработчиков | Опционально | `dev` |

> **Out of scope v1:** Widget API (интерактивные объекты на canvas), плагины для Figma Slides (`slides`) и Figma Buzz (`buzz`). Эти типы существуют, но не покрыты данным скиллом.

## Категории плагинов

| Категория | Примеры | Ключевые API |
|----------|---------|-------------|
| Генераторы | Lorem ipsum, иконки, паттерны | `figma.create*`, fills, text |
| Утилиты | Переименование слоёв, очистка, организация | selection, traversal, properties |
| Импортёры | JSON в слои, данные из таблиц | `figma.create*`, позиционирование |
| Экспортёры | Дизайн-токены, генерация кода | traversal, стили, properties |
| Коннекторы | Синхронизация с внешними сервисами | `figma.clientStorage`, fetch (из UI) |
| Accessibility | Проверка контраста, a11y-аудит | цвета, текст, traversal |

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Понять архитектуру плагина, написать первый плагин | [plugin-architecture.md](plugin-architecture.md) | [project-setup.md](project-setup.md) |
| Настроить проект (manifest, TypeScript, бандлер) | [project-setup.md](project-setup.md) | — |
| Работа с нодами, стилями, переменными | [plugin-api.md](plugin-api.md) | [common-patterns.md](common-patterns.md) |
| Создание UI для плагина | [ui-development.md](ui-development.md) | [plugin-architecture.md](plugin-architecture.md) |
| Паттерны: selection, traversal, batch, цвета | [common-patterns.md](common-patterns.md) | [plugin-api.md](plugin-api.md) |
| Тестирование и публикация | [project-setup.md](project-setup.md) | — |
| Типичные ошибки и антипаттерны | [plugin-architecture.md](plugin-architecture.md) | [common-patterns.md](common-patterns.md) |
| Полный workflow: от идеи до публикации | SKILL.md (рабочий процесс ниже) | все файлы по мере необходимости |

## Рабочий процесс: от идеи до публикации

### Шаг: Определить тип и scope плагина

- Выбрать тип: Design Plugin, FigJam Plugin, или Dev Mode Plugin
- Определить: нужен ли UI (интерактивный) или достаточно run-once
- Определить категорию (генератор, утилита, импортёр, экспортёр, коннектор)

Детали архитектуры — в [plugin-architecture.md](plugin-architecture.md).

### Шаг: Настроить проект

- Создать `manifest.json` с правильным `editorType` и `documentAccess: "dynamic-page"`
- Настроить TypeScript + `@figma/plugin-typings`
- Выбрать и настроить бандлер (esbuild рекомендуется)
- Импортировать плагин в Figma Desktop: Plugins > Development > Import plugin from manifest

Детали настройки — в [project-setup.md](project-setup.md).

### Шаг: Реализовать логику плагина

- Main thread (`code.ts`): работа с Figma API — создание/модификация нод, стили, переменные
- UI thread (`ui.html` / `ui.tsx`): интерфейс пользователя, если нужен
- Коммуникация между потоками через типизированные сообщения

API-справочник — в [plugin-api.md](plugin-api.md). Паттерны — в [common-patterns.md](common-patterns.md). UI — в [ui-development.md](ui-development.md).

### Шаг: Тестировать

- Запустить `npm run watch` для автоматической пересборки
- Тестировать в Figma Desktop: Plugins > Development > [Имя плагина]
- Проверить edge-cases: пустая selection, большое количество нод, undo, light/dark тема
- Написать unit-тесты для утилитарных функций (с mock Figma API)

Чеклист тестирования — в [project-setup.md](project-setup.md).

### Шаг: Опубликовать

- Подготовить ассеты: cover image (1920x960), иконка (128x128), описание
- Собрать production bundle
- Опубликовать через Figma: Plugins > Manage plugins > Publish
- Дождаться review от Figma

Процедура публикации — в [project-setup.md](project-setup.md).

## Что НЕ делать

- НЕ использовать browser APIs (fetch, DOM, setTimeout) в main thread — они недоступны в sandbox. Для browser APIs используй UI iframe
- НЕ модифицировать readonly массивы (fills, effects) напрямую — создавай новый массив
- НЕ забывать загружать шрифты (`figma.loadFontAsync`) перед изменением текста
- НЕ блокировать main thread длинными циклами — используй batch с yield (setTimeout)
- НЕ оставлять плагин без кнопки закрытия — всегда предусматривай `figma.closePlugin()`
- НЕ игнорировать пустую selection — всегда проверяй `figma.currentPage.selection.length`
- НЕ путать скилл с **skill-figma-mcp** — тот описывает использование Figma _через MCP-серверы_, а этот — _создание плагинов_ для Figma
- НЕ использовать этот скилл для **Widget API** (useSyncedState, usePropertyMenu) — Widget это отдельная тема, out of scope
- НЕ использовать этот скилл для специфики **Figma Slides** (`slides`) и **Figma Buzz** (`buzz`) — они существуют как editorType, но не покрыты данным скиллом

## Примеры

### Пример: Утилита для переименования слоёв (типовой сценарий)

**Запрос:** "Создай плагин для Figma, который переименовывает выбранные слои по паттерну"

**Маршрут:** [plugin-architecture.md](plugin-architecture.md), [project-setup.md](project-setup.md), [ui-development.md](ui-development.md), [common-patterns.md](common-patterns.md)

**Результат:**
- Определяем: Design Plugin, нужен UI (ввод паттерна), editorType: figma
- Настраиваем проект: manifest.json, TypeScript, esbuild
- Main thread: получает selection, переименовывает ноды
- UI: input для паттерна, кнопки Apply/Cancel
- Коммуникация: UI отправляет паттерн через postMessage, main thread применяет
- Тестирование: пустая selection, один элемент, много элементов, элементы разных типов

### Пример: Плагин без UI — быстрая заливка цветом (edge-case)

**Запрос:** "Сделай плагин, который заливает выделенные элементы красным цветом, без UI"

**Маршрут:** [plugin-architecture.md](plugin-architecture.md) (Quick Start, антипаттерны), [plugin-api.md](plugin-api.md) (fills, GeometryMixin)

**Результат:**
- Определяем: Design Plugin, без UI, run-once
- Минимальный manifest.json без поля `ui`
- `code.ts`: проверить selection > отфильтровать ноды с fills > применить solid fill > figma.notify > figma.closePlugin
- Edge-cases: selection пуста (notify + closePlugin), ноды без fills (пропустить), группы (рекурсивный обход или пропуск)

## Формат выдачи

При создании плагина по этому скиллу агент выдаёт:

```
Плагин: [название]
Тип: [Design Plugin / FigJam Plugin / Dev Mode Plugin]
UI: [да / нет]
Файлы:
  - manifest.json
  - src/code.ts
  - src/ui.tsx (если есть UI)
  - src/types.ts (если есть типизированные сообщения)
  - package.json
  - tsconfig.json
  - esbuild.config.js
Следующий шаг: [что делать дальше — импорт в Figma, тестирование, публикация]
```
