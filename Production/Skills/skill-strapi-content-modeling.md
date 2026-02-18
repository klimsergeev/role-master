---
name: skill-strapi-content-modeling
description: Процедура проектирования контент-типов, компонентов и dynamic zones в Strapi v5
---

# Strapi Content Modeling

## Назначение

Процедура проектирования и создания контент-модели в Strapi v5. Применяется в начале проекта для определения структуры данных, а также при добавлении новых сущностей. Охватывает выбор типов, проектирование компонентов, настройку связей и генерацию TypeScript-типов.

---

## Самопроверка при подключении

При подключении вывести:

```
**Strapi Content Modeling подключён**

Ключевые принципы:
- Collection type для множественных сущностей, Single type для единичных
- Компоненты для встраиваемых данных, Relations для ссылочных
- Dynamic zones для page builder паттерна
- Максимум 5-7 relations на тип, 2-3 уровня вложенности компонентов
```

---

## Алгоритм

### Шаг 1: Анализ требований

1. Определить сущности предметной области
2. Для каждой сущности ответить:
   - Сколько экземпляров будет? (один / много)
   - Нужен ли отдельный API endpoint?
   - Данные уникальны для каждой записи или переиспользуются?

**Выход:** Список сущностей с предварительной классификацией.

### Шаг 2: Выбор типа для каждой сущности

| Вопрос | Collection Type | Single Type | Component |
|--------|-----------------|-------------|-----------|
| Сколько экземпляров? | Много | Один | Встраивается в другие |
| Нужен API endpoint? | Да (`/api/articles`) | Да (`/api/homepage`) | Нет |
| Редактируется отдельно? | Да | Да | Только через родителя |
| Переиспользуется? | Через relations | — | Дублируется в каждой записи |

**Типичные Single Types:**
- `SiteSettings` — логотип, название, соцсети
- `Homepage` — hero, featured блоки
- `Footer` — колонки, копирайт
- `Navigation` — меню (repeatable component)
- `GlobalSeo` — дефолтные meta-теги

**Правило:** Если есть сомнение «а вдруг понадобится второй?» — используй Collection Type.

### Шаг 3: Проектирование компонентов

#### Когда создавать компонент

- Повторяющиеся группы полей (FAQ: вопрос + ответ)
- Структурированные подобъекты (адрес: улица, город, индекс)
- Общие поля для разных типов (SEO: title, description, ogImage)

#### Структура директорий компонентов

```
src/components/
├── shared/          # Кросс-функциональные
│   ├── seo.json
│   ├── social-link.json
│   └── breadcrumb.json
├── blocks/          # Блоки для page builder
│   ├── hero.json
│   ├── text-with-image.json
│   ├── gallery.json
│   ├── cta.json
│   └── testimonial.json
├── layout/          # Структурные элементы
│   ├── menu-item.json
│   └── footer-column.json
└── form/            # Формы
    ├── text-input.json
    └── form-field.json
```

#### Эталонный компонент SEO

```json
{
  "collectionName": "components_shared_seos",
  "info": {
    "displayName": "SEO",
    "icon": "search",
    "description": "Search engine optimization metadata"
  },
  "attributes": {
    "metaTitle": {
      "type": "string",
      "maxLength": 60
    },
    "metaDescription": {
      "type": "text",
      "maxLength": 160
    },
    "ogImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "canonicalURL": {
      "type": "string"
    },
    "noIndex": {
      "type": "boolean",
      "default": false
    }
  }
}
```

### Шаг 4: Проектирование связей (Relations)

#### Типы связей

| Тип | Синтаксис | Пример |
|-----|-----------|--------|
| One-to-One | `oneToOne` | User ↔ Profile |
| One-to-Many | `oneToMany` | Category → Articles |
| Many-to-One | `manyToOne` | Article → Category |
| Many-to-Many | `manyToMany` | Article ↔ Tags |

#### Синтаксис в schema.json

```json
{
  "attributes": {
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "inversedBy": "articles"
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag",
      "inversedBy": "articles"
    }
  }
}
```

#### Компонент vs Relation: матрица выбора

| Фактор | Component | Relation |
|--------|-----------|----------|
| Свой API endpoint | Нет | Да |
| Редактируется отдельно | Нет | Да |
| Изменение обновляет везде | Нет (копия) | Да (ссылка) |
| Производительность | Быстрее (нет join) | Требует `populate` |
| Использовать для | SEO, адрес, FAQ | Автор, категория, теги |

### Шаг 5: Проектирование Dynamic Zones

#### Когда использовать

- Page builder паттерн
- Контент с произвольным порядком блоков
- Гибкие лендинги

#### Определение в schema.json

