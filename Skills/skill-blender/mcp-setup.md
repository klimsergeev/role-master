# Подключение Blender по MCP

## Назначение

Четыре сценария подключения Blender к Claude Desktop и Claude Code через официальный сервер Blender Lab или сервер сообщества, шаги на стороне Blender, переменные окружения каждого сервера и их передача клиенту. Значения сняты 2026-11-16; инструменты, версии и порты серверов — в [mcp-servers.md](mcp-servers.md).

## Выбор сценария

Тип сервера определить по разделу «Условия выбора сервера» в [mcp-servers.md](mcp-servers.md); установленный аддон опознаётся по разделу «Как опознать установленный аддон» там же. Затем — сценарий по клиенту и серверу.

| Клиент | Сервер | Сценарий | Что нужно |
|---|---|---|---|
| Claude Desktop | официальный | «Claude Desktop и официальный сервер» | Blender 5.1 или новее; терминал не нужен |
| Claude Desktop | сообщества | «Claude Desktop и сервер сообщества» | терминал, `uv`; правка файла конфигурации или `uvx mcp-for-blender setup` |
| Claude Code | официальный | «Claude Code и официальный сервер» | Blender 5.1 или новее; терминал, `uv`, `git`, клон репозитория Blender Lab |
| Claude Code | сообщества | «Claude Code и сервер сообщества» | терминал, `uv` |

Cowork. Коннекторы Cowork берутся из конфигурации Customize, которая синхронизируется через аккаунт claude.ai, а не из каталога `~/.claude`. Локальная сессия Cowork на устройстве может пользоваться серверами из `claude_desktop_config.json`, облачные сессии Cowork и claude.ai — нет. Читает ли Cowork этот файл по тому же пути и появляется ли в Cowork коннектор Blender — не установлено.

Платформы. Пути к `uv` и команда его установки ниже даны для macOS. Конфигурация Claude Desktop и запуск Blender описаны для трёх систем.

## Сторона Blender

### Официальное расширение «MCP»

1. Нужен Blender 5.1 или новее.
2. Открыть в браузере `https://www.blender.org/lab/mcp-server/` и перетащить ссылку установки в окно Blender. Первое перетаскивание добавляет репозиторий расширений Blender Lab (`https://lab.blender.org/`) — разрешить; второе устанавливает расширение. Другой путь — установить с диска архив выпуска `https://projects.blender.org/lab/blender_mcp/releases/download/v1.0.3/mcp-1.0.3.zip`.
3. Проверить, что в Blender разрешён доступ в интернет: без него расширение не запускает сервер — последний абзац раздела «Порт и хост» в [mcp-servers.md](mcp-servers.md).
4. Edit → Preferences → Add-ons → MCP: поля Host и Port, флажок Auto Start (включён по умолчанию, задержка 1 с), кнопки «Start MCP Bridge Server» и «Stop MCP Server». Признак работы — статус «Server is running»; «Server is stopped» — нажать «Start MCP Bridge Server». Ошибка запуска выводится под кнопками.

### Аддон сообщества «MCP for Blender»

1. Нужен Blender 3.0 или новее и `uv` (macOS: `brew install uv`).
2. Установить аддон командой `uvx mcp-for-blender install-addon`: она копирует аддон в папку пользовательских аддонов Blender под именем `blender_mcp.py`, печатает, куда записала, и сохраняет `.bak` заменённого файла. Найденные папки аддонов показывает `uvx mcp-for-blender addon-paths`.
3. ЕСЛИ команда пишет «Could not find a Blender user addons directory» → указать папку пользовательских аддонов флагом `--addons-dir <путь>` или переменной `BLENDERMCP_ADDONS_DIR`, либо скачать `addon.py` из `https://github.com/ahujasid/mcp-for-blender` и установить в Edit → Preferences → Add-ons пунктом установки с диска (название пункта — в [scripts-and-addons.md](scripts-and-addons.md)).
4. В Edit → Preferences → Add-ons включить «Interface: MCP for Blender». ЕСЛИ записи нет → перезапустить Blender или установить файл с диска по пункту 3.
5. Сервер аддона стартует при открытии Blender сам; после «Disconnect» до перезапуска Blender — только кнопкой. Проверка — боковая панель 3D-вида (клавиша N), вкладка «MCP for Blender»: «Connected on <хост>:<порт>» и кнопка «Disconnect» — сервер работает; «Not connected» и кнопка «Connect to MCP server» — нажать её. Интерфейс прежних версий — пункт 4 раздела «Как опознать установленный аддон» в [mcp-servers.md](mcp-servers.md).

