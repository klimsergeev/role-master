# Скрипты и аддоны для пользователя

## Назначение

Как выполнить Python-код в Blender без MCP и как упаковать и установить аддон или расширение — для кода, который запускает сам пользователь. Значения — по Blender 5.3, срез 2026-11-16; функции API — в [python-api.md](python-api.md), запуск из терминала — в [command-line.md](command-line.md).

## Способы выполнить код

| Способ | Как | Когда подходит |
|---|---|---|
| Текстовый редактор | открыть или вставить скрипт, Run Script (Alt-P); оператор — `bpy.ops.text.run_script()` | разовый скрипт в открытой сцене |
| Консоль Python | ввод в приглашении `>>>`; имена `C` — `bpy.context`, `D` — `bpy.data`; автодополнение — Tab; Copy as Script (Shift-Ctrl-C) копирует историю | проба выражений, осмотр данных |
| Файл из командной строки | `blender --python /путь/script.py`, `--python-text <имя>`, `--python-expr <выражение>` | пакетная обработка, рендер — [command-line.md](command-line.md) |
| Файл из скрипта | `bpy.ops.script.python_file_run(filepath='')` или `exec(compile(open(filename).read(), filename, 'exec'))` | внешний файл из текстового редактора |
| Импорт модуля | `import some_module`, после правки — `importlib.reload()` | код, разложенный по модулям |
| Текстовый блок с опцией Register | исполняется при загрузке `.blend` — только при разрешённом автозапуске ([security.md](security.md)) | код, который должен жить в файле |
| Каталог `scripts/startup` | файл импортируется при каждом запуске Blender | постоянная настройка своего Blender |
| Аддон или расширение | при включении загружается как модуль Python | панель, оператор, инструмент для многократного использования |

- Скрипт, регистрирующий классы (панели, операторы), оформляется аддоном, а не запускается напрямую: при прямом запуске к классам потом трудно получить доступ, например чтобы снять регистрацию.
- Опция Live Edit текстового редактора исполняет скрипт при каждом изменении.
- Скрипты загружаются из папки `scripts` локального, системного и пользовательского путей; дополнительный путь — Preferences ‣ File Paths.
- Вывод `print()` и трассировки ошибок видны в терминале, из которого запущен Blender, и не всегда — в интерфейсе: раздел «Вывод и ошибки» в [command-line.md](command-line.md).

## Аддон: расширение или legacy

С 4.2 в Blender есть платформа расширений. Расширение — архив `.zip` с файлами и манифестом `blender_manifest.toml`; типы — аддоны, темы, библиотеки ассетов. Аддон с `bl_info` (legacy) поддерживается, но упаковка считается устаревшей.

- ЕСЛИ аддон новый → расширение: минимум `blender_manifest.toml` и `__init__.py` в архиве.
- ЕСЛИ аддон нужен в Blender ниже 4.2 → legacy с `bl_info`.
- ЕСЛИ legacy-аддон переводится в расширение → создать манифест, убрать `bl_info`, заменить имя модуля на `__package__`, перейти на относительные импорты, внешние зависимости упаковать в колёса (wheels).

Манифест. Набор обязательных полей манифеста не установлен; образец — манифест действующего расширения «MCP» (Blender Lab, 1.0.0) целиком:

```toml
schema_version = "1.0.0"

id = "mcp"
version = "1.0.0"
name = "MCP"
tagline = "MCP server add-on for LLM interaction"
maintainer = "Blender Lab"
type = "add-on"
website = "https://www.blender.org/lab/mcp-server/"
blender_version_min = "5.1.0"

license = [
  "SPDX:GPL-3.0-or-later",
]

tags = ["Development"]

[permissions]
network = "Runs a local TCP socket server for MCP client communication"
```

Разрешения в `[permissions]`: `files`, `network`, `clipboard`, `camera`, `microphone`; у каждого — пояснение до 64 символов. Манифест, собранный по образцу, проверяется `blender --command extension validate` до упаковки; архив собирает `blender --command extension build`.

Доступ в интернет. Аддон с сетевыми запросами проверяет `bpy.app.online_access` и не ходит в сеть, если доступ выключен (настройка Allow Online Access, флаги `--offline-mode` и `--online-mode`).

## Установка расширения

| Откуда | Как |
|---|---|
| С сайта | перетащить ссылку установки в окно Blender |
| Из Blender | найти расширение по имени в настройках и нажать Install |
| С диска | пункт установки с диска в выпадающем меню в правом верхнем углу настроек или перетаскивание `.zip` в окно; ставится в локальный репозиторий, обновления для него недоступны |
| Командная строка, из репозитория | `blender --command extension install [-h] [-s] [-e] [--no-prefs] PACKAGES`; `-s` — синхронизировать, `-e` — включить после установки |
| Командная строка, из файла | `blender --command extension install-file [-h] -r REPO [-e] [--no-prefs] FILE` — в пользовательский репозиторий |
| Python, из файла | `bpy.ops.extensions.package_install_files(*, filter_glob='*.zip;*.py', directory='', files=(), filepath='', repo='', enable_on_install=True, target='', overwrite=True, url='')` |
| Python, из репозитория | `bpy.ops.extensions.package_install(*, repo_directory='', repo_index=-1, pkg_id='', enable_on_install=True, url='', do_legacy_replace=False)` |

- Прочие команды `blender --command extension`: `list`, `sync`, `update`, `remove`, `repo-list`, `repo-info`, `repo-add`, `repo-remove`, `build`, `validate`, `server-generate`; `--no-prefs` — не менять пользовательские настройки.
- По умолчанию настроены удалённый репозиторий extensions.blender.org и два локальных; можно добавить удалённый репозиторий по URL (с токеном доступа) и локальный.
- Удаление расширения необратимо; для временного отключения — Disable.

## Установка legacy-аддона

- Edit → Preferences → Add-ons → установка с диска, выбрать `.py` (один файл) или `.zip`. После установки аддон не включён — поставить флажок.
- Папку с отдельными `.py` так не установить. Обходной путь: создать каталог, в нём подкаталог `addons` (имя обязательно), положить туда папку аддона, добавить каталог в Preferences ‣ File Paths ‣ Script Directories, сохранить настройки и перезапустить Blender.
- Python: `bpy.ops.preferences.addon_install(*, overwrite=True, enable_on_install=False, target='', filepath='', filter_folder=True, filter_python=True, filter_glob='*.py;*.zip')`, `bpy.ops.preferences.addon_enable(*, module='')`, `bpy.ops.preferences.addon_disable(*, module='')`, `bpy.ops.preferences.addon_refresh()`.
- Командная строка: включить на запуск — `--addons <аддон1,аддон2>` (через запятую без пробелов).
- Модуль `addon_utils` в справке API 5.3 не описан.

Источники расходятся о названии пункта установки с диска в Blender 5.3: одна позиция — пункт выпадающего меню Install from Disk; другая — кнопка «Install…»; третья — кнопка «Install legacy Add-on». Искать нужно пункт установки из файла в настройках Add-ons или Get Extensions.
