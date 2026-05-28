# Подводные камни и частые ошибки

## Назначение

Чеклист из 10 подводных камней при работе с API Яндекс Метрики, проверенных на практике.

## 1. date2 != today

API вернёт ошибку. Всегда `date2 <= вчера`. Включить код проверки:

```python
from datetime import date, timedelta

yesterday = (date.today() - timedelta(days=1)).isoformat()

if DATE2 >= date.today().isoformat():
    sys.exit(f"[FAIL] date2 ({DATE2}) >= сегодня. date2 должен быть < today.")
```

## 2. deviceCategory — числовой код

В Logs API приходит числом: 1=desktop, 2=mobile, 3=tablet. Фильтровать `== 1`, не `== "desktop"`.

## 3. operatingSystem — snake_case

Значения: `windows`, `windows10`, `macos`, не "Windows 10". Фильтрация: `str.startswith("windows")`.

## 4. goalsID — JSON-массив в строке

Формат `[345202883,317565372]` или `[]`. Содержит запятые — обязательна конвертация TSV->CSV с QUOTE_ALL.

## 5. screenWidth vs physicalScreenWidth

Контринтуитивные имена:
- `screenWidth` = логические (CSS) пиксели
- `physicalScreenWidth` = физические пиксели
- DPR = physicalScreenWidth / screenWidth

## 6. Хост .net, не .ru

Правильный: `api-metrika.yandex.net`.

## 7. Именование выходных файлов

Паттерн `YYYY-MM-DD-HH-MM-SS-metrika_data.csv`. Код генерации:

```python
from datetime import datetime
timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
filename = f"{timestamp}-metrika_data.csv"
```

## 8. Пробелы в fields

Поля через запятую без пробелов. `"ym:s:a,ym:s:b"` — правильно. `"ym:s:a, ym:s:b"` — может сломать.

## 9. Смешение sources

Нельзя `ym:s:` и `ym:pv:` в одном запросе. Один запрос — один source.

## 10. Забыли clean

Квота остаётся занятой. Новые запросы отклоняются. Всегда `finally: clean_request(req_id)`.

## 11. item.price в Logs API — микро-единицы (x10^6)

Поле `item.price` в ecommerce-данных Logs API приходит умноженным на 1 000 000 (микро-рубли). Делить на 1 000 000 для получения рублей. Поля `purchaseRevenue` и `value` приходят уже в рублях — пересчёт не нужен. Это особенность API Метрики, не ошибка разметки сайта.
