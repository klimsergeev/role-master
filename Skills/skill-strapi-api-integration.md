---
name: skill-strapi-api-integration
description: Процедура интеграции Vue/Nuxt приложения с Strapi v5 API через @nuxtjs/strapi модуль
version: 1.0.0
created: 2026-02-18
type: task
---

# Strapi API Integration

## Назначение

Процедура интеграции Nuxt 3 приложения с Strapi v5 бэкендом. Охватывает настройку модуля `@nuxtjs/strapi`, использование composables для CRUD-операций, работу с populate для relations и media, типизацию ответов API и обработку ошибок.

---

## Самопроверка при подключении

При подключении вывести:

```
**Strapi API Integration подключён**

Ключевые принципы:
- useStrapi() для CRUD, useStrapiClient() для кастомных endpoints
- useAsyncData() для SSR, $fetch для client-side events
- Всегда указывать populate для relations и media
- Типизировать ответы через generics: find<Article>('articles')
```

---

## Алгоритм

### Шаг 1: Установка и настройка модуля

#### Установка

```bash
npx nuxi@latest module add strapi
```

#### Конфигурация nuxt.config.ts

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/strapi'],
  
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    version: 'v5',
    cookie: {},
    cookieName: 'strapi_jwt'
  },
  
  // Раздельные URL для SSR и клиента
  runtimeConfig: {
    strapi: {
      url: 'http://strapi:1337' // internal Docker network
    },
    public: {
      strapi: {
        url: 'https://api.example.com' // public URL
      }
    }
  }
})
```

#### Переменные окружения (.env)

```bash
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your-api-token-if-needed
```

### Шаг 2: Создание типов для контент-моделей

#### Структура типов

```
types/
├── strapi.d.ts      # Общие типы Strapi
├── article.ts       # Типы для Article
├── category.ts      # Типы для Category
└── index.ts         # Экспорт всех типов
```

#### Базовые типы Strapi (types/strapi.d.ts)

```ts
// Strapi v5 response wrapper
export interface StrapiResponse<T> {
  data: T
  meta: StrapiMeta
}

