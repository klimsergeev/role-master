# Ошибки: ступени проверок и дословные тексты

## Назначение

Порядок проверок, через которые проходит запрос к Wordstat, дословные тексты отказов на каждой ступени и правила диагностики по HTTP-коду.

> **Весь порядок проверок и все дословные тексты ниже получены собственными неаутентифицированными вызовами; последний прогон — 25.08.2026.** Документация порядок проверок не описывает и ни одного кода ошибки для Wordstat не приводит: справочник API документирует у каждого метода единственный вариант ответа — «HTTP Code: 200 — OK». То немногое, что взято из документации, отмечено в тексте отдельно.

## Четыре ступени и порядок их срабатывания

Проверки идут строго по очереди, и на первой же неудаче остальные не выполняются:

1. **Транскодирование JSON → protobuf** — разбор тела, типы значений, члены перечислений.
2. **Семантические проверки дат** (только `GetDynamics`) — границы периода и глубина истории.
3. **Валидация полей** — обязательность, длины, диапазоны, размеры массивов.
4. **Аутентификация** — ключ или IAM-токен.

Порядок второй и третьей ступеней контринтуитивен и установлен экспериментом: запрос с пустым `phrase` и с `fromDate` не в понедельник отвечает `The from field value should be Monday`, а не `phrase: Field is required`. То есть **даты проверяются раньше обязательных полей**.

Практическое следствие, ради которого этот раздел и существует: **всё, кроме ключа, отлаживается бесплатно и без ключа**. Тело можно довести до состояния «ответ 401» ещё до того, как заведён платёжный аккаунт.

| HTTP | Ступень | Формат тела |
|---|---|---|
| 400, `content-type: text/plain` | 1: транскодирование | простой текст, без `code`/`message`/`details` |
| 400, JSON `code: 3` | 2 или 3: даты или валидация полей | JSON Yandex Cloud |
| 401, JSON `code: 16` | 4: аутентификация | JSON Yandex Cloud |
| 404, тело пустое | пути не существует либо использован не тот HTTP-метод | пусто, `x-envoy-response-flags: NR` |

Формат JSON-ошибки платформы:

```json
{
 "code": 16,
 "message": "IAM token or API key has to be passed in request",
 "details": [
  { "@type": "type.googleapis.com/google.rpc.RequestInfo",
    "requestId": "f2d2f1cf-22b7-4cb6-a43a-81ea5c1335ef" }
 ]
}
```

`code` — стандартный gRPC-код: `3` = `INVALID_ARGUMENT`, `16` = `UNAUTHENTICATED`.

## Ступень 1: транскодирование

Ответ не JSON: `content-type: text/plain`, тело — одна строка.

| Что нарушено | Сообщение дословно |
|---|---|
| Неизвестный член перечисления `devices` | `devices[0]: invalid value "DEVICE_WATCH" for type type.googleapis.com/yandex.cloud.searchapi.v2.Device` |
| Неизвестный член `period` (в том числе строчное `"daily"`) | `period: invalid value "daily" for type type.googleapis.com/yandex.cloud.searchapi.v2.GetDynamicsRequest.Period` |
| Неизвестный член `region` | `region: invalid value "REGION_PLANET" for type type.googleapis.com/yandex.cloud.searchapi.v2.GetRegionsDistributionRequest.Region` |
| `numPhrases` нечисловой строкой | `num_phrases: invalid value "abc" for type TYPE_INT64` |
| Элемент `regions` числом, а не строкой | `regions[0]: invalid value 213 for type TYPE_STRING` |
| Дата не в RFC3339 (например, `2026-08-07`) | `to_date: invalid value Field 'toDate', Invalid time format: 2026-08-07 for type type.googleapis.com/google.protobuf.Timestamp` |
| Синтаксически битый JSON | `Unexpected end of string. Expected a value.^` |

**Неизвестные поля JSON, наоборот, молча игнорируются.** `{"phrase":"тест","numPhrases":10,"nosuchfield":1}` проходит транскодирование и валидацию. Так же ведёт себя `GetRegionsDistribution`, которому передали несуществующее у него поле `regions`.

Следствие для отладки: опечатка в имени поля не даст ошибки — она даст тихо неправильный результат. Имена полей сверять по [methods.md](methods.md), а не проверять «прошло ли».

## Ступень 2: семантические проверки дат (`GetDynamics`)

JSON, `code: 3`, сообщение вида `rpc error: code = InvalidArgument desc = ` плюс одиночная фраза — **без префикса `Validation error:`**.

| Что нарушено | Сообщение дословно |
|---|---|
| `fromDate` раньше 01.01.2018 (любая детализация) | `The from field value should be after 2018-01-01` |
| `PERIOD_DAILY`, `fromDate` старше 60 суток | `The from field value is older than 60 days` |
| `PERIOD_WEEKLY`, `fromDate` не понедельник | `The from field value should be Monday` |
| `PERIOD_WEEKLY`, `toDate` не воскресенье | `The to field value should be Sunday` |
| `PERIOD_MONTHLY`, `fromDate` не первое число | `The from field value should be the first day of the month` |
| `PERIOD_MONTHLY`, `toDate` не последний день месяца | `The to field value should be the last day of the month` |
| `toDate` не больше `fromDate` (в том числе равен ему) | `The to field value should be more than the from field value` |

