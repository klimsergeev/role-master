# Установка, регистрация и справочник настроек

Файл двухчастный. Часть 1 — действия и места: чем ставить сервер, что выполнить, куда записывается конфигурация, как доставить секрет. Часть 2 — нейтральный справочник: что вообще можно задать, что стоит по умолчанию, что каждое значение включает и чем оборачивается решение его тронуть.

Скилл не навязывает набор значений и не говорит «мы включаем вот эти флаги». Какие флаги включить — решает владелец базы под свою задачу; здесь описано, из чего выбирать и какова цена каждого выбора.

**Разметка провенанса** используется по всему файлу:

| Метка | Что значит |
|---|---|
| `[код 0.1.0]` | прочитано в исходниках `aadversteeg/mssqlclient-mcp-server`, тег `0.1.0` |
| `[README]` | взято из README сервера того же тега |
| `[пакет]` | проверено распаковкой `.nupkg` с nuget.org |
| `[док CC]` | документация Claude Code |
| `[док MS]` | документация Microsoft |

Живого прогона сервера в этом скилле нет: на машине, где он писался, не оказалось ни .NET SDK, ни Docker. Всё, что ниже, — код, README и документация. Места, где «задано» и «работает» — разные утверждения, помечены отдельно.

---

## Часть 1. Установка и регистрация

### Шаг 1. Проверить, что есть на машине

У сервера два пути установки, и оба внешние. Что выбрать — определяется тем, что фактически стоит, а не предпочтением.

```bash
dotnet --version          # нужен .NET 10 SDK для пути A
dotnet --list-sdks        # проверить, что среди SDK есть 10.x
docker --version          # для пути B
docker info               # демон должен быть запущен, не только клиент установлен
```

- **`dotnet` есть и SDK 10.x есть** → путь A (.NET tool) доступен.
- **`dotnet` есть, но SDK старее 10** → `dotnet tool exec` не сработает: команда появилась в .NET 10 [README]. Остаётся глобальная установка (тоже требует .NET 10 SDK по README) или Docker.
- **`dotnet` нет, Docker есть** → путь B.
- **Нет ни того ни другого** → установка сервера начинается с установки рантайма, и это отдельный шаг, который скилл не описывает: он ставится средствами машины, а не средствами скилла.

Пакет собран под `net10.0` и требует рантайм Microsoft.NETCore.App 10.0.0 [пакет: `Core.Infrastructure.McpServer.runtimeconfig.json`]. Никакого self-contained варианта в пакете нет.

### Шаг 2. Установить сервер — путь A, .NET tool

Пакет в NuGet называется `Ave.McpServer.MsSqlClient` (идентификатор регистронезависим, в командах README пишется строчными). Тип пакета — `DotnetTool`, команда внутри — `ave-mcpserver-mssqlclient` [пакет: `DotnetToolSettings.xml`].

Два способа:

```bash
# Разовый запуск без постоянной установки (нужен .NET 10 SDK)
dotnet tool exec -y ave.mcpserver.mssqlclient

# Глобальная установка
dotnet tool install --global Ave.McpServer.MsSqlClient
ave-mcpserver-mssqlclient
dotnet tool update --global Ave.McpServer.MsSqlClient   # обновление
```

Про `-y`: «The `-y` flag accepts prompts automatically. The tool is cached locally but not added to your PATH» [README]. README также отмечает, что этот путь «automatically downloads the tool on first use and updates to the latest version on subsequent runs» — то есть версия сервера может смениться под вами между запусками. Хотите зафиксировать версию — ставьте глобально с явной версией.

Что попадает в `command`/`args` конфигурации MCP:

| Способ | `command` | `args` |
|---|---|---|
| `dotnet tool exec` | `dotnet` | `["tool", "exec", "-y", "ave.mcpserver.mssqlclient"]` |
| глобальная установка | `ave-mcpserver-mssqlclient` | не нужны |

Ловушка глобальной установки: `ave-mcpserver-mssqlclient` кладётся в `~/.dotnet/tools`, и этот каталог обязан быть в `PATH` **того процесса, который запускает Claude Code**. В терминале он обычно есть, при запуске из GUI — часто нет. Симптом и разбор — в [failures.md](failures.md).

### Шаг 3. Установить сервер — путь B, Docker

```bash
docker pull aadversteeg/mssqlclient-mcp-server:latest
```

