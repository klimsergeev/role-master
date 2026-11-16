# MCP-серверы Blender

## Назначение

Справочник двух MCP-серверов для Blender: устройство канала, как опознать установленный аддон, условия выбора сервера, инструменты и их ответы, порт и хост, совместимость с версиями Blender.

## Срез данных

Значения файла сняты 2026-11-16. Если установленный аддон или сервер показывает другое — верно показанное.

- Официальный сервер Blender Lab: последний выпуск `v1.0.3` от 2026-09-11 — архив расширения `mcp-1.0.3.zip` и пакет сервера `blender-1.0.3.mcpb`. В основной ветке репозитория код тот же, но коммит повышения версии в неё не влит: манифест расширения несёт 1.0.0, `mcp/pyproject.toml` и `mcp/manifest.json` — 1.0.2. Поэтому в строке Version установленного расширения может стоять 1.0.0, а сервер из клона репозитория называет себя 1.0.2.
- Сервер сообщества: пакет `mcp-for-blender` 2.3.0 от 2026-11-15, репозиторий `github.com/ahujasid/mcp-for-blender` (прежний адрес `github.com/ahujasid/blender-mcp` перенаправляет туда). Прежнее имя пакета `blender-mcp` на PyPI — пакет-переадресация 2.0.0. Аддон `addon.py`: версия в `bl_info` — `(2, 0)`, протокол `ADDON_PROTOCOL_VERSION = 16`.
- Blender: текущий выпуск 5.3, LTS — 5.2 и 4.5.

## Устройство канала

```
MCP-клиент  <-- stdio -->  MCP-сервер (отдельный процесс)  <-- TCP localhost:9876 -->  расширение или аддон в Blender
```

- Расширение или аддон в Blender — мост: слушает сокет, исполняет присланное и возвращает JSON. MCP-сервер — отдельная программа; её запускает MCP-клиент.
- У официального сервера каждый инструмент передаёт в расширение Python-код, расширение исполняет его через `exec()` и возвращает JSON.
- Серверы несовместимы между собой: сервер одного типа не работает с аддоном другого. Оба по умолчанию используют `localhost:9876`.
- Пакет официального сервера в его репозитории тоже называется `blender-mcp` (`mcp/pyproject.toml`), но это не тот пакет, что на PyPI. `uvx blender-mcp` берёт с PyPI пакет-переадресацию 2.0.0: он ставит `mcp-for-blender`, печатает в stderr уведомление о переименовании и запускает тот же сервер сообщества. Прежняя регистрация `uvx blender-mcp` работает, новая делается командой `uvx mcp-for-blender`; официальный сервер так не запускается.

## Как опознать установленный аддон

1. Открыть Edit → Preferences → Add-ons и найти запись аддона; смотреть строки Maintainer, Version, File.
2. Запись «MCP» с Maintainer Blender Lab, файлы в папке `extensions/lab_blender_org/mcp` — официальное расширение. К нему подключается официальный сервер.
3. Запись «Interface: MCP for Blender», файл `blender_mcp.py` (так его кладёт `install-addon`) или `addon.py` — аддон сообщества. К нему подключается сервер сообщества.
4. Вкладка аддона в боковой панели 3D-вида (клавиша N) — признак аддона сообщества. У официального расширения своей вкладки на боковой панели нет, им управляют только в Preferences. Вкладка аддона сообщества по версиям: в 2.3.0 — «MCP for Blender» с кнопкой «Connect to MCP server» или «Disconnect»; в прежних версиях — «BlenderMCP» с кнопкой «Connect to Claude». Автозапуск сервера аддона и проверка, что он работает, — пункт 5 раздела «Аддон сообщества «MCP for Blender»» в [mcp-setup.md](mcp-setup.md).
5. Открытый порт 9876 доказывает только, что в Blender кто-то слушает, а не что на той стороне совместимый аддон.

## Условия выбора сервера

Правила проверяются по порядку; действует первое сработавшее.

