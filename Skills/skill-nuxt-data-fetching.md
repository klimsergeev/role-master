---
name: skill-nuxt-data-fetching
description: Процедура выбора и использования методов загрузки данных в Nuxt 3 (useFetch, useAsyncData, $fetch)
version: 1.0.0
created: 2025-02-18
type: task
---

# Nuxt Data Fetching

## Назначение

Процедура выбора и использования методов загрузки данных в Nuxt 3. Охватывает `useFetch`, `useAsyncData`, `$fetch`, их опции, кэширование, SSR-поведение и обработку ошибок. Применим к любому API (REST, GraphQL, Strapi, и др.).

---

## Самопроверка при подключении

При подключении вывести:

```
**Nuxt Data Fetching подключён**

Ключевые принципы:
- useFetch() — основной метод для SSR + автокэширование
- useAsyncData() — для сложной логики и композиции запросов
- $fetch — только для client-side events (onClick, onSubmit)
- Уникальный key обязателен для дедупликации и кэширования
```

---

## Матрица выбора метода

| Критерий | useFetch | useAsyncData | $fetch |
|----------|----------|--------------|--------|
| SSR | Да | Да | Нет |
| Автокэширование | Да | Да | Нет |
| Дедупликация | Да | Да | Нет |
| Реактивные параметры | Да | Да | Нет |
| Сложная логика | Ограниченно | Да | Да |
| Event handlers | Нет | Нет | Да |
| Использование в composables | Да | Да | Да |

---

## Алгоритм

### Шаг 1: Определить контекст использования

**Вопросы для выбора метода:**

1. Где вызывается код?
   - В `<script setup>` / setup() → `useFetch` или `useAsyncData`
   - В event handler (onClick, onSubmit) → `$fetch`
   - В composable → зависит от того, где вызывается composable

2. Нужны ли данные для SEO?
   - Да → `useFetch` или `useAsyncData` (SSR)
   - Нет → можно `$fetch` или `lazy` варианты

3. Насколько сложная логика получения данных?
   - Простой GET-запрос → `useFetch`
   - Композиция нескольких запросов → `useAsyncData`
   - Трансформация до кэширования → `useAsyncData`

### Шаг 2: Выбрать метод по сценарию

#### Сценарий A: Простой GET-запрос

```ts
// useFetch — простой и декларативный
const { data, pending, error, refresh } = await useFetch('/api/articles')
```

#### Сценарий B: Запрос с реактивными параметрами

```ts
const page = ref(1)
const category = ref('news')

// Автоматически перезапрашивается при изменении параметров
const { data } = await useFetch('/api/articles', {
  query: {
    page,
    category
  }
})
```

#### Сценарий C: Сложная логика / композиция запросов

```ts
const { data: dashboard } = await useAsyncData('dashboard', async () => {
  // Параллельные запросы
  const [user, stats, notifications] = await Promise.all([
    $fetch('/api/user'),
    $fetch('/api/stats'),
    $fetch('/api/notifications')
  ])

  return { user, stats, notifications }
})
```

#### Сценарий D: Трансформация данных ДО кэширования

```ts
const { data } = await useAsyncData('articles', async () => {
  const response = await $fetch('/api/articles')

  // Трансформация выполняется один раз и кэшируется
  return response.data.map(article => ({
    ...article,
    formattedDate: formatDate(article.createdAt)
  }))
})
```

#### Сценарий E: Client-side event

```ts
async function submitForm() {
  // $fetch для mutations
  const result = await $fetch('/api/articles', {
    method: 'POST',
    body: { title, content }
  })

  // Инвалидация кэша
  await refreshNuxtData('articles')
}
```

### Шаг 3: Настроить ключ (key)

**Правила именования ключей:**

```ts
// Статический ключ — для неизменяемых данных
const { data } = await useFetch('/api/settings', {
  key: 'global-settings'
})

// Динамический ключ — для параметризованных запросов
const route = useRoute()
const { data } = await useFetch(`/api/articles/${route.params.id}`, {
  key: `article-${route.params.id}`
})

// Составной ключ — для фильтров и пагинации
const { data } = await useFetch('/api/articles', {
  key: `articles-page-${page.value}-cat-${category.value}`,
  query: { page, category }
})
```

**Важно:** Без уникального ключа при навигации данные могут не обновляться!

### Шаг 4: Настроить опции

#### Основные опции

