# Data API

## Назначение

Справочник GA4 Data API -- эндпоинты, формат запросов и ответов, фильтры, сводные отчёты, когорты, comparisons, realtime, pagination, checkCompatibility.

## Сервисный endpoint

```
https://analyticsdata.googleapis.com
```

Формат property: `properties/{property_id}` (например, `properties/123456789`).

## Эндпоинты v1beta

### Отчёты (properties)

| Метод | HTTP | URL | Описание |
|---|---|---|---|
| `runReport` | POST | `/v1beta/{property}:runReport` | Стандартный отчёт |
| `batchRunReports` | POST | `/v1beta/{property}:batchRunReports` | Пакет отчётов (до 5) |
| `runPivotReport` | POST | `/v1beta/{property}:runPivotReport` | Сводный (pivot) отчёт |
| `batchRunPivotReports` | POST | `/v1beta/{property}:batchRunPivotReports` | Пакет сводных отчётов |
| `runRealtimeReport` | POST | `/v1beta/{property}:runRealtimeReport` | Realtime (последние 30 мин) |
| `getMetadata` | GET | `/v1beta/{name=properties/*/metadata}` | Метаданные dimensions/metrics |
| `checkCompatibility` | POST | `/v1beta/{property}:checkCompatibility` | Проверка совместимости |

### Экспорт аудиторий (properties.audienceExports)

| Метод | HTTP | URL | Описание |
|---|---|---|---|
| `create` | POST | `/v1beta/{parent}/audienceExports` | Создать экспорт аудитории |
| `get` | GET | `/v1beta/{name=.../audienceExports/*}` | Получить метаданные |
| `list` | GET | `/v1beta/{parent}/audienceExports` | Список экспортов |
| `query` | POST | `/v1beta/{name=.../audienceExports/*}:query` | Получить данные |

## Эндпоинты v1alpha (дополнительные)

| Метод | Описание |
|---|---|
| `runFunnelReport` | Воронка (funnel report) -- построение воронок конверсии |
| `getPropertyQuotasSnapshot` | Текущее потребление квот property |
| `reportTasks.create/get/list/query` | Асинхронные отчёты (для больших запросов) |

## runReport -- формат запроса

```json
POST https://analyticsdata.googleapis.com/v1beta/properties/123456789:runReport

{
  "dateRanges": [
    {"startDate": "2024-01-01", "endDate": "2024-01-31"}
  ],
  "dimensions": [
    {"name": "country"},
    {"name": "city"}
  ],
  "metrics": [
    {"name": "activeUsers"},
    {"name": "sessions"}
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "country",
      "stringFilter": {
        "matchType": "EXACT",
        "value": "Russia",
        "caseSensitive": false
      }
    }
  },
  "metricFilter": {
    "filter": {
      "fieldName": "activeUsers",
      "numericFilter": {
        "operation": "GREATER_THAN",
        "value": {"int64Value": "10"}
      }
    }
  },
  "orderBys": [
    {"metric": {"metricName": "activeUsers"}, "desc": true}
  ],
  "limit": 100,
  "offset": 0,
  "keepEmptyRows": false,
  "returnPropertyQuota": true
}
```

### Все поля запроса

| Поле | Тип | Описание |
|---|---|---|
| `dimensions[]` | Dimension[] | Измерения для группировки (до 9) |
| `metrics[]` | Metric[] | Метрики для расчёта |
| `dateRanges[]` | DateRange[] | Диапазоны дат (до 4). Форматы: `"7daysAgo"`, `"yesterday"`, `"today"`, `YYYY-MM-DD` |
| `dimensionFilter` | FilterExpression | Фильтр по измерениям (до агрегации) |
| `metricFilter` | FilterExpression | Фильтр по метрикам (после агрегации, аналог SQL HAVING) |
| `offset` | int64 | Смещение строк (от 0) |
| `limit` | int64 | Кол-во строк (по умолчанию 10 000, макс. 250 000) |
| `metricAggregations[]` | enum | Агрегации: TOTAL, MINIMUM, MAXIMUM |
| `orderBys[]` | OrderBy[] | Сортировка по dimensions или metrics |
| `currencyCode` | string | Код валюты ISO 4217 (например, `"USD"`) |
| `cohortSpec` | CohortSpec | Конфигурация когортного анализа |
| `keepEmptyRows` | boolean | Включать строки, где все метрики = 0 |
| `returnPropertyQuota` | boolean | Возвращать текущее состояние квот |
| `comparisons[]` | Comparison[] | Сравнения подмножеств данных |