Образ — Linux, собран поверх `mcr.microsoft.com/dotnet/runtime:10.0-noble-chiseled-extra`, точка входа `dotnet Core.Infrastructure.McpServer.dll` [код 0.1.0: `Dockerfile`]. Тег `latest` на момент сбора фактуры указывает на ту же сборку, что тег `0.1.0`.

Запуск как stdio-сервера MCP:

```json
"mssql": {
  "command": "docker",
  "args": [
    "run", "--rm", "-i",
    "-e", "MSSQL_CONNECTIONSTRING=${MSSQL_CONNECTIONSTRING}",
    "-e", "DatabaseConfiguration__EnableExecuteQuery=true",
    "aadversteeg/mssqlclient-mcp-server:latest"
  ]
}
```

Три вещи, без которых Docker-путь не работает:

1. **`-i` обязателен.** Без него у контейнера нет открытого stdin, а транспорт сервера — stdio [код 0.1.0: `WithStdioServerTransport()`]. Симптом — сервер «стартовал и сразу умер».
2. **`--rm` желателен.** Каждый запуск Claude Code поднимает новый контейнер; без `--rm` они копятся.
3. **`localhost` внутри контейнера — это сам контейнер, а не хост.** База, которая на хосте слушает `localhost:1433`, из контейнера по такому адресу не видна. На Docker Desktop адрес хоста — `host.docker.internal`; в Linux-докере — адрес хоста в сети docker0 или `--network host`.

Ещё ограничение пути B: «Integrated Security (Windows Authentication) is not supported when running in Docker containers. Use SQL Server authentication instead» [README].

### Шаг 4. Зарегистрировать сервер в Claude Code

Базовый синтаксис [док CC]:

```bash
claude mcp add [options] <name> -- <command> [args...]
```

Роль разделителя `--`: «For stdio servers, the `--` (double dash) separates Claude's own options, such as `--transport`, `--env`, and `--scope`, from the command and arguments that run the server. Everything after `--` is passed to the server untouched» [док CC]. Без `--` Claude Code попытается разобрать флаги сервера как свои.

**Ловушка `--env`,** дословно: «`--env` accepts multiple `KEY=value` pairs. If the server name comes directly after `--env`, the CLI reads the name as another pair and rejects it, so place at least one other option between `--env` and the server name» [док CC]. То есть `claude mcp add --env FOO=bar mssql -- …` будет отвергнута; между `--env` и именем нужен другой флаг, либо `--env` ставится после имени сервера.

Регистрация .NET tool:

```bash
claude mcp add --scope local mssql \
  --env MSSQL_CONNECTIONSTRING="${MSSQL_CONNECTIONSTRING}" \
  --env DatabaseConfiguration__EnableExecuteQuery=true \
  -- dotnet tool exec -y ave.mcpserver.mssqlclient
```

Регистрация Docker:

```bash
claude mcp add --scope local mssql \
  -- docker run --rm -i \
     -e MSSQL_CONNECTIONSTRING="${MSSQL_CONNECTIONSTRING}" \
     -e DatabaseConfiguration__EnableExecuteQuery=true \
     aadversteeg/mssqlclient-mcp-server:latest
```

Во втором случае переменные едут не через `--env` Claude Code, а через `-e` самого `docker run`: всё после `--` уходит команде нетронутым.

**`claude mcp add` ничего не проверяет.** Дословно: «The `claude mcp add` command saves the configuration without validating credentials» [док CC]. Печать `Added …` означает «конфигурация записана», и только. Первая настоящая проба — вызов инструмента.

Зарезервированные имена серверов, которые `claude mcp add` отклоняет: `workspace`, `claude-in-chrome`, `computer-use`, `Claude Preview`, `Claude Browser` [док CC].

### Шаг 5. Выбрать область регистрации

| Область | Где загружается | Делится с командой | Где хранится |
|---|---|---|---|
| `local` (по умолчанию) | только текущий проект | нет | `~/.claude.json` под путём проекта |
| `project` | только текущий проект | да, через систему контроля версий | `.mcp.json` в корне репозитория |
| `user` | все проекты | нет | `~/.claude.json` |

Все три — дословно из таблицы [док CC].

Свойства, влияющие на выбор:

