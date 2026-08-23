# Готовые запросы

Отвечает на вопрос: **дай запрос, который решает вот эту типовую задачу.**

---

## Как устроен этот файл

Каждый рецепт несёт две пометки: **минимальные права** и **минимальную версию**. Все рецепты универсальны — ни один не привязан к конкретной базе, схеме или таблице; параметры вынесены в переменные наверху запроса.

Требования, которым подчиняются все запросы ниже: явный список столбцов (никаких `SELECT *`, тем более из DMV), детерминированный `ORDER BY`, `TOP (n)` там, где результат может быть большим.

**Оговорка, которую нельзя пропускать.** Скилл собран по документации Microsoft; живого прогона к базе у него нет ([SKILL.md](SKILL.md), «Срез данных»). Запросы ниже собраны из документированных конструкций, но это не «протестировано на стенде»: выполнив запрос, посмотрите на вывод, а не на ожидание. Если сервер ответил иначе, чем написано здесь, прав сервер.

Прежде чем выполнять что-либо из этого файла, убедитесь, что понимаете, читающая ли конструкция перед вами — [read-semantics.md](read-semantics.md). Все рецепты ниже читающие: ни один не создаёт, не изменяет и не удаляет объектов и данных.

| № | Рецепт | Минимальные права | Минимальная версия |
|---|---|---|---|
| 1 | Профиль сервера и базы | нет | 2016 (`ProductMajorVersion` — 2016+) |
| 2 | Что я здесь могу | нет | 2016 |
| 3 | Таблицы с приблизительным числом строк (`sys.partitions`) | public | любая |
| 4 | То же плюс объём (`sys.dm_db_partition_stats`) | `VIEW DATABASE STATE` + `VIEW DEFINITION`; 2022+: `VIEW DATABASE PERFORMANCE STATE` + `VIEW SECURITY DEFINITION` | любая |
| 5 | Точное число строк | `SELECT` на таблицу | любая |
| 6 | Описание таблицы: столбцы и типы | видимость метаданных | любая |
| 7 | Ключи и индексы таблицы | видимость метаданных | любая |
| 8 | Внешние ключи в обе стороны | видимость метаданных | любая |
| 9 | Поиск столбца по имени | видимость метаданных | любая |
| 10 | Определение представления, процедуры, функции | `VIEW DEFINITION` | любая |
| 11 | Поиск текста в определениях модулей | `VIEW DEFINITION` | любая |
| 12 | Кто ссылается на таблицу | `VIEW DEFINITION` на ссылающиеся объекты | 2014+ (модель прав функции) |
| 13 | Что сейчас выполняется и кто кого блокирует | `VIEW SERVER STATE`; 2022+: `VIEW SERVER PERFORMANCE STATE` | любая |
| 14 | Топ запросов по процессорному времени | `VIEW SERVER STATE`; 2022+: `VIEW SERVER PERFORMANCE STATE` | любая |
| 15 | Недостающие индексы | `VIEW SERVER STATE`; 2022+: `VIEW SERVER PERFORMANCE STATE` | любая |
| 16 | План запроса без его выполнения | `SHOWPLAN` + права на сам запрос | любая |
| 17 | Замер ввода-вывода собственного запроса | права на сам запрос | любая |

«Любая версия» здесь означает «любая из покрытых матрицей», то есть 2016 и новее ([version-matrix.md](version-matrix.md)).

---

## 1. Профиль сервера и базы

**Права:** не требуются. **Версия:** `ProductMajorVersion` доступно с 2016; на более старых серверах используйте `ProductVersion`.

```sql
SELECT  SERVERPROPERTY('ProductVersion')      AS product_version,
        SERVERPROPERTY('ProductMajorVersion') AS major_version,
        SERVERPROPERTY('ProductLevel')        AS product_level,
        SERVERPROPERTY('ProductUpdateLevel')  AS update_level,
        SERVERPROPERTY('Edition')             AS edition,
        SERVERPROPERTY('EngineEdition')       AS engine_edition,
        SERVERPROPERTY('Collation')           AS server_collation,
        SERVERPROPERTY('IsClustered')         AS is_clustered,
        SERVERPROPERTY('MachineName')         AS machine_name,
        SERVERPROPERTY('InstanceName')        AS instance_name,
        DB_NAME()                             AS current_database,
        d.compatibility_level,
        d.collation_name                      AS database_collation,
        d.is_read_only,
        d.state_desc,
        d.recovery_model_desc,
        d.snapshot_isolation_state_desc,
        d.is_read_committed_snapshot_on
FROM    sys.databases AS d
WHERE   d.database_id = DB_ID();
```

