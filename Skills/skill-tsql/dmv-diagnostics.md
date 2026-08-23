# Диагностика через DMV

Отвечает на вопрос: **почему медленно, кто кого блокирует, что вообще сейчас выполняется.**

Готовые запросы — в [recipes.md](recipes.md). Здесь — что означает то, что они возвращают, и чего в этих числах нет.

---

## Два правила, которые действуют всегда

**1. Префикс `sys.` обязателен.** Таблица ссылок на странице «System dynamic management views and functions»: одночастное имя не поддерживается ни для представлений, ни для функций; двух-, трёх- и четырёхчастные — да (четырёхчастное — только для представлений). `SELECT … FROM dm_exec_requests` — синтаксическая ошибка, а не отказ в правах.

**2. `SELECT *` из DMV не писать.** Дословно:

> «Dynamic management objects return internal, implementation-specific state data. Their schemas and the data they return might change in future Database Engine releases… Microsoft might augment the definition of any dynamic management view by adding columns to the end of the column list. Don't use the syntax `SELECT * FROM dynamic_management_view_name` in production code because the number of columns returned might change and break your application.»

Схема DMV не является контрактом. Перечисляйте столбцы явно — и в рецептах, и в разовых запросах.

---

## Модель прав

| Версия | Область сервера | Область базы |
|---|---|---|
| 2019 и раньше | `VIEW SERVER STATE` | `VIEW DATABASE STATE` |
| 2022 и новее | `VIEW SERVER PERFORMANCE STATE` (для объектов безопасности — `VIEW SERVER SECURITY STATE`) | `VIEW DATABASE PERFORMANCE STATE` (для объектов безопасности — `VIEW DATABASE SECURITY STATE`) |

Плюс `SELECT` на само представление. `DENY` перевешивает `GRANT`. Подробности, включая незакрытое расхождение про `VIEW SERVER STATE` на 2022+, и таблица «что читается без прав» — в [permissions-visibility.md](permissions-visibility.md); здесь не дублируются.

---

## `sys.dm_exec_requests` — что выполняется прямо сейчас

Права: без серверного права видно **только свою сессию** («otherwise, the user sees only the current session»). В Azure SQL Database — всегда только текущее соединение, потому что `VIEW SERVER STATE` там выдать нельзя.

Ключевые столбцы: `session_id`, `request_id`, `start_time`, `status`, `command`, `database_id`, `blocking_session_id`, `wait_type`, `wait_time`, `last_wait_type`, `wait_resource`, `cpu_time`, `total_elapsed_time`, `reads`, `writes`, `logical_reads`, `row_count`, `percent_complete`, `sql_handle`, `plan_handle`, `statement_start_offset`, `statement_end_offset`, `dop` (2016+), `parallel_worker_count` (2016+).

### Специальные значения `blocking_session_id`

| Значение | Смысл |
|---|---|
| `NULL` или `0` | Запрос не заблокирован, либо блокирующую сессию определить не удалось |
| `-2` | Блокирующий ресурс принадлежит осиротевшей распределённой транзакции |
| `-3` | Блокирующий ресурс принадлежит транзакции отложенного восстановления |
| `-4` | Владельца блокировки-защёлки определить не удалось из-за внутренних переходов состояния |
| `-5` | Владелец защёлки не отслеживается для этого типа защёлки |

Про `-5` документация говорит прямо: «By itself, `blocking_session_id` `-5` doesn't indicate a performance problem… Depending on workload, observing `blocking_session_id = -5` might be a common occurrence». Раньше в такой ситуации показывался `0`.

### Ловушка параллелизма

Самая дорогая ошибка при чтении этого представления:

> «When executing parallel requests in row mode, SQL Server assigns a worker thread to coordinate the worker threads responsible for completing tasks assigned to them. In this DMV, only the coordinator thread is visible for the request. The columns `reads`, `writes`, `logical_reads`, and `row_count` are **not updated** for the coordinator thread. The columns `wait_type`, `wait_time`, `last_wait_type`, `wait_resource`, and `granted_query_memory` are **only updated** for the coordinator thread.»