- **`local`** держит регистрацию рядом с проектом и не попадает в git. Совпадает с хранением секрета на проект.
- **`project`** кладёт `.mcp.json` в корень репозитория, и файл уезжает в git — поэтому пароль там обязан идти через `${VAR}`, а не значением. Плюс проектные серверы требуют одобрения: «Claude Code prompts for approval in interactive sessions before using project-scoped servers from `.mcp.json` files. To reset those approval choices, run `claude mcp reset-project-choices`» [док CC].
- **`user`** распространяет сервер на все проекты машины. Для подключения к конкретной базе это обычно избыточно.

Отдельная путаница в терминах, о которой предупреждает сама документация: «The term "local scope" for MCP servers differs from general local settings. MCP local-scoped servers are stored in `~/.claude.json` (your home directory), while general local settings use `.claude/settings.local.json` (in the project directory)» [док CC]. Это разные файлы и разные механизмы.

**Приоритет при дубликатах** [док CC]: local → project → user → серверы плагинов → коннекторы claude.ai. «The entire server entry from that source is used; fields are not merged across scopes» — запись берётся целиком из источника с высшим приоритетом, поля между областями не сливаются. Три области сопоставляют дубликаты по имени, плагины и коннекторы — по эндпоинту.

### Шаг 6. Доставить строку подключения и пароль

Сервер читает конфигурацию из четырёх источников в порядке возрастания приоритета: `appsettings.json` рядом с бинарником, `appsettings.<Environment>.json`, user secrets, переменные окружения [код 0.1.0: `Program.cs`]. Рабочий источник для нас — **переменные окружения**: строка подключения в `MSSQL_CONNECTIONSTRING`, остальное — в `DatabaseConfiguration__*`.

**Пароль не пишется открытым текстом в конфигурацию Claude Code** — ни при какой области регистрации. Он живёт в `.env`-файле проекта, а в конфигурацию попадает ссылкой.

Механика подстановки:

- Claude Code раскрывает `${VAR}` и `${VAR:-default}` в полях `command`, `args`, `env`, `url`, `headers` [док CC]. Работает это не только в `.mcp.json`: документация прямо упоминает «a local- or user-scoped server entry in `~/.claude.json`» как место, где `${VAR}` тоже раскрывается [док CC].
- **Значения берутся из окружения процесса Claude Code.** Механизма автозагрузки `.env`-файла в документации Claude Code нет: поиск по страницам MCP, Settings и Debug your config не даёт ни `dotenv`, ни описания чтения `.env`. Отсутствие механизма — тоже факт, и полагаться на «Claude Code сам подхватит `.env`» нельзя.
- Значит `.env` нужно внести в окружение перед запуском Claude Code:

```bash
set -a; . ./.env; set +a; claude
```

  После этого `${MSSQL_CONNECTIONSTRING}` в блоке `env` записи сервера раскроется в реальное значение.

- Альтернатива, не зависящая от того, из какой оболочки запущен Claude Code: положить значение в блок `env` записи сервера напрямую. Документация именно это и советует при проблемах с окружением: «Set per-server `env` inside the server's `.mcp.json` entry, which doesn't depend on the launch environment or workspace trust» [док CC]. Цена — пароль оказывается в конфигурации открытым текстом; для `project`-области это ещё и попадание в git. Поэтому путь через `.env` + `${VAR}` предпочтён, а этот остаётся как то, что делают, зная цену.

Если переменная не задана: «the config still loads: Claude Code reports a missing-variable warning for that server in `claude mcp list` output and uses the unexpanded `${VAR}` text as-is» [док CC]. То есть сервер получит строкой литерал `${MSSQL_CONNECTIONSTRING}` и упадёт на подключении, а не на старте.

Что видит stdio-сервер помимо своего блока `env`: «its own environment, minus the variables it strips from subprocesses» — то есть окружение самого Claude Code [док CC].

**Пробелы и перевод строки в значении.** Claude Code предупреждает, но не чинит: «Claude Code shows the warning in `claude mcp list` output and in `/mcp`, naming the affected fields without echoing their values, for example `Leading or trailing whitespace in: headers.Authorization`. Claude Code doesn't trim the whitespace and uses the values exactly as written» [док CC]. Пароль, скопированный с завершающим переводом строки, доедет до СУБД вместе с ним.

Чего не делать: не класть пароль в аргументы командной строки. Аргументы видны в списке процессов и попадают в историю оболочки, а блок `env` — нет.