Разбор каждого поля — в [server-profile.md](server-profile.md). Главное, ради чего это выполняется: `major_version` и `compatibility_level` — две оси доступности конструкций, а `engine_edition` отвечает на вопрос «это вообще SQL Server или Azure».

---

## 2. Что я здесь могу

**Права:** не требуются (`IS_MEMBER`, `HAS_PERMS_BY_NAME`, `fn_my_permissions` доступны роли public). **Версия:** любая, но `VIEW SERVER PERFORMANCE STATE` существует только с 2022 — на более ранних версиях вернётся `NULL`, и это нормально.

```sql
SELECT  SUSER_SNAME()                  AS login_name,
        USER_NAME()                    AS database_user,
        DB_NAME()                      AS current_database,
        IS_MEMBER('db_owner')          AS is_db_owner,
        IS_MEMBER('db_datareader')     AS is_db_datareader,
        IS_MEMBER('db_denydatareader') AS is_db_denydatareader,
        HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW SERVER STATE')              AS p_view_server_state,
        HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW SERVER PERFORMANCE STATE')  AS p_view_server_perf_state,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'VIEW DATABASE STATE') AS p_view_db_state,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'VIEW DEFINITION')     AS p_view_definition,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'SHOWPLAN')            AS p_showplan,
        HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'SELECT')              AS p_select_on_database;
```

Полный список эффективных разрешений на текущей базе:

```sql
SELECT   entity_name, permission_name
FROM     fn_my_permissions(NULL, 'DATABASE')
ORDER BY permission_name;
```

`HAS_PERMS_BY_NAME` возвращает `1`, `0` или `NULL`; `NULL` означает «неверный класс или имя разрешения» — например, гранулярное право 2022 на сервере 2019. `IS_MEMBER` проверяет членство в роли, а не разрешение: пользователь с `CONTROL DATABASE` вне `db_owner` получит `0`. Подробности — [permissions-visibility.md](permissions-visibility.md).

---

## 3. Таблицы с приблизительным числом строк

**Права:** членство в public для `sys.partitions`; видимость метаданных для имён таблиц. **Версия:** любая.

```sql
SELECT TOP (200)
        s.name                AS schema_name,
        t.name                AS table_name,
        SUM(p.rows)           AS approx_rows,
        MAX(t.create_date)    AS create_date,
        MAX(t.modify_date)    AS modify_date
FROM    sys.tables     AS t
JOIN    sys.schemas    AS s ON s.schema_id = t.schema_id
JOIN    sys.partitions AS p ON p.object_id = t.object_id
                           AND p.index_id IN (0, 1)
GROUP BY s.name, t.name
ORDER BY SUM(p.rows) DESC, s.name, t.name;
```

Три вещи, без которых запрос врёт:

- `index_id IN (0, 1)` — иначе строки посчитаются по разу на каждый некластерный индекс.
- `SUM` — у партиционированной таблицы строк в каталоге столько, сколько партиций.
- `rows` документировано как **approximate**: это кэшированное значение, а не подсчёт. Так и надо говорить пользователю.

`modify_date` меняется в том числе при создании или изменении индекса — как «дата изменения структуры» годится, как «дата изменения определения» нет.

---

## 4. Число строк и объём через DMV

**Права:** `VIEW DATABASE STATE` **и** `VIEW DEFINITION`; на 2022+ — `VIEW DATABASE PERFORMANCE STATE` и `VIEW SECURITY DEFINITION`. **Версия:** любая.

```sql
SELECT TOP (200)
        s.name  AS schema_name,
        t.name  AS table_name,
        SUM(ps.row_count)                          AS approx_rows,
        SUM(ps.reserved_page_count) * 8 / 1024.0   AS reserved_mb,
        SUM(ps.used_page_count)     * 8 / 1024.0   AS used_mb
FROM    sys.tables AS t
JOIN    sys.schemas AS s ON s.schema_id = t.schema_id
JOIN    sys.dm_db_partition_stats AS ps ON ps.object_id = t.object_id
                                       AND ps.index_id IN (0, 1)
GROUP BY s.name, t.name
ORDER BY SUM(ps.reserved_page_count) DESC, s.name, t.name;
```