```ts
const { data, pending, error, refresh, execute } = await useFetch('/api/data', {
  // Ключ для кэширования и дедупликации
  key: 'my-data',

  // HTTP метод
  method: 'GET',

  // Query параметры (реактивные)
  query: { page: 1, limit: 10 },

  // Тело запроса (для POST/PUT)
  body: { title: 'New Article' },

  // Заголовки
  headers: { 'Authorization': `Bearer ${token}` },

  // Выполнять на сервере
  server: true,

  // Lazy loading (не блокирует навигацию)
  lazy: false,

  // Немедленное выполнение
  immediate: true,

  // Глубокая реактивность данных
  deep: true,

  // Значение по умолчанию
  default: () => [],

  // Трансформация ответа (выполняется на клиенте!)
  transform: (response) => response.data,

  // Перезапрашивать при изменении (refs/computed)
  watch: [page, category],

  // Дедупликация одинаковых запросов
  dedupe: 'cancel' // или 'defer'
})
```

#### Опции кэширования

```ts
const { data } = await useFetch('/api/articles', {
  // Использовать кэшированные данные при навигации
  getCachedData: (key, nuxtApp) => {
    return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
  },

  // Или с проверкой свежести
  getCachedData: (key, nuxtApp) => {
    const cached = nuxtApp.payload.data[key]
    if (cached && Date.now() - cached.fetchedAt < 30000) {
      return cached
    }
    return null // Перезапросить
  }
})
```

### Шаг 5: Обработать состояния

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/articles')
</script>

<template>
  <!-- Состояние загрузки -->
  <div v-if="pending">
    <Skeleton />
  </div>

  <!-- Состояние ошибки -->
  <div v-else-if="error">
    <ErrorMessage :error="error" />
    <button @click="refresh()">Повторить</button>
  </div>

  <!-- Данные загружены -->
  <div v-else>
    <ArticleList :articles="data" />
  </div>
</template>
```

### Шаг 6: Настроить SSR-поведение

#### Только сервер (гидратация)

```ts
// Данные загружаются на сервере, передаются клиенту через payload
const { data } = await useFetch('/api/articles', {
  server: true,  // default
  lazy: false    // default — блокирует навигацию
})
```

#### Только клиент

```ts
// Данные загружаются на клиенте после гидратации
const { data, pending } = await useFetch('/api/user-activity', {
  server: false
})
// pending будет true во время загрузки на клиенте
```

#### Lazy loading (не блокирует навигацию)

```ts
// Навигация происходит сразу, данные загружаются параллельно
const { data, pending } = await useLazyFetch('/api/recommendations')
// или
const { data, pending } = await useFetch('/api/recommendations', {
  lazy: true
})
```

#### Lazy + client-only

```ts
// Идеально для некритичных данных
const { data } = await useLazyFetch('/api/analytics', {
  server: false
})
```

---

## Правила

### Выбор метода

- ЕСЛИ простой GET-запрос → `useFetch`
- ЕСЛИ нужна композиция запросов → `useAsyncData` + `$fetch`
- ЕСЛИ трансформация до кэширования → `useAsyncData`
- ЕСЛИ event handler (onClick, onSubmit) → `$fetch`
- ЕСЛИ нужен POST/PUT/DELETE → `$fetch` (мутации не кэшируются)

### Ключи

- ВСЕГДА указывать уникальный `key` для динамических данных
- ЕСЛИ параметры в URL → включать их в key: `article-${id}`
- ЕСЛИ фильтры/пагинация → включать в key: `articles-p${page}-c${category}`
- НИКОГДА не использовать случайные значения в key (сломает гидратацию)

### SSR

- ЕСЛИ данные критичны для SEO → `server: true` (default)
- ЕСЛИ данные персональные (user-specific) → `server: false`
- ЕСЛИ данные некритичны → `lazy: true`
- НИКОГДА не использовать `useFetch` внутри event handlers

### Кэширование

- ЕСЛИ данные редко меняются → использовать `getCachedData`
- ЕСЛИ нужна инвалидация → `refreshNuxtData('key')` или `refresh()`
- ЕСЛИ данные изменились на сервере → `clearNuxtData('key')` + `refresh()`

### Обработка ошибок

- ВСЕГДА обрабатывать `error` в шаблоне
- ЕСЛИ критичная ошибка → `throw createError({ statusCode: 404 })`
- ЕСЛИ recoverable → показать UI для retry

### Типизация

- ВСЕГДА типизировать ответ: `useFetch<Article[]>('/api/articles')`
- ЕСЛИ API возвращает wrapper → `transform` для извлечения data

---

## Формат выдачи

При реализации data fetching выдавать:

```markdown
## Data Fetching: [Название страницы/компонента]

### Запросы
| Ключ | Метод | Endpoint | SSR | Lazy |
|------|-------|----------|-----|------|
| articles | useFetch | /api/articles | Да | Нет |
| user-prefs | useFetch | /api/preferences | Нет | Да |

