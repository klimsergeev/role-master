# Права и видимость метаданных

Отвечает на вопрос: **почему пусто, почему `NULL`, почему «доступ запрещён» — и что я вообще могу здесь прочитать.**

Это шаг 2 рабочего процесса. Без него любой пустой ответ двусмыслен: неизвестно, объекта нет или его не видно.

Здесь только «что увидит запрос». Механизмы запрета записи — роль, `DENY`, режим MCP-сервера, настройки клиента — в скилле `skill-mssql-mcp`.

---

## Базовое правило

> «The visibility of metadata is limited to securables that a user either owns or on which the user has been granted some permission.»

Как это выглядит на практике (дословный перечень со страницы «Metadata visibility configuration»):

- запросы к системным представлениям могут вернуть **подмножество строк или пустой результат**;
- встроенные функции, отдающие метаданные (например, `OBJECTPROPERTYEX`), могут вернуть **`NULL`**;
- процедуры `sp_help*` могут вернуть часть строк или `NULL`;
- приложения, рассчитывающие на публичный доступ к метаданным, ломаются.

**Ошибки при этом не будет.** Пустой результат от каталога — это не «объектов нет», это «строк, которые тебе позволено видеть, нет».

---

## На что правило распространяется, а на что нет

| Распространяется | Не распространяется |
|---|---|
| Каталоги (`sys.*`) | Системные таблицы log shipping |
| Встроенные функции, отдающие метаданные | Системные таблицы планов обслуживания базы |
| Представления совместимости | Системные таблицы репликации |
| Процедуры `sp_help` движка | Системные таблицы SQL Server Agent |
| Представления `INFORMATION_SCHEMA` | Системные таблицы резервного копирования |
| Расширенные свойства | Процедуры `sp_help` репликации и Agent |

---

## Четыре принципа, из которых следует всё остальное

1. **Фиксированные роли.** Метаданные, доступные фиксированной роли, определяются её неявными разрешениями.
2. **Область действия.** Разрешение на одной области подразумевает видимость метаданных на этой области и на всех вложенных. `SELECT` на схему открывает метаданные схемы и всех таблиц, представлений, функций, процедур, синонимов, типов и коллекций XML-схем внутри.
3. **Приоритет `DENY`.** `DENY` перевешивает. Пример из документации: пользователю выдан `EXECUTE` на схему, но запрещён `EXECUTE` на процедуру внутри — метаданных процедуры он не увидит. И наоборот: запрет на схему перевешивает выдачу на объект внутри.
4. **Видимость подкомпонентов идёт от родителя.** Индексы, ограничения, триггеры собственных разрешений не имеют — они видны по правам на таблицу.

**Практическое следствие принципа 4, о котором забывают:** `GRANT SELECT` на **один столбец** открывает метаданные **всей** таблицы, включая все остальные столбцы. Документация формулирует это прямо: «granting `SELECT` on only an individual column of a given table: this allows the grantee to view the metadata of the whole table, including all columns». Видимость метаданных грубее, чем видимость данных.

Отдельная оговорка: `UNMASK` на видимость метаданных не влияет — сам по себе он ничего не раскрывает.

---

## Что не отдадут никогда (не подлежит принудительному раскрытию)

- **Исходный текст модуля** — процедуры, триггера, функции, представления. Виден, только если у пользователя есть `VIEW DEFINITION` на объект, либо (при отсутствии `DENY VIEW DEFINITION`) `CONTROL`, `ALTER` или `TAKE OWNERSHIP`. Всем остальным — `NULL`. Сюда попадают:
  - столбцы `definition` в `sys.sql_modules`, `sys.all_sql_modules`, `sys.server_sql_modules`, `sys.default_constraints`, `sys.check_constraints`, `sys.computed_columns`, `sys.numbered_procedures`;
  - вывод `sp_helptext`;
  - функция `OBJECT_DEFINITION()`;
  - шесть столбцов `INFORMATION_SCHEMA`: `CHECK_CONSTRAINTS.CHECK_CLAUSE`, `DOMAINS.DOMAIN_DEFAULT`, `ROUTINES.ROUTINE_DEFINITION`, `COLUMNS.COLUMN_DEFAULT`, `ROUTINE_COLUMNS.COLUMN_DEFAULT`, `VIEWS.VIEW_DEFINITION`.