То есть у параллельного запроса `logical_reads` и `row_count` показывают нули — и это не «запрос простаивает», а «здесь виден только координатор». Признак параллельности — `dop > 1` и ненулевой `parallel_worker_count`.

### `percent_complete`

Заполняется **только** для перечисленного списка команд: `ALTER INDEX REORGANIZE`, `AUTO_SHRINK` в `ALTER DATABASE`, `BACKUP DATABASE`, `DBCC CHECKDB`, `DBCC CHECKFILEGROUP`, `DBCC CHECKTABLE`, `DBCC INDEXDEFRAG`, `DBCC SHRINKDATABASE`, `DBCC SHRINKFILE`, `RECOVERY`, `RESTORE DATABASE`, `ROLLBACK`, `TDE ENCRYPTION`. Для обычного `SELECT` там всегда ноль, и это не значит, что запрос не двигается.

### Текущий оператор из пакета

`sql_handle` даёт текст **всего пакета**; чтобы вырезать выполняющийся сейчас оператор, нужны смещения. Схема — из примера на странице документации (смещения в байтах, отсюда деление на 2; `-1` в `statement_end_offset` означает «до конца текста»):

```sql
SELECT TOP (20)
       r.session_id,
       r.start_time,
       r.cpu_time AS cpu_time_ms,
       SUBSTRING(st.text,
                 (r.statement_start_offset / 2) + 1,
                 ((CASE r.statement_end_offset
                        WHEN -1 THEN DATALENGTH(st.text)
                        ELSE r.statement_end_offset
                   END - r.statement_start_offset) / 2) + 1) AS statement_text
FROM   sys.dm_exec_requests AS r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS st
ORDER BY r.cpu_time DESC;
```

---

## `sys.dm_exec_sessions` — кто подключён

Права: «Everyone can see their own session information»; чужие сессии — по серверному праву.

| Столбец | Что важно знать |
|---|---|
| `is_user_process` | `0` — системная сессия, `1` — пользовательская. Фильтр по нему обязателен, иначе в отчёт попадут фоновые задачи |
| `host_name`, `program_name` | Значения **предоставляет клиент**. Дословное предупреждение: «The client application provides the workstation name and can provide inaccurate data. Don't rely on `HOST_NAME` as a security feature». Для внутренних сессий — `NULL` |
| `login_time` | Сессии, не завершившие вход на момент запроса, показываются с `login_time = 1900-01-01` |
| `transaction_isolation_level` | Число; расшифровка — в [read-semantics.md](read-semantics.md) |
| Настройки сессии | `language`, `date_format`, `date_first`, `quoted_identifier`, `arithabort`, `ansi_warnings`, `lock_timeout` и прочие — отсюда же ([server-profile.md](server-profile.md)) |

**Кардинальности связей** (со страницы):

| От | К | По | Связь |
|---|---|---|---|
| `sys.dm_exec_sessions` | `sys.dm_exec_requests` | `session_id` | один к нулю или один ко многим |
| `sys.dm_exec_sessions` | `sys.dm_exec_connections` | `session_id` | один к нулю или один ко многим |
| `sys.dm_exec_sessions` | `sys.dm_tran_session_transactions` | `session_id` | один к нулю или один ко многим |
| `sys.dm_exec_sessions` | `sys.dm_db_session_space_usage` | `session_id` | один к одному |

«Один ко многим» с `dm_exec_requests` — не опечатка: у сессии с MARS может быть несколько активных запросов.

---

## `sys.dm_exec_query_stats` — не история, а срез кэша планов

Главное, из-за чего это представление читают неправильно:

> «Returns aggregate performance statistics for cached query plans… The view contains one row per query statement within the cached plan, and the lifetime of the rows are tied to the plan itself. When a plan is removed from the cache, the corresponding rows are eliminated from this view.»

