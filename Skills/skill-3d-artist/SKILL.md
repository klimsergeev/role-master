---
name: skill-3d-artist
description: >
  Справочник Blender MCP для агентов — настройка подключения (official connector
  и community-сервер ahujasid), workflows моделирования через bpy API,
  промптинг 3D-сцен, troubleshooting, безопасность execute_blender_code,
  экономия токенов в agentic-сессиях. Покрывает Claude Desktop, Cowork, Code.
when_to_use: >
  Когда нужно работать с Blender через MCP: настроить подключение, создать
  или проанализировать 3D-сцену, отладить проблемы (uvx not found, port 9876,
  timeout), проверить безопасность .blend файлов, оптимизировать токены.
  Примеры: "подключи Blender MCP", "создай low-poly сцену", "Blender не
  подключается", "сколько стоит сессия с Blender".
version: 2.0.0
created: 2026-05-03
---

# 3D Artist

## Назначение

Справочник для работы с 3D-инструментами через MCP. Первый модуль — Blender. Описывает настройку подключения, типичные workflows, промптинг 3D-сцен и устранение проблем.

## Принципы

1. **Blender MCP — самая токеноемкая MCP-интеграция.** 60% Max-плана за одну сцену — реальный бенчмарк. Планируй сессию заранее.
2. **3D через MCP = итеративная работа.** Каркас, материалы, свет, камера — каждый шаг отдельно. Никогда не one-shot.
3. **Начинай с `get scene info`.** Перед любой работой со сценой — сначала посмотри, что в ней есть.
4. **Два сервера, один порт.** Official connector (Blender Foundation) и community (ahujasid) несовместимы — port 9876 принимает только одно подключение.

## Official vs Community

| Параметр | Official (Blender Foundation) | Community (ahujasid) |
|----------|-------------------------------|----------------------|
| Установка | One-click через директорию Claude | `uvx blender-mcp` + ручной конфиг |
| Blender | 4.2+ | 3.0+ |
| Asset-интеграции | Нет | Poly Haven, Sketchfab, Hyper3D |
| Telemetry | Не задокументирована | По умолчанию вкл., отключается |
| Лучше для | Аналитика, debug, batch | Создание сцен, ассеты |

**Рекомендация:** official connector для новичков и аналитики, community — для творческих задач с ассетами.

## Сравнение клиентов

| Параметр | Claude Desktop | Cowork | Claude Code |
|----------|---------------|--------|-------------|
| Подходит для | Обучение, casual | Длинные задачи, batch | Скриптинг, CI |
| Установка | One-click | One-click | `claude mcp add` |
| Токены | Стандарт | Кратно выше | Tool Search спасает |
| Новичку | Да | Осторожно с лимитами | Нет |

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Настроить Blender MCP | [setup.md](tools/blender/setup.md) | [troubleshooting.md](tools/blender/troubleshooting.md) |
| Работать с Blender сценой | [workflows.md](tools/blender/workflows.md) | — |
| Создать 3D-контент | [workflows.md](tools/blender/workflows.md) | [troubleshooting.md](tools/blender/troubleshooting.md) |
| Проблема с подключением | [troubleshooting.md](tools/blender/troubleshooting.md) | [setup.md](tools/blender/setup.md) |

## Рабочий процесс

### Шаг 1: Определи сценарий подключения

ЕСЛИ нужна настройка с нуля — читай [setup.md](tools/blender/setup.md).
ЕСЛИ подключение уже работает — переходи к шагу 2.

### Шаг 2: Начни с анализа сцены

ВСЕГДА вызывай `get scene info` первой командой. Это разогревает соединение (первая команда часто падает) и дает контекст.

### Шаг 3: Выполняй задачу итеративно

Workflows и промптинг — в [workflows.md](tools/blender/workflows.md). Работай пошагово: одна операция = один промпт.

### Шаг 4: При ошибках — в troubleshooting

Проблемы и решения — в [troubleshooting.md](tools/blender/troubleshooting.md).

## Что НЕ делать

- Не пытаться создать сложную сцену одним промптом — разбивай на шаги
- Не запускать `uvx blender-mcp` вручную в терминале — сервер запускает Claude
- Не открывать два MCP-клиента с Blender одновременно — один порт, одно соединение
- Не игнорировать стоимость токенов — планировать в чате (Haiku/Sonnet), исполнять в Cowork/Code
- Не открывать недоверенные `.blend` файлы без мер безопасности
- Не загружать все файлы скилла сразу — только нужные под задачу

## Примеры

### Пример 1: Анализ сцены (типовой)

**Запрос:** "Найди тяжелые объекты в сцене и предложи оптимизацию"

**Маршрут:** [workflows.md](tools/blender/workflows.md)

**Результат:** Агент вызывает `get scene info`, затем запрашивает poly-count по объектам, сортирует по весу, предлагает упрощение тяжелых мешей.

### Пример 2: Проблема подключения (edge-case)

**Запрос:** "Blender MCP не подключается, первая команда падает"

**Маршрут:** [troubleshooting.md](tools/blender/troubleshooting.md), [setup.md](tools/blender/setup.md)

**Результат:** Агент проверяет: кнопка Connect нажата в Blender, порт 9876 свободен, путь к `uvx` абсолютный. Рекомендует отправить тривиальный первый запрос.

### Пример 3: Композиция MCP

**Запрос:** "Создай high-rise building, спланируй шаги"

**Маршрут:** [workflows.md](tools/blender/workflows.md)

**Результат:** sequential-thinking для планирования, blender-mcp для исполнения по шагам, playwright-mcp для валидации рендера.