### Параметры
- articles: page (reactive), category (reactive)
- user-prefs: userId (from auth)

### Обработка ошибок
- 404 → createError
- 5xx → retry UI
```

---

## Примеры

### Пример 1: Страница списка с пагинацией

**Вход:** Нужна страница `/articles` с пагинацией и фильтром по категории.

**Выход:**

```vue
<!-- pages/articles.vue -->
<script setup lang="ts">
interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  category: { id: number; name: string }
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { page: number; pageCount: number; total: number }
}

const route = useRoute()
const router = useRouter()

// Реактивные параметры из query string
const page = computed(() => Number(route.query.page) || 1)
const category = computed(() => route.query.category as string | undefined)

// Основной запрос с SSR
const { data, pending, error, refresh } = await useFetch<PaginatedResponse<Article>>(
  '/api/articles',
  {
    key: computed(() => `articles-p${page.value}-c${category.value || 'all'}`),
    query: {
      page,
      category,
      limit: 12
    },
    watch: [page, category]
  }
)

// Категории для фильтра (кэшируются агрессивно)
const { data: categories } = await useFetch<{ id: number; name: string; slug: string }[]>(
  '/api/categories',
  {
    key: 'categories',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
  }
)

function changePage(newPage: number) {
  router.push({ query: { ...route.query, page: newPage } })
}
</script>

<template>
  <div>
    <!-- Фильтр категорий -->
    <nav class="flex gap-2 mb-6">
      <NuxtLink
        :to="{ query: { page: 1 } }"
        :class="{ 'font-bold': !category }"
      >
        Все
      </NuxtLink>
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="{ query: { category: cat.slug, page: 1 } }"
        :class="{ 'font-bold': category === cat.slug }"
      >
        {{ cat.name }}
      </NuxtLink>
    </nav>

    <!-- Состояния -->
    <div v-if="pending" class="grid gap-4">
      <ArticleSkeleton v-for="i in 12" :key="i" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 mb-4">Ошибка загрузки</p>
      <button @click="refresh()" class="btn">Повторить</button>
    </div>

    <template v-else>
      <div class="grid gap-4">
        <ArticleCard
          v-for="article in data?.data"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Пагинация -->
      <Pagination
        v-if="data?.meta"
        :current="data.meta.page"
        :total="data.meta.pageCount"
        @change="changePage"
      />
    </template>
  </div>
</template>
```

### Пример 2: Страница с композицией запросов

**Вход:** Dashboard с данными из нескольких endpoints.

**Выход:**

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
interface DashboardData {
  user: { name: string; avatar: string }
  stats: { views: number; articles: number; comments: number }
  recentActivity: Array<{ id: number; action: string; date: string }>
  notifications: Array<{ id: number; message: string; read: boolean }>
}

// Композиция нескольких запросов
const { data: dashboard, pending, error, refresh } = await useAsyncData<DashboardData>(
  'dashboard',
  async () => {
    const [user, stats, activity, notifications] = await Promise.all([
      $fetch('/api/me'),
      $fetch('/api/me/stats'),
      $fetch('/api/me/activity', { query: { limit: 10 } }),
      $fetch('/api/me/notifications', { query: { unread: true } })
    ])

    return {
      user,
      stats,
      recentActivity: activity,
      notifications
    }
  },
  {
    server: false // Персональные данные — только на клиенте
  }
)

// Некритичные данные — lazy loading
const { data: recommendations } = await useLazyFetch('/api/recommendations', {
  key: 'dashboard-recommendations',
  server: false
})

// Мутация: отметить уведомление как прочитанное
async function markAsRead(notificationId: number) {
  await $fetch(`/api/notifications/${notificationId}/read`, {
    method: 'POST'
  })
  await refresh() // Обновить данные
}
</script>
```

### Пример 3: Детальная страница с 404

**Вход:** Страница `/articles/[slug]` с обработкой 404.

**Выход:**

```vue
<!-- pages/articles/[slug].vue -->
<script setup lang="ts">
interface Article {
  id: number
  title: string
  slug: string
  content: string
  author: { name: string; avatar: string }
  publishedAt: string
  seo: { title: string; description: string }
}

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: article, error } = await useFetch<Article>(
  () => `/api/articles/${slug.value}`,
  {
    key: `article-${slug.value}`,
    // Трансформация на клиенте (для non-critical transforms)
    transform: (response) => ({
      ...response,
      publishedAtFormatted: new Date(response.publishedAt).toLocaleDateString('ru-RU')
    })
  }
)

// Обработка 404
if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Статья не найдена',
    fatal: true
  })
}

// SEO
useSeoMeta({
  title: () => article.value?.seo.title || article.value?.title,
  description: () => article.value?.seo.description
})

// Связанные статьи — lazy loading
const { data: relatedArticles } = await useLazyFetch<Article[]>(
  () => `/api/articles/${article.value?.id}/related`,
  {
    key: `article-${slug.value}-related`,
    server: false,
    immediate: !!article.value
  }
)
</script>
```