- **`provider_string` в `sys.servers`** — `NULL` без `ALTER ANY LINKED SERVER`.
- **`password_hash` в `sys.sql_logins`** — `NULL` без `CONTROL SERVER`, а на 2022+ без `VIEW ANY CRYPTOGRAPHICALLY SECURED DEFINITION`.

Определения **встроенных** системных процедур и функций, наоборот, публично видны — через `sys.system_sql_modules`, `sp_helptext` и `OBJECT_DEFINITION()`.

Если модуль зашифрован (`WITH ENCRYPTION`), `definition` тоже `NULL` — но уже по другой причине, и различить эти две причины по самому `NULL` нельзя. Разводить их надо проверкой права (см. ниже).

---

## Каталоги, видимые роли public

Шестнадцать представлений, доступных всем пользователям базы, — важны как «что точно прочитается»:

`sys.allocation_units`, `sys.column_type_usages`, `sys.configurations`, `sys.data_spaces`, `sys.database_files`, `sys.destination_data_spaces`, `sys.filegroups`, `sys.messages`, `sys.parameter_type_usages`, `sys.partition_functions`, `sys.partition_range_values`, `sys.partition_schemes`, `sys.partitions`, `sys.schemas`, `sys.sql_dependencies`, `sys.type_assembly_usages`.

Плюс: метаданные, возвращаемые `DB_ID()` и `DB_NAME()`, видны всем.

Обратите внимание, чего в этом списке **нет**: `sys.tables`, `sys.columns`, `sys.indexes`, `sys.types`, `sys.objects`. Они подчиняются общему правилу видимости — то есть покажут только то, на что у пользователя есть хоть какое-то разрешение. Отсюда типовая картина: `sys.partitions` возвращает строки, а `sys.tables` — пусто.

---

## Что может и чего не может `db_datareader`

Точное разрешение за ролью — одна строка:

```
GRANT SELECT ON DATABASE::<database-name>
```

Это единственное, что скилл дублирует со `skill-mssql-mcp`: «что увидит запрос» — здесь, «что физически запрещено каналом» — там.

| Вопрос | Ответ | Основание |
|---|---|---|
| Увидит ли таблицы, созданные после выдачи роли? | Да | Разрешение выдано на **уровне базы**, а разрешение на области распространяется на все вложенные области; отдельного пункта «включая будущие объекты» в документации нет, это следствие модели областей |
| Сможет ли выполнить процедуру? | Нет | Роль даёт только `SELECT`. `EXECUTE` — отдельное разрешение |
| Увидит ли системные представления? | Частично | По общим правилам видимости метаданных: `SELECT` на базу — это разрешение на пользовательские объекты, и метаданные по ним видны; public-каталоги видны всегда |
| Сработает ли `SELECT … INTO`? | Нет | Требует `CREATE TABLE` в базе и `ALTER` на схему |
| Увидит ли чужие сессии в `sys.dm_exec_requests` / `sys.dm_exec_sessions`? | Нет, только свою | «Everyone can see their own session information»; чужие требуют серверного права |

Соседние роли, о которых надо знать:

| Роль | Что делает |
|---|---|
| `db_datareader` | `GRANT SELECT ON DATABASE::<database-name>` — читает данные из всех пользовательских таблиц и представлений |
| `db_denydatareader` | `DENY SELECT ON DATABASE::<database-name>`. **Отбирает и метаданные:** «Members of this role also can't read metadata about the database and its objects, such as viewing system views» |
| `db_datawriter` | `INSERT`, `UPDATE`, `DELETE` на уровне базы — не наш сценарий, но встречается в паре с `db_datareader` |
| `public` | Собственных разрешений уровня базы нет, но по умолчанию есть `SELECT` на многие системные таблицы (и их можно отозвать) |