1. ЕСЛИ Blender ниже 5.1 → сервер сообщества: официальное расширение на эту версию не встаёт.
2. ЕСЛИ задача использует библиотеки ассетов (Poly Haven, Sketchfab, Poly Pizza) или генерацию моделей и окружений → сервер сообщества. ЕСЛИ при этом стоит официальное расширение → нужен второй аддон, сообщества; оба по умолчанию слушают порт 9876, поэтому одновременно работает один из них и один клиент (порт меняется по разделу «Порт и хост»).
3. ЕСЛИ задача читает `.blend` без открытого Blender или меняет `.blend`, который не открыт в Blender → официальный сервер, инструменты `*_for_cli`. Этим инструментам расширение в Blender не нужно: они запускают фоновый `blender`, поэтому установленный аддон сообщества выбору не мешает. Условия изменения — в строке `execute_blender_code_for_cli`. На системе, где `blender` нет в `PATH` (macOS по умолчанию), сервер регистрируется с `BLENDER_PATH` — сценарий «Claude Code и официальный сервер» в [mcp-setup.md](mcp-setup.md).
4. ЕСЛИ аддон уже установлен → сервер того же типа.
5. ЕСЛИ задача опирается на поиск по встроенной документации Python API и руководству Blender → официальный сервер (`search_api_docs`, `search_manual_docs`, `get_python_api_docs`).
6. ЕСЛИ клиент — Claude Desktop и пользователь работает без терминала → официальный сервер через коннектор; сценарий — в [mcp-setup.md](mcp-setup.md).
7. Иначе — любой; сценарии обоих — в [mcp-setup.md](mcp-setup.md).

## Сравнение

| Параметр | Официальный (Blender Lab) | Сообщество (`mcp-for-blender`) |
|---|---|---|
| Версия на 2026-11-16 | выпуск 1.0.3 | 2.3.0 |
| Минимальная версия Blender | 5.1.0 | 3.0 |
| Инструментов | 26 | 15, из них 10 видят клиенты без MCP Apps |
| Чтение сцены | `get_objects_summary`, `get_object_detail_summary` | `get_scene_info` |
| Снимок | `get_screenshot_of_area_as_image`, `get_screenshot_of_window_as_image` | `look` |
| Работа без открытого Blender | инструменты `*_for_cli` | нет |
| Ассеты и генерация | нет | Poly Haven, Sketchfab, Poly Pizza; Tripo, Hunyuan3D, Hyper3D Rodin, Meshy; World Labs |
| Интерфейс в Blender | Preferences → Add-ons → MCP, кнопки «Start MCP Bridge Server» и «Stop MCP Server» | вкладка «MCP for Blender» боковой панели 3D-вида (2.3.0) и настройки аддона «Interface: MCP for Blender» |
| Порт и хост по умолчанию | `localhost:9876` | `localhost:9876` |
| Переменные адреса на сервере | `BLENDER_MCP_HOST`, `BLENDER_MCP_PORT` | `BLENDER_HOST`, `BLENDER_PORT` |
| `BLENDER_PATH` | читается (для `*_for_cli`) | не читается |
| Телеметрия | сетевого кода, кроме локального сокета, нет; заявления проекта о сборе данных нет | минимальные анонимные события: включены в 2.2.9, для 2.3.0 не установлено; содержимое — по согласию; подробности — в [security.md](security.md) |
| Запуск сервера | `uv --directory <клон>/mcp run blender-mcp`, коннектор Claude Desktop или пакет `.mcpb` | `uvx mcp-for-blender` (прежняя форма `uvx blender-mcp` работает через переадресацию) |

## Инструменты официального сервера

Срез: выпуск 1.0.3, 2026-11-16. Всего 26: 17 обращаются к открытому Blender, 6 вариантов `*_for_cli` запускают фоновый Blender, 3 работают со встроенной документацией без Blender.

Форма ответа. Инструменты, идущие в открытый Blender, возвращают конверт расширения: `status` (`ok` или `error`), `result` при успехе, `message` при ошибке и, если были, перехваченные `stdout` и `stderr`. Внутри `result` — словарь инструмента со своим полем `status`. Инструменты `*_for_cli` запускают `blender --background <blend_file> --python-expr ...` и возвращают словарь `result` без конверта; путь к Blender — из `BLENDER_PATH` (по умолчанию `blender`), тайм-аут — 120 секунд. Если тот же файл открыт в Blender с несохранёнными изменениями, сервер просит Blender сохранить рядом копию `<имя>_mcp_0001.blend`, работает с ней и удаляет её после.

Пометка «чтение» — аннотация `readOnlyHint`, «изменение» — `destructiveHint`.

