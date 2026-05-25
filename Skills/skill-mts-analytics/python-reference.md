# Python-сниппеты: Data API

## Назначение

Python-шаблоны для полного цикла работы с Data API МТС Аналитики: создание задачи, polling, скачивание, парсинг CSV. Агент генерирует скрипт на основе этих шаблонов, подставляя нужные параметры.

## Конфигурация

```python
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("MTS_ANALYTICS_TOKEN")
FLOW_ID = os.getenv("MTS_ANALYTICS_FLOW_ID")

BASE_URL = "https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
```

## Полный цикл выгрузки

### Этап 1: Создание задачи

```python
import requests
import json

def create_task(event_type, date_from, date_to, flow_ids, attribution=None):
    """Создать задачу экспорта Data API.
    
    Args:
        event_type: WEB_HIT, SESSION или MOBILE_HIT
        date_from: ISO 8601 datetime, например "2026-04-01T00:00:00+03:00"
        date_to: ISO 8601 datetime
        flow_ids: список UUID потоков
        attribution: dict с model и window (опционально)
    """
    body = {
        "event": event_type,
        "filter": {
            "receiveFrom": date_from,
            "receiveTo": date_to
        },
        "flowIds": flow_ids
    }
    if attribution:
        body["attribution"] = attribution
    
    resp = requests.post(
        f"{BASE_URL}/dataexporttasks",
        headers=HEADERS,
        json=body
    )
    resp.raise_for_status()
    data = resp.json()
    print(f"Task created: {data['id']}, status: {data['status']}")
    return data["id"]
```

### Этап 2: Polling статуса

```python
import time

def poll_task(task_id, interval=30, max_wait=1800):
    """Ожидать завершения задачи с polling.
    
    Args:
        task_id: UUID задачи
        interval: секунды между проверками (30-60 рекомендуется)
        max_wait: максимальное ожидание в секундах (default 30 мин)
    
    Returns:
        dict с информацией о задаче при SUCCESS
    
    Raises:
        TimeoutError: если задача не завершилась за max_wait
        RuntimeError: если задача завершилась с ошибкой
    """
    elapsed = 0
    while elapsed < max_wait:
        resp = requests.get(
            f"{BASE_URL}/dataexporttasks/{task_id}",
            headers=HEADERS
        )
        resp.raise_for_status()
        data = resp.json()
        status = data["status"]
        
        if status == "SUCCESS":
            parts_count = data["result"]["partsCount"]
            print(f"Task complete: {parts_count} parts")
            return data
        elif status in ("FAILED", "RESULT_CLEANED_AS_TOO_OLD"):
            raise RuntimeError(f"Task failed with status: {status}")
        
        print(f"Status: {status}, waiting {interval}s... ({elapsed}s elapsed)")
        time.sleep(interval)
        elapsed += interval
    
    raise TimeoutError(f"Task not completed after {max_wait}s")
```

### Этап 3: Скачивание частей

```python
import os

def download_parts(task_id, parts_count, output_dir="scripts-mts-analytics/result"):
    """Скачать все части задачи. Max concurrency 2-3.
    
    Args:
        task_id: UUID задачи
        parts_count: количество частей
        output_dir: директория для сохранения
    
    Returns:
        список путей к скачанным файлам
    """
    os.makedirs(output_dir, exist_ok=True)
    paths = []
    
    for i in range(parts_count):
        path = os.path.join(output_dir, f"part_{i}.csv.gz")
        
        # Скачивание с верификацией
        success = False
        for attempt in range(3):
            resp = requests.get(
                f"{BASE_URL}/dataexporttasks/{task_id}/parts/{i}",
                headers=HEADERS
            )
            if resp.status_code == 429:
                wait = 2 ** attempt * 10
                print(f"429 rate limit, waiting {wait}s...")
                time.sleep(wait)
                continue
            
            resp.raise_for_status()
            with open(path, "wb") as f:
                f.write(resp.content)
            
            # Верификация целостности gz
            if verify_gz(path):
                success = True
                break
            else:
                print(f"Part {i} corrupted (attempt {attempt+1}), retrying...")
        
        if not success:
            raise RuntimeError(f"Failed to download part {i} after 3 attempts")
        
        paths.append(path)
        print(f"Downloaded part {i}/{parts_count-1}")
    
    return paths
```

### Этап 4: Парсинг CSV

```python
import gzip
import csv

def verify_gz(path):
    """Верификация целостности gz-файла."""
    try:
        with gzip.open(path, "rt") as f:
            f.read()
        return True
    except Exception:
        return False

def parse_parts(paths):
    """Парсинг всех скачанных gz CSV частей.
    
    Args:
        paths: список путей к .csv.gz файлам
    
    Returns:
        список словарей (строк CSV)
    """
    rows = []
    for path in paths:
        with gzip.open(path, "rt") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
    
    print(f"Total rows parsed: {len(rows)}")
    return rows
```

## Обработка gzip

Верификация целостности обязательна -- 10-30% параллельных downloads возвращают truncated файлы.

```python
def download_with_verification(url, path, max_retries=3):
    """Скачать файл с верификацией gz."""
    for attempt in range(max_retries):
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
        
        with open(path, "wb") as f:
            f.write(resp.content)
        
        if verify_gz(path):
            return True
        
        print(f"Truncated file, retry {attempt+1}/{max_retries}")
    
    return False
```

## Sessionizer

Группировка хитов по сессиям для вычисления поведенческих метрик.

