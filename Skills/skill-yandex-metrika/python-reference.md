# Python-сниппеты

## Назначение

Готовые к использованию Python-сниппеты для работы с API Яндекс Метрики: конфигурация, полный цикл Logs API, конвертация TSV->CSV, обработка данных через pandas.

> Все сниппеты извлечены из рабочих скриптов, протестированных на реальных данных Яндекс Метрики. Код готов к использованию — подставить свои TOKEN, COUNTER, период и поля.

## 1. Базовая конфигурация

### 1.1. Загрузка .env и константы

```python
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# .env лежит в корне проекта, скрипт — в scripts-metrika/
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

TOKEN = os.getenv("YM_TOKEN")
COUNTER = os.getenv("YM_COUNTER")

if not TOKEN or not COUNTER:
    sys.exit("[FAIL] YM_TOKEN и/или YM_COUNTER не заданы в .env")

# Хост — именно .net, НЕ .ru
HOST = "https://api-metrika.yandex.net"
BASE = f"{HOST}/management/v1/counter/{COUNTER}"
HEADERS = {"Authorization": f"OAuth {TOKEN}"}
```

Формат `.env`:
```
YM_TOKEN=y0_AgAAAA...
YM_COUNTER=12345678
```

### 1.2. Универсальный API-клиент с retry и backoff

```python
import time
import requests

MAX_RETRIES = 5

def _request_with_retry(
    method: str,
    url: str,
    *,
    params: dict | None = None,
    timeout: int = 30,
    stream: bool = False,
    max_retries: int = MAX_RETRIES,
) -> requests.Response:
    """HTTP-запрос с retry при 429 / 5xx / таймаутах.
    Backoff: экспоненциальный, начиная с 5с (сеть) или 10с (429).
    """
    for attempt in range(max_retries):
        try:
            r = requests.request(
                method, url,
                headers=HEADERS,
                params=params,
                timeout=timeout,
                stream=stream,
            )
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait = 2 ** attempt * 5
                print(f"  Timeout, retry {attempt + 1}/{max_retries} через {wait}с...")
                time.sleep(wait)
                continue
            raise
        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                wait = 2 ** attempt * 5
                print(f"  ConnectionError, retry {attempt + 1}/{max_retries} через {wait}с...")
                time.sleep(wait)
                continue
            raise

        # 429 — Too Many Requests, удлинённый backoff
        if r.status_code == 429:
            wait = 2 ** attempt * 10  # 10, 20, 40, 80, 160
            print(f"  429 Too Many Requests, жду {wait}с... (попытка {attempt + 1}/{max_retries})")
            time.sleep(wait)
            continue

        # 5xx — серверная ошибка, стандартный backoff
        if r.status_code >= 500:
            wait = 2 ** attempt * 5
            print(f"  {r.status_code} Server Error, жду {wait}с... (попытка {attempt + 1}/{max_retries})")
            time.sleep(wait)
            continue

        # Терминальные ошибки авторизации — retry бесполезен
        if r.status_code == 401:
            sys.exit("[FAIL] 401 Unauthorized — токен невалиден или истёк.")
        if r.status_code == 403:
            sys.exit(f"[FAIL] 403 Forbidden: {r.text[:300]}")

        r.raise_for_status()
        return r

    raise RuntimeError(f"Не удалось выполнить запрос после {max_retries} попыток: {method} {url}")


def api_get(path: str, params: dict | None = None, timeout: int = 30, stream: bool = False) -> requests.Response:
    return _request_with_retry("GET", f"{BASE}{path}", params=params, timeout=timeout, stream=stream)


def api_post(path: str, params: dict | None = None, timeout: int = 30) -> requests.Response:
    return _request_with_retry("POST", f"{BASE}{path}", params=params, timeout=timeout)
```

## 2. Logs API — полный цикл

### 2.1. evaluate() — проверка квоты