| Инструмент | Пометка | Что возвращает |
|---|---|---|
| `execute_blender_code(code)` | изменение | конверт; `result` — словарь, который код присвоил переменной `result`; несериализуемые значения заменяются `repr` |
| `execute_blender_code_for_cli(blend_file, code)` | изменение | словарь `result` из фонового Blender. Файл сам не сохраняется: для изменения код вызывает `bpy.ops.wm.save_mainfile()`. ЕСЛИ файл открыт в Blender с несохранёнными изменениями → код работает с копией, которую сервер затем удаляет, и изменения теряются; ЕСЛИ файл открыт без изменений → сохранение в фоне перезапишет файл на диске, а открытый Blender при своём сохранении затрёт результат. Поэтому менять файл этим инструментом — только когда он не открыт в Blender |
| `get_objects_summary()` | чтение | `scene_name`, `active_workspace`, `active_object`, `object_mode`, `camera_object`, `collections` — дерево коллекций с объектами (`name`, `type`, `parent`, `data_name`, `selected`, `visible`, `hide_viewport`) |
| `get_object_detail_summary(name)` | чтение | `type`, `location`, `rotation`, `scale`, `dimensions`, `parent`, `children`, `modifiers`, `constraints`, `materials`, `visibility`, `data_name`, `collections`; нет объекта — `status="error"` и список доступных |
| `get_blendfile_summary_datablocks()` | чтение | `datablock_counts` (непустые коллекции `bpy.data` с числом элементов), `render_engine`, `scene_name`, `workspaces`, `active_workspace` |
| `get_blendfile_summary_missing_files()` | чтение | `missing_files` (`id_type`, `id_name`, `path`), `total_checked` |
| `get_blendfile_summary_of_linked_libraries()` | чтение | `direct_libraries`, `indirect_libraries` (`filepath`, `name`, `linked_datablocks_count`, у косвенных `parent_library`), `total_library_count` |
| `get_blendfile_summary_path_info()` | чтение | `filepath`, `is_saved`, `is_dirty`, `age_seconds`, `file_size_bytes`, `backups` (до 32 резервных копий) |
| `get_blendfile_summary_usage_guess()` | чтение | `usage_guesses` — пары `score` и `certainty` от 0 до 100 по 11 категориям: Animation, Rendering, Scripting, Video Editing, Modeling, Grease Pencil, Geometry Nodes, Compositing, UV Unwrapping, Motion Tracking, Audio |
| `get_blendfile_summary_datablocks_for_cli(blend_file)` и ещё четыре `get_blendfile_summary_*_for_cli(blend_file)` | чтение | то же, что у одноимённых инструментов без `_for_cli`, из фонового Blender |
| `get_screenshot_of_area_as_image(area_ui_type, size_limit_in_bytes=0)` | чтение | изображение PNG области; `area_ui_type` — одно из 22 значений, например `VIEW_3D`, `IMAGE_EDITOR`, `UV`, `ShaderNodeTree`, `PREFERENCES`; при `size_limit_in_bytes=0` картинка ужимается до 784 896 байт; в фоновом режиме — ошибка |
| `get_screenshot_of_window_as_image(size_limit_in_bytes=0)` | чтение | изображение PNG всего окна Blender, тот же лимит |
| `get_screenshot_of_window_as_json()` | чтение | не картинка, а JSON: размеры окна, `screen_name`, `workspace`, `scene`, `areas` (тип, координаты, для `VIEW_3D` — перспектива, точка вида, затенение, оверлеи), `active_object`, `selected_objects` |
| `jump_to_tab_by_name(name)` | изменение | переключает рабочее пространство; при ошибке — `available_workspaces` |
| `jump_to_tab_by_space_type(space_type, allow_edits=False)` | изменение | переключает на вкладку с нужным редактором; при `allow_edits=True` и отсутствии такой вкладки дублирует текущую |
| `jump_to_view3d_object_by_name(name, allow_edits=False)` | изменение | переводит в режим объекта, снимает выделение со всех, выделяет и показывает объект, выходит из вида камеры; при `allow_edits=True` раскрывает скрытый объект и его коллекции |
| `jump_to_view3d_object_data_by_name(name, allow_edits=False)` | изменение | то же, поиск по имени блока данных |
| `render_thumbnail_to_path(output_path)` | изменение | рендер с длинной стороной 320 пикселей и 16 сэмплами; файл пишется не в `output_path`, а в `bpy.app.tempdir/blender_mcp/<имя файла из output_path>`, фактический путь — в поле `filepath` ответа; ответ приходит после окончания рендера |
| `render_viewport_to_path(output_path)` | чтение | рендер текущими настройками сцены; файл — так же в `bpy.app.tempdir/blender_mcp/<имя файла>`, фактический путь — в поле `filepath` ответа; в открытом Blender ответ приходит после окончания рендера |
| `get_python_api_docs(identifier)` | чтение | без обращения к Blender: статья встроенной документации API по идентификатору; поле `kind` — `exact`, `namespace`, `definition`, `partial`, `suggestions` или `missing` |
| `search_api_docs(query, max_results=20, context=0, index=None)` | чтение | без обращения к Blender: `hits` (`path`, `text`, `breadcrumb`, `index`, `score`) и `truncated` |
| `search_manual_docs(query, max_results=20, context=0, index=None)` | чтение | то же по встроенному руководству пользователя |

