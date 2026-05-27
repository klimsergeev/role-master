# Python Reference

## Назначение

Python-сниппеты для работы с GA4 API -- Data API, Admin API, Measurement Protocol. Шаблоны для генерации скриптов выгрузки.

## Установка

```bash
# Data API (отчёты)
pip install google-analytics-data

# Admin API (управление)
pip install google-analytics-admin

# Работа с .env
pip install python-dotenv
```

## Авторизация

### Вариант 1: Переменная окружения (рекомендуется)

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient

# Клиент автоматически подхватит credentials из env
client = BetaAnalyticsDataClient()
```

### Вариант 2: Явная передача credentials

```python
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient

credentials = service_account.Credentials.from_service_account_file(
    "path/to/service-account-key.json"
)
client = BetaAnalyticsDataClient(credentials=credentials)
```

### Загрузка property_id из .env

```python
import os
from dotenv import load_dotenv

load_dotenv()
property_id = os.environ["GA4_PROPERTY_ID"]
```

## Data API сниппеты

### 1. Базовый отчёт (runReport)

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)


def run_report(property_id: str):
    """Запрос активных пользователей по городам."""
    client = BetaAnalyticsDataClient()

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="city")],
        metrics=[Metric(name="activeUsers")],
        date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
    )
    response = client.run_report(request)

    print(f"Получено строк: {response.row_count}")
    for row in response.rows:
        city = row.dimension_values[0].value
        users = row.metric_values[0].value
        print(f"  {city}: {users}")
```

### 2. Отчёт с фильтрацией (StringFilter)

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Filter,
    FilterExpression,
    Metric,
    RunReportRequest,
)


def run_filtered_report(property_id: str):
    """Отчёт по страницам с фильтром по стране."""
    client = BetaAnalyticsDataClient()

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[
            Dimension(name="pagePath"),
            Dimension(name="date"),
        ],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews"),
        ],
        date_ranges=[DateRange(start_date="2024-01-01", end_date="2024-01-31")],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="country",
                string_filter=Filter.StringFilter(
                    value="Russia",
                    match_type=Filter.StringFilter.MatchType.EXACT,
                ),
            )
        ),
        limit=1000,
    )
    response = client.run_report(request)

    for row in response.rows:
        page = row.dimension_values[0].value
        date = row.dimension_values[1].value
        users = row.metric_values[0].value
        sessions = row.metric_values[1].value
        views = row.metric_values[2].value
        print(f"{date} | {page} | users={users}, sessions={sessions}, views={views}")
```

### 3. Пакетный отчёт (batchRunReports)

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    BatchRunReportsRequest,
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)


def run_batch_report(property_id: str):
    """Запуск нескольких отчётов одним запросом (до 5)."""
    client = BetaAnalyticsDataClient()

    request = BatchRunReportsRequest(
        property=f"properties/{property_id}",
        requests=[
            RunReportRequest(
                dimensions=[Dimension(name="country")],
                metrics=[Metric(name="activeUsers")],
                date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            ),
            RunReportRequest(
                dimensions=[Dimension(name="browser")],
                metrics=[Metric(name="sessions")],
                date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            ),
        ],
    )
    response = client.batch_run_reports(request)

    for i, report in enumerate(response.reports):
        print(f"\n--- Отчёт {i + 1} ({report.row_count} строк) ---")
        for row in report.rows:
            dim = row.dimension_values[0].value
            metric = row.metric_values[0].value
            print(f"  {dim}: {metric}")
```

### 4. Realtime отчёт (runRealtimeReport)

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    Dimension,
    Metric,
    MinuteRange,
    RunRealtimeReportRequest,
)


def run_realtime_report(property_id: str):
    """Активные пользователи за последние 30 минут."""
    client = BetaAnalyticsDataClient()

    request = RunRealtimeReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="country")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="eventCount"),
        ],
        minute_ranges=[
            MinuteRange(start_minutes_ago=29, end_minutes_ago=0),
        ],
    )
    response = client.run_realtime_report(request)

    for row in response.rows:
        country = row.dimension_values[0].value
        users = row.metric_values[0].value
        events = row.metric_values[1].value
        print(f"{country}: {users} users, {events} events")
```

### 5. Проверка квот (returnPropertyQuota)

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)


def check_quota(property_id: str):
    """Получить текущее состояние квот."""
    client = BetaAnalyticsDataClient()

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date")],
        metrics=[Metric(name="activeUsers")],
        date_ranges=[DateRange(start_date="yesterday", end_date="today")],
        return_property_quota=True,
    )
    response = client.run_report(request)

    quota = response.property_quota
    print(f"Tokens per day: {quota.tokens_per_day.consumed} / "
          f"{quota.tokens_per_day.consumed + quota.tokens_per_day.remaining}")
    print(f"Tokens per hour: {quota.tokens_per_hour.consumed} / "
          f"{quota.tokens_per_hour.consumed + quota.tokens_per_hour.remaining}")
    print(f"Concurrent requests: {quota.concurrent_requests.consumed} / "
          f"{quota.concurrent_requests.consumed + quota.concurrent_requests.remaining}")
```

### 6. checkCompatibility

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    CheckCompatibilityRequest,
    Dimension,
    Metric,
)


