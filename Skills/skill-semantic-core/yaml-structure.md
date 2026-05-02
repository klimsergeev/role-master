# Структура YAML-файла семантики

## Назначение

Справочник по структуре YAML-файлов SEO-семантики и правилам их чтения: общая схема, синтаксис ключей, трансформации, иерархия контента.

## Общая схема

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