```python
def evaluate(date1: str, date2: str, fields_str: str, source: str = "visits") -> dict:
    """Проверить, помещается ли выгрузка в квоту."""
    params = {
        "date1": date1,
        "date2": date2,
        "fields": fields_str,
        "source": source,
    }
    r = api_get("/logrequests/evaluate", params=params)
    data = r.json()
    evaluation = data.get("log_request_evaluation", data)
    possible = evaluation.get("possible")
    max_days = evaluation.get("max_possible_day_quantity", "?")

    print(f"  Период:            {date1} .. {date2}")
    print(f"  Выгрузка возможна: {possible}")
    print(f"  Макс. дней:        {max_days}")

    if not possible:
        sys.exit(f"[FAIL] evaluate вернул possible=False. Ответ: {data}")

    return data
```

### 2.2. create_request() — создание запроса лога

```python
def create_request(date1: str, date2: str, fields_str: str, source: str = "visits") -> int:
    """Создать запрос лога. Возвращает request_id."""
    params = {
        "date1": date1,
        "date2": date2,
        "fields": fields_str,
        "source": source,
    }
    r = api_post("/logrequests", params=params)
    log_request = r.json().get("log_request", r.json())
    req_id: int = log_request["request_id"]
    status = log_request.get("status", "?")
    print(f"  request_id = {req_id}, status = {status}")
    return req_id
```

### 2.3. wait_until_ready() — поллинг статуса

```python
def wait_until_ready(req_id: int, poll_sec: int = 15, timeout_sec: int = 3600) -> list[int]:
    """Поллить статус до 'processed'. Возвращает список part_number."""
    waited = 0

    while waited < timeout_sec:
        r = api_get(f"/logrequest/{req_id}")
        lr = r.json().get("log_request", r.json())
        status = lr["status"]

        if status == "processed":
            parts = [p["part_number"] for p in lr.get("parts", [])]
            if not parts:
                parts = [0]
            print(f"\n  Лог готов. Частей: {len(parts)}")
            return parts

        # Терминальные статусы — выгрузка невозможна
        if status in ("canceled", "processing_failed", "cleaned_by_user", "cleaning_in_progress"):
            raise RuntimeError(f"Запрос завершился со статусом: {status}")

        elapsed_min = waited // 60
        elapsed_sec = waited % 60
        print(f"  status={status}  ({elapsed_min}м {elapsed_sec}с)")
        time.sleep(poll_sec)
        waited += poll_sec

    raise TimeoutError(f"Лог не подготовился за {timeout_sec}с")
```

### 2.4. download_part_to_file() — стриминг с конвертацией TSV->CSV

```python
import csv

def download_part_to_file(
    req_id: int,
    part_number: int,
    csv_writer: csv.writer,
    is_first_part: bool,
) -> int:
    """Скачать часть стримингом, конвертировать TSV -> CSV на лету.
    Возвращает количество записанных строк данных (без заголовка).
    """
    print(f"  Скачиваю часть {part_number}...", end="", flush=True)

    r = api_get(
        f"/logrequest/{req_id}/part/{part_number}/download",
        timeout=600,
        stream=True,
    )

    rows_written = 0
    is_header = True

    for line in r.iter_lines(decode_unicode=True):
        if not line:
            continue

        fields = line.split("\t")

        if is_header:
            is_header = False
            if is_first_part:
                # Записать заголовки без ym:s: префикса
                clean_headers = [f.replace("ym:s:", "") for f in fields]
                csv_writer.writerow(clean_headers)
            # Для последующих частей — пропустить заголовок
            continue

        csv_writer.writerow(fields)
        rows_written += 1

        # Прогресс каждые 100K строк
        if rows_written % 100_000 == 0:
            print(f" {rows_written // 1000}K", end="", flush=True)

    print(f" -> {rows_written} строк")
    return rows_written
```

### 2.5. clean_request() — очистка (освобождение квоты)

```python
def clean_request(req_id: int) -> None:
    """Удалить подготовленный лог, освободить квоту."""
    try:
        api_post(f"/logrequest/{req_id}/clean")
        print("  Лог очищен, квота освобождена.")
    except Exception as e:
        print(f"  [WARN] Не удалось очистить лог: {e}")
```

### 2.6. Проверка незавершённых запросов

