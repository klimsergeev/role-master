# Blender MCP: Workflows и промптинг

## Назначение

Use cases, правила промптинга 3D-сцен, готовые сценарии и стратегии экономии токенов для работы с Blender через MCP.

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
- "Just make it look good" без направления — Claude уйдет в рандом и сожжет токены.
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

## Экономия токенов

Blender MCP — самая токеноемкая интеграция. Бенчмарк: пончик + кофе = 2 часа, 60% Max-плана ($200/мес).

### Почему дорого

1. Каждая операция — полный round-trip: Claude, MCP, Blender, ответ, разбор.
2. `get_viewport_screenshot` — картинка в контекст. 30 за сессию = заметно по биллингу.
3. Cowork кратно дороже обычного чата (agentic execution).
4. Длинные сессии — 98.5% токенов на перечитывание истории.

### Стратегии

| Стратегия | Эффект |
|-----------|--------|
| Планировать в чате (Haiku/Sonnet), исполнять с готовым промптом | Кратное снижение |
| Перезапускать сессию при ошибке, не уточнять | 20 msg = ~105k, 30 msg = ~232k токенов |
| "Restart conversation from here" на ранней точке | Срезает накопленную историю |
| Отключать ненужные коннекторы (Connectors, toggle off) | Каждый грузит tool defs в контекст |
| Tool Search (`ENABLE_TOOL_SEARCH=auto:5` в Claude Code) | Deferred loading, on-demand |
| Batch-операции одной командой ("apply X to all meshes") | Один цикл вместо N |
| Тяжелые задачи в off-peak часы | Rate-limit rolling 5h, не daily |
| Не открывать проект с большой about-me/заметкой в Cowork | Каждая сессия перечитывает |

### Рекомендация по плану

| Задача | Минимальный план |
|--------|-----------------|
| Поиграть, понять | Pro $20 + Claude Desktop |
| Серьезная работа (часы/день) | Max 5x ($100) или 20x ($200) + Cowork |
| Разработка плагинов, pipeline | Claude Code + Tool Search |