## runReport -- формат ответа

```json
{
  "dimensionHeaders": [
    {"name": "country"},
    {"name": "city"}
  ],
  "metricHeaders": [
    {"name": "activeUsers", "type": "TYPE_INTEGER"},
    {"name": "sessions", "type": "TYPE_INTEGER"}
  ],
  "rows": [
    {
      "dimensionValues": [
        {"value": "Japan"},
        {"value": "Tokyo"}
      ],
      "metricValues": [
        {"value": "2541"},
        {"value": "3820"}
      ]
    }
  ],
  "rowCount": 2,
  "totals": [],
  "maximums": [],
  "minimums": [],
  "metadata": {
    "dataLossFromOtherRow": false,
    "samplingMetadatas": [],
    "currencyCode": "USD",
    "timeZone": "America/Los_Angeles"
  },
  "propertyQuota": {
    "tokensPerDay": {"consumed": 150, "remaining": 199850},
    "tokensPerHour": {"consumed": 150, "remaining": 39850},
    "concurrentRequests": {"consumed": 1, "remaining": 9},
    "serverErrorsPerProjectPerHour": {"consumed": 0, "remaining": 10}
  }
}
```

**Ключевые поля ответа:**
- `rowCount` -- общее число строк (для pagination)
- `metadata.samplingMetadatas` -- если не пустой, данные семплированы
- `metadata.dataLossFromOtherRow` -- если `true`, часть данных в строке `(other)`
- `propertyQuota` -- текущее потребление квот (только если `returnPropertyQuota: true`)

## Система фильтров (FilterExpression)

### Комбинаторы

| Тип | Описание |
|---|---|
| `andGroup` | Все выражения должны быть истинны (AND) |
| `orGroup` | Хотя бы одно выражение истинно (OR) |
| `notExpression` | Отрицание выражения (NOT) |
| `filter` | Примитивный фильтр по одному полю |

### Типы фильтров

**StringFilter** -- фильтрация строковых значений:

| matchType | Описание |
|---|---|
| `EXACT` | Точное совпадение |
| `BEGINS_WITH` | Начинается с |
| `ENDS_WITH` | Заканчивается на |
| `CONTAINS` | Содержит подстроку |
| `FULL_REGEXP` | Полное регулярное выражение |
| `PARTIAL_REGEXP` | Частичное регулярное выражение |

Дополнительное поле: `caseSensitive` (boolean).

**NumericFilter** -- фильтрация числовых значений:

| operation | Описание |
|---|---|
| `EQUAL` | Равно |
| `LESS_THAN` | Меньше |
| `LESS_THAN_OR_EQUAL` | Меньше или равно |
| `GREATER_THAN` | Больше |
| `GREATER_THAN_OR_EQUAL` | Больше или равно |

Значение: `{"int64Value": "100"}` или `{"doubleValue": 3.14}`.

**BetweenFilter** -- диапазон (включительно):

```json
{"fromValue": {"int64Value": "10"}, "toValue": {"int64Value": "100"}}
```

**InListFilter** -- список допустимых значений:

```json
{"values": ["Chrome", "Firefox", "Safari"], "caseSensitive": false}
```

**EmptyFilter** -- фильтрация пустых значений `"(not set)"` и `""`.

### Пример сложного фильтра (AND + NOT)

```json
{
  "dimensionFilter": {
    "andGroup": {
      "expressions": [
        {
          "filter": {
            "fieldName": "browser",
            "inListFilter": {"values": ["Chrome", "Firefox"]}
          }
        },
        {
          "notExpression": {
            "filter": {
              "fieldName": "country",
              "stringFilter": {"value": "Russia"}
            }
          }
        }
      ]
    }
  }
}
```

## Сводные отчёты (Pivot Report)