```python
def check_pending_requests() -> None:
    """Проверить наличие незавершённых запросов. Предупредить, если есть."""
    r = api_get("/logrequests")
    data = r.json()
    requests_list = data.get("requests", [])

    active = [
        req for req in requests_list
        if req.get("status") in ("created", "processed")
    ]
    if active:
        print(f"\n[WARN] Найдено {len(active)} незавершённых запросов:")
        for req in active:
            rid = req.get("request_id")
            st = req.get("status")
            d1 = req.get("date1", "?")
            d2 = req.get("date2", "?")
            print(f"  request_id={rid}  status={st}  period={d1}..{d2}")
```

### 2.7. Обработка прерываний (try/finally + clean)

Паттерн гарантирует вызов clean даже при Ctrl+C:

```python
req_id = create_request(DATE1, DATE2, FIELDS_STR)
total_rows = 0

try:
    parts = wait_until_ready(req_id)

    # Подготовка файла
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    output_path = OUTPUT_DIR / f"{timestamp}-metrika_data.csv"

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)

        for i, part_num in enumerate(parts):
            rows = download_part_to_file(req_id, part_num, writer, is_first_part=(i == 0))
            total_rows += rows

except KeyboardInterrupt:
    print("\n\n[!] Прервано пользователем (Ctrl+C). Выполняю clean...")
except Exception as e:
    print(f"\n[FAIL] Ошибка при скачивании: {e}")
finally:
    # ВСЕГДА вызывать clean, иначе квота останется занятой
    clean_request(req_id)
```

## 3. Конвертация TSV->CSV

**Зачем нужна конвертация:**

Logs API отдаёт данные в формате **TSV** (tab-separated). Проблема: поле `goalsID` содержит JSON-массив вида `[12345,67890]` — запятые внутри значения ломают наивный CSV-парсинг. Решение — при записи в CSV использовать `csv.QUOTE_ALL`, который оборачивает каждое значение в кавычки.

**Паттерн конвертации:**

```python
import csv

# При создании csv.writer — обязательно QUOTE_ALL
writer = csv.writer(f, quoting=csv.QUOTE_ALL)

# TSV-строка -> CSV-строка
fields = tsv_line.split("\t")
csv_writer.writerow(fields)
```

**Очистка заголовков от префиксов:**

В TSV от API заголовки приходят с префиксами `ym:s:` (визиты) или `ym:pv:` (хиты). Для удобства анализа — убираем:

```python
# "ym:s:visitID" -> "visitID"
# "ym:s:goalsID" -> "goalsID"
clean_headers = [f.replace("ym:s:", "") for f in raw_headers]
```

## 4. Обработка данных

### 4.1. Чтение большого CSV через pandas

```python
import pandas as pd

df = pd.read_csv(
    csv_path,
    dtype={
        "visitID": "str",
        "clientID": "str",
        "screenWidth": "Int64",       # Nullable int — важно для пустых значений
        "screenHeight": "Int64",
        "physicalScreenWidth": "Int64",
        "physicalScreenHeight": "Int64",
        "windowClientWidth": "Int64",
        "windowClientHeight": "Int64",
        "bounce": "Int64",
        "pageViews": "Int64",
        "visitDuration": "float64",
        "goalsID": "str",             # JSON-массив как строка
        "operatingSystem": "str",
        "deviceCategory": "Int64",    # Числовой код: 1=desktop, 2=mobile, 3=tablet
        "browser": "str",
        "dateTime": "str",
    },
)
```

Важно: `Int64` (с большой I) — nullable integer тип pandas. Обычный `int64` упадёт на строках с пустыми значениями.

### 4.2. Парсинг goalsID

Поле `goalsID` приходит как строка вида `[12345,67890]` или `[]`. Два подхода:

Подход 1: str.contains с regex (быстрый, для проверки наличия конкретной цели):

```python
# Проверить, содержит ли визит цель с ID 345202883
# Паттерн: goal_id окружён нецифровыми символами (или начало/конец строки)
goal_id = 345202883
pattern = rf"(?:^|\D){goal_id}(?:\D|$)"
df["has_goal"] = df["goalsID"].str.contains(pattern, regex=True, na=False)
```

Подход 2: json.loads (точный, для полного парсинга массива):

```python
import json

def parse_goals(goals_str: str) -> list[int]:
    """'[12345,67890]' -> [12345, 67890]; '[]' -> []"""
    try:
        return json.loads(goals_str)
    except (json.JSONDecodeError, TypeError):
        return []

df["goals_list"] = df["goalsID"].apply(parse_goals)
```