```python
from datetime import datetime

def sessionize(rows):
    """Группировка хитов по session_id.
    
    Args:
        rows: список словарей из parse_parts()
    
    Returns:
        dict: session_id -> session data
    """
    sessions = {}
    for row in rows:
        sid = row.get("ma_session_id")
        if not sid:
            continue
        
        t = row.get("ma_occurrence_dttm", "")
        url = row.get("ma_url_path", "")
        
        s = sessions.setdefault(sid, {
            "hits": 0,
            "first_t": t,
            "last_t": t,
            "first_url": url,
            "urls": []
        })
        
        s["hits"] += 1
        s["urls"].append(url)
        if t and t < s["first_t"]:
            s["first_t"] = t
            s["first_url"] = url
        if t and t > s["last_t"]:
            s["last_t"] = t
    
    return sessions
```

## Агрегация метрик

Вычисление bounce_rate, avg_session_duration, avg_depth из сессий.

```python
def aggregate_sessions(sessions):
    """Агрегация поведенческих метрик из сессий.
    
    Returns:
        dict с метриками: n, bounce_rate, avg_duration, avg_depth
    """
    n = len(sessions)
    if n == 0:
        return {"n": 0, "bounce_rate": 0, "avg_duration": 0, "avg_depth": 0}
    
    single_hit = 0
    total_hits = 0
    dur_sum = 0
    dur_count = 0
    
    for s in sessions.values():
        total_hits += s["hits"]
        if s["hits"] == 1:
            single_hit += 1
        try:
            dur = (
                datetime.fromisoformat(s["last_t"]) -
                datetime.fromisoformat(s["first_t"])
            ).total_seconds()
            if 0 <= dur < 86400:
                dur_sum += dur
                dur_count += 1
        except (ValueError, TypeError):
            pass
    
    return {
        "n": n,
        "bounce_rate": round(single_hit / n * 100, 2),
        "avg_duration": round(dur_sum / dur_count, 1) if dur_count else 0,
        "avg_depth": round(total_hits / n, 2)
    }
```

## Шаблон полного скрипта

Готовый `.py` файл, который агент генерирует с подстановкой параметров:

```python
#!/usr/bin/env python3
"""MTS Analytics Data API export script.

Generated by Claude Code agent.
Output: scripts-mts-analytics/result/
"""
import os
import time
import gzip
import csv
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# --- Config ---
load_dotenv()
TOKEN = os.getenv("MTS_ANALYTICS_TOKEN")
FLOW_ID = os.getenv("MTS_ANALYTICS_FLOW_ID")
BASE_URL = "https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# --- Parameters (agent fills these) ---
EVENT_TYPE = "WEB_HIT"           # WEB_HIT | SESSION | MOBILE_HIT
DATE_FROM = "2026-04-01T00:00:00+03:00"
DATE_TO = "2026-05-01T00:00:00+03:00"
OUTPUT_DIR = "scripts-mts-analytics/result"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    
    # 1. Create task
    body = {
        "event": EVENT_TYPE,
        "filter": {"receiveFrom": DATE_FROM, "receiveTo": DATE_TO},
        "flowIds": [FLOW_ID]
    }
    resp = requests.post(f"{BASE_URL}/dataexporttasks", headers=HEADERS, json=body)
    resp.raise_for_status()
    task_id = resp.json()["id"]
    print(f"Task created: {task_id}")
    
    # 2. Poll
    while True:
        resp = requests.get(f"{BASE_URL}/dataexporttasks/{task_id}", headers=HEADERS)
        resp.raise_for_status()
        info = resp.json()
        status = info["status"]
        if status == "SUCCESS":
            break
        elif status in ("FAILED", "RESULT_CLEANED_AS_TOO_OLD"):
            raise RuntimeError(f"Task failed: {status}")
        print(f"Status: {status}, waiting 30s...")
        time.sleep(30)
    
    parts_count = info["result"]["partsCount"]
    print(f"Ready: {parts_count} parts")
    
    # 3. Download
    all_rows = []
    for i in range(parts_count):
        path = os.path.join(OUTPUT_DIR, f"{timestamp}_part_{i}.csv.gz")
        for attempt in range(3):
            r = requests.get(f"{BASE_URL}/dataexporttasks/{task_id}/parts/{i}", headers=HEADERS)
            if r.status_code == 429:
                time.sleep(2 ** attempt * 10)
                continue
            r.raise_for_status()
            with open(path, "wb") as f:
                f.write(r.content)
            try:
                with gzip.open(path, "rt") as gz:
                    gz.read()
                break
            except Exception:
                print(f"Part {i} corrupted, retry {attempt+1}")
        else:
            raise RuntimeError(f"Failed to download part {i}")
        
        # 4. Parse
        with gzip.open(path, "rt") as gz:
            reader = csv.DictReader(gz)
            for row in reader:
                all_rows.append(row)
        print(f"Part {i}: parsed, total rows: {len(all_rows)}")
    
    # Save result
    out_path = os.path.join(OUTPUT_DIR, f"{timestamp}-mts_data.csv")
    if all_rows:
        with open(out_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=all_rows[0].keys())
            writer.writeheader()
            writer.writerows(all_rows)
    
    print(f"Done: {len(all_rows)} rows saved to {out_path}")

if __name__ == "__main__":
    main()
```

## Папки

- Скрипты: `scripts-mts-analytics/`
- Результаты: `scripts-mts-analytics/result/`
