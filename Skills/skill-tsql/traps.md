# Ловушки

Отвечает на вопрос: **запрос отработал, но число, строка или дата выглядят неправильно.**

Каждая ловушка здесь — документированное поведение, а не баг. Если ответ сервера расходится с этим файлом, прав сервер: скилл датирован.

---

## Строковые литералы дат

Самая частая причина «дата съехала на месяц».

**Разбор строки в дату зависит от настроек сессии** — `SET LANGUAGE` и `SET DATEFORMAT`. Два дословных примера из документации:

*Язык.* Слово `listopad` — название месяца:

```sql
DECLARE @yourInputDate NVARCHAR(32) = '28 listopad 2018';

SET LANGUAGE Polish;
SELECT CONVERT(DATE, @yourInputDate);   -- 2018-11-28  (ноябрь)

SET LANGUAGE Croatian;
SELECT CONVERT(DATE, @yourInputDate);   -- 2018-10-28  (октябрь)
```

*Формат.* Одна и та же строка `'12-09-2018'`:

| `SET DATEFORMAT` | Результат |
|---|---|
| `dmy` | `2018-09-12` |
| `mdy` | `2018-12-09` |
| `ymd` | `2018-12-09`, и документация прямо говорит, что результат не гарантирован: третий элемент строки слишком велик для дня — «Microsoft doesn't guarantee the output value from such mismatches» |

**С какого момента это так:** «Starting with SQL Server 2005 and its compatibility level of 90, implicit date conversions became nondeterministic». На уровне 80 и ниже они были детерминированы.

**Какие стили `CONVERT` недетерминированы** (перечень со страницы `CAST and CONVERT`): все стили ниже 100, кроме 20 и 21; плюс 106, 107, 109, 113, 130.

**Практический минимум однозначных стилей:**

| Стиль | Формат |
|---|---|
| `112` | `yyyymmdd` |
| `120` / `121` | `yyyy-mm-dd hh:mi:ss[.mmm]` |
| `126` / `127` | ISO 8601 |
| `20` / `21` | ODBC-канонический |

**Двузначные годы — не писать.** Настройка «two digit year cutoff» по умолчанию `2050`: `25` читается как `2025`, `50` — как `1950`. Страница `CAST and CONVERT` формулирует это же через год отсечения 2049: «SQL Server interprets the two-digit year 49 as 2049 and the two-digit year 50 as 1950. Many client applications, including those based on Automation objects, use a cutoff year of 2030». Расхождение чисел 2050 и 2049 — разница формулировок, а не поведения: граница проходит между 49 и 50. Вывод один: «We recommend specifying four-digit years».

**`datetimeoffset` и стили.** «Beginning with SQL Server 2012, the only styles supported, when converting from date and time types to `datetimeoffset`, are 0 or 1. All other conversion styles return error 9809.»

---

## `N''`, `nvarchar` и длины

**Без префикса `N` строка приводится к кодовой странице базы**: «Without the `N` prefix, the string is converted to the default code page of the database that might not recognize certain characters». Символы, которых в кодовой странице нет, теряются молча.

**`n` в `nvarchar(n)` — не число символов, а число пар байтов.** Документация называет обратное распространённым заблуждением: «A common misconception is to think that with `nchar(n)` and `nvarchar(n)`, the *n* defines the number of characters… *n* never defines numbers of characters that can be stored». В диапазоне Unicode 0–65 535 один символ занимает одну пару, выше (65 536–1 114 111) — две. То есть в `nvarchar(10)` может не поместиться 10 символов.

Отсюда `max_length = 100` у столбца `nvarchar(50)` в `sys.columns` — это байты ([schema-discovery.md](schema-discovery.md)).

**Умолчания длины, которые отличаются:**

| Где | Длина по умолчанию |
|---|---|
| В объявлении столбца или переменной без `(n)` | 1 |
| В `CAST`/`CONVERT` без `(n)` | 30 |

`CAST(что-то AS nvarchar)` молча обрежет результат до 30 символов. Это одна из самых незаметных потерь данных в отчётах.

**`sysname`** — системный тип, функционально равный `nvarchar(128) NOT NULL`. Все имена объектов в каталогах имеют этот тип.

**Направление неявного преобразования при сравнении.** `nvarchar` выше `varchar` в приоритете типов, поэтому в сравнении `varchar`-столбца с `N'…'`-литералом приводится **столбец**. Документация показывает это на примере: для `CharCol CHAR(10) COLLATE French_CI_AS` и предиката `CharCol LIKE N'abc'` — «The Unicode data type of the simple expression `N'abc'` has a higher data type precedence. Therefore, the resulting expression has the Unicode data type».

**Оговорка о SARGability.** Из этого обычно делают вывод, что такое сравнение мешает использовать индекс по `varchar`-столбцу. Дословного подтверждения этому в открытых страницах документации найти не удалось (проверено 22.08.2026): документирована сама конверсия, а не её влияние на выбор плана. Считать это правилом нельзя; проверять надо планом — [read-semantics.md](read-semantics.md).