export interface StrapiMeta {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

// Strapi v5 entity structure
export interface StrapiEntity<T> {
  id: number
  documentId: string
  attributes: T
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

// Media type
export interface StrapiMedia {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: {
    thumbnail?: StrapiMediaFormat
    small?: StrapiMediaFormat
    medium?: StrapiMediaFormat
    large?: StrapiMediaFormat
  }
  url: string
}

export interface StrapiMediaFormat {
  name: string
  hash: string
  ext: string
  mime: string
  width: number
  height: number
  size: number
  url: string
}

// SEO component type
export interface StrapiSeo {
  metaTitle: string
  metaDescription: string
  ogImage?: StrapiMedia
  canonicalURL?: string
  noIndex?: boolean
}
```

#### Типы контент-модели (types/article.ts)

```ts
import type { StrapiMedia, StrapiSeo, StrapiEntity } from './strapi'
import type { Category } from './category'
import type { Tag } from './tag'

export interface ArticleAttributes {
  title: string
  slug: string
  content: string
  excerpt: string
  publishedAt: string | null
  featuredImage?: StrapiMedia
  category?: StrapiEntity<Category>
  tags?: StrapiEntity<Tag>[]
  seo?: StrapiSeo
}

export type Article = StrapiEntity<ArticleAttributes>
```

### Шаг 3: Использование useStrapi() для CRUD

#### Получение списка (find)

```vue
<script setup lang="ts">
import type { Article } from '~/types'

const { find } = useStrapi<Article>()

// Базовый запрос
const { data: articles } = await useAsyncData('articles', () =>
  find('articles')
)

// С фильтрами и пагинацией
const { data: articles } = await useAsyncData('articles', () =>
  find('articles', {
    filters: {
      category: { slug: { $eq: 'news' } },
      publishedAt: { $notNull: true }
    },
    sort: ['publishedAt:desc'],
    pagination: { page: 1, pageSize: 10 },
    populate: ['featuredImage', 'category', 'tags']
  })
)
</script>
```

#### Получение одной записи (findOne)

```vue
<script setup lang="ts">
import type { Article } from '~/types'

const route = useRoute()
const { findOne } = useStrapi<Article>()

const { data: article, error } = await useAsyncData(
  `article-${route.params.slug}`,
  () => findOne('articles', route.params.slug as string, {
    populate: {
      featuredImage: true,
      category: { fields: ['name', 'slug'] },
      tags: { fields: ['name', 'slug'] },
      seo: { populate: ['ogImage'] }
    }
  })
)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Article not found' })
}
</script>
```

#### Создание записи (create)

```vue
<script setup lang="ts">
import type { Article } from '~/types'

const { create } = useStrapi<Article>()

const form = reactive({
  title: '',
  slug: '',
  content: '',
  category: null as number | null
})

async function onSubmit() {
  try {
    const article = await create('articles', {
      title: form.title,
      slug: form.slug,
      content: form.content,
      category: form.category
    })
    navigateTo(`/articles/${article.data.attributes.slug}`)
  } catch (e) {
    // Ошибка обрабатывается через strapi:error hook
  }
}
</script>
```

#### Обновление записи (update)

```vue
<script setup lang="ts">
import type { Article } from '~/types'

const { update } = useStrapi<Article>()

async function onUpdate(id: number) {
  await update('articles', id, {
    title: form.title,
    content: form.content
  })
}
</script>
```

#### Удаление записи (delete)

```vue
<script setup lang="ts">
const { delete: deleteArticle } = useStrapi()

async function onDelete(id: number) {
  if (confirm('Удалить статью?')) {
    await deleteArticle('articles', id)
    await refreshNuxtData('articles')
  }
}
</script>
```

### Шаг 4: Работа с populate

#### Уровни populate

```ts
// Уровень 1: Все root-level relations (не рекомендуется)
{ populate: '*' }

// Уровень 2: Конкретные поля
{ populate: ['featuredImage', 'category'] }

// Уровень 3: Вложенный populate с фильтрацией
{
  populate: {
    featuredImage: true,
    category: {
      fields: ['name', 'slug']
    },
    author: {
      populate: ['avatar']
    }
  }
}

// Уровень 4: Dynamic zones с populate fragments
{
  populate: {
    blocks: {
      on: {
        'blocks.hero': { populate: ['backgroundImage', 'cta'] },
        'blocks.gallery': { populate: ['images'] },
        'blocks.text-with-image': { populate: ['image'] }
      }
    }
  }
}
```

#### Composable для типизированного populate

```ts
// composables/useArticles.ts
import type { Article } from '~/types'

export function useArticles() {
  const { find, findOne } = useStrapi<Article>()

  const defaultPopulate = {
    featuredImage: true,
    category: { fields: ['name', 'slug'] },
    tags: { fields: ['name', 'slug'] },
    seo: { populate: ['ogImage'] }
  }

  async function getArticles(options?: {
    page?: number
    pageSize?: number
    category?: string
  }) {
    return find('articles', {
      filters: options?.category 
        ? { category: { slug: { $eq: options.category } } }
        : undefined,
      sort: ['publishedAt:desc'],
      pagination: {
        page: options?.page || 1,
        pageSize: options?.pageSize || 10
      },
      populate: defaultPopulate
    })
  }

  async function getArticleBySlug(slug: string) {
    const response = await find('articles', {
      filters: { slug: { $eq: slug } },
      populate: defaultPopulate
    })
    return response.data[0] || null
  }

  return {
    getArticles,
    getArticleBySlug
  }
}
```

### Шаг 5: Работа с media

#### Получение полного URL изображения

```vue
<script setup lang="ts">
const media = useStrapiMedia()

// Преобразует /uploads/image.jpg в http://strapi:1337/uploads/image.jpg
const imageUrl = media(article.featuredImage?.url)
</script>

<template>
  <NuxtImg 
    v-if="article.featuredImage"
    :src="imageUrl"
    :alt="article.featuredImage.alternativeText || article.title"
    :width="article.featuredImage.width"
    :height="article.featuredImage.height"
  />
</template>
```

#### Composable для работы с изображениями

```ts
// composables/useStrapiImage.ts
export function useStrapiImage() {
  const media = useStrapiMedia()

  function getImageUrl(image: StrapiMedia | undefined, format?: 'thumbnail' | 'small' | 'medium' | 'large') {
    if (!image) return null
    
    if (format && image.formats?.[format]) {
      return media(image.formats[format].url)
    }
    
    return media(image.url)
  }

  function getResponsiveSrcSet(image: StrapiMedia | undefined) {
    if (!image) return ''
    
    const sources: string[] = []
    
    if (image.formats?.small) {
      sources.push(`${media(image.formats.small.url)} ${image.formats.small.width}w`)
    }
    if (image.formats?.medium) {
      sources.push(`${media(image.formats.medium.url)} ${image.formats.medium.width}w`)
    }
    if (image.formats?.large) {
      sources.push(`${media(image.formats.large.url)} ${image.formats.large.width}w`)
    }
    sources.push(`${media(image.url)} ${image.width}w`)
    
    return sources.join(', ')
  }

  return {
    getImageUrl,
    getResponsiveSrcSet
  }
}
```

#### Загрузка файлов

```vue
<script setup lang="ts">
const client = useStrapiClient()
const fileInput = ref<HTMLInputElement | null>(null)

async function uploadImage(articleId: number) {
  const file = fileInput.value?.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('files.featuredImage', file)
  formData.append('data', JSON.stringify({}))

  await client(`/articles/${articleId}`, {
    method: 'PUT',
    body: formData
  })
}
</script>

<template>
  <input ref="fileInput" type="file" accept="image/*" />
  <button @click="uploadImage(article.id)">Загрузить</button>
</template>
```

### Шаг 6: Выбор метода загрузки данных

| Метод | Когда использовать |
|-------|-------------------|
| `useAsyncData` + `useStrapi` | SSR, кэширование, SEO-критичные страницы |
| `useFetch` | Простые запросы без Strapi composables |
| `$fetch` / `useStrapiClient` | Client-side events (onClick, onSubmit) |
| `useLazyAsyncData` | Некритичные данные, отложенная загрузка |

#### SSR с useAsyncData (рекомендуется)

```vue
<script setup lang="ts">
const { findOne } = useStrapi<Article>()

// Данные загружаются на сервере, кэшируются
const { data, pending, error, refresh } = await useAsyncData(
  'article',
  () => findOne('articles', route.params.id)
)
</script>
```

#### Client-side с $fetch

```vue
<script setup lang="ts">
const client = useStrapiClient()

// Только на клиенте, без SSR
async function incrementViews(id: number) {
  await client(`/articles/${id}/increment-views`, {
    method: 'POST'
  })
}
</script>
```

#### Lazy loading

```vue
<script setup lang="ts">
const { find } = useStrapi<Article>()

// Загружается после рендера, не блокирует SSR
const { data: relatedArticles, pending } = useLazyAsyncData(
  'related-articles',
  () => find('articles', {
    filters: { category: { id: article.value?.category?.id } },
    pagination: { pageSize: 3 }
  }),
  { server: false }
)
</script>
```

### Шаг 7: Обработка ошибок

#### Глобальный обработчик (plugins/strapi.client.ts)

```ts
import type { Strapi5Error } from '@nuxtjs/strapi'

export default defineNuxtPlugin((nuxt) => {
  nuxt.hook('strapi:error' as any, (error: Strapi5Error) => {
    // Интеграция с toast/notification системой
    const toast = useToast() // или ваша система уведомлений
    
    toast.add({
      title: error.error.name,
      description: error.error.message,
      color: 'red'
    })
    
    // Логирование
    console.error('[Strapi Error]', {
      status: error.error.status,
      name: error.error.name,
      message: error.error.message,
      details: error.error.details
    })
  })
})
```

#### Локальная обработка ошибок

```vue
<script setup lang="ts">
const { findOne } = useStrapi<Article>()

const { data, error } = await useAsyncData('article', () =>
  findOne('articles', route.params.id)
)

// Обработка 404
if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Статья не найдена'
  })
}

