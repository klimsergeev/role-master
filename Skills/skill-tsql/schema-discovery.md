# Обнаружение схемы

Отвечает на вопрос: **какие есть таблицы, столбцы, ключи, связи, объёмы — и почему то, что я увидел, выглядит именно так.**

Готовые запросы к этому файлу — в [recipes.md](recipes.md). Здесь то, чего запросом не узнать: как читать то, что вернулось.

---

## `sys.*` против `INFORMATION_SCHEMA`

Два предупреждения Microsoft, дословно. Они разные, и второе объясняет причину:

> «Don't use INFORMATION_SCHEMA views to determine the schema of an object. INFORMATION_SCHEMA views only represent a subset of the metadata of an object. The only reliable way to find the schema of an object is to query the `sys.objects` catalog view.»
> — страница `INFORMATION_SCHEMA.COLUMNS`

> «The only reliable way to find the schema of an object is to query the `sys.objects` catalog view. INFORMATION_SCHEMA views could be incomplete since they are not updated for all new features.»
> — страница `INFORMATION_SCHEMA.TABLES`

Третье, про типы:

> «Don't use INFORMATION_SCHEMA views to determine the schema of a data type. The only reliable way to find the schema of a type is to use the TYPEPROPERTY function.»
> — там же, столбец `DOMAIN_SCHEMA`

Плюс общее: «Some changes were made to the information schema views that break backward compatibility».

**Практический вывод.** `sys.*` — основной источник. `INFORMATION_SCHEMA` берётся ровно в одном случае: когда запрос должен работать не только на SQL Server (это ISO-стандартные представления). Во всех остальных — это неполные данные, и это сказано прямо.

---

## Карта каталогов: куда идти за чем

| Представление | Когда нужно |
|---|---|
| `sys.objects` | Единственный надёжный способ узнать схему объекта; фильтр по типу объекта |
| `sys.tables` | Только пользовательские таблицы, с их свойствами |
| `sys.columns` | Столбцы, их типы, длины, nullability, вычисляемость |
| `sys.types` | Читаемое имя типа по `user_type_id`; `precision`, `scale`, `is_user_defined` |
| `sys.schemas` | Имя схемы по `schema_id`. Видно роли public |
| `sys.indexes` | Индексы и кучи объекта |
| `sys.index_columns` | Состав индекса: ключевые столбцы по порядку, включённые столбцы, направление сортировки |
| `sys.foreign_keys` | Внешние ключи: кто на кого ссылается на уровне объектов |
| `sys.foreign_key_columns` | Пары столбцов внутри внешнего ключа |
| `sys.partitions` | Приблизительное число строк, схема сжатия. Видно роли public |
| `sys.sql_modules` | Текст определения представления, процедуры, функции, триггера |
| `sys.triggers` | Триггеры, включая DDL-триггеры (их в `sys.objects` нет) |
| `sys.sql_expression_dependencies` | Зависимости объект-на-объект в обе стороны — но по умолчанию только `db_owner` |
| `sys.dm_sql_referencing_entities` | «Кто ссылается на эту таблицу» |
| `sys.dm_sql_referenced_entities` | «На что ссылается этот модуль», с точностью до столбцов |

Все они, кроме `sys.partitions` и `sys.schemas`, подчиняются правилам видимости метаданных: пустой результат может означать «нет прав», а не «нет объектов» ([permissions-visibility.md](permissions-visibility.md)).

---

## Коды `sys.objects.type`

Редкий случай, когда полный список нужен: без него `type = 'IF'` не прочитать.

| Код | Что это | Код | Что это |
|---|---|---|---|
| `U` | таблица (пользовательская) | `V` | представление |
| `P` | процедура T-SQL | `PC` | процедура CLR |
| `FN` | скалярная функция T-SQL | `FS` | скалярная функция CLR |
| `IF` | встраиваемая табличная функция | `TF` | табличная функция T-SQL |
| `FT` | табличная функция CLR | `AF` | агрегатная функция CLR |
| `TR` | DML-триггер T-SQL | `TA` | DML-триггер CLR |
| `PK` | ограничение первичного ключа | `UQ` | ограничение уникальности |
| `F` | ограничение внешнего ключа | `C` | ограничение CHECK |
| `D` | значение по умолчанию | `R` | правило (старого образца) |
| `S` | системная базовая таблица | `IT` | внутренняя таблица |
| `SN` | синоним | `SO` | объект-последовательность |
| `SQ` | очередь Service Broker | `TT` | табличный тип |
| `PG` | руководство по плану | `RF` | процедура-фильтр репликации |
| `X` | расширенная хранимая процедура | `ST` | дерево статистики (2016+) |
| `ET` | внешняя таблица (2017+) | `EC` | edge-ограничение |

Две вещи, которые из списка не следуют:

- **DDL-триггеров здесь нет.** `TR` — только DML-триггеры: «DML trigger names are schema-scoped and, therefore, are visible in `sys.objects`. DDL trigger names are scoped by the parent entity and are only visible in this view [`sys.triggers`]». В `sys.triggers` их различает `parent_class`: 0 — база (DDL), 1 — объект или столбец (DML).
- **XML- и пространственные индексы прячутся как `IT`.** «An extended index, such as an XML index or spatial index, is considered an internal table in `sys.objects` (`type` is `IT`)». У такой строки `parent_object_id` — это `object_id` базовой таблицы.