### Шаг 7. Второе подключение — второй сервер

Строка подключения у этого сервера одна на процесс: `MSSQL_CONNECTIONSTRING` читается один раз при старте, и режим (Database или Server) определяется в тот же момент [код 0.1.0: `Program.cs`]. Способа держать две базы в одном процессе нет.

Поэтому две базы — это две записи с разными именами:

```bash
claude mcp add --scope local mssql-sales  --env MSSQL_CONNECTIONSTRING="${SALES_CONNSTR}"  -- dotnet tool exec -y ave.mcpserver.mssqlclient
claude mcp add --scope local mssql-crm    --env MSSQL_CONNECTIONSTRING="${CRM_CONNSTR}"    -- dotnet tool exec -y ave.mcpserver.mssqlclient
```

Имена инструментов разводятся именем сервера: `mcp__mssql-sales__execute_query` и `mcp__mssql-crm__execute_query`. Это же имя используется в правилах `permissions` — см. [read-only-layers.md](read-only-layers.md).

Флаги у двух серверов независимы: можно включить `EnableExecuteQuery` одному и не включать другому.

### Шаг 8. Ловушки размещения конфигурации

Каждая строка — дословный симптом из таблицы диагностики [док CC].

| Симптом | Причина | Что делать |
|---|---|---|
| «MCP servers in `.mcp.json` never load» | «File is under `.claude/`, or its servers sit under a top-level `servers` key, as in VS Code's `mcp.json`, instead of `mcpServers`» | `.mcp.json` кладётся в корень репозитория, серверы — под ключом `mcpServers` |
| «MCP servers added under `mcpServers` in `settings.json` never appear» | «`settings.json` does not read an `mcpServers` key» | Проектные серверы — в `.mcp.json`; пользовательские — `claude mcp add --scope user` |
| «MCP server fails to start from some directories» | «`command` or `args` uses a relative file path» | Абсолютные пути для локальных скриптов; `dotnet`, `docker`, `npx` из `PATH` работают как есть |
| «Project MCP server added but doesn't appear» | «The one-time approval prompt was dismissed» | `/mcp` → одобрить; сбросить выбор — `claude mcp reset-project-choices` |
| «MCP server starts without expected environment variables» | «The server's config entry doesn't set them, and they aren't in the environment Claude Code passes to stdio servers» | Задать `env` в записи сервера либо экспортировать в окружение до запуска `claude` |

Относительные пути в `command` резолвятся от директории запуска Claude Code, а не от расположения `.mcp.json` — это отдельно оговорено: «Relative file paths in `command` or `args` are a frequent cause, since they resolve against the directory you launched Claude Code from rather than the location of `.mcp.json`» [док CC].

### Шаг 9. Самопроверка

```bash
claude mcp list          # статус сервера и предупреждения конфигурации
claude mcp get mssql     # деталь отказа на строке Issue:
```

Внутри сессии — `/mcp`: счётчик и состав инструментов. Состав сверяется с включёнными флагами по таблице гейта из части 2. Что делать, если сошлось не так, — [failures.md](failures.md).

---

## Часть 2. Справочник настроек сервера

### Как параметры вообще задаются

Схема ASP.NET Core: имя секции, двойное подчёркивание, имя свойства.

```
DatabaseConfiguration__EnableExecuteQuery=true
DatabaseConfiguration__MaxCellOutputLength=0
```

Отдельно стоит `MSSQL_CONNECTIONSTRING` — она не входит в секцию `DatabaseConfiguration` и читается напрямую [код 0.1.0: `Program.cs`].

Сервер понимает и **legacy-имена без префикса** — `EnableExecuteQuery`, `EnableExecuteStoredProcedure`, `EnableStartQuery`, `EnableStartStoredProcedure`. Они читаются после связывания секции и **переопределяют** значение из `DatabaseConfiguration__…`, если заданы [код 0.1.0: `Program.cs`, блок «Override with legacy configuration values»]. Практических следствия два:

- В скилле и в конфигурации пишется полная форма: она однозначна и не конфликтует с чужими переменными окружения с общими именами.
- Если инструмент появился при выключенном, как вам казалось, флаге — проверьте, нет ли в окружении legacy-имени: оно победит.

Легаси-переопределение существует только для четырёх `Enable*`. Остальные параметры задаются исключительно полной формой.

