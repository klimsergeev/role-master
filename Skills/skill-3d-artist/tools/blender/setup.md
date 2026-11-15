# Настройка Blender MCP

## Назначение

Пошаговая настройка подключения Blender к Claude через MCP — три сценария для разных клиентов, env-переменные, архитектура.

## Архитектура

```
+-----------------+  stdio MCP  +-------------+  TCP :9876  +-----------+
| Claude Desktop/ |<----------->| MCP Server  |<----------->| Blender   |
| Code / Cursor   |             | (uvx/conn.) |             | Addon     |
+-----------------+             +-------------+             +-----------+
```

Поток: промпт в Claude, MCP-инструмент, JSON по TCP в аддон, bpy API, результат обратно.

## Сценарий A: Claude Desktop / Cowork + Official Connector

Рекомендуется для новичков. Минимум шагов, нет проблем с PATH.

| Шаг | Действие |
|-----|----------|
| 1 | Установить Blender 4.5 LTS с blender.org/download |
| 2 | Установить Claude Desktop (claude.ai/download) |
| 3 | Claude Desktop: Customize, Connectors, Browse, Blender, Add |
| 4 | Открыть blender.org/lab/mcp-server/ в браузере |
| 5 | Перетащить install-link в Blender **дважды** (1-й: lab-репозиторий, 2-й: аддон) |
| 6 | В Blender: Edit → Preferences → Add-ons → MCP, кнопка Start MCP Server (или Auto Start); статус «Server is running». Вкладки BlenderMCP в N-панели у официального расширения нет — это интерфейс сервера сообщества |
| 7 | В Claude Desktop: иконка коннектора покажет Blender-инструменты |

## Сценарий B: Claude Code + Community-сервер

Для разработчиков. Требует `uv` и CLI.

| Шаг | Команда / действие |
|-----|---------------------|
| 1 | `brew install uv` |
| 2 | Скачать `addon.py` из github.com/ahujasid/blender-mcp |
| 3 | Blender: Edit, Preferences, Add-ons, Install, выбрать addon.py, активировать |
| 4 | `claude mcp add blender uvx blender-mcp` |
| 5 | `claude mcp list` — проверить |
| 6 | Blender: N-панель, BlenderMCP, Connect to Claude |
| 7 | `/mcp` в Claude Code — проверить статус |

## Сценарий D: Claude Code + Official Connector

Расширение Blender Lab в Blender — это мост на порту 9876, а MCP-сервер — отдельный пакет из папки `mcp/` репозитория Blender Lab; команда `uvx blender-mcp` ставит сервер сообщества, а не официальный.

| Шаг | Команда / действие |
|-----|---------------------|
| 1 | Установить расширение Blender Lab «MCP» (сценарий A, шаги 4–5) |
| 2 | `git clone https://projects.blender.org/lab/blender_mcp` в любую папку |
| 3 | `brew install uv`, если `uv` нет |
| 4 | `claude mcp add blender -s local -- /opt/homebrew/bin/uv --directory <абсолютный путь к клону>/mcp run blender-mcp` |
| 5 | Blender: Preferences → Add-ons → MCP → Start MCP Server |
| 6 | Перезапустить сессию Claude Code: инструменты MCP подгружаются при старте сессии |
| 7 | `claude mcp list` — `✔ Connected` |

## Сценарий C: Claude Cowork + Community-сервер

Cowork читает тот же конфиг, что и Desktop. Путь на macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`.

```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

ЕСЛИ `uvx` не находится (macOS) — указать абсолютный путь:

```json
{
  "mcpServers": {
    "blender": {
      "command": "/opt/homebrew/bin/uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

Определить путь: `which uvx`. Apple Silicon: `/opt/homebrew/bin/uvx`, Intel: `/usr/local/bin/uvx`.

## Env-переменные

| Переменная | Значение | Зачем |
|------------|----------|-------|
| `MAX_MCP_OUTPUT_TOKENS` | `50000` | Blender отдает большие ответы (сцены), дефолт 25000 обрезает |
| `ENABLE_TOOL_SEARCH` | `auto:5` | Схемы инструментов грузятся по требованию, а не все сразу |
| `DISABLE_TELEMETRY` | `true` | Отключает сбор данных в community-сервере |
| `BLENDER_PORT` | `9001` | Сменить порт, если 9876 занят |
| `BLENDER_HOST` | IP-адрес | Для подключения к Blender на другой машине |
| `BLENDER_PATH` | Путь к бинарнику | Для Griptape Nodes и подобных клиентов |

Пример env в конфиге:

```json
{
  "mcpServers": {
    "blender": {
      "command": "/opt/homebrew/bin/uvx",
      "args": ["blender-mcp"],
      "env": {
        "BLENDER_PORT": "9001",
        "DISABLE_TELEMETRY": "true"
      }
    }
  }
}
```

Пример для Claude Code:

```bash
export MAX_MCP_OUTPUT_TOKENS=50000
claude
```

Tool Search в `~/.claude/settings.json`:

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "auto:5"
  }
}
```

## Версионная совместимость

| Blender | Official connector | Community-сервер |
|---------|-------------------|------------------|
| 4.5 LTS | Да (рекомендуется) | Да |
| 4.2 - 4.4 | Да (минимальная) | Да |
| 3.0 - 4.1 | Нет | Да |
| 2.9x и ниже | Нет | Нет (старый API) |
