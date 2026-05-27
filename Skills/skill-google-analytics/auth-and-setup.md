# Авторизация и настройка

## Назначение

Авторизация и настройка окружения для работы с GA4 API: Service Account, OAuth 2.0, scopes, Google Cloud Project, Python-пакеты.

## Два способа авторизации

| | Service Account | OAuth 2.0 |
|---|---|---|
| **Для кого** | Серверные приложения, агенты | Пользовательские приложения |
| **User interaction** | Не нужен | Нужен (consent screen) |
| **Credentials** | JSON-ключ | access_token + refresh_token |
| **Рекомендация** | Для агентов | Для UI-приложений |
| **Refresh** | Автоматический | Через refresh_token |

**Рекомендация для агентов:** Service Account -- не требует user interaction, credentials хранятся в файле, автоматическое обновление токенов.

## Service Account

### Пошаговая настройка

1. **Google Cloud Console** -- перейти в [console.cloud.google.com](https://console.cloud.google.com/)
2. **IAM & Admin > Service Accounts** -- создать новый Service Account
3. **Сгенерировать JSON-ключ** -- Actions > Manage Keys > Add Key > JSON
4. **Добавить в GA4** -- GA4 Admin > Property Access Management > добавить email Service Account (формат: `{{SERVICE_ACCOUNT_EMAIL}}`)
5. **Роль в GA4** -- минимум Viewer (для чтения), Editor (для записи)
6. **Переменная окружения:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

### Проверка доступа

Service Account должен быть добавлен как пользователь GA4 property. Без этого -- ошибка `403 PERMISSION_DENIED`.

## OAuth 2.0

### Кратко

1. **Google Cloud Console** -- создать OAuth 2.0 Client ID (тип: Desktop Application или Web Application)
2. **Consent Screen** -- настроить OAuth Consent Screen с нужными scopes
3. **Authorization Code flow:**
   - Пользователь авторизуется в браузере
   - Получаем authorization code
   - Обмениваем code на `access_token` + `refresh_token`
4. **Хранение:** `refresh_token` используется для обновления `access_token`

## OAuth Scopes

| Scope | Описание | API |
|---|---|---|
| `analytics.readonly` | Чтение данных GA | Data API, Admin API |
| `analytics` | Чтение и управление данными | Data API, Admin API |
| `analytics.edit` | Редактирование конфигурации | Admin API |
| `analytics.manage.users` | Управление пользователями | Admin API |
| `analytics.manage.users.readonly` | Просмотр пользователей | Admin API |
| `analytics.provision` | Создание новых аккаунтов | Admin API |
| `analytics.user.deletion` | Запросы на удаление данных | Admin API |

Полный формат scope: `https://www.googleapis.com/auth/analytics.readonly`

**Правило:** запрашивай минимально необходимый scope. Для чтения отчётов достаточно `analytics.readonly`.

## Google Cloud Project Setup

### Шаги

1. Перейти в [Google Cloud Console](https://console.cloud.google.com/)
2. Создать новый проект или выбрать существующий
3. Включить API (APIs & Services > Enable APIs):
   - **Google Analytics Data API** -- для отчётов
   - **Google Analytics Admin API** -- для управления
4. Создать credentials:
   - Service Account (рекомендуется для агентов)
   - OAuth Client ID (для пользовательских приложений)

### Какие API включать

| Задача | API для включения |
|---|---|
| Отчёты (runReport, realtime) | Google Analytics Data API |
| Управление (properties, streams) | Google Analytics Admin API |
| Measurement Protocol | Не требует включения API (прямой HTTP) |
| BigQuery Export | BigQuery API (в проекте BigQuery) |

## Python-пакеты

```bash
# Data API (отчёты)
pip install google-analytics-data

# Admin API (управление)
pip install google-analytics-admin

# Работа с .env
pip install python-dotenv
```

## Настройка окружения

### Файл `.env`

```env
GA4_PROPERTY_ID={{PROPERTY_ID}}
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Загрузка в Python

```python
import os
from dotenv import load_dotenv

load_dotenv()
property_id = os.environ["GA4_PROPERTY_ID"]
```

## Тестовый запрос

Минимальный запрос для проверки подключения -- список аккаунтов:

```python
from google.analytics.admin_v1beta import AnalyticsAdminServiceClient

client = AnalyticsAdminServiceClient()
results = client.list_account_summaries()

for summary in results:
    print(f"Account: {summary.display_name} ({summary.name})")
    for prop in summary.property_summaries:
        print(f"  Property: {prop.display_name} ({prop.property})")
```

ЕСЛИ ответ пустой -- Service Account не добавлен в GA4 property.
ЕСЛИ ошибка 403 -- проверить что API включён в Google Cloud Console.
ЕСЛИ ошибка credentials -- проверить `GOOGLE_APPLICATION_CREDENTIALS`.