### Полный состав `DatabaseConfiguration`

Умолчания — из класса конфигурации [код 0.1.0: `DatabaseConfiguration.cs`]; `appsettings.json`, который едет в пакете, повторяет их все, кроме `MaxCellOutputLength` — у него значение живёт только в коде [пакет].

| Параметр | Умолчание | Что задаёт и чем оборачивается умолчание |
|---|---|---|
| `EnableExecuteQuery` | `false` | Регистрирует `execute_query` (в Server Mode — `execute_query_in_database`). Пока флаг выключен, запросов к данным нет вовсе: доступно только чтение схемы. С включённым флагом через инструмент проходит любой T-SQL — валидации у сервера нет |
| `EnableExecuteStoredProcedure` | `false` | Регистрирует `execute_stored_procedure`. Последствие, которое надо знать заранее: `EXECUTE` — документированный путь в обход запрета на запись через цепочку владения, см. [read-only-layers.md](read-only-layers.md) |
| `EnableStartQuery` | `false` | Регистрирует фоновый `start_query` и — вместе с ним — шесть инструментов сессий и таймаутов. Зачем: выводит долгий запрос за бюджет одного вызова. Цена: шесть лишних инструментов в контексте, живые соединения между вызовами и другой формат результата (см. ниже) |
| `EnableStartStoredProcedure` | `false` | Регистрирует фоновый `start_stored_procedure`; те же шесть инструментов сессий и те же последствия `EXECUTE`, что у синхронного варианта |
| `MaxCellOutputLength` | `40` | Потолок ширины колонки в выводе `execute_query`. Значение длиннее обрезается с `"..."`. `0` выключает обрезку целиком. Переопределяется на отдельный вызов параметром `maxCellOutputLength`. Механика тоньше, чем «сорок символов на ячейку» — разбор в [limits.md](limits.md) |
| `DefaultCommandTimeoutSeconds` | `30` | Таймаут одной SQL-операции. Меняется на лету инструментом `set_command_timeout` (доступен только когда включены сессии), допустимый диапазон 1–3600 секунд [README] |
| `ConnectionTimeoutSeconds` | `15` | Заявлен как таймаут установления соединения, но **в коде 0.1.0 к соединению не применяется**: единственные два места, где он встречается, — объявление в классе конфигурации и вывод в отчёте `get_command_timeout` [код 0.1.0]. Соединения создаются как `new SqlConnection(connectionString)` без установки таймаута, поэтому фактическое значение задаётся драйвером — 15 секунд, если в строке подключения не указано иное [док MS]. Совпадение умолчаний маскирует расхождение: поднять этот параметр до 60 и ждать эффекта бесполезно, таймаут соединения меняется в строке подключения, см. [connection-string.md](connection-string.md) |
| `TotalToolCallTimeoutSeconds` | `120`, допускает `null` | Общий бюджет одного вызова инструмента. `null` отключает бюджет. При исчерпании вызов возвращает текст `Total tool timeout of {N}s exceeded after {M}s` [код 0.1.0: `ToolCallTimeoutContext`] |
| `MaxConcurrentSessions` | `10` | Потолок одновременно **выполняющихся** фоновых сессий. При превышении — `Maximum number of concurrent sessions (10) reached` [код 0.1.0: `QuerySessionManager`] |
| `SessionCleanupIntervalMinutes` | `60` | Двойная роль: и периодичность уборки, и возраст, начиная с которого завершённая сессия удаляется. Уборщик удаляет сессии, завершившиеся раньше, чем «сейчас минус интервал» [код 0.1.0: `QuerySessionManager.CleanupCompletedSessions`] |

Ни одна строка этой таблицы не является рекомендацией проекта. Это описание того, что делает переключатель.

### Гейт: какой флаг какие инструменты регистрирует

Механизм буквально такой: при старте сервер проверяет флаг и либо вызывает регистрацию класса инструментов, либо печатает в stderr строку вида `ExecuteQueryTool registration skipped (EnableExecuteQuery is false)` [код 0.1.0: `Program.cs`]. Выключенный инструмент не существует для клиента: его нет в `tools/list`, и вызвать его нельзя. Поэтому состояние гейта проверяется снаружи — счётчиком и составом инструментов в `/mcp`, а не чтением конфигурации.

**Доступны всегда, без единого флага:**

