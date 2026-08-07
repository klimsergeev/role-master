# Blender MCP: Workflows и промптинг

## Назначение

Use cases, правила промптинга 3D-сцен, готовые сценарии и механика MCP-канала при работе с Blender.

## Что работает хорошо

- **Аналитика сцены** — debug, batch-операции, аудит poly-count. Самый стабильный use case.
- **Конкретика в координатах** — "red metallic sphere at (2, 0, 1) with radius 0.5" лучше, чем "add a ball".
- **Итеративная доработка** — каркас, материалы, свет, камера. Каждый шаг = отдельный промпт.
- **Старт с `get scene info`** — разогревает соединение и дает контекст.
- **Reference image** — загрузить картинку + "recreate similar layout" лучше чистой генерации из текста.
- **Скриншоты для проверки** — "take a viewport screenshot and tell me if the camera angle looks right".

## Что работает плохо

- Сложные многоступенчатые сцены за один промпт — заведомый провал.
- Точная анатомия, реалистичные пропорции, фотореалистичные материалы — MCP для набросков, не для финального art.
- "Just make it look good" без направления — Claude уйдет в рандом и выдаст результат мимо задачи.
- Простые задачи, которые быстрее сделать руками — ресайз, перемещение одного объекта.

## Готовые сценарии

| Сценарий | Пример промпта | Стабильность |
|----------|---------------|--------------|
| Очистка имен | "Look at the open scene and rename data blocks so each name matches what it contains. Flag misleading names." | Стабильно |
| Объяснение сцены | "Walk through the Geometry Nodes modifier on the active object. Write notes as frame labels in the node editor." | Отлично |
| Поиск зависимостей | "List everything that uses 'Glass_Tinted' material. Tell me what would break if I removed it." | Стабильно |
| Poly-count аудит | "For each mesh, report polygon count alongside its on-screen size in active camera. Sort by count, flag heavy-but-small." | Отлично |
| Low-poly сцена | "Create a low poly dungeon with a dragon guarding a pot of gold" | Итеративно |
| Three.js sketch | "Get info about the current scene, make a Three.js sketch from it" | Хорошо |
| Auto-rigging / плагин | "Create a Blender panel that randomizes positions of selected objects within a bounding box" | Хорошо |
| Beach scene (Poly Haven) | "Create a beach vibe using HDRIs, textures, models from Poly Haven" | Нестабильно |

## Композиция с другими MCP

Реальный workflow для сложных задач:

```
sequential-thinking (планирование)
        |
        v
  blender-mcp (исполнение по шагам)
        |
        v
  playwright-mcp (валидация рендера в браузере)
```

Промпт: "I want to create a high-rise building. Use sequential-thinking to break down steps, then blender-mcp to execute. Monitor each modification."

## Механика MCP-канала

Как устроен обмен с Blender — это объясняет, почему работа идёт пошагово и где ответы упираются в потолок.

1. **Каждая операция — полный round-trip:** Claude, MCP, Blender, ответ, разбор. Отсюда итеративный характер: один шаг = один промпт, результат каждого шага виден и проверяем.
2. **Ответы Blender объёмные.** Информация о сцене и `get_viewport_screenshot` попадают в контекст целиком; картинка — самый тяжёлый тип ответа. Дефолтный потолок MCP-вывода в 25000 обрезает большие сцены — см. `MAX_MCP_OUTPUT_TOKENS` в [setup.md](setup.md).
3. **Долгая сессия держит всю историю обмена.** Контекстное окно конечно: на очень длинных сессиях рабочее состояние сцены перестаёт в него помещаться, и модель теряет ранние детали. Если сцена ушла далеко от начала диалога — начни новую сессию с актуальным `get scene info` вместо того, чтобы тянуть историю.

### Настройки и приёмы, влияющие на канал

| Приём | Что даёт |
|-------|----------|
| `MAX_MCP_OUTPUT_TOKENS=50000` | Поднимает потолок ответа MCP — большие сцены не обрезаются |
| Tool Search (`ENABLE_TOOL_SEARCH=auto:5` в Claude Code) | Схемы инструментов грузятся по требованию, а не все сразу |
| Отключить неиспользуемые коннекторы (Connectors, toggle off) | Каждый подключённый коннектор держит свои tool defs в контексте |
| Batch-операция одной командой ("apply X to all meshes") | Один round-trip вместо N — меньше точек отказа |