```json
{
  "attributes": {
    "blocks": {
      "type": "dynamiczone",
      "components": [
        "blocks.hero",
        "blocks.text-with-image",
        "blocks.gallery",
        "blocks.cta",
        "blocks.testimonial",
        "blocks.video-embed",
        "blocks.accordion"
      ]
    }
  }
}
```

#### Запрос dynamic zone с populate

```js
const page = await strapi.documents('api::page.page').findOne(documentId, {
  populate: {
    blocks: {
      on: {
        'blocks.hero': { populate: ['backgroundImage', 'cta'] },
        'blocks.text-with-image': { populate: ['image'] },
        'blocks.gallery': { populate: ['images'] },
        'blocks.cta': true,
        'blocks.testimonial': { populate: ['avatar'] },
        'blocks.video-embed': true,
        'blocks.accordion': true,
      },
    },
  },
});
```

#### Рендеринг на фронтенде (Vue)

```vue
<script setup lang="ts">
const componentMap = {
  'blocks.hero': resolveComponent('BlocksHero'),
  'blocks.text-with-image': resolveComponent('BlocksTextWithImage'),
  'blocks.gallery': resolveComponent('BlocksGallery'),
  'blocks.cta': resolveComponent('BlocksCta'),
}
</script>

<template>
  <div v-for="(block, index) in blocks" :key="`${block.__component}-${index}`">
    <component :is="componentMap[block.__component]" v-bind="block" />
  </div>
</template>
```

### Шаг 6: Именование и конвенции

| Элемент | Конвенция | Пример |
|---------|-----------|--------|
| Collection type | Singular, kebab-case | `article`, `blog-post` |
| Single type | PascalCase описательное | `SiteSettings`, `Homepage` |
| Component | category.name | `shared.seo`, `blocks.hero` |
| Поля | camelCase | `publishedDate`, `isActive` |
| Boolean поля | Префикс is/has | `isPublished`, `hasFeatured` |
| Slug поля | kebab-case значения | `my-article-slug` |

### Шаг 7: Генерация TypeScript-типов

```bash
# Генерация типов
npm run strapi ts:generate-types

# Автогенерация при рестарте (config/typescript.ts)
export default {
  autogenerate: true,
};
```

Типы создаются в `types/generated/` и включают все content-types и components.

---

## Правила

### Ограничения производительности

- НИКОГДА не создавать более 5-7 relations на один content-type
- НИКОГДА не вкладывать компоненты глубже 2-3 уровней
- ВСЕГДА использовать `populate` явно, не полагаться на `*`

### Выбор типа данных

- ЕСЛИ данные уникальны для каждой записи → Component
- ЕСЛИ данные переиспользуются и редактируются отдельно → Relation
- ЕСЛИ «может понадобиться второй экземпляр» → Collection Type, не Single Type

### Эволюция схемы

- ЕСЛИ добавляется новое поле → Non-breaking, добавить с default
- ЕСЛИ переименовывается поле → Breaking, миграция данных
- ЕСЛИ компонент меняется на relation → Breaking, скрипт миграции
- ЕСЛИ добавляется блок в dynamic zone → Non-breaking
- ЕСЛИ удаляется блок из dynamic zone → Breaking, сначала миграция

### Anti-patterns

- НИКОГДА не использовать JSON-поля вместо компонентов (нет UI, нет валидации)
- НИКОГДА не создавать один гигантский Page type для всего
- НИКОГДА не использовать компонент для данных, которые должны обновляться централизованно (автор, категория)

---

## Формат выдачи

При проектировании контент-модели выдавать:

```markdown
## Контент-модель: [Название проекта]

### Collection Types
| Название | API endpoint | Описание | Ключевые поля |
|----------|--------------|----------|---------------|
| article | /api/articles | Статьи блога | title, slug, content, category, tags, seo |

### Single Types
| Название | API endpoint | Описание |
|----------|--------------|----------|
| Homepage | /api/homepage | Главная страница |

### Components
| Категория | Название | Описание | Используется в |
|-----------|----------|----------|----------------|
| shared | seo | SEO-метаданные | Article, Page, Homepage |
| blocks | hero | Hero-секция | Page (dynamic zone) |

### Relations
| Источник | Тип связи | Цель |
|----------|-----------|------|
| Article | manyToOne | Category |
| Article | manyToMany | Tag |

### Dynamic Zones
| Content Type | Поле | Компоненты |
|--------------|------|------------|
| Page | blocks | hero, text-with-image, gallery, cta |
```

---

## Примеры

### Пример 1: Блог с категориями и тегами

**Вход:** Нужен блог со статьями, категориями, тегами и SEO.

**Выход:**

