---
name: skill-semantic-core
description: Справочник формата YAML-семантики сайта для SEO/GEO-анализа веб-страниц
allowed-tools: Bash(python *)
---

# Semantic Core

## Назначение

Скилл объясняет формат YAML-файлов, полученных из HTML-страниц путём извлечения SEO-релевантной семантики. Используй этот скилл для понимания структуры данных при SEO-аудите, анализе Schema.org, проверке мета-тегов и сравнении страниц.

---

## Самопроверка при подключении

При подключении вывести:

**Semantic Core подключён**
Формат YAML-семантики:
- meta (title, description, robots, canonical)
- open_graph, twitter
- schema_org (JSON-LD)
- content (h1-h6, p, a, img, semantic HTML)

**Где конвертировать html-разметку в семантическое ядро в YAML**
- Бот в Telegram [Tag Be Gome Bot](https://t.me/tag_be_gone_bot)
- В Claude Code: положить в папку `~/.claude/skills/skill-semantic-core/scripts/` скрипт `html_to_seo_yaml` и использовать `~/.claude/scripts/html_to_seo_yaml/main.py`

---

## Откуда берётся YAML

### Источник данных

YAML-файлы создаются автоматически из HTML-страниц. Процесс:

1. HTML-страница загружается (URL или файл)
2. Парсер извлекает только SEO-релевантные теги
3. Результат конвертируется в структурированный YAML

### Что сохраняется

| Категория | Элементы |
|-----------|----------|
| Мета-теги | title, description, robots, canonical, keywords |
| Open Graph | og:title, og:description, og:image, og:type, og:url |
| Twitter Cards | twitter:card, twitter:title, twitter:description, twitter:image |
| Schema.org | Все блоки `<script type="application/ld+json">` |
| Hreflang | `<link rel="alternate" hreflang="...">` |
| Контент | h1-h6, p, a, img, semantic HTML (main, article, section, nav, footer) |

### Что удаляется

- `<script>` (кроме JSON-LD)
- `<style>`, CSS-ссылки
- Атрибуты: class, id, style, onclick, data-*
- Декоративные div/span без SEO-контента
- HTML-комментарии

---

## Структура YAML-файла

### Общая схема

```yaml
# Мета-теги
meta:
  title: "..."
  description: "..."
  robots: "..."
  canonical: "..."
  keywords: "..."

# Open Graph
open_graph:
  title: "..."
  description: "..."
  type: "..."
  url: "..."
  image:
    url: "..."
    width: 1200
    height: 630

# Twitter Cards
twitter:
  card: "..."
  title: "..."
  description: "..."
  image: "..."

# Hreflang (мультиязычность)
link_alternate_hreflang:
  - lang: "ru"
    href: "..."
  - lang: "en"
    href: "..."

# Schema.org (структурированные данные)
schema_org:
  - context: "https://schema.org"
    type: "..."
    # ... свойства схемы

# Контент страницы
content:
  main:
    article:
      h1: "..."
      section:
        - h2: "..."
          p:
            - "..."
```

---

## Правила чтения YAML

### 1. Одиночные vs множественные элементы

| Тип | Формат | Пример |
|-----|--------|--------|
| Одиночный | Простой ключ | `h1: "Заголовок"` |
| Множественный | Массив | `h2: ["Первый", "Второй"]` |

**Одиночные элементы** (встречаются один раз на странице):
- `title`, `h1`, `canonical`, `description`

**Множественные элементы** (могут повторяться):
- `h2`-`h6`, `p`, `a`, `img`, `section`, `hreflang`

### 2. Schema.org

Schema.org блоки всегда в массиве `schema_org`, даже если блок один.

**Трансформация ключей JSON-LD:**
- `@context` -> `context`
- `@type` -> `type`
- `@id` -> `id`
- `@graph` -> `graph`

**Пример:**

```yaml
schema_org:
  - context: "https://schema.org"
    type: "Event"
    name: "Название события"
    startDate: "2026-03-15T19:00:00+03:00"
    location:
      type: "Place"
      name: "Название площадки"
```

### 3. Иерархия контента

Semantic HTML сохраняет вложенность:

```yaml
content:
  main:           # <main>
    article:      # <article>
      h1: "..."   # <h1>
      section:    # <section> (массив, если несколько)
        - h2: "..."
          p:
            - "..."
```

**Semantic-теги как контейнеры:**
- `main`, `article`, `section`, `nav`, `header`, `footer`, `aside`

### 4. Ссылки и изображения

```yaml
# Ссылки
a:
  - text: "Текст ссылки"
    href: "/path"

# Изображения
img:
  - src: "/image.jpg"
    alt: "Описание"
    width: 1200
    height: 800
```

### 5. Именование составных ключей

Атрибуты с пробелами преобразуются в snake_case:

| HTML | YAML-ключ |
|------|-----------|
| `<link rel="alternate" hreflang>` | `link_alternate_hreflang` |
| `<meta property="og:image">` | `open_graph.image` |
| `aria-label` | `aria_label` |

---

## Правила

- ЕСЛИ секция отсутствует в HTML -> соответствующий ключ не создаётся в YAML
- ЕСЛИ элемент один -> простой ключ; ЕСЛИ несколько -> массив
- ЕСЛИ встречается несколько h1 -> все записываются, это ошибка страницы
- ВСЕГДА использовать snake_case для составных ключей
- ВСЕГДА сохранять schema_org как массив, даже если блок один
- НИКОГДА не включать атрибуты class, id, style, data-*
- НИКОГДА не включать inline scripts и styles

---

## Сценарии использования

### Сценарий 1: Проверка мета-тегов

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

### Сценарий 2: Анализ Schema.org

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

### Сценарий 3: Анализ структуры заголовков

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

### Сценарий 4: Сравнение страниц

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

### Сценарий 5: Аудит Open Graph и Twitter Cards

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

---

## Примеры

### Пример 1: Типовая страница (корректная)

**Вход:** YAML-файл страницы концерта

**Выход:**

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

**Выход:**

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

---

## Что НЕ входит в scope

- Генерация YAML из HTML (это делает отдельный инструмент)
- Автоматическое исправление ошибок в HTML
- Специфичные требования конкретных сайтов
- Чеклисты SEO-аудита (используй профильные скиллы)
- Методология аудита (скилл описывает только формат данных)
