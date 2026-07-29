---
name: skill-yandex-metrika
description: >
  Справочник API Яндекс Метрики для Claude Code агентов — Logs API (сырые данные
  визитов и хитов), API отчётов (агрегированные данные с группировками и метриками),
  API управления (счётчики, цели, сегменты). Включает справочник полей, Python-сниппеты
  для выгрузки данных, конвертации TSV в CSV, обработки через pandas. Покрывает
  авторизацию OAuth, работу с квотами, обработку ошибок.
when_to_use: >
  Когда нужно: выгрузить данные из Яндекс Метрики, построить отчёт по метрикам
  и группировкам, получить список полей визитов или хитов, написать Python-скрипт
  для Logs API, настроить OAuth-токен Метрики, управлять счётчиками или целями,
  понять ограничения API. Примеры: "выгрузи визиты из Метрики", "какие поля есть
  в Logs API", "напиши скрипт выгрузки", "настрой доступ к Метрике".
version: 2.1.0
created: 2026-05-24
---

# Yandex Metrika API

## Назначение

Справочник для работы с API Яндекс Метрики. Описывает три API (Logs API, отчёты, управление), 250+ полей данных, авторизацию OAuth и Python-паттерны для выгрузки и обработки данных.

## Принципы

1. **Хост — `.net`:** Все запросы к `api-metrika.yandex.net` (не `.ru`).
2. **Токен в заголовке:** `Authorization: OAuth <token>`, не в query-параметрах.
3. **date2 < today:** В Logs API конец периода не может быть текущим днём.
4. **Всегда clean:** После скачивания лога вызывать `clean` для освобождения квоты (в `finally`-блоке).
5. **TSV -> CSV:** Logs API отдаёт TSV. Конвертировать в CSV с `QUOTE_ALL` из-за запятых в goalsID.
6. **Не смешивать sources:** Поля `ym:s:` (visits) и `ym:pv:` (hits) — в разных запросах.

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Первое подключение к API | [auth-and-setup.md](auth-and-setup.md) | [gotchas.md](gotchas.md) |
| Выгрузить сырые данные (Logs API) | [logs-api.md](logs-api.md), [python-reference.md](python-reference.md) | [logs-api-fields.md](logs-api-fields.md), [gotchas.md](gotchas.md) |
| Выбрать поля для выгрузки | [logs-api-fields.md](logs-api-fields.md) | — |
| Построить агрегированный отчёт | [reports-api.md](reports-api.md) | [auth-and-setup.md](auth-and-setup.md) |
| Управлять счётчиками или целями | [management-api.md](management-api.md) | [auth-and-setup.md](auth-and-setup.md) |
| Написать Python-скрипт для Метрики | [python-reference.md](python-reference.md) | [logs-api.md](logs-api.md), [gotchas.md](gotchas.md) |
| Отладить ошибку API | [gotchas.md](gotchas.md) | [auth-and-setup.md](auth-and-setup.md) |

## Самопроверка при подключении

При первом обращении к задаче, связанной с Яндекс Метрикой, агент выполняет:

### Шаг 1: Проверить наличие окружения

```
Проверяю окружение для работы с Яндекс Метрикой...
```

1. Проверить наличие директории `scripts-metrika/` в проекте. Если нет — создать.
2. Проверить наличие файла `.env` в корне проекта. Если нет — создать с шаблоном:

```
YM_TOKEN=
YM_COUNTER=
```

3. Проверить, что `.env` содержит заполненные `YM_TOKEN` и `YM_COUNTER`. Если пустые — предупредить пользователя и дать инструкцию по получению токена (загрузить [auth-and-setup.md](auth-and-setup.md)).

### Шаг 2: Проверить зависимости Python

Проверить наличие `requests` и `python-dotenv`:

```bash
python3 -c "import requests; from dotenv import load_dotenv; print('OK')"
```

Если не установлены — предложить:

```bash
pip install requests python-dotenv
```

### Шаг 3: Подтвердить готовность

