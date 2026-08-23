# Строка подключения: как дойти до сервера БД

Задача файла — собрать рабочую строку с первого раза и понять текст отказа, если не собралась.

**Драйвер, который нас касается, — `Microsoft.Data.SqlClient`.** Сервер написан на C#/.NET и тянет пакет `Microsoft.Data.SqlClient` версии 6.1.4 [код 0.1.0: `Core.Infrastructure.McpServer.csproj`]. Его поведение идёт первым и подробно. Остальные драйверы собраны в конце файла как справка на случай смены сервера и помечены как таковая: к текущему пути они отношения не имеют.

Строка целиком передаётся серверу одной переменной окружения `MSSQL_CONNECTIONSTRING`. Как эта переменная доезжает до процесса, где живёт пароль и почему он не пишется в конфигурацию открытым текстом — в [setup.md](setup.md). Здесь — только то, что находится внутри самой строки.

---

## Минимальная рабочая строка

```
Server=<хост>,<порт>;Database=<база>;User Id=<логин>;Password=<пароль>;Encrypt=True;TrustServerCertificate=False;
```

Присутствие или отсутствие `Database=` определяет режим работы сервера — Database Mode против Server Mode, разбор в [setup.md](setup.md). Это единственный переключатель режима; отдельного флага нет.

Синонимы, которые встречаются в чужих примерах и означают то же самое: `Server` = `Data Source` = `Addr` = `Address`; `Database` = `Initial Catalog`; `User Id` = `UID`; `Password` = `PWD`. Сервер при определении режима смотрит `InitialCatalog` через разборщик строки, а если тот пуст — ищет подстроки `Database=` и `Initial Catalog=` напрямую [код 0.1.0: `Program.IsServerMode`].

---

## Encrypt и TrustServerCertificate

Это место, где ошибаются чаще всего, и место, где ошибка тихая: соединение либо не устанавливается вовсе, либо устанавливается без реальной проверки того, с кем вы разговариваете.

### Умолчания для нашего драйвера

| Параметр | Умолчание | С какой версии |
|---|---|---|
| `Encrypt` | `True` | «Version 4.0 of Microsoft.Data.SqlClient introduces breaking changes in the encryption settings. `Encrypt` now defaults to `True`» [док MS] |
| `Encrypt=Strict` | доступен | с версии 5.0, работает поверх TDS 8.0 [док MS] |
| `TrustServerCertificate` | `False` | всегда |

Наш сервер собран с версией 6.1.4, поэтому **`Encrypt=True` действует по умолчанию, даже если вы его не написали**. Это меняет смысл минимальной строки: подключение к серверу с самоподписанным сертификатом откажет, пока вы явно не разберётесь с сертификатом.

Отдельно про поведение `TrustServerCertificate` по версиям [док MS]:

- до версии 2.0 параметр игнорировался при `Encrypt=False`;
- начиная с 2.0 сертификат проверяется по этому параметру и при `Encrypt=False`, если шифрование форсирует сервер;
- начиная с 5.0 параметр игнорируется при `Encrypt=Strict` — в строгом режиме сертификат проверяется всегда.

### Таблица исходов (версия 4.0 и новее)

Дословно из документации Microsoft:

| `Encrypt` | `Trust Server Certificate` | `Force encryption` на сервере | Результат |
|---|---|---|---|
| False | False (умолчание) | No | Encryption only occurs for LOGIN packets. Certificate isn't validated. |
| False | False (умолчание) | Yes | Encryption of all network traffic occurs only if there's a verifiable server certificate, otherwise the connection attempt fails. |
| False | True | Yes | Encryption of all network traffic occurs, and the certificate isn't validated. |
| True **(новое умолчание)** | False (умолчание) | N/A | Encryption of all network traffic occurs only if there's a verifiable server certificate, otherwise the connection attempt fails. |
| True **(новое умолчание)** | True | N/A | Encryption of all network traffic occurs, but the certificate isn't validated. |
| Strict (с версии 5.0) | N/A | N/A | Encryption of all network traffic occurs using TDS 8.0 only if there's a verifiable server certificate, otherwise the connection attempt fails. |

