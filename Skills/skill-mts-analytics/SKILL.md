---
name: skill-mts-analytics
description: >
  Справочник Data API МТС Аналитики для Claude Code агентов. Покрывает Data API
  (асинхронный экспорт сырых событий WEB_HIT, SESSION, MOBILE_HIT в CSV через gzip),
  API Link Manager (короткие ссылки с перенаправлением). Включает авторизацию Bearer token,
  справочник полей CSV для сайтов и приложений, Python-сниппеты полного цикла выгрузки
  (create task, poll, download, parse), подводные камни (cooldown, partial downloads,
  date format, 429).
when_to_use: >
  Когда нужно: выгрузить данные из МТС Аналитики, создать задачу экспорта Data API,
  скачать CSV из МТС, написать Python-скрипт для Data API, настроить Bearer token,
  создать короткую ссылку МТС, узнать поля CSV-выгрузки, отладить ошибку Data API.
  Примеры: "выгрузи данные из МТС Аналитики", "Data API МТС", "создай задачу экспорта",
  "скачать CSV из МТС", "короткая ссылка МТС".
version: 2.0.0
created: 2026-05-24
---

# MTS Analytics API

## Назначение

Справочник для работы с Data API МТС Аналитики. Описывает два API: Data API (асинхронный экспорт сырых событий в CSV) и API Link Manager (короткие ссылки). Включает авторизацию, справочник полей, Python-паттерны выгрузки и обработки данных.

## Принципы

1. **Базовый URL:** `https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/` (official docs). Альтернативный gateway: `https://api.mts.ru/mtsa-data-api/2/v2/`.
2. **Токен в заголовке:** `Authorization: Bearer {{TOKEN}}`.
3. **Async-only:** Data API работает асинхронно -- создать задачу, ждать готовности, скачать результат.
4. **Cooldown:** ~10 мин между созданием задач. При 429 -- exponential backoff.
5. **CSV через gzip:** Ответ -- gz CSV. Всегда верифицировать целостность после скачивания.

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Первое подключение к API | [auth-and-setup.md](auth-and-setup.md) | [gotchas.md](gotchas.md) |
| Создать задачу экспорта | [data-api.md](data-api.md) | [auth-and-setup.md](auth-and-setup.md) |
| Выбрать поля для выгрузки | [data-api-fields.md](data-api-fields.md) | -- |
| Скачать и обработать CSV | [data-api.md](data-api.md), [python-reference.md](python-reference.md) | [gotchas.md](gotchas.md) |
| Создать короткую ссылку | [link-manager-api.md](link-manager-api.md) | [auth-and-setup.md](auth-and-setup.md) |
| Написать Python-скрипт для выгрузки | [python-reference.md](python-reference.md) | [data-api.md](data-api.md), [data-api-fields.md](data-api-fields.md), [gotchas.md](gotchas.md) |
| Отладить ошибку API | [gotchas.md](gotchas.md) | [auth-and-setup.md](auth-and-setup.md), [data-api.md](data-api.md) |

## Самопроверка при подключении

При первом обращении к задаче, связанной с МТС Аналитикой, агент выполняет:

### Шаг 1: Проверить наличие окружения

```
Проверяю окружение для работы с МТС Аналитикой...
```

1. Проверить наличие директории `scripts-mts-analytics/` и `scripts-mts-analytics/result/` в проекте. Если нет -- создать.
2. Проверить наличие файла `.env` в корне проекта. Если нет -- создать с шаблоном:

```
MTS_ANALYTICS_TOKEN=
MTS_ANALYTICS_FLOW_ID=
```

3. Проверить, что `.env` содержит заполненные `MTS_ANALYTICS_TOKEN` и `MTS_ANALYTICS_FLOW_ID`. Если пустые -- предупредить пользователя и дать инструкцию по получению (загрузить [auth-and-setup.md](auth-and-setup.md)).

### Шаг 2: Проверить зависимости Python

Проверить наличие `requests` и `python-dotenv`:

```bash
python3 -c "import requests; from dotenv import load_dotenv; print('OK')"
```

Если не установлены -- предложить:

```bash
pip install requests python-dotenv
```

### Шаг 3: Проверить доступ к API

Тестовый запрос:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $MTS_ANALYTICS_TOKEN" \
  "https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/dataexporttasks?size=1"
```

Ожидаемый ответ: 200. Если 401 -- токен истёк, направить к [auth-and-setup.md](auth-and-setup.md).

### Шаг 4: Подтвердить готовность

```
Скилл MTS Analytics API подключён.

