# Семантика чтения

Отвечает на вопрос: **безопасно ли это выполнить и повторить.**

**Это обязательная проверка, а не справка.** Прежде чем выполнить конструкцию, сверься с этим файлом. Подключение может оказаться пишущим: канал из скилла `skill-mssql-mcp` работает и с читающей, и с пишущей учётной записью, ограничения там опциональны и могут быть не включены. Формулировка «на read-only-подключении это всё равно не пройдёт» — не аргумент: у скилла нет оснований считать, что подключение read-only.

Правило одно: **читающей конструкцию делает её семантика, а не первое слово.**

---

## Выглядит `SELECT`'ом, но чтением не является

| Конструкция | Что делает на самом деле |
|---|---|
| `SELECT … INTO новая_таблица FROM …` | **Создаёт таблицу.** Требует `CREATE TABLE` в базе и `ALTER` на схему. Работает в два приёма: сначала создаётся таблица, потом вставляются строки, — и «if the inserts fail, the operation rolls back all the inserts, but the new (empty) table remains». То есть после неудачи в базе остаётся пустая таблица |
| `SELECT NEXT VALUE FOR последовательность` | **Потребляет значение последовательности необратимо.** «Sequence numbers are generated outside the scope of the current transaction. They're consumed whether the transaction using the sequence number is committed or rolled back». Требует `UPDATE` на объект последовательности или на его схему — то есть по правам это операция записи |
| `SELECT @переменная = столбец FROM …` | Меняет состояние сессии и по-другому ведёт себя с `@@ROWCOUNT`: присваивание в запросе выставляет `@@ROWCOUNT` в число прочитанных строк, а простое присваивание вне запроса — всегда в `1` ([traps.md](traps.md)) |
| `SELECT … FROM таблица TABLESAMPLE SYSTEM (…)` | Читает, но неявно ослабляет изоляцию: «When using SYSTEM, rows might be read under the READ UNCOMMITTED transaction isolation level» — то есть можно получить незакоммиченные данные, не написав `NOLOCK` |
| `COALESCE((подзапрос), …)` | Подзапрос вычисляется **дважды**: «`COALESCE` is a syntactic shortcut for the `CASE` expression… the input values are evaluated multiple times… the subquery is evaluated twice». Два чтения под `READ COMMITTED` могут вернуть разное. Побочных эффектов у чтения нет, но результат нестабилен |
| Вызов процедуры, у которой в разделе Permissions требуется `ALTER`, `CONTROL` или членство в роли | Не чтение. См. критерий ниже |

**Симметричная оговорка:** `sp_helptext`, `sp_help`, `sp_helpindex` и подобные — чтение; их страницы требуют лишь членства в public плюс права на объект.

---

## Как отличать в общем случае

Систематического перечня «системные процедуры, меняющие состояние» в документации нет. Документированный признак один — **раздел Permissions на странице конкретной процедуры**:

| Что написано в Permissions | Как трактовать |
|---|---|
| «Requires membership in the public role» (плюс, возможно, права на объект: `SELECT`, `VIEW DEFINITION`) | Чтение |
| Требуется `ALTER`, `CONTROL`, `TAKE OWNERSHIP`, `UPDATE`, `INSERT`, `CREATE …` | Не чтение |
| Требуется членство в `db_owner`, `db_ddladmin`, `sysadmin`, `serveradmin` | Не чтение (или как минимум не то, что стоит выполнять без спроса) |
| Раздела Permissions на странице нет | **Не считать чтением по умолчанию.** Отсутствие раздела — не разрешение |

Если процедуры нет в документации вовсе (например, `sp_who2`), опираться не на что: недокументированная процедура не имеет ни контракта на состав вывода, ни контракта на побочные эффекты.

---

## Уровни изоляции

Умолчание SQL Server — `READ COMMITTED`.

| Уровень | Что документация обещает |
|---|---|
| `READ UNCOMMITTED` | «statements can read rows that were modified by other transactions but not yet committed». Разделяемые блокировки не берутся, эксклюзивные не мешают чтению. Возможны «грязные» чтения; «Values in the data can be changed and rows can appear or disappear in the data set before the end of the transaction». Эквивалент `NOLOCK` на всех таблицах всех `SELECT` в транзакции |
| `READ COMMITTED` | «statements can't read data that was modified but not committed by other transactions». Грязных чтений нет; неповторяющиеся чтения и фантомы возможны. **Умолчание** |
| `REPEATABLE READ` | Плюс к предыдущему: никто не может изменить прочитанные строки до конца транзакции. Фантомы (новые строки, подходящие под условие) остаются возможны |
| `SNAPSHOT` | Транзакция видит согласованный снимок данных **на момент своего начала**. Блокировок при чтении не берёт и пишущих не блокирует |
| `SERIALIZABLE` | Плюс запрет на вставку строк в прочитанный диапазон ключей: диапазонные блокировки держатся до конца транзакции. Эквивалент `HOLDLOCK` на всех таблицах всех `SELECT`. Самый ограничительный |

