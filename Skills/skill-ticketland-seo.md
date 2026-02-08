---
name: skill-ticketland-seo
description: SEO-стандарты Ticketland.ru — эталонные требования к мета-тегам, структурированным данным и техническому SEO для билетного сервиса
version: 1.2.0
created: 2026-02-08
type: reference
---

# Ticketland SEO

## Назначение

Эталонный справочник по SEO для Ticketland.ru. Описывает **идеальное состояние** страниц билетного сервиса: как должны выглядеть мета-теги, структурированные данные и технические элементы. Используется как стандарт при аудите и разработке.

---

## Типы страниц

| Тип | URL-паттерн | Пример | Основная сущность | Schema.org |
|-----|-------------|--------|-------------------|------------|
| Мероприятие | `/[площадка]/[slug]` | `/teatry/bolshoy-teatr/lebedinoe-ozero` | Конкретное событие с датой | Event / TheaterEvent / MusicEvent |
| Площадка | `/[категория]/[slug]` | `/teatry/bolshoy-teatr` | Место проведения | Place + EventSchedule |
| Исполнитель | `/person/[slug]` | `/person/anna-netrebko` | Персона или группа | Person / PerformingGroup |
| Категория | `/[категория]` | `/teatry`, `/koncerty` | Список событий | ItemList + BreadcrumbList |
| Подкатегория | `/[категория]/[подкатегория]` | `/koncerty/rok-koncerty` | Список событий | ItemList + BreadcrumbList |

---

## Title

### Эталонный формат

| Тип страницы | Шаблон | Пример |
|--------------|--------|--------|
| Мероприятие | `Билеты на [название] | [площадка] | Ticketland` | `Билеты на «Лебединое озеро» | Большой театр | Ticketland` |
| Площадка | `[Название] — афиша и билеты | Ticketland` | `Большой театр — афиша и билеты | Ticketland` |
| Исполнитель | `[Имя] — концерты и билеты | Ticketland` | `Анна Нетребко — концерты и билеты | Ticketland` |
| Категория | `[Категория] [город] — билеты | Ticketland` | `Театры Москвы — билеты | Ticketland` |

### Правила

- Длина: 50-60 символов (оптимально), максимум 70
- Название мероприятия/площадки — в кавычках-ёлочках «»
- Бренд (Ticketland) — в конце, через `|`
- Для мероприятий: начинать с «Билеты на»

---

## Meta Description

### Эталонный формат

| Тип страницы | Шаблон |
|--------------|--------|
| Мероприятие | `Купить билеты на [название] в [площадка], [город]. [Дата]. Цены от [мин] до [макс] руб. Официальные билеты на Ticketland.` |
| Площадка | `Афиша [название] на [месяц] [год]. Билеты на [топ-3 события]. Официальная продажа на Ticketland.` |
| Исполнитель | `[Имя] — расписание концертов [год]. Билеты на ближайшие выступления в Москве и России. Ticketland.` |
| Категория | `[Категория] [город] — афиша на [месяц] [год]. [Кол-во] событий. Билеты от [мин] руб. Ticketland.` |

### Правила

- Длина: 150-160 символов (оптимально), максимум 180
- Начинать с глагола действия (Купить, Выбрать) или названия
- Указывать диапазон цен, дату, количество событий
- Упоминать официальность билетов
- Заканчивать брендом

### Запрещено

- Эмодзи в meta description
- Повторение title
- Общие фразы без конкретики
- Meta keywords (не использовать на сайте)

---

## Canonical

### Эталонное состояние

Каждая страница содержит canonical, указывающий на **саму себя**:

```html
<!-- Страница мероприятия -->
<link rel="canonical" href="https://www.ticketland.ru/doma-kultury/kc-khitrovka/spektakl-belosnezhka" />

<!-- Страница площадки -->
<link rel="canonical" href="https://www.ticketland.ru/teatry/bolshoy-teatr" />

<!-- Страница категории -->
<link rel="canonical" href="https://www.ticketland.ru/koncerty" />
```

### Правила

- ВСЕГДА указывать полный URL с `https://www.ticketland.ru/`
- ВСЕГДА указывать на текущую страницу, НЕ на главную
- Параметры фильтрации (page, sort, date) — исключать из canonical
- Страницы с фильтрами указывают canonical на базовый URL без параметров

