# Отличия диалекта

Отвечает на вопрос: **я знаю SQL — что здесь пишется иначе.**

Версионно-зависимые конструкции сверяй с [version-matrix.md](version-matrix.md), а прежде чем выполнить — с [read-semantics.md](read-semantics.md).

---

## Ограничение выборки: `TOP` вместо `LIMIT`

Ключевого слова `LIMIT` в T-SQL нет.

```sql
SELECT TOP (100) column_a, column_b
FROM   dbo.some_table
ORDER  BY column_a;
```

| Что | Как в T-SQL |
|---|---|
| Скобки | Обязательны везде, кроме `SELECT` с целочисленной константой, где они оставлены для обратной совместимости. «We recommend that you always use parentheses for `TOP` in `SELECT` statements» |
| Порядок без `ORDER BY` | «Otherwise, `TOP` returns the first *n* number of rows in an undefined order». Не «первые попавшиеся, но стабильно» — **неопределённый** |
| `PERCENT` | Доля строк; дробное число строк округляется вверх. Аргумент неявно приводится к `float` |
| `WITH TIES` | Требует `ORDER BY`; может вернуть больше строк, чем указано. «The returned order of tying records is arbitrary. `ORDER BY` doesn't affect this rule» |
| `TOP` с `UNION`, `UNION ALL`, `EXCEPT`, `INTERSECT` | Неинтуитивно: `TOP` логически отрабатывает **до** `ORDER BY`, который сортирует уже результат объединения. Правильный способ — вынести каждый `TOP … ORDER BY` в подзапрос, и только потом объединять |

## Пагинация: `OFFSET … FETCH`

`OFFSET … FETCH` — часть предложения `ORDER BY`, отдельно не существует. **Applies to: SQL Server 2012 и новее.**

```sql
SELECT   column_a, column_b
FROM     dbo.some_table
ORDER BY column_a, id          -- уникальный «хвост» обязателен, см. ниже
OFFSET   40 ROWS FETCH NEXT 20 ROWS ONLY;
```

- `OFFSET` обязателен, `FETCH` — нет.
- Нельзя сочетать с `TOP` в одной области запроса.
- Не поддерживается в индексированных представлениях и в представлениях с `CHECK OPTION`.
- Предложение `OVER` его не поддерживает.
- В запросе с `UNION`, `EXCEPT` или `INTERSECT` — только в финальной части, задающей порядок.
- Прямо в `INSERT`, `UPDATE`, `MERGE`, `DELETE` нельзя, но можно в подзапросе внутри них.

**Два условия стабильной пагинации** (дословно со страницы): данные не меняются между запросами страниц — либо все страницы читаются в одной транзакции уровня `SNAPSHOT`/`SERIALIZABLE`; и `ORDER BY` содержит столбец или набор столбцов, **гарантированно уникальный**. Без второго условия строки будут дублироваться и пропадать между страницами.

**Чем ограничивать — здесь; зачем ограничивать — у соседа.** Синтаксис и приёмы (`TOP (n)` вместе с `ORDER BY`, `OFFSET … FETCH`, постраничная выдача) описаны в этом файле. Числовые пороги, при которых результат обрезается — лимиты самого сервера и лимиты канала, — в скилле `skill-mssql-mcp`.

## Что `ORDER BY` не гарантирует

- **В представлениях, встраиваемых функциях, производных таблицах и подзапросах** `ORDER BY` допустим только вместе с `TOP` или `OFFSET … FETCH` — и там он определяет только, какие строки попадут в выборку: «The `ORDER BY` clause doesn't guarantee ordered results when these constructs are queried, unless `ORDER BY` is also specified in the query itself».
- **При `SELECT … INTO` и `INSERT … SELECT`** порядок вставки не гарантируется.
- **Лимит 8060 байт** на суммарный размер столбцов сортировки. Числа столбцов лимит не имеет.
- **Нельзя сортировать** по `ntext`, `text`, `image`, `geography`, `geometry`, `xml`.
- **`NULL` — наименьшее значение**: «NULL values are treated as the lowest possible values».

---

## Идентификаторы и квадратные скобки