### 4.3. Фильтрация и группировка

```python
# Фильтр: Windows desktop
win_desktop_mask = (
    df["operatingSystem"].str.startswith("windows", na=False)
    & (df["deviceCategory"] == 1)
)
df_win = df[win_desktop_mask].copy()

# Вычисление DPR
df_win["dpr"] = (df_win["physicalScreenWidth"] / df_win["screenWidth"]).round(2)

# Группировка по бакетам
def classify_dpr(dpr: float) -> str:
    if 0.95 <= dpr <= 1.05:
        return "1.0 (100%)"
    elif 1.20 <= dpr <= 1.30:
        return "1.25 (125%)"
    elif 1.45 <= dpr <= 1.55:
        return "1.5 (150%)"
    elif 1.95 <= dpr <= 2.05:
        return "2.0 (200%)"
    else:
        return "non-standard"

df_win["dpr_bucket"] = df_win["dpr"].apply(classify_dpr)

# Распределение по визитам
distribution = df_win["dpr_bucket"].value_counts()

# Распределение по уникальным клиентам
clients_by_bucket = df_win.groupby("dpr_bucket")["clientID"].nunique()

# Поведенческие метрики по группе
metrics = df_win.groupby("dpr_bucket").agg(
    visits=("visitID", "count"),
    bounce_rate=("bounce", "mean"),
    avg_pages=("pageViews", "mean"),
    avg_duration=("visitDuration", "mean"),
)
```

## 5. Подводные камни

Проверено на практике — эти ошибки ломали скрипты в реальных выгрузках:

### 5.1. date2 != today

`date2` не может быть текущим днём. API вернёт ошибку. Всегда `date2 <= вчера`.

```python
from datetime import date, timedelta

# Безопасное значение
yesterday = (date.today() - timedelta(days=1)).isoformat()

# Проверка перед запросом
if DATE2 >= date.today().isoformat():
    sys.exit(f"[FAIL] date2 ({DATE2}) >= сегодня. date2 должен быть < today.")
```

### 5.2. deviceCategory — числовой код

В сырых данных Logs API `deviceCategory` приходит **числом**, не строкой:

| Код | Значение |
|-----|----------|
| `1` | desktop  |
| `2` | mobile   |
| `3` | tablet   |

Фильтрация: `df["deviceCategory"] == 1`, **не** `== "desktop"`.

### 5.3. operatingSystem — snake_case

Значения ОС в Logs API — в snake_case без пробелов и версий: `windows`, `windows10`, `macos`, `android`, `ios`. **Не** "Windows 10", не "macOS".

Фильтрация Windows: `df["operatingSystem"].str.startswith("windows")`.

### 5.4. goalsID — JSON-массив в строке

Формат: `[345202883,317565372]` при наличии целей, `[]` при отсутствии. Это JSON-массив целых чисел внутри строкового поля. Содержит запятые — поэтому TSV->CSV конвертация обязательна с `QUOTE_ALL` (см. раздел 3).

### 5.5. screenWidth vs physicalScreenWidth

Контринтуитивные имена — проверено на реальных данных:

| Поле API | Фактическое содержимое |
|----------|------------------------|
| `ym:s:screenWidth` | Логические (CSS) пиксели |
| `ym:s:physicalScreenWidth` | Физические пиксели экрана |

**DPR = physicalScreenWidth / screenWidth** (физические / логические).

На десктопе `physicalScreenWidth >= screenWidth`. Если наоборот — аномалия.

### 5.6. Хост .net, не .ru

Правильный хост: `api-metrika.yandex.net`. В старых примерах встречается `.ru` — он может работать, но в актуальной документации используется `.net`.

### 5.7. Именование выходных файлов

Паттерн: `YYYY-MM-DD-HH-MM-SS-metrika_data.csv`

```python
from datetime import datetime

timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
filename = f"{timestamp}-metrika_data.csv"
```

### 5.8. Пробелы в fields

Перечислять поля строго через запятую **без пробелов**:

```python
# Правильно
FIELDS_STR = "ym:s:visitID,ym:s:dateTime,ym:s:screenWidth"

# Неправильно — может сломать запрос
FIELDS_STR = "ym:s:visitID, ym:s:dateTime, ym:s:screenWidth"
```