---

## Модель прав на DMV

Диагностические представления живут по своей модели. Таблица со страницы «System dynamic management views and functions»:

| Версия | Область сервера | Область базы |
|---|---|---|
| SQL Server 2019 и раньше | `VIEW SERVER STATE` | `VIEW DATABASE STATE` |
| SQL Server 2022 и новее | `VIEW SERVER PERFORMANCE STATE`, а для объектов безопасности — `VIEW SERVER SECURITY STATE` | `VIEW DATABASE PERFORMANCE STATE`, а для объектов безопасности — `VIEW DATABASE SECURITY STATE` |

Плюс всегда — `SELECT` на само представление.

**Приоритет `DENY`:** «a user granted `VIEW SERVER PERFORMANCE STATE` but denied `VIEW DATABASE PERFORMANCE STATE` can see server-level information but not database-level information».

**Обязательный префикс `sys.`** Одночастное имя не работает: таблица ссылок на странице DMV разрешает двух-, трёх- и четырёхчастные имена и запрещает одночастное. `SELECT … FROM dm_exec_requests` — синтаксическая ошибка, а не отказ в правах.

### Расхождение о `VIEW SERVER STATE` на 2022+ (не закрыто, состояние на 22.08.2026)

Обе позиции присутствуют в актуальной документации, и ни одна страница не говорит, что старое право перестало работать:

| Позиция | Где |
|---|---|
| На 2022+ требуется `VIEW SERVER PERFORMANCE STATE` | Страница DMV, таблица выше; такая же строка «Permissions for SQL Server 2022 and later» стоит на страницах `sys.dm_exec_requests`, `sys.dm_exec_sessions`, `sys.dm_exec_query_stats`, `sys.dm_exec_sql_text`, `sys.dm_exec_query_plan`, `sys.dm_db_index_usage_stats`, `sys.dm_db_missing_index_details`, `sys.dm_exec_connections` |
| `VIEW SERVER STATE` существует и остаётся действующим разрешением | Страница «Permissions (Database Engine)»: в таблице разрешений `VIEW SERVER STATE` (код `VWSS`) на месте и подразумевает `VIEW DATABASE STATE`; там же в описании алгоритма проверки: «A dynamic management view can require both VIEW SERVER STATE and SELECT permission on the view» |

Практический вывод для 2022+: проверяй **оба** права и не делай вывода «прав нет» по отсутствию одного.

---

## Что читается при слабых правах

Таблица доступности. «Работает всегда» означает: документация не требует для этого серверных или диагностических прав.