---

## Ловушки интерпретации столбцов

| Что видно | Как читать |
|---|---|
| `sys.columns.max_length` | **Байты, не символы.** `nvarchar(50)` → `100`. `-1` = тип `varchar(max)`, `nvarchar(max)`, `varbinary(max)` или `xml`. Для `text`, `ntext`, `image` — `16`: это размер указателя, а не данных (либо значение, заданное `sp_tableoption 'text in row'`). Чтобы получить длину в символах, делите на 2 для `nchar`/`nvarchar` — и не забудьте, что `n` в `nvarchar(n)` считает пары байтов, а не символы ([traps.md](traps.md)) |
| `sys.columns.column_id` | **Не последователен.** «Column IDs might not be sequential» — после удаления столбца в нумерации остаётся дыра. Для порядкового номера столбца в выводе используйте `ROW_NUMBER`, а не `column_id` |
| `sys.columns.collation_name` | `NULL` для несимвольных типов — это норма, а не отсутствие прав |
| `sys.columns.default_object_id` | `0` — умолчания нет. Ненулевое значение — идентификатор объекта умолчания; сам текст лежит в `sys.default_constraints` |
| `sys.indexes.index_id` | `0` — куча, `1` — кластерный индекс, `> 1` — некластерный |
| `sys.indexes.name IS NULL` | Куча. Не «индекс без имени» |
| `sys.indexes.is_hypothetical` | `1` — индекс гипотетический, «can't be used directly as a data access path». В списке реальных индексов фильтруйте `is_hypothetical = 0` |
| `sys.indexes.filter_definition` | `NULL` у кучи, у нефильтрованного индекса **и при нехватке прав на таблицу** — три разные причины, одно значение |
| `sys.index_columns.key_ordinal` | 1-based позиция в ключе. `0` — столбец не ключевой, либо это XML-, columnstore-, пространственный или JSON-индекс |
| `sys.index_columns.is_included_column` | `1` — столбец добавлен через `INCLUDE` (или это columnstore). Столбцы, попавшие в индекс неявно как часть ключа кластеризации, **в `sys.index_columns` не перечислены вовсе** |
| `sys.index_columns.column_id = 0` | Идентификатор строки (RID) в некластерном индексе, а не столбец |
| `sys.objects.modify_date` | Меняется не только от `ALTER` объекта: «If the object is a table or a view, `modify_date` also changes when an index on the table or view is created or altered». Использовать как «когда меняли структуру» можно, как «когда меняли определение» — нет |
| `sys.partitions.rows` | **Приблизительно.** «the approximate number of rows in this partition». Точное значение — только `COUNT_BIG(*)` |
| `sys.types.max_length` | Те же байты и та же `-1`, что у `sys.columns` |

---

## Число строк и объём без `COUNT(*)`

Два источника, и они не равнозначны:

| Источник | Права | Что даёт |
|---|---|---|
| `sys.partitions.rows` | членство в public | Приблизительное число строк. Работает почти всегда |
| `sys.dm_db_partition_stats.row_count` | `VIEW DATABASE STATE` + `VIEW DEFINITION`; на 2022+ — `VIEW DATABASE PERFORMANCE STATE` + `VIEW SECURITY DEFINITION` | Приблизительное число строк **и** страницы: `used_page_count`, `reserved_page_count`, `in_row_data_page_count` |

Оба документированы словом «approximate». Это кэшированные метаданные, а не подсчёт: расхождение с `COUNT_BIG(*)` — норма, а не признак поломки.

**Обязательный фильтр — `index_id IN (0, 1)`.** Строки в каталоге лежат по одной на каждый индекс, поэтому без фильтра таблица с тремя некластерными индексами посчитается четыре раза. Microsoft в собственном примере пишет ровно это: `WHERE object_id = OBJECT_ID(...) AND (index_id = 0 or index_id = 1)`.

**Суммируйте по партициям.** У партиционированной таблицы строк в каталоге столько, сколько партиций: нужен `SUM(rows)` с группировкой по `object_id`.

Чего в `sys.partitions` нет: «Special index types such as Full-Text, Spatial, and XML aren't included in this view». Для обычной задачи «сколько строк в таблице» это неважно, для инвентаризации индексов — важно.

---

## Определение объекта: как получить DDL

Короткий ответ: **готового генератора DDL таблицы в T-SQL нет.** Ни одна системная функция не отдаёт `CREATE TABLE`. Что есть:

| Инструмент | Что отдаёт | Ограничение |
|---|---|---|
| `sys.sql_modules.definition` | Цельный текст модуля, `nvarchar(max)` | Только модули: типы `P`, `RF`, `V`, `TR`, `FN`, `IF`, `TF`, `R` и отдельно стоящие умолчания `D`. `NULL` — если модуль зашифрован **или** нет `VIEW DEFINITION` |
| `OBJECT_DEFINITION(object_id)` | То же значение функцией | Список поддерживаемых типов: `C`, `D`, `P`, `FN`, `R`, `RF`, `TR`, `IF`, `TF`, `V`. **Типа `U` в списке нет** — для таблицы вернёт `NULL`. Возвращает `NULL` и при отсутствии прав |
| `sp_helptext` | Тот же текст, но **порезанный по 255 символов на строку** («Each row contains 255 characters of the Transact-SQL definition») | Строки нужно склеивать в правильном порядке. Проще взять `sys.sql_modules.definition` целиком |
| `sp_help` | Несколько наборов результатов: сам объект, столбцы, идентичность, файловые группы, индексы, ограничения, ссылающиеся объекты | Наборов несколько и схемы у них разные; многие клиенты показывают только первый. Для программного разбора неудобен |
| `sp_helpindex` | Индексы объекта одним набором | Состав ключа отдаётся строкой, а не структурой |

**Что реально собрать по таблице вместо DDL:** `sys.columns` + `sys.types` (типы и длины) + `sys.indexes` + `sys.index_columns` (ключи) + `sys.foreign_keys` + `sys.foreign_key_columns` (связи) + `sys.default_constraints` и `sys.check_constraints` (ограничения). Готовые запросы — в [recipes.md](recipes.md).

**Ловушка переименования.** «Renaming a stored procedure, function, view, or trigger doesn't change the name of the corresponding object in the `definition` column of the `sys.sql_modules` catalog view or the definition returned by the `OBJECT_DEFINITION` built-in function.» То есть текст определения может называть объект старым именем — и это не рассинхронизация базы, а известное поведение `sp_rename`. Если имя в `sys.objects` и имя внутри `definition` разошлись, объект переименовывали.

---

## Зависимости: три инструмента, три роли

| Инструмент | Направление | Права по умолчанию |
|---|---|---|
| `sys.sql_expression_dependencies` | В обе стороны, на уровне объектов | «Requires `VIEW DEFINITION` permission on the database and `SELECT` permission on `sys.sql_expression_dependencies`… By default, `SELECT` permission is granted only to members of the `db_owner` fixed database role» — то есть читающему пользователю обычно **недоступно** |
| `sys.dm_sql_referencing_entities(объект, класс)` | «Кто ссылается на этот объект» | На 2014 и новее: разрешений на сам объект не требуется; нужен `VIEW DEFINITION` на ссылающийся объект. При частичных правах вернутся частичные результаты |
| `sys.dm_sql_referenced_entities(модуль, класс)` | «На что ссылается этот модуль», с точностью до столбцов | `SELECT` на саму функцию выдан public; нужен `VIEW DEFINITION` на ссылающийся модуль |

Классы для `sys.dm_sql_referencing_entities`: `OBJECT`, `TYPE`, `XML_SCHEMA_COLLECTION`, `PARTITION_FUNCTION`. Имя схемы обязательно везде, кроме `PARTITION_FUNCTION`.

**Когда придёт пусто, а не ошибка** (одинаково для обеих функций): указан системный объект; объекта нет в текущей базе; объект ни на что не ссылается (или на него никто не ссылается); передан неверный параметр. То есть **пустой результат ничего не доказывает** — четыре разные ситуации выглядят одинаково.

**Когда придёт ошибка:** нумерованная процедура в аргументе. Отдельно у `sys.dm_sql_referenced_entities` — **ошибка 2020**, когда не удалось разрешить зависимости на уровне столбцов; она «does not prevent the query from returning object-level dependencies», то есть объектные зависимости всё равно вернутся.

**Чего не отслеживает никто из троих:** правила, значения по умолчанию, временные таблицы, временные процедуры и системные объекты — «Dependency information isn't created or maintained for rules, defaults, temporary tables, temporary stored procedures, or system objects». Плюс тонкость по таблицам: таблица считается ссылающейся сущностью только тогда, когда ссылается на модуль, пользовательский тип или коллекцию XML-схем в определении вычисляемого столбца, ограничения `CHECK` или `DEFAULT`. Обычный внешний ключ здесь **не** зависимость — связи ищите в `sys.foreign_keys`.

CLR-триггеры не отслеживаются ни как ссылающиеся, ни как ссылаемые.

---

## Порядок работы с незнакомой базой

1. `SELECT DB_NAME()` — убедиться, где мы.
2. Проба видимости из [permissions-visibility.md](permissions-visibility.md) — понять, что вообще прочитается.
3. Список таблиц с приблизительным числом строк — чтобы отделить рабочие таблицы от пустых и служебных.
4. По интересующей таблице: столбцы и типы → ключи и индексы → внешние ключи в обе стороны.
5. Если в схеме есть представления и процедуры — их определения через `sys.sql_modules`, и только после проверки, что `VIEW DEFINITION` есть.

Все пять шагов — готовыми запросами в [recipes.md](recipes.md).

---

## Куда дальше

- Пустой ответ или `NULL` в определении — [permissions-visibility.md](permissions-visibility.md).
- Длины, коллации и прочее, что выглядит неправильно, — [traps.md](traps.md).
- Готовые запросы — [recipes.md](recipes.md).