---

## `TOP` без `ORDER BY`

«Otherwise, `TOP` returns the first *n* number of rows in an undefined order» — неопределённый порядок, а не «первые попавшиеся, но стабильно». Один и тот же запрос может вернуть разные строки при том же наборе данных.

Родственная ловушка: **`STRING_SPLIT` порядок не гарантирует** — «The output rows might be in any order. The order isn't guaranteed to match the order of the substrings in the input string». Восстановить порядок можно только через `enable_ordinal` (2022+) и `ORDER BY ordinal`.

---

## `COUNT`

| Форма | Что считает |
|---|---|
| `COUNT(*)` | Все строки, включая строки со всеми `NULL` и дубликаты |
| `COUNT(столбец)` | Строки, где столбец не `NULL` |
| `COUNT(DISTINCT столбец)` | Уникальные значения без `NULL` |

**Переполнение.** `COUNT` возвращает `int`: «When `COUNT` returns a value that exceeds the maximum value of `int` (2³¹−1 or 2,147,483,647), the function fails due to an integer overflow» — сообщение `Msg 8115, Level 16, State 2; Arithmetic overflow error converting expression to data type int`.

Что происходит при разных настройках:

| `ARITHABORT` | `ANSI_WARNINGS` | Поведение при переполнении `COUNT` |
|---|---|---|
| оба `OFF` | | Возвращается `NULL` |
| хотя бы один `ON` | | Запрос прерывается ошибкой 8115 |

Для больших таблиц — `COUNT_BIG(*)`, возвращающий `bigint`.

**Ловушка обёртки.** Прямая цитата: «you can safely wrap `COUNT` call-sites in `ISNULL(<count-expr>, 0)` to coerce the expression's type to `int NOT NULL`… Wrapping `COUNT` in `ISNULL` means any overflow error is silently suppressed, which should be considered for correctness». То есть `ISNULL(COUNT(*), 0)` глушит ошибку переполнения, и вместо честного отказа получается неверное число.

---

## `@@ROWCOUNT`

Три категории поведения, и путать их нельзя:

| Категория | Операторы | Значение |
|---|---|---|
| Всегда `1` | Простое присваивание: `SET @v = …`, `RETURN`, `READTEXT`, `SELECT` без запроса (`SELECT GETDATE()`), а также `DECLARE CURSOR` и `FETCH` | `1` |
| Число строк | Присваивание в запросе (`SELECT @v = c1 FROM t1`), обычные запросы и DML | Сколько строк затронуто или прочитано |
| Сброс в `0` | `USE`, `SET <option>`, `DEALLOCATE CURSOR`, `CLOSE CURSOR`, `PRINT`, `RAISERROR`, `BEGIN TRANSACTION`, `COMMIT TRANSACTION` | `0` |
| Сохранение предыдущего | `EXECUTE`; нативно скомпилированные процедуры | не меняется |

**Практический вывод:** между интересующим оператором и чтением `@@ROWCOUNT` нельзя вставлять ничего — ни `PRINT`, ни `SET`, ни `BEGIN TRANSACTION`. Иначе прочитается ноль.

---

## Деление на ноль, `ANSI_WARNINGS` и `ARITHABORT`

| `ANSI_WARNINGS` | `ARITHABORT` | Что происходит при делении на ноль или переполнении |
|---|---|---|
| `ON` (умолчание) | любое | Запрос завершается ошибкой; пакет продолжается (если `XACT_ABORT` выключен). «When `ANSI_WARNINGS` is `ON` (the default), the setting of `ARITHABORT` has no functional effect» |
| `OFF` | `ON` | Пакет прерывается; в транзакции — откат |
| `OFF` | `OFF` | Результат операции — `NULL`, выдаётся предупреждение (если `ARITHIGNORE` не `ON`) |

**Главная ловушка здесь не в арифметике, а в планах.** Дословно, со страницы `SET ARITHABORT`:

> «The default `ARITHABORT` setting for SSMS is `ON`, while a client connection in an application defaults to `ARITHABORT OFF`. Even if there's no functional difference as long as `ANSI_WARNINGS` is `ON`, the `ARITHABORT` setting is still a cache key. Therefore, SSMS and an application both using their respective defaults, have different cache entries, and might get different query plans, making it difficult to troubleshoot poorly performing queries. That is, the same query might execute slower in the application than in SSMS.»

Это и есть классическое «в SSMS быстро, в приложении медленно». Первое, что надо проверить в такой жалобе, — совпадают ли настройки сессии; читаются они из `sys.dm_exec_sessions` ([server-profile.md](server-profile.md)).

---

## Конфликты коллаций

**Механизм.** У каждого символьного выражения есть «метка приведения»: `Explicit` (задана `COLLATE` в выражении), `Implicit` (ссылка на столбец — берётся коллация столбца), `Coercible-default` (литерал, переменная, параметр, вывод функции — берётся коллация текущей базы), `No-collation` (результат столкновения двух разных `Implicit`).

Правила приоритета:

- `Explicit` > `Implicit` > `Coercible-default`;
- `Explicit X` + `Explicit Y` (разные) → **ошибка**;
- `Implicit X` + `Implicit Y` (разные) → `No-collation`;
- `No-collation` + что угодно, кроме `Explicit`, → `No-collation`;
- `No-collation` + `Explicit X` → `Explicit X`.

Типовой случай в жизни: сравнение столбца пользовательской базы со столбцом временной таблицы, которая живёт в `tempdb` и наследует коллацию экземпляра.

**Решение — `COLLATE DATABASE_DEFAULT`** в выражении сравнения. При создании временной таблицы можно сразу указать `COLLATE database_default` у символьного столбца: «You can also use the `database_default` option in the `COLLATE` clause to specify that a column in a temporary table use the collation default of the current user database for the connection instead of `tempdb`».

**Границы `COLLATE`** — см. [dialect-differences.md](dialect-differences.md): только символьные типы, только литеральное имя коллации.

**Порядок операций:** «Collation precedence is determined after data type conversion. The operand from which the resulting collation is taken can be different from the operand that supplies the data type of the final result». То есть тип результата и коллация результата могут прийти от **разных** операндов.

**Номер ошибки конфликта коллаций документация не называет.** Сообщение вида «Cannot resolve the collation conflict…» узнаваемо, номер в скилле не приводится: догадка в справочнике — это выдуманный факт.

---

## Прочие ловушки

| Ловушка | Что именно |
|---|---|
| CTE не материализуется | Каждая внешняя ссылка перезапускает определение CTE. Два обращения — два выполнения, и под `READ COMMITTED` результаты могут отличаться |
| `COALESCE` с подзапросом | Подзапрос вычисляется дважды; «the code can return `NULL` under the `READ COMMITTED` isolation level in a multi-user environment» |
| `ROW_NUMBER` в рекурсивной части CTE | Применяется к набору текущего уровня рекурсии, а не ко всему результату |
| `STRING_SPLIT` и пустые подстроки | Два разделителя подряд дают пустую подстроку, и она возвращается наравне с остальными. Фильтровать `WHERE value <> ''`. Если вход `NULL` — функция возвращает пустую таблицу, а не строку с `NULL` |
| `STRING_AGG` и `NULL` | «Null values are ignored and the corresponding separator isn't added» — пропуски в списке не видны. Нужен маркер — `ISNULL(столбец, 'N/A')` |
| `STRING_AGG` и длина | Для входа `varchar(1..8000)` тип результата — `varchar(8000)`: длинная склейка обрежется. Приводите вход к `nvarchar(max)` |
| `APPROX_COUNT_DISTINCT` | «up to a 2% error rate within a 97% probability» — то есть в 3 % случаев ошибка может быть и больше. Плюс: со строковыми коллациями функция сравнивает бинарно, как коллация `_BIN`, а не `_BIN2` |
| `OPENJSON` и регистр | «The comparison used to match path steps with the properties of the JSON expression is case-sensitive and collation-unaware (that is, a BIN2 comparison)» — путь `$.Name` не найдёт свойство `name`, даже в регистронезависимой базе |
| `OPENJSON`, `lax` и `strict` | В режиме `lax` (по умолчанию) ненайденный путь даёт `NULL` или пустой результат; в `strict` — ошибку. «Пусто» в JSON-разборе не означает «в документе этого нет» |
| `AS JSON` в `OPENJSON` | Без `AS JSON` вложенный объект или массив вернётся как `NULL` (в `lax`) — а не как фрагмент JSON. С `AS JSON` тип столбца обязан быть `nvarchar(max)` |
| Переименованный модуль | `sp_rename` не меняет имя объекта внутри текста определения; `sys.sql_modules.definition` и `OBJECT_DEFINITION` продолжают возвращать старое имя |
| Хинт на представлении | Все блокировочные хинты распространяются на базовые таблицы представления — включая те, о которых вы не думали |
| `TOP` с `UNION` | `TOP` отрабатывает до `ORDER BY`, сортирующего результат объединения; правильный способ — подзапросы |
| `FOR XML` и спецсимволы | Служебные символы в выводе экранируются («entitized»), поэтому склейку строк через `FOR XML PATH('')` снимают через `TYPE` и `.value('.', 'nvarchar(max)')` |

---

## Чего в этом файле нет

**Усечения при вставке (ошибки 8152 и 2628).** Это ловушка стороны записи, а скилл покрывает только читающие сценарии. Упомянута здесь одной строкой, чтобы читатель не искал её в других файлах.

**Разбора типов ожиданий.** Почему запрос ждёт — тема администрирования; скилл доводит диагностику до `wait_type` и останавливается ([dmv-diagnostics.md](dmv-diagnostics.md)).

---

## Куда дальше

- Как устроены сами конструкции — [dialect-differences.md](dialect-differences.md).
- Настройки сессии, влияющие на разбор, — [server-profile.md](server-profile.md).
- Почему запрос медленный, а не неправильный, — [dmv-diagnostics.md](dmv-diagnostics.md).