Размер страницы — константа: «The size of every page is the same: 8 KiB», отсюда `* 8 / 1024.0` для мегабайтов. `row_count` здесь тоже документирован как **approximate**. Если запрос вернул отказ — прав на DMV нет, берите рецепт 3.

---

## 5. Точное число строк в таблице

**Права:** `SELECT` на таблицу. **Версия:** любая.

```sql
DECLARE @schema sysname = N'dbo';
DECLARE @table  sysname = N'ИмяТаблицы';

DECLARE @sql nvarchar(max) =
    N'SELECT COUNT_BIG(*) AS exact_rows FROM ' + QUOTENAME(@schema) + N'.' + QUOTENAME(@table) + N';';

EXEC sp_executesql @sql;
```

`COUNT_BIG`, а не `COUNT`: `COUNT` возвращает `int` и на таблице свыше 2 147 483 647 строк падает с ошибкой 8115 ([traps.md](traps.md)). `QUOTENAME` обязателен — он корректно экранирует имя и закрывает подстановку постороннего текста в динамический SQL. `sp_executesql` здесь читающая: её раздел Permissions требует только членства в public, а выполняется ею обычный `SELECT` ([read-semantics.md](read-semantics.md)). На больших таблицах это полное сканирование: сначала посмотрите приблизительное число рецептом 3 и решите, нужна ли точность.

---

## 6. Описание таблицы: столбцы и типы

**Права:** видимость метаданных на таблицу; для текста вычисляемых столбцов и значений по умолчанию — `VIEW DEFINITION`. **Версия:** любая.

```sql
DECLARE @object sysname = N'dbo.ИмяТаблицы';

SELECT   c.column_id,
         c.name                AS column_name,
         ty.name               AS type_name,
         CASE
             WHEN c.max_length = -1 THEN N'max'
             WHEN ty.name IN (N'nchar', N'nvarchar') THEN CAST(c.max_length / 2 AS nvarchar(10))
             WHEN ty.name IN (N'char', N'varchar', N'binary', N'varbinary') THEN CAST(c.max_length AS nvarchar(10))
             ELSE N''
         END                   AS length_in_characters,
         c.max_length          AS max_length_bytes,
         c.precision,
         c.scale,
         c.is_nullable,
         c.is_identity,
         c.is_computed,
         cc.definition         AS computed_definition,
         c.collation_name,
         OBJECT_DEFINITION(c.default_object_id) AS default_definition
FROM     sys.columns AS c
JOIN     sys.types   AS ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.computed_columns AS cc ON cc.object_id = c.object_id
                                    AND cc.column_id = c.column_id
WHERE    c.object_id = OBJECT_ID(@object)
ORDER BY c.column_id;
```

Почему длина считается так: `max_length` документирован **в байтах**, у `nchar`/`nvarchar` на символ приходится пара байтов, у `max`-типов и `xml` значение равно `-1`. Для `text`, `ntext`, `image` там будет `16` — это размер указателя, а не данных, поэтому такие типы в расчёт длины не берутся ([schema-discovery.md](schema-discovery.md)).

`OBJECT_DEFINITION` поддерживает тип `D` (значение по умолчанию) и вернёт текст ограничения; при нехватке `VIEW DEFINITION` вернётся `NULL` без ошибки. `column_id` не последователен — если нужен порядковый номер, считайте `ROW_NUMBER`.

---

## 7. Ключи и индексы таблицы

**Права:** видимость метаданных. **Версия:** любая.

```sql
DECLARE @object sysname = N'dbo.ИмяТаблицы';

SELECT   i.index_id,
         ISNULL(i.name, N'(куча)')   AS index_name,
         i.type_desc,
         i.is_primary_key,
         i.is_unique,
         i.is_unique_constraint,
         i.has_filter,
         i.filter_definition,
         STUFF((SELECT N', ' + col.name + CASE WHEN ic.is_descending_key = 1 THEN N' DESC' ELSE N'' END
                FROM   sys.index_columns AS ic
                JOIN   sys.columns       AS col ON col.object_id = ic.object_id
                                               AND col.column_id = ic.column_id
                WHERE  ic.object_id = i.object_id
                  AND  ic.index_id  = i.index_id
                  AND  ic.is_included_column = 0
                  AND  ic.key_ordinal > 0
                ORDER BY ic.key_ordinal
                FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'') AS key_columns,
         STUFF((SELECT N', ' + col.name
                FROM   sys.index_columns AS ic
                JOIN   sys.columns       AS col ON col.object_id = ic.object_id
                                               AND col.column_id = ic.column_id
                WHERE  ic.object_id = i.object_id
                  AND  ic.index_id  = i.index_id
                  AND  ic.is_included_column = 1
                ORDER BY col.name
                FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'') AS included_columns
FROM     sys.indexes AS i
WHERE    i.object_id = OBJECT_ID(@object)
  AND    i.is_hypothetical = 0
ORDER BY i.index_id;
```