```markdown
## Контент-модель: Blog

### Collection Types
| Название | API endpoint | Ключевые поля |
|----------|--------------|---------------|
| article | /api/articles | title, slug, content, excerpt, publishedAt |
| category | /api/categories | name, slug, description |
| tag | /api/tags | name, slug |

### Components
| Категория | Название | Поля |
|-----------|----------|------|
| shared | seo | metaTitle, metaDescription, ogImage, canonicalURL, noIndex |

### Relations
| Источник | Тип | Цель |
|----------|-----|------|
| Article | manyToOne | Category |
| Article | manyToMany | Tag |
| Category | oneToMany | Article |
| Tag | manyToMany | Article |

### Использование компонентов
- Article.seo: component shared.seo
- Category.seo: component shared.seo
```

### Пример 2: Лендинг с page builder

**Вход:** Нужен конструктор страниц с разными блоками.

**Выход:**

```markdown
## Контент-модель: Landing Pages

### Collection Types
| Название | API endpoint | Ключевые поля |
|----------|--------------|---------------|
| page | /api/pages | title, slug, blocks (dynamic zone), seo |

### Single Types
| Название | Описание |
|----------|----------|
| SiteSettings | Логотип, название, соцсети |
| Navigation | Меню (repeatable menu-item) |
| Footer | Колонки, копирайт |

### Components (blocks/)
| Название | Поля |
|----------|------|
| hero | title, subtitle, backgroundImage, cta |
| text-with-image | heading, text, image, imagePosition |
| gallery | images, columns, gap |
| cta | heading, text, buttonText, buttonUrl |
| testimonial | quote, author, avatar, company |
| faq | items (repeatable: question, answer) |

### Components (shared/)
| Название | Поля |
|----------|------|
| seo | metaTitle, metaDescription, ogImage |
| social-link | platform, url, icon |

### Components (layout/)
| Название | Поля |
|----------|------|
| menu-item | label, url, target, children (self-ref) |
| footer-column | title, links (repeatable) |

### Dynamic Zone: Page.blocks
Компоненты: hero, text-with-image, gallery, cta, testimonial, faq
```

### Пример 3: Edge-case — рефакторинг компонента в relation

**Вход:** В Article есть component `author` (name, bio, avatar). Нужно сделать авторов переиспользуемыми.

**Выход:**

```markdown
## Миграция: Author component → relation

### Проблема
Компонент author дублируется в каждой статье. Изменение bio автора требует обновления всех статей.

### Решение
1. Создать Collection Type `author`:
   - name (string)
   - bio (text)
   - avatar (media)
   - slug (string, unique)

2. Добавить relation в Article:
   - author: manyToOne → Author

3. Миграция данных:
   - Скрипт: извлечь уникальных авторов из компонентов
   - Создать записи в Author
   - Обновить Article.author на relation

4. Удалить компонент author после миграции

### Breaking change
- API response меняется: author теперь требует populate
- Фронтенд: обновить запросы и типы
```

---

## Паттерны проектирования

### Паттерн: Taxonomy (категории + теги)

```
Article
├── title
├── content
├── category (relation: manyToOne → Category)
└── tags (relation: manyToMany → Tag)

Category (collection type)
├── name
├── slug
└── articles (relation: oneToMany → Article)

Tag (collection type)
├── name
├── slug
└── articles (relation: manyToMany → Article)
```

### Паттерн: Product с вариантами

```
Product (collection type)
├── name
├── description
├── basePrice
├── images (media, multiple)
├── category (relation → Category)
├── variants (repeatable component: product.variant)
│   ├── size
│   ├── color
│   ├── sku
│   ├── priceModifier
│   └── stock
└── specifications (repeatable component: product.spec)
    ├── key
    └── value
```

### Паттерн: Вложенная навигация

```
NavigationItem (component: layout.nav-item)
├── label (string)
├── url (string)
├── target (enum: _self, _blank)
├── icon (media)
└── children (repeatable component: layout.nav-item)
```

**Ограничение:** Не более 2-3 уровней вложенности.

---

## Чеклист перед финализацией модели

- [ ] Каждая сущность классифицирована (Collection / Single / Component)
- [ ] Нет Collection Type с одним экземпляром (должен быть Single Type)
- [ ] Нет Single Type, который может стать множественным
- [ ] Компоненты организованы по категориям (shared, blocks, layout, form)
- [ ] Relations не превышают 5-7 на тип
- [ ] Вложенность компонентов не превышает 2-3 уровня
- [ ] SEO-компонент добавлен к публичным страницам
- [ ] Именование соответствует конвенциям
- [ ] TypeScript-типы генерируются без ошибок

---

## Что НЕ входит в scope

- Настройка API permissions и ролей
- Кастомизация контроллеров и сервисов
- Деплой и инфраструктура
- Интеграция с фронтендом (отдельный скилл: skill-strapi-api-integration)
- Аутентификация (отдельный скилл: skill-strapi-auth-flow)
- Локализация (i18n) — требует отдельного скилла при необходимости