// Обработка в try/catch для mutations
async function onSubmit() {
  try {
    await create('articles', form)
  } catch (e) {
    if (e.error?.status === 400) {
      // Validation error
      validationErrors.value = e.error.details?.errors || []
    }
  }
}
</script>
```

### Шаг 8: Single Types

```vue
<script setup lang="ts">
import type { Homepage } from '~/types'

const { findOne } = useStrapi<Homepage>()

// Single type не требует id
const { data: homepage } = await useAsyncData('homepage', () =>
  findOne('homepage', {
    populate: {
      hero: { populate: ['backgroundImage'] },
      featuredArticles: { populate: ['featuredImage'] },
      seo: { populate: ['ogImage'] }
    }
  })
)
</script>
```

### Шаг 9: GraphQL (опционально)

#### Настройка

```ts
// nuxt.config.ts
import gql from '@rollup/plugin-graphql'

export default defineNuxtConfig({
  vite: {
    plugins: [gql()]
  }
})
```

#### Использование

```vue
<script setup lang="ts">
const graphql = useStrapiGraphQL()

// Inline query
const { data } = await useAsyncData('articles', () =>
  graphql(`
    query GetArticles($limit: Int) {
      articles(pagination: { limit: $limit }) {
        data {
          id
          attributes {
            title
            slug
          }
        }
      }
    }
  `, { limit: 10 })
)