Пояснения:

- Склейка сделана через `FOR XML PATH('')` с `TYPE` и `.value()`, а не через `STRING_AGG`, чтобы рецепт работал и на 2016. На 2017 и новее то же самое короче: `STRING_AGG(col.name, N', ') WITHIN GROUP (ORDER BY ic.key_ordinal)` — но `WITHIN GROUP` требует уровня совместимости 110 и выше ([version-matrix.md](version-matrix.md)).
- `index_id`: `0` — куча, `1` — кластерный, `> 1` — некластерный. У кучи `name` равен `NULL`, отсюда `ISNULL`.
- Фильтр `is_hypothetical = 0` убирает гипотетические индексы, которые нельзя использовать как путь доступа.
- Столбцы, попавшие в некластерный индекс неявно как часть ключа кластеризации, в `sys.index_columns` не перечислены — их в выводе не будет, и это не ошибка запроса.
- `filter_definition` приходит как `NULL` и у нефильтрованного индекса, и при нехватке прав на таблицу.

---

## 8. Внешние ключи в обе стороны

**Права:** видимость метаданных. **Версия:** любая.

```sql
DECLARE @object sysname = N'dbo.ИмяТаблицы';

SELECT   fk.name                       AS foreign_key_name,
         CASE WHEN fk.parent_object_id = OBJECT_ID(@object)
              THEN N'исходящий' ELSE N'входящий' END AS direction,
         SCHEMA_NAME(pt.schema_id)      AS parent_schema,
         pt.name                        AS parent_table,
         pc.name                        AS parent_column,
         SCHEMA_NAME(rt.schema_id)      AS referenced_schema,
         rt.name                        AS referenced_table,
         rc.name                        AS referenced_column,
         fkc.constraint_column_id,
         fk.delete_referential_action_desc,
         fk.update_referential_action_desc,
         fk.is_disabled,
         fk.is_not_trusted
FROM     sys.foreign_keys        AS fk
JOIN     sys.foreign_key_columns AS fkc ON fkc.constraint_object_id = fk.object_id
JOIN     sys.tables              AS pt  ON pt.object_id = fk.parent_object_id
JOIN     sys.tables              AS rt  ON rt.object_id = fk.referenced_object_id
JOIN     sys.columns             AS pc  ON pc.object_id = fkc.parent_object_id
                                       AND pc.column_id = fkc.parent_column_id
JOIN     sys.columns             AS rc  ON rc.object_id = fkc.referenced_object_id
                                       AND rc.column_id = fkc.referenced_column_id
WHERE    fk.parent_object_id = OBJECT_ID(@object)
   OR    fk.referenced_object_id = OBJECT_ID(@object)
ORDER BY direction, foreign_key_name, fkc.constraint_column_id;
```

`constraint_column_id` — порядковый номер столбца внутри составного ключа; без сортировки по нему пары столбцов в составном ключе перепутаются. Внешние ключи, кстати, **не** отслеживаются как зависимости в `sys.sql_expression_dependencies` — связи ищутся только так ([schema-discovery.md](schema-discovery.md)).

---

## 9. Поиск столбца по имени во всех таблицах

**Права:** видимость метаданных. **Версия:** любая.

```sql
DECLARE @pattern sysname = N'%customer%';

SELECT TOP (200)
         SCHEMA_NAME(o.schema_id) AS schema_name,
         o.name                   AS object_name,
         o.type_desc              AS object_type,
         c.name                   AS column_name,
         ty.name                  AS type_name,
         c.max_length             AS max_length_bytes,
         c.is_nullable
FROM     sys.columns AS c
JOIN     sys.objects AS o  ON o.object_id = c.object_id
JOIN     sys.types   AS ty ON ty.user_type_id = c.user_type_id
WHERE    c.name LIKE @pattern
  AND    o.type IN ('U', 'V')
ORDER BY schema_name, object_name, c.column_id;
```

