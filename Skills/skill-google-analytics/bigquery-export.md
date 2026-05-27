# BigQuery Export

## Назначение

Справочник BigQuery Export GA4 -- настройка экспорта, схема таблиц events, SQL-примеры с UNNEST для вложенных RECORD-полей.

## Общая схема

При подключении GA4 к BigQuery создаётся dataset `analytics_{{PROPERTY_ID}}` в проекте BigQuery.

### Типы таблиц

| Таблица | Описание | Когда создаётся |
|---|---|---|
| `events_YYYYMMDD` | Дневная таблица событий | Daily export (раз в сутки) |
| `events_intraday_YYYYMMDD` | Внутридневная таблица | Streaming export (непрерывно) |
| `pseudonymous_users_YYYYMMDD` | Таблица псевдонимных пользователей | Daily export |

Формат обращения: `` `{{BQ_PROJECT}}.analytics_{{PROPERTY_ID}}.events_*` ``

## Настройка экспорта

**Через Admin UI:**
1. GA4 > Admin > BigQuery Links
2. Выбрать BigQuery проект
3. Настроить тип экспорта (daily / streaming)

**Через Admin API:**
- `bigQueryLinks.create` (v1alpha) -- см. [admin-api.md](admin-api.md)

## Типы экспорта

| Тип | Данные | Задержка | Таблица |
|---|---|---|---|
| **Daily** | Полные данные за день | ~24 часа | `events_YYYYMMDD` |
| **Streaming** | Данные в реальном времени | Минуты | `events_intraday_YYYYMMDD` |

`events_intraday_YYYYMMDD` заменяется на `events_YYYYMMDD` после завершения daily export.

## Схема таблицы events

### Поля верхнего уровня

| Поле | Тип | Описание |
|---|---|---|
| `event_date` | STRING | Дата события (YYYYMMDD) |
| `event_timestamp` | INTEGER | Время события (микросекунды UTC) |
| `event_name` | STRING | Название события |
| `event_previous_timestamp` | INTEGER | Время предыдущего события |
| `event_value_in_usd` | FLOAT | Значение события в USD |
| `event_bundle_sequence_id` | INTEGER | Порядковый номер в пакете |
| `event_server_timestamp_offset` | INTEGER | Задержка отправки (микросекунды) |
| `user_id` | STRING | Пользовательский ID (если установлен) |
| `user_pseudo_id` | STRING | Псевдонимный ID пользователя |
| `user_first_touch_timestamp` | INTEGER | Время первого взаимодействия |
| `stream_id` | STRING | ID потока данных |
| `platform` | STRING | Платформа (web, iOS, Android) |
| `is_active_user` | BOOLEAN | Активный ли пользователь |

### event_params (REPEATED RECORD)

Массив пар ключ-значение параметров события.

| Поле | Тип | Описание |
|---|---|---|
| `event_params.key` | STRING | Название параметра |
| `event_params.value.string_value` | STRING | Строковое значение |
| `event_params.value.int_value` | INTEGER | Целочисленное значение |
| `event_params.value.float_value` | FLOAT | Дробное значение |
| `event_params.value.double_value` | FLOAT | Двойная точность |

**Типичные ключи:** `page_location`, `page_title`, `page_referrer`, `source`, `medium`, `campaign`, `ga_session_id`, `ga_session_number`, `engagement_time_msec`.

### user_properties (REPEATED RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `user_properties.key` | STRING | Название свойства |
| `user_properties.value.string_value` | STRING | Строковое значение |
| `user_properties.value.int_value` | INTEGER | Целочисленное значение |
| `user_properties.value.float_value` | FLOAT | Дробное значение |
| `user_properties.value.double_value` | FLOAT | Двойная точность |
| `user_properties.value.set_timestamp_micros` | INTEGER | Время установки |

### device (RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `device.category` | STRING | Тип устройства (desktop, mobile, tablet) |
| `device.mobile_brand_name` | STRING | Бренд устройства |
| `device.mobile_model_name` | STRING | Модель устройства |
| `device.mobile_marketing_name` | STRING | Маркетинговое название |
| `device.mobile_os_hardware_model` | STRING | Аппаратная модель |
| `device.operating_system` | STRING | ОС |
| `device.operating_system_version` | STRING | Версия ОС |
| `device.vendor_id` | STRING | IDFV (iOS) |
| `device.advertising_id` | STRING | IDFA/GAID |
| `device.language` | STRING | Язык |
| `device.is_limited_ad_tracking` | BOOLEAN | Ограниченное отслеживание рекламы |
| `device.time_zone_offset_seconds` | INTEGER | Смещение часового пояса |
| `device.browser` | STRING | Браузер |
| `device.browser_version` | STRING | Версия браузера |
| `device.web_info.browser` | STRING | Браузер (веб) |
| `device.web_info.hostname` | STRING | Хост |

### geo (RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `geo.continent` | STRING | Континент |
| `geo.country` | STRING | Страна |
| `geo.region` | STRING | Регион |
| `geo.city` | STRING | Город |
| `geo.sub_continent` | STRING | Субконтинент |
| `geo.metro` | STRING | Метрополия |

### traffic_source (RECORD)

Содержит данные **первого касания** (first-touch attribution). Значения не меняются после первой установки.

| Поле | Тип | Описание |
|---|---|---|
| `traffic_source.name` | STRING | Кампания |
| `traffic_source.medium` | STRING | Среда |
| `traffic_source.source` | STRING | Источник |