И ещё: «The results of `sys.dm_exec_query_stats` can vary with each execution as the data only reflects finished queries, and not ones still in-flight». Статистика обновляется в момент завершения запроса.

Из этого следуют три вещи:

1. **Это не журнал.** Запрос, чей план вытеснен из кэша, исчезает бесследно. «Не вижу запроса в query_stats» ≠ «он не выполнялся».
2. **`execution_count` считается с момента последней компиляции**, а не с запуска сервера: «Number of times that the plan has been executed since it was last compiled». Перекомпиляция обнуляет счётчик.
3. **Счётчиков по четыре на каждую метрику**: `total_*`, `last_*`, `min_*`, `max_*` — по рабочему времени (`worker_time`), логическим и физическим чтениям, записям, прошедшему времени, строкам.

**Группировка по `query_hash`** объединяет запросы, различающиеся только литералами: «You can use the query hash to determine the aggregate resource usage for queries that differ only by literal values». Текст такой группы читается как шаблон — в примере Microsoft колонка так и называется `Sample_Statement_Text`, с оговоркой: «it should be read without regard to specific values in the statement».

---

## `sys.dm_exec_sql_text` — как достать текст

Табличная функция, принимает `sql_handle` **или** `plan_handle`. Дескрипторы берутся из `dm_exec_requests`, `dm_exec_query_stats`, `dm_exec_cached_plans` и родственных представлений; связываются через `CROSS APPLY`.

Что надо знать:

- **`dbid` не определяется из `sql_handle` для ad-hoc-запросов:** «`dbid` cannot be determined from `sql_handle` for ad hoc queries. To determine `dbid` for ad hoc queries, use `plan_handle` instead». Для статического SQL внутри процедуры `dbid` — база процедуры, иначе `NULL`.
- **`text` = `NULL` для зашифрованных объектов**; признак — столбец `encrypted = 1`.
- Для ad-hoc-запросов дескриптор — хеш от текста и может прийти из любой базы.

---

## `sys.dm_db_index_usage_stats` — использовались ли индексы

Три ограничения, без которых вывод об индексе будет неверным:

1. **Счётчики обнуляются при запуске движка:** «The counters are initialized to empty whenever the database engine is started». Плюс «whenever a database is detached or is shut down (for example, because `AUTO_CLOSE` is set to `ON`), all rows associated with the database are removed». Поэтому любой вывод корректен только вместе с `sqlserver_start_time` из `sys.dm_os_sys_info` — документация ссылается на этот столбец прямо: «Information in many other SQL Server DMVs only includes activity since the last database engine startup».
2. **Отсутствие строки означает «не использовался с момента последнего старта»**, а не «не нужен»: строка появляется при первом использовании индекса.
3. **`user_updates` считает операции, а не строки:** «a counter of maintenance on the index caused by insert, update, or delete operations on the underlying table or view».

Чего представление не покрывает: «The DMV `sys.dm_db_index_usage_stats` does not return information about memory-optimized indexes or spatial indexes».

---

## `sys.dm_db_missing_index_*` — чего не хватает оптимизатору

Четыре объекта работают в связке: `missing_index_details` (какой индекс), `missing_index_columns` (столбцы), `missing_index_groups` (связь), `missing_index_group_stats` (оценка выигрыша).

**Восемь документированных ограничений** («Limitations of the missing index feature») — их надо знать целиком, потому что каждое отдельно способно превратить рекомендацию в вред:

1. Предложения строятся на оценках при оптимизации **одного** запроса, до его выполнения, и после выполнения не проверяются и не обновляются.
2. Предлагаются только некластерные дисковые rowstore-индексы; уникальные и фильтрованные не предлагаются.
3. **Порядок ключевых столбцов не задаётся** — предлагается набор, а не последовательность.
4. Включённые столбцы предлагаются без анализа стоимости: размер получившегося индекса не оценивается.
5. По разным запросам приходят похожие варианты индексов на одну таблицу — их надо объединять вручную.
6. Для тривиальных планов предложений нет вовсе.
7. Для запросов только с неравенствами оценка стоимости менее точна.
8. **Сбор ограничен 600 группами:** «Suggestions are gathered for a maximum of 600 missing index groups. After this threshold is reached, no more missing index group data is gathered».