| Что | Требуется | Комментарий |
|---|---|---|
| `SERVERPROPERTY(...)` | ничего | «All users can query the server properties» |
| `@@VERSION` | ничего | |
| Своя строка в `sys.databases` | ничего | «The database to which the caller is connected can always be viewed» |
| Чужие строки в `sys.databases` | `VIEW ANY DATABASE` (по умолчанию у public), либо `ALTER ANY DATABASE`, либо `CREATE DATABASE` в `master`, либо владение базой | `master` и `tempdb` видны всегда |
| `sys.partitions`, `sys.schemas` и остальные 16 public-каталогов | членство в public | Отсюда берётся приблизительное число строк без прав на DMV |
| Своя сессия в `sys.dm_exec_sessions` | ничего | «Everyone can see their own session information» |
| `sys.dm_sql_referenced_entities` | `SELECT` на саму функцию по умолчанию выдан public, плюс `VIEW DEFINITION` на ссылающийся модуль | См. раздел о зависимостях в [schema-discovery.md](schema-discovery.md) |
| `sys.dm_sql_referencing_entities` | На 2014 и новее: разрешений на сам объект не нужно, нужен `VIEW DEFINITION` на ссылающиеся объекты; при частичных правах вернутся частичные результаты | Там же |
| `SET STATISTICS IO`, `SET STATISTICS TIME` | права на сам запрос | «The SHOWPLAN permission isn't required» — прямо на обеих страницах |
| `SET LOCK_TIMEOUT` | членство в public | |
| `fn_my_permissions` | членство в public | |
| **Закрыто без серверных прав:** `sys.dm_exec_sql_text`, `sys.dm_exec_query_stats`, `sys.dm_exec_query_plan`, `sys.dm_exec_connections`, `sys.dm_db_index_usage_stats`, `sys.dm_db_missing_index_*` | `VIEW SERVER STATE` / 2022+ `VIEW SERVER PERFORMANCE STATE` | |
| **Закрыто без прав на базу:** `sys.dm_db_partition_stats` | `VIEW DATABASE STATE` **и** `VIEW DEFINITION`; на 2022+ — `VIEW DATABASE PERFORMANCE STATE` и `VIEW SECURITY DEFINITION` | Единственное DMV из наших, которому нужны два права сразу |
| **Закрыто без `SHOWPLAN`:** `SET SHOWPLAN_XML`, `SET SHOWPLAN_ALL`, `SET SHOWPLAN_TEXT` | `SHOWPLAN` на каждой базе, где лежат задействованные объекты | Плюс права на выполнение самого оператора |
| **Чужие сессии:** `sys.dm_exec_requests`, все сессии в `sys.dm_exec_sessions`, `sp_who` | `VIEW SERVER STATE` / 2022+ `VIEW SERVER PERFORMANCE STATE` | Без права видно только своё |

---

## Как проверить свои права

Три инструмента и одна проба. Все они отвечают на разные вопросы, и подменять один другим нельзя.

### 1. Членство в ролях — `IS_MEMBER`

```sql
SELECT  IS_MEMBER('db_datareader')     AS is_datareader,
        IS_MEMBER('db_denydatareader') AS is_denydatareader,
        IS_MEMBER('db_owner')          AS is_db_owner,
        USER_NAME()                    AS db_user,
        SUSER_SNAME()                  AS login_name;
```

Возвращает `1` (член), `0` (не член) или `NULL` (роль не существует либо это Windows-группа, запрошенная из-под учётной записи SQL Server). Что важно: функция проверяет **членство в роли, а не разрешение**. Пользователь с `CONTROL DATABASE`, не входящий в `db_owner`, получит честный `0` — при том что права у него те же. Ещё одна ловушка: члены `sysadmin` входят в каждую базу как `dbo`, а `dbo` в роли не добавляется — для них `IS_MEMBER` всегда `0`.

### 2. Эффективные разрешения — `fn_my_permissions`

Табличная функция, возвращает список разрешений, которые **фактически** есть у вызывающего на указанном защищаемом объекте. Требует членства в public, то есть работает всегда.

```sql
-- на сервере
SELECT entity_name, permission_name
FROM   fn_my_permissions(NULL, 'SERVER')
ORDER BY permission_name;

-- на текущей базе
SELECT entity_name, permission_name
FROM   fn_my_permissions(NULL, 'DATABASE')
ORDER BY permission_name;

-- на конкретном объекте
SELECT entity_name, subentity_name, permission_name
FROM   fn_my_permissions('dbo.SomeTable', 'OBJECT')
ORDER BY subentity_name, permission_name;
```

Эффективным считается разрешение, выданное напрямую, унаследованное от более высокого уровня или полученное через роль — и во всех случаях не отменённое `DENY`. Для объекта уровня базы допускается однокомпонентное имя, для объекта схемы — одно-, двух- или трёхкомпонентное, для сервера обязателен `NULL`. Проверить права **другого** принципала можно только имея на него `IMPERSONATE`. Связанные серверы функция не проверяет.