**Важно:** `traffic_source` содержит только first-touch данные. Для session-level атрибуции используй event_params (`source`, `medium`, `campaign`).

### ecommerce (RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `ecommerce.total_item_quantity` | INTEGER | Общее количество товаров |
| `ecommerce.purchase_revenue_in_usd` | FLOAT | Доход в USD |
| `ecommerce.purchase_revenue` | FLOAT | Доход в локальной валюте |
| `ecommerce.refund_value_in_usd` | FLOAT | Возврат в USD |
| `ecommerce.refund_value` | FLOAT | Возврат в локальной валюте |
| `ecommerce.shipping_value_in_usd` | FLOAT | Доставка в USD |
| `ecommerce.shipping_value` | FLOAT | Доставка в локальной валюте |
| `ecommerce.tax_value_in_usd` | FLOAT | Налог в USD |
| `ecommerce.tax_value` | FLOAT | Налог в локальной валюте |
| `ecommerce.unique_items` | INTEGER | Уникальные товары |
| `ecommerce.transaction_id` | STRING | ID транзакции |

### items (REPEATED RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `items.item_id` | STRING | ID товара |
| `items.item_name` | STRING | Название |
| `items.item_brand` | STRING | Бренд |
| `items.item_variant` | STRING | Вариант |
| `items.item_category` | STRING | Категория 1 |
| `items.item_category2` -- `item_category5` | STRING | Категории 2-5 |
| `items.price_in_usd` | FLOAT | Цена в USD |
| `items.price` | FLOAT | Цена в локальной валюте |
| `items.quantity` | INTEGER | Количество |
| `items.item_revenue_in_usd` | FLOAT | Доход от товара в USD |
| `items.item_revenue` | FLOAT | Доход от товара |
| `items.item_refund_in_usd` | FLOAT | Возврат товара в USD |
| `items.item_refund` | FLOAT | Возврат товара |
| `items.coupon` | STRING | Купон |
| `items.affiliation` | STRING | Партнёр |
| `items.location_id` | STRING | ID местоположения |
| `items.item_list_id` | STRING | ID списка |
| `items.item_list_name` | STRING | Название списка |
| `items.item_list_index` | STRING | Индекс в списке |
| `items.promotion_id` | STRING | ID промоакции |
| `items.promotion_name` | STRING | Название промоакции |
| `items.creative_name` | STRING | Название креатива |
| `items.creative_slot` | STRING | Слот креатива |

### privacy_info (RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `privacy_info.analytics_storage` | STRING | Согласие на хранение аналитики |
| `privacy_info.ads_storage` | STRING | Согласие на хранение рекламы |
| `privacy_info.uses_transient_token` | STRING | Использование временного токена |

### app_info (RECORD)

| Поле | Тип | Описание |
|---|---|---|
| `app_info.id` | STRING | ID приложения |
| `app_info.version` | STRING | Версия приложения |

## SQL-примеры

### 1. Базовый подсчёт событий

```sql
SELECT
  event_date,
  event_name,
  COUNT(*) AS event_count
FROM `{{BQ_PROJECT}}.analytics_{{PROPERTY_ID}}.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20240131'
GROUP BY event_date, event_name
ORDER BY event_count DESC
```

### 2. Извлечение event_params через UNNEST

```sql
SELECT
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec') AS engagement_time
FROM `{{BQ_PROJECT}}.analytics_{{PROPERTY_ID}}.events_20240115`
WHERE event_name = 'page_view'
```

Паттерн извлечения вложенных параметров: `(SELECT value.[type]_value FROM UNNEST(event_params) WHERE key = '[key_name]')`.

### 3. Сессии и просмотры по источнику

```sql
SELECT
  traffic_source.source,
  traffic_source.medium,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNT(DISTINCT
    CONCAT(user_pseudo_id, '-',
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')
    )
  ) AS sessions,
  COUNTIF(event_name = 'page_view') AS pageviews
FROM `{{BQ_PROJECT}}.analytics_{{PROPERTY_ID}}.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20240131'
GROUP BY 1, 2
ORDER BY users DESC
```

Подсчёт сессий: `CONCAT(user_pseudo_id, '-', ga_session_id)` -- уникальный идентификатор сессии.

### 4. Доход по товарам (UNNEST items)

```sql
SELECT
  item.item_name,
  item.item_category,
  SUM(item.quantity) AS total_quantity,
  SUM(item.item_revenue) AS total_revenue
FROM `{{BQ_PROJECT}}.analytics_{{PROPERTY_ID}}.events_*`,
  UNNEST(items) AS item
WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20240131'
  AND event_name = 'purchase'
GROUP BY 1, 2
ORDER BY total_revenue DESC
```

## Преимущества BigQuery Export

- **Нет семплирования** -- доступ к 100% данных
- **Нет строки (other)** -- полная кардинальность
- **Нет ограничений Data API** -- квоты BigQuery отдельные
- **Сырые данные** -- гибкость SQL-запросов
- **Историческое хранение** -- данные не исчезают

## Важно

- `traffic_source` содержит только first-touch данные. Для session-level атрибуции используй event_params (`source`, `medium`, `campaign`)
- Wildcard `events_*` с `_TABLE_SUFFIX` -- основной паттерн для запросов по диапазону дат
- `events_intraday_*` -- для данных текущего дня (до завершения daily export)
- Timestamp в микросекундах -- делить на 1000000 для секунд
