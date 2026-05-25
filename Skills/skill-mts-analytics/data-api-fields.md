# Справочник полей CSV

## Назначение

Справочник полей в CSV-выгрузках Data API МТС Аналитики для сайтов и приложений.

## Поля для сайтов (WEB_HIT / SESSION)

### Основные поля (official docs)

| Поле | Тип | Описание |
|------|-----|----------|
| `ma_hit_id` | UInt64 | Уникальный ID события |
| `ma_session_id` | UInt64 | Уникальный ID сессии |
| `ma_client_id` | UInt64 | First-party cookie браузера |
| `ma_hit_name` | String | Название события |
| `ma_url_host` | String | Домен сайта |
| `ma_url_path` | String | Путь страницы |
| `ma_occurrence_dttm` | DateTime | Время события на клиенте |
| `ma_receive_dttm` | DateTime | Время получения на сервер |
| `own_user_id` | String | ID пользователя ресурса |
| `UserAuth` | String | Статус авторизации (0/1) |
| `ma_device_type` | String | ПК, смартфон, планшет, консоль |
| `ma_browser_name` | String | Название браузера |
| `ma_os_name` | String | ОС устройства |
| `ma_geo_city_name` | String | Город пользователя |
| `CD1`--`CD10` | String | Пользовательские параметры |

### Дополнительные поля (из практики, не в official docs)

| Поле | Тип | Описание |
|------|-----|----------|
| `abVariant` | String | Список всех AB-флагов через запятую |
| `ma_event_name` | String | Имя события |
| `ma_event_action` | String | Действие события |
| `ma_referer_host` | String | Домен реферера |
| `ma_user_age` | String | Возраст пользователя |
| `ma_user_sex` | String | Пол пользователя |
| `ma_geo_subdivision_name` | String | Регион пользователя |

## Поля для приложений (MOBILE_HIT)

### Идентификаторы

| Поле | Тип | Описание |
|------|-----|----------|
| `d:flowId` | UUID | Идентификатор потока |
| `d:hitId` | String | ID события |
| `d:sessionId` | String | ID сессии |
| `d:clientId` | String | ID клиента |

### Устройство

| Поле | Тип | Описание |
|------|-----|----------|
| `d:deviceType` | String | Тип устройства |
| `d:OSName` | String | Операционная система |
| `d:mobileOperator` | String | Мобильный оператор |

### Пользователь

| Поле | Тип | Описание |
|------|-----|----------|
| `d:userAge` | String | Возраст |
| `d:userSex` | String | Пол |

### Событие

| Поле | Тип | Описание |
|------|-----|----------|
| `d:hitName` | String | Название события |
| `d:hitType` | String | pageview / event / ecommerce |
| `d:hitDateTime` | DateTime | Время события (серверное) |
| `d:occurrenceDateTime` | DateTime | Время на клиенте |
| `d:UTCOffset` | String | Часовой пояс |

### Геолокация

| Поле | Тип | Описание |
|------|-----|----------|
| `d:cityName` | String | Город |
| `d:subdivisionName` | String | Регион |
| `d:countryISOCode` | String | Код страны (ISO) |

### Пользовательские параметры

| Поле | Тип | Описание |
|------|-----|----------|
| `CD1`--`CD10` | String | Пользовательские параметры |
| `CDUserID` | String | Экосистемный ID пользователя |
| `CDSessionID` | String | Экосистемный ID сессии |

### Ecommerce

| Поле | Тип | Описание |
|------|-----|----------|
| `d:hitRevenue` | Number | Выручка по событию |
| `d:hitCartItems` | String | Товары в корзине |
| `d:hitData` | String | Дополнительные данные события |

### UTM-параметры приложений

| Поле | Тип | Описание |
|------|-----|----------|
| `d:UTMSource` | String | Источник трафика |
| `d:UTMMedium` | String | Канал |
| `d:UTMCampaign` | String | Кампания |
| `d:UTMContent` | String | Содержание объявления |
| `d:UTMTerm` | String | Ключевое слово |

## Отличия: сайты vs приложения

| Аспект | Сайты (WEB_HIT/SESSION) | Приложения (MOBILE_HIT) |
|--------|-------------------------|-------------------------|
| Идентификатор пользователя | `ma_client_id` (cookie) | `d:clientId` |
| Идентификатор сессии | `ma_session_id` | `d:sessionId` |
| URL-информация | `ma_url_host`, `ma_url_path` | -- |
| Браузер | `ma_browser_name` | -- |
| Мобильный оператор | -- | `d:mobileOperator` |
| Демография | `ma_user_age`, `ma_user_sex` (из практики) | `d:userAge`, `d:userSex` |
| UTM-параметры | Через CD или стандартные поля | `d:UTMSource`, `d:UTMMedium` и др. |
| Ecommerce | Ограниченно | `d:hitRevenue`, `d:hitCartItems`, `d:hitData` |

## Примечание

Official docs содержат выборку полей, не полный справочник. Для полного перечня -- запросить Postman-коллекцию `Data_API_v2.json` через `analytics.support@mts.ru`.