### 3. Точечная проверка — `HAS_PERMS_BY_NAME`

Скалярная функция: `1` — право есть, `0` — нет, `NULL` — класс или имя разрешения неверны. Полезна, когда нужен не список, а ответ «да/нет» по конкретному праву:

```sql
SELECT  HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW SERVER STATE')             AS view_server_state,
        HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW SERVER PERFORMANCE STATE') AS view_server_perf_state,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'VIEW DATABASE STATE') AS view_db_state,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'VIEW DEFINITION')     AS view_definition,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'SHOWPLAN')            AS showplan;
```

Правило `ANY` работает как подстановка «любое разрешение», но для проверки на уровне столбца не поддерживается — там нужно называть разрешение явно. Скобки в имени подобъекта запрещены: `'имя'`, а не `'[имя]'`.

`NULL` в ответе — не «нет права», а «неверный класс или имя». На 2022+ это особенно заметно: запрос про `VIEW SERVER PERFORMANCE STATE` на сервере 2019 вернёт `NULL`, потому что такого разрешения там ещё нет.

### 4. Проба доступности

Функции говорят о правах, а проба — о том, что реально прочитается. Выполняй по одному запросу и смотри, что упало:

```sql
SELECT TOP (1) name FROM sys.tables ORDER BY name;                 -- видимость метаданных
SELECT TOP (1) object_id, rows FROM sys.partitions ORDER BY object_id; -- public-каталог
SELECT TOP (1) session_id FROM sys.dm_exec_sessions WHERE session_id = @@SPID; -- своя сессия
SELECT TOP (1) session_id FROM sys.dm_exec_requests ORDER BY session_id;       -- чужие сессии
SELECT TOP (1) object_id, row_count FROM sys.dm_db_partition_stats ORDER BY object_id; -- DMV базы
SELECT TOP (1) object_id, definition FROM sys.sql_modules ORDER BY object_id;  -- VIEW DEFINITION
```

Как читать результат:

| Наблюдение | Вывод |
|---|---|
| Ошибка «The user does not have permission…» | Права нет — сомнений не остаётся |
| Пустой результат от `sys.tables`, при том что `sys.partitions` вернул строки | Видимость метаданных: объекты есть, разрешений на них нет |
| Пустой результат отовсюду, включая `sys.partitions` | Проверь контекст базы: `SELECT DB_NAME()`. Возможно, вы в `master` |
| `definition` пришёл как `NULL`, ошибки нет | Либо нет `VIEW DEFINITION`, либо модуль зашифрован. Различить: `HAS_PERMS_BY_NAME` на `VIEW DEFINITION` |

---

## Три причины пустого ответа, которые надо развести

1. **Видимость метаданных.** Строк нет, потому что нет разрешений на объекты. Ошибки не будет.
2. **Не тот контекст базы.** Каталоги — объекты уровня базы; подключение к `master` покажет содержимое `master`. Проверяется одним `SELECT DB_NAME()`.
3. **`db_denydatareader`.** Роль отбирает и данные, и метаданные.

Порядок разбора: сначала `DB_NAME()`, потом проба видимости, потом — и только потом — вывод об отсутствии объектов.

---

## Мостик

Механизмы, которые физически не дадут выполнить запись, — режим сервера, роль, `DENY`, гейт инструментов MCP-сервера, настройки разрешений клиента — в скилле `skill-mssql-mcp`. Здесь только видимость чтения.

Наличие такого механизма не отменяет проверки семантики конструкции перед выполнением: ограничения канала опциональны и могут быть не включены. См. [read-semantics.md](read-semantics.md).

---

## Куда дальше

- Почему определение пришло как `NULL` и чем его заменить — [schema-discovery.md](schema-discovery.md).
- Какие DMV что показывают при этих правах — [dmv-diagnostics.md](dmv-diagnostics.md).
- Готовый запрос «что я тут могу» одним блоком — [recipes.md](recipes.md).