`o.type IN ('U','V')` — таблицы и представления; полный список кодов типов в [schema-discovery.md](schema-discovery.md). Регистрочувствительность `LIKE` определяется коллацией базы: в регистрозависимой базе `'%customer%'` не найдёт `CustomerId`. Если это важно — добавьте `COLLATE`, например `c.name COLLATE Latin1_General_CI_AI LIKE @pattern`.

---

## 10. Определение представления, процедуры, функции

**Права:** `VIEW DEFINITION` на объект. **Версия:** любая.

```sql
DECLARE @object sysname = N'dbo.ИмяОбъекта';

SELECT   o.name        AS object_name,
         o.type_desc,
         m.definition,
         m.is_schema_bound,
         m.uses_ansi_nulls,
         m.uses_quoted_identifier
FROM     sys.sql_modules AS m
JOIN     sys.objects     AS o ON o.object_id = m.object_id
WHERE    m.object_id = OBJECT_ID(@object);
```

`definition` — цельный текст `nvarchar(max)`; в отличие от `sp_helptext`, ничего не режется по 255 символов. `NULL` в `definition` означает одно из двух: модуль зашифрован **или** нет `VIEW DEFINITION`; различить можно через `HAS_PERMS_BY_NAME`.

Для **таблицы** этот рецепт не работает и работать не может: у таблиц нет модуля, а `OBJECT_DEFINITION` тип `U` не поддерживает. Описание таблицы собирается рецептами 6–8.

---

## 11. Поиск текста в определениях модулей

**Права:** `VIEW DEFINITION`. **Версия:** любая.

```sql
DECLARE @needle nvarchar(200) = N'%ИскомыйТекст%';

SELECT TOP (200)
         SCHEMA_NAME(o.schema_id) AS schema_name,
         o.name                   AS object_name,
         o.type_desc,
         o.modify_date,
         LEN(m.definition)        AS definition_length
FROM     sys.sql_modules AS m
JOIN     sys.objects     AS o ON o.object_id = m.object_id
WHERE    m.definition LIKE @needle
ORDER BY schema_name, object_name;
```

Объекты, на которые нет `VIEW DEFINITION`, в выдачу не попадут вовсе — не потому, что текста в них нет, а потому что `definition` для них `NULL`. Регистрочувствительность — та же история, что в рецепте 9.

---

## 12. Кто ссылается на таблицу

**Права:** на 2014 и новее разрешений на сам объект не требуется, нужен `VIEW DEFINITION` на ссылающиеся объекты. **Версия:** эта модель прав действует с SQL Server 2014; на 2008–2012 требовался `CONTROL` на объект.

```sql
DECLARE @object sysname = N'dbo.ИмяТаблицы';

SELECT   re.referencing_schema_name,
         re.referencing_entity_name,
         re.referencing_class_desc,
         re.is_caller_dependent
FROM     sys.dm_sql_referencing_entities(@object, 'OBJECT') AS re
ORDER BY re.referencing_schema_name, re.referencing_entity_name;
```

Пустой результат **ничего не доказывает**: так выглядят сразу четыре ситуации — на объект действительно никто не ссылается; объекта нет в текущей базе; указан системный объект; передан неверный параметр. Плюс «Partial results can be returned if the user has `VIEW DEFINITION` on only some of the referencing entities» — то есть часть ссылающихся объектов может быть просто не видна.

Обратное направление («на что ссылается этот модуль», с точностью до столбцов) — `sys.dm_sql_referenced_entities(@object, 'OBJECT')`; она может вернуть ошибку 2020, если столбцовые зависимости не разрешились, но объектные зависимости при этом всё равно вернёт.

Внешние ключи здесь не появятся: они не зависимости. См. рецепт 8.

---

## 13. Что сейчас выполняется и кто кого блокирует

**Права:** `VIEW SERVER STATE`; на 2022+ — `VIEW SERVER PERFORMANCE STATE`. Без них видно только собственную сессию. **Версия:** любая (столбцы `dop` и `parallel_worker_count` — с 2016).