Другие подкоманды сервера сообщества:

- `uvx mcp-for-blender setup` находит MCP-клиенты на машине (в том числе Claude Desktop и Claude Code), даёт выбрать, какие настроить, добавляет в их конфигурацию запись `blender`, сохраняя `.bak` каждого изменённого файла, затем ставит и включает аддон. Флаг `--dry-run` показывает изменения без записи. Перед запуском — согласие пользователя на правку конфигурации его клиентов.
- `uvx mcp-for-blender@latest update` обновляет сервер и все установленные копии аддона, сохраняя `.bak`; `--dry-run` — без записи. После обновления — перезапустить клиент и Blender. Версии ниже 2.1.7 команды `update` не знают, поэтому первый раз — с `@latest`.

## Сценарий «Claude Desktop и официальный сервер»

1. Подготовить Blender по разделу «Официальное расширение «MCP»».
2. В Claude Desktop: Customize → Connectors, найти Blender, Add.
3. Коннектор работает на любом плане Claude, включая Free; ему нужен Blender, запущенный на той же машине, поэтому работает Claude Desktop, а не claude.ai в браузере.
4. Пройти раздел «Самопроверка при подключении» в [SKILL.md](SKILL.md).

## Сценарий «Claude Desktop и сервер сообщества»

1. Подготовить Blender по разделу «Аддон сообщества «MCP for Blender»».
2. Открыть файл конфигурации Claude Desktop:

| Система | Путь |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

3. Добавить сервер:

```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["mcp-for-blender"]
    }
  }
}
```

4. ЕСЛИ Claude Desktop пишет `spawn uvx ENOENT` или не видит инструментов, хотя `uvx` работает в терминале → указать абсолютный путь в `command`: приложение, запущенное из графической оболочки, не получает `PATH` терминала. Путь показывает `which uvx`; на macOS с Homebrew это `/opt/homebrew/bin/uvx` (Apple Silicon) или `/usr/local/bin/uvx` (Intel).
5. Полностью перезапустить Claude Desktop — выйти через меню приложения, а не закрыть окно.
6. Пройти раздел «Самопроверка при подключении» в [SKILL.md](SKILL.md).

Шаги 2–3 можно заменить командой `uvx mcp-for-blender setup` (раздел «Аддон сообщества «MCP for Blender»»).

## Сценарий «Claude Code и официальный сервер»

1. Подготовить Blender по разделу «Официальное расширение «MCP»».
2. Склонировать репозиторий в любую папку: `git clone https://projects.blender.org/lab/blender_mcp <папка клона>`.
3. Установить `uv`, если его нет (macOS: `brew install uv`); путь к нему — `which uv`. На macOS с Homebrew (Apple Silicon) это `/opt/homebrew/bin/uv`.
4. Решить до регистрации, нужен ли `BLENDER_PATH`: ЕСЛИ задача использует инструменты `*_for_cli` и `blender` не находится в `PATH` (на macOS исполняемый файл лежит внутри пакета приложения) → путь к исполняемому файлу Blender из раздела «Форма команды» в [command-line.md](command-line.md).
5. Зарегистрировать сервер с абсолютными путями; `-e` стоит до `--`, `--` отделяет параметры `claude mcp add` от команды сервера. Без `BLENDER_PATH`:

```bash
claude mcp add blender -s local -- <путь из which uv> --directory <абсолютный путь к клону>/mcp run blender-mcp
```

С `BLENDER_PATH`:

```bash
claude mcp add blender -s local -e BLENDER_PATH=<путь к исполняемому файлу Blender> -- <путь из which uv> --directory <абсолютный путь к клону>/mcp run blender-mcp
```

6. Проверить, что сервер в Blender запущен: статус «Server is running» в Preferences → Add-ons → MCP.
7. Проверить регистрацию: `claude mcp get blender` или `claude mcp list` — статус `✔ Connected`.
8. ЕСЛИ инструменты `mcp__blender__*` в текущей сессии не появились ни среди загруженных, ни среди отложенных → перезапустить сессию Claude Code. Подгружаются ли инструменты без перезапуска после `claude mcp add`, не описано.
9. Пройти раздел «Самопроверка при подключении» в [SKILL.md](SKILL.md).