// Imported query
import articlesQuery from '~/queries/articles.gql'
const { data } = await useAsyncData('articles', () =>
  graphql(articlesQuery, { limit: 10 })
)
</script>
```

---

## Правила

### Выбор метода загрузки

- ЕСЛИ страница SEO-критична → `useAsyncData` + `useStrapi`
- ЕСЛИ данные нужны после user action → `useStrapiClient` / `$fetch`
- ЕСЛИ данные некритичны для первого рендера → `useLazyAsyncData` с `server: false`

### Работа с populate

- НИКОГДА не использовать `populate: '*'` в production (тянет все relations)
- ВСЕГДА указывать конкретные поля через `fields` для relations
- ВСЕГДА использовать populate fragments для dynamic zones

### Типизация

- ВСЕГДА создавать типы для контент-моделей
- ВСЕГДА использовать generics: `find<Article>('articles')`
- ЕСЛИ типы меняются часто → генерировать из Strapi через `ts:generate-types`

### Производительность

- ЕСЛИ данные не меняются часто → использовать `getCachedData` в `useAsyncData`
- ЕСЛИ нужна пагинация → использовать `pagination` параметр, не загружать всё
- ЕСЛИ изображения тяжёлые → использовать `formats` (thumbnail, small, medium)

### Обработка ошибок

- ВСЕГДА настраивать глобальный `strapi:error` hook
- ВСЕГДА обрабатывать 404 для динамических страниц
- НИКОГДА не показывать сырые ошибки Strapi пользователю

---

## Формат выдачи

При настройке интеграции выдавать:

```markdown
## Strapi API Integration: [Название проекта]

### Конфигурация
- Strapi URL: [url]
- API Prefix: /api
- Version: v5

### Типы (types/)
| Файл | Описание |
|------|----------|
| strapi.d.ts | Базовые типы Strapi |
| article.ts | Article entity |

### Composables (composables/)
| Файл | Методы |
|------|--------|
| useArticles.ts | getArticles, getArticleBySlug |

### Страницы с интеграцией
| Страница | Метод загрузки | Populate |
|----------|----------------|----------|
| /articles | useAsyncData + find | featuredImage, category |
| /articles/[slug] | useAsyncData + findOne | full |
```

---

## Примеры

### Пример 1: Страница списка статей

**Вход:** Нужна страница `/articles` с пагинацией и фильтром по категории.

**Выход:**

```vue
<!-- pages/articles/index.vue -->
<script setup lang="ts">
import type { Article, Category } from '~/types'

const route = useRoute()
const { find } = useStrapi<Article>()
const { find: findCategories } = useStrapi<Category>()

const page = computed(() => Number(route.query.page) || 1)
const category = computed(() => route.query.category as string | undefined)

// Загрузка статей
const { data: articlesResponse, pending } = await useAsyncData(
  `articles-${page.value}-${category.value}`,
  () => find('articles', {
    filters: category.value
      ? { category: { slug: { $eq: category.value } } }
      : undefined,
    sort: ['publishedAt:desc'],
    pagination: { page: page.value, pageSize: 12 },
    populate: {
      featuredImage: true,
      category: { fields: ['name', 'slug'] }
    }
  }),
  { watch: [page, category] }
)

// Загрузка категорий для фильтра
const { data: categories } = await useAsyncData('categories', () =>
  findCategories('categories', {
    sort: ['name:asc'],
    fields: ['name', 'slug']
  })
)

const articles = computed(() => articlesResponse.value?.data || [])
const pagination = computed(() => articlesResponse.value?.meta?.pagination)
</script>

<template>
  <div>
    <!-- Фильтр по категориям -->
    <nav>
      <NuxtLink :to="{ query: {} }">Все</NuxtLink>
      <NuxtLink
        v-for="cat in categories?.data"
        :key="cat.id"
        :to="{ query: { category: cat.attributes.slug } }"
      >
        {{ cat.attributes.name }}
      </NuxtLink>
    </nav>

    <!-- Список статей -->
    <div v-if="pending">Загрузка...</div>
    <div v-else class="grid">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <!-- Пагинация -->
    <Pagination
      v-if="pagination"
      :current="pagination.page"
      :total="pagination.pageCount"
    />
  </div>
</template>
```

### Пример 2: Страница статьи с SEO

**Вход:** Нужна страница `/articles/[slug]` с SEO-метаданными из Strapi.

**Выход:**

```vue
<!-- pages/articles/[slug].vue -->
<script setup lang="ts">
import type { Article } from '~/types'

const route = useRoute()
const { find } = useStrapi<Article>()
const media = useStrapiMedia()