```sql
SELECT TOP (50)
        r.session_id,
        s.login_name,
        s.host_name,
        s.program_name,
        DB_NAME(r.database_id)  AS database_name,
        r.status,
        r.command,
        r.blocking_session_id,
        r.wait_type,
        r.wait_time             AS wait_time_ms,
        r.last_wait_type,
        r.wait_resource,
        r.cpu_time              AS cpu_time_ms,
        r.total_elapsed_time    AS elapsed_ms,
        r.logical_reads,
        r.row_count,
        r.dop,
        r.parallel_worker_count,
        SUBSTRING(st.text,
                  (r.statement_start_offset / 2) + 1,
                  ((CASE r.statement_end_offset
                         WHEN -1 THEN DATALENGTH(st.text)
                         ELSE r.statement_end_offset
                    END - r.statement_start_offset) / 2) + 1) AS statement_text
FROM    sys.dm_exec_requests AS r
JOIN    sys.dm_exec_sessions AS s ON s.session_id = r.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS st
WHERE   s.is_user_process = 1
  AND   r.session_id <> @@SPID
ORDER BY r.blocking_session_id DESC, r.total_elapsed_time DESC;
```

Как читать результат:

- `CROSS APPLY` отбрасывает запросы, у которых `sql_handle` пуст (такое бывает у некоторых системных и фоновых запросов). Нужен полный список — замените на `OUTER APPLY`, и текст придёт как `NULL`.
- `blocking_session_id` больше нуля — сессия ждёт другую; отрицательные значения имеют специальный смысл ([dmv-diagnostics.md](dmv-diagnostics.md)).
- **Нули в `logical_reads` и `row_count` при `dop > 1` — не признак простоя:** у параллельного запроса виден только координирующий поток, и эти счётчики для него не обновляются.
- `host_name` и `program_name` сообщает клиент; доверять им как средству идентификации нельзя.
- Разбор `wait_type` — граница этого скилла: назвать тип ожидания можно, классифицировать — уже администрирование.

---

## 14. Топ запросов по процессорному времени

**Права:** `VIEW SERVER STATE`; на 2022+ — `VIEW SERVER PERFORMANCE STATE`. **Версия:** любая.

```sql
SELECT TOP (20)
        qs.query_hash,
        SUM(qs.execution_count)                                       AS execution_count,
        SUM(qs.total_worker_time)                                     AS total_cpu_us,
        SUM(qs.total_worker_time) / NULLIF(SUM(qs.execution_count), 0) AS avg_cpu_us,
        SUM(qs.total_logical_reads)                                   AS total_logical_reads,
        MAX(qs.last_execution_time)                                   AS last_execution_time,
        MIN(SUBSTRING(st.text,
                      (qs.statement_start_offset / 2) + 1,
                      ((CASE qs.statement_end_offset
                             WHEN -1 THEN DATALENGTH(st.text)
                             ELSE qs.statement_end_offset
                        END - qs.statement_start_offset) / 2) + 1))   AS sample_statement_text
FROM    sys.dm_exec_query_stats AS qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
GROUP BY qs.query_hash
ORDER BY SUM(qs.total_worker_time) DESC;
```

Что здесь важно понимать:

- `total_worker_time` — **микросекунды** («reported in microseconds (but only accurate to milliseconds)»), а в `sys.dm_exec_requests` `cpu_time` — миллисекунды. Не складывайте эти числа между собой.
- Группировка по `query_hash` объединяет запросы, различающиеся только литералами; текст в колонке — образец, «it should be read without regard to specific values in the statement».
- **Это срез кэша планов, а не история.** Вытесненный план исчезает из выдачи вместе со своей статистикой; `execution_count` считается с момента последней компиляции.
- `NULLIF` защищает от деления на ноль ([traps.md](traps.md)).

---

## 15. Недостающие индексы

**Права:** `VIEW SERVER STATE`; на 2022+ — `VIEW SERVER PERFORMANCE STATE`. **Версия:** любая.

Форма запроса — как в документации Microsoft («Tune nonclustered indexes with missing index suggestions»): он **только показывает** предложения и текст возможного `CREATE INDEX`, но ничего не создаёт.

```sql
SELECT TOP (20)
        CONVERT(varchar(30), GETDATE(), 126) AS runtime,
        DB_NAME(mid.database_id)             AS database_name,
        mid.statement                        AS table_name,
        CONVERT(decimal(28, 1),
                migs.avg_total_user_cost * migs.avg_user_impact
                * (migs.user_seeks + migs.user_scans)) AS estimated_improvement,
        migs.user_seeks,
        migs.user_scans,
        migs.avg_user_impact,
        mid.equality_columns,
        mid.inequality_columns,
        mid.included_columns
FROM    sys.dm_db_missing_index_groups     AS mig
JOIN    sys.dm_db_missing_index_group_stats AS migs ON migs.group_handle = mig.index_group_handle
JOIN    sys.dm_db_missing_index_details    AS mid   ON mid.index_handle = mig.index_handle
WHERE   mid.database_id = DB_ID()
ORDER BY estimated_improvement DESC;
```