```
Скилл Yandex Metrika API подключён.

Окружение:
- scripts-metrika/ — ОК
- .env — [заполнен / ТРЕБУЕТСЯ ЗАПОЛНИТЬ]
- requests, python-dotenv — [установлены / ТРЕБУЕТСЯ УСТАНОВИТЬ]

Готов к работе с API Метрики. Для начала — опиши задачу.
```

## Рабочий процесс

### Шаг 1: Определить тип задачи

По запросу пользователя определи, какой API нужен:
- **Сырые данные** (по визиту/хиту) → Logs API → загрузить [logs-api.md](logs-api.md) + [python-reference.md](python-reference.md)
- **Агрегированные данные** (сумма визитов, средний показатель отказов) → API отчётов → загрузить [reports-api.md](reports-api.md)
- **Управление** (создать счётчик, посмотреть цели) → API управления → загрузить [management-api.md](management-api.md)

### Шаг 2: Загрузить нужные файлы

По таблице маршрутизации загрузить минимум. Если задача неясна — начать с [auth-and-setup.md](auth-and-setup.md).

### Шаг 3: Выполнить задачу

- Для Logs API: генерировать Python-скрипт по шаблону из [python-reference.md](python-reference.md)
- Для отчётов: сформировать URL запроса с нужными параметрами
- Для управления: показать нужный эндпоинт и пример запроса

### Шаг 4: Именование файлов выгрузки

Все выгрузки именуются по паттерну: `YYYY-MM-DD-HH-MM-SS-metrika_data.csv` (или `.tsv`).

```python
from datetime import datetime
timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
filename = f"{timestamp}-metrika_data.csv"
```

Выгрузки сохраняются в `scripts-metrika/result/`.

## Механика работы с Python-скриптами

Скилл НЕ содержит готовых `.py`-файлов. Вместо этого:

1. Агент **генерирует скрипт** на основе шаблона из [python-reference.md](python-reference.md), подставляя нужные поля, период и параметры.
2. Скрипт сохраняется в `scripts-metrika/` проекта пользователя.
3. Агент запускает скрипт через `python3 scripts-metrika/<script_name>.py`.
4. Результат сохраняется в `scripts-metrika/result/`.

Это лучше, чем хранить .py-файлы в скилле, потому что:
- Каждая выгрузка уникальна (разные поля, периоды, фильтры)
- Агент адаптирует скрипт под конкретную задачу
- Не нужно копировать файлы между директориями

## Что НЕ делать

- Не загружать все файлы скилла сразу — только нужные под задачу
- Не использовать хост `.ru` (только `.net`)
- Не ставить `date2 = today` в Logs API
- Не забывать `clean` после скачивания лога
- Не смешивать поля `ym:s:` и `ym:pv:` в одном запросе
- Не хардкодить токен — только через `.env`
- Не использовать `populate: '*'`-аналог — запрашивать только нужные поля
- Не ставить пробелы между полями в параметре `fields`

## Примеры

### Пример 1: Выгрузка визитов (типовой)

**Запрос:** "Выгрузи данные визитов за апрель с полями экрана и ОС"

**Маршрут:** [logs-api.md](logs-api.md), [python-reference.md](python-reference.md), при выборе полей — [logs-api-fields.md](logs-api-fields.md)

**Результат:** Агент генерирует скрипт с полями `visitID, dateTime, operatingSystem, deviceCategory, screenWidth, screenHeight, physicalScreenWidth, physicalScreenHeight`, period `2026-04-01..2026-04-30`, запускает, сохраняет CSV в `scripts-metrika/result/`.

### Пример 2: Ошибка API (edge-case)

**Запрос:** "Скрипт выдаёт ошибку 429"

**Маршрут:** [gotchas.md](gotchas.md), [auth-and-setup.md](auth-and-setup.md)

**Результат:** Агент объясняет квоты (429 = rate limit), проверяет наличие незавершённых запросов через `GET /logrequests`, предлагает clean или ожидание.

### Пример 3: Агрегированный отчёт без Python

**Запрос:** "Покажи визиты по браузерам за последнюю неделю"

**Маршрут:** [reports-api.md](reports-api.md)

**Результат:** Агент формирует curl/запрос к `stat/v1/data` с `dimensions=ym:s:browser&metrics=ym:s:visits` без генерации Python-скрипта.