| Database Mode | Server Mode |
|---|---|
| `server_capabilities` | `server_capabilities` |
| `list_tables` | `list_tables_in_database` |
| `get_table_schema` | `get_table_schema_in_database` |
| `list_stored_procedures` | `list_stored_procedures_in_database` |
| `get_stored_procedure_definition` | `get_stored_procedure_definition_in_database` |
| `get_stored_procedure_parameters` | `get_stored_procedure_parameters` |
| — | `list_databases` |
| **итого 6** | **итого 7** |

Две вещи, которые видно только в коде:

- `list_databases` существует **только в Server Mode** [код 0.1.0: регистрируется внутри ветки `isServerMode`]. В Database Mode списка баз нет.
- `get_stored_procedure_parameters` — единственный инструмент, у которого Server-вариант **не получил суффикса** `_in_database`: оба класса объявляют одно и то же имя [код 0.1.0]. README подаёт его отдельным разделом «get_stored_procedure_parameters (Server Mode)». На состав `tools/list` это не влияет — режимы взаимоисключающие, — но при чтении README сбивает.

**Добавляет каждый флаг:**

| Флаг | Database Mode | Server Mode | Сколько прибавится |
|---|---|---|---|
| `EnableExecuteQuery` | `execute_query` | `execute_query_in_database` | +1 |
| `EnableExecuteStoredProcedure` | `execute_stored_procedure` | `execute_stored_procedure_in_database` | +1 |
| `EnableStartQuery` | `start_query` | `start_query_in_database` | +1 |
| `EnableStartStoredProcedure` | `start_stored_procedure` | `start_stored_procedure_in_database` | +1 |
| `EnableStartQuery` **или** `EnableStartStoredProcedure` | `get_session_status`, `get_session_results`, `list_sessions`, `stop_session`, `get_command_timeout`, `set_command_timeout` | те же шесть | +6 |

Последняя строка — расхождение README с кодом, и права здесь сторона кода. README относит инструменты сессий и таймаутов к разделу «Common Tools (Available in Both Modes)», из чего читается, что они есть всегда. В коде они регистрируются под условием `if (dbConfig.EnableStartQuery || dbConfig.EnableStartStoredProcedure)` [код 0.1.0: `Program.cs`]. Практическое следствие: **`get_command_timeout` и `set_command_timeout` недоступны, пока не включён хотя бы один из двух флагов сессий** — то есть менять таймаут на лету, не включая фоновые сессии, нельзя.

**Чего в этом списке нет и не будет.** Отдельных инструментов для динамических административных представлений у сервера не существует: DMV читаются обычным запросом через `execute_query`, как любая другая таблица, — и, значит, только при включённом `EnableExecuteQuery`. Что именно вернут представления под конкретными правами и какие права для них нужны — вопрос языка и модели прав, он в скилле `skill-tsql`.

Версию СУБД проще всего узнать запросом `SELECT @@VERSION`; инструмент `server_capabilities` даёт более развёрнутую картину возможностей экземпляра. Процедура профилирования сервера по версии — в скилле `skill-tsql`.

**Ожидаемый счётчик инструментов** — это и есть содержание самопроверки при подключении:

| Конфигурация | Database Mode | Server Mode |
|---|---|---|
| все `Enable*` выключены | 6 | 7 |
| только `EnableExecuteQuery` | 7 | 8 |
| все четыре включены | 16 | 17 |

Если счётчик не сходится:

- **`execute_query` виден, а флаг вы не включали** — доехала не та конфигурация: сработало legacy-имя, или значение пришло из `appsettings.json` рядом с бинарником, или из user secrets.
- **Флаг включён, инструмента нет** — переменная не дошла до процесса. Проверить форму имени (`DatabaseConfiguration__`, ровно два подчёркивания), кавычки, `-e` у Docker, и то, что переменная задана там, откуда Claude Code запускает сервер.
- **Появились `*_in_database`-варианты, хотя вы их не ждали** — сервер в Server Mode, потому что в строке подключения не указана база.

### Database Mode против Server Mode

Режим не переключается флагом. Он определяется тем, указана ли база в строке подключения: сервер разбирает её и смотрит `InitialCatalog`, а если не нашёл — ищет подстроки `Database=` и `Initial Catalog=` напрямую [код 0.1.0: `Program.IsServerMode`]. Пусто — Server Mode.