### Пример 4: Форма с отправкой данных

**Вход:** Форма создания статьи с валидацией и отправкой.

**Выход:**

```vue
<!-- pages/articles/create.vue -->
<script setup lang="ts">
interface ArticleForm {
  title: string
  content: string
  categoryId: number | null
}

interface ValidationError {
  field: string
  message: string
}

const form = reactive<ArticleForm>({
  title: '',
  content: '',
  categoryId: null
})

const isSubmitting = ref(false)
const errors = ref<ValidationError[]>([])

// Категории для select — кэшируются
const { data: categories } = await useFetch('/api/categories', {
  key: 'categories-for-form',
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
})

async function onSubmit() {
  isSubmitting.value = true
  errors.value = []

  try {
    // $fetch для POST-запросов
    const article = await $fetch('/api/articles', {
      method: 'POST',
      body: {
        title: form.title,
        content: form.content,
        category: form.categoryId
      }
    })

    // Инвалидация кэша списка статей
    await clearNuxtData('articles')

    // Редирект на созданную статью
    await navigateTo(`/articles/${article.slug}`)
  } catch (e: any) {
    if (e.statusCode === 422) {
      // Ошибки валидации
      errors.value = e.data?.errors || []
    } else {
      // Общая ошибка
      errors.value = [{ field: '_form', message: 'Ошибка сохранения' }]
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div v-if="errors.find(e => e.field === '_form')" class="alert alert-error">
      {{ errors.find(e => e.field === '_form')?.message }}
    </div>

    <FormField
      v-model="form.title"
      label="Заголовок"
      :error="errors.find(e => e.field === 'title')?.message"
    />

    <FormField
      v-model="form.content"
      label="Содержание"
      type="textarea"
      :error="errors.find(e => e.field === 'content')?.message"
    />

    <FormSelect
      v-model="form.categoryId"
      label="Категория"
      :options="categories || []"
      :error="errors.find(e => e.field === 'category')?.message"
    />

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Сохранение...' : 'Создать статью' }}
    </button>
  </form>
</template>
```

---

## Composable-паттерны

### Переиспользуемый fetch composable

```ts
// composables/useArticles.ts
export function useArticles() {
  const fetchArticles = (options?: {
    page?: number
    category?: string
    limit?: number
  }) => {
    const page = options?.page || 1
    const category = options?.category
    const limit = options?.limit || 12

    return useFetch('/api/articles', {
      key: `articles-p${page}-c${category || 'all'}`,
      query: { page, category, limit }
    })
  }

  const fetchArticle = (slug: string) => {
    return useFetch(`/api/articles/${slug}`, {
      key: `article-${slug}`
    })
  }

  const createArticle = async (data: ArticleCreateInput) => {
    const article = await $fetch('/api/articles', {
      method: 'POST',
      body: data
    })
    await clearNuxtData((key) => key?.startsWith('articles'))
    return article
  }

  return {
    fetchArticles,
    fetchArticle,
    createArticle
  }
}
```

### Использование в компоненте

```vue
<script setup lang="ts">
const { fetchArticles } = useArticles()

const route = useRoute()
const page = computed(() => Number(route.query.page) || 1)

const { data, pending, error } = await fetchArticles({
  page: page.value,
  category: route.query.category as string
})
</script>
```

---

## Чеклист

- [ ] Выбран правильный метод (useFetch / useAsyncData / $fetch)
- [ ] Указан уникальный key для динамических данных
- [ ] Настроено SSR-поведение (server, lazy)
- [ ] Обработаны состояния (pending, error)
- [ ] Типизирован ответ через generic
- [ ] Настроен watch для реактивных параметров
- [ ] Реализована инвалидация кэша при мутациях
- [ ] Обработан 404 для детальных страниц

---

## Что НЕ входит в scope

- Специфика конкретных API (Strapi, Supabase) — см. отдельные скиллы интеграции
- GraphQL-запросы — требует отдельного скилла
- State management (Pinia) — отдельная тема
- Оптимизация производительности (кэширование на уровне CDN) — инфраструктурная тема
- Аутентификация и авторизация — отдельный скилл