- Длина идентификатора — от 1 до 128 символов; для локальных временных таблиц — не больше 116.
- Разделители: квадратные скобки `[…]` или двойные кавычки `"…"`.
- Правая скобка внутри имени экранируется удвоением: `[My]]Table]`.
- **Ключевое отличие от двойных кавычек:** «`SET QUOTED_IDENTIFIER` doesn't affect bracket-delimited identifiers. Bracket delimiters always work regardless of the `QUOTED_IDENTIFIER` setting». Двойные кавычки при `QUOTED_IDENTIFIER OFF` превращаются в строковый литерал. Отсюда правило: в генерируемом коде — только скобки.
- `QUOTENAME(строка)` собирает корректный идентификатор в скобках и экранирует сам: `QUOTENAME('abc[]def')` → `[abc[]]def]`.
- Префиксы значимы: `@` — локальная переменная или параметр, `#` — временная таблица или процедура, `##` — глобальный временный объект, `@@` — зарезервировано под встроенные функции.
- **Регистр имён определяется коллацией базы**: в базе с регистрозависимой коллацией можно создать две таблицы, различающиеся только регистром, в регистронезависимой — нельзя.
- Список зарезервированных слов зависит от уровня совместимости базы.

---

## Конкатенация строк

| Способ | Поведение с `NULL` | Версия |
|---|---|---|
| `a + b` | `NULL`, если любой операнд `NULL`. С 2017 иначе быть не может: `CONCAT_NULL_YIELDS_NULL OFF` объявлен устаревшим, «Starting with SQL Server 2017, `CONCAT_NULL_YIELDS_NULL` is always set to ON» | всегда |
| `CONCAT(a, b, …)` | `NULL` превращается в пустую строку. От 2 до 254 аргументов; при всех `NULL` возвращает пустую строку типа `varchar(1)` | 2012+ (год на странице не указан; см. [version-matrix.md](version-matrix.md)) |
| `CONCAT_WS(разделитель, a, b, …)` | Разделитель первым аргументом | 2017+ |
| `a \|\| b` | Как у `+` | 2025+ |

**Ловушка усечения у `CONCAT`:** «If none of the input arguments has a supported large object (LOB) type, then the return type truncates to 8,000 characters in length, regardless of the return type». То есть склейка десятка `varchar(1000)` молча обрежется на 8000 символов, если ни один аргумент не `max`. Лечение — привести первый аргумент к `nvarchar(max)`.

Тип результата `CONCAT` определяется таблицей на странице: любой аргумент CLR-типа или `nvarchar(max)` → `nvarchar(max)`; иначе `varchar(max)`/`varbinary(max)` → `varchar(max)`, но при наличии любого `nvarchar` — `nvarchar(max)`; и так далее.

---

## Дата и время

Шесть типов, и выбор между ними важнее, чем кажется:

| Тип | Диапазон дат | Точность | Часовой пояс |
|---|---|---|---|
| `datetime` | 1753-01-01 … 9999-12-31 | «Rounded to increments of `.000`, `.003`, or `.007` seconds» — то есть не миллисекунда | нет |
| `smalldatetime` | 1900-01-01 … 2079-06-06 | одна минута (секунды округляются: ≤ 29.998 вниз, ≥ 29.999 вверх) | нет |
| `datetime2(n)` | 0001-01-01 … 9999-12-31 | 100 наносекунд, точность 0–7, по умолчанию 7 | нет |
| `datetimeoffset(n)` | 0001-01-01 … 9999-12-31 | 100 наносекунд | **да**, от `-14:00` до `+14:00` |
| `date` | 0001-01-01 … 9999-12-31 | один день | нет |
| `time(n)` | — | 100 наносекунд | нет |

Четыре практических следствия:

1. **`datetime` не покрывает даты до 1753 года** — исторические даты в него не лягут.
2. **Точность `datetime` — не миллисекунда.** Значение `.001` в нём не хранится: округлится к `.000`. Сравнение «на равенство» с миллисекундами по `datetime` работать не будет.
3. **`smalldatetime` заканчивается в 2079 году** и округляется до минуты — для дат «на будущее» непригоден.
4. **Смещение часового пояса хранит только `datetimeoffset`.** Остальные типы — «наивное» время без пояса.

**Две группы функций текущего момента:**

| Функция | Тип результата | Особенность |
|---|---|---|
| `SYSDATETIME()` | `datetime2(7)` | Точнее, чем `GETDATE` |
| `SYSUTCDATETIME()` | `datetime2(7)` | UTC |
| `SYSDATETIMEOFFSET()` | `datetimeoffset(7)` | Единственная, что отдаёт смещение системы |
| `GETDATE()`, `CURRENT_TIMESTAMP` | `datetime` | Точность `datetime`, см. выше |
| `GETUTCDATE()` | `datetime` | UTC |

