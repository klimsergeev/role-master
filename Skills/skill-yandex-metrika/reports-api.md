# API отчётов

## Назначение

Справочник по API отчётов Яндекс Метрики — эндпоинты, параметры, фильтрация, группировки и метрики. API отчётов возвращает агрегированные данные с группировками и метриками. В отличие от Logs API, здесь есть фильтрация, сортировка, постраничность и шаблоны.

## Базовый URL

```
https://api-metrika.yandex.net/stat/v1/data
```

## Эндпоинты

| Эндпоинт | Метод | Назначение |
|----------|-------|------------|
| `/stat/v1/data` | GET | Таблица — основной отчёт |
| `/stat/v1/data/drilldown` | GET | Drill down — иерархический отчёт |
| `/stat/v1/data/bytime` | GET | По времени — данные по временным периодам |
| `/stat/v1/data/comparison` | GET | Сравнение сегментов |

## Параметры запроса (stat/v1/data)

### Обязательные

| Параметр | Тип | Описание |
|----------|-----|----------|
| `ids` | integer[] | Идентификаторы счётчиков через запятую |
| `metrics` | string | Список метрик через запятую (лимит: 20) |

### Дополнительные

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `dimensions` | string | — | Список группировок через запятую (лимит: 10) |
| `date1` | string | `6daysAgo` | Дата начала (`YYYY-MM-DD`) |
| `date2` | string | `today` | Дата окончания (`YYYY-MM-DD`) |
| `filters` | string | — | Фильтр сегментации |
| `limit` | string | `100` | Строк на странице (макс. 100 000) |
| `offset` | string | `1` | Индекс первой строки (с 1) |
| `sort` | string | — | Сортировка по группировкам/метрикам (убыв. по умолчанию) |
| `timezone` | string | — | Часовой пояс `+-hh:mm` |
| `accuracy` | string | — | Управление семплированием |
| `preset` | string | — | Шаблон отчёта |
| `pretty` | string | `false` | Форматирование JSON |
| `proposed_accuracy` | boolean | — | Авто-увеличение точности |
| `include_undefined` | boolean | — | Включить строки с неопределёнными значениями |
| `lang` | string | — | Язык |
| `callback` | string | — | JSONP-функция |
| `direct_client_logins` | string[] | — | Логины клиентов Директа |

## Формат ответа

```json
{
  "query": { ... },
  "data": [
    {
      "dimensions": [{"name": "...", "id": "..."}],
      "metrics": [123, 456]
    }
  ],
  "total_rows": 100,
  "totals": [1000, 5000],
  "min": [0, 0],
  "max": [500, 2000],
  "sampled": false,
  "sample_share": 1.0,
  "sample_size": 100000,
  "sample_space": 100000,
  "data_lag": 60,
  "contains_sensitive_data": false
}
```

## Дополнительные параметры эндпоинтов

### Для drilldown

| Параметр | Описание |
|----------|----------|
| `parent_id` | JSON-массив ключей для drill-down раскрытия |

### Для bytime

| Параметр | Описание |
|----------|----------|
| `group` | Группировка по времени: `day`, `week`, `month`, `year`, `hour` и др. (по умолчанию `week`) |
| `top_keys` | Количество строк (макс. 30, по умолчанию 7) |

### Для comparison

Сравнение двух сегментов с раздельными периодами и фильтрами:

| Параметр | Описание |
|----------|----------|
| `date1_a`, `date2_a` | Период сегмента A |
| `date1_b`, `date2_b` | Период сегмента B |
| `filters_a`, `filters_b` | Фильтры для каждого сегмента |

## Фильтрация (параметр filters)

**Формат:** `attribute operator 'value'`

**Операторы для метрик:** `!=`, `<`, `<=`, `==`, `>`, `>=`

**Логические операторы:** `AND`, `OR`, `NOT`

**Операторы для множеств:** `EXISTS`, `ALL`, `NONE`

**Примеры:**

```
# По городу
filters=ym:s:regionCityName=='Moscow'

# Сложный фильтр
filters=(ym:s:regionCityName=='Москва' OR ym:s:regionCityName=='SPb') AND ym:s:sex=='male'

# С параметрами визита
filters=EXISTS(ym:s:paramsLevel1=='client_id')

# Исключение роботов
filters=ym:s:isRobot=='No'
```

## Ограничения

- Макс. 20 метрик в одном запросе
- Макс. 10 группировок в одном запросе
- Макс. 100 000 строк на странице
- Макс. 10 уникальных группировок/метрик в фильтре
- Макс. 20 отдельных фильтров
- Макс. 100 значений в одном условии фильтрации
- Макс. 10 000 символов в строке фильтра
- Нельзя смешивать префиксы `ym:s:` и `ym:pv:` в одном запросе

## Группировки (dimensions)

### Префиксы

- `ym:s:` — визиты/сессии (основной)
- `ym:pv:` — просмотры страниц
- `ym:ad:` — реклама (клики)
- `ym:dl:` — загрузки файлов
- `ym:ep:` — параметры событий
- `ym:ev:` — затраты на визиты
- `ym:up:` — параметры посетителей