Пути в конфигурации. Раскрытие `$HOME` и `~` в аргументах MCP-сервера Claude Code не описано; документированы только формы `${VAR}` и `${VAR:-default}` в полях `command`, `args`, `env`, `url`, `headers` файла `.mcp.json`. Поэтому в `.mcp.json` путь пишется абсолютным или, для клона в домашней папке, через `${HOME}`, а не через `$HOME`:

```json
{
  "mcpServers": {
    "blender": {
      "command": "/абсолютный/путь/к/uv",
      "args": ["--directory", "/абсолютный/путь/к/клону/mcp", "run", "blender-mcp"]
    }
  }
}
```

Сервер из `.mcp.json` проекта до одобрения показывается со статусом «⏸ Pending approval» и не подключается. Способ одобрения не установлен; сброс прежних решений об одобрении и отказе — `claude mcp reset-project-choices`.

Другие способы поставить официальный сервер: `pip install git+https://projects.blender.org/lab/blender_mcp.git#subdirectory=mcp` — устанавливает команду `blender-mcp` в выбранное окружение Python (Python 3.10 или новее); для клиентов, принимающих файлы `.mcpb`, — пакет `blender-1.0.3.mcpb` из выпуска `v1.0.3` того же репозитория.

## Сценарий «Claude Code и сервер сообщества»

1. Подготовить Blender по разделу «Аддон сообщества «MCP for Blender»».
2. Зарегистрировать сервер: `claude mcp add blender uvx mcp-for-blender`. ЕСЛИ `uvx` не находится → абсолютный путь из `which uvx`.
3. Проверить, что сервер аддона запущен (вкладка «MCP for Blender», «Connected on …»).
4. Проверить: `claude mcp list` — статус `✔ Connected`.
5. ЕСЛИ инструменты `mcp__blender__*` в сессии не появились ни среди загруженных, ни среди отложенных → перезапустить сессию Claude Code.
6. Пройти раздел «Самопроверка при подключении» в [SKILL.md](SKILL.md).

- Сервер не запускается вручную в терминале: его запускает клиент по регистрации.
- Прежняя регистрация `uvx blender-mcp` продолжает работать — раздел «Устройство канала» в [mcp-servers.md](mcp-servers.md).
- ЕСЛИ сервер сообщества уже прописан в Claude Desktop → на macOS и в WSL `claude mcp add-from-claude-desktop` копирует серверы из `claude_desktop_config.json` в `~/.claude.json`. Отдельный CLI Claude Code сам этот файл не читает.

## Переменные окружения сервера

Переменные клиента (`MAX_MCP_OUTPUT_TOKENS`, `ENABLE_TOOL_SEARCH`) — в [mcp-channel.md](mcp-channel.md). Порт и хост на стороне Blender — раздел «Порт и хост» в [mcp-servers.md](mcp-servers.md).

Официальный сервер:

| Переменная | Что задаёт | По умолчанию |
|---|---|---|
| `BLENDER_MCP_HOST` | хост, который слушает расширение | `localhost` |
| `BLENDER_MCP_PORT` | порт, который слушает расширение | `9876` |
| `BLENDER_PATH` | путь к Blender для инструментов `*_for_cli` | `blender` |

Сервер сообщества:

| Переменная | Что задаёт | По умолчанию |
|---|---|---|
| `BLENDER_HOST` | хост аддона; флаг `--host` сильнее | `localhost` |
| `BLENDER_PORT` | порт аддона; флаг `--port` сильнее; нечисловое значение — откат к 9876 | `9876` |
| `DISABLE_TELEMETRY` (синонимы `BLENDER_MCP_DISABLE_TELEMETRY`, `MCP_DISABLE_TELEMETRY`) | значение `true`, `1`, `yes` или `on` выключает телеметрию целиком, включая минимальные события | не задано |
| `BLENDER_MCP_SAFE_MODE` | значение `true`, `1`, `yes` или `on` включает проверку кода `execute_blender_code` перед исполнением | не задано |

### Как передать переменные

Claude Code — флагом `-e KEY=value` у `claude mcp add`, перед `--` и командой сервера:

```bash
claude mcp add blender -e BLENDER_PORT=9001 -e DISABLE_TELEMETRY=true -- uvx mcp-for-blender
```

ЕСЛИ сервер уже зарегистрирован и переменные надо сменить → `claude mcp remove blender`, затем `claude mcp add` с новыми `-e`, затем перезапуск сессии.

Claude Desktop и `.mcp.json` — блок `env` записи сервера:

```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["mcp-for-blender"],
      "env": {
        "BLENDER_PORT": "9001",
        "DISABLE_TELEMETRY": "true"
      }
    }
  }
}
```
