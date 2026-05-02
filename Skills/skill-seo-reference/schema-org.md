# Schema.org

## Назначение

Справочник типов разметки Schema.org с JSON-LD примерами для разных типов сайтов.

## Event

Для мероприятий: концерты, спектакли, выставки.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Белоснежка. История одного убийства",
  "startDate": "2026-03-15T19:00",
  "location": {
    "@type": "Place",
    "name": "КЦ Хитровка",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Москва",
      "streetAddress": "ул. Примерная, 1"
    }
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.ticketland.ru/...",
    "priceCurrency": "RUB",
    "price": "1800",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-02-06"
  },
  "performer": {
    "@type": "PerformingGroup",
    "name": "Название труппы"
  }
}
```

## Product

Для товаров, с AggregateOffer и aggregateRating.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Билет на спектакль «Белоснежка»",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "1800",
    "highPrice": "3000",
    "priceCurrency": "RUB",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

## BreadcrumbList

Хлебные крошки, 3-уровневая иерархия.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://www.ticketland.ru/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Дома культуры",
      "item": "https://www.ticketland.ru/doma-kultury"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "КЦ Хитровка",
      "item": "https://www.ticketland.ru/doma-kultury/kc-khitrovka"
    }
  ]
}
```

## Article

Для медиа, блогов, статей.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Заголовок статьи",
  "author": { "@type": "Person", "name": "Имя Автора", "url": "https://..." },
  "datePublished": "2026-05-01",
  "dateModified": "2026-05-01",
  "publisher": { "@type": "Organization", "name": "Название", "logo": { "@type": "ImageObject", "url": "https://..." } },
  "image": "https://...",
  "description": "Краткое описание статьи"
}
```

## LocalBusiness

Для локального бизнеса.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Название",
  "address": { "@type": "PostalAddress", "streetAddress": "...", "addressLocality": "Москва", "postalCode": "...", "addressCountry": "RU" },
  "telephone": "+7...",
  "openingHoursSpecification": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday"], "opens": "09:00", "closes": "18:00" },
  "geo": { "@type": "GeoCoordinates", "latitude": "55.7558", "longitude": "37.6173" }
}
```

## FAQPage

Для страниц с FAQ. FAQPage +30% к вероятности цитирования в AI Overviews.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Вопрос 1?", "acceptedAnswer": { "@type": "Answer", "text": "Ответ 1." } },
    { "@type": "Question", "name": "Вопрос 2?", "acceptedAnswer": { "@type": "Answer", "text": "Ответ 2." } }
  ]
}
```

## Другие типы

- **Article** — медиа, блоги
- **Product** — интернет-магазины
- **LocalBusiness** — локальный бизнес
- **Organization** — корпоративные сайты
- **Course** — образовательные платформы (ограниченная поддержка rich results)
- **Recipe** — кулинарные сайты
- **JobPosting** — вакансии
- **FAQPage** — страницы с FAQ

## Устаревшие/удалённые типы (2025-2026)

Google убрал поддержку rich results для 7 типов (январь 2026):
- Practice Problem
- Q&A
- SpecialAnnouncement
- Book Actions
- Course Info (частично)
- Claim Review
- Estimated Salary

HowTo rich results убраны с сентября 2023 (десктоп и мобайл).

Разметка HowTo/Q&A не навредит, но rich results больше не генерирует. **31 тип по-прежнему активен** — фокус на Product, Event, Article, LocalBusiness, FAQPage, Recipe, JobPosting, BreadcrumbList.

## Какой Schema.org тип для какого сайта

| Тип сайта | Основной Schema.org | Дополнительные |
|-----------|-------------------|----------------|
| Интернет-магазин | Product, AggregateOffer | BreadcrumbList, FAQPage, Organization |
| Билетный сервис | Event, Offer | BreadcrumbList, Organization |
| Медиа / блог | Article | FAQPage, BreadcrumbList, Organization |
| Локальный бизнес | LocalBusiness | FAQPage, Product (если товары) |
| SaaS | Organization, Product | FAQPage, Article (блог) |
| Образование | Course (ограниченно) | Article, FAQPage, Organization |
| Рекрутинг | JobPosting | Organization, BreadcrumbList |