| | Database Mode | Server Mode |
|---|---|---|
| Строка подключения | содержит `Database=` или `Initial Catalog=` | не содержит ни того ни другого |
| Периметр | одна база | все базы экземпляра |
| Имена инструментов | без суффикса | с суффиксом `_in_database` (кроме `get_stored_procedure_parameters`) |
| Список баз | недоступен | `list_databases` |
| Как выбирается база в вызове | никак, она одна | параметром `databaseName` у каждого инструмента |

Как сервер переключает контекст в Server Mode: сначала параметризованным запросом проверяет, что база существует и в состоянии `ONLINE`, затем выполняет `USE [<имя>]` на том же соединении [код 0.1.0: `DatabaseService.ExecuteQueryAsync`]. Для Azure SQL Database, где `USE` не работает, вместо этого пересобирается строка подключения с нужным `InitialCatalog`.

Последствие для периметра доступа: Server Mode распространяет доступ на все базы экземпляра, и права учётной записи действуют в каждой из них по отдельности. Ограничение записи, настроенное в одной базе, о других ничего не говорит — разбор в [read-only-layers.md](read-only-layers.md).

### Как параметры взаимодействуют между собой

**Таймауты вложены.** На каждый вызов сервер заводит бюджет `TotalToolCallTimeoutSeconds` (120 с) и внутри него отмеряет команде `DefaultCommandTimeoutSeconds` (30 с). Эффективный таймаут команды считается как минимум из настроенного значения и остатка бюджета, но не меньше одной секунды [код 0.1.0: `ToolCallTimeoutContext.GetEffectiveCommandTimeout`]. Отсюда: поднимать `DefaultCommandTimeoutSeconds` выше `TotalToolCallTimeoutSeconds` бессмысленно — бюджет всё равно обрежет. Поднимать надо оба.

Выше этих двух лежит третий потолок — со стороны Claude Code. Он от сервера не зависит и разобран в [limits.md](limits.md).

**Сессии живут дольше вызова.** Фоновая сессия держит соединение и накапливает результат в памяти процесса сервера до уборки. При `MaxConcurrentSessions=10` и `SessionCleanupIntervalMinutes=60` это до десяти одновременных выборок в памяти и до часа хранения завершённых. Сессии не переживают перезапуск процесса: они хранятся в памяти, а не на диске [код 0.1.0: `QuerySessionManager`, `ConcurrentDictionary`].

**У сессий другой формат результата.** `execute_query` рисует выравненную таблицу и применяет `MaxCellOutputLength`; `get_session_results` отдаёт JSON, внутри которого результат лежит строкой в формате TSV, и **обрезка ячеек к нему не применяется вообще** [код 0.1.0: `QuerySessionManager` формирует результат через `string.Join("\t", …)`]. Зато у `get_session_results` есть параметр `maxRows`, которого нет у `execute_query`. Что из этого следует для объёма вывода — в [limits.md](limits.md).

**У `execute_query` есть три параметра вызова помимо запроса** [код 0.1.0: `ExecuteQueryTool`]:

| Параметр | Умолчание | Что делает |
|---|---|---|
| `timeoutSeconds` | из конфигурации | таймаут этой операции |
| `includeIoStats` | `false` | добавляет постабличную статистику ввода-вывода: сервер выполняет `SET STATISTICS IO ON` |
| `includeExecutionPlan` | `false` | добавляет фактический XML-план: сервер выполняет `SET STATISTICS XML ON` |
| `maxCellOutputLength` | из конфигурации | обрезка ячеек только для этого вызова |

Стоит знать: **`SET STATISTICS TIME ON` сервер выполняет перед каждым запросом всегда**, отдельной командой, независимо от параметров [код 0.1.0: `DatabaseService.ExecuteQueryAsync`]. Поэтому к результату всегда приписана строка `Execution time: …ms (server: …ms, CPU: …ms)`.

### Что настраивается не здесь

| Что | Где |
|---|---|
| Содержимое строки подключения — TLS, порт, экземпляр, аутентификация | [connection-string.md](connection-string.md) |
| Пороги вывода и таймауты со стороны Claude Code | [limits.md](limits.md) |
| Правила `permissions` и другие механизмы ограничения записи | [read-only-layers.md](read-only-layers.md) |
| Что делать, когда не сходится | [failures.md](failures.md) |
