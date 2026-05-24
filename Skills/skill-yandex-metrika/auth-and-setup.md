# Авторизация и настройка окружения

## Назначение

Процедура получения OAuth-токена Яндекс Метрики, настройки `.env` файла и справочник по ошибкам авторизации.

## Хост API

```
https://api-metrika.yandex.net
```

## OAuth scopes

| Scope | Описание |
|-------|----------|
| `metrika:read` | Получение статистики, чтение параметров счётчиков |
| `metrika:write` | Создание счётчиков, изменение параметров, загрузка данных |
| `metrika:expenses` | Загрузка расходов |
| `metrika:user_params` | Загрузка параметров пользователей |
| `metrika:offline_data` | Загрузка офлайн-данных (CRM, конверсии, звонки) |
| `passport:business` | Организационные логины |

## Процесс получения токена

### Шаг 1. Регистрация приложения

1. Открыть https://oauth.yandex.ru/?dialog=create-client-entry
2. Выбрать тип «Для доступа к API или отладки»
3. Заполнить название и почту
4. Выбрать требуемые scopes (минимум `metrika:read`)
5. Скопировать `ClientID` приложения

> Документация: https://yandex.ru/dev/id/doc/ru/register-client

### Шаг 2. Получение токена

Вариант A — implicit flow (быстрый, для личного использования):

```
https://oauth.yandex.ru/authorize?response_type=token&client_id=<ClientID>
```

Открыть в браузере, авторизоваться, скопировать токен из URL.

Вариант B — authorization_code (для серверных интеграций):

1. Получить code:
```
https://oauth.yandex.ru/authorize?response_type=code&client_id=<ClientID>
```

2. Обменять code на токен:
```
POST https://oauth.yandex.ru/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=<CODE>&client_id=<ClientID>&client_secret=<ClientSecret>
```

В ответе: `access_token`, `expires_in`.

### Шаг 3. Использование токена

Заголовки в каждом запросе:

```
Authorization: OAuth <access_token>
Content-Type: application/x-yametrika+json
```

Пример запроса:

```
GET /management/v1/counters HTTP/1.1
Host: api-metrika.yandex.net
Authorization: OAuth 05dd3dd84ff948fdae2bc4fb91f13e22...
```

## Формат .env файла

```
YM_TOKEN=y0_AgAAAA...
YM_COUNTER=12345678
```

## Content-Type

`application/x-yametrika+json` (для POST/PUT запросов к Management API)

## Коды ошибок

Формат ошибки:

```json
{
  "errors": [
    {
      "error_type": "invalid_parameter",
      "message": "...",
      "location": "..."
    }
  ],
  "code": 400,
  "message": "..."
}
```

Типы ошибок:

| error_type | HTTP | Описание |
|------------|------|----------|
| `backend_error` | 503 | Сбой на сервере, повторите позже |
| `invalid_parameter` | 400 | Неверный параметр |
| `not_found` | 404 | Объект не найден |
| `missing_parameter` | 400 | Отсутствует обязательный параметр |
| `filter_limits` | 400 | Превышена сложность фильтра |
| `access_denied` | 403 | Доступ запрещён |
| `counter_in_connect` | 403 | Счётчик привязан к Яндекс Коннекту |
| `invalid_token` | 403 | Некорректный OAuth-токен |
| `unauthorized` | 401 | Не авторизован |
| `quota_requests_by_uid` | 429 | Суточная квота запросов |
| `quota_delegate_requests` | 429 | Часовая квота на представителей |
| `quota_grants_requests` | 429 | Часовая квота на доступы |
| `quota_requests_by_ip` | 429 | Секундная квота по IP |
| `quota_parallel_requests` | 429 | Квота на параллельные запросы |
| `quota_requests_by_counter_id` | 429 | Суточная квота для счётчика |
| `query_error` | 400 | Запрос слишком сложен |
| `too_much_rows` | 400 | Избыточный объём данных |
| `conflict` | 409 | Нарушена целостность данных |
| `not_acceptable` | 406 | Неподдерживаемый формат |
| `timeout` | 504 | Истёк лимит времени |
| `invalid_uploading` | 400 | Ошибка загрузки файла |
| `invalid_json` | 400 | Неверный формат JSON |
| `limit_exceeded` | 400 | Превышены ограничения на цели/фильтры |
