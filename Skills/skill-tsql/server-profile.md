# Профиль сервера и базы

Отвечает на вопрос: **с чем я имею дело и что здесь вообще работает.**

Это шаг 1 рабочего процесса. Без него любое версионно-зависимое утверждение — догадка, а любой диагностический запрос может упереться в право, которого нет.

---

## Профилирующий запрос

Выполнять целиком, одним запросом. Прав не требует: `SERVERPROPERTY` доступна всем («All users can query the server properties»), а свою текущую базу в `sys.databases` видно всегда.

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

Короткая форма, если нужны только две оси возможностей:

```sql
SELECT  SERVERPROPERTY('ProductMajorVersion') AS major_version,
        SERVERPROPERTY('EngineEdition')       AS engine_edition,
        DB_NAME()                             AS current_database,
        (SELECT compatibility_level FROM sys.databases WHERE database_id = DB_ID()) AS compat_level;
```

**Если нужны все базы, а не только текущая** — добавь запрос к `sys.databases` без фильтра. Но учти права: чтобы увидеть чужую строку, нужно быть владельцем базы либо иметь `ALTER ANY DATABASE`, серверное `VIEW ANY DATABASE` или `CREATE DATABASE` в `master`. По умолчанию роль public имеет `VIEW ANY DATABASE`, поэтому обычно видно всё; но это право могли отобрать. Исключения `master` и `tempdb` видны всегда, как и база текущего подключения.

```sql
SELECT  name, database_id, compatibility_level, collation_name,
        state_desc, is_read_only, is_read_committed_snapshot_on,
        snapshot_isolation_state_desc
FROM    sys.databases
ORDER BY name;
```

---

## Две оси возможностей

Доступность конструкции определяется **двумя** независимыми величинами, и одной первой недостаточно.

| Ось | Что задаёт | Где смотреть |
|---|---|---|
| Версия движка | какой код вообще установлен | `SERVERPROPERTY('ProductMajorVersion')` |
| Уровень совместимости базы | какое поведение движок включает для этой базы | `sys.databases.compatibility_level` |

**Почему одной версии мало.** Документация формулирует общее правило так: «New T-SQL syntax isn't gated by database compatibility level, except when they can break existing applications by creating a conflict with user T-SQL code» — то есть большинство новых конструкций уровнем не гейтится, но исключения есть и они задокументированы. Практически значимые исключения для читающих сценариев:

- `STRING_SPLIT` — «is available under compatibility level 130 or above. If your database compatibility level is lower than 130, SQL Server won't be able to find and execute `STRING_SPLIT` function». То есть на сервере 2022 с базой уровня 120 функция не найдётся.
- `OPENJSON` — «available only under compatibility level 130 or higher»; остальные функции JSON при этом доступны на любом уровне.
- `STRING_AGG` доступен на любом уровне, а его `WITHIN GROUP (ORDER BY ...)` — только с уровня 110.
- Стиль по умолчанию для `CAST`/`CONVERT` над `time` и `datetime2`: с уровня 110 он всегда 121; ниже — 121, кроме вычисляемых столбцов, где 0.
- Неявное преобразование `datetime` → `datetime2` с уровня 130 учитывает доли миллисекунд и даёт другие значения; вернуть прежнее поведение можно только уровнем 120 или ниже.
- `PIVOT` в рекурсивном CTE: до уровня 110 разрешён, но при нескольких строках на группу возвращает неверный результат; с 110 запрещён и даёт ошибку.

Полная матрица — в [version-matrix.md](version-matrix.md).

**Обход для табличных функций — только в Azure.** Требование по уровню совместимости для `STRING_SPLIT`, `OPENJSON`, `GENERATE_SERIES`, `REGEXP_MATCHES` и `REGEXP_SPLIT_TO_TABLE` снимается конфигурацией базы `ALLOW_BUILTIN_TVF_IN_ALL_COMPAT_LEVELS`. Две оговорки, без которых это знание вредно: строка «Applies to» у конфигурации — **Azure SQL Database и SQL database в Microsoft Fabric**, на «коробочном» SQL Server её нет; и сама конфигурация помечена «in preview» (проверено 22.08.2026). Это `ALTER DATABASE SCOPED CONFIGURATION`, то есть изменение состояния базы — агент его не выполняет и не предлагает выполнить. Знать о нём стоит ради обратного вывода: если в Azure табличная функция работает на низком уровне совместимости, объяснение может быть в этом.

**Уровень совместимости агент не меняет.** Это запись и администрирование. Скилл только распознаёт уровень и объясняет последствия.