```json
POST /v1beta/properties/123456789:runPivotReport

{
  "dateRanges": [{"startDate": "2024-01-01", "endDate": "2024-01-31"}],
  "dimensions": [
    {"name": "browser"},
    {"name": "country"}
  ],
  "metrics": [{"name": "sessions"}],
  "pivots": [
    {
      "fieldNames": ["browser"],
      "limit": 5,
      "orderBys": [{"metric": {"metricName": "sessions"}, "desc": true}]
    },
    {
      "fieldNames": ["country"],
      "limit": 10
    }
  ]
}
```

Каждый pivot определяет одну "ось" таблицы. `fieldNames` -- какие dimensions использовать в этой оси, `limit` -- сколько значений показать.

## Когортный анализ

```json
{
  "dimensions": [
    {"name": "cohort"},
    {"name": "cohortNthDay"}
  ],
  "metrics": [{"name": "cohortActiveUsers"}],
  "cohortSpec": {
    "cohorts": [
      {
        "dimension": "firstSessionDate",
        "dateRange": {
          "startDate": "2024-01-01",
          "endDate": "2024-01-01"
        }
      }
    ],
    "cohortsRange": {
      "endOffset": 7,
      "granularity": "DAILY"
    }
  }
}
```

`granularity`: `DAILY`, `WEEKLY`, `MONTHLY`. `endOffset` -- сколько периодов отслеживать после когорты.

## Сравнения (Comparisons)

```json
{
  "comparisons": [
    {
      "name": "Mobile traffic",
      "dimensionFilter": {
        "filter": {
          "fieldName": "platform",
          "inListFilter": {"values": ["iOS", "Android"]}
        }
      }
    }
  ],
  "dateRanges": [{"startDate": "2024-05-01", "endDate": "2024-05-15"}],
  "dimensions": [{"name": "country"}],
  "metrics": [{"name": "activeUsers"}]
}
```

Comparisons позволяют сравнивать подмножества данных в одном запросе. Каждый comparison создаёт отдельный набор строк в ответе.

## Realtime отчёт

```json
POST /v1beta/properties/123456789:runRealtimeReport

{
  "dimensions": [{"name": "country"}, {"name": "city"}],
  "metrics": [{"name": "activeUsers"}, {"name": "eventCount"}],
  "minuteRanges": [
    {"startMinutesAgo": 29, "endMinutesAgo": 0}
  ]
}
```

**Доступные dimensions для Realtime:** appVersion, audienceId, audienceName, city, cityId, country, countryId, deviceCategory, eventName, minutesAgo, platform, streamId, streamName, unifiedScreenName, `customUser:parameter_name`.

**Доступные metrics для Realtime:** activeUsers, eventCount, keyEvents, screenPageViews.

**Особенности:** данные за последние 30 минут, нет dateRanges (вместо них minuteRanges), ограниченный набор dimensions/metrics.

## Pagination

- `limit` -- количество строк в ответе (по умолчанию 10 000, максимум 250 000)
- `offset` -- смещение от начала (от 0)
- `rowCount` в ответе -- общее число строк
- Для получения всех данных: повторять запросы с увеличением `offset` на `limit`, пока `offset < rowCount`

## checkCompatibility

Проверка совместимости dimensions и metrics перед запросом. ВСЕГДА вызывай для новых комбинаций.

**Запрос:**

```json
POST /v1beta/properties/123456789:checkCompatibility

{
  "dimensions": [
    {"name": "country"},
    {"name": "itemName"}
  ],
  "metrics": [
    {"name": "activeUsers"},
    {"name": "itemRevenue"}
  ]
}
```

**Ответ:**

```json
{
  "dimensionCompatibilities": [
    {"dimensionMetadata": {"apiName": "country"}, "compatibility": "COMPATIBLE"},
    {"dimensionMetadata": {"apiName": "itemName"}, "compatibility": "COMPATIBLE"}
  ],
  "metricCompatibilities": [
    {"metricMetadata": {"apiName": "activeUsers"}, "compatibility": "COMPATIBLE"},
    {"metricMetadata": {"apiName": "itemRevenue"}, "compatibility": "COMPATIBLE"}
  ]
}
```

ЕСЛИ `compatibility` != `COMPATIBLE` -- эту комбинацию нельзя использовать в runReport.