### Типичные ошибки при аудите

| Ошибка | Как выглядит | Почему плохо |
|--------|--------------|--------------|
| Canonical на главную | `href="https://www.ticketland.ru/"` на странице мероприятия | Поисковик считает все страницы дубликатами главной |
| Отсутствие canonical | Тег `<link rel="canonical">` отсутствует | Поисковик сам решает, какой URL канонический |
| Canonical с параметрами | `href="...?page=2&sort=date"` | Дублирование контента в индексе |

---

## Open Graph

### Эталонный набор тегов

```html
<!-- Для страницы мероприятия -->
<meta property="og:type" content="event" />
<meta property="og:url" content="https://www.ticketland.ru/doma-kultury/kc-khitrovka/spektakl-belosnezhka" />
<meta property="og:title" content="Билеты на «Белоснежка» | КЦ Хитровка | Ticketland" />
<meta property="og:description" content="Купить билеты на спектакль «Белоснежка» в КЦ Хитровка, Москва. Официальные билеты от 1800 до 3000 руб." />
<meta property="og:image" content="https://media.ticketland.ru/images/1200x630/event.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Ticketland.ru" />
<meta property="og:locale" content="ru_RU" />
```

### Правила по типам страниц

| Тип страницы | og:type | og:url |
|--------------|---------|--------|
| Мероприятие | `event` | Полный URL страницы мероприятия |
| Площадка | `place` | Полный URL страницы площадки |
| Исполнитель | `profile` | Полный URL страницы исполнителя |
| Категория | `website` | Полный URL страницы категории |

### Требования к изображениям

- Размер: 1200x630 пикселей
- Формат: JPG или PNG
- Обязательно указывать og:image:width и og:image:height

### Типичные ошибки при аудите

| Ошибка | Почему плохо |
|--------|--------------|
| og:url указывает на главную | При шеринге в соцсетях — неправильная ссылка |
| og:type = website для мероприятий | Теряется семантика события |
| Отсутствуют og:image:width/height | Соцсети могут неправильно кропить изображение |
| Нет og:image или битая ссылка | При шеринге — серый плейсхолдер |

---

## Schema.org / JSON-LD

### Эталонное размещение

JSON-LD размещается в `<head>` страницы:

```html
<head>
  <!-- Мета-теги -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", ... }
  </script>
</head>
```

### Обязательные типы разметки

| Тип страницы | Schema.org типы |
|--------------|-----------------|
| Мероприятие | Event или специализированный тип (см. ниже) + BreadcrumbList |
| Площадка | Place или специализированный тип (см. ниже) + BreadcrumbList |
| Исполнитель | Person / PerformingGroup + BreadcrumbList |
| Категория | ItemList + BreadcrumbList |
| Все страницы | BreadcrumbList (кроме главной) |

### Типы Event по категориям

| Категория | @type |
|-----------|-------|
| Театр, балет, опера | `TheaterEvent` |
| Концерты | `MusicEvent` |
| Спорт | `SportsEvent` |
| Стендап, шоу | `ComedyEvent` |
| Выставки | `ExhibitionEvent` |
| Детские | `ChildrensEvent` |
| Фестивали | `Festival` |
| Универсальное | `Event` |

### Типы Place по категориям

| Категория | @type |
|-----------|-------|
| Театры | `PerformingArtsTheater` |
| Концертные залы | `MusicVenue` |
| Стадионы | `StadiumOrArena` |
| Выставочные залы | `ExhibitionCenter` |
| Универсальное | `EventVenue` |

### Эталонная Event разметка (страница мероприятия)

