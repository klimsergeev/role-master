# API управления

## Назначение

Справочник по API управления Яндекс Метрики — счётчики, цели и сегменты. Используется для создания/редактирования/удаления счётчиков, настройки целей и работы с API-сегментами.

## Базовый URL

```
https://api-metrika.yandex.net/management/v1
```

## Счётчики

### Список счётчиков

| Параметр | Значение |
|----------|----------|
| **Метод** | GET |
| **URL** | `/management/v1/counters` |

**Query-параметры:**

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `counter_ids` | integer[] | — | Фильтр по ID счётчиков |
| `favorite` | boolean | false | Только избранные |
| `field` | string | — | Доп. данные: `goals,mirrors,grants,filters,operations` |
| `label_id` | integer | — | Фильтр по метке |
| `offset` | integer | 1 | Смещение (макс. 100 000) |
| `per_page` | integer | 1000 | На странице (макс. 10 000) |
| `permission` | string | — | Фильтр: `own`, `view`, `edit` |
| `reverse` | boolean | true | Обратный порядок |
| `search_string` | string | — | Поиск по ID/названию/домену |
| `sort` | string | `Default` | Сортировка: `None`, `Default`, `Visits`, `Hits`, `Uniques`, `Name` |
| `status` | string | `Active` | Статус: `Active` или `Deleted` |
| `type` | string | — | Тип: `simple` или `partner` |

**Ответ:** `{ "rows": N, "counters": [...] }`

Каждый счётчик содержит: `id`, `name`, `status`, `owner_login`, `type`, `favorite`, `permission`, `goals`, `filters`, `operations`, `grants`, `labels`, `create_time`, `time_zone_name`.

### Информация о счётчике

| Параметр | Значение |
|----------|----------|
| **Метод** | GET |
| **URL** | `/management/v1/counter/{counterId}` |

**Query-параметры:** `field` (опционально) — доп. данные через запятую.

**Ответ:** `{ "counter": { ...CounterFull... } }`

### Создание счётчика

| Параметр | Значение |
|----------|----------|
| **Метод** | POST |
| **URL** | `/management/v1/counters` |

**Тело запроса** (JSON):

```json
{
  "counter": {
    "name": "Мой сайт",
    "site2": { "site": "example.com" },
    "time_zone_name": "Europe/Moscow"
  }
}
```

### Редактирование счётчика

| Параметр | Значение |
|----------|----------|
| **Метод** | PUT |
| **URL** | `/management/v1/counter/{counterId}` |

**Тело запроса:** `{ "counter": { ...CounterEdit... } }`

### Удаление счётчика

| Параметр | Значение |
|----------|----------|
| **Метод** | DELETE |
| **URL** | `/management/v1/counter/{counterId}` |

**Ответ:** `{ "success": true }`

### Сводная таблица методов счётчиков

| Действие | Метод | URL |
|----------|-------|-----|
| Список | GET | `/management/v1/counters` |
| Информация | GET | `/management/v1/counter/{counterId}` |
| Создание | POST | `/management/v1/counters` |
| Редактирование | PUT | `/management/v1/counter/{counterId}` |
| Удаление | DELETE | `/management/v1/counter/{counterId}` |

---

## Цели

### Список целей

| Параметр | Значение |
|----------|----------|
| **Метод** | GET |
| **URL** | `/management/v1/counter/{counterId}/goals` |

**Query-параметры:**
- `useDeleted` (boolean, по умолчанию false) — включать удалённые цели

**Ответ:** `{ "goals": [...] }`

### Информация о цели

| Параметр | Значение |
|----------|----------|
| **Метод** | GET |
| **URL** | `/management/v1/counter/{counterId}/goal/{goalId}` |

### Создание цели

| Параметр | Значение |
|----------|----------|
| **Метод** | POST |
| **URL** | `/management/v1/counter/{counterId}/goals` |

**Тело запроса** (JSON):

```json
{
  "goal": {
    "name": "Покупка",
    "type": "url",
    "is_favorite": true,
    "conditions": [
      { "type": "contain", "url": "/thank-you" }
    ]
  }
}
```

**13 типов целей:**

| Тип | Описание |
|-----|----------|
| `action` | JavaScript-событие |
| `chat` | Клик по чат-виджету |
| `email` | Клик по email-ссылке |
| `file` | Скачивание файла |
| `messenger` | Переход в мессенджер |
| `number` | Глубина просмотра (кол-во страниц) |
| `payment_system` | Завершение платежа |
| `phone` | Клик по номеру телефона |
| `search` | Поисковый запрос на сайте |
| `social` | Переход в соцсеть |
| `step` | Составная цель (многошаговая воронка) |
| `url` | Посещение страницы |
| `visit_duration` | Порог длительности визита |

### Сводная таблица методов целей

| Действие | Метод | URL |
|----------|-------|-----|
| Список | GET | `/management/v1/counter/{counterId}/goals` |
| Информация | GET | `/management/v1/counter/{counterId}/goal/{goalId}` |
| Создание | POST | `/management/v1/counter/{counterId}/goals` |

---

## Сегменты

### Список сегментов

| Параметр | Значение |
|----------|----------|
| **Метод** | GET |
| **URL** | `/management/v1/counter/{counterId}/apisegment/segments` |

**Ответ:** `{ "segments": [...] }`

Каждый сегмент содержит:
- `segment_id` — идентификатор
- `counter_id` — счётчик
- `name` — название (1-255 символов)
- `expression` — выражение фильтра (1-65535 символов), синтаксис аналогичен `filters` в API отчётов
- `status` — `active` или `deleted`
- `segment_source` — всегда `api`
- `create_time` — время создания (ISO 8601)

**Важно:** сегменты, созданные через API, не отображаются в веб-интерфейсе Метрики.

### Создание сегмента

| Параметр | Значение |
|----------|----------|
| **Метод** | POST |
| **URL** | `/management/v1/counter/{counterId}/apisegment/segments` |

**Тело запроса:**

```json
{
  "segment": {
    "name": "Windows desktop с масштабом",
    "expression": "ym:s:operatingSystem=='windows' AND ym:s:deviceCategory=='1'"
  }
}
```

### Сводная таблица методов сегментов

| Действие | Метод | URL |
|----------|-------|-----|
| Список | GET | `/management/v1/counter/{counterId}/apisegment/segments` |
| Создание | POST | `/management/v1/counter/{counterId}/apisegment/segments` |