Окружение:
- scripts-mts-analytics/ -- ОК
- .env -- [заполнен / ТРЕБУЕТСЯ ЗАПОЛНИТЬ]
- requests, python-dotenv -- [установлены / ТРЕБУЕТСЯ УСТАНОВИТЬ]
- API доступ -- [ОК / ТРЕБУЕТСЯ ТОКЕН]

Готов к работе с Data API. Для начала -- опиши задачу.
```

## Рабочий процесс

### Шаг 1: Определить тип задачи

По запросу пользователя определи, какой API нужен:
- **Экспорт данных** (сырые события, сессии) -> Data API -> загрузить [data-api.md](data-api.md) + [python-reference.md](python-reference.md)
- **Короткие ссылки** (создание, управление) -> Link Manager -> загрузить [link-manager-api.md](link-manager-api.md)

### Шаг 2: Загрузить нужные файлы

По таблице маршрутизации загрузить минимум. Если задача неясна -- начать с [auth-and-setup.md](auth-and-setup.md).

### Шаг 3: Выполнить задачу

- Для Data API: генерировать Python-скрипт по шаблону из [python-reference.md](python-reference.md)
- Для Link Manager: показать нужный эндпоинт и пример запроса

### Шаг 4: Именование файлов выгрузки

Все выгрузки именуются по паттерну: `YYYY-MM-DD-HH-MM-SS-mts_data.csv`.

```python
from datetime import datetime
timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
filename = f"{timestamp}-mts_data.csv"
```

Выгрузки сохраняются в `scripts-mts-analytics/result/`.

## Механика работы с Python-скриптами

Скилл НЕ содержит готовых `.py`-файлов. Вместо этого:

1. Агент **генерирует скрипт** на основе шаблона из [python-reference.md](python-reference.md), подставляя нужные поля, период и параметры.
2. Скрипт сохраняется в `scripts-mts-analytics/` проекта пользователя.
3. Агент запускает скрипт через `python3 scripts-mts-analytics/<script_name>.py`.
4. Результат сохраняется в `scripts-mts-analytics/result/`.

Это лучше, чем хранить .py-файлы в скилле, потому что:
- Каждая выгрузка уникальна (разные поля, периоды, фильтры)
- Агент адаптирует скрипт под конкретную задачу
- Не нужно копировать файлы между директориями

## Что НЕ делать

- Не загружать все файлы скилла сразу -- только нужные под задачу
- Не использовать SPA-internal API (эндпоинты `/api/ra/`, `/api/rm/`) -- они требуют browser session, не документированы публично
- Не хардкодить токен -- только через `.env`
- Не создавать новую задачу раньше чем через ~10 мин после предыдущей
- Не скачивать части параллельно больше 2-3 (429)
- Не использовать формат даты без времени (только ISO 8601 datetime)
- Не забывать верифицировать gz-файлы после скачивания (бывают truncated)

## Примеры

### Пример 1: Выгрузка событий (типовой)

**Запрос:** "Выгрузи события за апрель"

**Маршрут:** [data-api.md](data-api.md), [python-reference.md](python-reference.md)

**Результат:** Агент генерирует Python-скрипт с `event: WEB_HIT`, period `2026-04-01T00:00:00+03:00..2026-05-01T00:00:00+03:00`, запускает, скачивает gz-части, парсит CSV, сохраняет в `scripts-mts-analytics/result/`.

### Пример 2: Задача зависла (edge-case)

**Запрос:** "Задача зависла в IN_PROGRESS уже 30 минут"

**Маршрут:** [gotchas.md](gotchas.md), [data-api.md](data-api.md)

**Результат:** Агент проверяет статус задачи через `GET /dataexporttasks/{taskId}`. Если IN_PROGRESS > 30 мин -- рекомендует создать новую задачу (после cooldown). Если FAILED -- проверяет параметры запроса. Если RESULT_CLEANED_AS_TOO_OLD -- объясняет что результат удаляется через 24 часа.

### Пример 3: Короткая ссылка (Link Manager)

**Запрос:** "Создай короткую ссылку для рекламной кампании"

**Маршрут:** [link-manager-api.md](link-manager-api.md)

**Результат:** Агент показывает процедуру: создание шаблона (Template), затем создание ссылки (Link) с `mediaSource` для атрибуции трафика. Указывает формат URL: `https://<subdomain>.<domain>/<alias>`.