const { data: article, error } = await useAsyncData(
  `article-${route.params.slug}`,
  async () => {
    const response = await find('articles', {
      filters: { slug: { $eq: route.params.slug } },
      populate: {
        featuredImage: true,
        category: { fields: ['name', 'slug'] },
        tags: { fields: ['name', 'slug'] },
        author: { populate: ['avatar'] },
        seo: { populate: ['ogImage'] }
      }
    })
    return response.data[0] || null
  }
)

if (error.value || !article.value) {
  throw createError({ statusCode: 404, message: 'Статья не найдена' })
}

// SEO
const seo = computed(() => article.value?.attributes.seo)
const ogImage = computed(() => 
  seo.value?.ogImage 
    ? media(seo.value.ogImage.url)
    : article.value?.attributes.featuredImage
      ? media(article.value.attributes.featuredImage.url)
      : null
)

useHead({
  title: seo.value?.metaTitle || article.value?.attributes.title,
  meta: [
    { name: 'description', content: seo.value?.metaDescription || article.value?.attributes.excerpt }
  ]
})

useSeoMeta({
  ogTitle: seo.value?.metaTitle || article.value?.attributes.title,
  ogDescription: seo.value?.metaDescription || article.value?.attributes.excerpt,
  ogImage: ogImage.value,
  ogType: 'article'
})

// Canonical
if (seo.value?.canonicalURL) {
  useHead({
    link: [{ rel: 'canonical', href: seo.value.canonicalURL }]
  })
}

// noindex
if (seo.value?.noIndex) {
  useHead({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }]
  })
}
</script>
```

### Пример 3: Dynamic Zone (Page Builder)

**Вход:** Страница с dynamic zone `blocks` для page builder.

**Выход:**

```vue
<!-- pages/[...slug].vue -->
<script setup lang="ts">
import type { Page } from '~/types'

const route = useRoute()
const { find } = useStrapi<Page>()

const { data: page, error } = await useAsyncData(
  `page-${route.params.slug}`,
  async () => {
    const slug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug || 'home'

    const response = await find('pages', {
      filters: { slug: { $eq: slug } },
      populate: {
        seo: { populate: ['ogImage'] },
        blocks: {
          on: {
            'blocks.hero': {
              populate: ['backgroundImage', 'cta']
            },
            'blocks.text-with-image': {
              populate: ['image']
            },
            'blocks.gallery': {
              populate: ['images']
            },
            'blocks.cta': true,
            'blocks.testimonial': {
              populate: ['avatar']
            },
            'blocks.faq': true
          }
        }
      }
    })
    return response.data[0] || null
  }
)

if (error.value || !page.value) {
  throw createError({ statusCode: 404, message: 'Страница не найдена' })
}
</script>

<template>
  <div>
    <DynamicZone :blocks="page.attributes.blocks" />
  </div>
</template>
```

```vue
<!-- components/DynamicZone.vue -->
<script setup lang="ts">
defineProps<{
  blocks: Array<{ __component: string; [key: string]: any }>
}>()

const componentMap: Record<string, Component> = {
  'blocks.hero': resolveComponent('BlocksHero'),
  'blocks.text-with-image': resolveComponent('BlocksTextWithImage'),
  'blocks.gallery': resolveComponent('BlocksGallery'),
  'blocks.cta': resolveComponent('BlocksCta'),
  'blocks.testimonial': resolveComponent('BlocksTestimonial'),
  'blocks.faq': resolveComponent('BlocksFaq')
}
</script>

<template>
  <template v-for="(block, index) in blocks" :key="`${block.__component}-${index}`">
    <component
      :is="componentMap[block.__component]"
      v-if="componentMap[block.__component]"
      v-bind="block"
    />
    <div v-else class="text-red-500">
      Unknown block: {{ block.__component }}
    </div>
  </template>
</template>
```

---

## Чеклист интеграции

- [ ] Модуль `@nuxtjs/strapi` установлен и настроен
- [ ] Переменные окружения настроены (STRAPI_URL)
- [ ] Типы для контент-моделей созданы
- [ ] Глобальный обработчик ошибок настроен (strapi:error hook)
- [ ] Composables для основных сущностей созданы
- [ ] Populate настроен для всех relations и media
- [ ] SEO-метаданные интегрированы (useHead, useSeoMeta)
- [ ] 404 обрабатывается для динамических страниц
- [ ] Изображения используют useStrapiMedia()

---

## Что НЕ входит в scope

- Аутентификация и авторизация (отдельный скилл: skill-strapi-auth-flow)
- Проектирование контент-моделей (skill-strapi-content-modeling)
- Кастомизация Strapi бэкенда (controllers, services)
- Деплой и инфраструктура
- Кэширование на уровне CDN/Edge
