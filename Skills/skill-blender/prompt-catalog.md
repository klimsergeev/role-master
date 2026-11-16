# Каталог задач и промптов

## Назначение

Каталог готовых задач со сценой с примерами промптов пользователя и сервером или интеграцией, которые задача требует; композиция с другими MCP-серверами. Промпты — на английском, как их пишут пользователю. Перечни инструментов — в [mcp-servers.md](mcp-servers.md), срез 2026-11-16.

## Задачи

Происхождение оценок в колонке «Стабильность» не установлено; «не оценивалась» — оценки нет.

| Задача | Пример промпта | Сервер или интеграция | Стабильность |
|---|---|---|---|
| Очистка имён | "Look at the open scene and rename data blocks so each name matches what it contains. Flag misleading names." | любой сервер: чтение сцены и `execute_blender_code` | стабильно |
| Объяснение сцены | "Walk through the Geometry Nodes modifier on the active object. Write notes as frame labels in the node editor." | любой сервер: `execute_blender_code` | отлично |
| Поиск зависимостей | "List everything that uses 'Glass_Tinted' material. Tell me what would break if I removed it." | любой сервер: `execute_blender_code` | стабильно |
| Аудит полигонов | "For each mesh, report polygon count alongside its on-screen size in active camera. Sort by count, flag heavy-but-small." | любой сервер: `execute_blender_code` | отлично |
| Недостающие файлы | "Check this file for missing textures and linked files and tell me which paths are broken." | официальный: `get_blendfile_summary_missing_files`, `get_blendfile_summary_of_linked_libraries` | не оценивалась |
| Сцена из примитивов | "Create a low poly dungeon with a dragon guarding a pot of gold" | любой сервер: `execute_blender_code`, по шагам из [scene-workflow.md](scene-workflow.md) | итеративно |
| Набросок на Three.js | "Get info about the current scene, make a Three.js sketch from it" | любой сервер: чтение сцены | хорошо |
| Панель или аддон | "Create a Blender panel that randomizes positions of selected objects within a bounding box" | любой сервер или без MCP — аддон по [scripts-and-addons.md](scripts-and-addons.md) | хорошо |
| Сцена из ассетов | "Create a beach vibe using HDRIs, textures, models from Poly Haven" | сообщество: `search_assets` и `import_asset` с `source="polyhaven"`; флажок Poly Haven на вкладке «MCP for Blender» включён (по умолчанию выключен) | нестабильно |
| Сгенерированная модель | "Generate a wooden treasure chest and place it on the table" | сообщество: `generate_3d`, свой ключ провайдера или подписка Premium | не оценивалась |
| Работа с файлом без открытого Blender | "Summarize what this .blend is used for and list its datablocks" | официальный: `get_blendfile_summary_usage_guess_for_cli`, `get_blendfile_summary_datablocks_for_cli`; ЕСЛИ `blender` нет в `PATH` → сервер зарегистрирован с `BLENDER_PATH` (сценарий «Claude Code и официальный сервер» в [mcp-setup.md](mcp-setup.md)) | не оценивалась |

## Композиция с другими MCP-серверами

Серверы sequential-thinking и playwright-mcp подключаются отдельно; этот скилл их не настраивает и не описывает. Схема для сложной задачи:

```
sequential-thinking (план шагов)
        |
        v
сервер Blender (исполнение по шагам)
        |
        v
playwright-mcp (проверка рендера в браузере)
```

Промпт: "I want to create a high-rise building. Use sequential-thinking to break down steps, then blender-mcp to execute. Monitor each modification."