Все они **недетерминированы**: «Views and expressions that reference this function in a column cannot be indexed». Значение берётся из операционной системы хоста, то есть часовой пояс — это пояс машины, а не базы. В Azure SQL Database (кроме Managed Instance) и Azure Synapse время всегда UTC.

Пересчёт в пояс — `AT TIME ZONE` (2016+); имена поясов берутся из реестра Windows, список доступен в `sys.time_zone_info`.

Разбор строковых литералов дат — отдельная и самая частая ловушка, она в [traps.md](traps.md).

---

## `ISNULL` против `COALESCE`

Пять различий, все со страницы `COALESCE`:

1. **Число вычислений.** `ISNULL` — функция, вычисляется один раз. `COALESCE` — сахар над `CASE`, аргументы вычисляются повторно; **подзапрос внутри `COALESCE` выполняется дважды** и под `READ COMMITTED` может вернуть разное. Совет документации: либо `SNAPSHOT`, либо `ISNULL`, либо вынести подзапрос в производную таблицу.
2. **Тип результата.** `ISNULL` берёт тип первого аргумента. `COALESCE` — по правилам `CASE`, то есть тип с наивысшим приоритетом.
3. **Nullability результата.** `ISNULL(NULL, 1)` считается NOT NULL, `COALESCE(NULL, 1)` — nullable. Разница проявляется в вычисляемых столбцах и ключах.
4. **Проверки.** `NULL` в `ISNULL` неявно приводится к `int`; в `COALESCE` нужно указывать тип явно.
5. **Число аргументов.** `ISNULL` — ровно два, `COALESCE` — сколько угодно.

Плюс молчаливое усечение у `ISNULL`: «`replacement_value` can be truncated if `replacement_value` is longer than `check_expression`» — замена приводится к типу первого аргумента и обрезается по его длине.

---

## Целочисленное деление и приоритет типов

**Деление целых усекает дробную часть:** «If an integer *dividend* is divided by an integer *divisor*, the result is an integer that has any fractional part of the result truncated». `7 / 2` — это `3`, а не `3.5`. Лечение: `7 * 1.0 / 2` или явный `CAST`.

**Приоритет типов** (от высшего к низшему) — тот случай, когда полный список нужен: без него направление неявного преобразования не вывести.

1. пользовательские типы (высший)
2. `json` (2025+)
3. `sql_variant`
4. `xml`
5. `datetimeoffset`
6. `datetime2`
7. `datetime`
8. `smalldatetime`
9. `date`
10. `time`
11. `float`
12. `real`
13. `decimal`
14. `money`
15. `smallmoney`
16. `bigint`
17. `int`
18. `smallint`
19. `tinyint`
20. `bit`
21. `ntext`
22. `text`
23. `image`
24. `timestamp`
25. `uniqueidentifier`
26. `nvarchar` (включая `nvarchar(max)`)
27. `nchar`
28. `varchar` (включая `varchar(max)`)
29. `char`
30. `varbinary` (включая `varbinary(max)`)
31. `binary` (низший)

«When an operator combines expressions of different data types, the data type with the lower precedence is first converted to the data type with the higher precedence. If the conversion isn't a supported implicit conversion, an error is returned.»

Канонический пример ошибки 245 со страницы `CAST and CONVERT`:

```sql
DECLARE @notastring INT = '1';
SELECT @notastring + ' is not a string.';
-- Msg 245: Conversion failed when converting the varchar value ' is not a string.' to data type int.
```

Причина: `int` выше `varchar`, поэтому движок пытается привести строку к числу, а не наоборот.

**Округление или усечение при `CAST`** — таблица со страницы:

| Из | В | Что происходит |
|---|---|---|
| `numeric` | `numeric` | округление |
| `numeric` | `int` | **усечение** |
| `numeric` | `money` | округление |
| `money` | `int` | округление |
| `money` | `numeric` | округление |
| `float` | `int` | **усечение** |
| `float` | `numeric` | округление |
| `float` | `datetime` | округление |
| `datetime` | `int` | округление |

Проверочный пример из документации: `CAST(10.6496 AS INT)` → `10`, а `CAST(10.6496 AS NUMERIC)` → `11`.