Строка, ради которой таблица здесь: `Encrypt=True` + `TrustServerCertificate=False` — это «шифруй и проверяй, иначе не подключайся». На сервере с самоподписанным сертификатом эта комбинация даёт отказ подключения, и отказ правильный.

### Чем платит `TrustServerCertificate=True`

Цена названа документацией прямо: «By setting your client to trust the certificate on the server, you might become vulnerable to man-in-the-middle attacks» [док MS]. И ещё точнее про то, что именно происходит: «In this case, encryption uses a self-signed server certificate without validation by the client. This configuration encrypts the connection but doesn't prevent devices in between the client and server from intercepting the connection and proxying the encryption» [док MS].

То есть трафик шифруется, но вы не знаете, с кем. Это осмысленный выбор для базы в доверенной сети и плохой — для чего угодно за её пределами.

Правильный порядок действий, когда подключение падает по сертификату:

1. Выяснить, **почему** сертификат не проверяется: он самоподписанный, просрочен, выдан внутренним центром сертификации, или имя в сертификате не совпадает с именем, по которому вы подключаетесь.
2. Если дело в имени — это чинится без снятия проверки: `HostNameInCertificate` (с версии 5.0) задаёт ожидаемое CN/SAN, отличное от имени хоста [док MS]. Типичный случай — подключение через DNS-алиас.
3. Если сертификат внутренний, но настоящий — поставить корневой сертификат вашего центра в доверенные на машине, где работает сервер MCP, либо задать `ServerCertificate` с путём к файлу (с версии 5.1; форматы PEM, DER, CER) [док MS].
4. `TrustServerCertificate=True` — последний вариант, применяемый осознанно, когда известно, почему проверка невозможна.

### Предупреждение о примерах из README сервера

**В README выбранного сервера `TrustServerCertificate=True` стоит во всех без исключения примерах строк подключения, без единой оговорки** — и в разделе установки, и в разделе Docker, и в разделе конфигурации [README]. Это факт первоисточника, и он не является рекомендацией.

Скопировать пример целиком — значит молча отключить проверку сертификата на всех своих подключениях. Параметр включается осознанно и только тогда, когда вы знаете, почему сертификат не проверяется.

---

## Порты и именованные экземпляры

- **Порт по умолчанию — TCP 1433**, он назначается экземпляру по умолчанию при установке [док MS].
- **Именованные экземпляры используют динамические порты**: «When enabled, named instances and SQL Server Express are configured to use dynamic ports by default. That is, an available port is assigned when SQL Server starts» [док MS]. Порт может смениться при перезапуске службы.
- Чтобы клиент нашёл именованный экземпляр по имени, нужна служба **SQL Server Browser**, которая слушает **UDP 1434**: «Upon startup, the SQL Server Browser starts and claims User Datagram Protocol (UDP) port `1434`» [док MS]. Клиент шлёт туда UDP-запрос и получает в ответ порт нужного экземпляра.
- Без Browser не работают, дословно: «Any component that tries to connect to a named instance without fully specifying all the parameters (such as the TCP/IP port or named pipe)» и «Connecting to a named instance without providing the port number or pipe» [док MS].
- Обходной путь один и надёжный — **указать порт явно**. Документация приводит форму `tcp:server,5000` [док MS]. В строке подключения это выглядит как `Server=tcp:myhost,5000` или `Server=myhost,5000`.
- Если между вами и базой файрвол: «open UDP port `1434` and the TCP/IP port used by SQL Server (for example, `1433`)» [док MS]. Когда порт указан явно, UDP 1434 не нужен.

Про Browser стоит помнить одно ограничение платформы: страница документации помечена «Applies to: SQL Server on Windows». Для баз на Linux и в контейнерах путь один — явный порт.