```json
{
  "@context": "https://schema.org",
  "@type": "TheaterEvent",
  "name": "Белоснежка. История одного убийства",
  "description": "Спектакль по мотивам классической сказки в современной интерпретации",
  "startDate": "2026-03-15T19:00:00+03:00",
  "endDate": "2026-03-15T21:30:00+03:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "image": "https://media.ticketland.ru/images/1200x630/event.jpg",
  "location": {
    "@type": "Place",
    "name": "КЦ Хитровка",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Хитровская, 1",
      "addressLocality": "Москва",
      "postalCode": "109147",
      "addressCountry": "RU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "55.7558",
      "longitude": "37.6173"
    }
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "1800",
    "highPrice": "3000",
    "priceCurrency": "RUB",
    "availability": "https://schema.org/InStock",
    "url": "https://www.ticketland.ru/doma-kultury/kc-khitrovka/spektakl-belosnezhka",
    "validFrom": "2026-01-01"
  },
  "performer": {
    "@type": "PerformingGroup",
    "name": "Театр на Хитровке"
  },
  "organizer": {
    "@type": "Organization",
    "name": "КЦ Хитровка",
    "url": "https://www.ticketland.ru/doma-kultury/kc-khitrovka"
  }
}
```

### Эталонная Place разметка (страница площадки)

```json
{
  "@context": "https://schema.org",
  "@type": "PerformingArtsTheater",
  "name": "КЦ Хитровка",
  "description": "Культурный центр в историческом районе Москвы",
  "image": "https://media.ticketland.ru/images/venue.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Хитровская, 1",
    "addressLocality": "Москва",
    "postalCode": "109147",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "55.7558",
    "longitude": "37.6173"
  },
  "url": "https://www.ticketland.ru/doma-kultury/kc-khitrovka",
  "telephone": "+7 (495) 123-45-67",
  "event": [
    {
      "@type": "TheaterEvent",
      "name": "Белоснежка. История одного убийства",
      "startDate": "2026-03-15T19:00:00+03:00",
      "url": "https://www.ticketland.ru/doma-kultury/kc-khitrovka/spektakl-belosnezhka"
    }
  ]
}
```

### Эталонная Person/PerformingGroup разметка (страница исполнителя)

```json
{
  "@context": "https://schema.org",
  "@type": "PerformingGroup",
  "name": "Театр на Цветном",
  "description": "Московский театр под руководством...",
  "image": "https://media.ticketland.ru/images/artist.jpg",
  "url": "https://www.ticketland.ru/teatry/teatr-na-tsvetnom",
  "sameAs": [
    "https://vk.com/teatrnacvetnom",
    "https://t.me/teatrnacvetnom"
  ],
  "event": [...]
}
```

Для сольных исполнителей: `"@type": "Person"` с полями `givenName`, `familyName`.

### Эталонная ItemList разметка (страница категории)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Театры Москвы",
  "description": "Афиша театров Москвы. Билеты на спектакли, балет, оперу",
  "numberOfItems": 150,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://www.ticketland.ru/teatry/bolshoy-teatr/lebedinoe-ozero"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "url": "https://www.ticketland.ru/teatry/mht/vishnevyy-sad"
    }
  ]
}
```

### Эталонная BreadcrumbList разметка

Обязательна для всех страниц, кроме главной:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Главная", "item": "https://www.ticketland.ru/"},
    {"@type": "ListItem", "position": 2, "name": "Дома культуры", "item": "https://www.ticketland.ru/doma-kultury"},
    {"@type": "ListItem", "position": 3, "name": "КЦ Хитровка", "item": "https://www.ticketland.ru/doma-kultury/kc-khitrovka"}
  ]
}
```

### Типичные ошибки при аудите

| Ошибка | Почему плохо |
|--------|--------------|
| Отсутствует Event разметка | Нет rich snippets (дата, цена, место) в выдаче |
| Отсутствует BreadcrumbList | Нет навигационных хлебных крошек в выдаче |
| JSON-LD в footer | Поисковики рекомендуют head |
| Только Organization | Недостаточно для rich snippets на страницах мероприятий |
| Неполные данные в Event | Отсутствуют offers, location, geo — меньше информации в сниппете |
| Нет sameAs для исполнителей | Упущена связь с соцсетями |

---

## Технические требования

### Meta Robots

| Тип страницы | Директива |
|--------------|-----------|
| Основные страницы | Отсутствует (index, follow по умолчанию) |
| Страницы с фильтрами | `noindex, follow` |
| Страницы пагинации | `noindex, follow` + rel="next/prev" |
| Архивные мероприятия | `noindex, nofollow` |

