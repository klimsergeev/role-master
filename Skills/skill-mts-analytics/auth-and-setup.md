# Авторизация и настройка

## Назначение

Процедура получения токена, настройки окружения и проверки доступа к Data API МТС Аналитики.

## Получение токена

1. Отправить заявку на `analytics.support@mts.ru` с темой "Доступ к Data API".
2. В заявке указать: название организации, flowId потока данных, контактное лицо.
3. В ответ приходит Bearer token. Срок действия -- ~1 год.

## Проверка токена (JWT decode)

Токен -- это JWT. Проверить срок действия через decode payload:

```bash
PAYLOAD=$(echo "$TOKEN" | cut -d. -f2)
while [ $((${#PAYLOAD} % 4)) -ne 0 ]; do PAYLOAD="${PAYLOAD}="; done
echo "$PAYLOAD" | tr '_-' '/+' | base64 -d | python3 -c "import json,sys; d=json.load(sys.stdin); print('exp:', d['exp'])"
```

Результат -- Unix timestamp. Конвертировать в дату:

```bash
python3 -c "from datetime import datetime; print(datetime.fromtimestamp(TIMESTAMP))"
```

## Базовый URL

| URL | Источник | Рекомендация |
|-----|----------|-------------|
| `https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/` | Official docs | Основной |
| `https://api.mts.ru/mtsa-data-api/2/v2/` | Практика | Альтернативный gateway |

Если один URL возвращает ошибки -- попробовать другой.

## Формат авторизации

Все запросы к Data API требуют заголовок:

```
Authorization: Bearer {{TOKEN}}
```

## Как узнать flowId

1. Войти в Web UI МТС Аналитики: `a.mts.ru`
2. Перейти в настройки потока данных
3. flowId -- UUID формата `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Настройка окружения

Создать или дополнить файл `.env` в корне проекта:

```
MTS_ANALYTICS_TOKEN={{TOKEN}}
MTS_ANALYTICS_FLOW_ID={{FLOW_ID}}
```

Использование в Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("MTS_ANALYTICS_TOKEN")
FLOW_ID = os.getenv("MTS_ANALYTICS_FLOW_ID")
```

## Тестовый запрос

Проверка что токен работает:

```bash
curl -s \
  -H "Authorization: Bearer {{TOKEN}}" \
  "https://gw.intp.mts-corp.ru/mtsa-data-api/2/v2/dataexporttasks?size=1"
```

Ожидаемый ответ: HTTP 200 с JSON (список задач или пустой массив).

Если 401 -- токен недействителен или истёк. Проверить через JWT decode (см. выше) или запросить новый на `analytics.support@mts.ru`.

## Rate limits

| Ограничение | Значение | Последствие |
|-------------|----------|-------------|
| Cooldown между задачами | ~10 мин | При нарушении -- 429 |
| Параллельное скачивание частей | Max 2-3 | При превышении -- 429 |
| Время жизни результата | 24 часа | Статус RESULT_CLEANED_AS_TOO_OLD |