### Раздвоение `READ COMMITTED`

Поведение уровня по умолчанию зависит от настройки базы `READ_COMMITTED_SNAPSHOT`, и это надо знать до интерпретации результата:

| `READ_COMMITTED_SNAPSHOT` | Что происходит | Где так по умолчанию |
|---|---|---|
| `OFF` | Движок берёт разделяемые блокировки на время чтения и освобождает их по мере продвижения | Умолчание «коробочного» SQL Server |
| `ON` | Блокировки не берутся, используется версионирование строк: каждый оператор видит согласованный снимок **на момент начала оператора** | Умолчание Azure SQL Database и SQL database в Fabric |

Значение читается из профиля: `sys.databases.is_read_committed_snapshot_on` ([server-profile.md](server-profile.md)).

### Условия и запреты `SNAPSHOT`

- Требуется `ALLOW_SNAPSHOT_ISOLATION = ON` в базе — и в **каждой** базе, к которой транзакция обращается.
- Транзакцию, начатую на другом уровне, переключить в `SNAPSHOT` нельзя: попытка прерывает транзакцию. Начатую в `SNAPSHOT` — можно перевести на другой уровень и обратно.
- Транзакция начинается в момент первого обращения к данным, а не в момент `BEGIN TRANSACTION`.

Состояние читается из `sys.databases.snapshot_isolation_state_desc`.

### Значение `transaction_isolation_level` в DMV

`transaction_isolation_level` есть и в `sys.dm_exec_sessions`, и в `sys.dm_exec_requests`, и возвращает число: 0 — `Unspecified`, 1 — `ReadUncommitted`, 2 — `ReadCommitted`, 3 — `RepeatableRead`, 4 — `Serializable`, 5 — `Snapshot`.

Расхождение написания (состояние на 22.08.2026): значение 3 на странице `sys.dm_exec_sessions` названо `RepeatableRead`, а на странице `sys.dm_exec_requests` — `Repeatable`. Число одно и то же, уровень один и тот же; при цитировании называйте число, а не имя.

---

## `NOLOCK`

`NOLOCK` — синоним `READUNCOMMITTED`. Это не ускоритель, а ослабление изоляции с документированными последствиями.

**Четыре последствия одной цитатой:**

> «Allowing dirty reads can cause higher concurrency, but at the cost of reading data modifications that then are rolled back by other transactions. This might generate errors for your transaction, present users with data that was never committed, or cause users to see records twice (or not at all).»

То есть: ошибки в вашем запросе; данные, которых никогда не было в базе; строки, увиденные дважды; строки, не увиденные вовсе.

**Что ещё надо знать:**

- **Ошибка 601.** «If you receive error message 601 when `READUNCOMMITTED` is specified, resolve it as you would a deadlock error (error message 1205), and retry your statement.» То есть это не «сломалась база», а штатный исход грязного чтения; лечение — повтор.
- **Sch-S-блокировки берутся всё равно.** «`READUNCOMMITTED` and `NOLOCK` hints apply only to data locks. All queries, including queries with `READUNCOMMITTED` and `NOLOCK` hints, acquire Sch-S (schema stability) locks during compilation and execution.» Поэтому от блокировки со стороны DDL (Sch-M) `NOLOCK` не спасает — запрос всё равно встанет.
- **Граница устаревания.** Устаревает **не** `NOLOCK` в `SELECT`, а применение `READUNCOMMITTED`/`NOLOCK` в предложении `FROM` к целевой таблице `UPDATE` или `DELETE`: «Support for use of the `READUNCOMMITTED` and `NOLOCK` hints in the `FROM` clause that apply to the target table of an `UPDATE` or `DELETE` statement will be removed in a future version». К читающим сценариям это не относится вовсе.
- **Официальные альтернативы**, названные прямо на той же странице: уровень `READ COMMITTED` с базой в режиме `READ_COMMITTED_SNAPSHOT ON`, либо уровень `SNAPSHOT`. Обе не дают грязных чтений.
- **Синтаксис.** `WITH (NOLOCK)`. Форма без `WITH` работает, но «Omitting the `WITH` keyword is a deprecated feature». Разделение хинтов пробелами вместо запятых — тоже устаревшая форма.

**Практическое правило скилла:** не предлагать `NOLOCK` как средство ускорения. Если пользователь просит его сам — выполнить, но назвать риски и упомянуть альтернативы.

---

## Прочие хинты, относящиеся к чтению