Прежде чем показывать это пользователю как рекомендацию, назовите ограничения: предложения строятся по одному запросу до его выполнения и не проверяются после; **порядок ключевых столбцов не подсказывается**; включённые столбцы предлагаются без оценки размера индекса; данные не сохраняются и сбрасываются при перезапуске движка, переводе базы в offline, изменении метаданных таблицы и любой `ALTER INDEX`; сбор ограничен 600 группами. Полный перечень из восьми пунктов — в [dmv-diagnostics.md](dmv-diagnostics.md).

---

## 16. План запроса без его выполнения

**Права:** `SHOWPLAN` на всех базах, где лежат задействованные объекты, плюс права на выполнение самого оператора. **Версия:** любая.

```sql
SET SHOWPLAN_XML ON;
GO
-- сюда один оператор, план которого нужен
SELECT column_a FROM dbo.some_table WHERE column_b = 1;
GO
SET SHOWPLAN_XML OFF;
GO
```

Требования и ловушки:

- `SET SHOWPLAN_XML` должен быть **единственным оператором в пакете** и не может стоять внутри процедуры — отсюда `GO` в примере.
- Пока режим включён, **ничего не выполняется**, включая DDL: последующие ссылки на «созданный» объект упадут с ошибкой.
- В SSMS надо снять «Include Actual Execution Plan», иначе XML-вывод не появится.
- Стоимости в плане — во внутренних единицах, не в секундах.

**Если канал не пропускает `SET`-операторы** (это свойство подключения, см. `skill-mssql-mcp`), план берётся из кэша уже выполнявшегося запроса:

```sql
SELECT TOP (20)
        qs.query_hash,
        qs.execution_count,
        qs.total_worker_time,
        qp.query_plan
FROM    sys.dm_exec_query_stats AS qs
CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) AS qp
WHERE   qp.dbid = DB_ID()
ORDER BY qs.total_worker_time DESC;
```

`query_plan` придёт `NULL`, если план вытеснен из кэша, если запрос не кэшируется, если вложенность XML превысила 128 уровней или если это ad-hoc с простой параметризацией. Права здесь другие — те же, что у остальных DMV, а не `SHOWPLAN`.

Фильтр `qp.dbid = DB_ID()` оставляет планы, скомпилированные в контексте текущей базы (для ad-hoc и подготовленных операторов `dbid` — это база, где их компилировали). Столбец допускает `NULL`, и такие строки фильтр тоже отбросит.

Не путайте с `sys.dm_exec_sql_text`: там `dbid` **не** определяется из `sql_handle` для ad-hoc-запросов, и для них нужен `plan_handle`.

---

## 17. Замер ввода-вывода собственного запроса

**Права:** только права на сам запрос. `SHOWPLAN` **не требуется** — прямая формулировка документации, и именно поэтому этот способ работает там, где `SET SHOWPLAN_XML` отказывает.

```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- сюда измеряемый запрос
SELECT TOP (100) column_a FROM dbo.some_table ORDER BY column_a;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

**Запрос при этом выполняется** — в отличие от рецепта 16. Вывод приходит сообщениями, а не набором строк, и выглядит так:

```
Table 'ProductCostHistory'. Scan count 1, logical reads 76, physical reads 0,
page server reads 0, read-ahead reads 0, page server read-ahead reads 0,
lob logical reads 0, lob physical reads 0, lob page server reads 0,
lob read-ahead reads 0, lob page server read-ahead reads 0.
```

Основной показатель — `logical reads`: сколько страниц запрос прочитал из кэша. Завышенные `lob logical reads` на LOB-столбцах — известное поведение, а не обязательно проблема запроса. `SET STATISTICS TIME` добавляет миллисекунды на разбор, компиляцию и выполнение; в режиме fiber (`lightweight pooling`) его показания недостоверны.

---

## Куда дальше

- Что означают числа в выводе — [schema-discovery.md](schema-discovery.md) и [dmv-diagnostics.md](dmv-diagnostics.md).
- Почему запрос вернул пусто — [permissions-visibility.md](permissions-visibility.md).
- Работает ли конструкция на этой версии — [version-matrix.md](version-matrix.md).