---

## Какие уровни совместимости существуют

Таблица «версия движка → уровень по умолчанию → поддерживаемые уровни» из документации `ALTER DATABASE ... SET COMPATIBILITY_LEVEL` (include `compatibility-levels`, обновлён 15.09.2025):

| Продукт | Версия движка | Уровень по умолчанию | Поддерживаемые уровни |
|---|---:|---:|---|
| SQL Server 2025 | 17 | 170 | 170, 160, 150, 140, 130, 120, 110, 100 |
| SQL Server 2022 | 16 | 160 | 160, 150, 140, 130, 120, 110, 100 |
| SQL Server 2019 | 15 | 150 | 150, 140, 130, 120, 110, 100 |
| SQL Server 2017 | 14 | 140 | 140, 130, 120, 110, 100 |
| SQL Server 2016 | 13 | 130 | 130, 120, 110, 100 |
| SQL Server 2014 | 12 | 120 | 120, 110, 100 |
| SQL Server 2012 | 11 | 110 | 110, 100, 90 |
| SQL Server 2008 / 2008 R2 | 10 / 10.5 | 100 | 100, 90, 80 |
| Azure SQL Database | 17 | 170 | 170, 160, 150, 140, 130, 120, 110, 100 |

`sys.databases.compatibility_level` — тип `tinyint`, допустимые значения по документации: 80, 90, 100, 110, 120, 130, 140, 150, 160, 170.

Дополнение по поведению при переносе базы: база, присоединённая или восстановленная с более старой версии, **сохраняет свой уровень**, если он не ниже минимального для этого экземпляра; если ниже — молча поднимается до минимально допустимого. Отсюда типовая картина «новый сервер, старый уровень».

---

## `SERVERPROPERTY`: практический минимум

Права: «All users can query the server properties». Свойство, недопустимое или неподдерживаемое на этой версии, возвращает `NULL` — это не ошибка.