Вывод документации: «missing index suggestions are best treated as one of several sources of information… aren't prescriptions to create indexes exactly as suggested».

**Данные не сохраняются.** «Information returned by `sys.dm_db_missing_index_details` is updated when a query is optimized by the query optimizer, and is not persisted. Missing index information is kept only until the database engine is restarted.» Сбрасывают их также отработка отказа, перевод базы в offline, изменение метаданных таблицы (добавление или удаление столбца, создание индекса) и любая операция `ALTER INDEX` на таблице.

**Форма запроса из документации** (страница «Tune nonclustered indexes with missing index suggestions») — `TOP 20`, сортировка по расчётному выигрышу; сам запрос только генерирует текст `CREATE INDEX`, но ничего не создаёт. Расчётный выигрыш складывается из оценочной стоимости запросов, оценки эффекта от индекса и числа выполнений соответствующих операторов. Готовый вариант — в [recipes.md](recipes.md).

Скилл не даёт рекомендаций «создать индекс» на основании одного DMV — только показывает данные и называет ограничения.

---

## `sp_who` и `sp_who2`

`sp_who` документирован: параметр `@loginame` (имя входа, номер сессии или `'ACTIVE'`), столбцы `spid`, `ecid`, `status`, `loginame`, `hostname`, `blk`, `dbname`, `cmd`, `request_id`. Значения `status`: `dormant`, `running`, `background`, `rollback`, `pending`, `runnable`, `spinloop`, `suspended`. В столбце `blk` значение `-2` — блокировка со стороны осиротевшей распределённой транзакции. Права те же, что у DMV: без `VIEW SERVER STATE` видно только свою сессию.

**`sp_who2` в справочнике Microsoft отсутствует** (проверено 22.08.2026: в каталоге системных хранимых процедур документации страницы с таким именем нет). Это недокументированная процедура: на состав её столбцов, их порядок и смысл опираться нельзя, контракта у неё нет.

Современная замена связке: `sys.dm_exec_connections` + `sys.dm_exec_sessions` + `sys.dm_exec_requests`. Сама страница `sp_who` отсылает к `sys.dm_exec_sessions.is_user_process`, чтобы отделить системные процессы от пользовательских.

---

## Где заканчивается диагностика этого скилла

Скилл доводит разбор до `wait_type` в `sys.dm_exec_requests` — то есть отвечает на вопросы «что выполняется», «кто кого блокирует», «чего запрос ждёт по названию ожидания».

Дальше начинается **администрирование СУБД**: классификация типов ожиданий, `sys.dm_os_wait_stats`, `sys.dm_os_waiting_tasks`, интерпретация `PAGEIOLATCH`, `CXPACKET`, `LCK_M_*` и прочего. Это другой предмет, другой читатель и другие права — в справочнике языка для читающего агента этого нет. Сказать пользователю прямо: «вижу тип ожидания X, дальнейший разбор — задача администратора базы».

---

## Что доступно при слабых правах

Таблица доступности — в [permissions-visibility.md](permissions-visibility.md), раздел «Что читается при слабых правах». Здесь она не дублируется.

Короткий ориентир: без серверных прав из этого файла работает только «своя сессия» в `sys.dm_exec_sessions`; всё остальное требует `VIEW SERVER STATE` или его гранулярных наследников 2022+.

---

## Куда дальше

- Права и как их проверить — [permissions-visibility.md](permissions-visibility.md).
- План запроса и замеры — [read-semantics.md](read-semantics.md).
- Готовые диагностические запросы — [recipes.md](recipes.md).