Порядок внутри ступени, установленный экспериментом: проверка «после 2018-01-01» срабатывает первой; затем шестидесятидневная; затем день недели и число месяца; последней — сравнение `toDate` с `fromDate`. Сообщается всегда одно нарушение, самое раннее по этому порядку.

Три уточнения, каждое проверено:

- Високосный год обрабатывается верно: `2024-02-29` как последний день февраля принимается, `2024-02-28` отвергается.
- `toDate` в будущем принимается — верхней границы у периода нет.
- Дни недели и числа месяца считаются по UTC: `2026-08-03T00:00:00+03:00` отвергается как не понедельник, потому что по UTC это воскресенье 2 августа.

При `PERIOD_DAILY` произвольные даты внутри шестидесятидневного окна проходят.

## Ступень 3: валидация полей

Формат сообщения: `rpc error: code = InvalidArgument desc = Validation error:` плюс построчный перечень нарушений через `\n`. **Имена полей всегда в snake_case**, даже если запрос отправлен по REST в camelCase. Нарушения нескольких полей приходят в одном ответе.

| Что нарушено | Сообщение дословно |
|---|---|
| `phrase` отсутствует или пуст | `phrase: Field is required` |
| `phrase` длиннее 400 символов | `phrase: Length must be less than or equal to 400` |
| `numPhrases` вне 1…2000, в том числе поле не передано | `num_phrases: Value must be in the range of 1 to 2000` |
| `regions` больше 100 элементов | `regions: Number of elements must be less than or equal to 100` |
| `devices` больше 3 элементов (`GetTop`, `GetDynamics`) | `devices: Number of elements must be less than or equal to 3` |
| `folderId` длиннее 50 символов | `folder_id: Length must be less than or equal to 50` |
| `GetDynamics` без `period` и `fromDate` | `period: Field is required\nfrom_date: Field is required` |

Что валидацию **не** останавливает: несуществующий идентификатор региона (`"999999"`), нечисловая строка в `regions` (`"абв"`), пустая строка в `folderId`, фраза из 41 слова. Все эти значения доходят до аутентификации.

## Ступень 4: аутентификация

| Что отправлено | HTTP | `message` |
|---|---|---|
| Заголовка авторизации нет | 401 | `IAM token or API key has to be passed in request` |
| Схема без дефиса, например `ApiKey <ключ>` | 401 | `IAM token or API key has to be passed in request` — заголовок не распознан |
| Ключ неверный | 401 | `Unknown api key '<маска>'` |
| Неверный IAM-токен через `Bearer` | 401 | тоже `Unknown api key '<маска>'` — текст говорит «api key» независимо от схемы |

**Маска раскрывает края ключа.** Секрет длиной до 8 символов включительно показывается как `'****'`; начиная с 9 символов — как `'AQVN****ghij (2B0C4C0A)'`: первые четыре символа, четыре звёздочки, последние четыре и контрольная сумма в скобках. Настоящий API-ключ AI Studio длиннее восьми символов, значит его края попадут в лог и в вывод ошибки. Тело ответа 401 нельзя пересылать и публиковать как есть. (Замерено на ключах длиной 7, 8, 9 и 24 символа, 25.08.2026.)

## Чего этот файл не покрывает

Ни один из четырёх методов не вызывался с настоящей авторизацией — всё, что здесь написано, описывает путь запроса до аутентификации включительно и ни строкой дальше. Не покрыто:

- поведение под валидным ключом;
- ответы при исчерпании квоты (10 rps и 100 в час);
- тарификация ошибок валидации;
- реакция на `numPhrases` больше фактического числа фраз.

## Страница «Коды ошибок» Search API к Wordstat не относится

Три довода, каждый проверяемый:

1. Страница описывает ошибку как XML-тег `<error code="…">` внутри ответа поиска. Методы Wordstat возвращают JSON или protobuf, XML-обёртки нет ни в одной схеме.
2. Поля, о которых там речь, — `query`, `groupings`, `folderid`, страницы результатов. В сигнатурах Wordstat таких полей нет: фраза передаётся в `phrase`, каталог — в `folderId`.
3. Код 42 адресован сервисным аккаунтам с ролью `search-api.executor`; Wordstat работает под `search-api.webSearch.user` ([auth-and-setup.md](auth-and-setup.md)). Страница описывает другую конфигурацию доступа.

Ни страница «Wordstat», ни четыре инструкции, ни восемь страниц справочника API на «Коды ошибок» не ссылаются.

## Диагностика: служебные заголовки

**Заголовки запроса** (из документации):

- `x-client-request-id` — уникальный идентификатор запроса, рекомендуется UUID. Сообщается технической поддержке, чтобы найти конкретный вызов.
- `x-data-logging-enabled` — разрешает сохранять переданные данные, см. [auth-and-setup.md](auth-and-setup.md).

**Заголовки ответа** (приходят и на вызовы Wordstat — проверено 25.08.2026):

- `x-request-id` — уникальный идентификатор ответа. Совпадает с `requestId` в теле ошибки.
- `x-server-trace-id` — идентификатор логов выполнения.
- `server: ycapi` — признак того, что ответ дал шлюз Yandex Cloud.

Логировать первые два на своей стороне: без них поддержка не найдёт вызов.

**Аудитные логи Wordstat не покрывают.** В Audit Trails для Search API отслеживаются только события уровня конфигурации (`CreateCustomer`, `DeleteCustomer`, `UpdateCustomer`); событий уровня данных нет, вызовы Wordstat в аудитных логах не отражаются.