Форма записи в строке подключения:

```
Server=myhost                    # экземпляр по умолчанию, порт 1433
Server=myhost,1433               # порт явно
Server=tcp:myhost,5000           # протокол и порт явно
Server=myhost\SQLEXPRESS         # именованный экземпляр, нужен Browser и UDP 1434
```

---

## Таймаут соединения

В строке подключения таймаут установления соединения задаётся ключом `Connect Timeout`. Документация драйвера: «This property corresponds to the "Connect Timeout", "connection timeout", and "timeout" keys within the connection string», значение по умолчанию — «15 seconds if no value has been supplied» [док MS]. Допустимые значения — от 0 до 2147483647; для Azure SQL Database рекомендовано 30 секунд.

**Это единственное место, где таймаут соединения реально задаётся.** У сервера есть параметр `ConnectionTimeoutSeconds` со значением 15, но в коде версии 0.1.0 он к соединению не применяется — только выводится в отчёте `get_command_timeout` [код 0.1.0]. Умолчания совпадают, поэтому расхождение незаметно, пока кто-нибудь не попробует увеличить таймаут через параметр сервера и не удивится, что ничего не изменилось. Разбор — в [setup.md](setup.md).

Таймаут **запроса** — другое дело: он задаётся параметром сервера `DefaultCommandTimeoutSeconds` (30 с) и действительно применяется к команде. Вся раскладка потолков — в [limits.md](limits.md).

---

## Аутентификация

| Способ | Как выглядит | Применимость к нашему пути |
|---|---|---|
| SQL-аутентификация | `User Id=<логин>;Password=<пароль>` | Рабочий вариант. Пароль — только через окружение, см. [setup.md](setup.md) |
| Windows-аутентификация | `Integrated Security=true` или `Integrated Security=SSPI` | На Windows работает штатно |
| Microsoft Entra ID | `Authentication=ActiveDirectory*` | Возможна, отдельная настройка; в этом скилле не разбирается |

О Windows-аутентификации вне Windows нужно сказать точно, потому что здесь легко ошибиться в обе стороны:

- **В Docker она не поддерживается** — прямая цитата README сервера: «Integrated Security (Windows Authentication) is not supported when running in Docker containers. Use SQL Server authentication instead» [README].
- **На macOS и Linux нет SSPI**, поэтому «интегрированная» аутентификация там работает не так, как на Windows: нужен полученный заранее билет Kerberos, связывающий текущего пользователя с доменной учётной записью. Документация Microsoft описывает такой путь для ODBC-драйвера (MIT Kerberos KDC, GSSAPI); для `Microsoft.Data.SqlClient` в трекере dotnet/SqlClient есть открытые сообщения о том, что при рабочей конфигурации ODBC тот же билет у SqlClient даёт ошибки GSSAPI/SPNEGO. Вживую мы это не проверяли.

Практический вывод для macOS: берите SQL-аутентификацию, а Windows-аутентификацию рассматривайте только если доменная инфраструктура уже настроена и вы готовы отлаживать Kerberos отдельно.

Ещё одна тонкость из документации: «Windows authentication takes precedence over SQL Server logins. If you specify both Integrated Security=true as well as a user name and password, the user name and password will be ignored and Windows authentication will be used» [док MS]. Оставшийся в строке `Integrated Security=true` молча обесценит логин и пароль.

И про `Persist Security Info`: умолчание `false`, и его лучше не трогать — «Setting it to `true` or `yes` allows security-sensitive information, including the user ID and password, to be obtained from the connection after the connection has been opened» [док MS].

---

## Чем это не является: `ApplicationIntent=ReadOnly`

Параметр регулярно принимают за способ запретить запись. Он им не является.

`ApplicationIntent=ReadOnly` — свойство подключения из механики групп доступности Always On. Оно сообщает о намерении, а на что это влияет, зависит от конфигурации реплик [док MS]:

| Роль реплики | Что настроено на реплике | Намерение подключения | Результат |
|---|---|---|---|
| Secondary | All | любое | Success |
| Secondary | None (умолчание для вторичной) | любое | Failure |
| Secondary | Read-intent only | read-intent | Success |
| Secondary | Read-intent only | read-write или не задано | Failure |
| Primary | All (умолчание для первичной) | любое | Success |
| Primary | Read-write | read-intent | Failure |
| Primary | Read-write | read-write или не задано | Success |

Читается таблица так: на первичной реплике с настройкой по умолчанию подключение с `ApplicationIntent=ReadOnly` **успешно устанавливается и спокойно пишет**. Ничего не запрещено.

Чтобы соединение вообще попало на читающую вторичную реплику, нужны: группа доступности, слушатель и настроенная read-only маршрутизация — «you can configure an availability group to support read-only routing, which enables its availability group listener to redirect the connection requests of read-intent applications to a readable secondary replica» [док MS]. Без этого набора параметр не делает ничего, кроме объявления намерения.

Механизмы, которые действительно ограничивают запись, — в [read-only-layers.md](read-only-layers.md).

---

## Справка: другие драйверы (на случай смены сервера)

К текущему пути это не относится: выбранный сервер работает через `Microsoft.Data.SqlClient`. Таблица нужна, если сервер сменится на Node- или Python-based, — тогда умолчания шифрования и таймаутов будут другими.

| Драйвер | Ключ шифрования | Умолчание | Проверка сертификата | Таймаут соединения | Таймаут запроса |
|---|---|---|---|---|---|
| `Microsoft.Data.SqlClient` (наш) | `Encrypt` | `True` с версии 4.0; `Strict` доступен с 5.0 | `TrustServerCertificate`, умолчание `False` | `Connect Timeout`, 15 с | задаётся на команде; у нашего сервера — `DefaultCommandTimeoutSeconds`, 30 с |
| ODBC Driver for SQL Server | `Encrypt` | «The default value is `yes` in version 18.0+ and `no` in previous versions» [док MS]; значения `yes`/`mandatory`, `no`/`optional`, `strict` — все с 18.0 | `TrustServerCertificate`; при `Encrypt=Strict` игнорируется | `SQL_ATTR_LOGIN_TIMEOUT` | `SQL_ATTR_QUERY_TIMEOUT` |
| tedious (Node) | `encrypt` | `true`; `strict` включает TDS 8.0 [док tedious] | `trustServerCertificate`, умолчание `false` | `connectTimeout` | `requestTimeout` |
| pyodbc | наследует у ODBC-драйвера | см. строку ODBC | см. строку ODBC | задаётся драйвером | `Connection.timeout`, **умолчание `0` — «Use zero, the default, to disable»** [док pyodbc] |
| pymssql | `encryption` (не `encrypt`) | «`'request'` for tds version > 7.1, otherwise `'off'`» [док pymssql] | отдельного ключа доверия нет | `login_timeout`, 60 с | `timeout`, **«query timeout in seconds, default `0` (no timeout)»** [док pymssql] |

Две вещи из таблицы, которые стоят внимания при смене сервера:

- У **pyodbc и pymssql таймаут запроса по умолчанию отключён**. Долгий запрос там будет висеть, пока его не оборвёт что-нибудь другое — например, потолок со стороны Claude Code, см. [limits.md](limits.md).
- Документация tedious называет умолчания `encrypt: true` и `trustServerCertificate: false`, но не указывает, в какой версии они такими стали. Номера версий сюда не переносятся: непроверенное число выглядит как факт и живёт дольше, чем повод его написать.

---

## Куда идти, если не подключается

Дословные тексты отказов, разведение случаев `[auth]` / `[connection]` / `[certificate]` и порядок диагностики — в [failures.md](failures.md). Первая проверка там всегда одна: достижим ли порт вообще, до всякого MCP.
