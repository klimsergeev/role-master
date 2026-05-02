# Сценарии использования

## Назначение

Сценарии SEO-аудита YAML-семантики: что искать, типичные проблемы, полные примеры корректной и проблемной страниц.

## Сценарий 1: Проверка мета-тегов

**Что искать в YAML:**

```yaml
meta:
  title: "..."        # Проверить: длина, ключевые слова, уникальность
  description: "..."  # Проверить: длина (150-160 символов), CTA
  robots: "..."       # Проверить: index/noindex, follow/nofollow
  canonical: "..."    # Проверить: корректный URL, совпадение с текущим
```

**Типичные проблемы:**
- Отсутствует title или description
- Слишком длинный/короткий title (оптимум: 50-60 символов)
- Слишком длинный description (оптимум: 150-160 символов)
- robots: "noindex" на важных страницах
- Некорректный canonical (указывает на другую страницу)

## Сценарий 2: Анализ Schema.org

**Что искать в YAML:**

```yaml
schema_org:
  - type: "Event"       # Тип схемы
    name: "..."         # Обязательные свойства
    startDate: "..."
    location: {...}
    offers: {...}
```

**Типичные проблемы:**
- Отсутствуют обязательные свойства для типа
- Неправильный формат даты (должен быть ISO 8601)
- Отсутствует BreadcrumbList для навигации
- Несколько схем одного типа конфликтуют

**Распространённые типы Schema.org:**

| Тип | Обязательные свойства |
|-----|----------------------|
| Event | name, startDate, location |
| Product | name, offers |
| Article | headline, author, datePublished |
| BreadcrumbList | itemListElement |
| Organization | name, url |
| LocalBusiness | name, address, telephone |

## Сценарий 3: Анализ структуры заголовков

**Что искать в YAML:**

```yaml
content:
  main:
    article:
      h1: "Единственный H1"
      section:
        - h2: "Раздел 1"
        - h2: "Раздел 2"
          h3:
            - "Подраздел 2.1"
            - "Подраздел 2.2"
```

**Правила иерархии:**
- Только один `h1` на странице
- `h2` следует за `h1`, `h3` за `h2` (без пропусков уровней)
- Заголовки должны отражать структуру контента

**Типичные проблемы:**
- Несколько `h1` на странице
- Пропуск уровней (h1 -> h3, без h2)
- Пустые заголовки
- Заголовки не соответствуют контенту

## Сценарий 4: Сравнение страниц

**Методика сравнения:**

1. Получить YAML обеих страниц
2. Сравнить ключевые секции:

| Секция | Что сравнивать |
|--------|----------------|
| meta | Уникальность title/description |
| open_graph | Корректность изображений |
| schema_org | Полнота разметки |
| content.h1 | Уникальность заголовков |

**Типичные проблемы:**
- Дублирование title/description на разных страницах
- Одинаковые h1 на разных страницах
- Отсутствие Schema.org на одной из страниц
- Разная полнота Open Graph

## Сценарий 5: Аудит Open Graph и Twitter Cards

**Что искать в YAML:**

```yaml
open_graph:
  title: "..."        # Оптимум: 60-90 символов
  description: "..."  # Оптимум: 200 символов
  image:
    url: "..."        # Обязательно: абсолютный URL
    width: 1200       # Рекомендуется: 1200x630
    height: 630
  type: "..."         # website, article, product, event

twitter:
  card: "..."         # summary, summary_large_image
  title: "..."
  description: "..."
  image: "..."
```

**Типичные проблемы:**
- Отсутствует og:image
- Изображение меньше рекомендуемого размера
- Относительный URL вместо абсолютного
- Не указан og:type

## Примеры

### Пример 1: Типовая страница (корректная)

**Вход:** YAML-файл страницы концерта

**Результат:**

```yaml
meta:
  title: "Билеты на концерт группы Example | MusicTickets"
  description: "Купить билеты на концерт группы Example 15 марта 2026. Официальные билеты от 2000 руб."
  canonical: "https://example.com/concert/example-band"
  robots: "index, follow"

open_graph:
  title: "Билеты на концерт Example - 15 марта 2026"
  description: "Купить официальные билеты от 2000 руб."
  type: "website"
  url: "https://example.com/concert/example-band"
  image:
    url: "https://example.com/images/example-concert.jpg"
    width: 1200
    height: 630

schema_org:
  - context: "https://schema.org"
    type: "Event"
    name: "Концерт группы Example"
    startDate: "2026-03-15T19:00:00+03:00"
    location:
      type: "Place"
      name: "Концертный зал"
    offers:
      type: "Offer"
      price: "2000"
      priceCurrency: "RUB"
      availability: "https://schema.org/InStock"

content:
  main:
    article:
      h1: "Концерт группы Example"
      section:
        - h2: "О мероприятии"
          p:
            - "Легендарная группа Example выступит с новой программой."
        - h2: "Дата и место"
          p:
            - "15 марта 2026, 19:00"
            - "Концертный зал, Москва"
```

**Анализ:** Title 52 символа (оптимально), H1 уникален, Schema.org Event заполнен корректно.

### Пример 2: Страница с ошибками (edge-case)

**Вход:** YAML-файл проблемной страницы

**Результат:**

```yaml
meta:
  title: "Главная"
  robots: "noindex"

schema_org: []

content:
  main:
    h1: "Добро пожаловать"
    h1: "Наши услуги"
    h3:
      - "Услуга 1"
```

**Выявленные проблемы:**
1. Title слишком короткий (8 символов, нужно 50-60)
2. Отсутствует description
3. robots: noindex блокирует индексацию
4. Нет Open Graph разметки
5. Нет Schema.org
6. Два h1 на странице (должен быть один)
7. Пропущен уровень h2 (сразу h3 после h1)
