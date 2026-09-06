---
name: skill-google-analytics
description: >
  Справочник API Google Analytics 4 для Claude Code агентов -- Data API (отчёты
  с dimensions и metrics, фильтры, pivot, cohort, realtime), Admin API (accounts,
  properties, dataStreams, customDimensions, keyEvents), Measurement Protocol
  (серверная отправка событий), BigQuery Export (сырые данные без семплирования).
  Включает авторизацию через Google Cloud (Service Account и OAuth 2.0),
  Python-сниппеты для google-analytics-data и google-analytics-admin, справочник
  200+ dimensions и 100+ metrics, квоты на токены.
when_to_use: >
  Когда нужно: получить отчёт GA4, выгрузить данные Google Analytics, написать
  запрос к Data API, проверить совместимость dimensions и metrics, настроить
  Service Account для GA4, отправить событие через Measurement Protocol,
  написать SQL для BigQuery GA4, управлять GA4 property через Admin API.
  Примеры: "GA4 отчёт по странам", "Google Analytics API", "BigQuery GA4 запрос",
  "отправить серверное событие GA4", "checkCompatibility GA4".
version: 2.1.0
created: 2026-05-24
---

# Google Analytics 4

## Назначение

Справочник четырёх независимых GA4 API (Data API, Admin API, Measurement Protocol, BigQuery Export) для Claude Code агентов. Содержит авторизацию, эндпоинты, справочник полей, Python-сниппеты, SQL-примеры и подводные камни.

## Принципы

1. **Property ID** -- основной идентификатор, формат `properties/123456789`
2. **Квоты в токенах** -- не лимиты запросов; всегда передавай `returnPropertyQuota: true`
3. **checkCompatibility** -- вызывай перед первым запросом с новой комбинацией dimensions+metrics
4. **Service Account** -- рекомендуется для агентов (проще OAuth, не требует user interaction)
5. **Event-based модель** -- GA4 считает всё событиями (нет сессий/хитов как в UA)
6. **UA мёртв** -- Universal Analytics API прекратил работу 01.07.2024, не смешивать

## Таблица маршрутизации

> Читай файлы под задачу, а не скилл целиком. Колонка «Обязательно» -- открыть до начала работы. Колонка «Читать, если» -- открыть, когда условие выполнено; условие проверяется по задаче, а не по желанию. Файлы с пометкой `(справочник)` устроены как таблицы для точечного поиска -- в них допустим поиск нужной строки вместо чтения целиком.

| Задача | Обязательно | Читать, если |
|---|---|---|
| Первое подключение к GA4 API | [auth-and-setup.md](auth-and-setup.md) | если тестовый запрос вернул 403, ошибку credentials или пустой список аккаунтов: [gotchas.md](gotchas.md) |
| Построить отчёт (runReport) | [data-api.md](data-api.md), [data-api-fields.md](data-api-fields.md) (справочник), [python-reference.md](python-reference.md) | если период охватывает больше 10 млн событий или в ответе есть `samplingMetadatas`, `dataLossFromOtherRow` либо код 4xx: [gotchas.md](gotchas.md) |
| Выбрать dimensions/metrics | [data-api-fields.md](data-api-fields.md) (справочник) | если комбинация dimensions+metrics используется впервые: [data-api.md](data-api.md) (checkCompatibility); если поля нет в справочнике: [data-api.md](data-api.md) (getMetadata) |
| Запрос в реальном времени | [data-api.md](data-api.md) | если запрос выполняется Python-скриптом, а не curl: [python-reference.md](python-reference.md) |
| Управлять GA4 property | [admin-api.md](admin-api.md) | если Service Account ещё не заведён или требуется scope на запись (`analytics.edit`): [auth-and-setup.md](auth-and-setup.md); если управление выполняется Python-скриптом: [python-reference.md](python-reference.md) |
| Написать SQL по BigQuery GA4 | [bigquery-export.md](bigquery-export.md) | если экспорт GA4 в BigQuery ещё не подключён: [admin-api.md](admin-api.md) (bigQueryLinks); если Data API уже упёрся в семплирование, строку `(other)` или квоты: [gotchas.md](gotchas.md) |
| Отправить серверное событие | [measurement-protocol.md](measurement-protocol.md) | если `api_secret` ещё не получен: [admin-api.md](admin-api.md) (measurementProtocolSecrets); если событие отправляется из Python: [python-reference.md](python-reference.md) |
| Написать Python-скрипт для GA4 | [python-reference.md](python-reference.md) | если скрипт обращается к Data API: [data-api.md](data-api.md), [data-api-fields.md](data-api-fields.md) (справочник); если скрипт меняет конфигурацию property: [admin-api.md](admin-api.md); если скрипт отправляет события: [measurement-protocol.md](measurement-protocol.md) |
| Отладить ошибку API | [gotchas.md](gotchas.md) | если 403 PERMISSION_DENIED или отказ по credentials: [auth-and-setup.md](auth-and-setup.md); если 400 по несовместимости полей: [data-api.md](data-api.md) (checkCompatibility), [data-api-fields.md](data-api-fields.md) (справочник) |