| Свойство | Что даёт | Примечание |
|---|---|---|
| `ProductVersion` | `major.minor.build.revision` | Основной идентификатор сборки |
| `ProductMajorVersion` | мажорная версия числом | Первая ось возможностей |
| `ProductMinorVersion` | минорная версия | |
| `ProductLevel` | `RTM`, `SP`*n*, `CTP`*n* | С 2017 сервис-паков больше не выпускают |
| `ProductUpdateLevel` | `CU`*n* или `NULL` | Номер CU в справочник не заносим — протухает ежемесячно; читаем с сервера |
| `Edition` | название редакции строкой | 64-разрядные сборки дописывают `(64-bit)` |
| `EngineEdition` | числовой код платформы | Ключ к вопросу «а это вообще SQL Server?» — таблица ниже |
| `Collation` | коллация экземпляра по умолчанию | Ею живут `tempdb`, имена переменных, меток и временных таблиц |
| `IsClustered` | 1 — экземпляр в отказоустойчивом кластере | |
| `MachineName` | имя машины Windows | Для кластера — имя виртуального сервера |
| `InstanceName` | имя именованного экземпляра | `NULL` для экземпляра по умолчанию |
| `PathSeparator` | `\` в Windows, `/` в Linux | **Applies to:** SQL Server 2017 (14.x) и новее |
| `IsPolyBaseInstalled` | установлен ли PolyBase | **Applies to:** SQL Server 2016 (13.x) и новее |
| `IsXTPSupported` | поддержка In-Memory OLTP | **Applies to:** SQL Server 2014 (12.x) и новее, Azure SQL Database |

Свойство `EditionID` (13 числовых кодов) в скилл не берём: для нашей задачи оно ничего не добавляет к `Edition` и `EngineEdition`.

---

## `EngineEdition`: понять, где мы оказались

Значения по странице `SERVERPROPERTY` (обновлена 08.01.2026). Значений 7 и 10 в списке нет — так в документации.

| Код | Что это | Что это значит для скилла |
|---:|---|---|
| 1 | Personal / Desktop Engine | Снято начиная с SQL Server 2005 |
| 2 | Standard (в том числе Standard Developer, Web, Business Intelligence) | Обычный SQL Server |
| 3 | Enterprise (в том числе Enterprise Developer, Developer, Evaluation) | Обычный SQL Server |
| 4 | Express (все варианты) | Обычный SQL Server |
| 5 | Azure SQL Database | **Не целевая платформа.** См. расхождения ниже |
| 6 | Azure Synapse Analytics | Не целевая платформа |
| 8 | Azure SQL Managed Instance | Не целевая платформа |
| 9 | Azure SQL Edge | Не целевая платформа |
| 11 | Azure Synapse serverless SQL pool или Microsoft Fabric | Не целевая платформа |
| 12 | SQL database в Microsoft Fabric | Не целевая платформа |

**Что перестаёт быть верным вне кодов 2–4** (перечень не полон, это то, что подтверждено документацией и реально меняет решение):

- **`READ_COMMITTED_SNAPSHOT` включён по умолчанию** в Azure SQL Database и в SQL database в Fabric, тогда как на локальном SQL Server умолчание — `OFF`. Это меняет саму семантику уровня `READ COMMITTED`: версионирование строк вместо разделяемых блокировок.
- **`VIEW SERVER STATE` в Azure SQL Database выдать нельзя**, поэтому `sys.dm_exec_requests` там «always limited to the current connection».
- **Номера версий несравнимы.** Прямая формулировка документации: движки SQL Server и Azure SQL Database «aren't comparable with each other, and represent internal build numbers for these separate products»; в Azure SQL Database всегда самый свежий код, и «version 12 of Azure SQL Database is newer than version 16 of SQL Server». Сравнивать `ProductMajorVersion` между ними бессмысленно.
- **Уровень совместимости по умолчанию 170** в Azure SQL Database и в SQL database в Fabric.

Если `EngineEdition` не 2, 3 или 4 — скажи об этом пользователю сразу, до первого версионного утверждения.

---

## `@@VERSION`

Возвращает одну строку `nvarchar`. Для SQL Server внутри неё: версия, архитектура процессора, дата сборки, копирайт, редакция, версия операционной системы.

Две оговорки прямо из документации:

- **Версия ОС берётся у хоста.** «The operating system version information comes from the host, virtual machine, or container where SQL Server is installed. It doesn't necessarily reflect the retail version of the underlying operating system».
- **Разбирать строку не нужно.** «Use the `SERVERPROPERTY` function to get the individual property values». Парсинг `@@VERSION` регулярным выражением — лишний источник ошибок; всё, что оттуда нужно, есть в `SERVERPROPERTY`.

Пример вывода (из документации, SQL Server 2025 на Ubuntu):

```
Microsoft SQL Server 2025 (RTM) - 17.0.1000.7 (X64)
Oct 21 2025 12:05:57
Copyright (C) 2025 Microsoft Corporation
Enterprise Developer Edition (64-bit) on Linux (Ubuntu 24.04.3 LTS) <X64>
```

---

## Соответствие мажорной версии и года выпуска

Стабильно, не протухает. Взято из таблицы уровней совместимости (колонка «Database Engine version»).

| Мажорная версия | Продукт |
|---:|---|
| 17.x | SQL Server 2025 |
| 16.x | SQL Server 2022 |
| 15.x | SQL Server 2019 |
| 14.x | SQL Server 2017 |
| 13.x | SQL Server 2016 |
| 12.x | SQL Server 2014 |
| 11.x | SQL Server 2012 |
| 10.5 / 10.x | SQL Server 2008 R2 / 2008 |

---

## Статус поддержки: что сказать пользователю

Скажи один раз, спокойно, без нотаций — и только если сервер действительно вне поддержки. Даты ниже взяты со страниц жизненного цикла продукта на Microsoft Learn и **перепроверены 22 августа 2026**; перед тем как их цитировать, открой страницу заново — это ровно тот класс фактов, который протухает сам.

| Версия | Mainstream закончился | Extended заканчивается | Состояние на 2026-08-22 |
|---|---|---|---|
| SQL Server 2025 | 07.01.2031 | 07.01.2036 | Mainstream |
| SQL Server 2022 | 12.01.2028 | 12.01.2033 | Mainstream |
| SQL Server 2019 | 01.03.2025 | 09.01.2030 | Extended |
| SQL Server 2017 | 12.10.2022 | 13.10.2027 | Extended |
| SQL Server 2016 | 14.07.2021 | 15.07.2026 | Extended закончился; идёт Extended Security Updates Year 1 (15.07.2026 — 13.07.2027), дальше объявлены ESU Year 2 и Year 3 до 17.07.2029 |
| SQL Server 2014 | 10.07.2019 | 10.07.2024 | Вне обычной поддержки; идёт ESU Year 3 (15.07.2026 — 13.07.2027) — последний объявленный год ESU |

Для SQL Server 2012 даты не привожу: страница жизненного цикла по прямому адресу отдала 404 и при проверке 21.08.2026, и при повторной 22.08.2026, а выдумывать даты нельзя.

Общее правило из документации: «Each version of SQL Server comes with a minimum of 10 years of support, which includes five years of mainstream support and five years of extended support». Mainstream — функциональные, производительные и защитные обновления; extended — только защитные.

Номера накопительных обновлений (CU) и даты их выхода в скилл не заносятся: они меняются ежемесячно. Актуальный CU читается с сервера — `SERVERPROPERTY('ProductUpdateLevel')`.

---

## Платформа хоста: `sys.dm_os_host_info`

**Applies to:** SQL Server 2017 (14.x) и новее. **На SQL Server 2016 этого представления нет.**

Столбцы: `host_platform` (`Windows` или `Linux`), `host_distribution`, `host_release`, `host_service_pack_level`, `host_sku`, `os_language_version`. На Linux `host_release` и `host_service_pack_level` возвращают пустую строку, `host_sku` — `NULL`.

Права по документации:

- SQL Server 2019 и раньше: `SELECT` на это представление по умолчанию выдан роли public; если его отозвали — нужно `VIEW SERVER STATE`.
- SQL Server 2022 и новее: требуется `VIEW SERVER PERFORMANCE STATE`.

Если представления нет (2016) или прав нет — платформу можно вывести из `SERVERPROPERTY('PathSeparator')` на 2017+ либо из хвоста строки `@@VERSION`, где указана ОС. На 2016 остаётся только `@@VERSION`.

---

## Настройки сессии, влияющие на разбор запроса

Это часть профиля, а не мелочь: драйверы и клиенты выставляют разные умолчания, и от них зависит, как разберётся строковый литерал даты и что произойдёт при делении на ноль. Один и тот же запрос из SSMS и из приложения может повести себя по-разному именно здесь.

Что смотреть:

| Настройка | На что влияет | Разбор |
|---|---|---|
| `LANGUAGE` | как разбираются названия месяцев в строках дат | [traps.md](traps.md) |
| `DATEFORMAT` | как разбирается `'12-09-2018'` — dmy, mdy или ymd | [traps.md](traps.md) |
| `DATEFIRST` | какой день считается первым днём недели | — |
| `ANSI_WARNINGS` | деление на ноль и переполнение: ошибка или `NULL` | [traps.md](traps.md) |
| `ARITHABORT` | при `ANSI_WARNINGS ON` функционально не влияет, **но является ключом кэша планов** | [traps.md](traps.md) |
| `CONCAT_NULL_YIELDS_NULL` | `'abc' + NULL` — это `NULL` или `'abc'` | Начиная с SQL Server 2017 всегда `ON`; `OFF` объявлен устаревшим |
| `QUOTED_IDENTIFIER` | считаются ли двойные кавычки идентификатором или строковым литералом | [dialect-differences.md](dialect-differences.md) |
| `LOCK_TIMEOUT` | сколько ждать блокировку; `-1` (умолчание) — вечно | [read-semantics.md](read-semantics.md) |

Как прочитать текущие значения — **своей** сессии, без каких-либо серверных прав («Everyone can see their own session information»):

```sql
SELECT  session_id, login_time, host_name, program_name, login_name,
        language, date_format, date_first,
        quoted_identifier, arithabort, ansi_warnings, ansi_nulls, ansi_padding,
        concat_null_yields_null, lock_timeout, deadlock_priority, text_size,
        transaction_isolation_level
FROM    sys.dm_exec_sessions
WHERE   session_id = @@SPID;
```

Альтернатива, если `sys.dm_exec_sessions` закрыт: `@@OPTIONS` — битовая маска настроек, «converted to a base 10 (decimal) integer». Документация даёт пример декодирования одного бита; для `ARITHABORT` он такой:

```sql
DECLARE @ARITHABORT VARCHAR(3) = 'OFF';
IF ( (64 & @@OPTIONS) = 64 ) SET @ARITHABORT = 'ON';
SELECT @ARITHABORT AS ARITHABORT;
```

Расшифровка остальных битов живёт на странице «Configure the user options Server Configuration Option» и в скилл не переносится: это таблица, которую надо смотреть целиком, и запросом её не заменить.

Значение `transaction_isolation_level` — число; расшифровка и расхождение в написании между двумя страницами документации разобраны в [read-semantics.md](read-semantics.md).

---

## Куда дальше

- Что из конструкций доступно на выясненной версии — [version-matrix.md](version-matrix.md).
- Что доступно при выясненных правах — [permissions-visibility.md](permissions-visibility.md).
- Готовый запрос профиля и проверки прав одним блоком — [recipes.md](recipes.md).