### Эталонный Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Правила:
- Разрешать масштабирование пользователем (accessibility)
- НЕ использовать `user-scalable=no`, `maximum-scale=1`, `minimum-scale=1`

### Hreflang (для мультиязычных версий)

```html
<link rel="alternate" hreflang="ru" href="https://www.ticketland.ru/[path]" />
<link rel="alternate" hreflang="x-default" href="https://www.ticketland.ru/[path]" />
```

---

## robots.txt

### Эталонная структура

| Директива | Значение |
|-----------|----------|
| Sitemap | `https://www.ticketland.ru/files/sitemap.www.xml` |
| Disallow | `/shopcart/*`, `/search/*`, `/private/*`, `/login/*`, `/order/*`, `/hallview/*` |
| Allow | `/login/$`, статика (jpg, png, css, js, webp) |
| Clean-param | UTM-метки, параметры фильтрации |
| Crawl-delay | `1` (рекомендуется) |

---

## Контент страницы

### Заголовки (H1-H6)

| Элемент | Правило |
|---------|---------|
| H1 | Один на страницу, совпадает с названием мероприятия/площадки |
| H2 | Разделы: «Описание», «Расписание», «О площадке» |
| H3-H6 | Подразделы внутри H2 |

### Alt-атрибуты изображений

| Тип изображения | Формат alt |
|-----------------|------------|
| Афиша мероприятия | `Афиша спектакля «[Название]»` |
| Фото площадки | `Зал [Площадка], [Город]` |
| Фото исполнителя | `[Имя исполнителя]` |

### Внутренняя перелинковка

- Мероприятие -> Площадка
- Мероприятие -> Исполнитель
- Мероприятие -> Категория
- Площадка -> Другие мероприятия на площадке
- Категория -> Подкатегории

---

## Чеклисты для аудита

### Страница мероприятия

- [ ] Title: 50-60 символов, «Билеты на [название]» в начале
- [ ] Description: 150-160 символов, цена, дата, без эмодзи
- [ ] Canonical: точный URL страницы (НЕ главная)
- [ ] og:url: точный URL страницы (НЕ главная)
- [ ] og:type: `event`
- [ ] og:image: 1200x630, указаны width/height
- [ ] JSON-LD Event/TheaterEvent/MusicEvent в HEAD
- [ ] JSON-LD BreadcrumbList
- [ ] Нет meta keywords

### Страница площадки

- [ ] Title: «[Название] — афиша и билеты | Ticketland»
- [ ] Description: афиша на месяц, топ-события
- [ ] Canonical: точный URL страницы
- [ ] og:type: `place`
- [ ] JSON-LD PerformingArtsTheater/MusicVenue в HEAD
- [ ] JSON-LD BreadcrumbList

### Страница исполнителя

- [ ] Title: «[Имя] — концерты и билеты | Ticketland»
- [ ] Description: расписание, ближайшие города
- [ ] Canonical: точный URL страницы
- [ ] og:type: `profile`
- [ ] JSON-LD Person/PerformingGroup в HEAD
- [ ] JSON-LD BreadcrumbList
- [ ] Ссылки на соцсети в sameAs

### Страница категории

- [ ] Title: «[Категория] [город] — билеты | Ticketland»
- [ ] Description: количество событий, диапазон цен
- [ ] Canonical: точный URL (без параметров фильтров)
- [ ] og:type: `website`
- [ ] JSON-LD ItemList в HEAD
- [ ] JSON-LD BreadcrumbList

---

## Приоритеты исправлений

| Приоритет | Описание | Примеры |
|-----------|----------|---------|
| **Critical** | Блокирует индексацию или rich snippets | Canonical/og:url на главную, отсутствие Event разметки |
| **High** | Влияет на CTR и отображение в выдаче | Title >60 симв., Description >160 симв., og:image без размеров, нет BreadcrumbList |
| **Medium** | Неоптимально, но не критично | Meta keywords, og:type = website вместо event, JSON-LD в footer вместо HEAD |

---

## Ограничения скилла

- Не содержит инструкций по внедрению (это задача разработчиков)
- Не включает рекомендации по контенту (только технический SEO)
- Не покрывает локальное SEO (Google My Business)
- Не включает рекомендации по скорости загрузки (Core Web Vitals)