Отложенные инструменты — `render_thumbnail_to_path` и `render_viewport_to_path` в открытом Blender (в фоновом Blender они отвечают сразу): ответ приходит после окончания рендера. Расширение ждёт рендер до часа, а MCP-сервер ждёт ответа на сокете до 300 секунд и затем возвращает «Blender connection timed out at <хост>:<порт>»; рендер в Blender при этом продолжается, и файл появится в `bpy.app.tempdir/blender_mcp/`; каталог `bpy.app.tempdir` возвращает вызов `execute_blender_code` с кодом `result = {"tempdir": bpy.app.tempdir}`. Тайм-ауты — версии 1.0.3. Что ограничивает код `execute_blender_code` — раздел «Код от модели» в [security.md](security.md).

## Инструменты сервера сообщества

Срез: версия 2.3.0, 2026-11-16. Зарегистрировано 15 инструментов; пять помечены как инструменты MCP Apps и скрыты от клиентов без поддержки MCP Apps.

| Инструмент | Видят | Что делает и возвращает |
|---|---|---|
| `get_addon_status(user_prompt="")` | все клиенты | JSON-текст: `up_to_date`, `protocol_version`, `expected_protocol_version`, `addon_version`, `capabilities`, `blender_version`, `generators`, `libraries`, `worlds`, `telemetry_consent`, `update_command` и другие поля |
| `get_scene_info(user_prompt="", query=None, root=None, fields=None, limit=20)` | все | текст: строка-заголовок (число объектов, активный, выделение, режим) и по строке на объект; поля — из групп placement (`location`, `size`, `ground`, `rotation`, `scale`, `parent`), contents (`children`, `hidden`, `details`, `materials`, `modifiers`, `animation`), health (`topology`, `weights`) и поле `settings`; по умолчанию `location`, `size`, `children`, `hidden`; отдаёт до `limit` объектов (по умолчанию 20) — ЕСЛИ число объектов в строке-заголовке больше → добрать параметрами `limit`, `query`, `root` |
| `execute_blender_code(code, user_prompt="")` | все | исполняет Python в Blender; возвращает «Code executed successfully: …» с напечатанным выводом или текст ошибки с трассировкой; при `BLENDER_MCP_SAFE_MODE` код сначала проверяется |
| `look(mode=None, target=None, views=None, distance=None, shading=None, frames=None, frame_count=6, view=None, image=None, max_size=768, user_prompt="")` | все | изображение PNG и подпись; `mode` — `viewport`, `camera`, `angles`, `frames`; `shading` — `solid`, `material`, `rendered` (по умолчанию), `wireframe`, `xray`; `image` — показать изображение из файла Blender или по пути к файлу |
| `generate_3d(prompt=None, image=None, name=None, provider="auto", quality=None, bbox_condition=None, pose_mode=None, job=None, wait_seconds=50, user_prompt="")` | все | генерирует модель (`tripo`, `hunyuan3d`, `hyper3d`, `meshy`) и импортирует; возвращает текст с `world_bounding_box` или дескриптор задания для повторного вызова с `job` |
| `generate_gaussian_world(prompt=None, image=None, name=None, resolution="500k", job=None, wait_seconds=50, user_prompt="")` | все | окружение World Labs Marble, импорт как гауссовы сплаты; нужен Blender 5.3 или новее |
| `search_assets(source, query="", asset_type="all", category=None, attributes=None, min_size_m=None, licence=None, animated=False, limit=20, previews=0, user_prompt="")` | все | список ассетов `polyhaven`, `sketchfab` или `polypizza`; при `previews` — до 6 миниатюр |
| `import_asset(source, id, asset_type=None, target_size=None, apply_to=None, resolution="1k", file_format=None, user_prompt="")` | все | скачивает и импортирует ассет; текст отчёта |
| `disable_telemetry(user_prompt="")` | все | выключает сбор содержимого; минимальные анонимные счётчики остаются |
| `record_trajectory_feedback(feedback, correction_text=None, step_index=None, user_prompt="")` | все | отзыв `accept`, `reject`, `undo` или `correction` к шагу; без согласия на телеметрию пропускается |
| `search_mentions(query="")` | только MCP Apps | ссылки `blender://object/<имя>`, `blender://material/<имя>`, `blender://collection/<имя>` для упоминаний |
| `open_viewport()` | только MCP Apps | последний снимок окна вида |
| `viewport_latest(since=0)` | только MCP Apps | снимок, если он новее `since`; к Blender не обращается |
| `viewport_capture(max_size=1000, auto=False)` | только MCP Apps | новый снимок окна вида |
| `viewport_pick(seq, x, y)` | только MCP Apps | объект под точкой клика на снимке |