def check_compatibility(property_id: str):
    """Проверить совместимость dimensions и metrics перед запросом."""
    client = BetaAnalyticsDataClient()

    request = CheckCompatibilityRequest(
        property=f"properties/{property_id}",
        dimensions=[
            Dimension(name="country"),
            Dimension(name="itemName"),
        ],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="itemRevenue"),
        ],
    )
    response = client.check_compatibility(request)

    for dc in response.dimension_compatibilities:
        name = dc.dimension_metadata.api_name
        compat = dc.compatibility.name
        print(f"Dimension {name}: {compat}")

    for mc in response.metric_compatibilities:
        name = mc.metric_metadata.api_name
        compat = mc.compatibility.name
        print(f"Metric {name}: {compat}")
```

## Admin API сниппеты

### 1. list_account_summaries

```python
from google.analytics.admin_v1beta import AnalyticsAdminServiceClient


def list_accounts():
    """Список аккаунтов GA4."""
    client = AnalyticsAdminServiceClient()

    results = client.list_account_summaries()
    for account_summary in results:
        print(f"Account: {account_summary.display_name} ({account_summary.name})")
        for prop in account_summary.property_summaries:
            print(f"  Property: {prop.display_name} ({prop.property})")
```

### 2. list_data_streams

```python
from google.analytics.admin_v1beta import AnalyticsAdminServiceClient


def list_data_streams(property_id: str):
    """Список потоков данных свойства."""
    client = AnalyticsAdminServiceClient()

    results = client.list_data_streams(parent=f"properties/{property_id}")
    for stream in results:
        print(f"Stream: {stream.display_name} (type={stream.type_}, id={stream.name})")
```

## Measurement Protocol сниппет

### Отправка события + валидация

```python
import requests

MEASUREMENT_ID = "G-XXXXXXXXXX"
API_SECRET = "{{API_SECRET}}"

url = (
    f"https://www.google-analytics.com/mp/collect"
    f"?measurement_id={MEASUREMENT_ID}&api_secret={API_SECRET}"
)

payload = {
    "client_id": "client_id_from_cookie_or_generated",
    "events": [
        {
            "name": "server_purchase",
            "params": {
                "transaction_id": "T-12345",
                "value": 150.0,
                "currency": "RUB",
                "engagement_time_msec": 100,
            },
        }
    ],
}

# Валидация (debug) -- сначала проверяем
debug_url = url.replace("/mp/collect", "/debug/mp/collect")
debug_response = requests.post(debug_url, json=payload)
validation = debug_response.json()

if not validation.get("validationMessages"):
    # Отправка на production
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")  # 204 = успех
else:
    print(f"Validation errors: {validation['validationMessages']}")
```

## Шаблон скрипта выгрузки

Полный скрипт с argparse, загрузкой .env, записью в CSV.

```python
#!/usr/bin/env python3
"""GA4 Data API -- выгрузка отчёта в CSV."""

import argparse
import csv
import os
from datetime import datetime

from dotenv import load_dotenv
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)

load_dotenv()
PROPERTY_ID = os.environ["GA4_PROPERTY_ID"]
RESULT_DIR = "scripts-ga/result"


def run_report(start_date: str, end_date: str) -> list[dict]:
    """Запрос отчёта и возврат строк как список словарей."""
    client = BetaAnalyticsDataClient()

    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[
            Dimension(name="date"),
            Dimension(name="country"),
        ],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
        ],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        limit=10000,
        return_property_quota=True,
    )
    response = client.run_report(request)

    # Вывести квоты
    if response.property_quota:
        q = response.property_quota
        print(f"Quota: {q.tokens_per_day.consumed}/{q.tokens_per_day.consumed + q.tokens_per_day.remaining} tokens/day")

    # Собрать строки
    dim_names = [h.name for h in response.dimension_headers]
    metric_names = [h.name for h in response.metric_headers]
    rows = []
    for row in response.rows:
        r = {}
        for i, dv in enumerate(row.dimension_values):
            r[dim_names[i]] = dv.value
        for i, mv in enumerate(row.metric_values):
            r[metric_names[i]] = mv.value
        rows.append(r)

    print(f"Получено строк: {len(rows)} из {response.row_count}")
    return rows


def save_csv(rows: list[dict], filename: str):
    """Сохранить строки в CSV."""
    os.makedirs(RESULT_DIR, exist_ok=True)
    filepath = os.path.join(RESULT_DIR, filename)

    if not rows:
        print("Нет данных для сохранения.")
        return

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Сохранено: {filepath}")


def main():
    parser = argparse.ArgumentParser(description="GA4 report to CSV")
    parser.add_argument("--start", default="30daysAgo", help="Start date")
    parser.add_argument("--end", default="today", help="End date")
    args = parser.parse_args()

    rows = run_report(args.start, args.end)

    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    filename = f"{timestamp}-ga4_data.csv"
    save_csv(rows, filename)


if __name__ == "__main__":
    main()
```

### Запуск

```bash
# По умолчанию: последние 30 дней
python scripts-ga/export_report.py

# С указанием дат
python scripts-ga/export_report.py --start 2024-01-01 --end 2024-01-31
```

## Именование файлов

Паттерн: `YYYY-MM-DD-HH-MM-SS-ga4_data.csv`

Пример: `2024-05-15-14-30-00-ga4_data.csv`

Все файлы выгрузки сохраняются в `scripts-ga/result/`.