### Визиты (ym:s:) — популярные группировки

**Источники трафика (с атрибуцией `<attribution>`):**
- `ym:s:<attribution>TrafficSource` — источник трафика
- `ym:s:<attribution>SearchEngine` — поисковая система
- `ym:s:<attribution>AdvEngine` — рекламная система
- `ym:s:<attribution>SocialNetwork` — социальная сеть
- `ym:s:<attribution>UTMSource`, `UTMMedium`, `UTMCampaign`, `UTMContent`, `UTMTerm`

**Аудитория:**
- `ym:s:ageInterval` — возраст
- `ym:s:gender` — пол
- `ym:s:interest` — интересы
- `ym:s:regionCountry`, `ym:s:regionCity` — география
- `ym:s:isNewUser` — новый/вернувшийся
- `ym:s:userVisits` — количество визитов пользователя

**Технологии:**
- `ym:s:browser`, `ym:s:browserAndVersion`
- `ym:s:operatingSystem`, `ym:s:operatingSystemRoot`
- `ym:s:deviceCategory` — тип устройства
- `ym:s:mobilePhone`, `ym:s:mobilePhoneModel`
- `ym:s:screenResolution`, `ym:s:physicalScreenResolution`
- `ym:s:windowClientArea`

**Поведение:**
- `ym:s:startURL`, `ym:s:endURL` — страницы входа/выхода
- `ym:s:startURLDomain`, `ym:s:startURLPath`
- `ym:s:pageViews`, `ym:s:visitDuration` — глубина и длительность
- `ym:s:bounce` — отказность
- `ym:s:goal` — целевое действие

**Время:**
- `ym:s:date`, `ym:s:dateTime`
- `ym:s:hour`, `ym:s:dayOfWeek`, `ym:s:month`, `ym:s:year`
- `ym:s:startOfWeek`, `ym:s:startOfMonth`

**E-commerce:**
- `ym:s:productID`, `ym:s:productName`, `ym:s:productBrand`
- `ym:s:productCategory`, `ym:s:productCategoryLevel1`..`5`
- `ym:s:purchaseID`, `ym:s:purchaseRevenue`

### Просмотры (ym:pv:) — популярные группировки

- `ym:pv:URL`, `ym:pv:URLDomain`, `ym:pv:URLPath`
- `ym:pv:URLPathLevel1`..`5`
- `ym:pv:title` — заголовок страницы
- `ym:pv:referer`, `ym:pv:refererDomain`
- `ym:pv:browser`, `ym:pv:operatingSystem`, `ym:pv:deviceCategory`
- `ym:pv:screenResolution`, `ym:pv:physicalScreenResolution`
- `ym:pv:date`, `ym:pv:dateTime`

## Метрики (metrics)

### Визиты (ym:s:) — популярные метрики

**Базовые:**
- `ym:s:visits` — визиты
- `ym:s:pageviews` — просмотры страниц
- `ym:s:users` — уникальные посетители
- `ym:s:bounceRate` — коэффициент отказов
- `ym:s:pageDepth` — глубина просмотра
- `ym:s:avgVisitDurationSeconds` — средняя длительность визита
- `ym:s:newUsers` — новые посетители
- `ym:s:percentNewVisitors` — процент новых

**Конверсии (с параметром `<goal_id>`):**
- `ym:s:goal<goal_id>reaches` — достижения цели
- `ym:s:goal<goal_id>conversionRate` — конверсия
- `ym:s:goal<goal_id>users` — пользователи с целью
- `ym:s:goal<goal_id>visits` — визиты с целью
- `ym:s:goal<goal_id>converted<currency>Revenue` — доход по цели
- `ym:s:anyGoalReaches` — достижения любой цели
- `ym:s:anyGoalConversionRate` — конверсия любой цели

**E-commerce:**
- `ym:s:ecommercePurchases` — покупки
- `ym:s:ecommerce<currency>ConvertedRevenue` — доход
- `ym:s:ecommerce<currency>ConvertedRevenuePerPurchase` — средний чек
- `ym:s:ecommerce<currency>ConvertedRevenuePerVisit` — доход на визит
- `ym:s:productPurchasedQuantity` — количество купленных товаров
- `ym:s:productBasketsQuantity` — добавления в корзину

**Демография:**
- `ym:s:manPercentage`, `ym:s:womanPercentage` — процент М/Ж
- `ym:s:under18AgePercentage`..`ym:s:over54AgePercentage`

**Технологии:**
- `ym:s:mobilePercentage` — процент мобильных
- `ym:s:cookieEnabledPercentage`
- `ym:s:robotPercentage`, `ym:s:robotVisits`

### Просмотры (ym:pv:) — метрики

- `ym:pv:pageviews` — просмотры
- `ym:pv:users` — пользователи
- `ym:pv:pageviewsPerDay` — просмотров в день

### Реклама (ym:ad:) — метрики

- `ym:ad:visits`, `ym:ad:users`, `ym:ad:clicks`
- `ym:ad:bounceRate`, `ym:ad:pageDepth`
- `ym:ad:goal<goal_id>reaches`, `ym:ad:goal<goal_id>conversionRate`