---

## `IIF`, `CHOOSE`, `TRY_CAST`

- **`IIF(условие, a, b)`** — сокращение для `CASE`. Отсюда всё остальное: вложенность ограничена десятью уровнями, потому что столько же у `CASE`; на связанные серверы уезжает как `CASE`. `IIF(45 > 30, NULL, NULL)` с двумя нетипизированными `NULL` — **ошибка**; с двумя `NULL`-переменными известного типа — обычный `NULL`.
- **`CHOOSE(индекс, v1, v2, …)`** — индекс 1-based. Выход за границы списка даёт `NULL`, а не ошибку. Индекс нецелого числового типа неявно приводится к `int`.
- **`TRY_CAST` / `TRY_CONVERT`** — возвращают `NULL`, если преобразование не удалось. **Но:** «if you request a conversion that is explicitly not permitted, then `TRY_CAST` fails with an error». То есть `NULL` — только для «данные не подошли», а не для «такое преобразование запрещено в принципе». `TRY_CAST` не работает для `varchar(max)` длиннее 8000 и `nvarchar(max)` длиннее 4000. Результат обеих функций зависит от `SET DATEFORMAT` и `SET LANGUAGE` при разборе дат ([traps.md](traps.md)).

---

## `CROSS APPLY` и `OUTER APPLY` вместо `LATERAL`

Ключевого слова `LATERAL` в T-SQL нет. Его роль играет `APPLY`:

| T-SQL | Смысл |
|---|---|
| `CROSS APPLY` | Правый источник вычисляется для каждой строки левого; строки, для которых он пуст, из результата исчезают |
| `OUTER APPLY` | То же, но строки с пустым правым источником остаются, а его столбцы — `NULL` |

**Асимметрия, ради которой всё и затевается:** «the *right_table_source* can use a table-valued function that takes a column from the *left_table_source* as one of the arguments of the function. The *left_table_source* can include table-valued functions, but it can't contain arguments that are columns from the *right_table_source*». Слева на правое ссылаться нельзя, справа на левое — можно.

Канонический пример — передача дескриптора в табличную функцию; на этом построена вся диагностика из [dmv-diagnostics.md](dmv-diagnostics.md):

```sql
SELECT   r.session_id, t.text
FROM     sys.dm_exec_requests AS r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS t
WHERE    r.session_id <> @@SPID
ORDER BY r.session_id;
```

Ограничение: «Up to 256 table sources can be used in a statement, although the limit varies depending on available memory and the complexity of other expressions in the query».

---

## Переменные и временные объекты

| Обозначение | Что это |
|---|---|
| `@имя` | Локальная переменная или параметр |
| `#имя` | Локальная временная таблица (видна своей сессии) |
| `##имя` | Глобальная временная таблица |
| `@имя TABLE (…)` | Табличная переменная |

Про табличную переменную надо знать четыре вещи, все документированы:

1. **Статистик нет.** «`table` variables don't have distribution statistics. They don't trigger recompiles. In many cases, the optimizer builds a query plan on the assumption that the table variable has no rows.» Отсюда прямая рекомендация: «you should be cautious about using a table variable if you expect a larger number of rows (greater than 100)». Обход — подсказка `RECOMPILE` в запросе или временная таблица.
2. **Откат транзакции на неё не действует:** «Because `table` variables have limited scope and aren't part of the persistent database, transaction rollbacks don't affect them».
3. **Вне предложения `FROM` требуется алиас.**
4. **Это не структура в памяти.** «A table variable isn't a memory-only structure… Table variables are created in the `tempdb` database similar to temporary tables.»

Индексы внутри объявления (inline) — начиная с SQL Server 2014. Отложенная компиляция табличных переменных — с уровня совместимости 150.

---

## Точка с запятой

Формально в T-SQL точка с запятой не всегда обязательна, но есть места, где без неё синтаксическая ошибка:

- **Перед CTE.** «When a CTE is used in a statement that is part of a batch, the statement before it must be followed by a semicolon.» Отсюда народная идиома `;WITH` — точка с запятой ставится на всякий случай перед `WITH`, потому что предыдущий оператор мог её не иметь.
- Перед `THROW`.

Про `MERGE` требование известно, но дословной формулировки в открытых страницах найти не удалось, а сам `MERGE` — оператор записи и вне объёма этого скилла.

---

## CTE: ограничения, о которых спотыкаются