## Самопроверка при подключении

### Шаг 1: Проверить окружение

- Директория `scripts-ga/` существует (создать если нет)
- Директория `scripts-ga/result/` существует (создать если нет)
- Файл `.env` содержит:
  ```
  GA4_PROPERTY_ID={{PROPERTY_ID}}
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
  ```

### Шаг 2: Проверить зависимости

```bash
pip install google-analytics-data google-analytics-admin python-dotenv
```

### Шаг 3: Подтвердить готовность

Сообщить пользователю:
> GA4 окружение готово. Property ID: `{{PROPERTY_ID}}`. Credentials: Service Account. Что нужно выгрузить?

## Рабочий процесс

### Шаг 1: Определить тип задачи

| Запрос пользователя | API | Файлы |
|---|---|---|
| Отчёт, метрики, dimensions | Data API | [data-api.md](data-api.md), [python-reference.md](python-reference.md) |
| Управление property, потоки, события | Admin API | [admin-api.md](admin-api.md) |
| Серверный трекинг, офлайн-события | Measurement Protocol | [measurement-protocol.md](measurement-protocol.md) |
| SQL, сырые данные, UNNEST | BigQuery Export | [bigquery-export.md](bigquery-export.md) |

### Шаг 2: Загрузить нужные файлы

Загрузить файлы по таблице маршрутизации. Не загружать все файлы сразу.

### Шаг 3: Выполнить задачу

- **Data API** -- Python-скрипт из [python-reference.md](python-reference.md)
- **BigQuery** -- SQL-запрос из [bigquery-export.md](bigquery-export.md)
- **Measurement Protocol** -- HTTP-запрос из [measurement-protocol.md](measurement-protocol.md)
- **Admin API** -- Python или curl из [admin-api.md](admin-api.md)

### Шаг 4: Сохранить результат

Именование файлов выгрузки: `YYYY-MM-DD-HH-MM-SS-ga4_data.csv`

Сохранять в `scripts-ga/result/`.

## Механика работы с Python-скриптами

1. Определить задачу и нужные dimensions/metrics
2. Взять шаблон из [python-reference.md](python-reference.md)
3. Адаптировать под запрос (dimensions, metrics, фильтры, даты)
4. Сохранить скрипт в `scripts-ga/`
5. Запустить и сохранить результат в `scripts-ga/result/`

## Что НЕ делать

- Не путать GA4 и Universal Analytics (UA мёртв с 01.07.2024)
- Не игнорировать квоты на токены
- Не пропускать checkCompatibility для новых комбинаций dimensions+metrics
- Не загружать все файлы скилла сразу
- Не хардкодить credentials -- только через `.env` / `GOOGLE_APPLICATION_CREDENTIALS`
- Не использовать deprecated `conversionEvents` -- использовать `keyEvents`

## Примеры

### Пример 1: Отчёт по странам за последний месяц

**Запрос:** "Выгрузи данные по странам за последний месяц"

**Маршрут:** [data-api.md](data-api.md), [python-reference.md](python-reference.md)

**Результат:** Python-скрипт с `runReport`, dimensions=`[country]`, metrics=`[activeUsers, sessions]`, dateRanges=`[30daysAgo, today]`. CSV в `scripts-ga/result/`.

### Пример 2: SQL по событиям purchase из BigQuery

**Запрос:** "Напиши SQL для BigQuery -- доход по товарам за январь"

**Маршрут:** [bigquery-export.md](bigquery-export.md)

**Результат:** SQL с `UNNEST(items)`, фильтр `event_name = 'purchase'`, группировка по `item_name`, сортировка по `total_revenue DESC`.

### Пример 3: Ошибка 429 RESOURCE_EXHAUSTED

**Запрос:** "Получаю 429 при запросе к Data API"

**Маршрут:** [gotchas.md](gotchas.md)

**Результат:** Проверка квот через `returnPropertyQuota: true`, уменьшение диапазона дат, переход на `batchRunReports`, при необходимости -- BigQuery Export.
