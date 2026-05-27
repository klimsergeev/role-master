# Measurement Protocol

## Назначение

Справочник Measurement Protocol GA4 -- серверная отправка событий. Предназначен для серверного трекинга, офлайн-событий (CRM, POS, колл-центр), IoT-устройств. Measurement Protocol дополняет автоматический сбор данных, но не заменяет его.

## Endpoints

| Тип | URL |
|---|---|
| **Production** | `https://www.google-analytics.com/mp/collect` |
| **EU Region** | `https://region1.google-analytics.com/mp/collect` |
| **Validation (Debug)** | `https://www.google-analytics.com/debug/mp/collect` |
| **EU Validation** | `https://region1.google-analytics.com/debug/mp/collect` |

## Параметры запроса

**Для веб-потоков:**
```
POST /mp/collect?measurement_id=G-XXXXXXXXXX&api_secret={{API_SECRET}}
```

**Для app-потоков (Firebase):**
```
POST /mp/collect?firebase_app_id=APP_ID&api_secret={{API_SECRET}}
```

| Параметр | Обязательный | Описание |
|---|---|---|
| `api_secret` | Да | API-секрет из GA4 (Admin > Data Streams > Measurement Protocol API secrets) |
| `measurement_id` | Да (web) | ID измерения (формат `G-XXXXXXXXXX`) |
| `firebase_app_id` | Да (app) | Firebase App ID |

`api_secret` получают через Admin API: `measurementProtocolSecrets.list` -- см. [admin-api.md](admin-api.md).

## Тело запроса

### Web (client_id)

```json
{
  "client_id": "CLIENT_ID_FROM_COOKIE",
  "user_id": "optional_user_identifier",
  "timestamp_micros": 1714000000000000,
  "user_properties": {
    "membership_level": {"value": "premium"}
  },
  "events": [
    {
      "name": "purchase",
      "params": {
        "transaction_id": "T12345",
        "value": 99.99,
        "currency": "USD",
        "session_id": "SESSION_ID",
        "engagement_time_msec": 100,
        "items": [
          {
            "item_id": "SKU123",
            "item_name": "Product Name",
            "quantity": 1,
            "price": 99.99
          }
        ]
      }
    }
  ]
}
```

### App (app_instance_id)

```json
{
  "app_instance_id": "APP_INSTANCE_ID",
  "events": [
    {
      "name": "tutorial_begin",
      "params": {
        "session_id": "SESSION_ID",
        "engagement_time_msec": 100
      }
    },
    {
      "name": "join_group",
      "params": {
        "group_id": "G_12345",
        "session_id": "SESSION_ID",
        "engagement_time_msec": 150
      }
    }
  ]
}
```

## Лимиты

| Ограничение | Значение |
|---|---|
| Макс. событий в запросе | 25 |
| Макс. параметров на событие | 25 |
| Макс. пользовательских свойств | 25 |
| Макс. размер JSON payload | 130 KB |
| Макс. длина имени события | 40 символов |
| Макс. длина имени параметра | 40 символов |
| Макс. длина значения параметра (Standard) | 100 символов |
| Макс. длина значения параметра (GA360) | 500 символов |
| Макс. длина значения user property | 36 символов |
| Макс. давность события (timestamp) | 72 часа |

## Зарезервированные имена

Нельзя использовать имена событий, параметров и user properties, начинающиеся с:

- `_` (подчёркивание)
- `firebase_`
- `ga_`
- `google_`
- `gtag.`

## Валидация

Endpoint: `/debug/mp/collect` (тот же host, что и production).

### Ответ при ошибке

```json
{
  "validationMessages": [
    {
      "fieldPath": "events",
      "description": "Event at index: [0] has invalid name [_badEventName]...",
      "validationCode": "NAME_INVALID"
    }
  ]
}
```

### Ответ при успехе

```json
{
  "validationMessages": []
}
```

### Коды валидации

| Код | Описание |
|---|---|
| `VALUE_INVALID` | Невалидное значение поля |
| `VALUE_REQUIRED` | Отсутствует обязательное поле |
| `NAME_INVALID` | Имя не начинается с буквы |
| `NAME_RESERVED` | Использовано зарезервированное имя |
| `VALUE_OUT_OF_BOUNDS` | Значение превышает лимиты |
| `EXCEEDED_MAX_ENTITIES` | Слишком много параметров |
| `NAME_DUPLICATED` | Дублирование имён параметров |

**Важно:** Validation endpoint НЕ проверяет `api_secret` и `measurement_id`. События, отправленные на validation endpoint, НЕ попадают в отчёты.

## Debug Mode

Для отображения событий в DebugView GA4 добавь параметр `debug_mode: true` (или `1`) в каждое событие:

```json
{
  "client_id": "...",
  "events": [
    {
      "name": "my_event",
      "params": {
        "debug_mode": true,
        "engagement_time_msec": 100
      }
    }
  ]
}
```

DebugView: GA4 > Admin > DebugView. Показывает события в реальном времени для отладки.

## Обязательные параметры

Для корректного учёта событий в отчётах GA4 добавляй в `params` каждого события:

- `engagement_time_msec` -- время взаимодействия в миллисекундах (минимум `100`)
- `session_id` -- ID сессии для привязки события к сессии

Без этих параметров события могут не отображаться в стандартных отчётах.

## Полный пример (curl)

```bash
curl -X POST \
  "https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret={{API_SECRET}}" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client_id_value",
    "events": [
      {
        "name": "server_purchase",
        "params": {
          "transaction_id": "T-12345",
          "value": 150.0,
          "currency": "RUB",
          "engagement_time_msec": 100,
          "session_id": "123456"
        }
      }
    ]
  }'
```

Успешный ответ: HTTP 204 (No Content). Тело ответа пустое. Для проверки используй debug endpoint.