- **Не материализуется.** «Query results from common table expressions aren't materialized. Each outer reference to the named result set requires the defined query to be re-executed.» Два обращения к одному CTE — два выполнения его определения. Нужен один расчёт — временная таблица.
- CTE должен непосредственно предшествовать одному оператору `SELECT`, `INSERT`, `UPDATE`, `MERGE` или `DELETE`.
- **Forward reference запрещён:** CTE может ссылаться на себя и на ранее объявленные CTE того же `WITH`, но не на объявленные позже.
- **Несколько `WITH` подряд запрещены:** вложенный `WITH` внутри подзапроса CTE недопустим.
- Внутри определения CTE нельзя: `ORDER BY` (кроме случая с `TOP` или `OFFSET … FETCH`), `INTO`, предложение `OPTION` с подсказками, `FOR BROWSE`.
- **Рекурсия.** Предел по умолчанию — 100 уровней; `OPTION (MAXRECURSION n)`, где `n` от 0 до 32767, `0` — без предела. Один `MAXRECURSION` на оператор.
- В рекурсивной части нельзя: `SELECT DISTINCT`, `GROUP BY`, `HAVING`, скалярную агрегацию, `TOP`, внешние соединения (`INNER JOIN` можно), подзапросы, подсказки на рекурсивную ссылку; `PIVOT` — при уровне совместимости 110 и выше.
- Все столбцы рекурсивного CTE считаются nullable независимо от исходной nullability.
- Аналитические и агрегатные функции в рекурсивной части применяются к набору **текущего уровня рекурсии**, а не ко всему результату: `ROW_NUMBER` внутри рекурсивной части пронумерует не то, что ожидается.

---

## Коллации: основы

Коллация задаёт правила сравнения и сортировки символьных данных, а для не-Unicode — ещё и кодовую страницу.

**Четыре уровня, на которых она определяется:**

| Уровень | Чем задаётся | Где посмотреть |
|---|---|---|
| Экземпляр | при установке | `SERVERPROPERTY('Collation')` |
| База | `CREATE`/`ALTER DATABASE … COLLATE`; иначе наследуется от экземпляра | `sys.databases.collation_name` |
| Столбец | `COLLATE` в определении столбца; иначе наследуется от базы | `sys.columns.collation_name` |
| Выражение | `COLLATE` в самом выражении | — |

**Суффиксы имени:** `_CS` — регистрозависимая (`_CI` — нет), `_AS` — учитывает диакритику (`_AI` — нет), `_KS` — различает хирагану и катакану, `_WS` — различает полно- и полуширинные символы, `_VSS` — учитывает японские селекторы вариаций, `_BIN2` — сортировка по кодовым точкам, `_UTF8` — хранение в UTF-8, `_SC` — поддержка дополнительных символов.

**Границы `COLLATE`:**

- применим только к типам `char`, `varchar`, `text`, `nchar`, `nvarchar`, `ntext`;
- имя коллации обязано быть литералом: «`collation_name` can't be represented by a variable or expression»;
- Unicode-only Windows-коллации применимы только к `nchar`, `nvarchar`, `ntext` на уровне столбца и выражения — базу или экземпляр ими не определить.

**Разница SQL-коллаций (`SQL_*`) и Windows-коллаций** — не косметическая. Дословный пример: при `SQL_Latin1_General_CP1_CI_AS` не-Unicode строка `'a-c'` **меньше** `'ab'`, потому что дефис сортируется как отдельный символ перед `b`; те же строки в Unicode (`N'a-c'` и `N'ab'`) сравниваются наоборот — `N'a-c'` **больше**, потому что Unicode-правила используют словарную сортировку и дефис игнорируют. То есть одна и та же коллация даёт разный порядок для `varchar` и `nvarchar`.

**Идентификаторы переменных, меток `GOTO`, временных процедур и временных таблиц живут в коллации экземпляра**, а не базы: «The identifiers for variables, GOTO labels, temporary stored procedures, and temporary tables are in the default collation of the server instance».

Конфликты коллаций, `COLLATE DATABASE_DEFAULT` и правила приоритета — в [traps.md](traps.md).

---

## Куда дальше

- Работает ли конструкция на этой версии — [version-matrix.md](version-matrix.md).
- Почему результат выглядит неправильно — [traps.md](traps.md).
- Точно ли это чтение — [read-semantics.md](read-semantics.md).