Кроме инструментов сервер даёт ресурсы `blender://object/{name}`, `blender://material/{name}`, `blender://collection/{name}`.

Удалённые инструменты: `get_viewport_screenshot` и `generate_hyper3d_model_via_images` убраны 2026-09-30, первая версия без них — 2.1.5; `get_hyper3d_status` и `get_hunyuan3d_status` в текущем сервере тоже нет. Клиент, который их показывает, подключён к старой версии сервера. `get_viewport_screenshot` осталось командой аддона, которую сервер вызывает сам для `viewport_capture` и как запасной путь `look`, когда отказал основной скрипт снимка.

## Порт и хост

| Сторона | Официальный | Сообщество |
|---|---|---|
| Аддон в открытом Blender | поля Host и Port в Preferences → Add-ons → MCP (порт от 1024 до 65535); там же Auto Start (по умолчанию включён), Auto Start Delay (1 с), Log, кнопки запуска и остановки | поле Port на вкладке боковой панели (свойство сцены `blendermcp_port`, от 1024 до 65535); адрес прослушивания — настройка аддона Bind Address (по умолчанию `localhost`), адрес не на петле принимается только при включённой Allow Remote Connections |
| Аддон в фоновом Blender | `blender --background file.blend --command blender_mcp --host <хост> --port <порт>` | нет |
| MCP-сервер, адрес аддона | `BLENDER_MCP_HOST`, `BLENDER_MCP_PORT` | `BLENDER_HOST`, `BLENDER_PORT` |
| MCP-сервер, свой адрес для клиента | режим HTTP: `--transport http`, `--host` (по умолчанию `127.0.0.1`), `--port` или `-p` (по умолчанию `8000`); в этом режиме отключена защита от DNS rebinding и CORS открыт для всех источников | — |

Порт меняется с двух сторон одновременно: в Blender (поле Port аддона или расширения; у аддона сообщества 2.3.0 поле видно, пока сервер не подключён) и в переменной MCP-сервера. Значения по умолчанию и правила переменных, а также как передать переменную серверу, — раздел «Переменные окружения сервера» в [mcp-setup.md](mcp-setup.md).

Порт аддона сообщества — свойство сцены: сменённый порт хранится в `.blend`, и при открытии другого файла берётся порт из него. Если порт при автозапуске занят, аддон пишет в вывод Blender «BlenderMCP: <хост>:<порт> is already in use; auto-start skipped.».

Официальное расширение запускает сервер в Blender, только если в Blender разрешён доступ в интернет (настройка Allow Online Access); иначе — сообщение «Online access must be enabled in the system preferences». В фоновом Blender доступ включает флаг `--online-mode`.

## Совместимость с версиями Blender

Срез: 2026-11-16.

| Blender | Официальный | Сообщество |
|---|---|---|
| 5.3 | да | да; генерация окружений World Labs — только с 5.3 |
| 5.2 LTS, 5.1 | да | да |
| 5.0 и 4.x, включая 4.5 LTS | нет: `blender_version_min = "5.1.0"` | да |
| 3.0–3.6 | нет | да |
| ниже 3.0 | нет | нет |

Сообщество задаёт только нижнюю границу (`"blender": (3, 0, 0)` в `bl_info`), верхней нет.