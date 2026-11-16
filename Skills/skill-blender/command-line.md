# Blender из командной строки

## Назначение

Запуск Blender без интерфейса со скриптом — рендер, конвертация, пакетная обработка — и где смотреть вывод и ошибки Blender на macOS, Windows и Linux. Значения — по Blender 5.3, срез 2026-11-16.

## Форма команды

`blender [аргументы] [файл.blend] [аргументы]`. Основная форма для скрипта:

```bash
blender -b scene.blend --python-exit-code 1 --python script.py -- --input in.obj --scale 2
```

Исполняемый файл: macOS — `/Applications/Blender.app/Contents/MacOS/Blender`; Windows (установщик) — `C:\Program Files\Blender Foundation\Blender\blender.exe`; Linux — `./blender` в каталоге установки или `blender`, если он в `PATH`.

## Порядок аргументов

- Аргументы исполняются в том порядке, в котором заданы. `blender --background test.blend --render-frame 1 --render-output "/tmp"` не запишет в `/tmp`: рендер выполнится раньше, чем задан путь. `blender --background --render-output /tmp test.blend --render-frame 1` тоже не запишет: загрузка файла перезаписывает путь. Работает `blender --background test.blend --render-output /tmp --render-frame 1`.
- `-f` и `-a` ставятся последними.
- Аргументы чувствительны к регистру (`-F` и `-f` — разные флаги); слитные флаги вида `-ba` не поддерживаются — Blender завершится на неизвестном аргументе.

## Флаги

| Флаг | Что делает |
|---|---|
| `-b`, `--background` | запуск без интерфейса; аудиоустройство по умолчанию отключено |
| `-P`, `--python <файл>` | исполнить Python-скрипт |
| `--python-text <имя>` | исполнить текстовый блок из `.blend` |
| `--python-expr <выражение>` | исполнить выражение, в том числе многострочный скрипт в пределах длины аргумента платформы |
| `--python-console` | запустить с интерактивной консолью |
| `--python-exit-code <код>` | код выхода 0..255 при исключении Python в скрипте из командной строки; 0 отключает |
| `--python-use-system-env` | разрешить Python переменные окружения системы, например `PYTHONPATH` (включает и `--python-use-user-env`) |
| `--python-use-user-env` | разрешить пользовательский каталог site-packages |
| `--addons <аддоны>` | включить аддоны, через запятую без пробелов |
| `-y` / `--enable-autoexec`, `-Y` / `--disable-autoexec` | разрешить или запретить автозапуск скриптов из `.blend`; по умолчанию `-Y` — подробности в [security.md](security.md) |
| `-f`, `--render-frame <кадр>` | отрендерить кадр и сохранить; `+N`/`-N` — относительно, список через запятую без пробелов, диапазон через `..` |
| `-a`, `--render-anim` | отрендерить кадры от начала до конца включительно |
| `-s`, `--frame-start`; `-e`, `--frame-end`; `-j`, `--frame-jump` | начало, конец, шаг кадров |
| `-S`, `--scene <имя>` | сцена для рендера |
| `-o`, `--render-output <путь>` | путь вывода; `//` — относительно `.blend`; `#` заменяются номером кадра с нулями; без `#` добавляется `####` |
| `-E`, `--engine <движок>` | движок рендера; `-E help` — список |
| `-F`, `--render-format <формат>` | `TGA RAWTGA JPEG IRIS PNG BMP HDR TIFF`, при наличии в сборке `OPEN_EXR OPEN_EXR_MULTILAYER FFMPEG CINEON DPX JP2 WEBP` |
| `-x`, `--use-extension <bool>` | добавлять расширение к имени файла |
| `-t`, `--threads <N>` | потоки 1–1024, 0 — по числу процессоров |
| `--cycles-device <устройство>` | после `--`: `CPU CUDA OPTIX HIP ONEAPI METAL`; `+CPU` — гибридный рендер |
| `-X`, `--factory-startup` | не читать пользовательский `startup.blend` |
| `-c`, `--command <команда>` | исполнить команду, забирающую все оставшиеся аргументы; подразумевает `--background`; `-c help` — список |
| `--disable-depsgraph-on-file-load` | в фоне не строить граф зависимостей при загрузке; скрипт сам вызывает `context.evaluated_depsgraph_get()`; временная опция |
| `--offline-mode` / `--online-mode` | запретить или разрешить доступ в интернет поверх настройки |
| `--log`, `--log-level`, `--log-file` | категории журнала, уровень (`fatal error warning info debug trace`), файл журнала |
| `-q`, `--quiet` | подавить статусный вывод; предупреждения и ошибки печатаются |
| `-v`, `--version` | напечатать версию и выйти |
| `--` | конец разбора опций; дальнейшие аргументы передаются без изменений в `sys.argv` |

## Аргументы скрипту

Аргументы для скрипта ставятся после `--` и читаются из `sys.argv`. Официального примера разбора для `--python` нет; шаблон:

```python
import sys
import argparse

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument("--input")
parser.add_argument("--scale", type=float, default=1.0)
args = parser.parse_args(argv)
```

При неверных аргументах `argparse` вызывает `sys.exit()`, который закрывает Blender немедленно.

## Рендер

Из командной строки:

- кадр: `blender -b file.blend -f 10`;
- кадр с путём и форматом: `blender -b file.blend -o /project/renders/frame_##### -F OPEN_EXR -f -2`;
- анимация: `blender -b file.blend -a`;
- анимация с движком, диапазоном и потоками: `blender -b file.blend -E CYCLES -s 10 -e 500 -t 2 -a`;
- кадры с префиксом рядом с файлом: `blender -b animation.blend -o //render_ -F PNG -x 1 -a`;
- устройство Cycles: `blender -b file.blend -f 20 -- --cycles-device OPTIX`;
- свой файл с драйверами-выражениями: `blender --background --enable-autoexec my_movie.blend --render-anim`.

Из скрипта — `bpy.ops.render.render(write_still=True)` для кадра или `bpy.ops.render.render(animation=True)` для анимации; путь, формат и движок — в `scene.render` ([python-api.md](python-api.md)).

## Коды выхода

- `--python-exit-code <код>` задаёт код выхода при исключении в скрипте `--python`, `--python-text` или `--python-expr`; 0 отключает. Значение по умолчанию не описано, поэтому в пакетной обработке код задаётся явно, например `--python-exit-code 1`.
- Флаг ставится до `--python`, потому что аргументы исполняются по порядку.
- Для команды `-c` код выхода — значение, которое вернул колбэк: 0 — успех, 1 — неудача.
- Код выхода при `sys.exit(N)` из скрипта и при ошибке рендера `-f` или `-a` не описан.

## Свои команды `-c`

`bpy.utils.register_cli_command(id, execute)` регистрирует команду для `blender -c <id> ...`: колбэк получает список строк — все аргументы после идентификатора — и возвращает `int`; запуск через `-c` подразумевает фоновый режим. Встроенные команды — `blender -c help`, команды расширений — `blender --command extension ...` ([scripts-and-addons.md](scripts-and-addons.md)).

## Вывод и ошибки

### Все системы

- Вывод Blender, включая `print()` и трассировки Python, идёт в терминал, из которого Blender запущен. Трассировка не всегда порождает сообщение в интерфейсе. При запуске по значку окна консоли может не быть — для сообщений запуска Blender запускают из терминала.
- Зависший скрипт прерывается Ctrl-C в терминале (на Windows — Ctrl-Break).
- Редактор Info — журнал операторов, ошибок, предупреждений и сообщений; туда попадают только операторы с опцией `REGISTER`. Все вызовы операторов печатает в терминал `--debug-wm` или `bpy.app.debug_wm = True`. С 5.2 отчёты доступны из Python списком только для чтения в `WindowManager`.
- Журнал в файл — `--log-file <путь>`; категории и уровень — `--log`, `--log-level`. С 5.0 формат журнала единый, пример строки: `00:00.244 render | Rendering single frame (frame 1)`.
- Подробная диагностика сбоя — `--factory-startup --debug-all`.
- Журнал сбоя пишется во временный каталог Blender: настройка Preferences ‣ File Paths ‣ Temporary Files, затем переменные окружения, затем `/tmp/`.

Источники расходятся о флагах журнала в 5.3: одна позиция — с 5.0 `--debug-cycles` заменён на `--log cycles`, `--debug-ffmpeg` — на `--log video`, `--verbose` — на `--log-level [info|debug|trace]`; другая — флаги `--verbose`, `--debug-cycles`, `--debug-ffmpeg` по-прежнему перечислены среди аргументов 5.3. Надёжная форма — `--log` и `--log-level`.

Источники расходятся о переменной временного каталога вне Windows: одна позиция — `TMP` и `TMP_DIR`; другая — `TMPDIR` (путь должен указывать на существующий каталог, иначе игнорируется). На Windows обе называют `TEMP`.

### macOS

- Весь вывод виден, если запустить исполняемый файл из терминала: `/Applications/Blender.app/Contents/MacOS/Blender`. Каталог `/Applications/Blender.app/Contents/MacOS` можно добавить в `/etc/paths`.
- После сбоя системный Crash Reporter показывает окно с трассировкой — через некоторое время или при следующем запуске.
- Файлы сбоев — `~/Library/Logs/DiagnosticReports/Blender_YYYY-MM-DD-HHMMSS_<имя машины>.crash`; все отчёты — в Console.app.
- Куда идёт вывод при запуске из Finder или Dock и как называется журнал сбоя Blender во временном каталоге — не описано.

### Windows

- Консольное окно создаётся при запуске и скрывается; показать — Window ‣ Toggle System Console. Флаг `-con` (`--start-console`) запускает с открытой консолью, при `-b` игнорируется.
- После сбоя пишется файл по имени открытого `.blend`: `test.blend` → `test.crash.txt`.
- В каталоге установки — пакетные файлы журналов: `blender_debug_log.cmd` (большинство случаев), `blender_debug_gpu.cmd` и `blender_debug_gpu_workaround.cmd` (ошибки GPU), `blender_factory_startup.cmd` (настройки по умолчанию). При сбое в модуле Blender трассировка — в `blender.crash.txt`, путь к нему — в конце `blender_debug_out.txt`.

### Linux

- Запуск из терминала: `./blender` в каталоге установки или `blender` из `PATH`; многие окружения рабочего стола дают запуск по значку с опцией «Run in terminal».
- После сбоя — `/tmp/blender.crash.txt`.