| Хинт | Что делает | Ограничения |
|---|---|---|
| `READPAST` | Пропускает заблокированные строки вместо ожидания | Пропускаются **строчные** блокировки; страничные — нет. Работает только на уровнях `READ COMMITTED` и `REPEATABLE READ`. Нельзя, если `READ_COMMITTED_SNAPSHOT = ON` и уровень сессии `READ COMMITTED` либо указан `READCOMMITTED` — в таком случае нужен `READCOMMITTEDLOCK` |
| `NOWAIT` | Возвращает сообщение сразу, как только встретил блокировку | Эквивалент `SET LOCK_TIMEOUT 0` для конкретной таблицы. **Не работает вместе с `TABLOCK`** — там надо ставить `SET LOCK_TIMEOUT 0;` перед запросом |
| `READCOMMITTEDLOCK` | Требует блокировочного, а не версионного `READ COMMITTED` | Работает независимо от `READ_COMMITTED_SNAPSHOT` |
| `HOLDLOCK` | Эквивалент `SERIALIZABLE` для одной таблицы, на время оператора | Нельзя в `SELECT` с `FOR BROWSE` |

**Ограничение на комбинации.** Больше одного хинта из каждой группы на таблицу нельзя:

- группа детализации блокировки: `PAGLOCK`, `NOLOCK`, `READCOMMITTEDLOCK`, `ROWLOCK`, `TABLOCK`, `TABLOCKX`;
- группа уровня изоляции: `HOLDLOCK`, `NOLOCK`, `READCOMMITTED`, `REPEATABLEREAD`, `SERIALIZABLE`.

`NOLOCK` входит в обе группы — поэтому его нельзя сочетать ни с `ROWLOCK`, ни с `HOLDLOCK`.

**Распространение на представления.** «All lock hints are propagated to all the tables and views that are accessed by the query plan, including tables and views referenced in a view.» То есть `NOLOCK` на представлении дотянется до базовых таблиц. Исключение: если таблица участвует только в вычисляемом столбце, хинт до неё не доходит и не применяется.

Хинт, указанный на таблице, к которой план не обращается вовсе, просто игнорируется.

---

## План без выполнения

`SET SHOWPLAN_XML ON` — **единственный из рассмотренных способов, который документированно не выполняет оператор**:

> «When SET SHOWPLAN_XML is ON, SQL Server returns execution plan information for each statement without executing it, and Transact-SQL statements are not executed.»

| Способ | Выполняет оператор? | Формат | Права |
|---|---|---|---|
| `SET SHOWPLAN_XML ON` | Нет | XML (`nvarchar(max)`) | `SHOWPLAN` на всех базах с задействованными объектами + права на сам оператор |
| `SET SHOWPLAN_ALL ON` | Нет | Набор строк-дерево | То же |
| `SET SHOWPLAN_TEXT ON` | Нет | Одна колонка `StmtText` | То же |
| `sys.dm_exec_query_plan(plan_handle)` | Не выполняет ничего — читает то, что уже в кэше | XML | `VIEW SERVER STATE` / 2022+ `VIEW SERVER PERFORMANCE STATE` |
| «Include Actual Execution Plan» в SSMS | Да, выполняет | XML | — |

**Ограничения `SET SHOWPLAN_*`:**

- «SET SHOWPLAN_XML cannot be specified inside a stored procedure. It must be the only statement in a batch.» То же и для `SHOWPLAN_ALL`, и для `SHOWPLAN_TEXT`.
- **Каскадная ловушка.** DDL внутри режима тоже не выполняется, поэтому последующие ссылки на созданный объект падают: «if a CREATE TABLE statement is executed while SET SHOWPLAN_XML is ON, SQL Server returns an error message from a subsequent SELECT statement involving that same table; the specified table does not exist».
- Конфликт с SSMS: «If Include Actual Execution Plan is selected in SQL Server Management Studio, this SET option does not produce XML Showplan output».
- Единицы стоимости в выводе — не секунды: «Cost units are based on an internal measurement of time, not wall-clock time. They are used for determining the relative cost of a plan in comparison to other plans».
- Заметки об устаревании на странице `SET SHOWPLAN_ALL` нет (проверено 22.08.2026) — это не deprecated-конструкция, просто вывод рассчитан на программный разбор.

**`sys.dm_exec_query_plan` — когда SET-режим недоступен** (например, канал отклоняет `SET`-операторы, см. мостик ниже). Возвращает «the same information as SET SHOWPLAN XML в типе `xml`». Что надо знать про его пропуски:

- план вытеснен из кэша → `query_plan` = `NULL`;
- некоторые операторы не кэшируются вовсе (массовые операции, операторы со строковыми литералами больше 8 КБ) → плана нет, если пакет не выполняется прямо сейчас;
- вызов пользовательской функции или динамического SQL внутри пакета: их план в результат не входит, за ним нужен отдельный вызов с их `plan_handle`;
- при простой или принудительной параметризации ad-hoc-запроса в `query_plan` будет только текст оператора;
- глубина вложенности XML свыше 128 уровней → `query_plan` = `NULL` (в старых версиях была ошибка 6335); обходной путь — `sys.dm_exec_text_query_plan`.

`plan_handle` берётся из `sys.dm_exec_requests`, `sys.dm_exec_query_stats`, `sys.dm_exec_cached_plans`, `sys.dm_exec_procedure_stats`, `sys.dm_exec_trigger_stats`.

---

## Замер с выполнением

`SET STATISTICS IO ON` — **запрос выполняется**. Плюс в том, что `SHOWPLAN` не требуется: «To use `SET STATISTICS IO`, users must have the appropriate permissions to execute the Transact-SQL statement. The SHOWPLAN permission isn't required». Отсюда его доступность при слабых правах.

Как читать вывод:

| Показатель | Значение |
|---|---|
| `Scan count` | Число поисков или сканирований, начатых на уровне листьев. `0` — если использован уникальный или кластерный индекс по первичному ключу и ищется одно значение; `1` — поиск одного значения по неуникальному кластерному индексу; `N` — столько отдельных поисков |
| `logical reads` | Страниц прочитано из кэша данных. Основной показатель «сколько работы сделал запрос» |
| `physical reads` | Страниц прочитано с диска |
| `read-ahead reads` | Страниц подтянуто упреждающим чтением |
| `lob logical reads` и прочие `lob …` | То же для LOB-страниц: `text`, `ntext`, `image`, `varchar(max)`, `nvarchar(max)`, `varbinary(max)`, columnstore |
| `page server reads` и `page server read-ahead reads` | Ненулевые только в Azure SQL Database Hyperscale |

**Ловушка с LOB:** «some LOB retrieval operations might require traversing the LOB tree multiple times. This can cause SET STATISTICS IO to report higher than expected logical reads». Завышенные логические чтения на LOB-столбцах — не обязательно проблема запроса.

`SET STATISTICS TIME ON` — тоже выполняет запрос, показывает миллисекунды на разбор, компиляцию и выполнение каждого оператора. `SHOWPLAN` не требуется. Оговорка со страницы: в режиме fiber (конфигурация **lightweight pooling**) точную статистику получить нельзя.

---

## Таймауты

**Серверного таймаута на время выполнения запроса в T-SQL нет.** Единственный серверный таймаут, относящийся к ожиданию, — `SET LOCK_TIMEOUT`: сколько миллисекунд оператор ждёт освобождения блокировки. Умолчание `-1` — ждать вечно; `0` — не ждать вовсе. Настройка действует до конца соединения. `CREATE DATABASE`, `ALTER DATABASE` и `DROP DATABASE` её не соблюдают.

**Оговорка.** Прямой формулировки «ограничение времени выполнения запроса — настройка клиента» в документации найти не удалось; вывод построен на том, что серверного механизма для этого не описано. Так и следует говорить пользователю: «серверного таймаута на выполнение нет, ограничение по времени задаётся на стороне клиента» — с оговоркой, что это вывод из отсутствия механизма, а не цитата.

**Номер ошибки таймаута блокировки документация не называет** — страница говорит только «an error is returned». Номер в скилле не приводится, потому что догадка в справочнике — это выдуманный факт.

---

## Что делать перед выполнением: короткий чеклист

1. Начинается ли конструкция с чего-то из первой таблицы этого файла? Если да — это не чтение, останавливаемся и объясняем пользователю.
2. Вызывается ли системная процедура? Если да — открываем её страницу и смотрим раздел Permissions.
3. Ограничен ли результат: `TOP (n)` вместе с `ORDER BY` либо `OFFSET … FETCH`?
4. Не полагаемся ли мы на то, что канал не пропустит запись? Полагаться нельзя.

---

## Мостик

Что физически не даст выполнить запись — гейт инструментов MCP-сервера, роль базы, `DENY`, настройки разрешений клиента — описано в скилле `skill-mssql-mcp`. Там же смотри, может ли канал отклонить `SET`-операторы: если да, `SET SHOWPLAN_XML` и `SET STATISTICS IO` будут недоступны и план придётся брать через `sys.dm_exec_query_plan`.

Мостик не отменяет проверок этого файла: ограничения канала опциональны и могут быть не включены.

---

## Куда дальше

- Права на диагностические представления — [permissions-visibility.md](permissions-visibility.md).
- Что показывает план и кто кого блокирует — [dmv-diagnostics.md](dmv-diagnostics.md).
- Почему результат неожиданный, хотя запрос читающий, — [traps.md](traps.md).
