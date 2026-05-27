# Gotchas

## Назначение

Подводные камни, ограничения и лучшие практики GA4 API. Квоты, семплирование, кардинальность, thresholding, типичные ошибки.

## Квоты Data API

| Квота | Standard | Analytics 360 |
|---|:---:|:---:|
| Core Tokens / день / свойство | 200 000 | 2 000 000 |
| Core Tokens / час / свойство | 40 000 | 400 000 |
| Core Tokens / час / проект / свойство | 14 000 | 140 000 |
| Concurrent requests / свойство | 10 | 50 |
| Server errors / час / проект / свойство | 10 | 50 |
| Realtime Tokens / день / свойство | 200 000 | 2 000 000 |
| Realtime Tokens / час / свойство | 40 000 | 400 000 |
| Funnel Tokens / день / свойство | 200 000 | 2 000 000 |
| Funnel Tokens / час / свойство | 40 000 | 400 000 |
| Potentially thresholded requests / час | 120 | 120 |

**Обновление квот:**
- Дневные -- в полночь по Pacific Standard Time (PST)
- Часовые -- в течение часа (не обязательно на границе часа)

**Мониторинг:** добавить `"returnPropertyQuota": true` в запрос. В ответе -- `propertyQuota` с consumed/remaining.

**v1alpha:** `getPropertyQuotasSnapshot` -- получить текущее потребление квот без выполнения отчёта.

## Семплирование (Sampling)

| Тип свойства | Порог семплирования |
|---|:---:|
| Standard | 10 млн событий |
| Analytics 360 | 1 млрд событий |

Когда запрос охватывает больше событий, чем порог, GA4 анализирует выборку. В ответе API появляется поле `samplingMetadatas`.

**Как обнаружить:** проверить `metadata.samplingMetadatas` в ответе -- если не пустой, данные семплированы.

**Как избежать:** использовать BigQuery Export (сырые данные без семплирования).

## Строка (other) и кардинальность

- **Кардинальность:** измерение с >500 уникальных значений в день считается высококардинальным
- **Строка (other):** данные за пределами лимита строк агрегируются в строку `(other)`
- **Лимит строк:** 2 млн для стандартных отчётов
- **Индикатор:** `metadata.dataLossFromOtherRow: true` в ответе

**Где НЕТ (other):**
- BigQuery Export
- Explorations (с оговорками)

## Несовместимость dimensions/metrics

Не все комбинации dimensions и metrics совместимы. Например, событийные dimensions (`itemId`, `itemName`) нельзя смешивать с некоторыми пользовательскими (`source`) в одном запросе.

**Решение:**
1. Вызвать `checkCompatibility` перед запросом -- см. [data-api.md](data-api.md)
2. Использовать [GA4 Dimensions & Metrics Explorer](https://ga-dev-tools.google/ga4/dimensions-metrics-explorer/)

## Thresholding (порогование)

Для защиты приватности GA4 скрывает данные, если малый объём может раскрыть информацию о конкретных пользователях.

**Затрагиваемые dimensions:**
- `userAgeBracket`
- `userGender`
- `brandingInterest`
- `audienceId` / `audienceName`

**Лимит:** 120 потенциально пороговых запросов в час на свойство.

## Свежесть данных (Data Freshness)

| Источник | Задержка |
|---|---|
| Data API (стандартные отчёты) | 24-48 часов |
| Data API (Realtime) | Мгновенно (до 30 минут) |
| BigQuery Daily Export | ~24 часа |
| BigQuery Streaming Export | Минуты |

Данные за текущий день неполные. Для актуальных данных -- Realtime API или BigQuery Streaming.

## Типичные ошибки API

| Код | Ошибка | Причина и решение |
|---|---|---|
| 403 | `PERMISSION_DENIED` | Service Account не добавлен как пользователь GA4. Решение: Admin > Property Access > добавить email SA |
| 429 | `RESOURCE_EXHAUSTED` | Превышена квота. Решение: уменьшить диапазон дат, дождаться обновления квоты, мониторить через `returnPropertyQuota` |
| 400 | Incompatible dimensions/metrics | Несовместимые dimensions/metrics. Решение: проверить через `checkCompatibility` |
| 400 | Invalid property | Неверный формат property. Правильный формат: `properties/123456789` |

## Best Practices

1. **batchRunReports** -- объединяй несколько отчётов в один запрос (до 5)
2. **returnPropertyQuota: true** -- всегда включай для мониторинга квот
3. **Кэширование** -- данные за прошлые периоды не меняются, кэшируй ответы
4. **Уменьшай диапазоны дат** -- меньший диапазон = меньше токенов
5. **BigQuery для тяжёлых запросов** -- без семплирования и квот Data API
6. **checkCompatibility** -- проверяй совместимость до запроса
7. **Минимальный scope** -- запрашивай `analytics.readonly`, если не нужна запись

## Пробелы в данных

Что не покрыто полностью в этом справочнике:

- **Полный список metrics из Explorer** -- страница загружает данные через JavaScript. Используй `getMetadata` API для актуального списка
- **Схема pseudonymous_users** -- документация менее подробна, чем для events
- **Точные лимиты custom dimensions/metrics** -- зависят от типа свойства
- **Funnel Report API (v1alpha)** -- эндпоинт задокументирован, примеры ограничены

**Где искать дополнительно:**
- `getMetadata` API -- полный актуальный список dimensions/metrics для конкретного property
- [GA4 Dimensions & Metrics Explorer](https://ga-dev-tools.google/ga4/dimensions-metrics-explorer/)
- [GitHub: googleanalytics/python-docs-samples](https://github.com/googleanalytics/python-docs-samples)
- [GitHub: googleanalytics/analytics-data-curl-examples](https://github.com/googleanalytics/analytics-data-curl-examples)
