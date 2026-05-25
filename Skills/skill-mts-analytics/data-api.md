# Data API

## Назначение

Описание асинхронного Data API МТС Аналитики: эндпоинты, параметры, статусы задач, lifecycle экспорта. Покрывает экспорт сырых событий для сайтов и приложений.

## Два типа данных

### Сайты

| Тип события | Описание |
|-------------|----------|
| `WEB_HIT` | Сырые события на сайте (просмотры страниц, клики, действия) |
| `SESSION` | Сессии пользователей |

### Приложения

| Тип события | Описание |
|-------------|----------|
| `MOBILE_HIT` | Сырые события в мобильном приложении |

**Примечание:** в некоторых контекстах используется значение `HIT` -- это может быть алиас для `WEB_HIT`. Рекомендуется использовать значения из official docs (`WEB_HIT`, `SESSION`, `MOBILE_HIT`).

## Асинхронный lifecycle

Data API работает в 3 шага: создание задачи, ожидание готовности, скачивание результата.

### Шаг 1: Создание задачи

```
POST /dataexporttasks
```

**Body:**

```json
{
  "event": "WEB_HIT",
  "filter": {
    "receiveFrom": "2026-04-01T00:00:00+03:00",
    "receiveTo": "2026-05-01T00:00:00+03:00"
  },
  "flowIds": ["{{FLOW_ID}}"]
}
```

**Ответ:**

```json
{
  "id": "task-uuid-here",
  "status": "CREATED"
}
```

### Шаг 2: Polling статуса

```
GET /dataexporttasks/{taskId}
```

**Ответ:**

```json
{
  "id": "task-uuid-here",
  "status": "SUCCESS",
  "result": {
    "partsCount": 5
  }
}
```

**Интервал polling:** каждые 30-60 сек. Ожидание: 5-20 мин в зависимости от объёма данных.

### Шаг 3: Скачивание частей

```
GET /dataexporttasks/{taskId}/parts/{partNumber}
```

**Альтернативный формат (из практики):**

```
GET /dataexporttasks/{taskId}/parts/{partNumber}:download
```

Оба формата работают. Ответ -- gzip CSV. Каждая часть ~30 MB, ~99k строк.

**Нумерация частей:** от 0 до `partsCount - 1`.

## Параметры запроса

| Параметр | Тип | Обязателен | Описание |
|----------|-----|------------|----------|
| `event` | String | Да | Тип события: `WEB_HIT`, `SESSION`, `MOBILE_HIT` |
| `flowIds` | Array[String] | Да | Массив UUID потоков данных |
| `receiveFrom` | DateTime (ISO 8601) | Нет* | Начало периода по серверному времени получения |
| `receiveTo` | DateTime (ISO 8601) | Нет* | Конец периода по серверному времени получения |
| `occurrenceFrom` | DateTime (ISO 8601) | Нет* | Начало периода по клиентскому времени события |
| `occurrenceTo` | DateTime (ISO 8601) | Нет* | Конец периода по клиентскому времени события |
| `occurrenceDttmFrom` | DateTime (ISO 8601) | Нет* | Начало периода по локальному времени события |
| `occurrenceDttmTo` | DateTime (ISO 8601) | Нет* | Конец периода по локальному времени события |
| `attribution` | Object | Нет | Модель атрибуции (см. ниже) |

*Нужна хотя бы одна пара дат.

**Три пары дат:**

| Пара | Семантика | Когда использовать |
|------|-----------|--------------------|
| `receiveFrom`/`receiveTo` | Время получения на сервер | Стандартный выбор для большинства задач |
| `occurrenceFrom`/`occurrenceTo` | Время события на клиенте | Когда важно клиентское время |
| `occurrenceDttmFrom`/`occurrenceDttmTo` | Локальное время события | Когда нужна привязка к local timezone |

### Параметр attribution (опциональный)

Добавляет колонки атрибуции в CSV:

```json
{
  "attribution": {
    "model": "LAST_CLICK",
    "window": 30
  }
}
```

## Статусы задач

| Статус | Описание | Действие |
|--------|----------|----------|
| `CREATED` | Задача создана | Ждать, polling каждые 30-60 сек |
| `IN_PROGRESS` | Выполняется выборка | Ждать, polling |
| `SUCCESS` | Завершена, можно скачивать | Скачать части (0..partsCount-1) |
| `FAILED` | Ошибка | Проверить параметры, создать новую задачу |
| `RESULT_CLEANED_AS_TOO_OLD` | Результат удалён (через 24 часа) | Создать новую задачу |

## Формат ответа

- **Формат:** CSV
- **Сжатие:** gzip
- **Размер части:** ~30 MB, ~99k строк
- **Справочник полей:** см. [data-api-fields.md](data-api-fields.md)

## Пример curl-запроса

### Создание задачи

```bash
curl --request POST \
  --url https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/dataexporttasks \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer {{TOKEN}}' \
  --data '{
    "event": "WEB_HIT",
    "filter": {
      "receiveFrom": "2026-04-01T00:00:00+03:00",
      "receiveTo": "2026-05-01T00:00:00+03:00"
    },
    "flowIds": ["{{FLOW_ID}}"]
  }'
```

### Проверка статуса

```bash
curl -s \
  -H "Authorization: Bearer {{TOKEN}}" \
  "https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/dataexporttasks/{taskId}"
```

### Скачивание части

```bash
curl -s \
  -H "Authorization: Bearer {{TOKEN}}" \
  -o "part_0.csv.gz" \
  "https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/dataexporttasks/{taskId}/parts/0"
```