### 5.9. Смешение источников visits/hits

Нельзя в одном запросе мешать поля `ym:s:` (visits) и `ym:pv:` (hits). Один запрос — один source.

### 5.10. Забыли clean

Если не вызвать `clean` после скачивания, квота остаётся занятой. Новые запросы будут отклоняться. Всегда вызывать в `finally`-блоке.

## 6. Шаблон скрипта

Минимальный рабочий скрипт выгрузки. Копировать, менять FIELDS/DATE1/DATE2, запускать.

```python
"""
Выгрузка данных из Яндекс Метрики Logs API.

Жизненный цикл: evaluate -> create -> poll -> download (stream) -> clean.
Конвертация TSV -> CSV на лету.

Использование:
    1. Создать .env в корне проекта с YM_TOKEN и YM_COUNTER
    2. pip install requests python-dotenv
    3. python scripts-metrika/export_metrika.py

Что менять:
    - DATE1, DATE2 — период выгрузки (date2 < today)
    - FIELDS — нужные поля (список: https://yandex.ru/dev/metrika/ru/logs/fields/visits)
    - SOURCE — "visits" или "hits" (для hits поля начинаются с ym:pv:)
"""

import csv
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

# -- Конфигурация -------------------------------------------------------------

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

TOKEN = os.getenv("YM_TOKEN")
COUNTER = os.getenv("YM_COUNTER")

if not TOKEN or not COUNTER:
    sys.exit("[FAIL] YM_TOKEN и/или YM_COUNTER не заданы в .env")

HOST = "https://api-metrika.yandex.net"
BASE = f"{HOST}/management/v1/counter/{COUNTER}"
HEADERS = {"Authorization": f"OAuth {TOKEN}"}

# -- МЕНЯТЬ ТУТ ---------------------------------------------------------------

DATE1 = "2026-04-01"          # Начало периода
DATE2 = "2026-04-30"          # Конец периода (< today!)
SOURCE = "visits"              # "visits" или "hits"

# Поля выгрузки — менять под свою задачу
# Полный список: https://yandex.ru/dev/metrika/ru/logs/fields/visits
FIELDS = [
    "ym:s:visitID",
    "ym:s:clientID",
    "ym:s:dateTime",
    "ym:s:operatingSystem",
    "ym:s:deviceCategory",      # 1=desktop, 2=mobile, 3=tablet
    "ym:s:browser",
    "ym:s:screenWidth",         # Логические (CSS) пиксели
    "ym:s:screenHeight",
    "ym:s:physicalScreenWidth",  # Физические пиксели
    "ym:s:physicalScreenHeight",
    "ym:s:windowClientWidth",    # Viewport браузера
    "ym:s:windowClientHeight",
    "ym:s:bounce",
    "ym:s:pageViews",
    "ym:s:visitDuration",
    "ym:s:goalsID",              # JSON-массив [id1,id2] — внимание, содержит запятые!
]
FIELDS_STR = ",".join(FIELDS)

OUTPUT_DIR = Path(__file__).resolve().parent / "result"
MAX_RETRIES = 5

# -- API-клиент с retry --------------------------------------------------------


def _request_with_retry(
    method: str,
    url: str,
    *,
    params: dict | None = None,
    timeout: int = 30,
    stream: bool = False,
) -> requests.Response:
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.request(
                method, url,
                headers=HEADERS, params=params,
                timeout=timeout, stream=stream,
            )
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt * 5
                print(f"  Сетевая ошибка, retry через {wait}с...")
                time.sleep(wait)
                continue
            raise

        if r.status_code == 429:
            wait = 2 ** attempt * 10
            print(f"  429 Too Many Requests, жду {wait}с...")
            time.sleep(wait)
            continue
        if r.status_code >= 500:
            wait = 2 ** attempt * 5
            print(f"  {r.status_code} Server Error, жду {wait}с...")
            time.sleep(wait)
            continue
        if r.status_code == 401:
            sys.exit("[FAIL] 401 — токен невалиден или истёк.")
        if r.status_code == 403:
            sys.exit(f"[FAIL] 403: {r.text[:300]}")

        r.raise_for_status()
        return r

    raise RuntimeError(f"Не удалось выполнить запрос после {MAX_RETRIES} попыток")


def api_get(path: str, **kwargs) -> requests.Response:
    return _request_with_retry("GET", f"{BASE}{path}", **kwargs)


def api_post(path: str, **kwargs) -> requests.Response:
    return _request_with_retry("POST", f"{BASE}{path}", **kwargs)


# -- Жизненный цикл Logs API --------------------------------------------------


def evaluate() -> None:
    r = api_get("/logrequests/evaluate", params={
        "date1": DATE1, "date2": DATE2, "fields": FIELDS_STR, "source": SOURCE,
    })
    ev = r.json().get("log_request_evaluation", r.json())
    print(f"  Evaluate: possible={ev.get('possible')}, max_days={ev.get('max_possible_day_quantity')}")
    if not ev.get("possible"):
        sys.exit(f"[FAIL] Квота не позволяет выгрузку: {r.json()}")


def create_request() -> int:
    r = api_post("/logrequests", params={
        "date1": DATE1, "date2": DATE2, "fields": FIELDS_STR, "source": SOURCE,
    })
    lr = r.json().get("log_request", r.json())
    req_id = lr["request_id"]
    print(f"  Created request_id={req_id}, status={lr.get('status')}")
    return req_id


def wait_until_ready(req_id: int, poll_sec: int = 15, timeout_sec: int = 3600) -> list[int]:
    waited = 0
    while waited < timeout_sec:
        r = api_get(f"/logrequest/{req_id}")
        lr = r.json().get("log_request", r.json())
        status = lr["status"]
        if status == "processed":
            parts = [p["part_number"] for p in lr.get("parts", [])]
            print(f"  Готов. Частей: {len(parts or [0])}")
            return parts or [0]
        if status in ("canceled", "processing_failed", "cleaned_by_user"):
            raise RuntimeError(f"Статус: {status}")
        print(f"  status={status} ({waited}с)")
        time.sleep(poll_sec)
        waited += poll_sec
    raise TimeoutError(f"Лог не готов за {timeout_sec}с")


def download_part(req_id: int, part: int, writer: csv.writer, first: bool) -> int:
    r = api_get(f"/logrequest/{req_id}/part/{part}/download", timeout=600, stream=True)
    rows = 0
    header_done = False
    for line in r.iter_lines(decode_unicode=True):
        if not line:
            continue
        fields = line.split("\t")
        if not header_done:
            header_done = True
            if first:
                writer.writerow([f.replace("ym:s:", "").replace("ym:pv:", "") for f in fields])
            continue
        writer.writerow(fields)
        rows += 1
    print(f"  Часть {part}: {rows} строк")
    return rows


def clean_request(req_id: int) -> None:
    try:
        api_post(f"/logrequest/{req_id}/clean")
        print("  Clean: квота освобождена")
    except Exception as e:
        print(f"  [WARN] Clean failed: {e}")


# -- Main ----------------------------------------------------------------------


def main() -> None:
    # Валидация date2
    if DATE2 >= date.today().isoformat():
        sys.exit(f"[FAIL] date2={DATE2} >= today. Должен быть < today.")

    print(f"Выгрузка: {COUNTER}, {DATE1}..{DATE2}, {len(FIELDS)} полей")

    evaluate()
    req_id = create_request()
    total = 0

    try:
        parts = wait_until_ready(req_id)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        ts = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        out = OUTPUT_DIR / f"{ts}-metrika_data.csv"

        with open(out, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f, quoting=csv.QUOTE_ALL)
            for i, p in enumerate(parts):
                total += download_part(req_id, p, w, first=(i == 0))

        size_mb = out.stat().st_size / (1024 * 1024)
        print(f"\nГотово: {out} ({size_mb:.1f} MB, {total:,} строк)")

    except KeyboardInterrupt:
        print("\nПрервано. Очищаю...")
    except Exception as e:
        print(f"\nОшибка: {e}")
    finally:
        clean_request(req_id)


if __name__ == "__main__":
    main()
```

**Зависимости:** `pip install requests python-dotenv` (pandas — только для анализа, не для выгрузки)
